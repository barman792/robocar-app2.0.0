
/* ===================================================================
   SETTINGS ROWS (generic: every row talks to the car with  W,key,value )
   =================================================================== */
const META = {
  spd: { l: 'حداکثر سرعت', min: 15, max: 100, u: '%' },
  minPwm: { l: 'حداقل توان برای شروع حرکت', h: 'اگر در سرعت کم ماشین نمی‌چرخد، این را بیشتر کنید.', min: 30, max: 140 },
  slew: { l: 'شتاب (نرمی استارت)', h: 'پایین‌تر = نرم‌تر و کم‌فشارتر برای باتری و برد؛ بالاتر = تندتر.', min: 6, max: 60 },
  turnMix: { l: 'شدت فرمان', min: 30, max: 100, u: '%' },
  brake: { l: 'ترمز فعال هنگام توقف', t: 'sw' },
  kp: { l: 'قدرت «مستقیم‌رو» با ژیرو', h: 'بالاتر = سریع‌تر خودش را صاف می‌کند؛ اگر ماشین موج می‌اندازد کمتر کنید.', min: 0, max: 40, div: 10, dec: 1 },
  mLi: { l: 'جهت چرخ چپ معکوس', h: 'با «جلو» اگر چرخ چپ عقب می‌رود روشن کنید.', t: 'sw' },
  mRi: { l: 'جهت چرخ راست معکوس', h: 'با «جلو» اگر چرخ راست عقب می‌رود روشن کنید.', t: 'sw' },
  swap: { l: 'جابجایی کانال چپ و راست', h: 'اگر سیم موتورها جابجا بسته شده و «چپ» باعث چرخیدن راست می‌شود.', t: 'sw' },
  bal: { l: 'تعادل چرخ‌ها', h: 'اگر ماشین به راست کج می‌رود عدد را منفی کنید (چرخ چپ ضعیف‌تر)، اگر به چپ کج می‌رود مثبت.', min: -30, max: 30, u: '%' },
  obs: { l: 'حفاظت مانع جلو', h: 'جلوی برخورد را می‌گیرد.', t: 'sw' },
  obsStop: { l: 'فاصله‌ی توقف', min: 50, max: 500, u: 'mm' },
  obsSlow: { l: 'فاصله‌ی کم‌کردن سرعت', min: 150, max: 1500, u: 'mm' },
  edge: { l: 'حفاظت لبه (جلوگیری از سقوط)', t: 'sw' },
  tip: { l: 'زاویه‌ی واژگونی', h: 'بیشتر از این شیب، موتورها قطع می‌شوند.', min: 20, max: 80, u: '°' },
  bLow: { l: 'هشدار باتری ضعیف', min: 3500, max: 6000, div: 1000, dec: 2, u: 'V' },
  bCut: { l: 'قطع موتورها (باتری خالی)', h: 'زیر این ولتاژ (۳ ثانیه) موتورها خاموش می‌شوند تا برد ریست نشود.', min: 3000, max: 5500, div: 1000, dec: 2, u: 'V' },
  autoSpd: { l: 'سرعت حالت‌های خودکار', min: 20, max: 100, u: '%' },
  autoObs: { l: 'فاصله‌ی دور زدن در حالت گشت', min: 150, max: 800, u: 'mm' },
  lights: { l: 'چراغ‌ها', t: 'seg', o: ['خاموش', 'روشن', 'خودکار'] },
  head: { l: 'روشنایی چراغ جلو', min: 10, max: 255 },
  tailRun: { l: 'روشنایی چراغ عقب (شب)', min: 0, max: 255 },
  ldrOn: { l: 'روشن‌شدن چراغ خودکار زیر', h: 'با کالیبراسیون نور هم تنظیم می‌شود.', min: 100, max: 3500 },
  ldrOff: { l: 'خاموش‌شدن چراغ خودکار بالای', min: 200, max: 4000 },
  mute: { l: 'بی‌صدا (بوق‌های جانبی)', h: 'بوق دستی، دزدگیر و هشدارهای مهم همیشه کار می‌کنند.', t: 'sw' },
  park: { l: 'بوق پارک نزدیک مانع', t: 'sw' },
  autoLock: { l: 'قفل خودکار بعد از بی‌کاری', h: 'ماشین بعد از این مدت بدون رانندگی خودش خاموش می‌شود.', min: 0, max: 120, fmt: v => v ? v + ' دقیقه' : 'هرگز' },
  cardTog: { l: 'نشان‌دادن دوباره‌ی کارت = خاموش‌کردن', h: 'فقط وقتی ماشین ایستاده است.', t: 'sw' },
  alarm: { l: 'دزدگیر (وقتی خاموش است)', h: 'اگر ماشین خاموش را جابه‌جا کنند یا بردارند، بوق و چراغ فعال می‌شود. با کارت خاموش می‌شود.', t: 'sw' },
  alarmSns: { l: 'حساسیت دزدگیر', min: 1, max: 10 },
  sInv: { l: 'جهت سروو رادار معکوس', h: 'اگر رادار چپ و راست را برعکس نشان می‌دهد.', t: 'sw' },
  sTrim: { l: 'تنظیم مرکز سروو', h: 'تا سنسور دقیقاً به جلو نگاه کند.', min: -300, max: 300, u: 'µs' },
  yInv: { l: 'جهت چرخش (yaw) معکوس', h: 'ماشین را با دست به راست بچرخانید: «جهت» باید زیاد شود. اگر کم شد این را روشن کنید.', t: 'sw' },
  pInv: { l: 'شیب جلو/عقب (pitch) معکوس', h: 'جلوی ماشین را بالا ببرید: pitch باید مثبت شود.', t: 'sw' },
  rInv: { l: 'شیب چپ/راست (roll) معکوس', h: 'سمت راست را پایین ببرید: roll باید مثبت شود.', t: 'sw' }
};
function metaVal(k, v) { const m = META[k]; if (m.fmt) return m.fmt(v); const x = m.div ? (v / m.div).toFixed(m.dec || 0) : v; return x + (m.u ? ' ' + m.u : ''); }
function rowHTML(k) {
  const m = META[k], lab = '<div class="lbl">' + m.l + (m.h ? '<small>' + m.h + '</small>' : '') + '</div>';
  if (m.t === 'sw') return '<div class="row">' + lab + '<label class="sw"><input type="checkbox" data-k="' + k + '"><i></i></label></div>';
  if (m.t === 'seg') return '<div class="row">' + lab + '<div class="seg" data-k="' + k + '">' + m.o.map((o, i) => '<button data-sv="' + i + '">' + o + '</button>').join('') + '</div></div>';
  return '<div class="row rg">' + lab + '<input type="range" data-k="' + k + '" min="' + m.min + '" max="' + m.max + '" step="1"><span class="val" data-v="' + k + '">–</span></div>';
}
const rows = ks => ks.map(rowHTML).join('');
const sendTimers = {};
function sendCfg(k, v) {
  S.C[k] = v;
  clearTimeout(sendTimers[k]);
  sendTimers[k] = setTimeout(() => send('W,' + k + ',' + v), 60);
}
function updSettingsValues() {
  $$('[data-k]').forEach(el => {
    const k = el.dataset.k, v = S.C[k]; if (v == null) return;
    if (el.type === 'checkbox') el.checked = !!v;
    else if (el.type === 'range') { if (!el._drag) { el.value = v; setRange(el); } const lab = $('[data-v="' + k + '"]'); if (lab) lab.textContent = metaVal(k, +el.value); }
    else if (el.classList.contains('seg')) $$('button', el).forEach(b => b.classList.toggle('on', +b.dataset.sv === v));
  });
  const sr = $('#spdRange'); if (sr && !sr._drag && S.C.spd != null) { sr.value = S.C.spd; setRange(sr); $('#spdVal').textContent = S.C.spd + '%'; }
}
document.addEventListener('input', e => {
  const el = e.target; if (!el.dataset || !el.dataset.k || el.type !== 'range') return;
  setRange(el); const lab = $('[data-v="' + el.dataset.k + '"]'); if (lab) lab.textContent = metaVal(el.dataset.k, +el.value);
  sendCfg(el.dataset.k, +el.value);
});
document.addEventListener('change', e => { const el = e.target; if (el.dataset && el.dataset.k && el.type === 'checkbox') { sendCfg(el.dataset.k, el.checked ? 1 : 0); vib(10); } });
document.addEventListener('click', e => {
  const b = e.target.closest('.seg[data-k] button'); if (!b) return;
  const seg = b.parentNode; sendCfg(seg.dataset.k, +b.dataset.sv); $$('button', seg).forEach(x => x.classList.toggle('on', x === b)); vib(10);
});
['pointerdown', 'touchstart'].forEach(n => document.addEventListener(n, e => { if (e.target.type === 'range') e.target._drag = true; }, true));
['pointerup', 'pointercancel', 'touchend'].forEach(n => document.addEventListener(n, () => { $$('input[type=range]').forEach(x => x._drag = false); }, true));

/* ===================================================================
   PAGES
   =================================================================== */
const BUILT = {};
const BUILD = { sense: buildSense, radar: buildRadar, cards: buildCards, calib: buildCalib, set: buildSettings, log: renderLog };
function go(pg) {
  if (!BUILT[pg] && BUILD[pg]) { BUILD[pg](); BUILT[pg] = true; }
  S.pg = pg;
  $$('.page').forEach(p => p.classList.toggle('on', p.id === 'pg-' + pg));
  $$('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.pg === pg));
  if (pg === 'cards') renderCards();
  if (pg === 'set') buildSettings();
  if (pg === 'log') { send('LG'); renderLog(); }
  if (pg === 'sense') updSense();
  updSettingsValues();
}
window.__back = function () { if (modalOpen()) { closeModal(); return true; } if (S.pg !== 'drive') { go('drive'); return true; } return false; };

/* ---------------- sensors ---------------- */
function buildSense() {
  $('#pg-sense').innerHTML = '<div class="grid">' +
    '<div class="card"><h3>🔋 باتری <small id="sBatS"></small></h3><div class="kv"><span>ولتاژ</span><span id="sBat">--</span><span>درصد</span><span id="sPct">--</span><span>وضعیت</span><span id="sBatSt">--</span></div><div class="bar" style="margin:8px 0"><i id="sBatBar"></i></div><canvas id="cvHist" style="width:100%;height:80px"></canvas><div class="hint">نمودار ولتاژ (۱ دقیقه‌ی اخیر)</div></div>' +
    '<div class="card"><h3>🧭 وضعیت ماشین</h3><div style="display:flex;gap:8px;justify-content:space-around"><canvas id="cvHor" style="width:46%;aspect-ratio:1"></canvas><canvas id="cvCmp" style="width:46%;aspect-ratio:1"></canvas></div><div class="kv" style="margin-top:8px"><span>شیب جلو/عقب (pitch)</span><span id="sPt">--</span><span>شیب چپ/راست (roll)</span><span id="sRl">--</span><span>جهت نسبی (از لحظه‌ی صفر)</span><span id="sHd">--</span><span>سرعت چرخش</span><span id="sYr">--</span><span>دمای ژیرو</span><span id="sTmp">--</span></div></div>' +
    '<div class="card"><h3>📏 فاصله، لبه، نور</h3><div class="kv"><span>فاصله‌ی جلو</span><span id="sD">--</span><span>زاویه‌ی سروو</span><span id="sSrv">--</span><span>نور محیط (LDR)</span><span id="sLdr">--</span><span>چراغ‌ها</span><span id="sLn">--</span></div>' +
    '<div class="hint" style="margin-top:8px">سنسور لبه‌ی چپ <span id="sEL"></span></div><div class="bar"><i id="bEL"></i><u id="bELt"></u></div>' +
    '<div class="hint" style="margin-top:8px">سنسور لبه‌ی راست <span id="sER"></span></div><div class="bar"><i id="bER"></i><u id="bERt"></u></div><div class="hint">خط سفید = آستانه؛ بالاتر یعنی «زمین نیست».</div></div>' +
    '<div class="card"><h3>⚙️ موتورها</h3><div class="hint">چپ</div><div class="bar"><i id="mL"></i></div><div class="hint" style="margin-top:6px">راست</div><div class="bar"><i id="mR"></i></div><div class="kv" style="margin-top:8px"><span>حالت</span><span id="sMode">--</span><span>سرعت حداکثر</span><span id="sMx">--</span><span>حفاظت مانع / لبه</span><span id="sGuards">--</span></div></div>' +
    '<div class="card"><h3>🩺 سلامت سخت‌افزار</h3><div id="sHealth" class="btns" style="gap:6px"></div><div class="kv" style="margin-top:10px"><span>تعداد گوشی‌های وصل</span><span id="sStn">--</span><span>حافظه‌ی آزاد</span><span id="sHp">--</span><span>روشن‌بودن برد</span><span id="sUp">--</span><span>نسخه‌ی فریم‌ور / اپ</span><span id="sFw">--</span><span>پینگ</span><span id="sPing">--</span></div></div>' +
    '</div>';
}
function updSense() {
  if (!BUILT.sense) return;
  const T = S.T, set = (id, v) => { const e = $('#' + id); if (e && e.textContent !== String(v)) e.textContent = v; };
  if (T.bat == null) return;
  set('sBat', T.bat.toFixed(2) + ' V'); set('sPct', T.pct + ' %');
  set('sBatSt', T.cut ? 'خالی ⛔' : T.lowb ? 'ضعیف ⚠️' : 'خوب ✅');
  const bb = $('#sBatBar'); bb.style.width = T.pct + '%'; bb.style.background = T.pct < 15 ? 'var(--bad)' : T.pct < 35 ? 'var(--acc)' : 'linear-gradient(90deg,var(--acc2),var(--ok))';
  set('sPt', T.pt.toFixed(1) + '°'); set('sRl', T.rl.toFixed(1) + '°'); set('sHd', Math.round(T.hd) + '°'); set('sYr', T.yr.toFixed(1) + '°/s'); set('sTmp', T.tmp.toFixed(1) + ' °C');
  set('sD', T.d >= 2000 ? 'بیش از ۲۰۰ cm' : (T.d / 10).toFixed(1) + ' cm'); set('sSrv', T.srv + '°'); set('sLdr', T.ldr); set('sLn', T.ln ? 'روشن' : 'خاموش');
  set('sEL', T.rL + (T.eL ? ' ⛔ لبه' : '')); set('sER', T.rR + (T.eR ? ' ⛔ لبه' : ''));
  $('#bEL').style.width = (T.rL / 4095 * 100) + '%'; $('#bELt').style.left = (T.tL / 4095 * 100) + '%';
  $('#bER').style.width = (T.rR / 4095 * 100) + '%'; $('#bERt').style.left = (T.tR / 4095 * 100) + '%';
  $('#bEL').style.background = T.eL ? 'var(--bad)' : ''; $('#bER').style.background = T.eR ? 'var(--bad)' : '';
  const mb = (id, v) => { const e = $('#' + id); e.style.width = Math.abs(v) / 255 * 100 + '%'; e.style.background = v < 0 ? 'var(--acc)' : ''; };
  mb('mL', T.ml); mb('mR', T.mr);
  set('sMode', MODES[T.mode | 0] ? MODES[T.mode | 0][1] : T.mode); set('sMx', T.mx + '%'); set('sGuards', (T.og ? 'مانع ✓' : 'مانع ✗') + ' / ' + (T.eg ? 'لبه ✓' : 'لبه ✗'));
  const hl = [['MPU6050 (ژیرو)', T.mpu], ['VL53L0X (فاصله)', T.tof], ['RC522 (کارت)', T.rf]];
  const hh = hl.map(x => '<span class="tag ' + (x[1] ? 'ok' : 'bad') + '">' + x[0] + (x[1] ? ' ✓' : ' ✗') + '</span>').join('');
  const h = $('#sHealth'); if (h._h !== hh) { h.innerHTML = hh; h._h = hh; }
  set('sStn', T.stn); set('sHp', T.hp + ' KB'); set('sUp', fmtUp(T.up)); set('sFw', (S.info.fw || '?') + ' / ' + APP_VER); set('sPing', S.demo ? 'نمایشی' : (S.ping ? S.ping + ' ms' : '--'));
}
function drawHorizon(cv) {
  const { g, w, h } = fit(cv); g.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 3, T = S.T, pt = T.pt || 0, rl = T.rl || 0;
  g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 7); g.clip(); g.translate(cx, cy); g.rotate(-rl * Math.PI / 180);
  const off = clamp(pt, -45, 45) / 45 * r;
  g.fillStyle = '#2a6db0'; g.fillRect(-r * 2, -r * 3 + off, r * 4, r * 3);
  g.fillStyle = '#7a5230'; g.fillRect(-r * 2, off, r * 4, r * 3);
  g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.moveTo(-r * 2, off); g.lineTo(r * 2, off); g.stroke();
  g.lineWidth = 1; g.fillStyle = '#fff'; g.font = '10px sans-serif'; g.textAlign = 'center';
  for (let a = -30; a <= 30; a += 10) { if (!a) continue; const y = off - a / 45 * r; g.beginPath(); g.moveTo(-r * .22, y); g.lineTo(r * .22, y); g.stroke(); }
  g.restore();
  g.strokeStyle = '#ffb21a'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - r * .55, cy); g.lineTo(cx - r * .15, cy); g.lineTo(cx, cy + 6); g.lineTo(cx + r * .15, cy); g.lineTo(cx + r * .55, cy); g.stroke();
  g.strokeStyle = '#2b3c57'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.stroke();
}
function drawCompass(cv) {
  const { g, w, h } = fit(cv); g.clearRect(0, 0, w, h);
  const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 3, hd = (S.T.hd || 0) * Math.PI / 180;
  g.fillStyle = '#0b121b'; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); g.strokeStyle = '#2b3c57'; g.lineWidth = 3; g.stroke();
  g.strokeStyle = '#4a6286'; g.lineWidth = 1;
  for (let a = 0; a < 360; a += 30) { const x = Math.sin(a * Math.PI / 180), y = -Math.cos(a * Math.PI / 180); g.beginPath(); g.moveTo(cx + x * r * .86, cy + y * r * .86); g.lineTo(cx + x * r * .98, cy + y * r * .98); g.stroke(); }
  g.fillStyle = '#6f84a3'; g.font = '11px sans-serif'; g.textAlign = 'center'; g.fillText('شروع', cx, cy - r * .7);
  g.save(); g.translate(cx, cy); g.rotate(hd); g.fillStyle = '#ffb21a'; g.beginPath(); g.moveTo(0, -r * .62); g.lineTo(r * .2, r * .3); g.lineTo(0, r * .15); g.lineTo(-r * .2, r * .3); g.closePath(); g.fill(); g.restore();
}
function drawHist(cv) {
  const { g, w, h } = fit(cv); g.clearRect(0, 0, w, h);
  const a = S.hist.bat; if (a.length < 2) return;
  const lo = Math.min(4.2, ...a) - .05, hi = Math.max(5.6, ...a) + .05;
  g.strokeStyle = '#25344b'; g.lineWidth = 1;
  [4.3, 4.7, 5.2].forEach(v => { const y = h - (v - lo) / (hi - lo) * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); });
  g.strokeStyle = '#4cc9f0'; g.lineWidth = 2; g.beginPath();
  a.forEach((v, i) => { const x = i / 119 * w, y = h - (v - lo) / (hi - lo) * h; if (i) g.lineTo(x, y); else g.moveTo(x, y); }); g.stroke();
}

/* ---------------- radar page ---------------- */
function buildRadar() {
  $('#pg-radar').innerHTML = '<div class="grid">' +
    '<div class="card"><h3>📡 رادار زنده <small>برد <select id="rRange" style="background:#0b121b;border:1px solid var(--line);border-radius:8px;padding:2px 6px"><option value="1000">۱ متر</option><option value="1500" selected>۱٫۵ متر</option><option value="2000">۲ متر</option></select></small></h3>' +
    '<canvas id="cvRadar" style="width:100%;height:min(46vh,340px)"></canvas><div class="btns" style="margin-top:8px"><button class="btn pri" id="rToggle">▶ روشن/خاموش رادار</button><button class="btn" id="rClear">پاک کردن</button></div><p class="hint">سنسور فاصله روی بازوی سروو است و ۱۲۰ درجه‌ی جلوی ماشین را جاروب می‌کند. رنگ قرمز = خیلی نزدیک.</p></div>' +
    '<div class="card"><h3>🔄 نقشه‌ی ۳۶۰ درجه</h3><canvas id="cvMap" style="width:100%;height:min(60vh,440px)"></canvas><div class="btns" style="margin-top:8px"><button class="btn pri" id="mScan">🔄 شروع اسکن ۳۶۰°</button><button class="btn bad" id="mStop">■ توقف</button><button class="btn" id="mClear">پاک کردن</button></div><p class="hint">ماشین سه بار می‌ایستد، رادار را جاروب می‌کند و با ژیرو ۱۲۰ درجه می‌چرخد؛ نقشه‌ی دور تا دورش ساخته می‌شود. برای نتیجه‌ی بهتر ماشین را وسط اتاق بگذارید. (نیاز به ژیرو و سنسور فاصله)</p></div></div>';
  $('#rToggle').onclick = () => send('R,' + (S.T.rad ? 0 : 1));
  $('#rClear').onclick = () => R.pts.clear();
  $('#mScan').onclick = () => { if (S.T.lk) { toast('اول ماشین را روشن کنید', 'warn'); return; } R.sc = []; R.scBusy = true; send('M,5'); };
  $('#mStop').onclick = () => { send('M,0'); R.scBusy = false; };
  $('#mClear').onclick = () => { R.sc = []; };
}

/* ---------------- RFID cards page ---------------- */
function buildCards() {
  $('#pg-cards').innerHTML = '<div class="grid">' +
    '<div class="card" id="lockCard"></div>' +
    '<div class="card"><h3>💳 کارت‌های مجاز <small id="cCount"></small></h3><div id="cardList"></div><div class="btns"><button class="btn pri" id="cAdd">➕ افزودن کارت جدید</button></div><p class="hint" style="margin-top:8px">برای افزودن یا حذف کارت، رمز مدیر لازم است. با این رمز، کارت‌ها در حافظه‌ی خود ماشین ذخیره می‌شوند و بعد از خاموش‌شدن هم می‌مانند.</p></div>' +
    '<div class="card"><h3>🛡 امنیت و رفتار قفل</h3>' + rows(['autoLock', 'cardTog', 'alarm', 'alarmSns']) + '<div class="row"><div class="lbl">رمز مدیر<small>برای کارت‌ها، وای‌فای و بروزرسانی لازم است.</small></div><button class="btn sm" id="cPw">تغییر رمز</button></div><div class="row"><div class="lbl">حذف همه‌ی کارت‌ها<small>بعد از حذف، تا ثبت کارت جدید هر کارتی ماشین را روشن می‌کند.</small></div><button class="btn sm bad" id="cDelAll">حذف همه</button></div></div></div>';
  $('#cAdd').onclick = addCardFlow;
  $('#cPw').onclick = changePwFlow;
  $('#cDelAll').onclick = async () => { if (!S.cards.length) { toast('کارتی ثبت نشده', 'warn'); return; } if (await confirmBox('حذف همه‌ی کارت‌ها؟', 'همه‌ی کارت‌های ثبت‌شده پاک می‌شوند.', 'حذف همه', true) && await ensureAdmin('حذف همه‌ی کارت‌ها')) send('CA'); };
  updSettingsValues();
}
function renderCards() {
  if (!BUILT.cards) return;
  const l = $('#cardList'), n = S.cards.length;
  $('#cCount').textContent = n + ' از ' + (S.info.max || 16);
  l.innerHTML = n ? S.cards.map(c => '<div class="cardItem"><div class="ic">💳</div><div class="nm"><b>' + esc(c.n) + '</b><small>' + esc(c.u) + ' · ' + c.c + ' بار استفاده</small></div><button class="btn sm" data-ren="' + c.i + '">✏️</button><button class="btn sm bad" data-del="' + c.i + '">🗑</button></div>').join('')
    : '<p class="hint">هیچ کارتی ثبت نشده.' + (S.open ? ' <b style="color:var(--acc)">تا کارت ثبت نکنید، هر کارتی ماشین را روشن می‌کند.</b>' : '') + '</p>';
  $$('[data-ren]', l).forEach(b => b.onclick = async () => {
    const c = S.cards.find(x => x.i === +b.dataset.ren); if (!c) return;
    const nm = await askText('تغییر نام کارت', 'نام جدید', { value: c.n, rtl: true, max: 22 }); if (nm === null || !cleanName(nm)) return;
    if (await ensureAdmin('تغییر نام کارت')) send('CR,' + c.i + ',' + cleanName(nm));
  });
  $$('[data-del]', l).forEach(b => b.onclick = async () => {
    const c = S.cards.find(x => x.i === +b.dataset.del); if (!c) return;
    if (await confirmBox('حذف کارت «' + esc(c.n) + '»؟', 'این کارت دیگر ماشین را روشن نمی‌کند.', 'حذف', true) && await ensureAdmin('حذف کارت')) send('CD,' + c.i);
  });
  updLockCard();
}
function updLockCard() {
  const el = $('#lockCard'); if (!el) return;
  const T = S.T, up = connected(), locked = up && T.lk === 1;
  const st = !up ? '<span class="tag bad">به ماشین وصل نیستید</span>' : locked ? '<span class="tag warn">🔒 ماشین خاموش</span>' : '<span class="tag ok">🟢 ماشین روشن' + (T.who ? ' · ' + esc(T.who) : '') + '</span>';
  const h = '<h3>🔑 وضعیت قفل</h3><div style="margin-bottom:8px">' + st + (up && !T.rf ? ' <span class="tag bad">ماژول RFID پیدا نشد</span>' : '') + (adminActive() ? ' <span class="tag ok">مدیر وارد شده</span>' : '') + '</div>' +
    '<div class="btns">' + (locked ? '<button class="btn pri" data-act="unlockPw">🔑 روشن با رمز</button>' : '<button class="btn" data-act="lockNow"' + (up ? '' : ' disabled') + '>🔒 خاموش/قفل کن</button>') + '<button class="btn" data-act="find"' + (up ? '' : ' disabled') + '>📍 پیدا کردن ماشین</button></div>' +
    '<p class="hint" style="margin-top:8px">ماشین بعد از هر بار روشن‌شدن برق قفل است. کارت ثبت‌شده را نزدیک ماژول RFID بگیرید تا چراغ‌ها چشمک بزنند و ماشین روشن شود.</p>';
  if (el._h !== h) { el.innerHTML = h; el._h = h; }
}
function refreshAdminUI() { const e = $('#lockCard'); if (e) { e._h = ''; updLockCard(); } }
function updCardOpts() { }
async function addCardFlow() {
  if (S.cards.length >= (S.info.max || 16)) { toast('ظرفیت کارت‌ها پر است', 'warn'); return; }
  if (S.T.rf === 0) { toast('ماژول RFID پیدا نشد؛ سیم‌کشی RC522 را بررسی کنید', 'bad'); return; }
  const nm = await askText('نام کارت', 'یک نام برای این کارت (مثلاً «کارت علی»)', { value: 'کارت ' + (S.cards.length + 1), rtl: true, max: 22 });
  if (nm === null) return;
  if (!(await ensureAdmin('برای ثبت کارت جدید رمز مدیر را وارد کنید.'))) return;
  pending.enr = { name: cleanName(nm) };
  send('CE,' + cleanName(nm));
}
let enrTimer = null;
function onEnr(o) {
  const stop = () => { clearInterval(enrTimer); enrTimer = null; };
  if (o.s === 'wait') {
    if (!pending.enr) return;                       // another phone started it
    let left = 25;
    modal('<div style="text-align:center"><div class="cardAnim">💳</div><h3 style="margin:6px 0">کارت را روی ماژول RFID بگیرید</h3><p class="hint">زیر ماشین، جلوی ماژول RC522. کارت را ثابت نگه دارید تا بوق بزند.</p><h2 id="enrLeft" style="margin:6px 0;color:var(--acc)">25</h2><button class="btn bad" id="enrX">انصراف</button></div>');
    $('#enrX').onclick = () => { send('CX'); stop(); closeModal(); };
    stop(); enrTimer = setInterval(() => { left--; const e = $('#enrLeft'); if (e) e.textContent = left; if (left <= 0) stop(); }, 1000);
    return;
  }
  stop(); const mine = !!pending.enr; pending.enr = null;
  if (modalOpen() && $('#enrLeft')) closeModal();
  if (!mine && o.s !== 'ok') return;
  if (o.s === 'ok') { toast('✅ کارت ثبت شد', 'ok'); vib(100); }
  else if (o.s === 'dup') toast('این کارت قبلاً ثبت شده', 'warn');
  else if (o.s === 'full') toast('ظرفیت کارت‌ها پر است', 'bad');
  else if (o.s === 'timeout') toast('زمان تمام شد؛ کارتی نشان داده نشد', 'warn');
  else if (o.s === 'norfid') toast('ماژول RFID پیدا نشد', 'bad');
  else if (o.s === 'cancel') toast('انصراف داده شد', '');
}
async function changePwFlow() {
  if (!(await ensureAdmin('برای تغییر رمز، رمز فعلی را وارد کنید.'))) return;
  const a = await askText('رمز مدیر جدید', 'حداقل ۶ و حداکثر ۳۲ نویسه، بدون فاصله', { password: true, max: 32 });
  if (a === null) return;
  if (a.length < 6 || /\s/.test(a)) { toast('رمز باید حداقل ۶ نویسه و بدون فاصله باشد', 'bad'); return; }
  const b = await askText('تکرار رمز جدید', 'رمز را دوباره بنویسید', { password: true, max: 32 });
  if (b !== a) { toast('دو رمز یکی نیستند', 'bad'); return; }
  send('PW,' + a);
}

/* ---------------- calibration page ---------------- */
function buildCalib() {
  const step = a => '<ol class="steps">' + a.map(x => '<li>' + x + '</li>').join('') + '</ol>';
  $('#pg-calib').innerHTML = '<div class="grid">' +
    '<div class="card"><h3>🧭 ژیروسکوپ (MPU6050)</h3>' + step(['ماشین را روی یک سطح صاف و ثابت بگذارید (دست نزنید).', 'دکمه را بزنید و حدود ۲ ثانیه صبر کنید.']) +
    '<div class="kv"><span>سرعت چرخش فعلی</span><span id="cYr">--</span><span>جهت نسبی</span><span id="cHd">--</span></div><p class="hint">سرعت چرخش وقتی ماشین ثابت است باید نزدیک ۰٫۰ باشد. هر وقت جهت‌ها آرام‌آرام می‌خزند (drift)، دوباره کالیبره کنید. در هر لحظه می‌توانید این کار را بکنید.</p>' +
    '<div class="btns"><button class="btn pri" data-cal="2" id="bGyro">🧭 کالیبره‌ی ژیرو</button><button class="btn" id="bZero">⟲ صفر کردن جهت</button></div><div class="res" id="res_gyro"></div></div>' +
    '<div class="card"><h3>📐 تراز افقی (شیب)</h3>' + step(['ماشین را روی سطحی که صاف می‌دانید بگذارید.', 'دکمه را بزنید؛ شیب فعلی به‌عنوان «صفر» ثبت می‌شود.']) +
    '<div class="kv"><span>شیب جلو/عقب</span><span id="cPt">--</span><span>شیب چپ/راست</span><span id="cRl">--</span></div>' + rows(['yInv', 'pInv', 'rInv']) +
    '<div class="btns"><button class="btn pri" data-cal="3" id="bLevel">📐 ثبت تراز</button></div><div class="res" id="res_level"></div></div>' +
    '<div class="card"><h3>🛤 سنسور لبه (جلوگیری از سقوط)</h3>' + step(['ماشین را با هر دو سنسور روی کفِ معمولی بگذارید.', 'دکمه را بزنید (حدود نیم ثانیه).', 'برای تست: ماشین را به لبه‌ی میز ببرید؛ باید «لبه» نشان بدهد.']) +
    '<div class="kv"><span>چپ (مقدار / آستانه)</span><span id="cEL">--</span><span>راست (مقدار / آستانه)</span><span id="cER">--</span></div><div class="btns" style="margin-top:8px"><button class="btn pri" data-cal="1" id="bEdge">🛤 کالیبره‌ی لبه</button></div><div class="res" id="res_edge"></div></div>' +
    '<div class="card"><h3>💡 سنسور نور (چراغ خودکار)</h3>' + step(['ماشین را جایی بگذارید که «تاریک به‌حساب بیاید».', 'دکمه را بزنید؛ از این روشنایی به پایین چراغ‌ها خودکار روشن می‌شوند.']) +
    '<div class="kv"><span>نور فعلی</span><span id="cLdr">--</span></div>' + rows(['ldrOn', 'ldrOff']) + '<div class="btns"><button class="btn pri" data-cal="4" id="bLight">💡 اینجا تاریک است</button></div><div class="res" id="res_light"></div></div>' +
    '<div class="card"><h3>🔋 ولتاژ باتری</h3>' + step(['ولتاژ دو سر پک باتری را با مولتی‌متر اندازه بگیرید.', 'عدد را بنویسید و دکمه را بزنید.']) +
    '<div class="kv"><span>ماشین نشان می‌دهد</span><span id="cBat">--</span></div><div style="display:flex;gap:8px;margin-top:8px"><input type="number" id="batIn" step="0.01" min="3" max="8.4" placeholder="مثلاً 5.02" style="flex:1"><button class="btn pri" id="bBat">ثبت</button></div><div class="res" id="res_battery"></div></div>' +
    '<div class="card"><h3>📡 سروو و رادار</h3>' + rows(['sTrim', 'sInv']) + '<div class="btns"><button class="btn" id="bRadarT">📡 تست رادار</button></div><p class="hint">مرکز را طوری تنظیم کنید که سنسور دقیقاً به جلو نگاه کند (خط آبی رادار عمودی شود).</p></div>' +
    '<div class="card"><h3>⚙️ موتورها و جهت‌ها</h3><p class="hint" style="margin-top:0"><b style="color:var(--bad)">چرخ‌ها را از زمین بلند کنید</b> (ماشین را روی یک جعبه بگذارید). هر دکمه فقط ۰٫۷ ثانیه چرخ را می‌چرخاند. ماشین باید روشن باشد.</p><div class="btns"><button class="btn" data-t="0,40">چپ ← جلو</button><button class="btn" data-t="0,-40">چپ ← عقب</button><button class="btn" data-t="1,40">راست ← جلو</button><button class="btn" data-t="1,-40">راست ← عقب</button></div>' +
    rows(['mLi', 'mRi', 'swap', 'bal']) + '</div></div>';
  $$('[data-cal]').forEach(b => b.onclick = () => { if (!connected()) { toast('به ماشین وصل نیستید', 'warn'); return; } const r = $('#res_' + ({ 2: 'gyro', 3: 'level', 1: 'edge', 4: 'light' }[b.dataset.cal])); if (r) { r.className = 'res on'; r.innerHTML = '<span class="spin"></span>در حال کالیبراسیون… ماشین را تکان ندهید'; } send('C,' + b.dataset.cal); });
  $('#bZero').onclick = () => { send('Z'); toast('جهت صفر شد', 'ok', 1500); };
  $('#bBat').onclick = () => { const v = parseFloat($('#batIn').value); if (!(v >= 3 && v <= 8.4)) { toast('عددی بین ۳ تا ۸٫۴ بنویسید', 'warn'); return; } send('BC,' + v.toFixed(2)); };
  $('#bRadarT').onclick = () => { send('R,1'); setTimeout(() => send('R,0'), 6000); toast('رادار ۶ ثانیه روشن است', '', 2000); };
  $$('[data-t]').forEach(b => b.onclick = () => { if (S.T.lk) { toast('اول ماشین را روشن کنید', 'warn'); return; } send('T,' + b.dataset.t); });
  updSettingsValues();
}
function updCalib() {
  const T = S.T, set = (id, v) => { const e = $('#' + id); if (e) e.textContent = v; };
  if (!BUILT.calib || T.bat == null) return;
  set('cYr', T.yr.toFixed(2) + ' °/s'); set('cHd', T.hd.toFixed(1) + '°'); set('cPt', T.pt.toFixed(1) + '°'); set('cRl', T.rl.toFixed(1) + '°');
  set('cEL', T.rL + ' / ' + T.tL); set('cER', T.rR + ' / ' + T.tR); set('cLdr', T.ldr); set('cBat', T.bat.toFixed(2) + ' V');
}
function onCal(o) {
  const r = $('#res_' + o.k);
  const show = (ok, t) => { if (r) { r.className = 'res on ' + (ok ? 'ok' : 'bad'); r.innerHTML = t; } toast(t.replace(/<[^>]+>/g, ''), ok ? 'ok' : 'bad', 4200); };
  if (o.k === 'gyro') show(o.ok, o.ok ? '✔ ژیرو کالیبره شد (بایاس ' + o.v.toFixed(2) + '، نویز ' + o.n.toFixed(2) + ')' : '✘ ناموفق: ماشین حرکت کرد یا لرزید (نویز ' + o.n.toFixed(2) + '). دوباره و روی سطح ثابت امتحان کنید.');
  else if (o.k === 'level') show(o.ok, o.ok ? '✔ تراز ثبت شد (pitch ' + o.v.toFixed(1) + '°، roll ' + o.n.toFixed(1) + '° صفر شد)' : '✘ ناموفق: ماشین ثابت نبود یا بیش‌ازحد کج بود.');
  else if (o.k === 'edge') show(o.ok, o.ok ? '✔ کف: چپ ' + Math.round(o.v) + '، راست ' + Math.round(o.n) + ' — آستانه‌ها ثبت شد' : '⚠ ثبت شد، ولی کف خیلی تیره/دور است (' + Math.round(o.v) + ' / ' + Math.round(o.n) + '). سنسورها را نزدیک‌تر (۲ تا ۶ میلی‌متر) به زمین ببرید.');
  else if (o.k === 'light') show(true, '✔ آستانه‌ی نور ثبت شد (نور فعلی ' + Math.round(o.v) + ')');
  else if (o.k === 'battery') show(o.ok, o.ok ? '✔ ضریب باتری ' + o.n.toFixed(3) + ' ثبت شد؛ حالا ' + o.v.toFixed(2) + ' V' : '✘ عدد نامعتبر است');
}

/* ---------------- settings page ---------------- */
function buildSettings() {
  const I = S.info, cur = P.get('ctl', 'dual');
  $('#pg-set').innerHTML = '<div class="grid">' +
    '<div class="card"><h3>🎮 رانندگی</h3>' + rows(['spd', 'minPwm', 'slew', 'turnMix', 'brake', 'kp']) + '</div>' +
    '<div class="card"><h3>🛡 ایمنی</h3>' + rows(['obs', 'obsStop', 'obsSlow', 'edge', 'tip', 'bLow', 'bCut']) + '</div>' +
    '<div class="card"><h3>🤖 حالت‌های خودکار</h3>' + rows(['autoSpd', 'autoObs']) + '</div>' +
    '<div class="card"><h3>💡 چراغ و صدا</h3>' + rows(['lights', 'head', 'tailRun', 'mute', 'park']) + '<div class="btns" style="margin-top:8px"><button class="btn sm" data-b="1">🔔 تست بوق</button><button class="btn sm" data-b="2">🎵 ملودی روشن‌شدن</button><button class="btn sm" data-b="3">🚫 بوق رد</button></div></div>' +
    '<div class="card"><h3>📱 اپ</h3><div class="row"><div class="lbl">نوع کنترل<small>دو دسته: پدال گاز + فرمان · جوی‌استیک · شیب گوشی</small></div><div class="seg" id="ctlSeg">' + [['dual', 'دو دسته'], ['stick', 'جوی‌استیک'], ['tilt', 'شیب']].map(x => '<button data-c="' + x[0] + '" class="' + (cur === x[0] ? 'on' : '') + '">' + x[1] + '</button>').join('') + '</div></div>' +
    '<div class="row"><div class="lbl">لرزش لمسی</div><label class="sw"><input type="checkbox" id="pHaptic"' + (P.get('haptic', true) ? ' checked' : '') + '><i></i></label></div>' +
    '<div class="row"><div class="lbl">دسته‌ی بازی بلوتوثی<small>اگر وصل باشد خودکار شناخته می‌شود.</small></div><label class="sw"><input type="checkbox" id="pPad"' + (P.get('gamepad', true) ? ' checked' : '') + '><i></i></label></div>' +
    '<div class="row"><div class="lbl">روشن‌ماندن صفحه</div><label class="sw"><input type="checkbox" id="pAwake"' + (P.get('awake', true) ? ' checked' : '') + '><i></i></label></div>' +
    '<div class="row"><div class="lbl">زاویه‌ی کامل فرمان (حالت شیب)</div><input type="range" id="pTiltMax" min="10" max="60" value="' + P.get('tiltMax', 30) + '"><span class="val" id="pTiltV">' + P.get('tiltMax', 30) + '°</span></div>' +
    '<div class="row"><div class="lbl">برعکس‌کردن جهت شیب</div><label class="sw"><input type="checkbox" id="pTiltInv"' + (P.get('tiltInv', false) ? ' checked' : '') + '><i></i></label></div>' +
    '<div class="btns"><button class="btn sm" id="pTiltC">🎯 ثبت وضعیت فعلی گوشی به‌عنوان مرکز فرمان</button></div></div>' +
    '<div class="card"><h3>📶 اتصال و وای‌فای ماشین</h3>' +
    '<div class="row"><div class="lbl">آدرس ماشین<small>معمولاً ۱۹۲٫۱۶۸٫۴٫۱ — فقط داخل اپ اندروید</small></div><input type="text" id="pHost" value="' + esc(P.get('host', '192.168.4.1')) + '" style="max-width:160px"></div>' +
    '<div class="row"><div class="lbl">نام وای‌فای جدید</div><input type="text" id="wSsid" value="' + esc(I.ssid || '') + '" maxlength="31" style="max-width:180px"></div>' +
    '<div class="row"><div class="lbl">رمز وای‌فای جدید<small>۸ تا ۶۳ نویسه</small></div><input type="text" id="wPass" placeholder="رمز جدید" maxlength="63" style="max-width:180px"></div>' +
    '<div class="btns" style="margin-top:8px"><button class="btn pri" id="wSave">ذخیره و ری‌استارت ماشین</button><button class="btn" id="wOpen">📶 تنظیمات وای‌فای گوشی</button></div></div>' +
    '<div class="card"><h3>🛠 نگهداری</h3><div class="btns"><button class="btn" id="mUpd">⬆️ بروزرسانی فریم‌ور (از طریق مرورگر)</button><button class="btn" id="mRb">🔄 ری‌استارت ماشین</button><button class="btn" id="mPw">🔐 تغییر رمز مدیر</button><button class="btn bad" id="mFr">♻️ بازگشت به تنظیمات کارخانه</button></div>' +
    '<p class="hint" style="margin-top:8px">بروزرسانی: در Arduino IDE از «Sketch › Export Compiled Binary» فایل <b dir="ltr">RoboCar.ino.bin</b> را بسازید و در صفحه‌ی بازشده انتخاب کنید (رمز مدیر لازم است).</p></div>' +
    '<div class="card"><h3>ℹ️ درباره</h3><div class="kv"><span>نسخه‌ی اپ</span><span>' + APP_VER + '</span><span>نسخه‌ی فریم‌ور</span><span>' + esc(I.fw || '—') + '</span><span>MAC</span><span>' + esc(I.mac || '—') + '</span><span>کارت‌خوان</span><span>' + (I.rfid ? 'فعال' : '—') + '</span></div></div></div>';
  $$('[data-b]').forEach(b => b.onclick = () => send('B,' + b.dataset.b));
  $$('#ctlSeg button').forEach(b => b.onclick = () => { P.set('ctl', b.dataset.c); $$('#ctlSeg button').forEach(x => x.classList.toggle('on', x === b)); buildDrive(); });
  $('#pHaptic').onchange = e => P.set('haptic', e.target.checked);
  $('#pPad').onchange = e => P.set('gamepad', e.target.checked);
  $('#pAwake').onchange = e => { P.set('awake', e.target.checked); if (App && App.keepAwake) App.keepAwake(e.target.checked); };
  $('#pTiltMax').oninput = e => { P.set('tiltMax', +e.target.value); $('#pTiltV').textContent = e.target.value + '°'; setRange(e.target); };
  setRange($('#pTiltMax'));
  $('#pTiltInv').onchange = e => P.set('tiltInv', e.target.checked);
  $('#pTiltC').onclick = tiltCenter;
  $('#pHost').onchange = e => { P.set('host', e.target.value.trim() || '192.168.4.1'); Link.drop(); Link.connect(); toast('آدرس ذخیره شد', 'ok'); };
  $('#wOpen').onclick = openWifi;
  $('#wSave').onclick = async () => {
    const ss = cleanName($('#wSsid').value), pw = $('#wPass').value;
    if (!ss || ss.length > 31) { toast('نام وای‌فای معتبر نیست', 'bad'); return; }
    if (pw.length < 8 || pw.length > 63) { toast('رمز وای‌فای باید ۸ تا ۶۳ نویسه باشد', 'bad'); return; }
    if (!(await confirmBox('تغییر وای‌فای؟', 'ماشین ری‌استارت می‌شود و باید گوشی را به «' + esc(ss) + '» وصل کنید. نام و رمز جدید را حتماً یادداشت کنید.', 'ذخیره', false))) return;
    if (!(await ensureAdmin('تغییر نام و رمز وای‌فای'))) return;
    pending.wifi = [ss, pw]; send('WF,' + ss + ',' + pw);
  };
  $('#mUpd').onclick = () => { const u = 'http://' + Link.host() + '/update'; if (App && App.openUrl) App.openUrl(u); else window.open(u, '_blank'); };
  $('#mRb').onclick = async () => { if (await ensureAdmin('ری‌استارت ماشین')) send('RB'); };
  $('#mPw').onclick = changePwFlow;
  $('#mFr').onclick = async () => { if (await confirmBox('بازگشت به کارخانه؟', 'همه‌ی تنظیمات، کارت‌ها، رمز مدیر و وای‌فای پاک می‌شوند.', 'پاک کن', true) && await ensureAdmin('بازگشت به تنظیمات کارخانه')) send('FR'); };
  updSettingsValues();
}
function openWifi() { if (App && App.openWifi) App.openWifi(); else toast('وای‌فای گوشی را باز کنید و به RoboCar وصل شوید', 'warn'); }

/* ---------------- log page ---------------- */
function renderLog() {
  const el = $('#pg-log'); if (!el) return;
  if (!el._built) {
    el.innerHTML = '<div class="card"><h3>📜 گزارش رویدادها <small id="lgN"></small></h3><div class="btns" style="margin-bottom:8px"><button class="btn sm" id="lgCopy">📋 کپی</button><button class="btn sm" id="lgClr">پاک کردن</button></div><div id="lgList"></div></div>';
    $('#lgCopy').onclick = () => { const t = S.log.map(e => clock(e.sec) + '  ' + e.text).join('\n'); if (App && App.share) App.share(t); else if (navigator.clipboard) { navigator.clipboard.writeText(t); toast('کپی شد', 'ok', 1200); } };
    $('#lgClr').onclick = () => { S.log = []; renderLog(); };
    el._built = true;
  }
  const l = S.log.slice().reverse();
  $('#lgN').textContent = l.length + ' رویداد';
  $('#lgList').innerHTML = l.length ? l.map(e => '<div class="logrow ' + e.kind + '"><time>' + clock(e.sec) + '</time><span>' + esc(e.text) + '</span></div>').join('') : '<p class="hint">رویدادی ثبت نشده. (ساعت‌ها نسبت به روشن‌شدن ماشین است.)</p>';
}
