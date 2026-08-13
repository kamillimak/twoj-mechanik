document.addEventListener('DOMContentLoaded', function () {
  var section = document.querySelector('.moto-scroll');
  if (!section) return;

  var track = section.querySelector('.moto-scroll-track');
  var canvas = section.querySelector('.moto-canvas');
  var content = section.querySelector('.moto-scroll-content');
  var progressFill = section.querySelector('.moto-scroll-progress-fill');
  var ctx = canvas.getContext('2d');

  var FRAME_COUNT = 300;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function frameSrc(i) {
    var n = String(i + 1);
    while (n.length < 4) n = '0' + n;
    return 'assets/frames/m_' + n + '.webp';
  }

  var frames = new Array(FRAME_COUNT);
  var currentFrame = -1;

  function resizeCanvas() {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
  }

  function drawFrame(index) {
    var img = frames[index];
    var lookback = index;
    while (!img && lookback > 0) {
      lookback--;
      img = frames[lookback];
    }
    if (!img || !img.naturalWidth) return;
    var cw = canvas.width;
    var ch = canvas.height;
    var iw = img.naturalWidth;
    var ih = img.naturalHeight;
    var scale = Math.max(cw / iw, ch / ih);
    var dw = iw * scale;
    var dh = ih * scale;
    var dx = (cw - dw) / 2;
    var dy = (ch - dh) / 2;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function loadFrame(i) {
    if (frames[i]) return;
    var img = new Image();
    frames[i] = img;
    img.onload = function () {
      if (i === 0 && currentFrame === -1) {
        currentFrame = 0;
        resizeCanvas();
        drawFrame(0);
      } else if (i === currentFrame) {
        drawFrame(currentFrame);
      }
    };
    img.src = frameSrc(i);
  }

  function revealContent() {
    if (content) content.classList.add('in-view');
  }

  // Reduced motion: show a single representative static frame, no pinning, no scrubbing.
  if (reduceMotion) {
    var staticIndex = 120;
    currentFrame = staticIndex;
    resizeCanvas();
    var staticImg = new Image();
    frames[staticIndex] = staticImg;
    staticImg.onload = function () { drawFrame(staticIndex); };
    staticImg.src = frameSrc(staticIndex);
    revealContent();
    window.addEventListener('resize', function () {
      resizeCanvas();
      drawFrame(staticIndex);
    });
    return;
  }

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        revealContent();
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });
  if (content) revealObserver.observe(section);

  var loadObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      for (var i = 0; i < FRAME_COUNT; i++) loadFrame(i);
      loadObserver.disconnect();
    });
  }, { rootMargin: '600px 0px' });
  loadObserver.observe(section);

  resizeCanvas();
  loadFrame(0);

  window.addEventListener('resize', function () {
    resizeCanvas();
    drawFrame(currentFrame);
  });

  function initScrollBinding() {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.4,
      onUpdate: function (self) {
        var index = Math.min(FRAME_COUNT - 1, Math.floor(self.progress * FRAME_COUNT));
        if (index !== currentFrame) {
          currentFrame = index;
          drawFrame(currentFrame);
        }
        if (progressFill) progressFill.style.height = (self.progress * 100) + '%';
      }
    });
  }

  initScrollBinding();
});
