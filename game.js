// ═══════════════════════════════════════════
// MJ MODE (remplace TEST_MODE)
// ═══════════════════════════════════════════
var _mjMode = false;
function isMJ() { return _mjMode; }
function activateMJ() {
  _mjMode = true;
  try { localStorage.setItem('myth_mj_mode', '1'); } catch(e) {}
  syncMJOverlay();
}
function deactivateMJ() {
  _mjMode = false;
  try { localStorage.removeItem('myth_mj_mode'); } catch(e) {}
  var ov = document.getElementById('testOv'); if (ov) ov.style.display = 'none';
}
function syncMJOverlay() {
  var ov = document.getElementById('testOv'); if (!ov) return;
  if (!_mjMode) { ov.style.display = 'none'; return; }
  ov.style.display = 'block';
}

// ═══════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════
var S = {
  team:null, idx:0, t0:null, pen:0, oh:{}, iv:null,
  onPen:false, plog:[], mjT:"grec", mjC:"fresque",
  mjST:{}, mjEnd:{}, mjIv:null, pendingTeam:null, quizAnswers:{},
  cpTimes:[]
};

// ═══════════════════════════════════════════
// PERSIST
// ═══════════════════════════════════════════
function save() {
  try {
    var cur = document.querySelector('.screen:not(.hidden)');
    localStorage.setItem(LS_KEY, JSON.stringify({
      tk:S.team&&S.team.key, idx:S.idx, t0:S.t0, pen:S.pen,
      oh:S.oh, onPen:S.onPen, plog:S.plog, mjST:S.mjST, quizAnswers:S.quizAnswers,
      cpTimes:S.cpTimes, scr:cur&&cur.id,
      mapUsed:_mapUsed, photoUsed:_photoUsed
    }));
  } catch(e) {}
}
function loadSaved() {
  try {
    var d = JSON.parse(localStorage.getItem(LS_KEY)||'null');
    if (!d || !d.tk || !d.t0) return null;
    S.team = TEAMS[d.tk]; if (!S.team) return null;
    S.idx=d.idx||0; S.t0=d.t0; S.pen=d.pen||0;
    S.oh=d.oh||{}; S.onPen=d.onPen||false;
    S.plog=d.plog||[]; S.mjST=d.mjST||{}; S.quizAnswers=d.quizAnswers||{};
    S.cpTimes=d.cpTimes||[];
    if(d.mapUsed) _mapUsed=true;
    if(d.photoUsed) _photoUsed=d.photoUsed;
    return d.scr;
  } catch(e) { return null; }
}
function clr() { try { localStorage.removeItem(LS_KEY); } catch(e) {} }
function saveMJ() {
  try { localStorage.setItem(LS_KEY+'_mj', JSON.stringify({mjST:S.mjST,mjEnd:S.mjEnd,quizAnswers:S.quizAnswers})); } catch(e) {}
}
function loadMJ() {
  try {
    var d = JSON.parse(localStorage.getItem(LS_KEY+'_mj')||'null');
    if (d) { S.mjST=d.mjST||{}; S.mjEnd=d.mjEnd||{}; S.quizAnswers=d.quizAnswers||{}; }
  } catch(e) {}
}

// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
var _TR={sSplash:'tr-fade',s4:'tr-zoom',s9:'tr-fade',sEnigme:'tr-up',s7:'tr-up'};
function go(id, dir) {
  var trClass=_TR[id]||'';
  // Mark visible screen for directional exit before hiding
  if (dir === 'forward') {
    document.querySelectorAll('.screen:not(.hidden)').forEach(function(s){
      s.classList.add('exit-forward');
    });
  }
  document.querySelectorAll('.screen').forEach(function(s){
    s.classList.add('hidden');
    s.classList.remove('tr-up','tr-zoom','tr-fade');
  });
  var el = document.getElementById(id);
  if (el) { if(trClass) el.classList.add(trClass); el.classList.remove('hidden', 'exit-forward'); }
  var bt = document.getElementById('btnTheme');
  if (bt) bt.style.display = 'flex';
  // Show help drawer on game screens only
  var gameScreens = ['s5','s6','sEnigme','s7','s8'];
  var isGame = gameScreens.indexOf(id) >= 0;
  showHelpDrawer(isGame);
  // Show photo button only on enigme/code screens
  var photoScreens = ['sEnigme','s7'];
  showPhotoBtn(photoScreens.indexOf(id) >= 0);
  // Clean exit class after transition
  setTimeout(function(){
    document.querySelectorAll('.exit-forward').forEach(function(s){ s.classList.remove('exit-forward'); });
  }, 500);
}

// ═══════════════════════════════════════════
// SOUND
// ═══════════════════════════════════════════
var _audioCtx = null;
function getAudioCtx() {
  try {
    if (!_audioCtx || _audioCtx.state === 'closed') {
      _audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    }
    if (_audioCtx.state === 'suspended') _audioCtx.resume();
    return _audioCtx;
  } catch(e) { return null; }
}

// Unlock audio on any user tap (iOS requires user gesture)
document.addEventListener('touchstart', function(){ getAudioCtx(); }, {once: true});
document.addEventListener('click', function(){ getAudioCtx(); }, {once: true});

function playSound(type) {
  try {
    var ctx = getAudioCtx(); if (!ctx) return;
    if (type === 'success') {
      // Arpège ascendant Do-Mi-Sol
      [[523,0],[659,0.12],[784,0.24]].forEach(function(n){
        var o=ctx.createOscillator(), g=ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value=n[0]; o.type='triangle';
        var t=ctx.currentTime+n[1];
        g.gain.setValueAtTime(0.18,t);
        g.gain.exponentialRampToValueAtTime(0.001,t+0.38);
        o.start(t); o.stop(t+0.38);
      });
    } else if (type === 'error') {
      var o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.setValueAtTime(280,ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(130,ctx.currentTime+0.3);
      o.type='sawtooth';
      g.gain.setValueAtTime(0.2,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.38);
      o.start(); o.stop(ctx.currentTime+0.38);
    } else if (type === 'penalty') {
      // Gong solennel
      var o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.setValueAtTime(200,ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(75,ctx.currentTime+0.8);
      o.type='sawtooth';
      g.gain.setValueAtTime(0.28,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.8);
      o.start(); o.stop(ctx.currentTime+0.8);
    } else if (type === 'hint') {
      // Parchemin qui se déplie
      var o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.setValueAtTime(420,ctx.currentTime);
      o.frequency.linearRampToValueAtTime(560,ctx.currentTime+0.14);
      o.type='sine';
      g.gain.setValueAtTime(0.12,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.28);
      o.start(); o.stop(ctx.currentTime+0.28);
    } else if (type === 'tick') {
      var o=ctx.createOscillator(), g=ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.frequency.value=900; o.type='square';
      g.gain.setValueAtTime(0.08,ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.07);
      o.start(); o.stop(ctx.currentTime+0.07);
    } else if (type === 'fanfare') {
      // Fanfare de victoire
      [[523,0],[659,0.14],[784,0.28],[1047,0.44]].forEach(function(n){
        var o=ctx.createOscillator(), g=ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value=n[0]; o.type='triangle';
        var t=ctx.currentTime+n[1];
        g.gain.setValueAtTime(0.22,t);
        g.gain.exponentialRampToValueAtTime(0.001,t+0.55);
        o.start(t); o.stop(t+0.55);
      });
    }
  } catch(e) {}
}

// ═══════════════════════════════════════════
// VIBRATION
// ═══════════════════════════════════════════
function vibrate(pattern) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch(e) {}
}
// Distinct vibration patterns per event type
var VIB = {
  success:   [60, 40, 60, 40, 120],     // ··—  (double tap + long)
  error:     [250],                       // — (single long buzz)
  penalty:   [120, 60, 120, 60, 120],    // —·—·— (morse-like warning)
  hint:      [40, 30, 40],               // ·· (gentle double tap)
  arrival:   [80, 40, 80, 40, 200, 80, 300], // ··—·——— (fanfare)
  map:       [200, 80, 200],             // —·— (alert)
  countdown: [50]                        // · (tick)
};

// ═══════════════════════════════════════════
// CONNECTIVITY CHECK (fiable sur iOS)
// ═══════════════════════════════════════════
function checkOnline(cb) {
  // Fast path — navigator.onLine est fiable pour "offline"
  if (!navigator.onLine) { cb(false); return; }
  // Sinon on tente un vrai appel réseau (navigator.onLine peut lagger après toggle avion)
  var done = false;
  var timer = setTimeout(function() { if (!done) { done=true; cb(false); } }, 3000);
  fetch('https://1.1.1.1/favicon.ico?_='+Date.now(), {mode:'no-cors', cache:'no-store'})
    .then(function() { clearTimeout(timer); if (!done) { done=true; cb(true); } })
    .catch(function() { clearTimeout(timer); if (!done) { done=true; cb(false); } });
}

// ═══════════════════════════════════════════
// CONFETTIS
// ═══════════════════════════════════════════
function flashSuccess() {
  var el = document.getElementById('successFlash');
  if (!el) return;
  el.classList.remove('flash');
  void el.offsetWidth; // reflow
  el.classList.add('flash');
  setTimeout(function(){ el.classList.remove('flash'); }, 600);
}


function launchConfetti() {
  var canvas = document.getElementById('confetti');
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = 'block';
  var ctx = canvas.getContext('2d');
  var colors = ['#C9A84C','#5a8fd4','#c080e8','#c8c8c8','#d07030','#27ae60'];
  var particles = [];
  for (var i = 0; i < 140; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 120,
      r: 5 + Math.random() * 5,
      d: 1.5 + Math.random() * 2.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngle: Math.random() * Math.PI * 2,
      tiltSpeed: 0.05 + Math.random() * 0.08
    });
  }
  var frame = 0;
  var STOP_SPAWN = 900; // ~15s: stop recycling confetti to top
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var fadePhase = frame > STOP_SPAWN;
    var alive = 0;
    particles.forEach(function(p) {
      if (p.dead) return;
      var alpha = 1;
      if (fadePhase) { alpha = Math.max(0, 1 - (p.y / canvas.height)); }
      if (alpha <= 0) { p.dead = true; return; }
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.lineWidth = p.r * 0.6;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt, p.y);
      ctx.lineTo(p.x + p.tilt + p.r, p.y + p.r * 1.2);
      ctx.stroke();
      alive++;
    });
    ctx.globalAlpha = 1;
    particles.forEach(function(p) {
      if (p.dead) return;
      p.tiltAngle += p.tiltSpeed;
      p.y += p.d;
      p.tilt = Math.sin(p.tiltAngle) * 14;
      if (p.y > canvas.height) {
        if (fadePhase) { p.dead = true; }
        else { p.y = -10; p.x = Math.random() * canvas.width; }
      }
    });
    frame++;
    if (alive > 0) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
    }
  }
  draw();
}

// ═══════════════════════════════════════════
// BADGES (feature 9)
// ═══════════════════════════════════════════
var BADGES = {
  grec: [
    {max:25, icon:'I', title:'Foudre de Zeus', desc:'Vitesse divine — les dieux sont impressionnés.'},
    {max:35, icon:'II', title:'Héros de l\'Olympe', desc:'Un exploit digne des plus grands mythes.'},
    {max:45, icon:'III', title:'Protégé d\'Athéna', desc:'La sagesse vous a guidés avec brio.'},
    {max:60, icon:'IV', title:'Voyageur d\'Ithaque', desc:'Comme Ulysse, le chemin compte autant que la destination.'},
    {max:Infinity, icon:'V', title:'Tortue de Zénon', desc:'Lent mais philosophique — Zénon serait fier.'}
  ],
  nordique: [
    {max:25, icon:'I', title:'Éclair de Mjölnir', desc:'Thor lui-même applaudit votre rapidité.'},
    {max:35, icon:'II', title:'Berserker légendaire', desc:'Une charge digne du Valhalla.'},
    {max:45, icon:'III', title:'Favori d\'Odin', desc:'Les corbeaux ont chanté vos louanges.'},
    {max:60, icon:'IV', title:'Gardien du Bifröst', desc:'Solide et déterminé, comme Heimdall.'},
    {max:Infinity, icon:'V', title:'Escargot d\'Yggdrasil', desc:'Même le Serpent-Monde avance plus vite… mais bravo.'}
  ],
  hindou: [
    {max:25, icon:'I', title:'Flamme d\'Agni', desc:'Une célérité digne des dieux védiques.'},
    {max:35, icon:'II', title:'Rugissement de Durga', desc:'La force et la grâce, en un seul parcours.'},
    {max:45, icon:'III', title:'Lotus d\'or', desc:'L\'éveil est proche — parcours exemplaire.'},
    {max:60, icon:'IV', title:'Pèlerin du Dharma', desc:'Chaque pas était une prière — beau voyage.'},
    {max:Infinity, icon:'V', title:'Patience de Ganesh', desc:'Ganesh approuve la lenteur contemplative.'}
  ]
};

function getBadge(teamKey, totalMin) {
  var list = BADGES[teamKey] || BADGES.grec;
  for (var i = 0; i < list.length; i++) {
    if (totalMin <= list[i].max) return list[i];
  }
  return list[list.length - 1];
}

// ═══════════════════════════════════════════
// RIPPLE EFFECT
// ═══════════════════════════════════════════
document.addEventListener('click', function(e) {
  var btn = e.target.closest('.btn');
  if (!btn) return;
  var r = btn.getBoundingClientRect();
  var rip = document.createElement('span');
  rip.className = 'ripple';
  rip.style.left = (e.clientX - r.left) + 'px';
  rip.style.top = (e.clientY - r.top) + 'px';
  btn.appendChild(rip);
  setTimeout(function(){ rip.remove(); }, 550);
});

// ═══════════════════════════════════════════
// GOLD PARTICLES (splash)
// ═══════════════════════════════════════════
function createParticles(parentId, count) {
  var parent = document.getElementById(parentId);
  if (!parent || parent.querySelector('.gold-particles')) return;
  var wrap = document.createElement('div');
  wrap.className = 'gold-particles';
  for (var i = 0; i < (count || 18); i++) {
    var p = document.createElement('div');
    p.className = 'gp';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (6 + Math.random() * 8) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    var sz = (2 + Math.random() * 3) + 'px';
    p.style.width = sz; p.style.height = sz;
    wrap.appendChild(p);
  }
  parent.insertBefore(wrap, parent.firstChild);
}

// ═══════════════════════════════════════════
// TEAM PARTICLES (game screens)
// ═══════════════════════════════════════════
function createTeamParticles(parentId, teamKey, count) {
  var parent = document.getElementById(parentId);
  if (!parent || parent.querySelector('.team-particles')) return;
  var wrap = document.createElement('div');
  wrap.className = 'team-particles ' + (teamKey || 'grec');
  var n = count || 14;
  var sizes = {grec:[3,6], nordique:[6,12], hindou:[2,5]};
  var range = sizes[teamKey] || sizes.grec;
  for (var i = 0; i < n; i++) {
    var p = document.createElement('div');
    p.className = 'tp';
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (8 + Math.random() * 10) + 's';
    p.style.animationDelay = (Math.random() * 12) + 's';
    var sz = (range[0] + Math.random() * (range[1] - range[0])) + 'px';
    p.style.width = sz; p.style.height = sz;
    wrap.appendChild(p);
  }
  parent.insertBefore(wrap, parent.firstChild);
}

function clearTeamParticles(parentId) {
  var parent = document.getElementById(parentId);
  if (!parent) return;
  var existing = parent.querySelectorAll('.team-particles');
  existing.forEach(function(el) { el.remove(); });
}

// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════
var TEAM_SVG = {
  grec:'<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="10" width="4" height="26" rx="1"/><rect x="28" y="10" width="4" height="26" rx="1"/><rect x="6" y="6" width="28" height="5" rx="1.5"/><rect x="6" y="35" width="28" height="3" rx="1"/><line x1="14" y1="10" x2="14" y2="36"/><line x1="20" y1="10" x2="20" y2="36"/><line x1="26" y1="10" x2="26" y2="36"/></svg>',
  nordique:'<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="20" y1="4" x2="20" y2="36"/><line x1="12" y1="10" x2="28" y2="10"/><line x1="14" y1="18" x2="26" y2="18"/><line x1="12" y1="10" x2="8" y2="18"/><line x1="28" y1="10" x2="32" y2="18"/><line x1="14" y1="18" x2="10" y2="26"/><line x1="26" y1="18" x2="30" y2="26"/></svg>',
  hindou:'<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="20" cy="20" r="16"/><circle cx="20" cy="20" r="10"/><circle cx="20" cy="20" r="4"/><line x1="20" y1="4" x2="20" y2="36"/><line x1="4" y1="20" x2="36" y2="20"/><line x1="8.7" y1="8.7" x2="31.3" y2="31.3"/><line x1="31.3" y1="8.7" x2="8.7" y2="31.3"/></svg>'
};
function teamColor(t) {
  var isLight = document.documentElement.classList.contains('light');
  return (isLight && t.colorLight) ? t.colorLight : t.color;
}
function th(t) {
  var r = document.documentElement.style;
  var isLight = document.documentElement.classList.contains('light');
  if (!t) { r.setProperty('--tc','var(--gold)'); r.setProperty('--tb','var(--gd)'); r.setProperty('--tbr','var(--gb)'); r.setProperty('--team-bg','none'); }
  else { r.setProperty('--tc', (isLight && t.colorLight) ? t.colorLight : t.color); r.setProperty('--tb', t.bg); r.setProperty('--tbr', t.border); r.setProperty('--team-bg', t.bgTexture ? 'url('+t.bgTexture+')' : 'none'); }
  // Watermark
  document.querySelectorAll('.hdr-wm').forEach(function(el){ el.remove(); });
  var k = t && t.key ? t.key : null;
  if (k && TEAM_SVG[k]) {
    document.querySelectorAll('.hdr').forEach(function(hdr){
      var wm = document.createElement('div');
      wm.className = 'hdr-wm';
      wm.innerHTML = TEAM_SVG[k];
      hdr.appendChild(wm);
    });
  }
}

function fmt(ms) {
  var s=Math.floor(ms/1000), m=Math.floor(s/60);
  return (m<10?'0':'')+m+':'+(s%60<10?'0':'')+(s%60);
}

function toast(msg) {
  var el = document.getElementById('toastR');
  el.textContent = msg; el.classList.add('show');
  setTimeout(function(){ el.classList.remove('show'); }, 2600);
}

function tick() {
  if (!S.t0) return;
  var elapsed = Date.now()-S.t0;
  var t = fmt(elapsed), p = '+'+S.pen+' min';
  var urgent = elapsed > 45*60*1000;
  ['c5','c6','cEnigme','c7','c8'].forEach(function(id){
    var e=document.getElementById(id); if(!e) return;
    e.textContent=t;
    if(urgent){ e.style.color='var(--danger)'; e.classList.add('chrono-urgent'); }
    else { e.style.color=''; e.classList.remove('chrono-urgent'); }
  });
  ['p5','p6','pEnigme','p7','p8'].forEach(function(id){ var e=document.getElementById(id); if(e) e.textContent=p; });
}
function startC() { S.t0=Date.now(); S.iv=setInterval(tick,1000); acquireWakeLock(); }
function stopC()  { if(S.iv) clearInterval(S.iv); }
function curCP()  { return S.team.route[S.idx]; }
function nextK()  { return S.idx>=S.team.route.length-1 ? 'ferme' : S.team.route[S.idx+1]; }

function mkSteps(id, offset) {
  var el=document.getElementById(id); if(!el) return;
  var r = S.team.route.concat(['ferme']);
  var total = r.length;
  var idx = S.idx + (offset || 0);
  var pct = total > 1 ? (idx / (total - 1)) * 100 : 0;
  // Reuse existing track if present, otherwise create
  var track = el.querySelector('.steps-track');
  var fill;
  if (track) {
    fill = track.querySelector('.steps-fill');
    // Update fill width — CSS transition handles smooth animation
    fill.style.width = pct + '%';
    // Update markers
    var mks = track.querySelectorAll('.steps-mk');
    for (var i = 0; i < mks.length; i++) {
      mks[i].classList.remove('done','now');
      if (i < idx) mks[i].classList.add('done');
      if (i === idx) mks[i].classList.add('now');
    }
    return;
  }
  // First render: create DOM without transition to avoid animate-from-0
  el.innerHTML = '';
  track = document.createElement('div');
  track.className = 'steps-track';
  fill = document.createElement('div');
  fill.className = 'steps-fill';
  fill.style.transition = 'none';
  fill.style.width = pct + '%';
  track.appendChild(fill);
  for (var i = 0; i < total; i++) {
    var mk = document.createElement('div');
    mk.className = 'steps-mk';
    if (i < idx) mk.classList.add('done');
    if (i === idx) mk.classList.add('now');
    mk.style.left = (total > 1 ? (i / (total - 1)) * 100 : 0) + '%';
    track.appendChild(mk);
  }
  el.appendChild(track);
  // Re-enable transition after first paint
  requestAnimationFrame(function(){ requestAnimationFrame(function(){
    fill.style.transition = '';
  }); });
}

function showCit(tk) {
  var list=CITS[tk]||CITS.grec, c=list[Math.floor(Math.random()*list.length)];
  var ov=document.getElementById('citOv');
  document.getElementById('citT').textContent=c.t;
  document.getElementById('citS').textContent=c.s;
  ov.classList.add('show');
  setTimeout(function(){ ov.classList.remove('show'); }, 2400);
}

function addP(min, reason) {
  S.pen+=min; S.plog.push({min:min,reason:reason}); save();
}

function setText(id, val) { var e=document.getElementById(id); if(e) e.textContent=val; }
function setStyle(id, prop, val) { var e=document.getElementById(id); if(e) e.style[prop]=val; }

function updateTestOverlay(showNext) {
  var ov = document.getElementById('testOv'); if (!ov) return;
  if (!_mjMode) { ov.style.display='none'; return; }
  ov.style.display = 'block';
  var body = document.getElementById('testOvBody'); if (!body) return;
  if (!S.team || !S.t0) { body.innerHTML = '<div class="tov-row" style="font-style:italic">Pas de session active</div>'; return; }
  // Sur l'écran indices (s8), le code courant est déjà validé — montrer le suivant
  var cpk = showNext ? nextK() : curCP();
  var cp  = CPS[cpk] || {};
  body.innerHTML =
    '<div class="tov-row">CP<br><span class="tov-val">'+(cp.icon?'<img class="cp-img sm" src="'+cp.icon+'"> ':'')+''+(cp.name||cpk)+'</span></div>'
   +'<div class="tov-row">Code<br><span class="tov-val" style="letter-spacing:3px">'+(cp.code||'—')+'</span></div>';
}

// ═══════════════════════════════════════════
// ONLINE DETECTION
// ═══════════════════════════════════════════
window.addEventListener('online', function() {
  if (!S.t0 || S.onPen) return;
  S.onPen=true; addP(30,'Connexion internet détectée'); vibrate(VIB.penalty);
  var b=document.getElementById('banOnline'); b.classList.add('show');
  setTimeout(function(){ b.classList.remove('show'); }, 6000);
});

// ═══════════════════════════════════════════
// PWA / WAKE LOCK
// ═══════════════════════════════════════════
var _wl=null;
function acquireWakeLock(){
  if(!navigator.wakeLock) return;
  navigator.wakeLock.request('screen').then(function(wl){ _wl=wl; }).catch(function(){});
}
document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='visible'&&S.t0) acquireWakeLock(); });

function setupPWA() {
  var u='logo.png';
  var ai=document.getElementById('appleIcon'); if(ai) ai.href=u;
}

// ═══════════════════════════════════════════
// SCREEN 1: TEAM SELECT
// ═══════════════════════════════════════════
function renderTeams() {
  var c=document.getElementById('teamList'); if(!c) return;
  c.innerHTML='';
  Object.keys(TEAMS).forEach(function(k){
    var t=TEAMS[k];
    var card=document.createElement('div');
    card.className='tcard';
    card.style.borderColor=t.border; card.style.background=t.bg;

    var bar=document.createElement('div');
    var tc=teamColor(t);
    bar.style.cssText='position:absolute;left:0;top:0;bottom:0;width:3px;background:'+tc+';border-radius:2px 0 0 2px;opacity:.8';

    var row=document.createElement('div');
    row.style.cssText='display:flex;align-items:center;gap:14px';

    var embWrap=document.createElement('div');
    embWrap.className='emblem-wrap';
    var embImg=document.createElement('img');
    embImg.src=t.emblem;embImg.alt=t.name;
    embWrap.appendChild(embImg);

    var info=document.createElement('div');
    info.style.cssText='flex:1;min-width:0';

    var nm=document.createElement('div'); nm.className='tn'; nm.style.color=tc; nm.textContent=t.name;

    var tag=document.createElement('div');
    tag.style.cssText='font-size:12px;font-style:italic;color:'+tc+';opacity:.75;margin-bottom:6px';
    tag.textContent=t.tagline;

    var mem=document.createElement('div'); mem.className='tm'; mem.textContent=t.members.join(' · ');

    var dep=document.createElement('div'); dep.className='tbg';
    dep.style.borderColor=t.border; dep.style.color=tc;
    dep.textContent="Départ — La Ferme d'Octave";

    info.appendChild(nm); info.appendChild(tag); info.appendChild(mem); info.appendChild(dep);
    row.appendChild(embWrap); row.appendChild(info);
    card.appendChild(bar); card.appendChild(row);

    card.addEventListener('click', function(){ selTeam(k); });
    card.addEventListener('mouseenter', function(){ card.style.boxShadow='0 0 0 1px '+t.border; });
    card.addEventListener('mouseleave', function(){ card.style.boxShadow=''; });

    c.appendChild(card);
  });
}

function selTeam(k) {
  checkOnline(function(online) {
    if (online) { S.pendingTeam=k; go('s2','forward'); return; }
    // Immersive selection animation
    var t=TEAMS[k];
    th(t);
    var cards=document.querySelectorAll('#teamList .tcard');
    var selected=null;
    cards.forEach(function(card,i){
      var teamKey=Object.keys(TEAMS)[i];
      if(teamKey===k){
        selected=card;
        card.style.transition='transform .4s cubic-bezier(.2,1.3,.4,1), box-shadow .4s';
        card.style.transform='scale(1.04)';
        card.style.boxShadow='0 0 30px '+t.color+', 0 0 60px '+t.color+'44, inset 0 0 20px '+t.color+'22';
        card.style.borderColor=t.color;
      } else {
        card.style.transition='opacity .35s, transform .35s';
        card.style.opacity='0.15';
        card.style.transform='scale(.96)';
        card.style.pointerEvents='none';
      }
    });
    playSound('success');
    setTimeout(function(){ doSelTeam(k); }, 850);
  });
}

function doSelTeam(k) {
  var t=TEAMS[k];
  S.team=t; S.idx=0; S.pen=0; S.oh={}; S.onPen=false; S.t0=null; S.plog=[]; S.quizAnswers={}; S.cpTimes=[];
  th(t);
  var s3emblem=document.getElementById('s3emblem');
  if(s3emblem) s3emblem.src=t.emblem;
  setText('s3title', t.name);
  setText('s3sub',   t.members.join(' · '));
  setText('s3flavor',t.flavor);
  go('s3','forward');
  createTeamParticles('s3', t.key, 12);
}

// ═══════════════════════════════════════════
// SCREEN 4: COUNTDOWN → SCREEN 5
// ═══════════════════════════════════════════
function startGame() {
  go('s4','forward');
  var el=document.getElementById('cdNum'), n=3;
  el.textContent=n;
  /* sound removed */
  var tc=S.team?S.team.color:'var(--gold)';
  var iv=setInterval(function(){
    el.style.transform='scale(1.3)';
    setTimeout(function(){ el.style.transform='scale(1)'; },150);
    var s4bg=document.getElementById('s4');
    if(s4bg){s4bg.style.transition='background .12s';s4bg.style.background=tc+'20';setTimeout(function(){s4bg.style.background='';},300);}
    n--;
    if(n===0){
      el.innerHTML='<span style="font-family:\'Cinzel Decorative\',serif;font-size:46px;letter-spacing:4px;animation:partez .55s cubic-bezier(.2,1.4,.4,1) forwards;display:inline-block;text-shadow:0 0 50px rgba(255,220,100,.9),0 0 100px rgba(201,168,76,.5);color:'+tc+'">PARTEZ !</span>';
      if(s4bg){s4bg.style.background=tc+'18';setTimeout(function(){s4bg.style.background='';},500);}
      clearInterval(iv);
      setTimeout(function(){ startC(); if(S.team) S.mjST[S.team.key]=S.t0; showS5(); save(); saveMJ(); },800);
    } else {
      /* sound removed */
      el.textContent=n;
    }
  },900);
}

// ═══════════════════════════════════════════
// SCREEN 5: START HINTS
// ═══════════════════════════════════════════
function showS5() {
  var t=S.team; th(t);
  setText('s5title', t.name);
  setText('s5sub',   t.members.join(' · '));
  mkSteps('st5');
  buildHints('hintsStart','ferme',t.key);
  var di=document.getElementById('destStart'); if(di) di.value='';
  setText('destStartErr','');
  go('s5','forward'); updateTestOverlay();
  createTeamParticles('s5', t.key, 12);
}

// ═══════════════════════════════════════════
// SCREEN 6: EN ROUTE
// ═══════════════════════════════════════════
function showEnRoute(cpk) {
  var cp=CPS[cpk], t=S.team; th(t);
  setText('s6title', t.name);
  var erIconEl=document.getElementById('erIcon');
  if(erIconEl) erIconEl.innerHTML=cp.icon ? '<div class="emblem-wrap lg" style="margin:0 auto"><img src="'+cp.icon+'" alt="'+cp.name+'"></div>' : '';
  setText('erName',  cp.name); setStyle('erName','color','var(--tc)');
  setText('erAddr',  cp.addr);
  mkSteps('st6');
  go('s6','forward');
  createTeamParticles('s6', t.key, 10);
  var s6=document.getElementById('s6');
  s6.onclick=function(e){ if(e.target.id==='btnEnRouteBack') return; s6.onclick=null; showEnigme(cpk); };
  var backBtn=document.getElementById('btnEnRouteBack');
  if(backBtn){
    backBtn.onclick=function(e){
      e.stopPropagation(); s6.onclick=null;
      if(S.idx===0){ showS5(); }
      else{ S.idx--; save(); showHintsScreen(S.team.route[S.idx]); }
    };
  }
}

// ═══════════════════════════════════════════
// SCREEN ENIGME
// ═══════════════════════════════════════════
function showEnigme(cpk) {
  var s6=document.getElementById('s6'); if(s6) s6.onclick=null;
  var cp=CPS[cpk], t=S.team; th(t);
  document.getElementById('enigTitle').textContent=t.name;
  document.getElementById('enigCPName').innerHTML=(cp.icon?'<img class="cp-img sm" src="'+cp.icon+'"> ':'')+cp.name;
  document.getElementById('enigCPAddr').textContent=cp.addr;
  document.getElementById('enigText').textContent=ENIGMES[cpk]||'Cherchez la cachette sur ce lieu.';
  mkSteps('stEnigme');
  go('sEnigme','forward'); updateTestOverlay();
  createTeamParticles('sEnigme', t.key, 10);
}

// ═══════════════════════════════════════════
// SCREEN 7: CODE
// ═══════════════════════════════════════════
function showCode(cpk) {
  var s6=document.getElementById('s6'); if(s6) s6.onclick=null;
  var cp=CPS[cpk], t=S.team; th(t);
  setText('s7title',  t.name);
  var s7cpEl=document.getElementById('s7cpName'); if(s7cpEl) s7cpEl.innerHTML=(cp.icon?'<img class="cp-img sm" src="'+cp.icon+'"> ':'')+cp.name;
  setText('s7cpAddr', cp.addr);
  setText('codeErr',  '');
  mkSteps('st7');
  buildCodeRow();
  go('s7','forward'); updateTestOverlay();
  createTeamParticles('s7', t.key, 10);
}

function buildCodeRow() {
  var row=document.getElementById('codeRow'); if(!row) return;
  row.innerHTML='';
  for(var i=0;i<4;i++){
    var inp=document.createElement('input');
    inp.type='text'; inp.maxLength=1; inp.className='cc';
    inp.setAttribute('autocomplete','off');
    inp.setAttribute('autocorrect','off');
    inp.setAttribute('spellcheck','false');
    inp.setAttribute('autocapitalize','characters');
    inp.dataset.idx=i;
    inp.addEventListener('input',(function(idx){
      return function(e){
        var v=e.target.value.toUpperCase().replace(/[^A-Z]/g,'');
        e.target.value=v;
        if(v){
          e.target.classList.remove('pop'); void e.target.offsetWidth; e.target.classList.add('pop');
        }
        if(v&&idx<3){ var next=row.children[idx+1]; if(next) next.focus(); }
        if(v&&idx===3){
          var all=''; for(var j=0;j<4;j++) all+=(row.children[j]?row.children[j].value:'');
          if(all.length===4) setTimeout(validateCode, 80);
        }
      };
    })(i));
    inp.addEventListener('keydown',(function(idx){
      return function(e){
        if(e.key==='Backspace'&&!e.target.value&&idx>0){ var prev=row.children[idx-1]; if(prev) prev.focus(); }
      };
    })(i));
    row.appendChild(inp);
  }
  setTimeout(function(){ if(row.children[0]) row.children[0].focus(); },120);
}

function validateCode() {
  var cpk=curCP(), exp=CPS[cpk].code;
  var row=document.getElementById('codeRow'); if(!row) return;
  var entered='';
  for(var i=0;i<4;i++){ entered+=(row.children[i]?row.children[i].value:'').toUpperCase(); }
  if(entered.length<4){ setText('codeErr','Entrez les 4 lettres.'); return; }
  if(entered===exp){
    playSound('success');
    for(var i=0;i<4;i++){
      (function(el,d){ setTimeout(function(){ el.classList.add('ok'); el.style.animation='codeWave .4s ease'; },d*80); })(row.children[i],i);
    }
    S.cpTimes.push({cp:cpk, t:Date.now()});
    if(document.activeElement) document.activeElement.blur();
    flashSuccess();
    vibrate(VIB.success);
    setTimeout(function(){ showCit(S.team.key); },50);
    // Si c'est le dernier CP, aller directement au retour ferme (pas d'indices)
    var isLast = (S.idx >= S.team.route.length - 1);
    setTimeout(function(){
      if(isLast){ S.idx++; save(); showReturnHome(); }
      else { showHintsScreen(cpk); }
    },700);
  } else {
    for(var i=0;i<4;i++){
      (function(el){ el.classList.add('err'); setTimeout(function(){ el.classList.remove('err'); },300); })(row.children[i]);
    }
    setText('codeErr','Code incorrect — cherchez encore…');
    playSound('error');
    vibrate(VIB.error);
  }
}

// ═══════════════════════════════════════════
// SCREEN 8: HINTS
// ═══════════════════════════════════════════
function showHintsScreen(cpk) {
  var cp=CPS[cpk], t=S.team; th(t);
  setText('s8title',  t.name);
  setText('s8sub',    t.members.join(' · '));
  var s8cpEl=document.getElementById('s8cpName'); if(s8cpEl) s8cpEl.innerHTML=(cp.icon?'<img class="cp-img sm" src="'+cp.icon+'"> ':'')+cp.name;
  setText('s8cpAddr', cp.addr);
  mkSteps('st8', 1);
  buildHints('hintsList',cpk,t.key);
  var di=document.getElementById('destNext'); if(di) di.value='';
  setText('destNextErr','');
  go('s8','forward'); updateTestOverlay(true);
  createTeamParticles('s8', t.key, 12);
}

function buildHints(containerId, cpk, tk) {
  var hints=(HINTS[cpk]||{})[tk]||[];
  var container=document.getElementById(containerId); if(!container) return;
  container.innerHTML='';
  LVL.forEach(function(lvl,idx){
    var hk=cpk+'-'+idx;
    var opened=!!S.oh[hk];
    var pl=lvl.p===0?'Gratuit':'+'+lvl.p+' min';

    var card=document.createElement('div');
    card.className='hcard';
    if(opened){ card.style.borderColor=lvl.c+'50'; card.style.background=lvl.c+'0e'; }

    var hdr=document.createElement('div'); hdr.className='hhdr';

    var left=document.createElement('div');
    var lbl=document.createElement('div'); lbl.className='hlbl'; lbl.style.color=lvl.c; lbl.textContent=lvl.l;
    var meta=document.createElement('div'); meta.className='hmeta';
    var diff=document.createElement('span'); diff.className='hdiff'; diff.textContent=lvl.d;
    var pill=document.createElement('span'); pill.className='hpill';
    pill.style.background=lvl.c+'18'; pill.style.border='1px solid '+lvl.c+'35'; pill.style.color=lvl.c;
    pill.textContent=pl;
    meta.appendChild(diff); meta.appendChild(pill);
    left.appendChild(lbl); left.appendChild(meta);

    var btn=document.createElement('button'); btn.className='hbtn';
    btn.textContent=opened?'Masquer':'Révéler';

    hdr.appendChild(left); hdr.appendChild(btn);

    var body=document.createElement('div');
    body.className='hbody'+(opened?' open':'');
    body.textContent='« '+(hints[idx]||'—')+' »';

    card.appendChild(hdr); card.appendChild(body);

    btn.addEventListener('click',(function(hk,lvl,card,body,btn){
      return function(){
        var isOpen=body.classList.contains('open');
        if(!isOpen){
          if(!S.oh[hk]){
            S.oh[hk]=true;
            if(lvl.p>0){ addP(lvl.p,lvl.l+' — '+(CPS[cpk]?CPS[cpk].name:cpk)); toast('+'+lvl.p+' min'); }
          }
          body.classList.add('open'); btn.textContent='Masquer';
          card.style.borderColor=lvl.c+'50'; card.style.background=lvl.c+'0e';
        } else {
          body.classList.remove('open'); btn.textContent='Révéler';
        }
      };
    })(hk,lvl,card,body,btn));

    // Auto-ouvrir l'Indice I (gratuit) à la première visite
    if (idx === 0 && !opened) {
      S.oh[hk] = true;
      body.classList.add('open');
      btn.textContent = 'Masquer';
      card.style.borderColor = lvl.c + '50';
      card.style.background = lvl.c + '0e';
      save();
    }

    container.appendChild(card);
  });
}

function confirmDest(inputId, errId, nextKey, onSuccess) {
  var inp=document.getElementById(inputId), err=document.getElementById(errId);
  if(!inp) return;
  var v=inp.value.trim().toLowerCase();
  if(!v){ if(err) err.textContent='Entrez une destination.'; return; }
  var ok=(ACC[nextKey]||[]).some(function(a){ return v.indexOf(a)>=0||(a.indexOf(v)>=0&&v.length>3); });
  if(ok){ if(err) err.textContent=''; inp.blur(); onSuccess(); }
  else {
    addP(1,'Mauvaise destination');
    if(err) err.textContent='Mauvaise destination — +1 min';
    vibrate(VIB.penalty);
    inp.value='';
  }
}

// ═══════════════════════════════════════════
// RETOUR À LA FERME (écran thématisé)
// ═══════════════════════════════════════════
function showReturnHome() {
  var t = S.team; th(t);
  var returnTexts = {
    grec: "Comme Ulysse apercevant enfin les rivages d'Ithaque, votre odyssée touche à sa fin. Les dieux vous attendent à la Ferme d'Octave.",
    nordique: "Le Bifröst s'illumine une dernière fois. Votre saga s'achève — le mead-hall de la Ferme d'Octave vous attend, guerriers.",
    hindou: "Le dharma vous a guidés jusqu'ici. Votre yatra s'achève — le repos du moksha vous attend à la Ferme d'Octave."
  };
  setText('s6title', t.name);
  var erIconEl2=document.getElementById('erIcon');
  if(erIconEl2) erIconEl2.textContent='';
  setText('erName', 'Retour à la Ferme'); setStyle('erName', 'color', t.color);
  setText('erAddr', returnTexts[t.key] || 'Retournez à la Ferme d\'Octave — 1 rue de la Fontaine des Champs');
  mkSteps('st6');
  // Mark all steps as done
  var steps = document.getElementById('st6');
  if (steps) {
    var fill = steps.querySelector('.steps-fill'); if (fill) fill.style.width = '100%';
    steps.querySelectorAll('.steps-mk').forEach(function(d){ d.className = 'steps-mk done'; });
    var last = steps.querySelector('.steps-mk:last-of-type'); if (last) last.className = 'steps-mk now';
  }
  go('s6', 'forward');
  var s6 = document.getElementById('s6');
  var backBtn = document.getElementById('btnEnRouteBack');
  if (backBtn) backBtn.style.display = 'none';
  s6.onclick = function(e) { s6.onclick = null; if (backBtn) backBtn.style.display = ''; showArrival(); };
}

// ═══════════════════════════════════════════
// SCREEN 9: ARRIVAL
// ═══════════════════════════════════════════
function showArrival() {
  stopC(); var t=S.team; th(t);
  var endTime=Date.now();
  S.mjEnd[t.key]=endTime; saveMJ();
  var el=endTime-S.t0, tot=el/60000+S.pen;
  var tc=teamColor(t);
  setText('s9team',   t.name); setStyle('s9team','color',tc);
  setText('s9title',  'ARRIVÉE'); setStyle('s9title','color',tc);
  // Badge based on score
  var badge = getBadge(t.key, tot);
  setText('s9flavor', '');
  var flavorEl = document.getElementById('s9flavor');
  if (flavorEl) flavorEl.innerHTML = '<div class="badge-wrap"><div class="badge-icon">' + badge.icon + '</div>'
    + '<div class="badge-title" style="color:' + tc + '">' + badge.title + '</div>'
    + '<div class="badge-desc">' + badge.desc + '</div></div>';
  var rows=S.plog.map(function(p){
    return '<div class="srow"><span class="sl" style="padding-left:12px;font-size:12px">↳ '+p.reason+'</span><span class="sv" style="color:#e74c3c;font-size:13px">+'+p.min+' min</span></div>';
  }).join('');
  var bd=document.getElementById('scoreDiv');
  // Build visual timeline (feature 8)
  var tlHtml='';
  if(S.cpTimes&&S.cpTimes.length){
    tlHtml='<div class="tl-wrap"><div class="tl-line"></div>';
    var prev=S.t0;
    // Départ
    tlHtml+='<div class="tl-item"><div class="tl-dot done" style="border-color:'+tc+';background:'+tc+'"></div>'
      +'<div class="tl-name" style="color:'+tc+'">Départ — La Ferme</div>'
      +'<div class="tl-time">00:00</div></div>';
    S.cpTimes.forEach(function(ct){
      var cp=CPS[ct.cp];
      var leg=ct.t-prev;
      prev=ct.t;
      tlHtml+='<div class="tl-item"><div class="tl-dot done" style="border-color:'+tc+';background:'+tc+'"></div>'
        +'<div class="tl-name" style="color:'+tc+'">'+(cp?(cp.icon?'<img class="cp-img sm" src="'+cp.icon+'"> ':'')+cp.name:ct.cp)+'</div>'
        +'<div class="tl-time">+'+fmt(leg)+' (à '+fmt(ct.t-S.t0)+')</div></div>';
    });
    // Retour ferme
    var lastLeg=endTime-S.t0-(S.cpTimes.length?S.cpTimes[S.cpTimes.length-1].t-S.t0:0);
    tlHtml+='<div class="tl-item"><div class="tl-dot done" style="border-color:var(--gold);background:var(--gold)"></div>'
      +'<div class="tl-name" style="color:var(--gold)">Arrivée — La Ferme</div>'
      +'<div class="tl-time">+'+fmt(lastLeg)+' (total '+fmt(el)+')</div></div>';
    tlHtml+='</div>';
  }
  if(bd) bd.innerHTML=''
    +'<div class="srow"><span class="sl">Temps de parcours</span><span class="sv">'+fmt(el)+'</span></div>'
    +(tlHtml?'<div style="font-family:Cinzel,serif;font-size:10px;color:var(--muted);letter-spacing:1px;margin:10px 0 4px;text-transform:uppercase">Parcours</div>'+tlHtml:'')
    +(S.plog.length
      ?'<div class="srow"><span class="sl">Pénalités totales</span><span class="sv" style="color:#e74c3c">+'+S.pen+' min</span></div>'+rows
      :'<div class="srow"><span class="sl">Pénalités</span><span class="sv" style="color:var(--ok)">Aucune</span></div>')
    +'<div class="srow" style="padding-top:12px;margin-top:6px;border-top:1px solid var(--tbr)"><span class="sl" style="font-family:\'Cinzel\',serif;color:var(--text)">SCORE PROVISOIRE</span><span class="sv" style="font-size:22px">'+tot.toFixed(1)+' min</span></div>'
    +'<p style="font-size:11px;color:var(--muted);text-align:center;margin-top:6px;font-style:italic">Score final = ce score − (bonnes réponses quiz × 0,5 min)</p>';
  // Keep test overlay visible on arrival for testing
  var ov=document.getElementById('testOv');
  if(ov && _mjMode) ov.style.display='block';
  else if(ov) ov.style.display='none';
  // Show MJ buttons on final screen
  var mjBtns=document.getElementById('s9MJBtns');
  if(mjBtns) mjBtns.style.display=_mjMode?'':'none';
  clr(); createTeamParticles('s9', t.key, 16); go('s9','forward');
  setTimeout(function(){ playSound('fanfare'); vibrate(VIB.arrival); launchConfetti(); }, 200);
}

function resetGame() {
  stopC();
  // Préserver les données MJ entre les équipes
  var mjST = S.mjST, mjEnd = S.mjEnd, quizAnswers = S.quizAnswers, mjT = S.mjT, mjC = S.mjC, mjIv = S.mjIv;
  S={team:null,idx:0,t0:null,pen:0,oh:{},iv:null,onPen:false,plog:[],mjT:mjT,mjC:mjC,mjST:mjST,mjEnd:mjEnd,mjIv:mjIv,pendingTeam:null,quizAnswers:quizAnswers,cpTimes:[]};
  clr(); saveMJ(); th(null);
  _mapUsed = false; _photoUsed = {};
  syncMJOverlay();
  go('sSplash','back');
  var _sEl = document.getElementById('sSplash');
  if (_sEl) {
    var _goS1 = function(){ go('s1', 'forward'); };
    _sEl.addEventListener('click', _goS1, {once: true});
    _sEl.addEventListener('touchstart', _goS1, {once: true});
  }
}

// ═══════════════════════════════════════════
// MJ MODE
// ═══════════════════════════════════════════
function buildMJRow() {
  var row=document.getElementById('mjRow'); if(!row) return;
  row.innerHTML='';
  for(var i=0;i<4;i++){
    var inp=document.createElement('input');
    inp.type='text'; inp.maxLength=1;
    inp.style.cssText='width:52px;height:62px;border-radius:10px;border:2px solid rgba(220,60,60,.5);background:rgba(200,40,40,.12);font-family:Cinzel,serif;font-size:26px;font-weight:700;color:#e05050;text-align:center;text-transform:uppercase;outline:none;margin:0 4px;box-shadow:inset 0 2px 6px rgba(0,0,0,.3)';
    inp.setAttribute('autocomplete','off');
    inp.setAttribute('autocorrect','off');
    inp.setAttribute('spellcheck','false');
    inp.addEventListener('input',(function(idx){
      return function(e){
        var v=e.target.value.toUpperCase().replace(/[^A-Z]/g,''); e.target.value=v;
        if(v&&idx<3){ var next=row.children[idx+1]; if(next) next.focus(); }
      };
    })(i));
    inp.addEventListener('keydown',(function(idx){
      return function(e){
        if(e.key==='Backspace'&&!e.target.value&&idx>0){ var prev=row.children[idx-1]; if(prev) prev.focus(); }
      };
    })(i));
    row.appendChild(inp);
  }
}

function loginMJ() {
  var row=document.getElementById('mjRow'); if(!row) return;
  var e=''; for(var i=0;i<4;i++) e+=(row.children[i]?row.children[i].value:'').toUpperCase();
  if(e===MJ_CODE){ setText('mjErr',''); activateMJ(); openMJ(); }
  else {
    setText('mjErr','Code incorrect.');
    for(var i=0;i<4;i++){
      (function(el){ el.style.borderColor='var(--danger)'; setTimeout(function(){ el.style.borderColor='rgba(200,0,0,.35)'; },400); })(row.children[i]);
    }
  }
}

function switchMJTab(tab) {
  ['live','indices','quiz','lb'].forEach(function(t){
    var p=document.getElementById('mjPane'+t.charAt(0).toUpperCase()+t.slice(1));
    var b=document.getElementById('mjTab'+t.charAt(0).toUpperCase()+t.slice(1));
    if(p) p.style.display=(t===tab)?'':'none';
    if(b){ b.classList.toggle('on',t===tab);
      if(t===tab){b.style.color='#e05050';b.style.borderColor='#e05050';b.style.background='rgba(200,40,40,.1)';}
      else{b.style.color='';b.style.borderColor='';b.style.background='';}
    }
  });
  if(tab==='quiz') renderQuiz();
  if(tab==='lb')   renderLB();
}

function renderQuiz() {
  var el=document.getElementById('quizDiv'); if(!el) return;
  el.innerHTML='';
  QUIZ.forEach(function(q,i){
    var ans=S.quizAnswers[i];
    var row=document.createElement('div'); row.className='qrow';
    var txt=document.createElement('div'); txt.className='qtxt';
    var tc=TEAMS[q.t]?TEAMS[q.t].color:'var(--gold)';
    var teamLabel=TEAMS[q.t]?TEAMS[q.t].name:'';
    txt.innerHTML='<span style="font-size:10px;color:'+tc+';font-family:Cinzel,serif;display:block;margin-bottom:2px">'+teamLabel+'</span>'+q.q+'<br><span style="font-size:10px;color:var(--gold);font-style:italic">Rép : '+q.a+'</span>';
    var btns=document.createElement('div'); btns.className='qbtns';
    var yes=document.createElement('button'); yes.className='qbtn'+(ans===true?' yes':''); yes.textContent='✓';
    var no=document.createElement('button');  no.className='qbtn'+(ans===false?' no':'');  no.textContent='✗';
    yes.onclick=(function(idx){return function(){S.quizAnswers[idx]=true; save();saveMJ();renderQuiz();renderLB();};})(i);
    no.onclick =(function(idx){return function(){S.quizAnswers[idx]=false;save();saveMJ();renderQuiz();renderLB();};})(i);
    btns.appendChild(yes); btns.appendChild(no);
    row.appendChild(txt); row.appendChild(btns);
    el.appendChild(row);
  });
  var bonus=document.getElementById('quizBonus'); if(!bonus) return;
  bonus.innerHTML='<div style="font-family:Cinzel,serif;font-size:11px;color:var(--muted);letter-spacing:1px;margin-bottom:8px">BONUS PAR ÉQUIPE</div>'
    +Object.keys(TEAMS).map(function(k){
      var t=TEAMS[k];
      var n=QUIZ.filter(function(q,i){return q.t===k&&S.quizAnswers[i]===true;}).length;
      return '<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px">'
        +'<span style="color:'+t.color+'">'+t.name+'</span>'
        +'<span style="font-family:Cinzel,serif;color:var(--ok)">-'+(n*0.5).toFixed(1)+' min ('+n+'/4)</span></div>';
    }).join('');
}

function renderLB() {
  var el=document.getElementById('lbDiv'); if(!el) return;
  var now=Date.now();
  var entries=Object.keys(TEAMS).map(function(k){
    var t=TEAMS[k], st=S.mjST[k], end=S.mjEnd[k];
    var qBonus=QUIZ.filter(function(q,i){return q.t===k&&S.quizAnswers[i]===true;}).length*0.5;
    var elapsed=st?(end?(end-st):(now-st)):null;
    return {t:t,elapsed:elapsed,qBonus:qBonus,done:!!end};
  });
  entries.sort(function(a,b){
    if(a.done&&b.done) return a.elapsed-b.elapsed;
    if(a.done) return -1; if(b.done) return 1;
    if(a.elapsed&&b.elapsed) return a.elapsed-b.elapsed;
    if(a.elapsed) return -1; if(b.elapsed) return 1; return 0;
  });
  var medals=['1.','2.','3.'];
  el.innerHTML=entries.map(function(e,i){
    var ts=e.elapsed?fmt(e.elapsed):'—';
    var status=e.done?'Terminé':e.elapsed?'En cours':'Pas encore parti';
    return '<div class="lbrow"><div style="font-family:Cinzel,serif;font-size:18px;width:28px;text-align:center;flex-shrink:0">'+(i<3?medals[i]:(i+1)+'.')+'</div>'
      +'<div style="flex:1"><div style="font-family:Cinzel,serif;font-size:13px;margin-bottom:2px;color:'+e.t.color+'">'+e.t.name+'</div>'
      +'<div style="font-size:12px;color:var(--muted)">'+status+' · bonus -'+e.qBonus.toFixed(1)+' min</div></div>'
      +'<div style="font-family:Cinzel,serif;font-size:16px;color:'+e.t.color+'">'+ts+'</div></div>';
  }).join('');
}

function openMJ() {
  th(null); renderMJLive(); renderMJTabs(); renderMJContent();
  go('s11','forward');
  if(S.mjIv) clearInterval(S.mjIv);
  S.mjIv=setInterval(renderMJLive,5000);
}

function renderMJLive() {
  var now=Date.now(), el=document.getElementById('mjLive'); if(!el) return;
  el.innerHTML=Object.keys(TEAMS).map(function(k){
    var t=TEAMS[k], st=S.mjST[k], end=S.mjEnd[k];
    var elapsed=st?(end?fmt(end-st):fmt(now-st)):'—';
    var stat=end?'Terminé':st?'En cours':'Pas encore parti';
    var resetBtn=st?'<button onclick="resetTeamChrono(\''+k+'\')" style="font-size:10px;padding:3px 8px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:var(--muted);border-radius:6px;cursor:pointer;font-family:Cinzel,serif;margin-left:8px;touch-action:manipulation">↺</button>':'';
    return '<div class="mjlr">'
      +'<div style="flex:1"><div style="font-family:Cinzel,serif;font-size:13px;color:'+t.color+'">'+t.name+'</div>'
      +'<div style="font-size:12px;color:var(--muted);margin-top:2px">'+stat+'</div></div>'
      +'<div style="display:flex;align-items:center"><span style="font-family:Cinzel,serif;font-size:16px;color:'+t.color+'">'+elapsed+'</span>'+resetBtn+'</div>'
      +'</div>';
  }).join('');
}

function resetTeamChrono(k) {
  if (!confirm('Réinitialiser le chrono de '+TEAMS[k].name+' ?')) return;
  delete S.mjST[k]; delete S.mjEnd[k];
  saveMJ();
  renderMJLive();
}

function renderMJTabs() {
  var t=TEAMS[S.mjT];
  var tt=document.getElementById('mjTeamTabs');
  tt.innerHTML='';
  Object.keys(TEAMS).forEach(function(k){
    var tm=TEAMS[k];
    var btn=document.createElement('button'); btn.className='mjtb'+(S.mjT===k?' on':'');
    if(S.mjT===k){btn.style.color=tm.color;btn.style.background=tm.bg;btn.style.borderColor=tm.border;}
    btn.textContent=tm.name.replace('Équipe ','');
    btn.addEventListener('click',(function(key){return function(){S.mjT=key;S.mjC='ferme';renderMJTabs();renderMJContent();};})(k));
    tt.appendChild(btn);
  });
  var ct=document.getElementById('mjCPTabs');
  ct.innerHTML='';
  var all=['ferme'].concat(t.route);
  all.forEach(function(ck){
    var cp=CPS[ck];
    var btn=document.createElement('button'); btn.className='mjtb'+(S.mjC===ck?' on':'');
    if(S.mjC===ck){btn.style.color='var(--gold)';btn.style.background='var(--gd)';btn.style.borderColor='var(--gb)';}
    var label=cp.name.replace('Église Saint-Jean-Baptiste','Église').replace('La Mairie','Mairie').replace('Le Lavoir','Lavoir').replace('La Fresque du portail','Fresque').replace('Salle Polyvalente de la Rose','Salle').replace("La Ferme d'Octave","Ferme (depart)");
    btn.textContent=label;
    btn.addEventListener('click',(function(key){return function(){S.mjC=key;renderMJTabs();renderMJContent();};})(ck));
    ct.appendChild(btn);
  });
}

function renderMJContent() {
  var t=TEAMS[S.mjT], cp=CPS[S.mjC], hints=(HINTS[S.mjC]||{})[S.mjT]||[];
  var ri=S.mjC==='ferme'?-1:t.route.indexOf(S.mjC);
  var nk=ri+1<t.route.length?t.route[ri+1]:'ferme', ncp=CPS[nk];
  var html='<div style="background:'+t.bg+';border:1px solid '+t.border+';border-radius:12px;padding:11px 14px;margin-bottom:10px">'
    +'<div style="font-family:Cinzel,serif;font-size:13px;color:'+t.color+';margin-bottom:4px">'+t.name+' — '+(cp.icon?'<img class="cp-img sm" src="'+cp.icon+'"> ':'')+cp.name+'</div>'
    +'<div style="font-size:12px;color:var(--muted);margin-bottom:4px">'+cp.addr+(cp.code?' · Code : <b style="color:'+t.color+';letter-spacing:2px">'+cp.code+'</b>':'')+'</div>'
    +'<div style="font-size:12px;color:var(--muted)">→ Destination : '+(ncp.icon?'<img class="cp-img sm" src="'+ncp.icon+'"> ':'')+' <b style="color:'+t.color+'">'+ncp.name+'</b></div>'
    +'</div>';
  LVL.forEach(function(lvl,idx){
    html+='<div style="background:'+lvl.c+'0d;border:1px solid '+lvl.c+'38;border-radius:10px;padding:10px 14px;margin-bottom:8px">'
      +'<div style="display:flex;justify-content:space-between;margin-bottom:5px">'
      +'<span style="font-family:Cinzel,serif;font-size:12px;color:'+lvl.c+';font-weight:700">'+lvl.l+'</span>'
      +'<span style="font-size:11px;background:'+lvl.c+'1a;border:1px solid '+lvl.c+'30;color:'+lvl.c+';padding:2px 7px;border-radius:7px">'+(lvl.p===0?'Gratuit':'+'+lvl.p+' min')+'</span>'
      +'</div>'
      +'<p style="font-size:12px;font-style:italic;color:var(--text);line-height:1.75">« '+(hints[idx]||'—')+' »</p>'
      +'</div>';
  });
  var el=document.getElementById('mjContent'); if(el) el.innerHTML=html;
}

// ═══════════════════════════════════════════
// MODE TEST
// ═══════════════════════════════════════════
function renderTestTeamTabs() {
  var el=document.getElementById('testTeamTabs'); if(!el) return;
  el.innerHTML='';
  Object.keys(TEAMS).forEach(function(k){
    var tm=TEAMS[k];
    var btn=document.createElement('button');
    btn.className='mjtb'+(S.mjT===k?' on':'');
    if(S.mjT===k){btn.style.color=tm.color;btn.style.background=tm.bg;btn.style.borderColor=tm.border;}
    btn.textContent=tm.name.replace('Équipe ','');
    btn.addEventListener('click',(function(key){
      return function(){
        S.team=TEAMS[key]; S.mjT=key;
        if(!S.t0) S.t0=Date.now();
        renderTestTeamTabs();
      };
    })(k));
    el.appendChild(btn);
  });
}

// Hard pass: force next screen in game flow, bypass all checks
function hardPass() {
  if (!_mjMode) return;
  var cur = document.querySelector('.screen:not(.hidden)');
  var id = cur ? cur.id : '';
  // Ensure basics
  if (!S.team) { S.team = TEAMS[Object.keys(TEAMS)[0]]; }
  if (!S.t0) S.t0 = Date.now();
  th(S.team);

  if (id === 'sSplash' || id === 's1') {
    // Pick first team and go to briefing
    doSelTeam(Object.keys(TEAMS)[0]);
  } else if (id === 's2') {
    // Skip airplane check
    if (S.pendingTeam) doSelTeam(S.pendingTeam);
    else doSelTeam(S.team.key);
  } else if (id === 's3') {
    // Skip briefing → countdown → start
    startGame();
  } else if (id === 's4') {
    // Skip countdown
    S.t0 = Date.now();
    S.iv = setInterval(tick, 1000);
    showS5();
  } else if (id === 's5') {
    // Skip first destination input → go to first checkpoint
    showEnRoute(S.team.route[0]);
  } else if (id === 's6') {
    // If returning to ferme (last stage), go to arrival
    if (S.idx >= S.team.route.length) { showArrival(); }
    else { showEnigme(curCP()); }
  } else if (id === 'sEnigme') {
    // Skip enigme → show code entry
    showCode(curCP());
  } else if (id === 's7') {
    // Auto-validate code + advance
    S.cpTimes.push({ cp: curCP(), t: Date.now() });
    var isLast = (S.idx >= S.team.route.length - 1);
    if (isLast) { S.idx++; save(); showReturnHome(); }
    else { showHintsScreen(curCP()); }
  } else if (id === 's8') {
    // Skip destination input → advance to next checkpoint
    S.idx++; save();
    var nk = S.idx >= S.team.route.length ? 'ferme' : S.team.route[S.idx];
    if (nk === 'ferme') showReturnHome();
    else showEnRoute(nk);
  } else if (id === 's9') {
    toast('Déjà arrivé !');
  } else {
    toast('Hard pass: écran ' + id);
  }
}

function testGo(screenId) {
  if(!S.team){ S.team=TEAMS[Object.keys(TEAMS)[0]]; S.mjT=Object.keys(TEAMS)[0]; }
  if(!S.t0) S.t0=Date.now();
  th(S.team);
  if     (screenId==='s4')      startGame();
  else if(screenId==='s5')      showS5();
  else if(screenId==='s6')      showEnRoute(curCP());
  else if(screenId==='sEnigme') showEnigme(curCP());
  else if(screenId==='s7')      showCode(curCP());
  else if(screenId==='s8')      showHintsScreen(curCP());
  else if(screenId==='s9')      showArrival();
  else if(screenId==='s3'){
    setText('s3title',S.team.name);
    setText('s3sub',S.team.members.join(' · '));
    setText('s3flavor',S.team.flavor);
    go(screenId);
  } else go(screenId);
}

// ═══════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════
function toggleTheme() {
  var h=document.documentElement;
  var cur=h.classList.contains('light')?'light':'dark';
  var next=cur==='dark'?'light':'dark';
  h.classList.remove('light');
  if(next==='light') h.classList.add('light');
  try{localStorage.setItem('mythTheme',next);}catch(e){}
  var mc=document.querySelector('meta[name="theme-color"]');
  var colors={dark:'#120e0a',light:'#f5f0e6'};
  if(mc) mc.setAttribute('content',colors[next]);
  var icon=document.getElementById('themeIcon');
  if(icon) icon.innerHTML = next==='dark'
    ? '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
    : '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  // Re-apply team color for light/dark switch
  if (S.team) th(S.team);
}

// ═══════════════════════════════════════════
// MAP + PHOTO HINT BUTTONS
// ═══════════════════════════════════════════
var _mapUsed = false;
var _photoUsed = {};

// Placeholder photos par lieu (remplacer par les vrais fichiers plus tard)
var PHOTO_HINTS = {
  fresque: "photo-fresque.png",
  eglise:  "photo-eglise.png",
  lavoir:  "photo-lavoir.png",
  salle:   "photo-salle.png",
  mairie:  "photo-mairie.png"
};

function showHelpDrawer(show) {
  var drawer = document.getElementById('helpDrawer');
  if (!drawer) return;
  drawer.style.display = show ? 'block' : 'none';
  // Always close panel when switching screens
  var panel = document.getElementById('helpPanel');
  var tab = document.getElementById('helpTab');
  if (panel) panel.style.display = 'none';
  if (tab) tab.style.display = '';
  // Update map button state
  var mapBtn = document.getElementById('btnMap');
  if (mapBtn) {
    if (_mapUsed) mapBtn.classList.add('used');
    else mapBtn.classList.remove('used');
  }
}

function showPhotoBtn(show) {
  var btn = document.getElementById('btnPhoto');
  if (btn) btn.style.display = show ? '' : 'none';
}

function toggleHelpPanel() {
  var panel = document.getElementById('helpPanel');
  var tab = document.getElementById('helpTab');
  if (!panel) return;
  var open = panel.style.display === 'flex';
  panel.style.display = open ? 'none' : 'flex';
  if (tab) tab.style.display = open ? '' : 'none';
}

var MAP_WARN = {
  grec: "Athéna vous offre un regard depuis l'Olympe — mais toute aide divine a un prix.",
  nordique: "Odin a sacrifié un œil pour la sagesse. Ce savoir aussi a un coût.",
  hindou: "Ganesh, guide des voyageurs, accepte de vous montrer le chemin — mais le karma n'oublie rien."
};

function openMap() {
  if (_mapUsed) {
    toast('Carte déjà consultée — usage unique');
    return;
  }
  // Show confirmation first
  var tk = S.team ? S.team.key : 'grec';
  var ov = document.getElementById('mapConfirm');
  if (ov) {
    document.getElementById('mapWarnLore').textContent = MAP_WARN[tk] || MAP_WARN.grec;
    ov.style.display = 'flex';
    toggleHelpPanel();
    return;
  }
  doOpenMap();
}

function doOpenMap() {
  _mapUsed = true;
  addP(15, 'Carte consultée');
  toast('+15 min — Carte');
  vibrate(VIB.map);
  // Griser le bouton
  var btn = document.getElementById('btnMap');
  if (btn) btn.classList.add('used');
  var ov = document.getElementById('mapOverlay');
  if (!ov) return;
  ov.style.display = 'flex';
  var timer = document.getElementById('mapTimer');
  var sec = 5;
  if (timer) timer.textContent = sec;
  var iv = setInterval(function() {
    sec--;
    if (timer) timer.textContent = sec;
    if (sec <= 0) {
      clearInterval(iv);
      ov.style.display = 'none';
    }
  }, 1000);
}

var PHOTO_WARN = {
  grec: "Les Moires tissent votre destin — cette vision vous coûtera du fil.",
  nordique: "Les Nornes vous accordent un aperçu du futur. Mais le temps file au sablier d'Yggdrasil.",
  hindou: "Shiva ouvre son troisième œil pour vous. Chaque révélation a son prix karmique."
};

function openPhoto() {
  var cpk = curCP();
  // Already used for this checkpoint — reopen directly
  if (_photoUsed[cpk]) {
    doOpenPhoto();
    return;
  }
  // Show confirmation
  var tk = S.team ? S.team.key : 'grec';
  var ov = document.getElementById('photoConfirm');
  if (ov) {
    document.getElementById('photoWarnLore').textContent = PHOTO_WARN[tk] || PHOTO_WARN.grec;
    ov.style.display = 'flex';
    return;
  }
  doOpenPhoto();
}

function doOpenPhoto() {
  var cpk = curCP();
  if (!_photoUsed[cpk]) {
    _photoUsed[cpk] = true;
    addP(15, 'Photo indice — ' + (CPS[cpk] ? CPS[cpk].name : cpk));
    toast('+15 min — Photo indice');
    vibrate(VIB.map);
  }
  var ov = document.getElementById('photoOverlay');
  var img = document.getElementById('photoImg');
  if (img) {
    img.src = PHOTO_HINTS[cpk] || 'photo-placeholder.png';
    img.onerror = function() {
      img.style.display = 'none';
      var wrap = document.getElementById('photoImgWrap');
      if (wrap) wrap.innerHTML = '<div style="text-align:center;color:var(--muted);font-style:italic;padding:40px">Photo non disponible<br><span style=font-size:12px>(' + (PHOTO_HINTS[cpk] || 'photo-placeholder.png') + ')</span></div>';
    };
  }
  if (ov) ov.style.display = 'flex';
}

function closePhoto() {
  var ov = document.getElementById('photoOverlay');
  if (ov) ov.style.display = 'none';
}

// ═══════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════
document.getElementById('btnAP').onclick = function(){
  var btn=this, orig=btn.textContent;
  btn.disabled=true; btn.textContent='Vérification…';
  checkOnline(function(online){
    btn.disabled=false; btn.textContent=orig;
    if(online){
      var e=document.getElementById('s2err');
      if(e) e.textContent='Toujours connecté. Désactivez WiFi et données mobiles.';
      return;
    }
    var e=document.getElementById('s2err'); if(e) e.textContent='';
    if(S.pendingTeam){ doSelTeam(S.pendingTeam); S.pendingTeam=null; }
  });
};
document.getElementById('btnStart').onclick = function(){
  var btn=this, orig=btn.textContent;
  btn.disabled=true; btn.textContent='Vérification…';
  checkOnline(function(online){
    btn.disabled=false; btn.textContent=orig;
    if(online){ go('s2'); var e=document.getElementById('s2err'); if(e) e.textContent='Connexion détectée. Mode avion requis.'; return; }
    startGame();
  });
};
document.getElementById('btnBackTeam').onclick = function(){
  // Reset team card styles when going back
  var cards=document.querySelectorAll('#teamList .tcard');
  cards.forEach(function(card){ card.style.transition=''; card.style.transform=''; card.style.opacity=''; card.style.boxShadow=''; card.style.pointerEvents=''; card.style.borderColor=''; });
  th(null);
  go('s1','back');
};
var _lastTap=0;
function guardTap(fn){ return function(){ var now=Date.now(); if(now-_lastTap<600) return; _lastTap=now; fn(); }; }
document.getElementById('btnGoStart').onclick = guardTap(function(){
  confirmDest('destStart','destStartErr',S.team&&S.team.route[0],function(){ showEnRoute(S.team.route[0]); save(); });
});
document.getElementById('btnFoundCache').onclick = guardTap(function(){ showCode(curCP()); });
document.getElementById('btnCode').onclick   = guardTap(function(){ validateCode(); });
document.getElementById('btnNext').onclick   = guardTap(function(){
  var nk=nextK();
  confirmDest('destNext','destNextErr',nk,function(){ S.idx++; save(); if(nk==='ferme') showReturnHome(); else showEnRoute(nk); });
});
document.getElementById('helpTab').onclick = function(){ toggleHelpPanel(); };
document.getElementById('helpClose').onclick = function(){ toggleHelpPanel(); };
document.getElementById('btnMap').onclick = function(){ openMap(); };
document.getElementById('btnPhoto').onclick = function(){ openPhoto(); toggleHelpPanel(); };
document.getElementById('btnMapCancel').onclick = function(){
  document.getElementById('mapConfirm').style.display = 'none';
};
document.getElementById('btnMapConfirm').onclick = function(){
  document.getElementById('mapConfirm').style.display = 'none';
  doOpenMap();
};
document.getElementById('btnPhotoCancel').onclick = function(){
  document.getElementById('photoConfirm').style.display = 'none';
};
document.getElementById('btnPhotoConfirm').onclick = function(){
  document.getElementById('photoConfirm').style.display = 'none';
  doOpenPhoto();
};
document.getElementById('btnClosePhoto').onclick = function(){ closePhoto(); };
document.getElementById('btnMJAccess').onclick = function(){ buildMJRow(); setText('mjErr',''); go('s10','forward'); };
document.getElementById('btnMJLogin').onclick  = function(){ loginMJ(); };
document.getElementById('btnMJBack').onclick   = function(){ go('s1','back'); };
document.getElementById('btnMJHome').onclick   = function(){ go('s1','back'); };
// btnReset removed — teams cannot change after finishing
document.getElementById('btnTestMode').onclick = function(){ renderTestTeamTabs(); go('sTest','forward'); };
document.getElementById('btnS9Test').onclick = function(){ renderTestTeamTabs(); go('sTest','forward'); };
document.getElementById('btnS9Home').onclick = function(){ resetGame(); };

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
setupPWA();
// Service Worker — aggressive update for Safari
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(function(reg) {
    // Force check for update on every page load
    reg.update().catch(function(){});
    // Also check every 30 seconds (Safari can be lazy)
    setInterval(function(){ reg.update().catch(function(){}); }, 30000);
    // When new SW is found, auto-activate + reload
    reg.addEventListener('updatefound', function() {
      var nw = reg.installing;
      if (nw) nw.addEventListener('statechange', function() {
        if (nw.state === 'installed' && navigator.serviceWorker.controller) {
          // New version ready — tell it to activate immediately
          nw.postMessage('skipWaiting');
        }
      });
    });
    // When new SW takes control, reload page
    var refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', function() {
      if (refreshing) return;
      refreshing = true;
      location.reload();
    });
  }).catch(function(){});
}
loadMJ();
// Restore MJ mode from localStorage
try { if (localStorage.getItem('myth_mj_mode') === '1') _mjMode = true; } catch(e) {}
renderTeams();
// Apply saved theme
(function(){
  var t = ''; try { t = localStorage.getItem('mythTheme') || ''; } catch(e) {}
  if (t === 'light') {
    document.documentElement.classList.add('light');
    var mc = document.querySelector('meta[name="theme-color"]');
    if (mc) mc.setAttribute('content', '#f5f0e6');
    var icon = document.getElementById('themeIcon');
    if (icon) icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  }
  // Sync splash subtitle + version
  var sp = document.getElementById('splSub');
  if (sp) sp.textContent = 'Jeu d\'orientation · ' + (EVENT_LOCATION || 'Dosches') + ' · ' + (EVENT_DATE || '');
  var ver = document.getElementById('appVersion');
  if (ver) ver.textContent = 'v' + (APP_VERSION || '?');
})();
var saved = loadSaved();
if (saved && S.team && S.t0) {
  // Show recovery toast then restore
  th(S.team);
  S.iv = setInterval(tick, 1000);
  var _done = S.idx >= S.team.route.length;
  if      (saved==='s9' || _done) showArrival();
  else if (saved==='s8')       showHintsScreen(curCP());
  else if (saved==='s7')       showCode(curCP());
  else if (saved==='sEnigme')  showEnigme(curCP());
  else if (saved==='s5')       showS5();
  else { th(null); go('s1'); }
  setTimeout(function(){ toast('Partie reprise — '+S.team.name); }, 400);
} else {
  th(null);
  go('sSplash');
  createParticles('sSplash', 22);
  var _sEl = document.getElementById('sSplash');
  if (_sEl) {
    var _splashGo = function(){
      // Unlock AudioContext on first user gesture (required by iOS)
      getAudioCtx();
      go('s1', 'forward');
    };
    _sEl.addEventListener('click', _splashGo, {once: true});
    _sEl.addEventListener('touchstart', _splashGo, {once: true});
  }
}
// Sync MJ overlay at startup
syncMJOverlay();
