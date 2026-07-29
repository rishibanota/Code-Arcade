/* ============ CODE ARCADE — core engine ============
   State, save/load, XP, coins, achievements, audio, haptics, particles, RNG.
   Games only need to call Core.award/Core.emit — progression is automatic.
====================================================== */

const SAVE_KEY = 'codearcade.save.v1';

export const GAMES = [
  { id:'bughunter', name:'Bug Hunter',    ico:'🐞', color:'#ff5470',
    desc:'Tap the line hiding the bug before time runs out.' },
  { id:'oracle',    name:'Output Oracle', ico:'🔮', color:'#00e5ff',
    desc:'Predict exactly what the code prints.' },
  { id:'parsons',   name:'Stack Rebuild', ico:'🧩', color:'#3ddc84',
    desc:'Reorder scrambled lines into working code.' },
  { id:'binary',    name:'Binary Blaster',ico:'🔢', color:'#ffc531',
    desc:'Flip bits to hit the target before the fuse burns.' },
  { id:'regex',     name:'Regex Ranger',  ico:'🎯', color:'#ff3ea5',
    desc:'Write a pattern that catches green, dodges red.' },
  { id:'typer',     name:'Terminal Typer',ico:'⌨️', color:'#8a5cff',
    desc:'Type real code at speed. WPM + accuracy.' },
];

export const THEMES = [
  { id:'neon',   name:'Neon',      cost:0,   cols:['#00e5ff','#ff3ea5','#0b0e17'] },
  { id:'matrix', name:'Matrix',    cost:300, cols:['#00ff5f','#9dff00','#000600'] },
  { id:'synth',  name:'Synthwave', cost:600, cols:['#ff36c8','#8a5cff','#150b28'] },
  { id:'amber',  name:'Amber CRT', cost:900, cols:['#ffb000','#ff7a00','#140d00'] },
  { id:'paper',  name:'Paper',     cost:1200,cols:['#0a58ca','#c1121f','#f4f1e8'] },
];

export const ACHIEVEMENTS = [
  { id:'first',     ico:'🌱', name:'First Blood',   desc:'Finish your first run' },
  { id:'runs10',    ico:'🎮', name:'Regular',       desc:'Play 10 runs' },
  { id:'runs50',    ico:'🕹️', name:'Addicted',      desc:'Play 50 runs' },
  { id:'combo5',    ico:'🔥', name:'On Fire',       desc:'Reach a x5 combo' },
  { id:'combo10',   ico:'⚡', name:'Unstoppable',   desc:'Reach a x10 combo' },
  { id:'flawless',  ico:'💎', name:'Flawless',      desc:'Finish a run with 100% accuracy' },
  { id:'lvl5',      ico:'⭐', name:'Level 5',        desc:'Reach level 5' },
  { id:'lvl10',     ico:'🌟', name:'Level 10',       desc:'Reach level 10' },
  { id:'lvl20',     ico:'👑', name:'Level 20',       desc:'Reach level 20' },
  { id:'rich',      ico:'💰', name:'Loaded',        desc:'Hold 1000 coins at once' },
  { id:'allgames',  ico:'🎯', name:'Sampler',       desc:'Play every game once' },
  { id:'daily1',    ico:'📅', name:'Daily Diver',   desc:'Finish a Daily Gauntlet' },
  { id:'streak3',   ico:'🔗', name:'Chain of 3',    desc:'3-day daily streak' },
  { id:'streak7',   ico:'🏅', name:'Week Warrior',  desc:'7-day daily streak' },
  { id:'bug20',     ico:'🐛', name:'Exterminator',  desc:'Squash 20 bugs total' },
  { id:'oracle25',  ico:'🧠', name:'Mind Reader',   desc:'25 correct outputs' },
  { id:'parsons3',  ico:'⭐', name:'Perfect Stack', desc:'3-star a Parsons puzzle' },
  { id:'bin30',     ico:'💾', name:'Bit Wizard',    desc:'Hit 30 binary targets' },
  { id:'golf',      ico:'⛳', name:'Regex Golfer',  desc:'Solve a regex in under 10 chars' },
  { id:'wpm40',     ico:'💨', name:'Fast Fingers',  desc:'Type at 40+ WPM' },
  { id:'wpm60',     ico:'🚀', name:'Keyboard Ninja',desc:'Type at 60+ WPM' },
  { id:'boss5',     ico:'👹', name:'Boss Slayer',   desc:'Beat 5 boss rounds' },
  { id:'night',     ico:'🦉', name:'Night Owl',     desc:'Play after midnight' },
  { id:'theme',     ico:'🎨', name:'Decorator',     desc:'Unlock any new theme' },
];

const DEFAULT_SAVE = {
  xp:0, level:1, coins:120, totalRuns:0,
  bestScores:{}, plays:{},
  stats:{ correct:0, wrong:0, bugs:0, oracles:0, bits:0, bosses:0, bestWpm:0, timePlayed:0 },
  achievements:[], themesOwned:['neon'], theme:'neon',
  powerups:{ fifty:3, freeze:3, hint:3, skip:2 },
  dailyDate:null, dailyStreak:0, lastDaily:null,
  lang:'all',
  settings:{ sfx:true, haptics:true },
};

function deepMerge(base, over){
  const out = Array.isArray(base) ? base.slice() : { ...base };
  for (const k in over){
    if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k]) && base[k]){
      out[k] = deepMerge(base[k], over[k]);
    } else if (over[k] !== undefined) out[k] = over[k];
  }
  return out;
}

export const S = (() => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? deepMerge(DEFAULT_SAVE, JSON.parse(raw)) : { ...DEFAULT_SAVE };
  } catch { return JSON.parse(JSON.stringify(DEFAULT_SAVE)); }
})();

let saveTimer = null;
export function save(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch {}
  }, 180);
}
export function saveNow(){
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch {}
}
export function resetSave(){
  try { localStorage.removeItem(SAVE_KEY); } catch {}
  location.reload();
}
/* UTF-8 safe base64 (plain btoa throws on non-latin1 characters) */
function b64encode(str){
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  const CH = 0x8000;
  for (let i = 0; i < bytes.length; i += CH){
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CH));
  }
  return btoa(bin);
}
function b64decode(b64){
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function exportSave(){ return b64encode(JSON.stringify(S)); }
export function importSave(code){
  try {
    const obj = JSON.parse(b64decode(code.trim()));
    if (typeof obj !== 'object') throw 0;
    localStorage.setItem(SAVE_KEY, JSON.stringify(deepMerge(DEFAULT_SAVE, obj)));
    return true;
  } catch { return false; }
}

/* ---------- Event bus ---------- */
const listeners = {};
export function on(evt, fn){ (listeners[evt] ||= []).push(fn); }
export function emit(evt, data){ (listeners[evt] || []).forEach(fn => fn(data)); }

/* ---------- XP / levels ---------- */
export const xpForLevel = lvl => Math.round(100 * Math.pow(lvl, 1.35));

export function addXp(n){
  if (n <= 0) return;
  S.xp += n;
  let leveled = 0;
  while (S.xp >= xpForLevel(S.level)){
    S.xp -= xpForLevel(S.level);
    S.level++; leveled++;
    S.coins += 50 * S.level;
    S.powerups.hint++; S.powerups.freeze++;
  }
  if (leveled){
    emit('levelup', S.level);
    sfx('levelup'); burst(window.innerWidth/2, window.innerHeight/3, 46);
  }
  checkAchievements();
  emit('hud');
  save();
}
export function addCoins(n){
  S.coins = Math.max(0, S.coins + n);
  checkAchievements(); emit('hud'); save();
}

/* ---------- Achievements ---------- */
export function grant(id){
  if (S.achievements.includes(id)) return false;
  const a = ACHIEVEMENTS.find(x => x.id === id);
  if (!a) return false;
  S.achievements.push(id);
  S.coins += 75;
  emit('achievement', a);
  sfx('achv'); save();
  return true;
}

export function checkAchievements(ctx = {}){
  const st = S.stats;
  if (S.totalRuns >= 1) grant('first');
  if (S.totalRuns >= 10) grant('runs10');
  if (S.totalRuns >= 50) grant('runs50');
  if (S.level >= 5) grant('lvl5');
  if (S.level >= 10) grant('lvl10');
  if (S.level >= 20) grant('lvl20');
  if (S.coins >= 1000) grant('rich');
  if (GAMES.every(g => (S.plays[g.id] || 0) > 0)) grant('allgames');
  if (st.bugs >= 20) grant('bug20');
  if (st.oracles >= 25) grant('oracle25');
  if (st.bits >= 30) grant('bin30');
  if (st.bosses >= 5) grant('boss5');
  if (st.bestWpm >= 40) grant('wpm40');
  if (st.bestWpm >= 60) grant('wpm60');
  if (S.dailyStreak >= 3) grant('streak3');
  if (S.dailyStreak >= 7) grant('streak7');
  if (S.themesOwned.length > 1) grant('theme');
  const h = new Date().getHours();
  if (h >= 0 && h < 5) grant('night');
  if (ctx.combo >= 5) grant('combo5');
  if (ctx.combo >= 10) grant('combo10');
}

/* ---------- Audio (pure WebAudio synth, no files) ---------- */
let actx = null;
function ac(){
  if (!actx){
    try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch {}
  }
  if (actx && actx.state === 'suspended') actx.resume();
  return actx;
}
export function unlockAudio(){ ac(); }

const TONES = {
  tap:     [{f:520, d:.05, t:'square', v:.05}],
  correct: [{f:660, d:.08, t:'triangle', v:.11},{f:990, d:.11, t:'triangle', v:.09, at:.07}],
  wrong:   [{f:190, d:.17, t:'sawtooth', v:.09},{f:120, d:.2, t:'sawtooth', v:.07, at:.06}],
  combo:   [{f:880, d:.06, t:'square', v:.07},{f:1180, d:.08, t:'square', v:.06, at:.05}],
  levelup: [{f:520,d:.1,t:'triangle',v:.11},{f:660,d:.1,t:'triangle',v:.11,at:.09},
            {f:880,d:.16,t:'triangle',v:.12,at:.18}],
  achv:    [{f:740,d:.09,t:'sine',v:.11},{f:1100,d:.16,t:'sine',v:.1,at:.08}],
  bit:     [{f:1250, d:.03, t:'square', v:.05}],
  end:     [{f:440,d:.12,t:'triangle',v:.1},{f:330,d:.18,t:'triangle',v:.09,at:.1}],
  tick:    [{f:1500, d:.02, t:'sine', v:.035}],
};

export function sfx(name){
  if (!S.settings.sfx) return;
  const c = ac(); if (!c) return;
  const spec = TONES[name]; if (!spec) return;
  const now = c.currentTime;
  spec.forEach(s => {
    const o = c.createOscillator(), g = c.createGain();
    o.type = s.t; o.frequency.setValueAtTime(s.f, now + (s.at || 0));
    g.gain.setValueAtTime(0, now + (s.at || 0));
    g.gain.linearRampToValueAtTime(s.v, now + (s.at || 0) + .012);
    g.gain.exponentialRampToValueAtTime(.0001, now + (s.at || 0) + s.d);
    o.connect(g); g.connect(c.destination);
    o.start(now + (s.at || 0)); o.stop(now + (s.at || 0) + s.d + .02);
  });
}

export function buzz(ms = 18){
  if (!S.settings.haptics) return;
  try { navigator.vibrate && navigator.vibrate(ms); } catch {}
}

/* ---------- Particles ---------- */
const cv = document.getElementById('fxCanvas');
const ctx2d = cv ? cv.getContext('2d') : null;
let parts = [], raf = null;

function sizeCanvas(){
  if (!cv) return;
  const d = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = innerWidth * d; cv.height = innerHeight * d;
  cv.style.width = innerWidth + 'px'; cv.style.height = innerHeight + 'px';
  ctx2d.setTransform(d, 0, 0, d, 0, 0);
}
if (cv){ sizeCanvas(); addEventListener('resize', sizeCanvas); }

function tick(){
  if (!ctx2d) return;
  ctx2d.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter(p => p.life > 0);
  parts.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += .28; p.life--;
    ctx2d.globalAlpha = Math.max(0, p.life / p.max);
    ctx2d.fillStyle = p.c;
    ctx2d.fillRect(p.x, p.y, p.s, p.s);
  });
  ctx2d.globalAlpha = 1;
  raf = parts.length ? requestAnimationFrame(tick) : null;
}

export function burst(x, y, n = 20, col){
  if (!ctx2d) return;
  const cs = col ? [col] : ['#00e5ff','#ff3ea5','#3ddc84','#ffc531','#8a5cff'];
  for (let i = 0; i < n; i++){
    const a = Math.random() * Math.PI * 2, sp = 2 + Math.random() * 7;
    parts.push({ x, y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp - 2,
      s:2 + Math.random()*4, c:cs[(Math.random()*cs.length)|0],
      life:34 + Math.random()*26, max:60 });
  }
  if (parts.length > 460) parts = parts.slice(-460);
  if (!raf) raf = requestAnimationFrame(tick);
}
export function burstAt(el, n = 18, col){
  if (!el) return;
  const r = el.getBoundingClientRect();
  burst(r.left + r.width/2, r.top + r.height/2, n, col);
}
export function shake(el){
  if (!el) return;
  el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
}

/* ---------- Seeded RNG (daily challenge) ---------- */
export function mulberry(seed){
  let a = seed >>> 0;
  return function(){
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
/* Local calendar date (NOT toISOString, which is UTC — that would roll the
   daily over at 5:30am in India instead of midnight). */
export function dateKey(d = new Date()){
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
export const todayKey = () => dateKey();
export const yesterdayKey = () => dateKey(new Date(Date.now() - 864e5));
export function daySeed(){
  const d = todayKey();
  let h = 2166136261;
  for (let i = 0; i < d.length; i++){ h ^= d.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/* ---------- Utils ---------- */
export function shuffle(arr, rnd = Math.random){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function pick(arr, rnd = Math.random){ return arr[Math.floor(rnd() * arr.length)]; }
export function esc(s){
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}
export function fmtTime(sec){
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return m + 'm ' + String(s).padStart(2, '0') + 's';
}

/* ---------- Syntax highlighting (tiny, language-agnostic) ---------- */
const KEYWORDS = new Set(('def return if else elif for while in not and or None True False print ' +
  'class import from let const var function console log null undefined true false new typeof ' +
  'int char float double void include printf scanf public static main String System out println ' +
  'len range append push this struct malloc sizeof break continue try except catch throw std ' +
  'cout cin endl vector bool async await export default').split(' '));

/* Single-pass tokenizer.
   A chain of .replace() calls corrupts itself: the keyword pass matched the
   word "class" inside the class="tok-n" attribute emitted by an earlier pass.
   Scanning once and escaping each token as we emit it avoids that entirely. */
export function hl(line){
  const src = String(line);
  const TOKEN = /(#[^\n]*|\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')|(\b\d+\.?\d*\b)|([A-Za-z_]\w*)/g;
  let out = '', last = 0, m;
  while ((m = TOKEN.exec(src)) !== null){
    out += esc(src.slice(last, m.index));
    const [tok, comment, str, num, word] = m;
    if (comment)   out += `<span class="tok-c">${esc(tok)}</span>`;
    else if (str)  out += `<span class="tok-s">${esc(tok)}</span>`;
    else if (num)  out += `<span class="tok-n">${esc(tok)}</span>`;
    else if (word && KEYWORDS.has(word)) out += `<span class="tok-k">${esc(tok)}</span>`;
    else out += esc(tok);
    last = m.index + tok.length;
  }
  return out + esc(src.slice(last));
}

/* ---------- Run bookkeeping ---------- */
export function startRun(gameId){
  S.plays[gameId] = (S.plays[gameId] || 0) + 1;
  save();
}
export function endRun(gameId, score, extra = {}){
  S.totalRuns++;
  const prev = S.bestScores[gameId] || 0;
  const isBest = score > prev;
  if (isBest) S.bestScores[gameId] = score;
  if (extra.seconds) S.stats.timePlayed += extra.seconds;
  const coins = Math.max(3, Math.round(score / 12));
  S.coins += coins;
  const xp = Math.max(6, Math.round(score / 5));
  addXp(xp);
  if (extra.accuracy === 100 && (extra.answered || 0) >= 5) grant('flawless');
  checkAchievements(extra);
  saveNow();
  return { isBest, prev, coins, xp };
}
