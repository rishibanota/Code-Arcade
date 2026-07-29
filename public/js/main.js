/* ============ CODE ARCADE — boot ============ */
import * as C from './core.js';
import { S, GAMES } from './core.js';
import { Host, wireUI, go, renderHud, renderHome, applyTheme, toast, modal, closeModal } from './ui.js';

import { play as bughunter } from './games/bughunter.js';
import { play as oracle }    from './games/oracle.js';
import { play as parsons }   from './games/parsons.js';
import { play as binary }    from './games/binary.js';
import { play as regex }     from './games/regex.js';
import { play as typer }     from './games/typer.js';

const RUNNERS = { bughunter, oracle, parsons, binary, regex, typer };

/* ---------- Daily Gauntlet ----------
   One run, all six games chained, same puzzles for everyone that day. */
function daily(){
  const rnd = C.mulberry(C.daySeed());
  const seq = C.shuffle(GAMES.map(g => g.id), rnd);
  let step = 0;

  Host.begin('daily', { lives: 5, again: () => daily() });
  Host.active = 'daily';

  const runStep = () => {
    if (step >= seq.length || Host.lives <= 0){
      finishDaily(Host.lives <= 0);
      return;
    }
    const id = seq[step++];
    const g = GAMES.find(x => x.id === id);
    modal(`<h3>${g.ico} ${g.name}</h3>
      <p>Stage ${step} of ${seq.length} — 3 rounds.<br>Score carries across all stages.</p>
      <button class="big-btn" id="mGo">Start stage</button>`, card => {
      card.querySelector('#mGo').onclick = () => {
        closeModal();
        // Each stage counts its own rounds; score, lives and combo carry over.
        Host.round = 0;
        Host.stageLabel = `${step}/${seq.length}`;
        RUNNERS[id]({ embedded:true, rounds:3, rnd, onDone:runStep });
      };
    });
  };

  function finishDaily(outOfLives){
    const stagesDone = outOfLives ? step - 1 : seq.length;
    const completed = !outOfLives;
    let bonus = 0;

    // The streak only advances on a full clear.
    if (completed){
      const today = C.todayKey();
      const yest = C.yesterdayKey();
      if (S.dailyDate !== today){
        S.dailyStreak = (S.dailyDate === yest) ? S.dailyStreak + 1 : 1;
        S.dailyDate = today;
      }
      bonus = 100 + S.dailyStreak * 20;
      S.coins += bonus;
      C.addXp(120);
      C.grant('daily1');
      C.checkAchievements();
    }

    Host.active = 'daily';
    Host.finish({
      title: completed ? 'DAILY GAUNTLET' : 'GAUNTLET FAILED',
      rows: [
        ['Stages cleared', `${stagesDone} / ${seq.length}`],
        ['Daily streak', S.dailyStreak + ' 🔥'],
        ['Daily bonus', completed ? '+' + bonus + ' 🪙' : 'clear all 6 to earn it'],
      ],
    });
  }

  runStep();
}

/* ---------- Launcher ---------- */
function launch(id){
  if (id === 'daily'){ daily(); return; }
  const fn = RUNNERS[id];
  if (!fn){ toast('Game not found', '⚠'); return; }
  fn({});
}

/* ---------- First-run tutorial ---------- */
function maybeIntro(){
  if (localStorage.getItem('codearcade.seen')) return;
  localStorage.setItem('codearcade.seen', '1');
  modal(`<h3>Welcome to Code Arcade 👾</h3>
    <p style="text-align:left">
      <b>6 games</b> that quietly teach you real coding.<br><br>
      🔥 Combos multiply your score<br>
      ⚡ Every 10th question is a BOSS (×3)<br>
      🪙 Coins unlock themes in the Shop<br>
      🏆 24 badges to collect<br>
      📅 Daily Gauntlet keeps your streak<br><br>
      Everything saves automatically and works offline.
    </p>
    <button class="big-btn" id="mOk">Let's go</button>`, card => {
    card.querySelector('#mOk').onclick = () => { C.unlockAudio(); closeModal(); };
  });
}

/* ---------- Boot ---------- */
applyTheme(S.theme || 'neon');
wireUI(launch);
renderHome();
renderHud();
go('home', false);
maybeIntro();

document.addEventListener('click', () => C.unlockAudio(), { once:true });

// Block accidental pull-to-refresh mid-game
document.addEventListener('touchmove', e => {
  if (window.scrollY === 0 && e.touches[0].clientY > 60 && Host.active){
    // allow normal scroll, only guard the overscroll at very top
  }
}, { passive:true });

if ('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}

window.CodeArcade = { C, S, Host, launch };
