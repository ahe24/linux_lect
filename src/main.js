import { createIcons, icons } from 'lucide';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import makefile from 'highlight.js/lib/languages/makefile';
import plaintext from 'highlight.js/lib/languages/plaintext';
import verilog from 'highlight.js/lib/languages/verilog';
import tcl from 'highlight.js/lib/languages/tcl';

// Import HTML Fragments
import homeHtml from './sections/home.html?raw';
import distroHtml from './sections/distro-compare.html?raw';
import setupHtml from './sections/linux-setup.html?raw';
import serverOpsHtml from './sections/server-ops.html?raw';
import shellHtml from './sections/shell-script.html?raw';
import workflowHtml from './sections/fpga-workflow.html?raw';
import vimHtml from './sections/vim-mastery.html?raw';
import svHtml from './sections/sv-testbench.html?raw';

// Register languages
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('makefile', makefile);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('verilog', verilog);
hljs.registerLanguage('tcl', tcl);

document.addEventListener('DOMContentLoaded', () => {
  // 0. Inject Content
  const mainComponent = document.querySelector('main');
  mainComponent.innerHTML = homeHtml + distroHtml + setupHtml + serverOpsHtml + vimHtml + svHtml + workflowHtml + shellHtml;

  // ==========================================
  // ==========================================
  // ==========================================
  // ==========================================
  // CONTENT BEAUTIFICATION (Clean Text + Add CSS Classes)
  // ==========================================
  mainComponent.querySelectorAll('h2, h3').forEach(el => {
    // 1. Remove existing numbering permamently from DOM
    // This ensures the sidebar gets clean text automatically
    el.innerText = el.innerText.replace(/^[\d.]+\s*/, '');

    // 2. Add Class for CSS-based Icons (::before)
    if (el.tagName === 'H2') el.classList.add('icon-h2');
    if (el.tagName === 'H3') el.classList.add('icon-h3');
  });

  // ==========================================
  // SLIDE LAYOUT TRANSFORMATION (Greedy Grouping)
  // ==========================================
  mainComponent.classList.add('slide-mode');
  const sections = document.querySelectorAll('.content-section');

  // Helper to estimate visual height/density
  const getWeight = (el) => {
    const tag = el.tagName;
    if (tag === 'PRE' || tag === 'TABLE' || el.classList.contains('hero-anim-container')) return 40;
    if (tag === 'H1') return 20;
    if (tag === 'H2') return 15;
    if (tag === 'UL' || tag === 'OL' || tag === 'DIV') return 10;
    return 5; // P, etc.
  };

  const THRESHOLD = 60; // Rough "page full" value

  // Store titles globally for navigation reference
  const sectionTitles = {};

  sections.forEach(section => {
    const children = Array.from(section.children);
    if (children.length === 0) return;

    const slides = [];
    let currentSlide = [];
    let currentWeight = 0;

    // Helper to get title
    const getSlideTitle = (slideContent, index) => {
      // Content is already cleaned in the Beautification step!
      // Just grab the direct text.
      const h1 = slideContent.find(el => el.tagName === 'H1');
      if (h1) return h1.innerText;

      const h2 = slideContent.find(el => el.tagName === 'H2');
      if (h2) return h2.innerText;

      if (index === 0) return "Introduction";

      if (slideContent.find(el => el.tagName === 'PRE')) return "Code Example";

      return `Slide ${index + 1}`;
    };

    children.forEach(child => {
      const w = getWeight(child);

      const isH1 = child.tagName === 'H1';
      const isH2 = child.tagName === 'H2';
      const forceBreak = child.classList.contains('break-before');
      const shouldBreak = isH1 || (isH2 && currentWeight >= THRESHOLD) || forceBreak;

      if (shouldBreak && currentSlide.length > 0) {
        slides.push(currentSlide);
        currentSlide = [];
        currentWeight = 0;
      }

      currentSlide.push(child);
      currentWeight += w;
    });

    if (currentSlide.length > 0) slides.push(currentSlide);

    // Save Titles
    const titles = slides.map((s, i) => getSlideTitle(s, i));
    sectionTitles[section.id] = titles;

    // Rebuild DOM
    section.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'slide-container';

    slides.forEach((slideContent, index) => {
      const slideDiv = document.createElement('div');
      slideDiv.className = 'slide';
      if (index === 0) slideDiv.classList.add('active'); // First slide visible
      slideContent.forEach(el => slideDiv.appendChild(el));
      container.appendChild(slideDiv);
    });

    section.appendChild(container);

    // Initialize state
    section.dataset.currentSlide = 0;
    section.dataset.totalSlides = slides.length;
  });

  // Inject Controls UI
  const controlsHtml = `
    <div class="slide-controls">
      <button class="slide-btn" id="prev-slide" aria-label="Previous Slide">
        <i data-lucide="chevron-left"></i>
      </button>
      <div class="slide-counter">1 / 1</div>
      <button class="slide-btn" id="next-slide" aria-label="Next Slide">
        <i data-lucide="chevron-right"></i>
      </button>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', controlsHtml);

  // 1. Initialize Icons
  createIcons({ icons });

  // 2. Initialize Syntax Highlighting
  hljs.highlightAll();

  // ==========================================
  // LOGIC & NAVIGATION
  // ==========================================
  const navHeaders = document.querySelectorAll('.nav-header');
  const navGroups = document.querySelectorAll('.nav-group');
  const sidebar = document.querySelector('aside');
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');
  const counterEl = document.querySelector('.slide-counter');

  // Helper: Update UI based on current visible slide
  const updateControls = () => {
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;

    const current = parseInt(activeSection.dataset.currentSlide || 0);
    const total = parseInt(activeSection.dataset.totalSlides || 1);

    counterEl.textContent = `${current + 1} / ${total}`;
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;

    // Update Submenu Active State
    const activeGroup = document.querySelector('.nav-group.active');
    if (activeGroup) {
      const subItems = activeGroup.querySelectorAll('.sub-item');
      subItems.forEach((item, idx) => {
        if (idx === current) item.classList.add('active');
        else item.classList.remove('active');
      });
    }
  };

  const showSlide = (section, index) => {
    const slides = section.querySelectorAll('.slide');
    const total = slides.length;

    // Boundary Checks
    if (index < 0) index = 0;
    if (index >= total) index = total - 1;

    // Update State
    section.dataset.currentSlide = index;

    // DOM Update
    slides.forEach(s => s.classList.remove('active'));
    slides[index].classList.add('active');

    updateControls();
  };

  const navigateSlide = (direction) => {
    const activeSection = document.querySelector('.content-section.active');
    if (!activeSection) return;

    const current = parseInt(activeSection.dataset.currentSlide || 0);
    showSlide(activeSection, current + direction);
  };

  // Helper: Populate Submenu
  const populateSubmenu = (group, sectionId) => {
    const subMenuUl = group.querySelector('.sub-menu');
    if (!subMenuUl) return;

    subMenuUl.innerHTML = ''; // Clear
    const titles = sectionTitles[sectionId] || [];

    titles.forEach((title, idx) => {
      const li = document.createElement('li');
      li.className = 'sub-item';
      li.textContent = title;
      li.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent bubbling to header
        const activeSec = document.getElementById(sectionId);
        // Activate section if not already (safeguard)
        if (!activeSec.classList.contains('active')) {
          document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
          activeSec.classList.add('active');
        }
        showSlide(activeSec, idx);
      });
      subMenuUl.appendChild(li);
    });
  };

  // Sidebar Navigation Logic
  navHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const group = header.parentElement;
      const targetId = group.getAttribute('data-target');

      // 1. Activate Visuals
      navGroups.forEach(g => g.classList.remove('active'));
      group.classList.add('active');

      // 2. Populate Submenu (Lazy load behavior)
      populateSubmenu(group, targetId);

      // 3. Switch Section
      sections.forEach(sec => {
        sec.classList.remove('active');
        if (sec.id === targetId) {
          sec.classList.add('active');

          // RESET TO FIRST SLIDE (User Request 1)
          showSlide(sec, 0);

          // Re-trigger animation
          sec.style.animation = 'none';
          sec.offsetHeight; /* trigger reflow */
          sec.style.animation = 'fadeIn 0.4s ease-out';
        }
      });

      // Mobile logic
      if (window.innerWidth <= 768) {
        setTimeout(() => sidebar.classList.remove('active'), 100);
      }
    });
  });

  // Init first submenu
  const initialGroup = document.querySelector('.nav-group.active');
  if (initialGroup) {
    populateSubmenu(initialGroup, initialGroup.getAttribute('data-target'));
  }

  // Slide Control Events
  prevBtn.addEventListener('click', () => navigateSlide(-1));
  nextBtn.addEventListener('click', () => navigateSlide(1));

  // Keyboard Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'h': // VIM style
        navigateSlide(-1);
        break;
      case 'ArrowRight':
      case 'l': // VIM style
        navigateSlide(1);
        break;
      case 'j':
        // Scroll down within slide
        {
          const activeSlide = document.querySelector('.content-section.active .slide.active');
          if (activeSlide) activeSlide.scrollBy({ top: 50, behavior: 'smooth' });
        }
        break;
      case 'k':
        // Scroll up within slide
        {
          const activeSlide = document.querySelector('.content-section.active .slide.active');
          if (activeSlide) activeSlide.scrollBy({ top: -50, behavior: 'smooth' });
        }
        break;
    }
  });

  // Mobile Menu Logic
  const menuToggle = document.getElementById('menu-toggle');
  menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));

  navHeaders.forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) sidebar.classList.remove('active');
    });
  });

  mainComponent.addEventListener('click', () => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
    }
  });

  // Shortcut Card Click Navigation
  const shortcutCards = document.querySelectorAll('.shortcut-card[data-target]');
  shortcutCards.forEach(card => {
    card.addEventListener('click', () => {
      const targetId = card.getAttribute('data-target');
      const targetGroup = document.querySelector(`.nav-group[data-target="${targetId}"]`);

      if (targetGroup) {
        const navHeader = targetGroup.querySelector('.nav-header');
        // Trigger the existing navigation logic
        navHeader.click();
      }
    });
  });

  // Initial UI Update
  updateControls();

  // Scroll to Top Button
  const scrollToTopBtn = document.getElementById('scroll-to-top');

  if (scrollToTopBtn) {
    // Reinitialize lucide icons for the button
    createIcons({ icons });

    // Function to check if content is scrollable and update button visibility
    const updateScrollButtonVisibility = () => {
      const isSlideMode = mainComponent.classList.contains('slide-mode');
      let isScrollable = false;
      let scrollTop = 0;

      if (isSlideMode) {
        const activeSlide = document.querySelector('.content-section.active .slide.active');
        if (activeSlide) {
          isScrollable = activeSlide.scrollHeight > activeSlide.clientHeight;
          scrollTop = activeSlide.scrollTop;
        }
      } else {
        isScrollable = mainComponent.scrollHeight > mainComponent.clientHeight;
        scrollTop = mainComponent.scrollTop;
      }

      // Show button only if content is scrollable AND scrolled > 300px
      if (isScrollable && scrollTop > 300) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    };

    // Check on main component scroll (for normal mode)
    mainComponent.addEventListener('scroll', updateScrollButtonVisibility);

    // Add scroll listener to all slides (for slide mode)
    const addSlideScrollListeners = () => {
      document.querySelectorAll('.slide').forEach(slide => {
        slide.addEventListener('scroll', updateScrollButtonVisibility);
      });
    };

    // Initial setup
    addSlideScrollListeners();

    // Re-add listeners when slides are created/changed
    const observer = new MutationObserver(() => {
      addSlideScrollListeners();
      updateScrollButtonVisibility();
    });
    observer.observe(mainComponent, { childList: true, subtree: true });

    // Initial check
    updateScrollButtonVisibility();

    // Scroll to top when clicked
    scrollToTopBtn.addEventListener('click', () => {
      const isSlideMode = mainComponent.classList.contains('slide-mode');

      if (isSlideMode) {
        const activeSlide = document.querySelector('.content-section.active .slide.active');
        if (activeSlide) {
          activeSlide.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      } else {
        mainComponent.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    });
  }

});
