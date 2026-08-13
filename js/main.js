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

  var cards = document.querySelectorAll('.service-card');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!cards.length) return;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    cards.forEach(function (card) { card.classList.add('in-view'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
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
      observer.unobserve(card);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  cards.forEach(function (card) { observer.observe(card); });
});
