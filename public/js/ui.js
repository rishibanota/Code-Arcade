/* ============ CODE ARCADE — UI layer ============
   Router, HUD, toasts, modals, shop, profile, badges, settings,
   plus the Host object every game plugs into.
=================================================== */

import * as C from './core.js';
import { GAMES, THEMES, ACHIEVEMENTS, S } from './core.js';
import { LANGS } from './data/bank.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

/* ---------- Router ---------- */
let current = 'home';
const stack = [];

export function go(screen, push = true){
  const el = $('#scr-' + screen);
  if (!el) return;
  if (push && current !== screen) stack.push(current);
  $$('.screen').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  current = screen;
  $('#backBtn').classList.toggle('show', screen !== 'home');
  window.scrollTo(0, 0);
  if (screen === 'shop') renderShop();
  if (screen === 'achv') renderAchv();
  if (screen === 'profile') renderProfile();
  if (screen === 'settings') renderSettings();
  if (screen === 'home') renderHome();
}
export function back(){
  if (Host.active) { Host.quit(); return; }
  const prev = stack.pop() || 'home';
  go(prev, false);
}
export const currentScreen = () => current;

/* ---------- Toast ---------- */
export function toast(msg, ico = '✔', gold = false){
  const t = document.createElement('div');
  t.className = 'toast' + (gold ? ' gold' : '');
  t.innerHTML = `<span style="font-size:19px">${ico}</span><span>${msg}</span>`;
  $('#toastWrap').appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity .3s, transform .3s';
    t.style.opacity = '0'; t.style.transform = 'translateY(14px)';
    setTimeout(() => t.remove(), 320);
  }, 2300);
}

/* ---------- Modal ---------- */
export function modal(html, onOpen){
  $('#modalCard').innerHTML = html;
  $('#modalWrap').classList.remove('hidden');
  if (onOpen) onOpen($('#modalCard'));
}
export function closeModal(){ $('#modalWrap').classList.add('hidden'); }
$('#modalWrap').addEventListener('click', e => {
  if (e.target.id === 'modalWrap') closeModal();
});

/* ---------- HUD ---------- */
export function renderHud(){
  const need = C.xpForLevel(S.level);
  $('#lvlBadge').textContent = S.level;
  $('#xpFill').style.width = Math.min(100, (S.xp / need) * 100) + '%';
  $('#xpText').textContent = `${S.xp} / ${need} XP`;
  $('#coinCount').textContent = S.coins;
  ['fifty','freeze','hint','skip'].forEach(k => {
    const el = $('#pw' + k[0].toUpperCase() + k.slice(1));
    if (el) el.textContent = S.powerups[k];
  });
}
C.on('hud', renderHud);
C.on('levelup', lvl => toast(`LEVEL ${lvl}! +${50 * lvl} coins`, '🎉', true));
C.on('achievement', a => toast(`${a.name} unlocked · +75`, a.ico, true));

/* ---------- Theme ---------- */
export function applyTheme(id){
  document.body.dataset.theme = id;
  S.theme = id; C.save();
}

/* ---------- HOME ---------- */
export function renderHome(){
  const grid = $('#gameGrid');
  grid.innerHTML = GAMES.map(g => `
    <button class="game-card" data-game="${g.id}">
      <span class="gc-glow" style="background:${g.color}"></span>
      <span class="gc-ico">${g.ico}</span>
      <h3>${g.name}</h3>
      <p>${g.desc}</p>
      <div class="gc-best">BEST ${S.bestScores[g.id] || 0}</div>
    </button>`).join('');

  $('#langChips').innerHTML = LANGS.map(l =>
    `<button class="chip ${S.lang === l.id ? 'on' : ''}" data-lang="${l.id}">${l.name}</button>`).join('');

  const done = S.dailyDate === C.todayKey();
  $('#dailyBtn').classList.toggle('done', done);
  $('#dailyStatus').textContent = done
    ? 'Done today — come back tomorrow'
    : 'All 6 games · 1 run · big XP';
  $('#streakNum').textContent = S.dailyStreak;

  const tips = [
    '6 games · learn by playing · zero internet',
    'Tip: combos multiply your score. Chain them.',
    'Every 10th question is a BOSS worth 3×.',
    'Coins buy themes. Themes are forever.',
    'Daily Gauntlet keeps your streak alive.',
    'Add to Home Screen to play like an app.',
  ];
  $('#tagline').textContent = tips[Math.floor(Math.random() * tips.length)];
  renderHud();
}

/* ---------- SHOP ---------- */
const POWER_ITEMS = [
  { k:'fifty',  ico:'½', name:'50/50',  cost:60,  desc:'Removes two wrong options' },
  { k:'freeze', ico:'❄', name:'Freeze', cost:80,  desc:'Adds 10 seconds' },
  { k:'hint',   ico:'💡', name:'Hint',   cost:100, desc:'Narrows the answer down' },
  { k:'skip',   ico:'⏭', name:'Skip',   cost:120, desc:'Next question, no penalty' },
];

function renderShop(){
  $('#shopPowers').innerHTML = POWER_ITEMS.map(p => `
    <div class="shop-item">
      <span class="si-ico">${p.ico}</span>
      <b>${p.name} <span style="color:var(--dim);font-weight:400">×${S.powerups[p.k]}</span></b>
      <small>${p.desc}</small>
      <button class="buy ${S.coins >= p.cost ? 'afford' : ''}" data-buy-pw="${p.k}"
        ${S.coins < p.cost ? 'disabled' : ''}>${p.cost} 🪙</button>
    </div>`).join('');

  $('#shopThemes').innerHTML = THEMES.map(t => {
    const owned = S.themesOwned.includes(t.id);
    const on = S.theme === t.id;
    return `<div class="shop-item">
      <div class="swatches">${t.cols.map(c => `<span class="sw" style="background:${c}"></span>`).join('')}</div>
      <b>${t.name}</b>
      <small>${owned ? 'Owned' : t.cost + ' coins'}</small>
      <button class="buy ${owned ? (on ? 'owned' : 'afford') : (S.coins >= t.cost ? 'afford' : '')}"
        data-buy-theme="${t.id}" ${(!owned && S.coins < t.cost) || on ? 'disabled' : ''}>
        ${on ? '✓ Active' : owned ? 'Use' : t.cost + ' 🪙'}</button>
    </div>`;
  }).join('');
}

/* ---------- PROFILE ---------- */
function renderProfile(){
  const st = S.stats;
  const answered = st.correct + st.wrong;
  const acc = answered ? Math.round((st.correct / answered) * 100) : 0;
  const fav = Object.entries(S.plays).sort((a, b) => b[1] - a[1])[0];
  const favName = fav ? (GAMES.find(g => g.id === fav[0]) || {}).name : '—';

  $('#profileBody').innerHTML = `
    <div class="stat-grid">
      <div class="stat"><small>LEVEL</small><b>${S.level}</b></div>
      <div class="stat"><small>TOTAL RUNS</small><b>${S.totalRuns}</b></div>
      <div class="stat"><small>ACCURACY</small><b>${acc}%</b></div>
      <div class="stat"><small>COINS</small><b>${S.coins}</b></div>
      <div class="stat"><small>BADGES</small><b>${S.achievements.length}/${ACHIEVEMENTS.length}</b></div>
      <div class="stat"><small>BEST WPM</small><b>${st.bestWpm}</b></div>
      <div class="stat"><small>DAILY STREAK</small><b>${S.dailyStreak}</b></div>
      <div class="stat"><small>TIME PLAYED</small><b style="font-size:15px">${C.fmtTime(st.timePlayed)}</b></div>
    </div>
    <h3 class="sec-title">HIGH SCORES</h3>
    ${GAMES.map(g => {
      const best = S.bestScores[g.id] || 0;
      const max = Math.max(100, ...GAMES.map(x => S.bestScores[x.id] || 0));
      return `<div class="bar-row">
        <div class="br-top"><span>${g.ico} ${g.name}</span><b>${best}</b></div>
        <div class="br-bar"><i style="width:${(best / max) * 100}%"></i></div>
      </div>`;
    }).join('')}
    <h3 class="sec-title">BREAKDOWN</h3>
    <div class="stat-grid">
      <div class="stat"><small>BUGS SQUASHED</small><b>${st.bugs}</b></div>
      <div class="stat"><small>OUTPUTS READ</small><b>${st.oracles}</b></div>
      <div class="stat"><small>BITS HIT</small><b>${st.bits}</b></div>
      <div class="stat"><small>BOSSES BEATEN</small><b>${st.bosses}</b></div>
    </div>
    <p class="footnote">Favourite game: ${favName}</p>`;
}

/* ---------- BADGES ---------- */
function renderAchv(){
  $('#achvCount').textContent = `${S.achievements.length} of ${ACHIEVEMENTS.length} unlocked · +75 coins each`;
  $('#achvGrid').innerHTML = ACHIEVEMENTS.map(a => {
    const got = S.achievements.includes(a.id);
    return `<div class="achv ${got ? 'got' : ''}">
      <div class="a-ico">${got ? a.ico : '🔒'}</div>
      <b>${a.name}</b><small>${a.desc}</small></div>`;
  }).join('');
}

/* ---------- SETTINGS ---------- */
function renderSettings(){
  $('#settingsBody').innerHTML = `
    <div class="set-row">
      <div><b>Sound effects</b><small>WebAudio blips, no files</small></div>
      <button class="toggle ${S.settings.sfx ? 'on' : ''}" data-set="sfx"><i></i></button>
    </div>
    <div class="set-row">
      <div><b>Vibration</b><small>Haptic feedback on taps</small></div>
      <button class="toggle ${S.settings.haptics ? 'on' : ''}" data-set="haptics"><i></i></button>
    </div>
    <h3 class="sec-title">SAVE DATA</h3>
    <div class="set-row"><div><b>Export save</b><small>Copy a code to move devices</small></div>
      <button class="ghost-btn" id="expBtn">Copy</button></div>
    <div class="set-row"><div><b>Import save</b><small>Paste a code from another device</small></div>
      <button class="ghost-btn" id="impBtn">Paste</button></div>
    <div class="set-row"><div><b style="color:var(--bad)">Reset everything</b>
      <small>Deletes all progress</small></div>
      <button class="ghost-btn" id="resetBtn" style="color:var(--bad)">Reset</button></div>
    <p class="footnote">Code Arcade v1.0 · runs fully offline from Termux<br>
      Content lives in <b>public/js/data/bank.js</b> — add your own questions there.</p>`;
}

/* ============================================================
   HOST — the shell every game runs inside
   ============================================================ */
export const Host = {
  active: null, score: 0, lives: 3, combo: 0, maxCombo: 0, round: 0,
  correct: 0, wrong: 0, bosses: 0, startTs: 0,
  _timerId: null, _tEnd: 0, _tTotal: 0, _onTimeout: null, _onPower: null,
  _gameOverExtra: null, _againFn: null,

  get area(){ return $('#gameArea'); },

  begin(gameId, opts = {}){
    this.active = gameId;
    this.score = 0; this.lives = opts.lives ?? 3; this.combo = 0; this.maxCombo = 0;
    this.round = 0; this.correct = 0; this.wrong = 0; this.bosses = 0;
    this.stageLabel = null;
    this.startTs = Date.now();
    this._onPower = opts.onPower || null;
    this._againFn = opts.again || null;
    this._gameOverExtra = null;
    $('#gameBar').style.display = opts.hideBar ? 'none' : 'grid';
    $('#powerBar').style.display = opts.hidePowers ? 'none' : 'flex';
    $('#timerBar').style.display = opts.hideTimer ? 'none' : 'block';
    
    const pwFifty = $('#powerBar').querySelector('[data-pw="fifty"]');
    if (pwFifty) pwFifty.style.display = gameId === 'oracle' ? '' : 'none';
    C.startRun(gameId);
    this.sync();
    go('game');
  },

  sync(){
    $('#gScore').textContent = this.score;
    // Puzzle games run with a huge life pool; never draw 99 hearts (it blew
    // the layout out to 834px wide). Show a symbol or a count instead.
    $('#gLives').textContent =
      this.lives <= 0 ? '—' :
      this.lives > 9  ? '∞' :
      this.lives > 5  ? '♥' + this.lives : '♥'.repeat(this.lives);
    $('#gCombo').textContent = 'x' + this.mult + (this.combo > 8 ? '⁺' : '');
    $('#gRound').textContent = this.stageLabel || this.round;
    $('.combo-item').classList.toggle('hot', this.combo >= 3);
    renderHud();
  },

  // Combo keeps counting (badges care about the streak) but the score
  // multiplier is capped so a long run can't inflate into nonsense.
  get mult(){ return Math.min(8, Math.max(1, this.combo)); },

  add(n){
    this.score += Math.round(n * this.mult);
    this.sync();
  },

  hit(pts = 100, el){
    this.correct++; this.combo++;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    S.stats.correct++;
    this.add(pts);
    C.sfx(this.combo >= 3 ? 'combo' : 'correct');
    C.buzz(14);
    if (el) C.burstAt(el, 16, null);
    C.checkAchievements({ combo: this.combo });
  },

  miss(costLife = true, el){
    this.wrong++; this.combo = 0;
    S.stats.wrong++;
    if (costLife) this.lives--;
    C.sfx('wrong'); C.buzz(45);
    if (el) C.shake(el);
    this.sync();
    return this.lives > 0;
  },

  /* --- timer --- */
  timer(seconds, onTimeout){
    this.stopTimer();
    this._tTotal = seconds * 1000;
    this._tEnd = Date.now() + this._tTotal;
    this._onTimeout = onTimeout;
    const fill = $('#timerFill');
    let lastTick = 99;
    const step = () => {
      const left = this._tEnd - Date.now();
      const pct = Math.max(0, left / this._tTotal);
      fill.style.width = (pct * 100) + '%';
      fill.classList.toggle('low', pct < 0.28);
      const secLeft = Math.ceil(left / 1000);
      if (secLeft <= 3 && secLeft !== lastTick && secLeft > 0){ lastTick = secLeft; C.sfx('tick'); }
      if (left <= 0){ this.stopTimer(); this._onTimeout && this._onTimeout(); return; }
      this._timerId = requestAnimationFrame(step);
    };
    step();
  },
  addTime(ms){ if (this._timerId) this._tEnd += ms; },
  stopTimer(){
    if (this._timerId) cancelAnimationFrame(this._timerId);
    this._timerId = null;
  },

  /* --- end of run --- */
  finish(extra = {}){
    this.stopTimer();
    const gameId = this.active;
    this.active = null;
    C.sfx('end');
    const secs = Math.round((Date.now() - this.startTs) / 1000);
    const answered = this.correct + this.wrong;
    const accuracy = answered ? Math.round((this.correct / answered) * 100) : 0;
    S.stats.bosses += this.bosses;
    const res = C.endRun(gameId, this.score, {
      seconds: secs, accuracy, answered, combo: this.maxCombo, ...extra
    });

    const g = GAMES.find(x => x.id === gameId) || { name:'Run', ico:'🎮' };
    $('#resTitle').textContent = (extra.title || g.name.toUpperCase());
    $('#resScore').textContent = this.score;
    $('#resBest').textContent = res.isBest
      ? `🏆 NEW BEST! (was ${res.prev})`
      : `Best: ${S.bestScores[gameId] || 0}`;

    const rows = [
      ['Correct', this.correct], ['Missed', this.wrong],
      ['Accuracy', accuracy + '%'], ['Best combo', 'x' + this.maxCombo],
      ['Time', secs + 's'], ['XP earned', '+' + res.xp], ['Coins earned', '+' + res.coins],
      ...(extra.rows || []),
    ];
    $('#resRows').innerHTML = rows.map(([k, v]) =>
      `<div class="res-row"><span>${k}</span><b>${v}</b></div>`).join('');

    if (res.isBest){
      C.burst(innerWidth / 2, innerHeight / 3, 60);
      setTimeout(() => C.burst(innerWidth / 3, innerHeight / 2.4, 34), 220);
    }
    go('result');
    renderHud();
  },

  quit(){
    this.stopTimer();
    if (!this.active){ go('home', false); return; }
    modal(`<h3>Leave the run?</h3><p>Your score for this run will be lost.</p>
      <button class="big-btn" id="mQuit">Leave</button>
      <button class="ghost-btn wide" id="mStay">Keep playing</button>`, card => {
      card.querySelector('#mQuit').onclick = () => {
        closeModal(); this.active = null; this.stopTimer(); go('home', false);
      };
      card.querySelector('#mStay').onclick = closeModal;
    });
  },

  usePower(kind){
    if (!this.active) return false;
    if (S.powerups[kind] <= 0){ toast('None left — buy more in the Shop', '🛒'); return false; }
    if (!this._onPower) return false;
    const used = this._onPower(kind);
    if (used){
      S.powerups[kind]--;
      C.sfx('tap'); C.buzz(12); C.save(); renderHud();
    }
    return used;
  },
};

/* ---------- Global event wiring ---------- */
export function wireUI(launcher){
  $('#backBtn').onclick = () => { C.sfx('tap'); back(); };

  $('#gameGrid').onclick = e => {
    const b = e.target.closest('[data-game]'); if (!b) return;
    C.unlockAudio(); C.sfx('tap'); C.buzz(12);
    launcher(b.dataset.game);
  };

  $('#langChips').onclick = e => {
    const b = e.target.closest('[data-lang]'); if (!b) return;
    S.lang = b.dataset.lang; C.save(); C.sfx('tap'); renderHome();
  };

  $('#dailyBtn').onclick = () => {
    C.unlockAudio(); C.sfx('tap');
    if (S.dailyDate === C.todayKey()){
      toast('Already done today. Streak is safe!', '🔥');
      return;
    }
    launcher('daily');
  };

  document.body.addEventListener('click', e => {
    const nav = e.target.closest('[data-nav]');
    if (nav){ C.sfx('tap'); go(nav.dataset.nav); }
  });

  $('#homeBtn').onclick = () => { C.sfx('tap'); go('home', false); };
  $('#againBtn').onclick = () => {
    C.sfx('tap');
    if (Host._againFn) Host._againFn(); else go('home', false);
  };

  $('#powerBar').onclick = e => {
    const b = e.target.closest('[data-pw]'); if (!b) return;
    Host.usePower(b.dataset.pw);
  };

  $('#shopPowers').onclick = e => {
    const b = e.target.closest('[data-buy-pw]'); if (!b) return;
    const item = POWER_ITEMS.find(p => p.k === b.dataset.buyPw);
    if (S.coins < item.cost) return;
    S.coins -= item.cost; S.powerups[item.k]++;
    C.sfx('correct'); C.buzz(15); C.save();
    toast(`${item.name} bought`, item.ico); renderShop(); renderHud();
  };

  $('#shopThemes').onclick = e => {
    const b = e.target.closest('[data-buy-theme]'); if (!b) return;
    const t = THEMES.find(x => x.id === b.dataset.buyTheme);
    if (!S.themesOwned.includes(t.id)){
      if (S.coins < t.cost) return;
      S.coins -= t.cost; S.themesOwned.push(t.id);
      toast(`${t.name} unlocked!`, '🎨', true);
      C.sfx('achv'); C.checkAchievements();
    }
    applyTheme(t.id);
    C.burst(innerWidth / 2, innerHeight / 2, 30);
    renderShop(); renderHud();
  };

  $('#settingsBody').addEventListener('click', e => {
    const tg = e.target.closest('[data-set]');
    if (tg){
      const k = tg.dataset.set;
      S.settings[k] = !S.settings[k];
      tg.classList.toggle('on', S.settings[k]);
      C.save(); C.sfx('tap'); C.buzz(12);
      return;
    }
    if (e.target.id === 'expBtn'){
      const code = C.exportSave();
      modal(`<h3>Your save code</h3><p>Copy this and paste it on another device.</p>
        <textarea class="save-box" readonly>${code}</textarea>
        <button class="big-btn" id="mCopy">Copy to clipboard</button>
        <button class="ghost-btn wide" id="mClose">Close</button>`, card => {
        card.querySelector('#mCopy').onclick = async () => {
          const ta = card.querySelector('textarea');
          ta.select();
          ta.setSelectionRange(0, code.length);   // iOS needs an explicit range
          let done = false;
          try {
            if (navigator.clipboard && navigator.clipboard.writeText){
              await navigator.clipboard.writeText(code);
              done = true;
            }
          } catch {}
          if (!done){
            try { done = !!(document.execCommand && document.execCommand('copy')); } catch {}
          }
          toast(done ? 'Copied' : 'Select the text and copy manually', done ? '📋' : '⚠');
        };
        card.querySelector('#mClose').onclick = closeModal;
      });
    }
    if (e.target.id === 'impBtn'){
      modal(`<h3>Import save</h3><p>Paste your code. This replaces current progress.</p>
        <textarea class="save-box" id="impBox" placeholder="paste here"></textarea>
        <button class="big-btn" id="mDo">Import</button>
        <button class="ghost-btn wide" id="mClose2">Cancel</button>`, card => {
        card.querySelector('#mDo').onclick = () => {
          if (C.importSave(card.querySelector('#impBox').value)) location.reload();
          else toast('Invalid code', '⚠');
        };
        card.querySelector('#mClose2').onclick = closeModal;
      });
    }
    if (e.target.id === 'resetBtn'){
      modal(`<h3>Reset everything?</h3><p>All XP, coins, badges and high scores are deleted.
        This cannot be undone.</p>
        <button class="big-btn" id="mYes" style="background:var(--bad);color:#fff">Delete it all</button>
        <button class="ghost-btn wide" id="mNo">Cancel</button>`, card => {
        card.querySelector('#mYes').onclick = () => C.resetSave();
        card.querySelector('#mNo').onclick = closeModal;
      });
    }
  });

  window.addEventListener('beforeunload', () => C.saveNow());
  document.addEventListener('visibilitychange', () => { if (document.hidden) C.saveNow(); });
}

export { $, $$ };
