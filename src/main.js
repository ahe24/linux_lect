import { createIcons, icons } from 'lucide';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import makefile from 'highlight.js/lib/languages/makefile';
import plaintext from 'highlight.js/lib/languages/plaintext';
import verilog from 'highlight.js/lib/languages/verilog';

// Import HTML Fragments
import homeHtml from './sections/home.html?raw';
import distroHtml from './sections/distro-compare.html?raw';
import setupHtml from './sections/linux-setup.html?raw';
import serverOpsHtml from './sections/server-ops.html?raw';
import workflowHtml from './sections/fpga-workflow.html?raw';
import vimHtml from './sections/vim-mastery.html?raw';
import svHtml from './sections/sv-testbench.html?raw';

// Register languages
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('makefile', makefile);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('verilog', verilog);

document.addEventListener('DOMContentLoaded', () => {
  // 0. Inject Content
  const mainComponent = document.querySelector('main');
  mainComponent.innerHTML = homeHtml + distroHtml + setupHtml + serverOpsHtml + vimHtml + svHtml + workflowHtml;

  // 1. Initialize Icons
  createIcons({ icons });

  // 2. Initialize Syntax Highlighting
  hljs.highlightAll();

  // 3. Navigation Logic
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.content-section');
  const sidebar = document.querySelector('aside');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active from all nav items
      navItems.forEach(nav => nav.classList.remove('active'));
      // Add active to clicked
      item.classList.add('active');

      // Hide all sections, Show target
      const targetId = item.getAttribute('data-target');
      sections.forEach(sec => {
        sec.classList.remove('active');
        if (sec.id === targetId) {
          sec.classList.add('active');
          // Reset scroll
          mainComponent.scrollTop = 0;

          // Re-trigger animation
          sec.style.animation = 'none';
          sec.offsetHeight; /* trigger reflow */
          sec.style.animation = 'fadeIn 0.4s ease-out';
        }
      });
    });
  });

  // 4. Status Bar Fun (Scroll Position)
  const statusPos = document.querySelector('.status-bar span:nth-child(2)');

  mainComponent.addEventListener('scroll', () => {
    const percent = Math.round((mainComponent.scrollTop / (mainComponent.scrollHeight - mainComponent.clientHeight)) * 100);
    statusPos.textContent = `pos: ${percent}%`;
  });

  // 5. Easter Egg: VIM keys interaction
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'j') {
      mainComponent.scrollBy({ top: 50, behavior: 'smooth' });
    } else if (e.key === 'k') {
      mainComponent.scrollBy({ top: -50, behavior: 'smooth' });
    } else if (e.key === 'g' && !e.repeat) {
      // Simple 'gg' detection could be complex, let's just do 'G' (Shift+g)
    } else if (e.key === 'G') {
      mainComponent.scrollTo({ top: mainComponent.scrollHeight, behavior: 'smooth' });
    }
  });

  // 6. Mobile Menu Logic
  const menuToggle = document.getElementById('menu-toggle');

  menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
  });

  // Close sidebar when clicking a nav item (mobile experience)
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
      }
    });
  });

  // Close sidebar when clicking outside (on main content)
  mainComponent.addEventListener('click', () => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
    }
  });

});
