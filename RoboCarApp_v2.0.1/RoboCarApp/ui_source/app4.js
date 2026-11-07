
/* ===================================================================
   BUTTON ACTIONS
   =================================================================== */
const acts = {
  reconnect() { S.downAt = Date.now(); Link.tries = 0; Link.drop(); Link.connect(); toast('در حال اتصال…', '', 1200); },
  goCards() { go('cards'); }, goSense() { go('sense'); },
  stop() { doStop(); },
  unlockPw() { ensureAdmin('روشن‌کردن ماشین بدون کارت').then(ok => { if (ok) send('UL'); }); },
  lockNow() { send('LK'); },
  find() { send('F,' + (S.T.fd ? 0 : 1)); },
  openWifi() { openWifi(); },
  hideConn() { S.hideConn = true; updConnOv(); },
  demoOn() { startDemo(); }
};
function startDemo() {
  Link.drop(); S.up = false; S.demo = true; S.hideConn = true; $('#connOv').classList.remove('on');
  S.T = {}; S.C = {}; S.cards = []; S.prevLk = null; S.adminUntil = 0;
  Demo.start(); updHeader();
}
function stopDemo() { Demo.stop(); S.demo = false; S.T = {}; S.up = false; S.downAt = Date.now(); Link.connect(); updHeader(); updBanners(); }

/* ===================================================================
   DEMO CAR  (a small simulator of the real protocol: try the whole app without the car)
   =================================================================== */
const Demo = {
  on: false, timer: null, s: null, c: null, cards: [], auth: false, enrT: null, pw: 'Barman@1234', fail: 0, tgt: null, J: { x: 0, y: 0, t: 0 }, scT: null, calT: null, log: [],
  start() {
    this.stop(); this.on = true;
    this.s = { t: 'st', bat: 5.08, pct: 70, lowb: 0, d: 1200, srv: 0, hd: 0, yr: 0, pt: 0.4, rl: -0.3, eL: 0, eR: 0, rL: 480, rR: 510, tL: 2600, tR: 2600, ldr: 1800, mode: 0, li: 2, ln: 0, rad: 0, gy: 0, mx: 70, eg: 1, og: 1,
      mpu: 1, tof: 1, rf: 1, tip: 0, cut: 0, ml: 0, mr: 0, up: 0, lk: 1, hz: 0, cal: 0, alm: 0, tmp: 27.5, cn: 1, enr: 0, stn: 1, hp: 212, fd: 0, who: '' };
    this.c = { t: 'cfg', mLi: 0, mRi: 0, swap: 0, bal: 0, minPwm: 70, slew: 22, turnMix: 80, brake: 1, sInv: 0, sTrim: 0, yInv: 1, pInv: 0, rInv: 0, tip: 55, kp: 12, bCal: 1000, bLow: 4700, bCut: 4300, ldrOn: 800, ldrOff: 1400, head: 255, tailRun: 60, obsStop: 150, obsSlow: 400, autoSpd: 60, autoObs: 300, autoLock: 0, cardTog: 1, alarm: 0, alarmSns: 5, mute: 0, park: 1, spd: 70, lights: 2, edge: 1, obs: 1, thrL: 2600, thrR: 2600, gBias: 0, pOff: 0, rOff: 0 };
    this.cards = [{ i: 0, n: 'کارت من', u: '04:A1:B2:C3', c: 3 }];
    this.auth = false; this.tgt = null; this.t0 = Date.now();
    setTimeout(() => { if (!this.on) return; onUp(); this.emit({ t: 'info', fw: '2.0.0', ssid: 'RoboCar', host: 'robocar', mac: 'DE:MO:00:00:00:01', rfid: 1, max: 16, up: 5 }); this.sendCfg(); this.sendCards(); this.ev('Car started (v2.0.0)'); }, 50);
    this.timer = setInterval(() => this.tick(), 100);
  },
  stop() { this.on = false; clearInterval(this.timer); clearTimeout(this.enrT); clearInterval(this.scT); clearTimeout(this.calT); },
  emit(o) { if (this.on) onMsg(o); },
  ev(m) { this.emit({ t: 'ev', s: ((Date.now() - this.t0) / 1000) | 0, m }); },
  sendCfg() { this.emit(Object.assign({}, this.c)); },
  sendCards() { this.emit({ t: 'cards', n: this.cards.length, max: 16, open: this.cards.length ? 0 : 1, cards: this.cards.map((c, i) => Object.assign({}, c, { i })) }); },
  need() { if (this.auth) return true; this.emit({ t: 'auth', ok: 0, need: 1 }); return false; },
  tick() {
    const s = this.s, c = this.c, now = Date.now(), dt = 0.1;
    s.up = ((now - this.t0) / 1000) | 0; s.mx = c.spd; s.li = c.lights; s.eg = c.edge; s.og = c.obs; s.cn = this.cards.length;
    const jx = (now - this.J.t < 450) ? this.J.x : 0, jy = (now - this.J.t < 450) ? this.J.y : 0;
    let L = 0, R = 0;
    if (!s.lk && s.mode === 0) { const f = jy * c.spd / 100, t = jx * c.spd / 100 * c.turnMix / 100; L = f + t; R = f - t; if (f > 0 && s.d < c.obsStop) { L = R = 0; } }
    if (this.tgt !== null) { const e = this.tgt - s.hd; if (Math.abs(e) < 3) this.tgt = null; else { L = Math.sign(e) * 40; R = -L; } }
    if (s.mode === 1 && !s.lk) { L = 35 + 20 * Math.sin(now / 2500); R = 35 - 20 * Math.sin(now / 2500); }
    s.ml = Math.round(L * 2.5); s.mr = Math.round(R * 2.5);
    s.yr = (L - R) * 0.5; s.hd += s.yr * dt; if (s.hd > 180) s.hd -= 360; if (s.hd < -180) s.hd += 360;
    s.pt = 0.4 + (L + R) * 0.01 + Math.sin(now / 900) * 0.15; s.rl = -0.3 + (L - R) * 0.01;
    s.d = Math.round(clamp(900 + 700 * Math.sin(now / 3100 + s.hd / 40) - (L + R) * 1.2, 80, 2000));
    if (s.rad || s.mode === 4) { s.srv = Math.round(60 * Math.sin(now / 900)); this.emit({ t: 'rd', a: Math.round(s.srv / 15) * 15, d: Math.round(clamp(700 + 500 * Math.sin(s.srv / 25 + now / 5000), 120, 2000)) }); } else s.srv = 0;
    s.bat = Math.max(4.2, 5.08 - (now - this.t0) / 3e6); s.pct = Math.round(clamp((s.bat - 4.3) / 1.1 * 100, 0, 100));
    s.ldr = Math.round(1500 + 800 * Math.sin(now / 20000)); s.ln = (c.lights === 1 || (c.lights === 2 && s.ldr < c.ldrOn)) ? 1 : 0;
    s.rL = 480 + Math.round(20 * Math.sin(now / 500)); s.rR = 510 + Math.round(20 * Math.cos(now / 600));
    this.emit(Object.assign({}, s));
  },
  unlock(who) { this.s.lk = 0; this.s.who = who; this.s.alm = 0; this.ev('Car ON - ' + who); },
  cardTap() {
    if (this.s.lk) { const k = this.cards[0] ? this.cards[0].n : 'card'; if (this.cards[0]) this.cards[0].c++; this.unlock(k); this.sendCards(); }
    else toast('ماشین الان روشن است', '');
  },
  recv(line) {
    const i = line.indexOf(','), cmd = i < 0 ? line : line.slice(0, i), args = i < 0 ? '' : line.slice(i + 1), a = parseInt(args, 10) || 0;
    const s = this.s, c = this.c; if (!s) return;
    switch (cmd) {
      case 'J': { const p = args.split(','); this.J = { x: +p[0] || 0, y: +p[1] || 0, t: Date.now() }; break; }
      case 'P': this.emit({ t: 'pong' }); break;
      case 'S': this.J.t = 0; s.mode = 0; this.tgt = null; break;
      case 'M': if (a && s.lk) break; s.mode = a; s.rad = 0; if (a === 5) this.scan(); break;
      case 'L': c.lights = clamp(a, 0, 2); this.sendCfg(); break;
      case 'G': s.gy = a ? 1 : 0; break;
      case 'R': if (!s.lk) s.rad = a ? 1 : 0; break;
      case 'K': c.spd = clamp(a, 15, 100); this.sendCfg(); break;
      case 'Y': if (!s.lk) s.hz = clamp(a, 0, 2); break;
      case 'F': s.fd = a ? 1 : 0; this.ev(a ? 'Find-my-car started' : 'Find-my-car stopped'); break;
      case 'A': if (!s.lk) this.tgt = ((s.hd + a + 540) % 360) - 180; break;
      case 'Z': s.hd = 0; break;
      case 'C': { s.cal = a === 1 ? 10 : a; clearTimeout(this.calT); this.calT = setTimeout(() => { s.cal = 0;
        if (a === 2) { this.emit({ t: 'cal', k: 'gyro', ok: 1, v: 0.31, n: 0.04 }); this.ev('Gyro calibrated (bias 0.31)'); }
        if (a === 3) this.emit({ t: 'cal', k: 'level', ok: 1, v: 0.4, n: -0.3 });
        if (a === 1) this.emit({ t: 'cal', k: 'edge', ok: 1, v: 480, n: 510 });
        if (a === 4) this.emit({ t: 'cal', k: 'light', ok: 1, v: s.ldr, n: 900 }); }, a === 2 ? 1800 : 900); break; }
      case 'BC': this.emit({ t: 'cal', k: 'battery', ok: 1, v: parseFloat(args), n: 1.012 }); break;
      case 'W': { const p = args.split(','); if (p[0] in c) { c[p[0]] = +p[1]; this.sendCfg(); } break; }
      case 'CFG': this.sendCfg(); break;
      case 'CL': this.sendCards(); break;
      case 'INFO': break;
      case 'LG': break;
      case 'LK': s.lk = 1; s.who = ''; s.mode = 0; this.ev('Car OFF - app'); break;
      case 'AUTH':
        if (args === this.pw) { this.auth = true; this.fail = 0; setTimeout(() => { this.auth = false; }, 285000); this.emit({ t: 'auth', ok: 1, left: 5, wait: 0 }); }
        else { this.fail++; this.emit({ t: 'auth', ok: 0, left: Math.max(0, 5 - this.fail), wait: 0 }); } break;
      case 'UL': if (this.need() && s.lk) this.unlock('password'); break;
      case 'CE': if (!this.need()) break; this.emit({ t: 'enr', s: 'wait', i: -1 }); s.enr = 1;
        clearTimeout(this.enrT); this.enrT = setTimeout(() => { const n = cleanName(args) || 'Card ' + (this.cards.length + 1); this.cards.push({ n, u: '04:' + Math.floor(Math.random() * 255).toString(16).toUpperCase().padStart(2, '0') + ':5C:9E', c: 0 }); s.enr = 0; this.emit({ t: 'enr', s: 'ok', i: this.cards.length - 1 }); this.sendCards(); this.ev('Card added: ' + n); }, 3500); break;
      case 'CX': clearTimeout(this.enrT); s.enr = 0; this.emit({ t: 'enr', s: 'cancel', i: -1 }); break;
      case 'CD': if (!this.need()) break; this.cards.splice(a, 1); this.sendCards(); break;
      case 'CR': if (!this.need()) break; { const p = args.split(','); if (this.cards[a]) this.cards[a].n = p.slice(1).join(','); this.sendCards(); } break;
      case 'CA': if (!this.need()) break; this.cards = []; this.sendCards(); break;
      case 'PW': if (!this.need()) break; this.pw = args; this.emit({ t: 'pw', ok: 1 }); break;
      case 'WF': if (!this.need()) break; this.emit({ t: 'wifi', ok: 1 }); break;
      case 'RB': case 'FR': if (!this.need()) break; this.emit({ t: 'rb' }); break;
      case 'T': toast('تست موتور (نمایشی)', '', 900); break;
      case 'B': break;
    }
  },
  scan() {
    const s = this.s; R.sc = []; this.emit({ t: 'sc', s: 'start' }); let b = 0;
    clearInterval(this.scT);
    this.scT = setInterval(() => {
      if (!this.on || s.mode !== 5) { clearInterval(this.scT); return; }
      const wall = 600 + 350 * Math.sin(b * Math.PI / 90) + (b > 150 && b < 200 ? 400 : 0);
      this.emit({ t: 'sc', b: b % 360, d: Math.round(wall) }); b += 10;
      if (b >= 360) { clearInterval(this.scT); this.emit({ t: 'sc', s: 'end' }); s.mode = 0; }
    }, 120);
  }
};

/* ===================================================================
   START
   =================================================================== */
function drawFrame() {
  requestAnimationFrame(drawFrame);
  const t = performance.now(); if (t - (drawFrame.l || 0) < 45) return; drawFrame.l = t;
  if (S.pg === 'drive') { const c = $('#cvMini'); if (c) drawFan(c, 1500, false, true); }
  else if (S.pg === 'radar' && BUILT.radar) { const r = +$('#rRange').value; drawFan($('#cvRadar'), r, true, true); drawMap($('#cvMap'), r); }
  else if (S.pg === 'sense' && BUILT.sense) { drawHorizon($('#cvHor')); drawCompass($('#cvCmp')); drawHist($('#cvHist')); }
}
function init() {
  fillIcons(document);
  setTimeout(() => { const sp = $('#splash'); if (sp) sp.remove(); }, 2300);
  document.addEventListener('click', e => { const a = e.target.closest('[data-act]'); if (a && acts[a.dataset.act]) acts[a.dataset.act](a); });
  $$('#tabs button').forEach(b => b.onclick = () => { go(b.dataset.pg); vib(8); });
  $('#cardAnim').onclick = () => { if (S.demo) Demo.cardTap(); };
  buildModes(); buildDrive();
  const sr = $('#spdRange');
  sr.addEventListener('input', () => { sr._drag = true; setRange(sr); $('#spdVal').textContent = sr.value + '%'; sendCfg('spd', +sr.value); });
  sr.addEventListener('change', () => { sr._drag = false; });
  setRange(sr);
  const ss = P.get('ssid', ''), pp = P.get('wpass', ''); if (ss) $('#ssidHint').textContent = ss; if (pp) $('#passHint').textContent = pp;
  S.downAt = Date.now();
  setInterval(() => { if (S.up) { S.pingT = performance.now(); Link.send('P'); } }, 700);
  setInterval(() => { if (S.up && Date.now() - S.lastRx > 3500 && Link.ws) { try { Link.ws.close(); } catch (e) {} } }, 1000);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { hornOff(); D.touch.x = D.touch.y = 0; send('J,0,0'); send('S'); } });
  if (App && App.keepAwake) App.keepAwake(P.get('awake', true));
  $('#welcome').addEventListener('animationend', () => $('#welcome').classList.remove('on'));
  window.__feed = s => onRaw(s);
  // the Android app calls these when it goes to the background / comes back (the car stops while the app is hidden)
  window.__pause = function () { S.paused = true; hornOff(); D.touch.x = D.touch.y = 0; stopPlay(); send('J,0,0'); send('S'); if (!S.demo) { Link.drop(); if (S.up) { S.up = false; onDown(); } } };
  window.__resume = function () { S.paused = false; S.downAt = Date.now(); if (!S.demo) { Link.tries = 0; Link.connect(); } };
  go('drive'); updHeader(); drawFrame();
  if (/[?&]demo/.test(location.search)) startDemo(); else Link.connect();
}
window.addEventListener('DOMContentLoaded', init);
