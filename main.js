/**
 * Mixtape Guide - Main JavaScript
 * Handles navigation, accordions, spoilers, filters, and progress tracking
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  initNavigation();
  initChapterAccordions();
  initSpoilers();
  initFilterTabs();
  initProgressTracker();
  initSmoothScroll();
});

/**
 * Mobile Navigation Toggle
 */
function initNavigation() {
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      // Update aria-expanded for accessibility
      const isOpen = navMenu.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });

    // Close menu when pressing Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/**
 * Chapter/Accordion Expand/Collapse
 */
function initChapterAccordions() {
  const chapterItems = document.querySelectorAll('.chapter-item');

  chapterItems.forEach(item => {
    const header = item.querySelector('.chapter-header');
    
    if (header) {
      header.addEventListener('click', () => {
        // Toggle current item
        item.classList.toggle('open');
        
        // Update toggle icon rotation (handled by CSS)
        const toggle = item.querySelector('.chapter-toggle');
        if (toggle) {
          const isOpen = item.classList.contains('open');
          toggle.setAttribute('aria-expanded', isOpen);
        }

        // Optional: Close other items (accordion behavior)
        // Uncomment the following to enable single-open accordion:
        /*
        chapterItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('open')) {
            otherItem.classList.remove('open');
          }
        });
        */
      });

      // Keyboard accessibility
      header.setAttribute('tabindex', '0');
      header.setAttribute('role', 'button');
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    }
  });
}

/**
 * Spoiler Toggle
 */
function initSpoilers() {
  const spoilers = document.querySelectorAll('.spoiler');

  spoilers.forEach(spoiler => {
    // Add keyboard accessibility
    spoiler.setAttribute('tabindex', '0');
    spoiler.setAttribute('role', 'button');
    spoiler.setAttribute('aria-expanded', 'false');

    spoiler.addEventListener('click', () => {
      spoiler.classList.toggle('revealed');
      const isRevealed = spoiler.classList.contains('revealed');
      spoiler.setAttribute('aria-expanded', isRevealed);
    });

    spoiler.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        spoiler.click();
      }
    });
  });
}

/**
 * Filter Tabs (for collectibles page)
 */
function initFilterTabs() {
  const filterTabs = document.querySelectorAll('.filter-tab');
  const collectibleItems = document.querySelectorAll('.collectible-item');

  if (filterTabs.length === 0) return;

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Get filter value
      const filter = tab.dataset.filter;

      // Filter items
      collectibleItems.forEach(item => {
        if (filter === 'all' || item.dataset.type === filter) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

/**
 * Progress Tracker (for walkthrough page)
 * Uses localStorage to persist individual item progress
 */
function initProgressTracker() {
  const progressFill = document.getElementById('progress-fill');
  const progressCount = document.getElementById('progress-count');
  const progressTotal = document.getElementById('progress-total');
  const resetBtn = document.getElementById('reset-progress');
  const allCheckboxes = document.querySelectorAll('.checklist input[type="checkbox"]');

  if (!progressFill || allCheckboxes.length === 0) return;

  const STORAGE_KEY = 'mixtape-walkthrough-progress';
  const totalItems = allCheckboxes.length;

  // Load saved progress
  let completedItems = loadProgress();

  // Set total count
  if (progressTotal) progressTotal.textContent = totalItems;

  // Initialize checkboxes from saved state
  allCheckboxes.forEach(checkbox => {
    const itemId = checkbox.dataset.item;
    if (itemId && completedItems.includes(itemId)) {
      checkbox.checked = true;
    }

    // Handle checkbox change
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        if (!completedItems.includes(itemId)) {
          completedItems.push(itemId);
        }
      } else {
        completedItems = completedItems.filter(id => id !== itemId);
      }
      saveProgress(completedItems);
      updateProgressUI();
    });
  });

  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all progress? This cannot be undone.')) {
        completedItems = [];
        allCheckboxes.forEach(cb => cb.checked = false);
        saveProgress(completedItems);
        updateProgressUI();
      }
    });
  }

  // Initial UI update
  updateProgressUI();

  function updateProgressUI() {
    const count = completedItems.length;
    const percentage = (count / totalItems) * 100;
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressCount) progressCount.textContent = count;
  }

  function loadProgress() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Could not load progress from localStorage:', e);
      return [];
    }
  }

  function saveProgress(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Could not save progress to localStorage:', e);
    }
  }
}

/**
 * Smooth Scroll for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        
        // Account for sticky header
        const headerHeight = document.querySelector('header')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Update URL without jumping
        history.pushState(null, null, targetId);
      }
    });
  });
}

/**
 * Add CSS for checklist items dynamically
 */
(function addChecklistStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .checklist {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin: 0.75rem 0;
    }

    .checklist label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      background: var(--bg-card2);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .checklist label:hover {
      background: var(--bg-card);
      color: var(--text-primary);
    }

    .checklist input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--accent);
      cursor: pointer;
      flex-shrink: 0;
    }

    .checklist label:has(input:checked) {
      color: var(--text-secondary);
      text-decoration: line-through;
      opacity: 0.7;
    }

    .progress-container {
      background: var(--bg-card);
      padding: 1rem 1.5rem;
      border-radius: 8px;
      margin: 1rem auto 2rem;
      max-width: 600px;
      text-align: center;
    }

    .progress-bar {
      height: 12px;
      background: var(--bg-card2);
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), var(--tape-pink));
      border-radius: 6px;
      transition: width 0.3s ease;
      width: 0%;
    }

    .progress-text {
      font-size: 0.9rem;
      color: var(--text-secondary);
    }
  `;
  document.head.appendChild(style);
})();