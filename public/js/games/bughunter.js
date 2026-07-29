/* ---------- 🐞 BUG HUNTER ---------- */
import * as C from '../core.js';
import { S } from '../core.js';
import { Host, toast } from '../ui.js';
import { BUGS, byLang } from '../data/bank.js';

export function play(opts = {}){
  const rnd = opts.rnd || Math.random;
  const pool = C.shuffle(byLang(BUGS, S.lang), rnd);
  const total = opts.rounds || pool.length;
  let idx = 0, locked = false, hintUsed = false;

  if (!opts.embedded){
    Host.begin('bughunter', { onPower: power, again: () => play(opts) });
  } else {
    Host._onPower = power;
  }

  function power(kind){
    if (locked) return false;
    if (kind === 'freeze'){ Host.addTime(10000); toast('+10 seconds', '❄'); return true; }
    if (kind === 'hint'){
      if (hintUsed) return false;
      hintUsed = true;
      const q = pool[idx % pool.length];
      const safe = q.lines.map((_, i) => i).filter(i => i !== q.bug && q.lines[i].trim());
      C.shuffle(safe, rnd).slice(0, Math.max(1, Math.ceil(safe.length / 2))).forEach(i => {
        const el = Host.area.querySelector(`[data-line="${i}"]`);
        if (el) el.classList.add('dim');
      });
      return true;
    }
    if (kind === 'skip'){ next(); return true; }
    return false;
  }

  function next(){
    if (Host.round >= total || Host.lives <= 0){ done(); return; }
    render();
  }

  function done(){
    Host.stopTimer();
    if (opts.embedded) return opts.onDone && opts.onDone();
    Host.finish({ rows: [['Bugs squashed', Host.correct]] });
  }

  function render(){
    locked = false; hintUsed = false;
    Host.round++;
    const q = pool[idx++ % pool.length];
    const isBoss = Host.round % 10 === 0;
    if (isBoss) Host.bosses++;
    const secs = isBoss ? 16 : Math.max(12, 26 - q.diff * 3);

    Host.area.innerHTML = `
      <p class="q-title">FIND THE BUG
        <span class="q-badge">${q.lang.toUpperCase()}</span>
        <span class="q-badge">LVL ${q.diff}</span>
        ${isBoss ? '<span class="q-badge boss-tag">BOSS ×3</span>' : ''}
      </p>
      <div class="code-box">
        ${q.lines.map((l, i) => `
          <button class="code-line tappable" data-line="${i}">
            <span class="ln">${i + 1}</span><span>${C.hl(l) || ' '}</span>
          </button>`).join('')}
      </div>
      <div id="exp"></div>`;

    Host.sync();
    Host.timer(secs, () => answer(-1));

    Host.area.querySelectorAll('.code-line').forEach(el => {
      el.onclick = () => answer(+el.dataset.line, el);
    });
  }

  function answer(line, el){
    if (locked) return;
    locked = true;
    Host.stopTimer();
    const q = pool[(idx - 1) % pool.length];
    const isBoss = Host.round % 10 === 0;
    const bugEl = Host.area.querySelector(`[data-line="${q.bug}"]`);
    bugEl && bugEl.classList.add('right');

    let alive = true;
    if (line === q.bug){
      S.stats.bugs++;
      Host.hit(isBoss ? 300 : 120, bugEl);
    } else {
      if (el) el.classList.add('wrong');
      alive = Host.miss(true, Host.area);
    }

    const exp = Host.area.querySelector('#exp');
    exp.innerHTML = `<div class="explain">
      ${line === q.bug ? '<b>Correct!</b> ' : `<b>Line ${q.bug + 1}.</b> `}${q.why}</div>
      <button class="big-btn" style="margin-top:12px" id="nx">
        ${alive && Host.round < total ? 'Next →' : 'See results'}</button>`;
    exp.querySelector('#nx').onclick = () => {
      C.sfx('tap');
      if (!alive || Host.round >= total) done(); else next();
    };
    exp.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }

  next();
}
