/* ---------- 🔢 BINARY BLASTER ---------- */
import * as C from '../core.js';
import { S } from '../core.js';
import { Host, toast } from '../ui.js';

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

export function play(opts = {}){
  const rnd = opts.rnd || Math.random;
  const total = opts.rounds || 999;   // endless until lives run out
  let bits = [0,0,0,0,0,0,0,0];
  let target = 0, mode = 'dec2bin', locked = false, streak = 0, prompt = '';

  if (!opts.embedded){
    Host.begin('binary', { onPower: power, again: () => play(opts) });
  } else {
    Host._onPower = power;
  }

  function power(kind){
    if (locked) return false;
    if (kind === 'freeze'){ Host.addTime(8000); toast('+8 seconds', '❄'); return true; }
    if (kind === 'hint'){
      // Fix one wrong bit.
      const want = target.toString(2).padStart(8, '0').split('').map(Number);
      for (let i = 0; i < 8; i++){
        if (bits[i] !== want[i]){ bits[i] = want[i]; C.sfx('bit'); drawBits(); return true; }
      }
      return false;
    }
    if (kind === 'skip'){ nextTarget(); return true; }
    return false;
  }

  function nextTarget(){
    // Solo play is endless (ends on lives); daily stages pass a round limit.
    if (Host.lives <= 0 || Host.round >= total){ done(); return; }
    locked = false;
    Host.round++;
    bits = [0,0,0,0,0,0,0,0];

    const modes = Host.round < 4 ? ['dec2bin']
      : Host.round < 8 ? ['dec2bin','bin2dec']
      : ['dec2bin','bin2dec','hex2bin','logic'];
    mode = C.pick(modes, rnd);
    const cap = Math.min(255, 15 + Host.round * 12);
    target = 1 + Math.floor(rnd() * cap);

    if (mode === 'dec2bin'){
      prompt = `<div class="lbl">BUILD THIS DECIMAL</div><div class="val">${target}</div>`;
    } else if (mode === 'bin2dec'){
      prompt = `<div class="lbl">MATCH THIS BINARY</div>
        <div class="val" style="font-size:26px;letter-spacing:3px">${target.toString(2).padStart(8,'0')}</div>`;
    } else if (mode === 'hex2bin'){
      prompt = `<div class="lbl">BUILD THIS HEX</div>
        <div class="val">0x${target.toString(16).toUpperCase().padStart(2,'0')}</div>`;
    } else {
      const a = 1 + Math.floor(rnd() * 200), b = 1 + Math.floor(rnd() * 200);
      const op = C.pick(['&','|','^'], rnd);
      target = op === '&' ? (a & b) : op === '|' ? (a | b) : (a ^ b);
      prompt = `<div class="lbl">COMPUTE THE RESULT</div>
        <div class="val" style="font-size:31px">${a} ${op} ${b}</div>
        <div style="font-size:9.5px;color:var(--dim);margin-top:6px;letter-spacing:1px">
          ${a.toString(2).padStart(8,'0')} ${op} ${b.toString(2).padStart(8,'0')}</div>`;
    }

    const secs = Math.max(6, 18 - Math.floor(Host.round / 3));
    Host.timer(secs, () => {
      if (locked) return;
      locked = true;
      Host.miss(true, Host.area);
      toast(`Time! It was ${target}`, '💥');
      setTimeout(() => Host.lives > 0 ? nextTarget() : done(), 620);
    });

    draw();
  }

  function draw(){
    Host.area.innerHTML = `
      <div class="bin-target">${prompt}</div>
      <div class="bits" id="bits"></div>
      <div class="bit-weights">${WEIGHTS.map(w => `<span>${w}</span>`).join('')}</div>
      <div class="bin-live">= <b id="live">0</b><span style="font-size:12px;color:var(--dim)">
        &nbsp;(0x<span id="liveHex">00</span>)</span></div>
      <button class="big-btn" id="fireBtn">⚡ FIRE</button>`;
    drawBits();
    Host.area.querySelector('#bits').onclick = e => {
      const b = e.target.closest('[data-b]'); if (!b || locked) return;
      const i = +b.dataset.b;
      bits[i] ^= 1;
      C.sfx('bit'); C.buzz(9);
      drawBits();
    };
    Host.area.querySelector('#fireBtn').onclick = fire;
    Host.sync();
  }

  function value(){ return bits.reduce((a, b, i) => a + b * WEIGHTS[i], 0); }

  function drawBits(){
    const box = Host.area.querySelector('#bits');
    if (!box) return;
    // Build once, then update in place so taps keep their :active feedback
    // and the buttons the user is touching are never replaced mid-gesture.
    if (box.children.length !== 8){
      box.innerHTML = bits.map((b, i) =>
        `<button class="bit" data-b="${i}">${b}</button>`).join('');
    }
    for (let i = 0; i < 8; i++){
      const el = box.children[i];
      el.textContent = bits[i];
      el.classList.toggle('on', !!bits[i]);
    }
    const v = value();
    const live = Host.area.querySelector('#live');
    if (live){
      live.textContent = v;
      live.style.color = v === target ? 'var(--ok)' : 'var(--warn)';
      Host.area.querySelector('#liveHex').textContent =
        v.toString(16).toUpperCase().padStart(2, '0');
    }
  }

  function fire(){
    if (locked) return;
    locked = true;
    Host.stopTimer();
    const v = value();
    if (v === target){
      streak++;
      S.stats.bits++;
      const bonus = Math.round((Host._tEnd - Date.now()) / 120);
      Host.hit(90 + Math.max(0, bonus), Host.area.querySelector('#fireBtn'));
      C.burst(innerWidth / 2, innerHeight / 2, 34, null);
      if (streak % 5 === 0) toast(`${streak} in a row!`, '🔥', true);
      setTimeout(nextTarget, 430);
    } else {
      streak = 0;
      const alive = Host.miss(true, Host.area);
      const want = target.toString(2).padStart(8, '0');
      toast(`Off by ${Math.abs(v - target)} — needed ${want}`, '💥');
      setTimeout(() => alive ? nextTarget() : done(), 900);
    }
  }

  function done(){
    Host.stopTimer();
    if (opts.embedded) return opts.onDone && opts.onDone();
    Host.finish({ rows: [['Targets hit', Host.correct]] });
  }

  nextTarget();
}
