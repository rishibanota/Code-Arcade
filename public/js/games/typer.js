/* ---------- ⌨️ TERMINAL TYPER ---------- */
import * as C from '../core.js';
import { S } from '../core.js';
import { Host, toast } from '../ui.js';
import { TYPE_LINES, byLang } from '../data/bank.js';

export function play(opts = {}){
  const rnd = opts.rnd || Math.random;
  const pool = C.shuffle(byLang(TYPE_LINES, S.lang), rnd);
  const total = opts.rounds || 6;
  let idx = 0, cur = '', started = 0, typedChars = 0, errors = 0, wpmBest = 0, locked = false;

  if (!opts.embedded){
    Host.begin('typer', { lives: 99, onPower: power, again: () => play(opts) });
  } else {
    Host._onPower = power;
  }

  function power(kind){
    if (locked) return false;
    if (kind === 'freeze'){ Host.addTime(12000); toast('+12 seconds', '❄'); return true; }
    if (kind === 'skip'){ nextLine(); return true; }
    if (kind === 'hint'){ toast('Symbols count — accuracy beats speed', '💡'); return true; }
    return false;
  }

  function nextLine(){
    if (Host.round >= total){ done(); return; }
    locked = false;
    Host.round++;
    cur = pool[idx++ % pool.length].t;
    started = 0;
    Host.timer(Math.max(18, Math.round(cur.length / 1.6)), () => {
      if (locked) return;
      locked = true;
      Host.miss(false, Host.area);
      toast('Too slow!', '⏱');
      setTimeout(nextLine, 520);
    });
    render('');
    setTimeout(() => {
      const inp = Host.area.querySelector('#tin');
      inp && inp.focus();
    }, 60);
  }

  function done(){
    Host.stopTimer();
    if (opts.embedded) return opts.onDone && opts.onDone();
    const acc = typedChars ? Math.round(((typedChars - errors) / typedChars) * 100) : 0;
    if (wpmBest > S.stats.bestWpm){ S.stats.bestWpm = wpmBest; C.checkAchievements(); }
    Host.finish({ title:'TERMINAL TYPER',
      rows: [['Best WPM', wpmBest], ['Typing accuracy', acc + '%']] });
  }

  function render(typed){
    const wpm = liveWpm(typed);
    Host.area.innerHTML = `
      <div class="wpm-row">
        <div><small>WPM</small><b id="wpm">${wpm}</b></div>
        <div><small>LINE</small><b>${Host.round}/${total}</b></div>
        <div><small>BEST</small><b>${Math.max(wpmBest, S.stats.bestWpm)}</b></div>
      </div>
      <div class="typer-target" id="tt">${paint(typed)}</div>
      <textarea class="typer-input" id="tin" rows="2" placeholder="start typing…"
        autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false"></textarea>
      <p class="q-title" style="font-size:10px;margin-top:9px;opacity:.7">
        Tip: turn off autocorrect for symbols. Enter is not needed.</p>`;

    const inp = Host.area.querySelector('#tin');
    inp.value = typed;
    inp.oninput = () => {
      if (!started) started = Date.now();
      const v = inp.value;
      Host.area.querySelector('#tt').innerHTML = paint(v);
      Host.area.querySelector('#wpm').textContent = liveWpm(v);
      if (v.length >= cur.length) check(v);
    };
    // Keep caret at end so painting stays in sync
    inp.setSelectionRange(typed.length, typed.length);
    Host.sync();
  }

  function paint(typed){
    let out = '';
    for (let i = 0; i < cur.length; i++){
      const ch = C.esc(cur[i]) === ' ' ? ' ' : C.esc(cur[i]);
      if (i < typed.length){
        out += `<span class="${typed[i] === cur[i] ? 'done' : 'bad'}">${ch}</span>`;
      } else if (i === typed.length){
        out += `<span class="cur">${ch}</span>`;
      } else out += ch;
    }
    return out;
  }

  const MAX_WPM = 220;   // world record territory; anything above means paste/instant input
  function wpmOf(chars, ms){
    // Clamp elapsed time so a paste or an instant fill can't fake a huge WPM.
    const minMs = (chars / 5) / MAX_WPM * 60000;
    const mins = Math.max(ms, minMs) / 60000;
    return mins > 0 ? Math.min(MAX_WPM, Math.round((chars / 5) / mins)) : 0;
  }

  function liveWpm(typed){
    if (!started || !typed.length) return 0;
    return wpmOf(typed.length, Date.now() - started);
  }

  function check(v){
    if (locked) return;
    locked = true;
    Host.stopTimer();
    const wpm = wpmOf(cur.length, Date.now() - started);
    let wrongChars = 0;
    for (let i = 0; i < cur.length; i++) if (v[i] !== cur[i]) wrongChars++;
    typedChars += cur.length; errors += wrongChars;
    const acc = Math.round(((cur.length - wrongChars) / cur.length) * 100);

    if (wrongChars === 0){
      wpmBest = Math.max(wpmBest, wpm);
      if (wpmBest > S.stats.bestWpm){ S.stats.bestWpm = wpmBest; C.checkAchievements(); C.save(); }
      Host.hit(Math.round(60 + wpm * 3), Host.area.querySelector('#tt'));
      toast(`${wpm} WPM · perfect line`, '⚡');
    } else {
      Host.miss(false, Host.area);
      toast(`${wrongChars} wrong character${wrongChars > 1 ? 's' : ''} (${acc}%)`, '⚠');
    }
    setTimeout(nextLine, 700);
  }

  nextLine();
}
