(function () {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- mobile menu ----------
  const menuBtn = document.querySelector('.menu-toggle');
  const nav = document.getElementById('site-nav');

  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? 'Close' : 'Menu';
    nav.classList.toggle('is-open', open);
  }

  menuBtn.addEventListener('click', () => {
    setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setMenu(false));
  });

  // ---------- highlight the section in view ----------
  // a link that leaves the page (Hackathons) names its section in data-section
  const navLinks = [...nav.querySelectorAll('a')];
  const targetOf = link => link.dataset.section || link.getAttribute('href');
  const sections = navLinks
    .map(link => (targetOf(link).startsWith('#') ? document.querySelector(targetOf(link)) : null))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          link.classList.toggle('is-active', targetOf(link) === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(section => observer.observe(section));
  }

  // ---------- into the CRT: the hackathons page ----------
  const tv = document.querySelector('.tv');
  let leaving = false;

  // from the nav: the page collapses to a line and a dot, like a TV switching off
  function switchOff(url) {
    tv.classList.add('is-off');
    setTimeout(() => { window.location.href = url; }, 640);
  }

  // from the black screen in the Hackathons section: that screen grows to fill the window
  function zoomInto(screen, url) {
    const r = screen.getBoundingClientRect();
    const zoom = document.createElement('div');
    zoom.className = 'crt-zoom';
    zoom.style.top = r.top + 'px';
    zoom.style.left = r.left + 'px';
    zoom.style.width = r.width + 'px';
    zoom.style.height = r.height + 'px';
    document.body.appendChild(zoom);
    requestAnimationFrame(() => requestAnimationFrame(() => zoom.classList.add('is-full')));
    setTimeout(() => { window.location.href = url; }, 560);
  }

  document.querySelectorAll('a[data-crt-link]').forEach(link => {
    link.addEventListener('click', e => {
      if (reduceMotion || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      if (leaving) return;
      leaving = true;
      const screen = link.querySelector('.crt-door-screen');
      if (screen) zoomInto(screen, link.href);
      else switchOff(link.href);
    });
  });

  // back from the hackathons page: the opening animation is CSS-only, this just tidies up
  if (document.documentElement.classList.contains('from-crt')) {
    setTimeout(() => document.documentElement.classList.remove('from-crt'), 700);
  }

  // returning with the browser's Back button: undo the switched-off state
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    leaving = false;
    tv.classList.remove('is-off');
    document.documentElement.classList.remove('from-crt');
    document.querySelectorAll('.crt-zoom').forEach(zoom => zoom.remove());
  });

  // ---------- expandable panels ----------
  function bindToggle(btn, onChange) {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      if (onChange) onChange(open);
    });
  }

  document.querySelectorAll('.toggle').forEach(btn => {
    const label = btn.querySelector('.toggle-label');
    bindToggle(btn, open => { label.textContent = open ? 'Close' : 'Read more'; });
  });

  const moreBtn = document.querySelector('.more-toggle');
  const moreHint = document.querySelector('.more-hint');
  bindToggle(moreBtn, open => { moreHint.hidden = open; });

  // ---------- lightbox ----------
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCap = document.getElementById('lightbox-cap');
  const lbCount = document.getElementById('lightbox-count');
  const lbClose = document.getElementById('lightbox-close');
  const lbPrev = document.getElementById('lightbox-prev');
  const lbNext = document.getElementById('lightbox-next');

  let items = [];
  let index = 0;
  let opener = null;

  function show(i) {
    index = (i + items.length) % items.length;
    const item = items[index];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCap.textContent = item.caption;
    lbCount.innerHTML = '<span class="red">' + String(index + 1).padStart(2, '0') + '</span> / ' + String(items.length).padStart(2, '0');
  }

  function openLightbox(gallery, i, trigger) {
    items = [...gallery.querySelectorAll('figure')].map(fig => {
      const img = fig.querySelector('img');
      const cap = fig.querySelector('figcaption');
      return { src: img.src, alt: img.alt, caption: cap ? cap.textContent : '' };
    });
    opener = trigger;
    show(i);
    lightbox.hidden = false;
    document.body.classList.add('no-scroll');
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lbImg.removeAttribute('src');
    document.body.classList.remove('no-scroll');
    if (opener) opener.focus();
  }

  document.querySelectorAll('.gallery').forEach(gallery => {
    gallery.querySelectorAll('.gallery-item').forEach((btn, i) => {
      btn.addEventListener('click', () => openLightbox(gallery, i, btn));
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', () => show(index - 1));
  lbNext.addEventListener('click', () => show(index + 1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-figure')) closeLightbox();
  });

  document.addEventListener('keydown', e => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
})();
