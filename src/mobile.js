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

  // Create mobile overlay
  const overlay = document.createElement("div");
  overlay.className = "mobile-overlay";

  // Add hamburger to header (only on mobile)
  if (window.innerWidth <= 768) {
    const header = document.querySelector("header");
    header.appendChild(hamburger);
    document.body.appendChild(overlay);
  }

  // Toggle mobile menu
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    const authButtons = document.querySelector(".auth-buttons");
    const isActive = hamburger.classList.contains("active");

    if (isActive) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  // Close menu when clicking overlay
  overlay.addEventListener("click", closeMobileMenu);

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMobileMenu();
      const existingHamburger = document.querySelector(".hamburger");
      const existingOverlay = document.querySelector(".mobile-overlay");
      if (existingHamburger) existingHamburger.remove();
      if (existingOverlay) existingOverlay.remove();
    } else {
      const existingHamburger = document.querySelector(".hamburger");
      if (!existingHamburger) {
        const header = document.querySelector("header");
        header.appendChild(hamburger);
        document.body.appendChild(overlay);
      }
    }
  });
}

function openMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const authButtons = document.querySelector(".auth-buttons");
  const overlay = document.querySelector(".mobile-overlay");

  hamburger.classList.add("active");
  authButtons.classList.add("active");
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const authButtons = document.querySelector(".auth-buttons");
  const overlay = document.querySelector(".mobile-overlay");

  if (hamburger) hamburger.classList.remove("active");
  if (authButtons) authButtons.classList.remove("active");
  if (overlay) overlay.classList.remove("active");
  document.body.style.overflow = "";
}

// Modified support dropdown for mobile
function setupMobileSupport() {
  const supportBtn = document.querySelector(".support");
  const supportDropdown = document.querySelector(".support-dropdown");

  if (window.innerWidth <= 768) {
    supportBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      supportDropdown.classList.toggle("active");
    });
  }
}

// Improved mobile calendar positioning
function setupMobileCalendar() {
  const calendar = document.querySelector(".calendar-widget");

  if (window.innerWidth <= 768) {
    // Add backdrop for mobile calendar
    const calendarBackdrop = document.createElement("div");
    calendarBackdrop.className = "calendar-backdrop";
    calendarBackdrop.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1001;
    `;
    document.body.appendChild(calendarBackdrop);

    // Show/hide calendar backdrop
    const originalShow = Calendar.prototype.show;
    Calendar.prototype.show = function (input) {
      originalShow.call(this, input);
      if (window.innerWidth <= 768) {
        calendarBackdrop.style.display = "block";
        document.body.style.overflow = "hidden";
      }
    };

    const originalHide = Calendar.prototype.hide;
    Calendar.prototype.hide = function () {
      originalHide.call(this);
      calendarBackdrop.style.display = "none";
      document.body.style.overflow = "";
    };

    // Close calendar when clicking backdrop
    calendarBackdrop.addEventListener("click", () => {
      const calendarInstance = window.calendarInstance;
      if (calendarInstance) {
        calendarInstance.hide();
      }
    });
  }
}

// Touch-friendly carousel
function setupMobileTouchCarousel() {
  const carousel = document.querySelector(".offers-carousel");
  let startX = 0;
  let scrollLeft = 0;
  let isDown = false;

  if (window.innerWidth <= 768) {
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

// Initialize all mobile features
document.addEventListener("DOMContentLoaded", () => {
  initializeMobileMenu();
  setupMobileSupport();
  setupMobileCalendar();
  setupMobileTouchCarousel();
  setupMobileSmoothScroll();

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
      closeMobileMenu();
    }
  }, 250)
);
