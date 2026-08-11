/* ---------- 🎯 REGEX RANGER ---------- */
import * as C from '../core.js';
import { Host, toast } from '../ui.js';
import { REGEX_LEVELS } from '../data/bank.js';

const PAD = ['\\d','\\w','\\s','.','+','*','?','^','$','[]','()','|','{}','-','a-z','0-9'];

export function play(opts = {}){
  const rnd = opts.rnd || Math.random;
  const pool = C.shuffle(REGEX_LEVELS, rnd);
  const total = opts.rounds || Math.min(5, pool.length);
  let idx = 0, cur = null, locked = false, solved = false;

  if (!opts.embedded){
    Host.begin('regex', { lives: 99, onPower: power, again: (extra) => play({ ...opts, ...extra }) });
  } else {
    Host._onPower = power;
  }

  function power(kind){
    if (locked) return false;
    if (kind === 'freeze'){ Host.addTime(20000); toast('+20 seconds', '❄'); return true; }
    if (kind === 'hint'){ toast(cur.hint, '💡'); return true; }
    if (kind === 'skip'){ endLevel(false); return true; }
    return false;
  }

  function next(){
    if (Host.round >= total){ done(); return; }
    setup();
  }
  function done(){
    Host.stopTimer();
    if (opts.embedded) return opts.onDone && opts.onDone();
    Host.finish({ title:'REGEX RANGER', rows: [['Patterns solved', Host.correct]] });
  }

  function setup(){
    locked = false; solved = false;
    Host.round++;
    cur = pool[idx++ % pool.length];
    Host.timer(75, () => endLevel(false));

    Host.area.innerHTML = `
      <p class="q-title">${cur.name}
        <span class="q-badge">PAR ${cur.par} CHARS</span></p>
      <p class="q-title" style="font-size:10.5px;opacity:.75">
        Match every <b style="color:var(--ok)">green</b>, avoid every
        <b style="color:var(--bad)">red</b>. Shorter = more points.</p>
      <input class="rx-input" id="rx" placeholder="/ your pattern /"
        autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false">
      <div class="rx-pad" id="pad">
        ${PAD.map(k => `<button class="rx-key" data-k="${C.esc(k)}">${C.esc(k)}</button>`).join('')}
        <button class="rx-key" data-k="__del" style="grid-column:span 2">⌫ del</button>
        <button class="rx-key" data-k="__clr" style="grid-column:span 2">clear</button>
      </div>
      <div class="rx-list" id="list"></div>
      <button class="big-btn" id="go">✓ Submit pattern</button>
      <div id="exp"></div>`;

    const input = Host.area.querySelector('#rx');
    input.addEventListener('input', update);
    Host.area.querySelector('#pad').onclick = e => {
      if (locked) return;
      const b = e.target.closest('[data-k]'); if (!b) return;
      const k = b.dataset.k;
      C.sfx('tap'); C.buzz(8);
      if (k === '__del') input.value = input.value.slice(0, -1);
      else if (k === '__clr') input.value = '';
      else if (k === '[]' ){ input.value += '[]'; }
      else if (k === '()' ){ input.value += '()'; }
      else if (k === '{}' ){ input.value += '{}'; }
      else input.value += k;
      input.focus();
      update();
    };
    Host.area.querySelector('#go').onclick = submit;
    update();
    Host.sync();
  }

  function compile(){
    const src = Host.area.querySelector('#rx').value;
    if (!src || src.length > 60) return null;
    // Reject patterns prone to catastrophic backtracking.
    if (/(\(\?R|\\\d{2,})/.test(src)) return null;
    try { return new RegExp(src); } catch { return null; }
  }

  function update(){
    const re = compile();
    const rows = [
      ...cur.match.map(s => ({ s, want:true })),
      ...cur.avoid.map(s => ({ s, want:false })),
    ];
    Host.area.querySelector('#list').innerHTML = rows.map(r => {
      let hit = false;
      try { hit = re ? re.test(r.s) : false; } catch {}
      const ok = hit === r.want;
      return `<div class="rx-item ${r.want ? 'want' : 'avoid'} ${hit ? 'hit' : ''}">
        <span class="tag">${r.want ? 'MATCH' : 'AVOID'}</span>
        <span style="flex:1;overflow:hidden;text-overflow:ellipsis">${C.esc(r.s || '(empty)')}</span>
        <span class="mark">${re ? (ok ? '✅' : '❌') : '·'}</span></div>`;
    }).join('');
  }

  function allGood(){
    const re = compile();
    if (!re) return false;
    try {
      return cur.match.every(s => re.test(s)) && cur.avoid.every(s => !re.test(s));
    } catch { return false; }
  }

  function submit(){
    if (locked) return;
    const src = Host.area.querySelector('#rx').value;
    if (!compile()){ toast('That pattern is not valid', '⚠'); C.sfx('wrong'); return; }
    if (!allGood()){
      C.sfx('wrong'); C.buzz(45); C.shake(Host.area);
      Host.combo = 0; Host.sync();
      toast('Not all cases pass yet', '❌');
      return;
    }
    solved = true;
    endLevel(true, src);
  }

  function endLevel(won, src = ''){
    locked = true;
    Host.stopTimer();
    let golf = 0;
    if (won){
      golf = Math.max(0, (cur.par - src.length) * 25);
      if (src.length < 10) C.grant('golf');
      Host.hit(200 + golf, Host.area.querySelector('#go'));
      C.burst(innerWidth / 2, innerHeight / 2, 36);
    } else {
      Host.miss(false, Host.area);
    }

    Host.area.querySelector('#exp').innerHTML = `
      <div class="explain">
        ${won
          ? `<b>Solved with <code>${C.esc(src)}</code></b> (${src.length} chars, par ${cur.par}).
             ${golf ? `Golf bonus <b>+${golf}</b>!` : 'Try shorter next time for a golf bonus.'}`
          : `<b>Out of time.</b> ${cur.hint}`}
      </div>
      <button class="big-btn" style="margin-top:12px" id="nx">
        ${Host.round < total ? 'Next level →' : 'See results'}</button>`;
    Host.area.querySelector('#nx').onclick = () => {
      C.sfx('tap');
      if (Host.round >= total) done(); else next();
    };
  }

  next();
}
