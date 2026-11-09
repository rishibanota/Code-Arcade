# Arcade Polish, Interactive Cursor, and Animations Implementation Plan

> **Goal:** Transform Code-Arcade into an ultra-responsive, visually stunning arcade web experience with interactive morphing cursor effects, 60fps particle trails, floating combat text, 3D card tilts, boss encounter intros, animated score countups with S-rank stamps, and sound improvements.

**Architecture:** 
- Add a standalone, zero-dependency `public/js/cursor.js` module handling desktop fine-pointer tracking, smooth lerp interpolation, particle spark emissions, and interactive hover morphs.
- Enhance `public/js/core.js` with musical combo pitch scales, celebratory confetti fountains, shockwaves, and floating floating text.
- Update `public/js/ui.js` with 3D card tilt physics, animated results score roll-up, arcade rank stamp slams, boss warning banners, and settings toggles for cursor styles and CRT scanline overlay.
- Polish `public/css/style.css` with cyber cursor visuals, CRT cabinet scanlines, 3D flips, combo flame animations, and responsive micro-interactions.
- Register new files in `public/sw.js` (bump cache to `codearcade-v4`).
- Validate everything via Python HTTP server and browser tests, commit, and push to `main`.

**Tech Stack:** Vanilla ES Modules, Canvas 2D, Web Audio API, Modern CSS3 3D transforms, Service Worker.

---

### Task 1: Create `public/js/cursor.js` and Cursor Styles
- Create custom cursor module with lerping ring, instant precision dot, particle spark trail, hover state morphing, and style customization (cyber, neon, crosshair, pixel, off).
- Add CSS styling in `public/css/style.css`.
- Add cursor HTML elements to `public/index.html`.

### Task 2: Core FX & Audio Enhancements in `public/js/core.js`
- Enhance `sfx` with musical combo scale pitch progressions, boss siren, stamp slam, coin pickup, and whoosh tones.
- Add confetti particle fountain and shockwave ring effects to the canvas particle system.
- Add floating combat text engine (`spawnFloatText`).

### Task 3: Game Shell & Host Polish in `public/js/ui.js`
- Integrate 3D card perspective tilt and specular highlight on mouse movement.
- Add Boss Round warning alarm banner and screen flash.
- Add dynamic results count-up animation and slam rank stamp (S/A/B/C rank).
- Add Settings controls for Cursor Style, CRT Scanlines, and Screen Shake.

### Task 4: Game Runner Visual Polish (`binary.js`, `bughunter.js`, `oracle.js`, `parsons.js`, `regex.js`, `typer.js`)
- Add bit 3D flip animation & live match pulse in Binary Blaster.
- Add bug squash particle blast in Bug Hunter.
- Add option lock-in glow & burst in Output Oracle.
- Add smooth line swap transitions in Parsons.
- Add reactive match badges in Regex Ranger.
- Add neon caret & WPM speedometer flame in Typer.

### Task 5: Service Worker, Verification, Git Commit & Push
- Update `public/sw.js` cache name to `codearcade-v4` and include `./js/cursor.js`.
- Verify JavaScript syntax across all files.
- Test server and asset delivery.
- Commit changes and push to `origin main`.
