// ═══════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════
var S = {
  team:null, idx:0, t0:null, pen:0, oh:{}, iv:null,
  onPen:false, plog:[], mjT:"grec", mjC:"fresque",
  mjST:{}, mjIv:null, pendingTeam:null, quizAnswers:{}
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
      scr:cur&&cur.id
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
    return d.scr;
  } catch(e) { return null; }
}
function clr() { try { localStorage.removeItem(LS_KEY); } catch(e) {} }
function saveMJ() {
  try { localStorage.setItem(LS_KEY+'_mj', JSON.stringify({mjST:S.mjST,quizAnswers:S.quizAnswers})); } catch(e) {}
}
function loadMJ() {
  try {
    var d = JSON.parse(localStorage.getItem(LS_KEY+'_mj')||'null');
    if (d) { S.mjST=d.mjST||{}; S.quizAnswers=d.quizAnswers||{}; }
  } catch(e) {}
}

// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
function go(id, dir) {
  // Mark visible screen for directional exit before hiding
  if (dir === 'forward') {
    document.querySelectorAll('.screen:not(.hidden)').forEach(function(s){
      s.classList.add('exit-forward');
    });
  }
  document.querySelectorAll('.screen').forEach(function(s){ s.classList.add('hidden'); });
  var el = document.getElementById(id);
  if (el) el.classList.remove('hidden', 'exit-forward');
  // Clean exit class after transition
  setTimeout(function(){
    document.querySelectorAll('.exit-forward').forEach(function(s){ s.classList.remove('exit-forward'); });
  }, 350);
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
  for (var i = 0; i < 90; i++) {
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
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function(p) {
      ctx.beginPath();
      ctx.lineWidth = p.r * 0.6;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt, p.y);
      ctx.lineTo(p.x + p.tilt + p.r, p.y + p.r * 1.2);
      ctx.stroke();
    });
    particles.forEach(function(p) {
      p.tiltAngle += p.tiltSpeed;
      p.y += p.d;
      p.tilt = Math.sin(p.tiltAngle) * 14;
      if (p.y > canvas.height) { p.y = -10; p.x = Math.random() * canvas.width; }
    });
    frame++;
    if (frame < 220) {
      requestAnimationFrame(draw);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
    }
  }
  draw();
}

// ═══════════════════════════════════════════
// UTILS
// ═══════════════════════════════════════════
function th(t) {
  var r = document.documentElement.style;
  if (!t) { r.setProperty('--tc','var(--gold)'); r.setProperty('--tb','var(--gd)'); r.setProperty('--tbr','var(--gb)'); return; }
  r.setProperty('--tc', t.color); r.setProperty('--tb', t.bg); r.setProperty('--tbr', t.border);
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
  var t = fmt(Date.now()-S.t0), p = '+'+S.pen+' min';
  ['c5','c6','cEnigme','c7','c8'].forEach(function(id){ var e=document.getElementById(id); if(e) e.textContent=t; });
  ['p5','p6','pEnigme','p7','p8'].forEach(function(id){ var e=document.getElementById(id); if(e) e.textContent=p; });
}
function startC() { S.t0=Date.now(); S.iv=setInterval(tick,1000); acquireWakeLock(); }
function stopC()  { if(S.iv) clearInterval(S.iv); }
function curCP()  { return S.team.route[S.idx]; }
function nextK()  { return S.idx>=S.team.route.length-1 ? 'ferme' : S.team.route[S.idx+1]; }

function mkSteps(id) {
  var el=document.getElementById(id); if(!el) return;
  var r = S.team.route.concat(['ferme']);
  el.innerHTML = r.map(function(_,i){
    var c='sd'; if(i<S.idx) c+=' done'; if(i===S.idx) c+=' active';
    return '<div class="'+c+'"></div>';
  }).join('');
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
  if (!TEST_MODE) { ov.style.display='none'; return; }
  ov.style.display = 'block';
  var body = document.getElementById('testOvBody'); if (!body) return;
  if (!S.team || !S.t0) { body.innerHTML = '<div class="tov-row" style="font-style:italic">Pas de session active</div>'; return; }
  // Sur l'écran indices (s8), le code courant est déjà validé — montrer le suivant
  var cpk = showNext ? nextK() : curCP();
  var cp  = CPS[cpk] || {};
  body.innerHTML =
    '<div class="tov-row">CP<br><span class="tov-val">'+(cp.icon||'')+' '+(cp.name||cpk)+'</span></div>'
   +'<div class="tov-row">Code<br><span class="tov-val" style="letter-spacing:3px">'+(cp.code||'—')+'</span></div>';
}

// ═══════════════════════════════════════════
// ONLINE DETECTION
// ═══════════════════════════════════════════
window.addEventListener('online', function() {
  if (!S.t0 || S.onPen) return;
  S.onPen=true; addP(30,'Connexion internet détectée'); playSound('penalty'); vibrate([200, 80, 200]);
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
  var m={name:"Mythologies",short_name:"Mythologies",start_url:"./",display:"standalone",background_color:"#120e0a",theme_color:"#120e0a",icons:[{src:u,sizes:"512x512",type:"image/png"}]};
  try {
    var b=new Blob([JSON.stringify(m)],{type:'application/manifest+json'});
    var ml=document.getElementById('manifestLink'); if(ml) ml.href=URL.createObjectURL(b);
  } catch(e){}
}

// ═══════════════════════════════════════════
// SCREEN 1: TEAM SELECT
// ═══════════════════════════════════════════
function renderTeams() {
  var c=document.getElementById('teamList'); if(!c) return;
  c.innerHTML = Object.keys(TEAMS).map(function(k){
    var t=TEAMS[k];
    return '<div class="tcard" style="border-color:'+t.border+';background:'+t.bg+';--team-color:'+t.color+'" onclick="selTeam(\''+k+'\')" onmouseenter="this.style.boxShadow=\'0 0 0 1px '+t.border+'\'" onmouseleave="this.style.boxShadow=\'\'">'
      +'<div style="position:absolute;left:0;top:0;bottom:0;width:3px;background:'+t.color+';border-radius:2px 0 0 2px;opacity:.8"></div>'
      +'<div class="tn" style="color:'+t.color+'">'+t.mascot+' '+t.name+'</div>'
      +'<div style="font-size:12px;font-style:italic;color:'+t.color+';opacity:.75;margin-bottom:6px">'+t.tagline+'</div>'
      +'<div class="tm">'+t.members.join(' · ')+'</div>'
      +'<div class="tbg" style="border-color:'+t.border+';color:'+t.color+'">Départ — La Ferme d\'Octave</div>'
      +'</div>';
  }).join('');
}

function selTeam(k) {
  checkOnline(function(online) {
    if (online) { S.pendingTeam=k; go('s2','forward'); return; }
    doSelTeam(k);
  });
}

function doSelTeam(k) {
  var t=TEAMS[k];
  S.team=t; S.idx=0; S.pen=0; S.oh={}; S.onPen=false; S.t0=null; S.plog=[]; S.quizAnswers={};
  th(t);
  setText('s3title', t.mascot+' '+t.name);
  setText('s3sub',   t.members.join(' · '));
  setText('s3flavor',t.flavor);
  go('s3','forward');
}

// ═══════════════════════════════════════════
// SCREEN 4: COUNTDOWN → SCREEN 5
// ═══════════════════════════════════════════
function startGame() {
  go('s4','forward');
  var el=document.getElementById('cdNum'), n=3;
  el.textContent=n;
  playSound('tick');
  var iv=setInterval(function(){
    el.style.transform='scale(1.3)';
    setTimeout(function(){ el.style.transform='scale(1)'; },150);
    n--;
    if(n===0){
      el.innerHTML='<span style="font-family:\'Cinzel Decorative\',serif;font-size:46px;letter-spacing:4px;animation:partez .55s cubic-bezier(.2,1.4,.4,1) forwards;display:inline-block;text-shadow:0 0 50px rgba(255,220,100,.9),0 0 100px rgba(201,168,76,.5)">PARTEZ !</span>';
      var s4bg=document.getElementById('s4');
      if(s4bg){s4bg.style.transition='background .15s';s4bg.style.background='rgba(201,168,76,.12)';setTimeout(function(){s4bg.style.background='';},400);}
      clearInterval(iv);
      setTimeout(function(){ startC(); if(S.team) S.mjST[S.team.key]=S.t0; showS5(); save(); saveMJ(); },800);
    } else {
      playSound('tick');
      el.textContent=n;
    }
  },900);
}

// ═══════════════════════════════════════════
// SCREEN 5: START HINTS
// ═══════════════════════════════════════════
function showS5() {
  var t=S.team; th(t);
  setText('s5title', t.mascot+' '+t.name);
  setText('s5sub',   t.members.join(' · '));
  mkSteps('st5');
  buildHints('hintsStart','ferme',t.key);
  var di=document.getElementById('destStart'); if(di) di.value='';
  setText('destStartErr','');
  go('s5','forward'); updateTestOverlay();
}

// ═══════════════════════════════════════════
// SCREEN 6: EN ROUTE
// ═══════════════════════════════════════════
function showEnRoute(cpk) {
  var cp=CPS[cpk], t=S.team; th(t);
  setText('s6title', t.mascot+' '+t.name);
  setText('erIcon',  cp.icon);
  setText('erName',  cp.name); setStyle('erName','color',t.color);
  setText('erAddr',  cp.addr);
  mkSteps('st6');
  go('s6','forward');
  var auto=setTimeout(function(){ showEnigme(cpk); },3500);
  var s6=document.getElementById('s6');
  s6.onclick=function(e){ if(e.target.id==='btnEnRouteBack') return; clearTimeout(auto); s6.onclick=null; showEnigme(cpk); };
  var backBtn=document.getElementById('btnEnRouteBack');
  if(backBtn){
    backBtn.onclick=function(e){
      e.stopPropagation(); clearTimeout(auto); s6.onclick=null;
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
  document.getElementById('enigTitle').textContent=t.mascot+' '+t.name;
  document.getElementById('enigCPName').textContent=cp.icon+' '+cp.name;
  document.getElementById('enigCPAddr').textContent=cp.addr;
  document.getElementById('enigText').textContent=ENIGMES[cpk]||'Cherchez la cachette sur ce lieu.';
  mkSteps('stEnigme');
  go('sEnigme','forward'); updateTestOverlay();
}

// ═══════════════════════════════════════════
// SCREEN 7: CODE
// ═══════════════════════════════════════════
function showCode(cpk) {
  var s6=document.getElementById('s6'); if(s6) s6.onclick=null;
  var cp=CPS[cpk], t=S.team; th(t);
  setText('s7title',  t.mascot+' '+t.name);
  setText('s7cpName', cp.icon+' '+cp.name);
  setText('s7cpAddr', cp.addr);
  setText('codeErr',  '');
  mkSteps('st7');
  buildCodeRow();
  go('s7','forward'); updateTestOverlay();
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
        if(v&&idx<3){ var next=row.children[idx+1]; if(next) next.focus(); }
        // Auto-submit quand les 4 cases sont remplies
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
    for(var i=0;i<4;i++){ if(row.children[i]) row.children[i].classList.add('ok'); }
    if(document.activeElement) document.activeElement.blur();
    flashSuccess();
    playSound('success');
    vibrate([80,50,80]);
    setTimeout(function(){ showCit(S.team.key); },50);
    setTimeout(function(){ showHintsScreen(cpk); },700);
  } else {
    for(var i=0;i<4;i++){
      (function(el){ el.classList.add('err'); setTimeout(function(){ el.classList.remove('err'); },300); })(row.children[i]);
    }
    setText('codeErr','Code incorrect — cherchez encore…');
    playSound('error');
    vibrate([250]);
  }
}

// ═══════════════════════════════════════════
// SCREEN 8: HINTS
// ═══════════════════════════════════════════
function showHintsScreen(cpk) {
  var cp=CPS[cpk], t=S.team; th(t);
  setText('s8title',  t.mascot+' '+t.name);
  setText('s8sub',    t.members.join(' · '));
  setText('s8cpName', cp.icon+' '+cp.name);
  setText('s8cpAddr', cp.addr);
  mkSteps('st8');
  buildHints('hintsList',cpk,t.key);
  var di=document.getElementById('destNext'); if(di) di.value='';
  setText('destNextErr','');
  go('s8','forward'); updateTestOverlay(true);
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
    addP(2,'Mauvaise destination');
    if(err) err.textContent='Mauvaise destination — +2 min';
    playSound('penalty'); vibrate([120, 60, 120]);
    inp.value='';
  }
}

// ═══════════════════════════════════════════
// SCREEN 9: ARRIVAL
// ═══════════════════════════════════════════
function showArrival() {
  stopC(); var t=S.team; th(t);
  var el=Date.now()-S.t0, tot=el/60000+S.pen;
  setText('s9team',   t.mascot+' '+t.name); setStyle('s9team','color',t.color);
  setText('s9title',  '✦ ARRIVÉE ✦'); setStyle('s9title','color',t.color);
  setText('s9flavor', t.arrival);
  var rows=S.plog.map(function(p){
    return '<div class="srow"><span class="sl" style="padding-left:12px;font-size:12px">↳ '+p.reason+'</span><span class="sv" style="color:#e74c3c;font-size:13px">+'+p.min+' min</span></div>';
  }).join('');
  var bd=document.getElementById('scoreDiv');
  if(bd) bd.innerHTML=''
    +'<div class="srow"><span class="sl">Temps de parcours</span><span class="sv">'+fmt(el)+'</span></div>'
    +(S.plog.length
      ?'<div class="srow"><span class="sl">Pénalités totales</span><span class="sv" style="color:#e74c3c">+'+S.pen+' min</span></div>'+rows
      :'<div class="srow"><span class="sl">Pénalités</span><span class="sv" style="color:var(--ok)">Aucune</span></div>')
    +'<div class="srow" style="padding-top:12px;margin-top:6px;border-top:1px solid var(--tbr)"><span class="sl" style="font-family:\'Cinzel\',serif;color:var(--text)">SCORE PROVISOIRE</span><span class="sv" style="font-size:22px">'+tot.toFixed(1)+' min</span></div>'
    +'<p style="font-size:11px;color:var(--muted);text-align:center;margin-top:6px;font-style:italic">Score final = ce score − (bonnes réponses quiz × 0,5 min)</p>';
  var ov=document.getElementById('testOv'); if(ov) ov.style.display='none';
  clr(); go('s9','forward');
  setTimeout(function(){ playSound('fanfare'); vibrate([80,40,80,40,200]); launchConfetti(); }, 200);
}

function resetGame() {
  stopC();
  // Préserver les données MJ entre les équipes
  var mjST = S.mjST, quizAnswers = S.quizAnswers, mjT = S.mjT, mjC = S.mjC, mjIv = S.mjIv;
  S={team:null,idx:0,t0:null,pen:0,oh:{},iv:null,onPen:false,plog:[],mjT:mjT,mjC:mjC,mjST:mjST,mjIv:mjIv,pendingTeam:null,quizAnswers:quizAnswers};
  clr(); saveMJ(); th(null);
  var ov=document.getElementById('testOv'); if(ov) ov.style.display='none';
  go('s1','back');
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
    inp.style.cssText='width:48px;height:58px;border-radius:10px;border:2px solid rgba(200,0,0,.35);background:rgba(180,0,0,.08);font-family:Cinzel,serif;font-size:24px;font-weight:700;color:#e05050;text-align:center;text-transform:uppercase;outline:none;margin:0 4px';
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
  if(e===MJ_CODE){ setText('mjErr',''); openMJ(); }
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
    var mascot=TEAMS[q.t]?TEAMS[q.t].mascot+' '+TEAMS[q.t].name:'';
    txt.innerHTML='<span style="font-size:10px;color:'+tc+';font-family:Cinzel,serif;display:block;margin-bottom:2px">'+mascot+'</span>'+q.q+'<br><span style="font-size:10px;color:var(--gold);font-style:italic">Rép : '+q.a+'</span>';
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
        +'<span style="color:'+t.color+'">'+t.mascot+' '+t.name+'</span>'
        +'<span style="font-family:Cinzel,serif;color:var(--ok)">-'+(n*0.5).toFixed(1)+' min ('+n+'/4)</span></div>';
    }).join('');
}

function renderLB() {
  var el=document.getElementById('lbDiv'); if(!el) return;
  var now=Date.now();
  var entries=Object.keys(TEAMS).map(function(k){
    var t=TEAMS[k], st=S.mjST[k];
    var qBonus=QUIZ.filter(function(q,i){return q.t===k&&S.quizAnswers[i]===true;}).length*0.5;
    var elapsed=st?(now-st):null;
    return {t:t,elapsed:elapsed,qBonus:qBonus};
  });
  entries.sort(function(a,b){
    if(a.elapsed&&b.elapsed) return a.elapsed-b.elapsed;
    if(a.elapsed) return -1; if(b.elapsed) return 1; return 0;
  });
  var medals=['🥇','🥈','🥉'];
  el.innerHTML=entries.map(function(e,i){
    var ts=e.elapsed?fmt(e.elapsed):'—';
    var status=e.elapsed?'En cours':'Pas encore parti';
    return '<div class="lbrow"><div style="font-family:Cinzel,serif;font-size:18px;width:28px;text-align:center;flex-shrink:0">'+(i<3?medals[i]:(i+1)+'.')+'</div>'
      +'<div style="flex:1"><div style="font-family:Cinzel,serif;font-size:13px;margin-bottom:2px;color:'+e.t.color+'">'+e.t.mascot+' '+e.t.name+'</div>'
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
    var t=TEAMS[k], st=S.mjST[k], elapsed=st?fmt(now-st):'—', stat=st?'En cours':'Pas encore parti';
    var resetBtn=st?'<button onclick="resetTeamChrono(\''+k+'\')" style="font-size:10px;padding:3px 8px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:var(--muted);border-radius:6px;cursor:pointer;font-family:Cinzel,serif;margin-left:8px;touch-action:manipulation">↺</button>':'';
    return '<div class="mjlr">'
      +'<div style="flex:1"><div style="font-family:Cinzel,serif;font-size:13px;color:'+t.color+'">'+t.mascot+' '+t.name+'</div>'
      +'<div style="font-size:12px;color:var(--muted);margin-top:2px">'+stat+'</div></div>'
      +'<div style="display:flex;align-items:center"><span style="font-family:Cinzel,serif;font-size:16px;color:'+t.color+'">'+elapsed+'</span>'+resetBtn+'</div>'
      +'</div>';
  }).join('');
}

function resetTeamChrono(k) {
  if (!confirm('Réinitialiser le chrono de '+TEAMS[k].name+' ?')) return;
  delete S.mjST[k];
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
    btn.textContent=tm.mascot+' '+tm.name.replace('Équipe ','');
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
    var label=cp.name.replace('Église Saint-Jean-Baptiste','Église').replace('La Mairie','Mairie').replace('Le Lavoir','Lavoir').replace('La Fresque du portail','Fresque').replace('Salle Polyvalente de la Rose','Salle').replace("La Ferme d'Octave","Ferme ★");
    btn.textContent=cp.icon+' '+label;
    btn.addEventListener('click',(function(key){return function(){S.mjC=key;renderMJTabs();renderMJContent();};})(ck));
    ct.appendChild(btn);
  });
}

function renderMJContent() {
  var t=TEAMS[S.mjT], cp=CPS[S.mjC], hints=(HINTS[S.mjC]||{})[S.mjT]||[];
  var ri=S.mjC==='ferme'?-1:t.route.indexOf(S.mjC);
  var nk=ri+1<t.route.length?t.route[ri+1]:'ferme', ncp=CPS[nk];
  var html='<div style="background:'+t.bg+';border:1px solid '+t.border+';border-radius:12px;padding:11px 14px;margin-bottom:10px">'
    +'<div style="font-family:Cinzel,serif;font-size:13px;color:'+t.color+';margin-bottom:4px">'+t.mascot+' '+t.name+' — '+cp.icon+' '+cp.name+'</div>'
    +'<div style="font-size:12px;color:var(--muted);margin-bottom:4px">'+cp.addr+(cp.code?' · Code : <b style="color:'+t.color+';letter-spacing:2px">'+cp.code+'</b>':'')+'</div>'
    +'<div style="font-size:12px;color:var(--muted)">→ Destination : '+ncp.icon+' <b style="color:'+t.color+'">'+ncp.name+'</b></div>'
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
    btn.textContent=tm.mascot+' '+tm.name.replace('Équipe ','');
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
    setText('s3title',S.team.mascot+' '+S.team.name);
    setText('s3sub',S.team.members.join(' · '));
    setText('s3flavor',S.team.flavor);
    go(screenId);
  } else go(screenId);
}

// ═══════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════
function toggleTheme() {
  var isLight = document.documentElement.classList.toggle('light');
  try { localStorage.setItem('mythTheme', isLight ? 'light' : 'dark'); } catch(e) {}
  var mc = document.querySelector('meta[name="theme-color"]');
  if (mc) mc.setAttribute('content', isLight ? '#f5f0e6' : '#120e0a');
  var btn = document.getElementById('btnTheme');
  if (btn) btn.textContent = isLight ? '☽' : '☀';
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
document.getElementById('btnBackTeam').onclick = function(){ go('s1','back'); };
document.getElementById('btnGoStart').onclick = function(){
  confirmDest('destStart','destStartErr',S.team&&S.team.route[0],function(){ showEnRoute(S.team.route[0]); save(); });
};
document.getElementById('btnFoundCache').onclick = function(){ showCode(curCP()); };
document.getElementById('btnCode').onclick   = function(){ validateCode(); };
document.getElementById('btnNext').onclick   = function(){
  var nk=nextK();
  confirmDest('destNext','destNextErr',nk,function(){ S.idx++; save(); if(nk==='ferme') showArrival(); else showEnRoute(nk); });
};
document.getElementById('btnMJAccess').onclick = function(){ buildMJRow(); setText('mjErr',''); go('s10','forward'); };
document.getElementById('btnMJLogin').onclick  = function(){ loginMJ(); };
document.getElementById('btnMJBack').onclick   = function(){ go('s1','back'); };
document.getElementById('btnMJHome').onclick   = function(){ go('s1','back'); };
document.getElementById('btnReset').onclick    = function(){ resetGame(); };
document.getElementById('btnTestMode').onclick = function(){ renderTestTeamTabs(); go('sTest','forward'); };

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
setupPWA();
// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(function(){});
}
// Date depuis data.js
(function(){
  var el=document.getElementById('s1sub');
  if(el) el.textContent='Jeu d\'orientation · '+(EVENT_LOCATION||'Dosches')+' · '+(EVENT_DATE||'');
})();
loadMJ();
renderTeams();
// Apply saved theme
(function(){
  var t = ''; try { t = localStorage.getItem('mythTheme') || ''; } catch(e) {}
  if (t === 'light') {
    document.documentElement.classList.add('light');
    var mc = document.querySelector('meta[name="theme-color"]');
    if (mc) mc.setAttribute('content', '#f5f0e6');
    var btn = document.getElementById('btnTheme');
    if (btn) btn.textContent = '☽';
  }
  // Sync splash subtitle
  var sp = document.getElementById('splSub');
  if (sp) sp.textContent = 'Jeu d\'orientation · ' + (EVENT_LOCATION || 'Dosches') + ' · ' + (EVENT_DATE || '');
})();
var saved = loadSaved();
if (saved && S.team && S.t0) {
  th(S.team);
  S.iv = setInterval(tick, 1000);
  if      (saved==='s9')       showArrival();
  else if (saved==='s8')       showHintsScreen(curCP());
  else if (saved==='s7')       showCode(curCP());
  else if (saved==='sEnigme')  showEnigme(curCP());
  else if (saved==='s5')       showS5();
  else { th(null); go('s1'); }
} else {
  th(null);
  go('sSplash');
  var _sEl = document.getElementById('sSplash');
  if (_sEl) {
    _sEl.addEventListener('click', function(){ go('s1', 'forward'); }, {once: true});
    _sEl.addEventListener('touchstart', function(){ go('s1', 'forward'); }, {once: true});
  }
}
