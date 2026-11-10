(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pad = n => String(n).padStart(2, '0');

  // ---------- follow-spot: a soft pool of light under the mouse ----------
  const spot = document.getElementById('followspot');
  if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
    let x = 0;
    let y = 0;
    let queued = false;
    window.addEventListener('pointermove', e => {
      x = e.clientX;
      y = e.clientY;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        spot.style.setProperty('--mx', x + 'px');
        spot.style.setProperty('--my', y + 'px');
        spot.classList.add('is-on');
      });
    });
    document.addEventListener('mouseleave', () => spot.classList.remove('is-on'));
  }

  // ---------- leaving: the curtain closes, then back to the portfolio ----------
  let leaving = false;

  document.querySelectorAll('a[data-exit]').forEach(link => {
    link.addEventListener('click', e => {
      if (reduceMotion || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      if (leaving) return;
      leaving = true;
      root.classList.add('is-leaving');
      try { sessionStorage.setItem('stage-return', '1'); } catch (err) { /* private mode */ }
      setTimeout(() => { window.location.href = link.href; }, 720);
    });
  });

  // coming back with the browser's Back button: reopen the curtain
  window.addEventListener('pageshow', e => {
    if (!e.persisted) return;
    leaving = false;
    root.classList.remove('is-leaving');
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
    lbCount.innerHTML = '<span class="red">' + pad(index + 1) + '</span> / ' + pad(items.length);
  }

  function openLightbox(gallery, i, trigger) {
    items = [...gallery.querySelectorAll('figure')].map(fig => {
      const img = fig.querySelector('img');
      const cap = fig.querySelector('.scene-cap');
      const credit = fig.querySelector('.scene-credit');
      const parts = [cap && cap.textContent, credit && credit.textContent].filter(Boolean);
      return { src: img.src, alt: img.alt, caption: parts.join(' · ') };
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
