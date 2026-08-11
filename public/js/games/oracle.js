/* ---------- 🔮 OUTPUT ORACLE ---------- */
import * as C from '../core.js';
import { S } from '../core.js';
import { Host, toast } from '../ui.js';
import { ORACLE, byLang } from '../data/bank.js';

export function play(opts = {}){
  const rnd = opts.rnd || Math.random;
  const pool = C.shuffle(byLang(ORACLE, S.lang), rnd);
  const total = opts.rounds || Math.min(15, pool.length);
  let idx = 0, locked = false, cur = null, curOpts = [];

  if (!opts.embedded){
    Host.begin('oracle', { onPower: power, again: (extra) => play({ ...opts, ...extra }) });
  } else {
    Host._onPower = power;
  }

  function power(kind){
    if (locked) return false;
    if (kind === 'freeze'){ Host.addTime(10000); toast('+10 seconds', '❄'); return true; }
    if (kind === 'fifty'){
      const wrongEls = [...Host.area.querySelectorAll('.opt')]
        .filter(e => e.dataset.val !== cur.a && e.dataset.val !== C.esc(cur.a) && !e.classList.contains('gone'));
      if (wrongEls.length < 2) return false;
      C.shuffle(wrongEls, rnd).slice(0, 2).forEach(e => e.classList.add('gone'));
      return true;
    }
    if (kind === 'hint'){
      toast(cur.why.replace(/<[^>]+>/g, '').slice(0, 70) + '…', '💡');
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
    Host.finish({ rows: [['Outputs read', Host.correct]] });
  }

  function render(){
    locked = false;
    Host.round++;
    cur = pool[idx++ % pool.length];
    const isBoss = Host.round % 10 === 0;
    if (isBoss) Host.bosses++;
    curOpts = C.shuffle(cur.opts, rnd);
    const secs = isBoss ? 12 : 20;

    Host.area.innerHTML = `
      <p class="q-title">WHAT DOES IT PRINT?
        <span class="q-badge">${cur.lang.toUpperCase()}</span>
        ${isBoss ? '<span class="q-badge boss-tag">BOSS ×3</span>' : ''}
      </p>
      <div class="code-box">
        ${cur.code.map((l, i) => `<div class="code-line">
          <span class="ln">${i + 1}</span><span>${C.hl(l)}</span></div>`).join('')}
      </div>
      <div class="opts">
        ${curOpts.map(o => `<button class="opt" data-val="${C.esc(o)}">${C.esc(o)}</button>`).join('')}
      </div>
      <div id="exp"></div>`;

    Host.sync();
    Host.timer(secs, () => answer(null));
    Host.area.querySelectorAll('.opt').forEach(el => {
      el.onclick = () => answer(el.dataset.val, el);
    });
  }

  function answer(val, el){
    if (locked) return;
    locked = true;
    const left = Host._tEnd - Date.now();
    Host.stopTimer();
    const isBoss = Host.round % 10 === 0;
    const maxTime = (isBoss ? 12 : 20) * 1000;

    Host.area.querySelectorAll('.opt').forEach(o => {
      if (o.dataset.val === C.esc(cur.a) || o.dataset.val === cur.a) o.classList.add('right');
      o.style.pointerEvents = 'none';
    });

    let alive = true;
    const ok = val !== null && (val === cur.a || val === C.esc(cur.a));
    if (ok){
      S.stats.oracles++;
      const speedBonus = Math.max(0, Math.round(Math.min(left, maxTime) / 200));
      Host.hit((isBoss ? 300 : 130) + speedBonus, el);
    } else {
      if (el) el.classList.add('wrong');
      alive = Host.miss(true, Host.area);
    }

    const exp = Host.area.querySelector('#exp');
    exp.innerHTML = `<div class="explain"><b>${ok ? 'Nailed it.' : 'Answer: ' + C.esc(cur.a)}</b> — ${cur.why}</div>
      <button class="big-btn" style="margin-top:12px" id="nx">
        ${alive && Host.round < total ? 'Next →' : 'See results'}</button>`;
    exp.querySelector('#nx').onclick = () => {
      C.sfx('tap');
      if (!alive || Host.round >= total) done(); else next();
    };
  }

  next();
}
