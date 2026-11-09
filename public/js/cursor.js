/* ============ CODE ARCADE — Interactive Custom Cursor ============
   60fps hardware-accelerated neon/cyber cursor with smooth lerp tracking,
   particle sparkle trails, dynamic hover morphing, and touch fallback.
================================================================== */

let wrap = null;
let dot = null;
let ring = null;

let mouseX = -100;
let mouseY = -100;
let ringX = -100;
let ringY = -100;

let isFinePointer = false;
let isHovering = false;
let isClicking = false;
let currentMode = 'default';
let currentStyle = 'cyber'; // cyber | neon | crosshair | pixel | off
let isVisible = false;
let rafId = null;

let lastTrailX = 0;
let lastTrailY = 0;
let trailEmitFn = null;

export function registerTrailEmitter(fn){
  trailEmitFn = fn;
}

export function getCursorStyle(){
  return currentStyle;
}

export function setCursorStyle(style){
  currentStyle = style || 'cyber';
  if (!wrap) return;
  wrap.dataset.style = currentStyle;
  
  if (currentStyle === 'off' || !isFinePointer){
    document.body.classList.remove('custom-cursor-active');
    wrap.style.display = 'none';
  } else {
    document.body.classList.add('custom-cursor-active');
    wrap.style.display = 'block';
  }
}

export function setCursorMode(mode){
  currentMode = mode;
  if (!wrap) return;
  wrap.dataset.mode = mode;
}

function updatePositions(){
  if (!isVisible || currentStyle === 'off' || !isFinePointer){
    rafId = requestAnimationFrame(updatePositions);
    return;
  }

  // Smooth lerp for outer ring
  const lerpFactor = currentStyle === 'pixel' ? 0.45 : 0.22;
  ringX += (mouseX - ringX) * lerpFactor;
  ringY += (mouseY - ringY) * lerpFactor;

  if (dot) {
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
  }
  if (ring) {
    ring.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0) translate(-50%, -50%)`;
  }

  // Particle sparkle trail on mouse velocity
  const dx = mouseX - lastTrailX;
  const dy = mouseY - lastTrailY;
  const dist = Math.hypot(dx, dy);
  if (dist > 18 && trailEmitFn){
    trailEmitFn(mouseX, mouseY, isHovering);
    lastTrailX = mouseX;
    lastTrailY = mouseY;
  }

  rafId = requestAnimationFrame(updatePositions);
}

export function initCursor(initialStyle = 'cyber', onSpark){
  if (onSpark) registerTrailEmitter(onSpark);

  wrap = document.getElementById('cursorWrap');
  if (!wrap){
    wrap = document.createElement('div');
    wrap.id = 'cursorWrap';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.innerHTML = `
      <div id="curDot"></div>
      <div id="curRing">
        <span class="cur-bracket cur-tl"></span>
        <span class="cur-bracket cur-tr"></span>
        <span class="cur-bracket cur-bl"></span>
        <span class="cur-bracket cur-br"></span>
        <span class="cur-cross-v"></span>
        <span class="cur-cross-h"></span>
      </div>
      <div id="curPixel"></div>
    `;
    document.body.appendChild(wrap);
  }

  dot = document.getElementById('curDot');
  ring = document.getElementById('curRing');

  // Check if system has a fine pointer (mouse / trackpad)
  isFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  setCursorStyle(initialStyle);

  window.addEventListener('mousemove', e => {
    // If user touched screen first then moved mouse, reactivate
    isFinePointer = true;
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible){
      isVisible = true;
      ringX = mouseX;
      ringY = mouseY;
      if (currentStyle !== 'off'){
        document.body.classList.add('custom-cursor-active');
        wrap.style.display = 'block';
      }
    }
  }, { passive: true });

  window.addEventListener('mouseenter', () => {
    if (isFinePointer && currentStyle !== 'off') {
      isVisible = true;
      wrap.style.opacity = '1';
    }
  });

  window.addEventListener('mouseleave', () => {
    isVisible = false;
    if (wrap) wrap.style.opacity = '0';
  });

  // Touch screen fallback: gracefully hide custom cursor on touch
  window.addEventListener('touchstart', () => {
    isFinePointer = false;
    isVisible = false;
    document.body.classList.remove('custom-cursor-active');
    if (wrap) wrap.style.display = 'none';
  }, { passive: true });

  // Dynamic interactive element inspection on hover
  document.addEventListener('mouseover', e => {
    if (!isFinePointer || currentStyle === 'off') return;
    const target = e.target;
    
    // Check if hovering interactive controls
    const isInteractive = target.closest(
      'button, a, .game-card, .chip, .opt, .pw, .bit, .pline, .daily-card, .shop-item, .toggle, .code-line.tappable, [data-nav], [data-game], [data-buy-pw], [data-buy-theme]'
    );
    const isTextMode = target.closest('input, textarea, .typer-target, .code-box');

    if (isTextMode){
      setCursorMode('text');
      isHovering = true;
      wrap.classList.add('hovering');
    } else if (isInteractive){
      setCursorMode('interactive');
      isHovering = true;
      wrap.classList.add('hovering');
    } else {
      setCursorMode('default');
      isHovering = false;
      wrap.classList.remove('hovering');
    }
  }, { passive: true });

  // Click & tap ripple animation
  window.addEventListener('mousedown', e => {
    if (!isFinePointer || currentStyle === 'off') return;
    isClicking = true;
    wrap.classList.add('clicking');
    spawnClickRipple(e.clientX, e.clientY);
  });

  window.addEventListener('mouseup', () => {
    isClicking = false;
    wrap.classList.remove('clicking');
  });

  if (!rafId){
    rafId = requestAnimationFrame(updatePositions);
  }
}

function spawnClickRipple(x, y){
  const ripple = document.createElement('div');
  ripple.className = 'cur-click-ripple';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  document.body.appendChild(ripple);
  setTimeout(() => ripple.remove(), 450);
}
