(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = n => String(n).padStart(2, '0');

  // ---------- title: one span per letter, so the word can bulge ----------
  const title = document.getElementById('title');
  const chars = [...title.textContent];
  title.textContent = '';
  chars.forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'ch';
    span.textContent = char;
    const x = chars.length > 1 ? (i / (chars.length - 1)) * 2 - 1 : 0;
    span.style.setProperty('--x', x.toFixed(3));
    title.appendChild(span);
  });

  // ---------- entry counter + status ----------
  const count = document.querySelectorAll('.log-entry').length;
  document.querySelectorAll('[data-entries]').forEach(el => { el.textContent = pad(count); });
  document.querySelectorAll('[data-status]').forEach(el => {
    el.textContent = count ? 'Online' : 'Standing by';
  });

  // ---------- boot text, typed out after the tube warms up ----------
  const bootLines = [...document.querySelectorAll('#boot p')];
  if (!reduceMotion && bootLines.length) {
    const texts = bootLines.map(p => p.textContent);
    bootLines.forEach(p => { p.textContent = ''; });
    let line = 0;
    let pos = 0;
    const type = () => {
      if (line >= texts.length) return;
      pos += 2;
      bootLines[line].textContent = texts[line].slice(0, pos);
      if (pos >= texts[line].length) { line += 1; pos = 0; setTimeout(type, 140); return; }
      setTimeout(type, 16);
    };
    setTimeout(type, 850);
  }

  // ---------- clock ----------
  const clock = document.getElementById('clock');
  const tick = () => {
    const d = new Date();
    clock.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  };
  tick();
  setInterval(tick, 1000);

  // ---------- leaving: switch the tube off, then go back to the portfolio ----------
  const crt = document.getElementById('crt');
  let leaving = false;

  document.querySelectorAll('a[data-exit]').forEach(link => {
    link.addEventListener('click', e => {
      if (reduceMotion || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      if (leaving) return;
      leaving = true;
      crt.style.transformOrigin = '50% ' + (window.scrollY + window.innerHeight / 2) + 'px';
      root.classList.add('is-leaving');
      try { sessionStorage.setItem('crt-return', '1'); } catch (err) { /* private mode */ }
      setTimeout(() => { window.location.href = link.href; }, 520);
    });
  });

  // coming back with the browser's Back button: undo the switched-off state
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    leaving = false;
    root.classList.remove('is-leaving');
    crt.style.transformOrigin = '';
  });

  // ---------- image viewer ----------
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
    lbCount.textContent = pad(index + 1) + ' / ' + pad(items.length);
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
