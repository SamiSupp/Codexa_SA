/* Codexa_SA Systems — Interactions */

(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Year in footer
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Sticky nav state on scroll
  const nav = $('#nav');
  const onScroll = () => {
    if (window.scrollY > 24) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile nav toggle
  const toggle = $('#navToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    // Close on link click
    $$('.nav__links a').forEach(a => a.addEventListener('click', () => {
      if (nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    }));
  }

  // Reveal on scroll
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // small staggered delay for items inside same parent
          const siblings = Array.from(entry.target.parentElement?.children || []);
          const idx = siblings.indexOf(entry.target);
          entry.target.style.transitionDelay = `${Math.min(idx, 6) * 70}ms`;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.12 });
    $$('.reveal').forEach(el => io.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
  }

  // Animated counters
  const counters = $$('.hero__stats strong[data-count]');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    const animateCount = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const duration = 1600;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + (target === 99 ? '' : '+');
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target + (target === 99 ? '%' : '+');
      };
      requestAnimationFrame(tick);
    };
    const co = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => co.observe(c));
  } else {
    counters.forEach(c => {
      const t = parseInt(c.dataset.count, 10) || 0;
      c.textContent = t + (t === 99 ? '%' : '+');
    });
  }

  // Subtle parallax on hero glass card
  const card = $('.hero__card');
  const visual = $('.hero__visual');
  if (card && visual && !reduceMotion && window.matchMedia('(hover: hover)').matches) {
    let raf = null;
    visual.addEventListener('mousemove', (e) => {
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `translateY(${y * -8}px) rotateX(${y * -4}deg) rotateY(${x * 6}deg)`;
      });
    });
    visual.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  }

  // Contact form (front-end only, simulated submit)
  const form = $('#contactForm');
  const msg = $('#formMsg');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('nombre') || '').toString().trim();
      const email = (data.get('email') || '').toString().trim();
      const message = (data.get('mensaje') || '').toString().trim();

      if (!name || !email || !message) {
        msg.textContent = 'Por favor completá todos los campos.';
        msg.style.color = '#FCA5A5';
        return;
      }
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!validEmail) {
        msg.textContent = 'Ingresá un email válido.';
        msg.style.color = '#FCA5A5';
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      const original = btn.innerHTML;
      btn.innerHTML = 'Enviando...';
      msg.textContent = '';

      setTimeout(() => {
        btn.disabled = false;
        btn.innerHTML = original;
        msg.style.color = '';
        msg.textContent = '¡Gracias! Te contactaremos en menos de 24h.';
        form.reset();
      }, 900);
    });
  }
})();
