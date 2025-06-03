// Global overlay management
class OverlayManager {
  constructor() {
    this.activeOverlays = new Set();
    this.backdrop = null;
    this.init();
  }

  init() {
    // Create universal backdrop
    this.backdrop = document.createElement("div");
    this.backdrop.className = "overlay-backdrop";
    document.body.appendChild(this.backdrop);

    // Handle backdrop clicks
    this.backdrop.addEventListener("click", () => {
      this.closeAll();
    });
  }

  show(identifier) {
    this.activeOverlays.add(identifier);
    this.backdrop.classList.add("active");
    document.body.classList.add("popup-active");
  }

  hide(identifier) {
    this.activeOverlays.delete(identifier);
    if (this.activeOverlays.size === 0) {
      this.backdrop.classList.remove("active");
      document.body.classList.remove("popup-active");
    }
  }

  closeAll() {
    // Close all active popups
    if (this.activeOverlays.has("menu")) {
      closeMobileMenu();
    }
    if (this.activeOverlays.has("calendar")) {
      const calendarInstance = window.calendarInstance;
      if (calendarInstance) {
        calendarInstance.hide();
      }
    }
    if (this.activeOverlays.has("dropdown")) {
      document.querySelectorAll(".dropdown.active").forEach((dropdown) => {
        dropdown.classList.remove("active");
      });
    }
    this.activeOverlays.clear();
    this.backdrop.classList.remove("active");
    document.body.classList.remove("popup-active");
  }
}

// Initialize overlay manager
let overlayManager;

// Mobile menu functionality
function initializeMobileMenu() {
  // Create hamburger button
  const hamburger = document.createElement("button");
  hamburger.className = "hamburger";
  hamburger.innerHTML = `
    <span></span>
    <span></span>
    <span></span>
  `;

  // Add hamburger to header (only on mobile)
  if (window.innerWidth <= 768) {
    const header = document.querySelector("header");
    header.appendChild(hamburger);
  }

  // Toggle mobile menu
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isActive = hamburger.classList.contains("active");

    if (isActive) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMobileMenu();
      const existingHamburger = document.querySelector(".hamburger");
      if (existingHamburger) existingHamburger.remove();
    } else {
      const existingHamburger = document.querySelector(".hamburger");
      if (!existingHamburger) {
        const header = document.querySelector("header");
        header.appendChild(hamburger);
      }
    }
  });
}

function openMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const authButtons = document.querySelector(".auth-buttons");

  hamburger.classList.add("active");
  authButtons.classList.add("active");
  overlayManager.show("menu");
}

function closeMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const authButtons = document.querySelector(".auth-buttons");

  if (hamburger) hamburger.classList.remove("active");
  if (authButtons) authButtons.classList.remove("active");
  overlayManager.hide("menu");
}

// Modified support dropdown for mobile
function setupMobileSupport() {
  const supportBtn = document.querySelector(".support");
  const supportDropdown = document.querySelector(".support-dropdown");

  if (window.innerWidth <= 768) {
    supportBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isActive = supportDropdown.classList.contains("active");

      if (isActive) {
        supportDropdown.classList.remove("active");
      } else {
        supportDropdown.classList.add("active");
        // Don't use overlay for support dropdown as it's inside the menu
      }
    });
  }
}

// Enhanced mobile calendar with blur
function setupMobileCalendar() {
  if (window.innerWidth <= 768) {
    // Override calendar show/hide methods
    const originalShow = Calendar.prototype.show;
    Calendar.prototype.show = function (input) {
      originalShow.call(this, input);
      if (window.innerWidth <= 768) {
        overlayManager.show("calendar");
      }
    };

    const originalHide = Calendar.prototype.hide;
    Calendar.prototype.hide = function () {
      originalHide.call(this);
      overlayManager.hide("calendar");
    };
  }
}

// Enhanced dropdown handling with blur
function setupMobileDropdowns() {
  // FIXME
  const dropdowns = document.querySelectorAll(".dropdown-content");

  dropdowns.forEach((dropdown) => {
    const input = dropdown.querySelector(".search-input");

    // Override click handler for mobile
    if (window.innerWidth <= 768) {
      input.addEventListener("click", (e) => {
        e.stopPropagation();
        const isActive = dropdown.classList.contains("active");

        // Close other dropdowns
        dropdowns.forEach((d) => {
          if (d !== dropdown) d.classList.remove("active");
        });

        if (isActive) {
          dropdown.classList.remove("active");
          overlayManager.hide("dropdown");
        } else {
          dropdown.classList.add("active");
          overlayManager.show("dropdown");
        }
      });

      // Handle done button
      const doneBtn = dropdown.querySelector(".done-btn");
      if (doneBtn) {
        doneBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          dropdown.classList.remove("active");
          overlayManager.hide("dropdown");
        });
      }
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".dropdown") &&
      !e.target.closest(".overlay-backdrop")
    ) {
      dropdowns.forEach((d) => d.classList.remove("active"));
      overlayManager.hide("dropdown");
    }
  });
}

// Touch-friendly carousel
function setupMobileTouchCarousel() {
  const carousel = document.querySelector(".offers-carousel");
  let startX = 0;
  let scrollLeft = 0;
  let isDown = false;

  if (window.innerWidth <= 768 && carousel) {
    carousel.addEventListener("touchstart", (e) => {
      isDown = true;
      startX = e.touches[0].pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
    });

    carousel.addEventListener("touchmove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.touches[0].pageX - carousel.offsetLeft;
      const walk = (x - startX) * 2;
      carousel.scrollLeft = scrollLeft - walk;
    });

    carousel.addEventListener("touchend", () => {
      isDown = false;
    });
  }
}

// Smooth scroll for mobile navigation
function setupMobileSmoothScroll() {
  if (window.innerWidth <= 768) {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          closeMobileMenu();
          setTimeout(() => {
            target.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 300);
        }
      });
    });
  }
}

// Handle escape key to close popups
function setupEscapeKey() {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && window.innerWidth <= 768) {
      overlayManager.closeAll();
    }
  });
}

// Initialize all mobile features
document.addEventListener("DOMContentLoaded", () => {
  // Initialize overlay manager first
  overlayManager = new OverlayManager();

  // Initialize other features
  initializeMobileMenu();
  setupMobileSupport();
  setupMobileCalendar();
  setupMobileDropdowns();
  setupMobileTouchCarousel();
  setupMobileSmoothScroll();
  setupEscapeKey();

  // Store calendar instance globally for mobile backdrop handling
  window.calendarInstance = new Calendar();
});

// Debounce function for resize events
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Optimized resize handler
window.addEventListener(
  "resize",
  debounce(() => {
    if (window.innerWidth > 768) {
      overlayManager.closeAll();
    }
  }, 250)
);

// Prevent scroll when popup is active
document.addEventListener(
  "touchmove",
  (e) => {
    if (document.body.classList.contains("popup-active")) {
      const isScrollable = e.target.closest(
        ".auth-buttons, .dropdown-content, .calendar-widget"
      );
      if (!isScrollable) {
        e.preventDefault();
      }
    }
  },
  { passive: false }
);

// document.querySelectorAll(".search-field.dropdown input").forEach((input) => {
//   input.addEventListener("click", () => {
//     const dropdown = input.closest(".dropdown");
//     document.querySelectorAll(".dropdown").forEach((d) => {
//       if (d !== dropdown) d.classList.remove("active");
//     });
//     dropdown.classList.toggle("active");
//     document.body.classList.toggle(
//       "popup-active",
//       dropdown.classList.contains("active")
//     );
//   });
// });

// const passengersInput = document.querySelector(".search-field.dropdown");
// const passengerDropdown = document.querySelector(".dropdown-content");
