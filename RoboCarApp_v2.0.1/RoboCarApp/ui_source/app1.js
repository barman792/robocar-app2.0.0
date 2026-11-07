'use strict';
/* ===================================================================
   RoboCar app 2.0.0  -  one single file, used inside the Android app
   AND served by the car itself (http://192.168.4.1)
   =================================================================== */
const APP_VER = '2.0.1';
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const P = {
  get(k, d) { try { const v = localStorage.getItem('rc_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('rc_' + k, JSON.stringify(v)); } catch (e) {} }
};
const App = window.RCApp || null;                    // Android bridge (null in a normal browser)
function vib(ms) { if (!P.get('haptic', true)) return; try { if (App && App.vibrate) App.vibrate(ms); else if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function cleanName(s) { return String(s).replace(/[,|"\\\r\n\t]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 40); }
function fmtUp(s) { s = s | 0; const h = (s / 3600) | 0, m = ((s % 3600) / 60) | 0; return (h ? h + 'h ' : '') + m + 'm ' + (s % 60) + 's'; }
function pad2(n) { return (n < 10 ? '0' : '') + n; }
function clock(sec) { return pad2((sec / 3600) | 0) + ':' + pad2(((sec % 3600) / 60) | 0) + ':' + pad2(sec % 60); }

/* ------------------------------------------------------------ state */
const S = {
  T: {}, C: {}, cards: [], open: 0, info: {}, up: false, ping: 0, pingT: 0,
  adminUntil: 0, log: [], lastRx: 0, demo: false, pg: 'drive', prevLk: null, welcomeAt: 0,
  hist: { bat: [], d: [] }, cal: {}, hideConn: false
};
const R = { pts: new Map(), sc: [], scBusy: false };          // radar data
const pending = { admin: null, enr: null };

/* ------------------------------------------------------------ link */
const Link = {
  ws: null, timer: null, tries: 0,
  host() { return (location.protocol === 'file:' || !location.hostname) ? P.get('host', '192.168.4.1') : location.hostname; },
  connect() {
    if (S.demo || S.paused) return;
    this.drop();
    let ws;
    try { ws = new WebSocket('ws://' + this.host() + ':81/'); } catch (e) { this.retry(); return; }
    this.ws = ws;
    ws.onopen = () => { S.up = true; this.tries = 0; S.lastRx = Date.now(); onUp(); };
    ws.onmessage = e => { S.lastRx = Date.now(); onRaw(e.data); };
    ws.onclose = () => { if (this.ws === ws) { this.ws = null; if (S.up) { S.up = false; onDown(); } this.retry(); } };
    ws.onerror = () => { try { ws.close(); } catch (e) {} };
  },
  retry() { if (S.paused) return; clearTimeout(this.timer); this.timer = setTimeout(() => this.connect(), Math.min(3000, 700 + this.tries++ * 300)); },
  drop() { clearTimeout(this.timer); if (this.ws) { const w = this.ws; this.ws = null; try { w.close(); } catch (e) {} } },
  send(s) {
    if (S.demo) { Demo.recv(s); return true; }
    if (this.ws && this.ws.readyState === 1) { try { this.ws.send(s); return true; } catch (e) {} }
    return false;
  }
};
const send = s => Link.send(s);
function connected() { return S.up || S.demo; }

function onRaw(d) { let o; try { o = JSON.parse(d); } catch (e) { return; } onMsg(o); }

/* ------------------------------------------------------------ translate firmware events */
const EV = [
  [/^Car ON - (.*)$/, m => 'ماشین روشن شد — ' + (m[1] === 'password' ? 'با رمز' : m[1] === 'card' ? 'با کارت' : m[1]), 'ok'],
  [/^Car OFF - (.*)$/, m => 'ماشین خاموش شد (' + ({ 'app': 'از اپ', 'auto-lock': 'قفل خودکار', 'card shown again': 'کارت دوباره نشان داده شد' }[m[1]] || m[1]) + ')', ''],
  [/^Unknown card refused \((.*)\)$/, m => 'کارت ناشناس رد شد: ' + m[1], 'bad'],
  [/^Card added: (.*)$/, m => 'کارت اضافه شد: ' + m[1], 'ok'],
  [/^Card deleted: (.*)$/, m => 'کارت حذف شد: ' + m[1], ''],
  [/^All cards deleted$/, () => 'همه‌ی کارت‌ها حذف شدند', 'warn'],
  [/^Admin login$/, () => 'ورود مدیر', ''],
  [/^Wrong admin password$/, () => 'رمز مدیر اشتباه وارد شد', 'bad'],
  [/^Too many wrong passwords.*$/, () => 'تلاش بیش از حد: ورود ۶۰ ثانیه قفل شد', 'bad'],
  [/^Admin password changed$/, () => 'رمز مدیر تغییر کرد', 'ok'],
  [/^ALARM.*$/, () => '🚨 دزدگیر: ماشین حرکت داده شد!', 'bad'],
  [/^Alarm stopped by timeout$/, () => 'دزدگیر به‌خاطر زمان متوقف شد', 'warn'],
  [/^Battery low: (.*) V$/, m => 'باتری ضعیف است: ' + m[1] + ' ولت', 'warn'],
  [/^Battery empty.*$/, () => 'باتری خالی است؛ موتورها خاموش شدند', 'bad'],
  [/^Car tipped over.*$/, () => 'ماشین واژگون شد؛ موتورها متوقف شدند', 'bad'],
  [/^Gyro calibrated \(bias (.*)\)$/, m => 'ژیروسکوپ کالیبره شد (بایاس ' + m[1] + ')', 'ok'],
  [/^Gyro calibration failed.*$/, () => 'کالیبراسیون ژیرو ناموفق بود: ماشین حرکت کرد', 'bad'],
  [/^Level set \(pitch (.*), roll (.*)\)$/, m => 'تراز افقی ثبت شد (pitch ' + m[1] + '، roll ' + m[2] + ')', 'ok'],
  [/^Level failed.*$/, () => 'تراز ناموفق بود: ماشین ثابت یا صاف نیست', 'bad'],
  [/^Edge calibrated but.*\(floor L (\d+) R (\d+)\)$/, m => 'سنسور لبه ثبت شد ولی کف خیلی تیره/دور است (' + m[1] + ' / ' + m[2] + ')', 'warn'],
  [/^Edge calibrated \(floor L (\d+) R (\d+)\)$/, m => 'سنسور لبه کالیبره شد (کف ' + m[1] + ' / ' + m[2] + ')', 'ok'],
  [/^Light threshold set \(now (\d+)\)$/, m => 'آستانه‌ی نور ثبت شد (' + m[1] + ')', 'ok'],
  [/^Battery calibrated: (.*) V$/, m => 'ولتاژ باتری با مولتی‌متر کالیبره شد: ' + m[1] + ' V', 'ok'],
  [/^Guard armed$/, () => 'نگهبان فعال شد', 'ok'],
  [/^Guard: learning.*$/, () => 'نگهبان: در حال یادگیری محیط…', ''],
  [/^Guard: object (\d+) mm at (-?\d+) deg$/, m => 'نگهبان: جسم در ' + (m[1] / 10).toFixed(0) + ' سانتی‌متری، زاویه ' + m[2] + '°', 'bad'],
  [/^360 scan finished$/, () => 'اسکن ۳۶۰ درجه تمام شد', 'ok'],
  [/^Find-my-car started$/, () => 'پیدا کردن ماشین: بوق و چراغ روشن شد', ''],
  [/^Find-my-car stopped$/, () => 'پیدا کردن ماشین خاموش شد', ''],
  [/^Firmware update started$/, () => 'بروزرسانی فریم‌ور شروع شد', 'warn'],
  [/^Wi-Fi changed to (.*) - restarting$/, m => 'نام وای‌فای به «' + m[1] + '» تغییر کرد؛ ماشین ری‌استارت می‌شود', 'warn'],
  [/^Car started \(v(.*)\)$/, m => 'ماشین روشن شد (فریم‌ور ' + m[1] + ')', ''],
  [/^RFID reader found$/, () => 'ماژول RFID پیدا شد', 'ok'],
  [/^RFID reader lost$/, () => 'ارتباط با ماژول RFID قطع شد', 'bad'],
  [/^Wander mode needs.*$/, () => 'حالت گشت به ژیرو و سنسور فاصله نیاز دارد', 'warn'],
  [/^Follow mode needs.*$/, () => 'حالت دنبال‌کن به سنسور فاصله نیاز دارد', 'warn'],
  [/^360 scan needs.*$/, () => 'اسکن ۳۶۰ به ژیرو و سنسور فاصله نیاز دارد', 'warn']
];
function trEv(m) {
  for (const [re, fn, kind] of EV) { const x = re.exec(m); if (x) return { text: fn(x), kind }; }
  return { text: m, kind: /fail|lost|refus|wrong/i.test(m) ? 'bad' : '' };
}
function addLog(sec, raw, silent) {
  const t = trEv(raw);
  S.log.push({ sec, text: t.text, kind: t.kind, at: Date.now() });
  if (S.log.length > 300) S.log.shift();
  if (S.pg === 'log') renderLog();
  if (!silent && t.kind) toast(t.text, t.kind);
}

/* ------------------------------------------------------------ toast / modal */
function toast(msg, kind, ms) {
  const el = document.createElement('div');
  el.className = 'toast ' + (kind || '');
  el.textContent = msg;
  const box = $('#toasts');
  box.appendChild(el);
  while (box.children.length > 3) box.removeChild(box.firstChild);
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, ms || 3200);
}
function modal(html) { $('#modalBox').innerHTML = html; $('#modal').classList.add('on'); }
function closeModal() { $('#modal').classList.remove('on'); $('#modalBox').innerHTML = ''; }
function modalOpen() { return $('#modal').classList.contains('on'); }
function askText(title, label, o) {
  o = o || {};
  return new Promise(res => {
    modal('<h3>' + title + '</h3>' + (o.hint ? '<p class="hint">' + o.hint + '</p>' : '') +
      '<label class="hint">' + label + '</label><input id="askIn" class="' + (o.rtl ? 'rtl' : '') + '" type="' + (o.password ? 'password' : 'text') + '" value="' + esc(o.value || '') + '" maxlength="' + (o.max || 40) + '" autocomplete="off" autocapitalize="off">' +
      '<div class="btns" style="margin-top:12px"><button class="btn pri" id="askOk">تأیید</button><button class="btn" id="askNo">انصراف</button></div>');
    const inp = $('#askIn'); setTimeout(() => inp.focus(), 50);
    const done = v => { closeModal(); res(v); };
    $('#askOk').onclick = () => done(inp.value);
    $('#askNo').onclick = () => done(null);
    inp.onkeydown = e => { if (e.key === 'Enter') done(inp.value); };
  });
}
function confirmBox(title, text, okLabel, danger) {
  return new Promise(res => {
    modal('<h3>' + title + '</h3><p class="hint">' + text + '</p><div class="btns"><button class="btn ' + (danger ? 'bad' : 'pri') + '" id="cfOk">' + (okLabel || 'بله') + '</button><button class="btn" id="cfNo">انصراف</button></div>');
    $('#cfOk').onclick = () => { closeModal(); res(true); };
    $('#cfNo').onclick = () => { closeModal(); res(false); };
  });
}

/* ------------------------------------------------------------ admin password session */
function adminActive() { return Date.now() < S.adminUntil; }
function ensureAdmin(reason) {
  return new Promise(res => {
    if (!connected()) { toast('به ماشین وصل نیستید', 'warn'); res(false); return; }
    if (adminActive()) { res(true); return; }
    modal('<h3>🔐 رمز مدیر</h3><p class="hint">' + esc(reason || 'برای این کار رمز مدیر لازم است.') + '</p>' +
      '<input id="pwIn" type="password" placeholder="رمز مدیر" autocomplete="off"><div id="pwErr" class="hint" style="color:var(--bad);min-height:22px;margin-top:6px"></div>' +
      '<div class="btns"><button class="btn pri" id="pwOk">ورود</button><button class="btn" id="pwNo">انصراف</button></div>');
    const inp = $('#pwIn'); setTimeout(() => inp.focus(), 50);
    const go = () => { if (!inp.value) return; $('#pwErr').textContent = 'در حال بررسی…'; send('AUTH,' + inp.value); };
    $('#pwOk').onclick = go; inp.onkeydown = e => { if (e.key === 'Enter') go(); };
    $('#pwNo').onclick = () => { pending.admin = null; closeModal(); res(false); };
    pending.admin = res;
  });
}
function onAuth(o) {
  if (o.need) { S.adminUntil = 0; toast('نشست مدیر تمام شده؛ دوباره رمز را وارد کنید', 'warn'); return; }
  if (o.ok) {
    S.adminUntil = Date.now() + 285000;
    const r = pending.admin; pending.admin = null;
    if (r) { closeModal(); r(true); }
    toast('ورود مدیر انجام شد ✓ (۵ دقیقه)', 'ok'); vib(30);
    refreshAdminUI();
  } else {
    const e = $('#pwErr');
    if (e) e.textContent = o.wait ? ('تلاش‌ها زیاد بود؛ ' + o.wait + ' ثانیه صبر کنید') : ('رمز اشتباه است — ' + o.left + ' تلاش باقی مانده');
    vib(80);
  }
}

/* ------------------------------------------------------------ incoming messages */
function onUp() {
  S.hideConn = false;
  $('#connOv').classList.remove('on');
  send('LG'); toast('به ماشین وصل شد ✓', 'ok', 1800);
  updHeader();
}
function onDown() {
  S.T = Object.assign({}, S.T); D.touch.x = D.touch.y = 0;
  updHeader(); updConnOv();
}
function onMsg(o) {
  switch (o.t) {
    case 'st': S.T = o; S.tAt = Date.now(); onState(); break;
    case 'cfg': S.C = o; onCfg(); break;
    case 'cards': S.cards = o.cards || []; S.open = o.open | 0; if (S.pg === 'cards') renderCards(); break;
    case 'info': S.info = o; onInfo(); break;
    case 'ev': addLog(o.s | 0, o.m); break;
    case 'log': (o.a || []).forEach(e => addLog(e[0], e[1], true)); break;
    case 'pong': S.ping = Math.round(performance.now() - S.pingT); updHeader(); break;
    case 'rd': R.pts.set(o.a, { d: o.d, t: Date.now() }); break;
    case 'sc': onScan(o); break;
    case 'cal': onCal(o); break;
    case 'enr': onEnr(o); break;
    case 'auth': onAuth(o); break;
    case 'pw': toast(o.ok ? 'رمز مدیر تغییر کرد ✓' : 'رمز نامعتبر است (۶ تا ۳۲ نویسه، بدون فاصله)', o.ok ? 'ok' : 'bad'); break;
    case 'wifi':
      if (o.ok) { toast('وای‌فای تغییر کرد؛ ماشین ری‌استارت می‌شود. به شبکه‌ی جدید وصل شوید.', 'ok', 6000); if (pending.wifi) { P.set('ssid', pending.wifi[0]); P.set('wpass', pending.wifi[1]); } }
      else toast('نام (۱ تا ۳۱ نویسه) یا رمز (۸ تا ۶۳ نویسه) معتبر نیست', 'bad');
      break;
    case 'rb': toast('ماشین در حال ری‌استارت است…', 'warn', 4000); break;
  }
}
function onInfo() {
  if (S.info.ssid) { $('#ssidHint').textContent = S.info.ssid; }
  if (S.pg === 'set') buildSettings();
}
function onCfg() {
  $('#spdRange').value = S.C.spd; setRange($('#spdRange')); $('#spdVal').textContent = S.C.spd + '%';
  updSettingsValues(); updCardOpts();
}
function onState() {
  const T = S.T;
  // lock transitions
  if (S.prevLk !== null && S.prevLk === 1 && T.lk === 0) { showWelcome(T.who); }
  if (S.prevLk !== null && S.prevLk === 0 && T.lk === 1) vib(60);
  S.prevLk = T.lk;
  const n = Date.now();
  if (!S.hist.t || n - S.hist.t > 500) {
    S.hist.t = n; S.hist.bat.push(T.bat); S.hist.d.push(Math.min(T.d, 1500));
    if (S.hist.bat.length > 120) { S.hist.bat.shift(); S.hist.d.shift(); }
  }
  updHeader(); updDrive(); updBanners();
  if (S.pg === 'sense') updSense();
  if (S.pg === 'calib') updCalib();
  if (S.pg === 'cards') updLockCard();
}
function showWelcome(who) {
  $('#welcomeWho').textContent = who || '';
  const w = $('#welcome'); w.classList.remove('on'); void w.offsetWidth; w.classList.add('on');
  vib(120);
}
