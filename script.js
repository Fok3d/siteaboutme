
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
});

/* --------------------
  mostly generated tohle bych z hlavy nedal
*/
document.addEventListener('DOMContentLoaded', function () {
  var canvas = document.getElementById('dotsCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var dpr = window.devicePixelRatio || 1;
  var dots = []; // {x,y,r}
  var connections = []; // [[i,j], ...] indexes into dots
  var selected = null; // index of selected dot

  function resize() {
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    generateDots(w, h);
    draw();
  }

  function generateDots(w, h) {
    dots = [];
    // density: one dot per ~18k px
    var count = Math.round((w * h) / 18000);
    count = Math.max(40, Math.min(count, 450));
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

    // draw connections
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
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

    // draw dots
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      ctx.beginPath();
      ctx.fillStyle = (i === selected) ? '#ff7b00' : '#333333';
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
      // outline
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 0.6;
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
      if (dx * dx + dy * dy <= (d.r + 6) * (d.r + 6)) return i;
    }
    return -1;
  }

  canvas.addEventListener('click', function (evt) {
    var pos = getMousePos(evt);
    var i = findDotAt(pos.x, pos.y);
    if (i === -1) return; // clicked empty space

    if (selected === null) {
      // select first dot
      selected = i;
    } else if (selected === i) {
      // deselect
      selected = null;
    } else {
      // make connection (store ordered pair with smaller index first to avoid duplicates)
      var a = Math.min(selected, i);
      var b = Math.max(selected, i);
      // avoid duplicate
      var exists = connections.some(function (p) { return p[0] === a && p[1] === b; });
      if (!exists) connections.push([a, b]);
      selected = null;
    }
    draw();
  });

  // regenerate on resize
  window.addEventListener('resize', function () {
    resize();
  });

  // initial
  resize();
});
