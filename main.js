document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  const body = document.body;
  const nav = document.querySelector(".nav-glass");
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = Array.from(document.querySelectorAll(".story-section"));
  const scrollHint = document.querySelector(".scroll-hint");
  const menuToggle = document.querySelector(".menu-toggle");
  const menuOverlay = document.querySelector(".menu-overlay");
  const parallaxTargets = Array.from(document.querySelectorAll(".year-callout"));
  const timelineSection = document.querySelector(".timeline-section");
  const timelineLine = document.querySelector(".timeline-line");
  const timelineItems = Array.from(document.querySelectorAll(".timeline-item"));
  const progressYear = document.querySelector("#progress-year");
  const spotlight = document.querySelector(".spotlight-layer");
  const heroShell = document.querySelector(".hero-shell");
  const cards = Array.from(document.querySelectorAll(".doc-card"));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  let timelineAnimated = false;

  const setActiveSection = (section) => {
    if (!section) {
      return;
    }

    const id = section.id;
    body.dataset.active = id;

    sections.forEach((item) => {
      item.classList.toggle("is-current", item === section);
    });

    navLinks.forEach((link) => {
      const isMatch = link.getAttribute("href") === `#${id}`;
      link.classList.toggle("is-active", isMatch);
    });

    if (progressYear && section.dataset.year) {
      progressYear.textContent = section.dataset.year;
    }
  };

  const closeMenu = () => {
    if (!menuOverlay || !menuToggle) {
      return;
    }
    menuOverlay.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  if (menuToggle && menuOverlay) {
    menuToggle.addEventListener("click", () => {
      const isOpen = menuOverlay.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") {
        return;
      }
      const target = document.querySelector(href);
      if (!target) {
        return;
      }
      event.preventDefault();
      closeMenu();
      const navHeight = nav ? nav.offsetHeight : 0;
      const extraOffset = 18;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - extraOffset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  if (window.anime && !reduceMotion) {
    anime({
      targets: ".hero-title .char",
      opacity: [0, 1],
      translateY: [22, 0],
      rotateZ: [4, 0],
      duration: 820,
      delay: anime.stagger(40),
      easing: "easeOutExpo"
    });

    anime({
      targets: ".hero-subtitle",
      opacity: [0, 1],
      translateY: [16, 0],
      duration: 900,
      delay: 430,
      easing: "easeOutQuart"
    });

    anime({
      targets: ".hero-metrics .metric",
      opacity: [0, 1],
      translateY: [14, 0],
      duration: 760,
      delay: anime.stagger(110, { start: 570 }),
      easing: "easeOutCubic"
    });

    anime({
      targets: ".progress-rail",
      opacity: [0, 1],
      translateX: [12, 0],
      duration: 820,
      delay: 620,
      easing: "easeOutQuart"
    });

    anime({
      targets: ".scroll-hint",
      opacity: [0.5, 1],
      translateY: [0, 8],
      duration: 1100,
      direction: "alternate",
      easing: "easeInOutSine",
      loop: true
    });

    anime({
      targets: ".timbro",
      opacity: [0, 0.92],
      scale: [1.26, 1],
      rotate: [-15, -7],
      duration: 800,
      delay: anime.stagger(90, { start: 420 }),
      easing: "easeOutBack"
    });

    anime({
      targets: ".registro-riga",
      opacity: [0, 1],
      translateY: [11, 0],
      duration: 650,
      delay: anime.stagger(40, { start: 520 }),
      easing: "easeOutSine"
    });
  }

  const sectionObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        entry.target.classList.add("is-visible");
        if (window.anime && !reduceMotion) {
          anime({
            targets: entry.target,
            opacity: [0, 1],
            translateY: [34, 0],
            scale: [0.985, 1],
            duration: 860,
            easing: "easeOutCubic"
          });
        } else {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0) scale(1)";
        }
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -10% 0px" }
  );

  sections.forEach((section) => sectionObserver.observe(section));

  const activeObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visible.length) {
        return;
      }

      setActiveSection(visible[0].target);
    },
    { threshold: [0.35, 0.55, 0.75], rootMargin: "-14% 0px -42% 0px" }
  );

  sections.forEach((section) => activeObserver.observe(section));

  if (sections[0]) {
    setActiveSection(sections[0]);
  }

  const onScroll = () => {
    const y = window.scrollY;

    if (scrollHint) {
      const shouldHide = y > 300;
      scrollHint.classList.toggle("is-hidden", shouldHide);
    }

    if (nav) {
      nav.classList.toggle("is-compact", y > 40);
    }

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? Math.min(1, Math.max(0, y / maxScroll)) : 0;
    root.style.setProperty("--scroll-progress", progress.toFixed(4));
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  let rafId = null;

  const applyParallax = () => {
    const y = window.scrollY;

    parallaxTargets.forEach((target) => {
      const speed = Number(target.dataset.speed) || 0.08;
      const shift = y * speed;
      target.style.transform = `translateY(calc(-50% + ${shift}px))`;
    });

    if (heroShell && !reduceMotion) {
      const heroShift = Math.min(y * 0.055, 36);
      const heroFade = 1 - Math.min(y / 850, 0.4);
      heroShell.style.transform = `translate3d(0, ${heroShift}px, 0)`;
      heroShell.style.opacity = String(heroFade);
    }

    rafId = null;
  };

  const requestParallax = () => {
    if (rafId !== null) {
      return;
    }
    rafId = window.requestAnimationFrame(applyParallax);
  };

  if (!reduceMotion) {
    window.addEventListener("scroll", requestParallax, { passive: true });
    window.addEventListener("resize", requestParallax);
    requestParallax();
  }

  if (finePointer && spotlight && !reduceMotion) {
    const updateSpotlight = (event) => {
      root.style.setProperty("--spotlight-x", `${event.clientX}px`);
      root.style.setProperty("--spotlight-y", `${event.clientY}px`);
    };

    window.addEventListener("pointermove", updateSpotlight, { passive: true });
    window.addEventListener("pointerleave", () => {
      root.style.setProperty("--spotlight-x", "50vw");
      root.style.setProperty("--spotlight-y", "30vh");
    });
  } else if (spotlight) {
    spotlight.style.display = "none";
  }

  if (finePointer && !reduceMotion) {
    cards.forEach((card) => {
      let frame = null;

      card.addEventListener("pointermove", (event) => {
        if (frame !== null) {
          window.cancelAnimationFrame(frame);
        }

        frame = window.requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const px = (event.clientX - rect.left) / rect.width;
          const py = (event.clientY - rect.top) / rect.height;
          const tiltY = (px - 0.5) * 4.6;
          const tiltX = (0.5 - py) * 4.2;

          card.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
          card.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
          frame = null;
        });
      });

      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tilt-x", "0deg");
        card.style.setProperty("--tilt-y", "0deg");
      });
    });
  }

  const timelineObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || timelineAnimated) {
          return;
        }
        timelineAnimated = true;

        if (window.anime && !reduceMotion) {
          anime({
            targets: timelineLine,
            scaleY: [0, 1],
            duration: 1100,
            easing: "easeOutQuart"
          });
          anime({
            targets: timelineItems,
            opacity: [0, 1],
            translateY: [20, 0],
            duration: 640,
            delay: anime.stagger(140),
            easing: "easeOutSine"
          });
        } else {
          if (timelineLine) {
            timelineLine.style.transform = "translateX(-50%) scaleY(1)";
          }
          timelineItems.forEach((item) => {
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
          });
        }

        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  if (timelineSection) {
    timelineObserver.observe(timelineSection);
  }
});
