document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        links.classList.remove('open');
      });
    });
  }

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var versionSelect = document.getElementById('versionSelect');
  if (versionSelect) {
    var currentPage = location.pathname.split('/').pop() || 'index.html';
    versionSelect.value = currentPage;
    versionSelect.addEventListener('change', function () {
      location.href = this.value;
    });
  }

  // Reviews slider: native scroll-snap track + prev/next buttons + dots.
  // Works on any page that has a [data-reviews-slider] block; touch users
  // get free swipe via scroll-snap, desktop gets the buttons/dots.
  document.querySelectorAll('[data-reviews-slider]').forEach(function (slider) {
    var track = slider.querySelector('[data-track]');
    var dotsWrap = slider.querySelector('[data-dots]');
    var prevBtn = slider.querySelector('[data-dir="prev"]');
    var nextBtn = slider.querySelector('[data-dir="next"]');
    if (!track) return;
    var cards = Array.prototype.slice.call(track.children);
    if (!cards.length) return;

    var dots = [];
    if (dotsWrap) {
      cards.forEach(function (card, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'reviews-slider-dot';
        dot.setAttribute('aria-label', 'Przejdź do opinii ' + (i + 1));
        dot.addEventListener('click', function () {
          card.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
        });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    function updateActive() {
      var trackLeft = track.getBoundingClientRect().left;
      var closest = 0;
      var closestDist = Infinity;
      cards.forEach(function (card, i) {
        var dist = Math.abs(card.getBoundingClientRect().left - trackLeft);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      dots.forEach(function (d, i) { d.classList.toggle('is-active', i === closest); });
      if (prevBtn) prevBtn.disabled = track.scrollLeft <= 4;
      if (nextBtn) nextBtn.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
    }

    var scrollTimeout;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActive, 80);
    });

    if (prevBtn) prevBtn.addEventListener('click', function () {
      track.scrollBy({ left: -track.clientWidth * 0.85, behavior: 'smooth' });
    });
    if (nextBtn) nextBtn.addEventListener('click', function () {
      track.scrollBy({ left: track.clientWidth * 0.85, behavior: 'smooth' });
    });

    updateActive();
    window.addEventListener('resize', updateActive);
  });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Background videos (hero, motorcycle) always play on loop. They are
  // muted, decorative footage rather than interactive motion, so they are
  // exempt from prefers-reduced-motion here rather than freezing after the
  // first second, which read as broken rather than accessible.

  // index-v4.html only: reveal why-list/reviews/contact items that have
  // no entrance treatment on the baseline pages (improve-animations audit).
  if (document.body.dataset.pageStyle === 'animations') {
    var animTargets = document.querySelectorAll('.why-list li, .reviews-card, .contact-card, .contact-hours');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      animTargets.forEach(function (el) { el.classList.add('in-view'); });
    } else {
      var animObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var group = Array.prototype.filter.call(el.parentElement.children, function (c) {
            return c.matches('.why-list li, .reviews-card, .contact-card, .contact-hours');
          });
          var idx = group.indexOf(el);
          el.style.transitionDelay = (idx * 90) + 'ms';
          el.classList.add('in-view');
          el.addEventListener('transitionend', function clearDelay() {
            el.style.transitionDelay = '';
            el.removeEventListener('transitionend', clearDelay);
          });
          animObserver.unobserve(el);
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });
      animTargets.forEach(function (el) { animObserver.observe(el); });
    }
  }

  var revealTargets = document.querySelectorAll('.service-card, .moto-scroll-content');

  if (!revealTargets.length) return;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(function (el) { el.classList.add('in-view'); });
    return;
  }

  var cards = document.querySelectorAll('.service-card');
  var cardObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var card = entry.target;
      var delay = (Array.prototype.indexOf.call(cards, card) % 5) * 50;
      card.style.transitionDelay = delay + 'ms';
      card.classList.add('in-view');
      card.addEventListener('transitionend', function clearDelay() {
        card.style.transitionDelay = '';
        card.removeEventListener('transitionend', clearDelay);
      });
      cardObserver.unobserve(card);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  cards.forEach(function (card) { cardObserver.observe(card); });

  var simpleReveal = document.querySelectorAll('.moto-scroll-content');
  var simpleObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      simpleObserver.unobserve(entry.target);
    });
  }, { threshold: 0.25 });
  simpleReveal.forEach(function (el) { simpleObserver.observe(el); });
});
