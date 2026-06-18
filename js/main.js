document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initNavbarScroll();
  initReveal();
  initCounters();
  initSkillBars();
  initModal();
  initLightbox();
  initPhotoFilter();
  highlightActiveNav();
});

function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    toggle.innerHTML = navLinks.classList.contains('open')
      ? '<i class="fas fa-times"></i>'
      : '<i class="fas fa-bars"></i>';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });
}

function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
}

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '+';
    const duration = 1800;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(eased * target);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function initSkillBars() {
  const fills = document.querySelectorAll('.skill-bar-fill');
  if (!fills.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.width + '%';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  fills.forEach(el => observer.observe(el));
}

function highlightActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

function initModal() {
  const overlay = document.getElementById('certModal');
  if (!overlay) return;

  const modalImg = overlay.querySelector('.modal-img');
  const modalTitle = overlay.querySelector('.modal-title');
  const modalDesc = overlay.querySelector('.modal-desc');
  const closeBtn = overlay.querySelector('.modal-close');

  document.querySelectorAll('.cert-card').forEach(card => {
    card.addEventListener('click', () => {
      modalImg.src = card.dataset.img;
      modalImg.alt = card.dataset.title;
      modalTitle.textContent = card.dataset.title;
      modalDesc.textContent = card.dataset.desc;
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const lbImg = lightbox.querySelector('.lightbox-img');
  const lbTitle = lightbox.querySelector('.lightbox-title');
  const lbDesc = lightbox.querySelector('.lightbox-desc');
  const lbCounter = lightbox.querySelector('.lightbox-counter');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');

  let visibleItems = [];
  let currentIndex = 0;

  function getVisibleItems() {
    return Array.from(document.querySelectorAll('.photo-item:not(.hidden)'));
  }

  function show(index) {
    visibleItems = getVisibleItems();
    if (!visibleItems.length) return;
    currentIndex = index;
    const item = visibleItems[index];
    lbImg.src = item.dataset.src;
    lbImg.alt = item.dataset.title;
    lbTitle.textContent = item.dataset.title;
    lbDesc.textContent = item.dataset.desc;
    if (lbCounter) lbCounter.textContent = `${index + 1} / ${visibleItems.length}`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.photo-item').forEach(item => {
    item.addEventListener('click', () => {
      visibleItems = getVisibleItems();
      const idx = visibleItems.indexOf(item);
      if (idx !== -1) show(idx);
    });
  });

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) close();
  });

  prevBtn.addEventListener('click', e => {
    e.stopPropagation();
    visibleItems = getVisibleItems();
    show((currentIndex - 1 + visibleItems.length) % visibleItems.length);
  });

  nextBtn.addEventListener('click', e => {
    e.stopPropagation();
    visibleItems = getVisibleItems();
    show((currentIndex + 1) % visibleItems.length);
  });

  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') {
      visibleItems = getVisibleItems();
      show((currentIndex - 1 + visibleItems.length) % visibleItems.length);
    }
    if (e.key === 'ArrowRight') {
      visibleItems = getVisibleItems();
      show((currentIndex + 1) % visibleItems.length);
    }
  });
}

function initPhotoFilter() {
  const filters = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('.photo-item[data-category]');
  if (!filters.length || !items.length) return;

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;

      items.forEach((item, i) => {
        const match = cat === 'all' || item.dataset.category === cat;
        item.classList.toggle('hidden', !match);
        if (match) {
          item.style.animation = 'none';
          item.offsetHeight;
          item.style.animation = `fade-in-up 0.5s ease ${(i % 6) * 0.05}s both`;
        }
      });
    });
  });
}
