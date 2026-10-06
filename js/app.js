/**
 * JERVI EDITORIAL PORTFOLIO - CORE APPLICATION
 * Interactive deck navigation, mode toggling, lightbox, TOC drawer, and contact handling
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const slides = document.querySelectorAll('.slide-frame');
  const totalSlides = slides.length;
  let currentSlide = 0;
  let isPresentationMode = true;

  // UI Control Elements
  const currentNumBadge = document.getElementById('currentSlideNum');
  const totalNumBadge = document.getElementById('totalSlidesNum');
  const progressBar = document.getElementById('progressBar');
  const prevBtn = document.getElementById('prevSlideBtn');
  const nextBtn = document.getElementById('nextSlideBtn');
  const navDotsContainer = document.getElementById('navDotsContainer');
  const navDock = document.getElementById('navDock');
  const modeToggleBtn = document.getElementById('modeToggleBtn');
  const modeText = document.getElementById('modeText');
  const tocOpenBtn = document.getElementById('tocOpenBtn');
  const tocCloseBtn = document.getElementById('tocCloseBtn');
  const tocDrawerOverlay = document.getElementById('tocDrawerOverlay');
  const tocLinks = document.querySelectorAll('[data-goto-slide]');
  
  // Lightbox Elements
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  
  // Toast Element
  const toastNotice = document.getElementById('toastNotice');
  const toastMessage = document.getElementById('toastMessage');

  // Contact Form
  const contactForm = document.getElementById('contactForm');

  // Set total in header
  if (totalNumBadge) {
    totalNumBadge.textContent = String(totalSlides).padStart(2, '0');
  }

  // Generate Navigation Dots
  if (navDotsContainer) {
    navDotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('button');
      dot.className = `nav-dot ${idx === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Navigate to slide ${idx + 1}`);
      dot.addEventListener('click', () => goToSlide(idx));
      navDotsContainer.appendChild(dot);
    });
  }

  const navDots = document.querySelectorAll('.nav-dot');

  /**
   * Switch to a specific slide in presentation mode
   */
  function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    
    currentSlide = index;

    if (isPresentationMode) {
      slides.forEach((slide, idx) => {
        if (idx === currentSlide) {
          slide.classList.add('active');
        } else {
          slide.classList.remove('active');
        }
      });
      // Scroll to top of slide viewport smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // In scroll mode, scroll smoothly to the target slide element
      slides[currentSlide].scrollIntoView({ behavior: 'smooth' });
    }

    updateUI();
  }

  /**
   * Update header badges, progress bar, dots, and button states
   */
  function updateUI() {
    // Current number badge
    if (currentNumBadge) {
      currentNumBadge.textContent = String(currentSlide + 1).padStart(2, '0');
    }

    // Progress bar
    if (progressBar) {
      const percentage = ((currentSlide + 1) / totalSlides) * 100;
      progressBar.style.width = `${percentage}%`;
    }

    // Prev / Next button states
    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;

    // Dots
    navDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentSlide);
    });

    // TOC Drawer active highlights
    document.querySelectorAll('.drawer-item').forEach((item) => {
      const targetIdx = parseInt(item.getAttribute('data-goto-slide'), 10);
      item.classList.toggle('active', targetIdx === currentSlide);
    });
  }

  // Previous / Next Button Event Listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentSlide > 0) goToSlide(currentSlide - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
    });
  }

  // Keyboard Navigation (Arrow Keys)
  window.addEventListener('keydown', (e) => {
    // Avoid interfering when user is typing in form
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      if (currentSlide < totalSlides - 1) {
        e.preventDefault();
        goToSlide(currentSlide + 1);
      }
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      if (currentSlide > 0) {
        e.preventDefault();
        goToSlide(currentSlide - 1);
      }
    } else if (e.key === 'Escape') {
      closeTOC();
      closeLightbox();
    }
  });

  // Touch Swipe Gesture Navigation
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    if (!isPresentationMode) return;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
      if (diffX < 0 && currentSlide < totalSlides - 1) {
        goToSlide(currentSlide + 1); // Swipe left -> Next
      } else if (diffX > 0 && currentSlide > 0) {
        goToSlide(currentSlide - 1); // Swipe right -> Prev
      }
    }
  }

  // Mode Toggle (Presentation Deck vs Continuous Scroll)
  if (modeToggleBtn) {
    modeToggleBtn.addEventListener('click', () => {
      isPresentationMode = !isPresentationMode;
      document.body.classList.toggle('mode-presentation', isPresentationMode);
      document.body.classList.toggle('mode-scroll', !isPresentationMode);

      if (isPresentationMode) {
        modeText.textContent = 'Scroll View';
        navDock.classList.remove('hidden');
        goToSlide(currentSlide);
        showToast('Switched to Presentation Deck View');
      } else {
        modeText.textContent = 'Deck View';
        navDock.classList.add('hidden');
        slides[currentSlide].scrollIntoView({ behavior: 'smooth' });
        showToast('Switched to Continuous Scroll View');
      }
    });
  }

  // Intersection Observer for Scroll Mode tracking
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const slideObserver = new IntersectionObserver((entries) => {
    if (isPresentationMode) return;
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const slideIndex = Array.from(slides).indexOf(entry.target);
        if (slideIndex !== -1) {
          currentSlide = slideIndex;
          updateUI();
        }
      }
    });
  }, observerOptions);

  slides.forEach((slide) => slideObserver.observe(slide));

  // Table of Contents Drawer Open / Close
  function openTOC() {
    if (tocDrawerOverlay) tocDrawerOverlay.classList.add('open');
  }

  function closeTOC() {
    if (tocDrawerOverlay) tocDrawerOverlay.classList.remove('open');
  }

  if (tocOpenBtn) tocOpenBtn.addEventListener('click', openTOC);
  if (tocCloseBtn) tocCloseBtn.addEventListener('click', closeTOC);

  if (tocDrawerOverlay) {
    tocDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === tocDrawerOverlay) closeTOC();
    });
  }

  // Links with data-goto-slide
  tocLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetIndex = parseInt(link.getAttribute('data-goto-slide'), 10);
      closeTOC();
      goToSlide(targetIndex);
    });
  });

  // Lightbox Modal
  window.openLightbox = function(src, caption) {
    if (!lightboxModal) return;
    lightboxImg.src = src;
    lightboxCaption.textContent = caption || '';
    lightboxModal.classList.add('active');
  };

  function closeLightbox() {
    if (lightboxModal) lightboxModal.classList.remove('active');
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  // Toast System
  function showToast(msg, duration = 3200) {
    if (!toastNotice || !toastMessage) return;
    toastMessage.textContent = msg;
    toastNotice.classList.add('visible');
    setTimeout(() => {
      toastNotice.classList.remove('visible');
    }, duration);
  }

  window.showToast = showToast;

  // Interactive Contact Form Handling
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contactName')?.value.trim();
      const email = document.getElementById('contactEmail')?.value.trim();
      const message = document.getElementById('contactMessage')?.value.trim();

      if (!name || !email || !message) {
        showToast('Please fill out all required fields.');
        return;
      }

      // Simulate sending inquiry
      const submitBtn = contactForm.querySelector('.form-submit-btn');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        contactForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        showToast(`Thank you, ${name}! Your message has been received.`);
      }, 700);
    });
  }

  // Initialize UI on first load
  goToSlide(0);
});
