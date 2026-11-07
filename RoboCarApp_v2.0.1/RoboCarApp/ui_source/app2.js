
/* ===================================================================
   DRIVE PAGE
   =================================================================== */
const D = { touch: { x: 0, y: 0 }, key: { x: 0, y: 0 }, pad: { on: false, x: 0, y: 0 }, tilt: 0, tiltC: 0, tiltRaw: 0,
  zeroN: 0, lastX: 0, lastY: 0, lastSend: 0, rec: null, play: null, keys: {}, padBtn: [] };
const MODES = [[0, '🎮 دستی'], [1, '🤖 گشت خودکار'], [2, '🖐 دنبال‌کن'], [3, '➖ خط‌رو'], [4, '🛡 نگهبان'], [5, '🔄 اسکن ۳۶۰']];
const LIGHT_TXT = ['چراغ خاموش', 'چراغ روشن', 'چراغ خودکار'];
const HAZ_TXT = ['خطر', 'خطر ✓', 'استروب'];

/* ---- icon set (stroke icons, 24x24) */
const ICO = {
  drive: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.6"/><path d="M3.2 11h6.4M14.4 11h6.4M12 14.6V21"/>',
  sense: '<path d="M4 20V11M10 20V4M16 20v-8M21 20H3"/>',
  radar: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.6"/><path d="M12 12l6.3-6.3"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  card: '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 10h19M6.5 15h4"/>',
  calib: '<circle cx="12" cy="12" r="9"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z"/>',
  set: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/>',
  log: '<path d="M9 6h12M9 12h12M9 18h12"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>',
  horn: '<path d="M3 10.5v3a1 1 0 001 1h3l6.5 4V5.5L7 9.5H4a1 1 0 00-1 1z"/><path d="M17 9a4 4 0 010 6M19.6 6.4a8 8 0 010 11.2"/>',
  bulb: '<path d="M9.5 18h5M10.2 21h3.6"/><path d="M12 3a6 6 0 00-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0012 3z"/>',
  warn: '<path d="M12 3.5L22 20.5H2z"/><path d="M12 10v5M12 17.6v.4"/>',
  up: '<path d="M12 21V5M6 11l6-6 6 6"/>',
  tl: '<path d="M8.5 5L3.5 10l5 5"/><path d="M3.5 10H14a6 6 0 016 6v3"/>',
  tr: '<path d="M15.5 5l5 5-5 5"/><path d="M20.5 10H10a6 6 0 00-6 6v3"/>',
  ut: '<path d="M5 20V10a5 5 0 0110 0v9"/><path d="M10 14.5l5 5 5-5"/>',
  rec: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.6" fill="currentColor"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2.4"/><path d="M8 11V8a4 4 0 018 0v3"/>',
  unlock: '<rect x="5" y="11" width="14" height="10" rx="2.4"/><path d="M8 11V8a4 4 0 017.6-1.7"/>',
  bat: '<rect x="2" y="7" width="17" height="10" rx="2.4"/><path d="M22 10.5v3M5.5 10.5v3M9 10.5v3"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2.4" fill="currentColor"/>'
};
function icon(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICO[n] || '') + '</svg>'; }
function fillIcons(root) { $$('[data-i]', root).forEach(e => { if (e.dataset.done !== e.dataset.i) { e.innerHTML = icon(e.dataset.i); e.dataset.done = e.dataset.i; } }); }
function setFill(el, v, vertical, size, color) {
  if (!el) return;
  const half = size / 2, len = Math.abs(v) * (half - 40);
  el.style.display = len < 3 ? 'none' : 'block';
  el.style.setProperty('--fc', color || (v >= 0 ? '#3ddc97' : '#ffb21a'));
  if (vertical) { el.style.height = len + 'px'; el.style.top = (v >= 0 ? half - len : half) + 'px'; }
  else { el.style.width = len + 'px'; el.style.left = (v >= 0 ? half : half - len) + 'px'; }
}
function setRange(el) { const a = +el.min, b = +el.max, v = +el.value; el.style.setProperty('--p', ((v - a) / (b - a) * 100) + '%'); }

function setKnob(k, x, y) { if (!k) return; k.style.transition = 'none'; k.style.left = x; k.style.top = y; }
function resetKnob(k) { if (!k) return; k.style.transition = 'left .12s,top .12s'; k.style.left = '50%'; k.style.top = '50%'; setTimeout(() => { k.style.transition = 'none'; }, 160); }
function bindDrag(el, onMove, onEnd) {
  let id = null;
  el.addEventListener('pointerdown', e => { if (id !== null) return; id = e.pointerId; try { el.setPointerCapture(id); } catch (x) {} onMove(e, el.getBoundingClientRect()); e.preventDefault(); });
  el.addEventListener('pointermove', e => { if (e.pointerId === id) onMove(e, el.getBoundingClientRect()); });
  const end = e => { if (e.pointerId !== id) return; id = null; onEnd(); };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
}
const QB = '<div class="qb" id="qb">' +
  '<button data-q="horn"><b data-i="horn"></b>بوق (نگه دارید)</button>' +
  '<button data-q="light"><b data-i="bulb"></b><span id="qLight">چراغ</span></button>' +
  '<button data-q="haz"><b data-i="warn"></b><span id="qHaz">خطر</span></button>' +
  '<button data-q="gyro"><b data-i="up"></b>مستقیم‌رو</button>' +
  '<button data-q="tl"><b data-i="tl"></b>۹۰° چپ</button>' +
  '<button data-q="tr"><b data-i="tr"></b>۹۰° راست</button>' +
  '<button data-q="ut"><b data-i="ut"></b>دور ۱۸۰°</button>' +
  '<button data-q="radar"><b data-i="radar"></b>رادار</button>' +
  '<button data-q="rec"><b data-i="rec"></b>ضبط مسیر</button></div>';
function buildDrive() {
  const ctl = P.get('ctl', 'dual');
  const L = $('#padL'), Rr = $('#padR');
  const lever = '<div class="lever" id="lev"><div class="lbl2 t">▲ جلو</div><div class="mid"></div><div class="fl" id="levF"></div><div class="lbl2 b">عقب ▼</div><div class="knob" id="levK" style="left:50%;top:50%"></div></div>';
  if (ctl === 'stick') {
    L.innerHTML = '<div class="stick" id="stk"><div class="knob" id="stkK" style="left:50%;top:50%"></div></div>';
    Rr.innerHTML = QB;
  } else if (ctl === 'tilt') {
    L.innerHTML = lever;
    Rr.innerHTML = QB + '<div class="wheel" id="tiltV" style="pointer-events:none"><div class="mid"></div><div class="lbl2" style="top:6px;left:0;right:0;text-align:center">فرمان با چرخاندن گوشی (فقط وقتی پدال را نگه دارید)</div><div class="knob" id="tiltK" style="left:50%;top:50%"></div></div>';
  } else {
    L.innerHTML = lever;
    Rr.innerHTML = QB + '<div class="wheel" id="whl"><div class="mid"></div><div class="lbl2" style="left:12px;top:6px">← چپ</div><div class="lbl2" style="right:12px;top:6px">راست →</div><div class="fw" id="whlF"></div><div class="knob" id="whlK" style="left:50%;top:50%"></div></div>';
  }
  const kr = el => (el.querySelector('.knob').offsetWidth || 72) / 2;
  const lev = $('#lev');
  if (lev) bindDrag(lev, (e, r) => { const k = kr(lev), y = clamp(e.clientY - r.top, k, r.height - k); D.touch.y = (r.height / 2 - y) / (r.height / 2 - k); setKnob($('#levK'), '50%', (y / r.height * 100) + '%'); setFill($('#levF'), D.touch.y, true, r.height); },
    () => { D.touch.y = 0; resetKnob($('#levK')); setFill($('#levF'), 0, true, 100); });
  const whl = $('#whl');
  if (whl) bindDrag(whl, (e, r) => { const k = kr(whl), x = clamp(e.clientX - r.left, k, r.width - k); D.touch.x = (x - r.width / 2) / (r.width / 2 - k); setKnob($('#whlK'), (x / r.width * 100) + '%', '50%'); setFill($('#whlF'), D.touch.x, false, r.width, '#4cc9f0'); },
    () => { D.touch.x = 0; resetKnob($('#whlK')); setFill($('#whlF'), 0, false, 100); });
  const stk = $('#stk');
  if (stk) bindDrag(stk, (e, r) => {
    const k = kr(stk), R0 = r.width / 2 - k; let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const m = Math.hypot(dx, dy); if (m > R0) { dx *= R0 / m; dy *= R0 / m; }
    D.touch.x = dx / R0; D.touch.y = -dy / R0;
    setKnob($('#stkK'), (50 + dx / r.width * 100) + '%', (50 + dy / r.height * 100) + '%');
  }, () => { D.touch.x = 0; D.touch.y = 0; resetKnob($('#stkK')); });
  // quick buttons
  const h = $('[data-q="horn"]');
  h.addEventListener('pointerdown', e => { hornOn(); e.preventDefault(); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => h.addEventListener(n, hornOff));
  $$('#qb button').forEach(b => { if (b.dataset.q !== 'horn') b.addEventListener('click', () => qAction(b.dataset.q)); });
  if (ctl === 'tilt') { D.tiltFresh = true; if (App && App.tiltStart) App.tiltStart(); } else if (App && App.tiltStop) App.tiltStop();
  fillIcons($('#padR'));
  D.touch.x = D.touch.y = 0;
}
let hornTimer = null;
function hornOn() { if (hornTimer) return; send('H,1'); vib(25); hornTimer = setInterval(() => send('H,1'), 1500); const b = $('[data-q="horn"]'); if (b) b.classList.add('on'); }
function hornOff() { if (!hornTimer) return; clearInterval(hornTimer); hornTimer = null; send('H,0'); const b = $('[data-q="horn"]'); if (b) b.classList.remove('on'); }
function qAction(q) {
  const T = S.T; vib(15);
  if (q === 'light') send('L,' + (((T.li == null ? 2 : T.li) + 1) % 3));
  else if (q === 'haz') send('Y,' + (((T.hz | 0) + 1) % 3));
  else if (q === 'gyro') send('G,' + (T.gy ? 0 : 1));
  else if (q === 'tl') send('A,-90');
  else if (q === 'tr') send('A,90');
  else if (q === 'ut') send('A,180');
  else if (q === 'radar') send('R,' + (T.rad ? 0 : 1));
  else if (q === 'rec') macroSheet();
}
function doStop() { stopPlay(); D.touch.x = D.touch.y = 0; send('S'); send('J,0,0'); vib(60); }

/* ---- the one place that decides what J,x,y is sent */
function dz(v, z) { const a = Math.abs(v); return a < z ? 0 : Math.sign(v) * (a - z) / (1 - z); }
function driveTick() {
  pollPad();
  let x = 0, y = 0;
  if (D.play) { x = D.play.x / 100; y = D.play.y / 100; if (Math.abs(D.touch.y) > .25 || Math.abs(D.touch.x) > .25 || D.key.x || D.key.y) stopPlay(); }
  else {
    x = D.touch.x + D.key.x; y = D.touch.y + D.key.y;
    if (D.pad.on) { x += D.pad.x; y += D.pad.y; }
    if (P.get('ctl', 'dual') === 'tilt' && Math.abs(D.touch.y) > .05) x += D.tilt;
    x = clamp(dz(clamp(x, -1, 1), .07), -1, 1); y = clamp(dz(clamp(y, -1, 1), .06), -1, 1);
  }
  const X = Math.round(x * 100), Y = Math.round(y * 100);
  const tk = $('#tiltK'); if (tk) setKnob(tk, (50 + clamp(D.tilt, -1, 1) * 40) + '%', '50%');
  if (!connected() || (S.T.lk === 1 && !S.demo)) { D.lastX = D.lastY = 0; return; }
  const now = performance.now();
  if (X || Y) {
    if (X !== D.lastX || Y !== D.lastY || now - D.lastSend > 90) { send('J,' + X + ',' + Y); D.lastSend = now; }
    D.zeroN = 4;
  } else if (D.zeroN > 0) { send('J,0,0'); D.zeroN--; }
  if ((X !== D.lastX || Y !== D.lastY) && D.rec) { D.rec.ev.push([Math.round(now - D.rec.t0), X, Y]); if (D.rec.ev.length > 900 || now - D.rec.t0 > 300000) macroStopRec(); }
  D.lastX = X; D.lastY = Y;
}
setInterval(driveTick, 55);

/* ---- keyboard (desktop / bluetooth keyboard) */
const KEYMAP = { ArrowUp: 'u', w: 'u', W: 'u', ArrowDown: 'd', s: 'd', S: 'd', ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r' };
function keyVec() { const k = D.keys; D.key.y = (k.u ? 1 : 0) - (k.d ? 1 : 0); D.key.x = (k.r ? 1 : 0) - (k.l ? 1 : 0); }
window.addEventListener('keydown', e => {
  if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if (KEYMAP[e.key]) { D.keys[KEYMAP[e.key]] = true; keyVec(); e.preventDefault(); }
  else if (e.key === ' ') { hornOn(); e.preventDefault(); }
  else if (e.key === 'x' || e.key === 'Escape') doStop();
  else if (e.key === 'l') qAction('light'); else if (e.key === 'h') qAction('haz'); else if (e.key === 'g') qAction('gyro');
  else if (e.key === 'q') qAction('tl'); else if (e.key === 'e') qAction('tr');
});
window.addEventListener('keyup', e => {
  if (KEYMAP[e.key]) { D.keys[KEYMAP[e.key]] = false; keyVec(); }
  else if (e.key === ' ') hornOff();
});
/* ---- game pad (Bluetooth controller) */
window.addEventListener('gamepadconnected', () => toast('🎮 دسته‌ی بازی وصل شد', 'ok'));
function pollPad() {
  let gp = null;
  try { const l = navigator.getGamepads ? navigator.getGamepads() : []; for (const g of l) { if (g && g.connected) { gp = g; break; } } } catch (e) {}
  if (!gp || !P.get('gamepad', true)) { D.pad.on = false; return; }
  const a = gp.axes, b = gp.buttons;
  let y = -(a[1] || 0), x = Math.abs(a[2] || 0) > .12 ? a[2] : (a[0] || 0);
  if (Math.abs(y) < .12) y = ((b[7] ? b[7].value : 0) - (b[6] ? b[6].value : 0));
  D.pad.on = Math.abs(x) > .12 || Math.abs(y) > .12; D.pad.x = x; D.pad.y = y;
  const down = i => !!(b[i] && b[i].pressed);
  const edge = (i, fn) => { const n = down(i); if (n && !D.padBtn[i]) fn(); D.padBtn[i] = n; };
  if (down(0)) hornOn(); else if (D.padBtn[0]) hornOff(); D.padBtn[0] = down(0);
  edge(1, () => qAction('light')); edge(2, () => qAction('haz')); edge(3, () => qAction('gyro'));
  edge(4, () => qAction('tl')); edge(5, () => qAction('tr')); edge(8, doStop); edge(9, () => qAction('radar'));
}
/* ---- tilt steering (the Android app calls window.__tilt(degrees)) */
window.__tilt = function (deg) {
  D.tiltRaw = deg;
  if (D.tiltFresh) { D.tiltC = deg; D.tiltFresh = false; }
  const max = P.get('tiltMax', 30), inv = P.get('tiltInv', false) ? -1 : 1;
  D.tilt = clamp((deg - D.tiltC) / max, -1, 1) * inv;
};
function tiltCenter() { D.tiltC = D.tiltRaw; toast('مرکز فرمان ثبت شد', 'ok', 1400); }

/* ---- header, banners, drive HUD */
function updHeader() {
  const T = S.T, up = S.up || S.demo;
  const dot = $('#connDot'); dot.className = 'dot' + (S.demo ? ' warn' : up ? ' ok' : '');
  $('#connTxt').textContent = S.demo ? 'نمایشی' : up ? 'متصل' : 'قطع';
  $('#pingTxt').textContent = up && S.ping ? S.ping + 'ms' : '';
  const li = $('#lockIco'), want = (up && T.lk === 0) ? 'unlock' : 'lock'; if (li.dataset.i !== want) { li.dataset.i = want; li.dataset.done = ''; fillIcons($('#lockBtn')); }
  $('#lockTxt').textContent = !up ? '—' : T.lk ? 'خاموش' : (T.who ? 'روشن · ' + T.who : 'روشن');
  const bp = $('#batPill');
  if (up && T.bat) { $('#batTxt').textContent = T.pct + '% · ' + T.bat.toFixed(2) + 'V'; bp.style.borderColor = T.cut ? 'var(--bad)' : T.lowb ? 'var(--acc)' : ''; }
  else { $('#batTxt').textContent = '--'; bp.style.borderColor = ''; }
}
function updBanners() {
  const T = S.T, a = [];
  const add = (k, t) => a.push('<div class="ban ' + k + '">' + t + '</div>');
  if (S.demo) add('info', '🎮 حالت نمایشی — ماشین واقعی وصل نیست');
  if (D.rec) add('bad', '⏺ در حال ضبط مسیر… <button class="btn sm" onclick="macroStopRec()">پایان ضبط</button>');
  if (D.play) add('info', '▶ پخش مسیر ضبط‌شده… (برای توقف، ایست را بزنید)');
  if (connected()) {
    if (T.alm) add('bad', '🚨 دزدگیر فعال است! کارت را نشان دهید');
    if (T.cut) add('bad', '🔋 باتری خالی است؛ موتورها خاموش شدند — باتری را شارژ کنید');
    else if (T.lowb) add('warn', '🔋 باتری رو به پایان است');
    if (T.tip) add('bad', '⚠️ ماشین واژگون شده؛ موتورها متوقف شدند');
    if (T.mpu === 0) add('warn', '🧭 ژیروسکوپ (MPU6050) پیدا نشد — هولد مستقیم، چرخش دقیق، گشت و اسکن ۳۶۰ کار نمی‌کنند');
    if (T.tof === 0) add('warn', '📏 سنسور فاصله (VL53L0X) پیدا نشد — حفاظت مانع و رادار کار نمی‌کنند');
    if (T.fd) add('info', '📍 پیدا کردن ماشین فعال است <button class="btn sm" onclick="send(\'F,0\')">خاموش</button>');
    if (S.info.fw && S.info.fw.split('.')[0] !== APP_VER.split('.')[0]) add('warn', 'نسخه‌ی فریم‌ور (' + S.info.fw + ') با اپ (' + APP_VER + ') هماهنگ نیست');
  }
  const el = $('#banners'), h = a.join('');
  if (el._h !== h) { el.innerHTML = h; el._h = h; }
}
function buildModes() {
  $('#modes').innerHTML = MODES.map(m => '<button data-m="' + m[0] + '">' + m[1] + '</button>').join('');
  $$('#modes button').forEach(b => b.onclick = () => {
    const m = +b.dataset.m; vib(15); send('M,' + m);
    if (m === 5) { R.sc = []; R.scBusy = true; go('radar'); }
    if (m === 4) go('radar');
  });
}
function updDrive() {
  const T = S.T;
  $$('#modes button').forEach(b => b.classList.toggle('on', +b.dataset.m === (T.mode | 0)));
  const q = s => $('[data-q="' + s + '"]');
  if (q('light')) { q('light').classList.toggle('on', !!T.ln); $('#qLight').textContent = LIGHT_TXT[T.li != null ? T.li : 2]; }
  if (q('haz')) { q('haz').classList.toggle('on', T.hz > 0); $('#qHaz').textContent = HAZ_TXT[T.hz | 0]; }
  if (q('gyro')) q('gyro').classList.toggle('on', !!T.gy);
  if (q('radar')) q('radar').classList.toggle('on', !!T.rad);
  if (q('rec')) q('rec').classList.toggle('on', !!(D.rec || D.play));
  const d = T.d == null ? 2000 : T.d;
  $('#dNum').textContent = d >= 2000 ? '∞' : (d / 10).toFixed(0);
  $('#dNum').style.color = d < 150 ? 'var(--bad)' : d < 400 ? 'var(--acc)' : '';
  const bar = $('#dBar'); bar.style.width = (100 - clamp(d / 1500, 0, 1) * 100) + '%';
  bar.style.background = d < 150 ? 'var(--bad)' : d < 400 ? 'var(--acc)' : 'linear-gradient(90deg,var(--acc2),var(--ok))';
  const ch = [];
  if (T.eL) ch.push('<span class="tag bad">لبه ← چپ</span>'); if (T.eR) ch.push('<span class="tag bad">لبه راست →</span>');
  if (T.gy) ch.push('<span class="tag ok">مستقیم‌رو</span>');
  if (T.mpu && !T.tip) ch.push('<span class="tag">شیب ' + Math.round(T.pt) + '° / ' + Math.round(T.rl) + '°</span>');
  ch.push('<span class="tag">جهت ' + Math.round(T.hd || 0) + '°</span>');
  if (T.cal) ch.push('<span class="tag warn"><span class="spin"></span>کالیبراسیون…</span>');
  const c = $('#chips'), h = ch.join(''); if (c._h !== h) { c.innerHTML = h; c._h = h; }
  const sr = $('#spdRange');
  if (!sr._drag && T.mx != null && +sr.value !== T.mx) { sr.value = T.mx; setRange(sr); $('#spdVal').textContent = T.mx + '%'; }
  updLockOv();
}
function updLockOv() {
  const T = S.T, ov = $('#lockOv'), locked = connected() && T.lk === 1;
  ov.classList.toggle('on', locked);
  if (!locked) return;
  const alarm = !!T.alm;
  ov.classList.toggle('flash', alarm);
  $('#lockIcon').textContent = alarm ? '🚨' : T.rf ? '🔒' : '⚠️';
  $('#lockTitle').textContent = alarm ? 'دزدگیر فعال شد!' : T.rf ? 'ماشین خاموش است' : 'ماژول RFID پیدا نشد';
  $('#lockSub').textContent = alarm ? 'ماشین حرکت داده شد. با کارت یا رمز مدیر خاموشش کنید.' :
    !T.rf ? 'سیم‌های ماژول RC522 را بررسی کنید. فعلاً می‌توانید با رمز مدیر ماشین را روشن کنید.' :
    S.open ? 'هنوز هیچ کارتی ثبت نشده؛ فعلاً هر کارتی ماشین را روشن می‌کند. کارت خودتان را در صفحه‌ی «کارت‌ها» ثبت کنید.' :
    'کارت را نزدیک ماژول RFID (زیر ماشین) بگیرید تا ماشین روشن شود.';
  $('#cardAnim').style.display = alarm ? 'none' : '';
}
function updConnOv() {
  const show = !connected() && !S.hideConn && (Date.now() - (S.downAt || 0) > 2500);
  $('#connOv').classList.toggle('on', show);
  if (!connected()) $('#lockOv').classList.remove('on');
}
setInterval(updConnOv, 600);

/* ---- radar drawing (used by the mini radar and the radar page) */
function fit(cv) {
  const dpr = window.devicePixelRatio || 1, r = cv.getBoundingClientRect();
  const w = Math.max(40, Math.round(r.width)), h = Math.max(40, Math.round(r.height));
  if (cv.width !== w * dpr || cv.height !== h * dpr) { cv.width = w * dpr; cv.height = h * dpr; }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return { g, w, h };
}
function distColor(d) { return d < 150 ? '#ff5c6c' : d < 400 ? '#ffb21a' : '#3ddc97'; }
function rrect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
function drawCar(g, cx, fy, cw, ch) {
  const T = S.T, x = cx - cw / 2, on = connected() && T.lk === 0;
  if (on && T.ln) {                                         // headlight cones
    const gr = g.createLinearGradient(0, fy, 0, fy - ch * 1.7); gr.addColorStop(0, 'rgba(255,236,170,.38)'); gr.addColorStop(1, 'rgba(255,236,170,0)');
    g.fillStyle = gr;
    g.beginPath(); g.moveTo(x + cw * .1, fy + 2); g.lineTo(x - cw * .4, fy - ch * 1.7); g.lineTo(x + cw * .42, fy - ch * 1.7); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(x + cw * .9, fy + 2); g.lineTo(x + cw * 1.4, fy - ch * 1.7); g.lineTo(x + cw * .58, fy - ch * 1.7); g.closePath(); g.fill();
  }
  const ww = Math.max(5, cw * .17), wh = ch * .27;
  const wcol = v => { const a = Math.min(1, Math.abs(v) / 200); return Math.abs(v) < 8 ? '#3b4a63' : (v > 0 ? 'rgba(61,220,151,' + (.55 + .45 * a) + ')' : 'rgba(255,178,26,' + (.55 + .45 * a) + ')'); };
  g.fillStyle = wcol(on ? T.ml || 0 : 0); rrect(g, x - ww + 1, fy + ch * .12, ww, wh, 2); g.fill(); rrect(g, x - ww + 1, fy + ch * .6, ww, wh, 2); g.fill();
  g.fillStyle = wcol(on ? T.mr || 0 : 0); rrect(g, x + cw - 1, fy + ch * .12, ww, wh, 2); g.fill(); rrect(g, x + cw - 1, fy + ch * .6, ww, wh, 2); g.fill();
  const bg = g.createLinearGradient(x, fy, x + cw, fy + ch); bg.addColorStop(0, on ? '#ffd166' : '#3a4a66'); bg.addColorStop(1, on ? '#ff9f1a' : '#1d2a40');
  g.fillStyle = bg; rrect(g, x, fy, cw, ch, cw * .3); g.fill();
  g.fillStyle = 'rgba(8,12,20,.88)'; rrect(g, x + cw * .15, fy + ch * .2, cw * .7, ch * .17, 3); g.fill(); rrect(g, x + cw * .18, fy + ch * .7, cw * .64, ch * .12, 3); g.fill();
  g.fillStyle = '#4cc9f0'; g.beginPath(); g.arc(cx, fy + ch * .09, Math.max(2, cw * .075), 0, 7); g.fill();
  g.fillStyle = on && T.ln ? 'rgba(255,70,80,.95)' : 'rgba(255,70,80,.3)'; g.fillRect(x + cw * .08, fy + ch - 3, cw * .22, 3); g.fillRect(x + cw * .7, fy + ch - 3, cw * .22, 3);
  g.fillStyle = on && T.ln ? '#fff6d6' : '#7d8aa3'; g.fillRect(x + cw * .08, fy, cw * .2, 3); g.fillRect(x + cw * .72, fy, cw * .2, 3);
  g.fillStyle = '#ff5c6c';
  if (T.eL) { g.beginPath(); g.arc(x - 2, fy - 4, 4, 0, 7); g.fill(); }
  if (T.eR) { g.beginPath(); g.arc(x + cw + 2, fy - 4, 4, 0, 7); g.fill(); }
}
function drawFan(cv, range, big, car) {
  const { g, w, h } = fit(cv); g.clearRect(0, 0, w, h);
  let cw = 0, ch = 0, cx = w / 2, cy, rad;
  if (car) { cw = clamp(Math.min(w * .22, h * .19), 18, big ? 58 : 42); ch = cw * 1.7; cy = h - ch - (big ? 12 : 8); rad = Math.min(w / 2 - 6, cy - 10); }
  else { cy = h - (big ? 14 : 8); rad = Math.min(w / 2 - 6, (cy - 6) / Math.cos(Math.PI / 6), h - 22); }
  const A = a => (-90 + a) * Math.PI / 180;
  const fg = g.createRadialGradient(cx, cy, 0, cx, cy, rad); fg.addColorStop(0, '#12233a'); fg.addColorStop(1, '#0a111b');
  g.fillStyle = fg; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, rad, A(-62), A(62)); g.closePath(); g.fill();
  g.strokeStyle = '#2b3c57'; g.lineWidth = 1; g.fillStyle = '#6f84a3'; g.font = (big ? 12 : 10) + 'px sans-serif'; g.textAlign = 'center';
  for (let i = 1; i <= 4; i++) { const rr = rad * i / 4; g.beginPath(); g.arc(cx, cy, rr, A(-62), A(62)); g.stroke(); if (big || i % 2 === 0) g.fillText(Math.round(range * i / 4 / 10) + '', cx + 2, cy - rr + 11); }
  for (let a = -60; a <= 60; a += 30) { g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(a * Math.PI / 180) * rad, cy - Math.cos(a * Math.PI / 180) * rad); g.stroke(); }
  const now = Date.now();
  R.pts.forEach((p, a) => {
    const age = now - p.t; if (age > 9000) { R.pts.delete(a); return; }
    const rr = rad * Math.min(p.d, range) / range, al = clamp(1 - age / 9000, .12, 1);
    g.strokeStyle = distColor(p.d); g.globalAlpha = p.d >= 2000 ? al * .25 : al; g.lineWidth = big ? 7 : 5;
    g.beginPath(); g.arc(cx, cy, rr, A(a - 5), A(a + 5)); g.stroke();
  });
  g.globalAlpha = 1;
  const sv = S.T.srv || 0; g.strokeStyle = '#4cc9f0'; g.lineWidth = 2; g.shadowColor = '#4cc9f0'; g.shadowBlur = 8;
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(sv * Math.PI / 180) * rad, cy - Math.cos(sv * Math.PI / 180) * rad); g.stroke(); g.shadowBlur = 0;
  if (car) drawCar(g, cx, cy, cw, ch);
  else { g.fillStyle = '#ffb21a'; g.fillRect(cx - 7, cy - 3, 14, 9); }
  g.fillStyle = '#6f84a3'; g.textAlign = 'right'; g.font = '10px sans-serif'; g.fillText('cm', w - 4, 12);
}
function drawMap(cv, range) {
  const { g, w, h } = fit(cv); g.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2, rad = Math.min(w, h) / 2 - 14;
  g.fillStyle = '#0b121b'; g.beginPath(); g.arc(cx, cy, rad, 0, 7); g.fill();
  g.strokeStyle = '#2b3c57'; g.lineWidth = 1; g.fillStyle = '#6f84a3'; g.font = '11px sans-serif'; g.textAlign = 'center';
  for (let i = 1; i <= 4; i++) { g.beginPath(); g.arc(cx, cy, rad * i / 4, 0, 7); g.stroke(); g.fillText(Math.round(range * i / 4 / 10) + 'cm', cx, cy - rad * i / 4 + 12); }
  for (let a = 0; a < 360; a += 45) { g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(a * Math.PI / 180) * rad, cy - Math.cos(a * Math.PI / 180) * rad); g.stroke(); }
  R.sc.forEach(p => {
    const rr = rad * Math.min(p.d, range) / range, a = p.b * Math.PI / 180;
    g.fillStyle = p.d >= 1990 ? '#3b4d6a' : distColor(p.d);
    g.beginPath(); g.arc(cx + Math.sin(a) * rr, cy - Math.cos(a) * rr, 4, 0, 7); g.fill();
  });
  g.fillStyle = '#ffb21a'; g.beginPath(); g.moveTo(cx, cy - 11); g.lineTo(cx + 7, cy + 8); g.lineTo(cx - 7, cy + 8); g.closePath(); g.fill();
}
function onScan(o) {
  if (o.s === 'start') { R.sc = []; R.scBusy = true; }
  else if (o.s === 'end') { R.scBusy = false; toast('اسکن ۳۶۰ تمام شد ✓', 'ok'); }
  else if (o.b != null) R.sc.push({ b: o.b, d: o.d });
}

/* ---- path recorder */
function macroList() { return P.get('macros', []); }
function macroSheet() {
  const l = macroList();
  modal('<h3>⏺ ضبط و پخش مسیر</h3><p class="hint">مسیری که با دسته‌ها می‌رانید ضبط می‌شود و بعداً دقیقاً همان‌طور پخش می‌شود. (حفاظت مانع و لبه هنگام پخش هم فعال می‌ماند. هر لحظه می‌توانید «ایست» بزنید.)</p>' +
    (l.length ? l.map((m, i) => '<div class="cardItem"><div class="ic">🛣️</div><div class="nm"><b>' + esc(m.name) + '</b><small>' + (m.ev.length ? (m.ev[m.ev.length - 1][0] / 1000).toFixed(1) : 0) + ' s</small></div><button class="btn sm ok" data-pl="' + i + '">▶ پخش</button><button class="btn sm bad" data-dl="' + i + '">🗑</button></div>').join('') : '<p class="hint">هنوز مسیری ذخیره نشده.</p>') +
    '<div class="btns" style="margin-top:8px"><button class="btn pri" id="mcRec">⏺ شروع ضبط جدید</button><button class="btn" id="mcX">بستن</button></div>');
  $('#mcX').onclick = closeModal;
  $('#mcRec').onclick = () => { closeModal(); D.rec = { t0: performance.now(), ev: [[0, 0, 0]] }; toast('ضبط شروع شد؛ حالا برانید', 'warn'); updBanners(); };
  $$('[data-pl]').forEach(b => b.onclick = () => { closeModal(); playMacro(macroList()[+b.dataset.pl]); });
  $$('[data-dl]').forEach(b => b.onclick = () => { const a = macroList(); a.splice(+b.dataset.dl, 1); P.set('macros', a); macroSheet(); });
}
function macroStopRec() {
  const r = D.rec; D.rec = null; updBanners(); doStopSoft();
  if (!r || r.ev.length < 3) { toast('مسیر خیلی کوتاه بود', 'warn'); return; }
  r.ev.push([Math.round(performance.now() - r.t0) + 200, 0, 0]);
  askText('نام مسیر', 'یک نام برای این مسیر', { value: 'مسیر ' + (macroList().length + 1), rtl: true, max: 24 }).then(n => {
    if (n === null) return;
    const a = macroList(); a.push({ name: cleanName(n) || 'مسیر', ev: r.ev }); P.set('macros', a.slice(-8)); toast('مسیر ذخیره شد ✓', 'ok');
  });
}
function doStopSoft() { D.touch.x = D.touch.y = 0; }
function playMacro(m) {
  if (!m || !connected()) return;
  if (S.T.lk) { toast('اول ماشین را روشن کنید', 'warn'); return; }
  stopPlay();
  const ev = m.ev; let k = 0; const t0 = performance.now();
  D.play = { x: 0, y: 0, timer: setInterval(() => {
    const t = performance.now() - t0;
    while (k < ev.length && ev[k][0] <= t) { D.play.x = ev[k][1]; D.play.y = ev[k][2]; k++; }
    if (k >= ev.length) stopPlay();
  }, 20) };
  updBanners();
}
function stopPlay() { if (D.play) { clearInterval(D.play.timer); D.play = null; send('J,0,0'); updBanners(); } }
