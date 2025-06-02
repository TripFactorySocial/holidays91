"use strict";
// Calendar functionality
/*
  ██████ █████ ██     ██████████    ████████  █████ ██████
 ██     ██   ████     ██     ████   ████   ████   ████   ██
 ██     █████████     █████  ██ ██  ████   ███████████████
 ██     ██   ████     ██     ██  ██ ████   ████   ████   ██
  ████████   ██████████████████   ██████████ ██   ████   ██
*/
class Calendar {
  constructor() {
    this.currentDate = new Date();
    this.selectedDate = null;
    this.activeInput = null;
    this.widget = document.getElementById("calendar-widget");
    this.init();
  }

  init() {
    this.setupDateInputs();
    this.setupNavigation();
    this.setupActionButtons();
    this.render();

    // Close calendar when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !e.target.closest(".search-field") &&
        !e.target.closest(".calendar-widget")
      ) {
        this.hide();
      }
    });
  }

  setupDateInputs() {
    const dateInputs = document.querySelectorAll(".date-picker");
    dateInputs.forEach((input) => {
      input.addEventListener("click", (e) => {
        e.stopPropagation();
        // Check if input is disabled
        if (
          !input.classList.contains("disabled") &&
          !input.hasAttribute("disabled")
        ) {
          this.show(input);
        }
      });
    });
  }

  setupActionButtons() {
    const cancelBtn = this.widget.querySelector(".calendar-cancel");
    const doneBtn = this.widget.querySelector(".calendar-done");

    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        this.hide();
      });
    }

    if (doneBtn) {
      doneBtn.addEventListener("click", () => {
        if (this.selectedDate && this.activeInput) {
          const options = { day: "numeric", month: "short", year: "numeric" };
          this.activeInput.value = this.selectedDate.toLocaleDateString(
            "en-US",
            options
          );
        }
        this.hide();
      });
    }
  }

  setupNavigation() {
    const prevBtn = this.widget.querySelector(".prev-month");
    const nextBtn = this.widget.querySelector(".next-month");

    prevBtn.addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.render();
    });

    nextBtn.addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.render();
    });
  }

  show(input) {
    this.activeInput = input;
    const rect = input.getBoundingClientRect();
    const field = input.closest(".search-field");

    this.widget.style.top = `${rect.bottom + window.scrollY}px`;
    this.widget.style.left = `${rect.left + window.scrollX}px`;
    this.widget.classList.add("active");

    this.render();
  }

  hide() {
    this.widget.classList.remove("active");
    this.activeInput = null;
  }

  render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Update title
    const title = this.widget.querySelector(".calendar-title");
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    title.textContent = `${monthNames[month]} ${year}`;

    // Generate dates
    const datesContainer = this.widget.querySelector(".calendar-dates");
    datesContainer.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // Previous month days
    for (let i = 0; i < firstDay; i++) {
      const date = document.createElement("div");
      date.classList.add("calendar-date", "other-month");
      datesContainer.appendChild(date);
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = document.createElement("div");
      date.classList.add("calendar-date");
      date.textContent = day;

      const currentDate = new Date(year, month, day);

      // Check if today
      if (currentDate.toDateString() === today.toDateString()) {
        date.classList.add("today");
      }

      // Check if past date
      if (currentDate < today.setHours(0, 0, 0, 0)) {
        date.classList.add("disabled");
      }

      // Check if selected
      if (
        this.selectedDate &&
        currentDate.toDateString() === this.selectedDate.toDateString()
      ) {
        date.classList.add("selected");
      }

      date.addEventListener("click", () => {
        if (!date.classList.contains("disabled")) {
          this.selectDate(currentDate);
        }
      });

      datesContainer.appendChild(date);
    }
  }

  selectDate(date) {
    this.selectedDate = date;
    if (this.activeInput) {
      const options = { day: "numeric", month: "short", year: "numeric" };
      this.activeInput.value = date.toLocaleDateString("en-US", options);

      // Auto-open return date if selecting departure
      if (this.activeInput.id.includes("departure")) {
        const returnInput = this.activeInput
          .closest(".search-row")
          .querySelector('[id*="return-date"]');
        if (returnInput) {
          setTimeout(() => this.show(returnInput), 300);
        }
      } else {
        this.hide();
      }
    }
  }
}

// Tab switching functionality with return date handling
/*
 █████████████ ██████     █████████     ████████████████████   ██
    ██  ██   ████   ██    ██     ██     ████   ██  ██     ██   ██
    ██  █████████████     █████████  █  ████   ██  ██     ███████
    ██  ██   ████   ██         ████ ███ ████   ██  ██     ██   ██
    ██  ██   ████████     ███████ ███ ███ ██   ██   ████████   ██
*/
function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".search-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetTab = tab.getAttribute("data-tab");

      // Update active states
      tabs.forEach((t) => t.classList.remove("active"));
      contents.forEach((c) => c.classList.remove("active"));

      tab.classList.add("active");
      document.getElementById(targetTab).classList.add("active");

      // Handle return date field
      if (targetTab === "one-way") {
        const returnDate = document.getElementById("return-date-1");
        returnDate.classList.add("disabled");
        returnDate.setAttribute("disabled", "true");
        returnDate.value = "";
      } else {
        const returnDate = document.getElementById("return-date-2");
        returnDate.classList.remove("disabled");
        returnDate.removeAttribute("disabled");
      }
    });
  });

  // Initialize one-way return date as disabled
  const oneWayReturn = document.getElementById("return-date-1");
  oneWayReturn.classList.add("disabled");
  oneWayReturn.setAttribute("disabled", "true");
}

// Simpler swap animation
/*
 █████████     ██ █████ ██████
 ██     ██     ████   ████   ██
 █████████  █  ███████████████
      ████ ███ ████   ████
 ███████ ███ ███ ██   ████
*/
function setupSwapButtons() {
  const swapButtons = document.querySelectorAll(".swap-btn");

  swapButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabType = btn.getAttribute("data-tab");
      const fromInput = document.getElementById(
        `from-airport-${tabType === "one-way" ? "1" : "2"}`
      );
      const toInput = document.getElementById(
        `to-airport-${tabType === "one-way" ? "1" : "2"}`
      );

      // Add fade animation
      fromInput.style.transition = "opacity 0.2s ease";
      toInput.style.transition = "opacity 0.2s ease";

      // Fade out
      fromInput.style.opacity = "0";
      toInput.style.opacity = "0";

      // Add rotation animation to button
      btn.classList.add("swap-active");

      // Swap values after fade out
      setTimeout(() => {
        const temp = fromInput.value;
        fromInput.value = toInput.value;
        toInput.value = temp;

        // Fade back in
        fromInput.style.opacity = "1";
        toInput.style.opacity = "1";
      }, 200);

      // Remove button animation
      setTimeout(() => {
        btn.classList.remove("swap-active");
        // Reset transitions
        fromInput.style.transition = "";
        toInput.style.transition = "";
      }, 500);
    });
  });
}

// Helper function to wrap input
/*
 ██     ████████  █████ ██████     █████    ████████ ██    ██████████
 ██     ████   ████   ████   ██    ██████   ████   ████    ██   ██
 ██  █  ████████ █████████████     ████ ██  ████████ ██    ██   ██
 ██ ███ ████   ████   ████         ████  ██ ████     ██    ██   ██
  ███ ███ ██   ████   ████         ████   ██████      ██████    ██
*/
function wrapInput(input) {
  const wrapper = document.createElement("div");
  wrapper.className = "input-wrapper";
  input.parentNode.insertBefore(wrapper, input);
  wrapper.appendChild(input);
}

/*
 ██████  █████ ████████████████████████    ██ ██████ █████████████      ████████████ ██    █████    ███████████████████████
 ██   ████   ████     ██     ██     ████   ████      ██     ██   ██    ██    ██    ████    ██████   ██   ██   ██     ██   ██
 ██████ ██████████████████████████  ██ ██  ████   ████████  ██████     ██    ██    ████    ████ ██  ██   ██   █████  ██████
 ██     ██   ██     ██     ████     ██  ██ ████    ████     ██   ██    ██    ██    ████    ████  ██ ██   ██   ██     ██   ██
 ██     ██   █████████████████████████   ████ ██████ █████████   ██     ████████████  ██████ ██   ████   ██   █████████   ██
*/
function setupPassengerCounters() {
  const dropdowns = document.querySelectorAll(".dropdown");

  dropdowns.forEach((dropdown) => {
    const input = dropdown.querySelector(".search-input");
    const dropdownContent = dropdown.querySelector(".dropdown-content");

    // Toggle dropdown
    input.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("active");
    });

    // Setup counters
    const counters = dropdown.querySelectorAll(".passenger-type");
    counters.forEach((counter) => {
      const decreaseBtn = counter.querySelector(".decrease");
      const increaseBtn = counter.querySelector(".increase");
      const valueEl = counter.querySelector(".counter-value");
      const type = counter.getAttribute("data-type");

      decreaseBtn.addEventListener("click", () => {
        let value = parseInt(valueEl.textContent);
        if (type === "adults" && value > 1) {
          value--;
        } else if (type !== "adults" && value > 0) {
          value--;
        }
        valueEl.textContent = value;
        updatePassengerText(dropdown);
      });

      increaseBtn.addEventListener("click", () => {
        let value = parseInt(valueEl.textContent);
        if (value < 9) {
          value++;
          valueEl.textContent = value;
          updatePassengerText(dropdown);
        }
      });
    });

    // Update cabin class
    const radioInputs = dropdown.querySelectorAll('input[type="radio"]');
    radioInputs.forEach((radio) => {
      radio.addEventListener("change", () => {
        updatePassengerText(dropdown);
      });
    });

    // Setup Done button
    const doneBtn = dropdown.querySelector(".done-btn");
    if (doneBtn) {
      doneBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.remove("active");
      });
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown")) {
      dropdowns.forEach((d) => d.classList.remove("active"));
    }
  });
}

/*
 ██████  █████ ████████████████████████    ██ ██████ █████████████     █████████████████   ██████████
 ██   ████   ████     ██     ██     ████   ████      ██     ██   ██       ██   ██      ██ ██    ██
 ██████ ██████████████████████████  ██ ██  ████   ████████  ██████        ██   █████    ███     ██
 ██     ██   ██     ██     ████     ██  ██ ████    ████     ██   ██       ██   ██      ██ ██    ██
 ██     ██   █████████████████████████   ████ ██████ █████████   ██       ██   █████████   ██   ██
*/
function updatePassengerText(dropdown) {
  const input = dropdown.querySelector(".search-input");
  const counters = dropdown.querySelectorAll(".passenger-type");
  const selectedClass = dropdown.querySelector(
    'input[type="radio"]:checked'
  ).value;

  let passengers = [];
  counters.forEach((counter) => {
    const value = parseInt(counter.querySelector(".counter-value").textContent);
    const type = counter.getAttribute("data-type");

    if (value > 0) {
      if (type === "adults") {
        passengers.push(`${value} Adult${value > 1 ? "s" : ""}`);
      } else if (type === "children") {
        passengers.push(`${value} Child${value > 1 ? "ren" : ""}`);
      } else if (type === "infants") {
        passengers.push(`${value} Infant${value > 1 ? "s" : ""}`);
      }
    }
  });

  const passengerText = passengers.join(", ") || "1 Adult";
  const classText =
    selectedClass.charAt(0).toUpperCase() + selectedClass.slice(1);
  input.value = `${passengerText}, ${classText}`;
}

// Initialize everything when DOM is loaded
/*
 █████    ██████████████ █████ ██     ████████████████
 ██████   ████   ██   ████   ████     ██   ███ ██
 ████ ██  ████   ██   ███████████     ██  ███  █████
 ████  ██ ████   ██   ████   ████     ██ ███   ██
 ████   ██████   ██   ████   █████████████████████████
*/
document.addEventListener("DOMContentLoaded", () => {
  new Calendar();
  setupTabs();
  setupSwapButtons();
  setupPassengerCounters();
  setupOffersCarousel();
  setupContentAnimation();
  collapseFooter();

  // Initialize passenger text
  document.querySelectorAll(".dropdown").forEach((dropdown) => {
    updatePassengerText(dropdown);
  });
});

// Offers carousel functionality
/*
  ██████ █████ ██████  ██████ ██    ██████████████████
 ██     ██   ████   ████    ████    ████     ██     ██
 ██     █████████████ ██    ████    ██████████████  ██
 ██     ██   ████   ████    ████    ██     ████     ██
  ████████   ████   ██ ██████  ██████ █████████████████████
*/
function setupOffersCarousel() {
  const carousel = document.querySelector(".offers-carousel");
  const prevBtn = document.querySelector(".offers-nav-prev");
  const nextBtn = document.querySelector(".offers-nav-next");
  const indicators = document.querySelectorAll(".indicator");

  let currentSlide = 0;
  const cardWidth = 320; // Width of each card
  const gap = 24; // Gap between cards (1.5rem)
  const cardsPerView = 4; // Number of cards visible at once
  const totalCards = document.querySelectorAll(".offer-card").length;
  const maxSlide = Math.ceil(totalCards / cardsPerView) - 1;

  function updateCarousel() {
    const offset = currentSlide * (cardWidth + gap) * cardsPerView;
    carousel.style.transform = `translateX(-${offset}px)`;

    // Update indicators
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === currentSlide);
    });

    // Update button states
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === maxSlide;
  }

  prevBtn.addEventListener("click", () => {
    if (currentSlide > 0) {
      currentSlide--;
      updateCarousel();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentSlide < maxSlide) {
      currentSlide++;
      updateCarousel();
    }
  });

  // Indicator clicks
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      currentSlide = index;
      updateCarousel();
    });
  });

  // Initialize
  updateCarousel();
}

// Animate content sections on scroll
function setupContentAnimation() {
  const contentHeadings = document.querySelectorAll(".content-section h2");

  const observerOptions = {
    threshold: 0.5,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");
      }
    });
  }, observerOptions);

  contentHeadings.forEach((heading) => {
    observer.observe(heading);
  });
}

// Update the collapseFooter function
/*
  ████████████ ██     ██      █████ ██████ ██████████████    █████████████  ███████████████████████████
 ██    ██    ████     ██     ██   ████   ████     ██         ██    ██    ████    ██  ██   ██     ██   ██
 ██    ██    ████     ██     █████████████ ████████████      █████ ██    ████    ██  ██   █████  ██████
 ██    ██    ████     ██     ██   ████          ████         ██    ██    ████    ██  ██   ██     ██   ██
  ████████████ ████████████████   ████     ██████████████    ██     ██████  ██████   ██   █████████   ██
*/
function collapseFooter() {
  const collapseBtn = document.querySelector(".footer-collapsable-btn");
  const fooList = document.querySelectorAll(".foo-collapse");
  const iata = document.querySelector(".iata-member");

  collapseBtn.addEventListener("click", (e) => {
    fooList.forEach((ele) => ele.classList.toggle("footer-toggle"));
    iata.classList.toggle("footer-toggle");
    collapseBtn.classList.toggle("rotated");
  });
}
