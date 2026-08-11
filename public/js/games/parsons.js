/* ---------- 🧩 STACK REBUILD (Parsons puzzle) ----------
   Tap one line, tap another → they swap. Fully touch friendly.
   Python levels also need correct indentation (arrow buttons).      */
import * as C from '../core.js';
import { S } from '../core.js';
import { Host, toast } from '../ui.js';
import { PARSONS, byLang } from '../data/bank.js';

export function play(opts = {}){
  const rnd = opts.rnd || Math.random;
  const pool = C.shuffle(byLang(PARSONS, S.lang), rnd);
  const total = opts.rounds || Math.min(5, pool.length);
  let idx = 0, cur = null, order = [], indents = [], sel = null, moves = 0, locked = false;

  if (!opts.embedded){
    Host.begin('parsons', { lives: 99, hideTimer: false, onPower: power, again: (extra) => play({ ...opts, ...extra }) });
  } else {
    Host._onPower = power;
  }

  function power(kind){
    if (locked) return false;
    if (kind === 'freeze'){ Host.addTime(15000); toast('+15 seconds', '❄'); return true; }
    if (kind === 'hint'){
      // Put one wrong line into its correct slot, or fix one wrong indent.
      for (let i = 0; i < order.length; i++){
        if (order[i] !== i){
          const j = order.indexOf(i);
          [order[i], order[j]] = [order[j], order[i]];
          [indents[i], indents[j]] = [indents[j], indents[i]];
          indents[i] = cur.lines[i].i;
          C.sfx('correct'); draw(); return true;
        }
      }
      // All lines are in order — fix one wrong indent instead.
      if (cur.indentMatters){
        for (let i = 0; i < order.length; i++){
          if (indents[i] !== cur.lines[i].i){
            indents[i] = cur.lines[i].i;
            C.sfx('correct'); draw(); return true;
          }
        }
      }
      return false;
    }
    if (kind === 'skip'){ finishPuzzle(false); return true; }
    return false;
  }

  function next(){
    if (Host.round >= total){ done(); return; }
    setup();
  }
  function done(){
    Host.stopTimer();
    if (opts.embedded) return opts.onDone && opts.onDone();
    Host.finish({ title:'STACK REBUILD', rows: [['Puzzles solved', Host.correct]] });
  }

  function setup(){
    locked = false; sel = null; moves = 0;
    Host.round++;
    cur = pool[idx++ % pool.length];
    const n = cur.lines.length;
    // Scramble: order[slot] = original line index
    do { order = C.shuffle([...Array(n).keys()], rnd); }
    while (order.every((v, i) => v === i) && n > 1);
    indents = cur.indentMatters ? order.map(() => 0) : cur.lines.map(l => l.i);
    Host.timer(Math.max(45, n * 12), () => finishPuzzle(false));
    draw();
  }

  function draw(){
    const par = cur.lines.length + 2;
    Host.area.innerHTML = `
      <p class="q-title">${cur.name}
        <span class="q-badge">${cur.lang.toUpperCase()}</span>
        <span class="q-badge">MOVES ${moves} / par ${par}</span>
      </p>
      <p class="q-title" style="font-size:10.5px;opacity:.75">
        Tap two lines to swap them${cur.indentMatters ? ' · use ⇥ ⇤ to set indentation' : ''}</p>
      <div class="parsons-list" id="plist">
        ${order.map((lineIdx, slot) => {
          const l = cur.lines[lineIdx];
          const pad = '    '.repeat(indents[slot]);
          return `<button class="pline ${sel === slot ? 'sel' : ''}" data-slot="${slot}">
            <span class="grip">⋮⋮</span>
            <span>${C.hl(pad + l.t)}</span>
            ${cur.indentMatters ? `<span class="indent-btns">
              <span class="ibtn" data-ind="-1" data-slot="${slot}">⇤</span>
              <span class="ibtn" data-ind="1" data-slot="${slot}">⇥</span></span>` : ''}
          </button>`;
        }).join('')}
      </div>
      <button class="big-btn" id="checkBtn">✓ Check answer</button>
      <div id="exp"></div>`;

    Host.area.querySelector('#plist').onclick = e => {
      if (locked) return;
      const ind = e.target.closest('[data-ind]');
      if (ind){
        const s = +ind.dataset.slot;
        indents[s] = Math.max(0, Math.min(5, indents[s] + (+ind.dataset.ind)));
        moves++; C.sfx('tap'); C.buzz(8); draw();
        return;
      }
      const row = e.target.closest('[data-slot]');
      if (!row) return;
      const s = +row.dataset.slot;
      if (sel === null){ sel = s; C.sfx('tap'); C.buzz(8); }
      else if (sel === s){ sel = null; }
      else {
        [order[sel], order[s]] = [order[s], order[sel]];
        [indents[sel], indents[s]] = [indents[s], indents[sel]];
        moves++; sel = null; C.sfx('bit'); C.buzz(12);
      }
      draw();
    };
    Host.area.querySelector('#checkBtn').onclick = () => check();
    Host.sync();
  }

  function check(){
    if (locked) return;
    const orderOk = order.every((v, i) => v === i);
    const indentOk = !cur.indentMatters || order.every((v, i) => indents[i] === cur.lines[v].i);
    if (orderOk && indentOk){ finishPuzzle(true); return; }

    C.sfx('wrong'); C.buzz(45); C.shake(Host.area);
    Host.combo = 0; Host.sync();
    const wrongOrder = order.filter((v, i) => v !== i).length;
    toast(orderOk ? 'Order is right — check the indentation' :
      `${wrongOrder} line${wrongOrder > 1 ? 's are' : ' is'} out of place`, '⚠');
  }

  function finishPuzzle(won){
    locked = true;
    Host.stopTimer();
    const par = cur.lines.length + 2;
    let stars = 0;
    if (won){
      stars = moves <= par ? 3 : moves <= par * 1.8 ? 2 : 1;
      const pts = [0, 120, 220, 380][stars];
      Host.hit(pts, Host.area.querySelector('#checkBtn'));
      if (stars === 3) C.grant('parsons3');
      C.burst(innerWidth / 2, innerHeight / 2, 40);
    } else {
      Host.miss(false, Host.area);
    }

    const correct = cur.lines.map(l => '    '.repeat(l.i) + l.t);
    Host.area.innerHTML = `
      <p class="q-title">${won ? 'SOLVED' : 'SOLUTION'} — ${cur.name}</p>
      <div style="text-align:center;font-size:31px;margin:10px 0">
        ${won ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '💀'}
      </div>
      <div class="code-box">${correct.map((l, i) =>
        `<div class="code-line"><span class="ln">${i + 1}</span><span>${C.hl(l)}</span></div>`).join('')}</div>
      <div class="explain">${won
        ? `Solved in <b>${moves}</b> moves (par ${par}).`
        : 'Study the order — the same puzzle can come back.'}</div>
      <button class="big-btn" style="margin-top:12px" id="nx">
        ${Host.round < total ? 'Next puzzle →' : 'See results'}</button>`;
    Host.area.querySelector('#nx').onclick = () => {
      C.sfx('tap');
      if (Host.round >= total) done(); else next();
    };
  }

  next();
}
