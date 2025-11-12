
document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('sidebarToggle');
  var sidebar = document.getElementById('sidebar');
  var handle = document.getElementById('sidebarHandle');

  if (!btn || !sidebar) return;

  btn.addEventListener('click', function () {
    var isCollapsed = sidebar.classList.toggle('collapsed');
    
    btn.classList.toggle('is-active', isCollapsed);
    btn.setAttribute('aria-expanded', String(!isCollapsed));
    
    document.body.classList.toggle('sidebar-collapsed', isCollapsed);
    if (handle) {
      
      handle.hidden = !isCollapsed;
    }
  });

 
  if (handle) {
    handle.addEventListener('click', function () {
      sidebar.classList.remove('collapsed');
      btn.classList.remove('is-active');
      btn.setAttribute('aria-expanded', 'true');
      document.body.classList.remove('sidebar-collapsed');
      handle.hidden = true;
    });
  }

  
  try {
    var shouldCollapse = window.matchMedia && window.matchMedia('(max-width: 880px)').matches;
    if (shouldCollapse) {
      sidebar.classList.add('collapsed');
      btn.classList.add('is-active');
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.add('sidebar-collapsed');
      if (handle) handle.hidden = false;
    }
  } catch (e) {  }
});


document.addEventListener('DOMContentLoaded', function () {
  var canvas = document.getElementById('dotsCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var dpr = window.devicePixelRatio || 1;
  var dots = []; 
  var connections = []; 
  var selected = null; 
  var hitPadding = 6;

  
  var dotColor = '#ffffff';
 
  var dotSelected = '#ffd23f';
  var lineColor = 'rgba(0,0,0,0.6)';
  var hoverIndex = null;
  var currentTheme = 'light';

  function updateColorsFromCSS() {
    var css = getComputedStyle(document.documentElement);
    var d = css.getPropertyValue('--dot');
    var s = css.getPropertyValue('--dot-selected');
    var l = css.getPropertyValue('--line');
    if (d) dotColor = d.trim();
    if (s) dotSelected = s.trim();
    if (l) lineColor = l.trim();
  }

  function resize() {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    try {
      if (('ontouchstart' in window) || Math.max(w, h) < 720) hitPadding = 10; else hitPadding = 6;
    } catch (e) { hitPadding = 6; }

    generateDots(w, h);
    draw();
  }

  function generateDots(w, h) {
    dots = [];
    
    var count = Math.round((w * h) / 18000);
   
    if (Math.max(w, h) < 720) count = Math.round(count * 0.45);
    count = Math.max(20, Math.min(count, 450));
    for (var i = 0; i < count; i++) {
      dots.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 3 + Math.random() * 2,
      });
    }
    connections = [];
    selected = null;
  }

  function draw() {
    var w = canvas.width / dpr;
    var h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.6;
    connections.forEach(function (pair) {
      var a = dots[pair[0]];
      var b = dots[pair[1]];
      if (!a || !b) return;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });

    
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      var isSelected = (i === selected);
      var isHover = (i === hoverIndex);
      var fillColor = isSelected ? dotSelected : dotColor;

      if (isSelected) {
        
        var selGlow = (currentTheme === 'dark') ? 'rgba(255,255,255,0.98)' : 'rgba(255,111,181,0.95)';
        ctx.save();
        ctx.shadowBlur = 22;
        ctx.shadowColor = selGlow;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r + 1.8, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.restore();

        
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
      } else {
       
        if (isHover) {
          var glowColor = (currentTheme === 'dark') ? 'rgba(255,215,63,0.9)' : 'rgba(255,111,181,0.9)';
          ctx.save();
          ctx.shadowBlur = 14;
          ctx.shadowColor = glowColor;
        }
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();
        if (isHover) ctx.restore();
      }

    
      ctx.strokeStyle = (currentTheme === 'dark') ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.12)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function getMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    var x = (evt.clientX - rect.left);
    var y = (evt.clientY - rect.top);
    return { x: x, y: y };
  }

  function findDotAt(x, y) {
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      var dx = d.x - x;
      var dy = d.y - y;
      var pad = (typeof hitPadding === 'number') ? hitPadding : 6;
      if (dx * dx + dy * dy <= (d.r + pad) * (d.r + pad)) return i;
    }
    return -1;
  }

  canvas.addEventListener('click', function (evt) {
    var pos = getMousePos(evt);
    var i = findDotAt(pos.x, pos.y);
    if (i === -1) return; 

    if (selected === null) {
      
      selected = i;
    } else if (selected === i) {
      
      selected = null;
    } else {
      
      var a = Math.min(selected, i);
      var b = Math.max(selected, i);
      
      var exists = connections.some(function (p) { return p[0] === a && p[1] === b; });
      if (!exists) connections.push([a, b]);
      selected = null;
    }
    draw();
  });

 
  window.addEventListener('resize', function () {
    resize();
  });

  
  canvas.addEventListener('mousemove', function (evt) {
    var pos = getMousePos(evt);
    var i = findDotAt(pos.x, pos.y);
    if (i !== hoverIndex) {
      hoverIndex = (i === -1) ? null : i;
      draw();
    }
  });
  canvas.addEventListener('mouseout', function () { if (hoverIndex !== null) { hoverIndex = null; draw(); } });

  
  function getPosFromClient(clientX, clientY) {
    var rect = canvas.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  document.addEventListener('pointermove', function (evt) {
    
    if (evt.target === canvas) return;
    var rect = canvas.getBoundingClientRect();
    if (evt.clientX < rect.left || evt.clientX > rect.right || evt.clientY < rect.top || evt.clientY > rect.bottom) {
      if (hoverIndex !== null) { hoverIndex = null; draw(); }
      return;
    }
    var pos = getPosFromClient(evt.clientX, evt.clientY);
    var i = findDotAt(pos.x, pos.y);
    if (i !== hoverIndex) {
      hoverIndex = (i === -1) ? null : i;
      draw();
    }
  }, { passive: true });

  document.addEventListener('pointerdown', function (evt) {
    
    if (evt.target === canvas) return;
    var rect = canvas.getBoundingClientRect();
    if (evt.clientX < rect.left || evt.clientX > rect.right || evt.clientY < rect.top || evt.clientY > rect.bottom) return;
    var pos = getPosFromClient(evt.clientX, evt.clientY);
    var i = findDotAt(pos.x, pos.y);
    if (i === -1) return;

    if (selected === null) {
      selected = i;
    } else if (selected === i) {
      selected = null;
    } else {
      var a = Math.min(selected, i);
      var b = Math.max(selected, i);
      var exists = connections.some(function (p) { return p[0] === a && p[1] === b; });
      if (!exists) connections.push([a, b]);
      selected = null;
    }
    draw();
  }, { passive: true });

  
  window.addEventListener('themechange', function (ev) {
    
    var theme = ev && ev.detail && ev.detail.theme;
    if (theme) {
      
      currentTheme = theme;
      
      if (theme === 'dark') {
       
        dotColor = '#ffffff';
        dotSelected = getComputedStyle(document.documentElement).getPropertyValue('--dot-selected') || '#ffd23f';
        lineColor = getComputedStyle(document.documentElement).getPropertyValue('--line') || 'rgba(255,255,255,0.12)';
      } else {
        currentTheme = 'light';
        dotColor = '#7a4ea8';
        dotSelected = '#ff6fb5';
        lineColor = 'rgba(90,30,120,0.25)';
      }
    } else {
      updateColorsFromCSS();
    }
    draw();
  });

  
  (function detectInitialTheme() {
    var saved = null;
    try { saved = localStorage.getItem('site-theme'); } catch (e) { }
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    currentTheme = saved || (prefersDark ? 'dark' : 'light');

    if (currentTheme === 'dark') {
  
      dotColor = '#ffffff';
      dotSelected = '#ffd23f';
      lineColor = getComputedStyle(document.documentElement).getPropertyValue('--line') || 'rgba(255,255,255,0.12)';
    } else {
      dotColor = '#7a4ea8';
      dotSelected = '#ff6fb5';
      lineColor = 'rgba(90,30,120,0.25)';
    }
  })();

  
  updateColorsFromCSS();
  resize();
});


(function () {
  var toggle = document.getElementById('themeToggle');
  if (!toggle) return;
  var saved = null;
  try { saved = localStorage.getItem('site-theme'); } catch (e) {  }
  var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  var current = saved || (prefersDark ? 'dark' : 'light');

  
  function applyTheme(theme) {
    var body = document.body;
    var sidebar = document.getElementById('sidebar');
    var cards = document.querySelectorAll('.card');
    var projects = document.querySelectorAll('.project');
    var sideLinks = document.querySelectorAll('.side-nav a');
    var socialLinks = document.querySelectorAll('.social a');
    var footer = document.querySelector('.site-footer');
    if (!body) return;

    if (theme === 'dark') {
      body.style.background = '#0b0c0e';
      body.style.color = '#dfe6ef';
      if (sidebar) sidebar.style.background = '#0b1220';
      cards.forEach(function (c) { c.style.background = 'rgba(255,255,255,0.03)'; c.style.borderColor = 'rgba(255,255,255,0.04)'; });
      projects.forEach(function (p) { p.style.background = 'rgba(255,255,255,0.02)'; });
      sideLinks.forEach(function (a) { a.style.color = '#cfe6ff'; });
      socialLinks.forEach(function (a) { a.style.color = '#9fb0c8'; });
      if (footer) footer.style.color = '#7f9dbb';
      
      var profileName = document.querySelector('.profile .name');
      var profileRole = document.querySelector('.profile .role');
      if (profileName) profileName.style.color = '#ffffff';
      if (profileRole) profileRole.style.color = '#9fb0c8';
      
      document.querySelectorAll('h2').forEach(function(h){ h.style.color = '#ffffff'; });
    } else {
      
      body.style.background = '#fbf0ff';
      body.style.color = '#2a0630';
      if (sidebar) sidebar.style.background = '#f3e8ff';
      cards.forEach(function (c) { c.style.background = '#ffffff'; c.style.borderColor = '#e9dfff'; });
      projects.forEach(function (p) { p.style.background = '#fbf7ff'; });
      sideLinks.forEach(function (a) { a.style.color = '#40185a';  });
      socialLinks.forEach(function (a) { a.style.color = '#40185a'; });
      if (footer) footer.style.color = '#451a63';
      
      var profileName = document.querySelector('.profile .name');
      var profileRole = document.querySelector('.profile .role');
      if (profileName) profileName.style.color = '#2a0630';
      if (profileRole) profileRole.style.color = '#6b2f86';
      
      document.querySelectorAll('h2').forEach(function(h){ h.style.color = '#2a0630'; });
    }

   
  try { body.setAttribute('data-theme', theme); } catch (e) {}
  toggle.setAttribute('data-state', theme);
  try { localStorage.setItem('site-theme', theme); } catch (e) {}

    var ev = new CustomEvent('themechange', { detail: { theme: theme } });
    window.dispatchEvent(ev);
  }

  
  applyTheme(current);

  toggle.addEventListener('click', function () {
    current = (current === 'dark') ? 'light' : 'dark';
    applyTheme(current);
  });
})();


(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contactForm');
    if (!form) return;
    var status = document.getElementById('cf-status');
    var submitBtn = document.getElementById('cf-submit');

    function showStatus(msg, cls) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'cf-status ' + (cls || '');
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      if (!form.checkValidity()) {
        
        showStatus('Please complete the required fields and use a valid email.', 'error');
        return;
      }

      var name = (form.elements['name'] && form.elements['name'].value || '').trim();
      var email = (form.elements['email'] && form.elements['email'].value || '').trim();
      var message = (form.elements['message'] && form.elements['message'].value || '').trim();

      
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!emailOk) { showStatus('Please enter a valid email address.', 'error'); return; }
      if (!message) { showStatus('Please enter a message.', 'error'); return; }

     
      if (submitBtn) submitBtn.disabled = true;
      showStatus('Sending…', 'sending');
      setTimeout(function () {
        
        form.reset();
        if (submitBtn) submitBtn.disabled = false;
        showStatus('Thanks — your message was sent (demo). I will reply soon.', 'success');
      }, 900);
    });
  });
})();
