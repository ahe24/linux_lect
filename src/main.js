import { createIcons, icons } from 'lucide';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import makefile from 'highlight.js/lib/languages/makefile';
import plaintext from 'highlight.js/lib/languages/plaintext';

// Register languages
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('makefile', makefile);
hljs.registerLanguage('plaintext', plaintext);

document.addEventListener('DOMContentLoaded', () => {
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
          document.querySelector('main').scrollTop = 0;

          // Re-trigger animation
          sec.style.animation = 'none';
          sec.offsetHeight; /* trigger reflow */
          sec.style.animation = 'fadeIn 0.4s ease-out';
        }
      });
    });
  });

  // 4. Status Bar Fun (Scroll Position)
  const mainEl = document.querySelector('main');
  const statusPos = document.querySelector('.status-bar span:nth-child(2)');

  mainEl.addEventListener('scroll', () => {
    const percent = Math.round((mainEl.scrollTop / (mainEl.scrollHeight - mainEl.clientHeight)) * 100);
    statusPos.textContent = `pos: ${percent}%`;
  });

  // 5. Easter Egg: VIM keys interaction
  // If user presses 'j' or 'k' and is not in an input, scroll content?
  // Let's implement basic j/k scrolling for the authentic feel.
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'j') {
      mainEl.scrollBy({ top: 50, behavior: 'smooth' });
    } else if (e.key === 'k') {
      mainEl.scrollBy({ top: -50, behavior: 'smooth' });
    } else if (e.key === 'g' && !e.repeat) {
      // Simple 'gg' detection could be complex, let's just do 'G' (Shift+g)
    } else if (e.key === 'G') {
      mainEl.scrollTo({ top: mainEl.scrollHeight, behavior: 'smooth' });
    }
  });

});
