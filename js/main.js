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
