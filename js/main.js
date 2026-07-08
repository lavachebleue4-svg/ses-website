/* ============ Software Expert Systems — interactions ============ */

/* ---------- Loader ---------- */
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("loader").classList.add("done"), 500);
});

/* ---------- Life at SES photo carousel ---------- */
window.addEventListener("load", () => {
  const track = document.querySelector(".photo-track");
  if (!track) return;
  const photos = track.querySelectorAll("figure");
  if (photos.length === 0) {
    // No team photos in assets/team yet — hide the section entirely
    document.getElementById("life").style.display = "none";
    return;
  }
  // Duplicate the set once so the drift loops seamlessly
  photos.forEach((f) => track.appendChild(f.cloneNode(true)));

  track.querySelectorAll("img").forEach((img) => { img.draggable = false; });

  const marquee = document.querySelector(".photo-marquee");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = lightbox.querySelector("img");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DRIFT_SPEED = 22; // px per second — a relaxed stroll
  let offset = 0;
  let hovered = false;
  let dragging = false;
  let dragDist = 0;
  let startX = 0;
  let startOffset = 0;

  const halfWidth = () => track.scrollWidth / 2;
  const lightboxOpen = () => lightbox.classList.contains("open");

  marquee.addEventListener("pointerenter", () => { hovered = true; });
  marquee.addEventListener("pointerleave", () => { hovered = false; });

  /* Drag on desktop, swipe on touch */
  marquee.addEventListener("pointerdown", (e) => {
    dragging = true;
    dragDist = 0;
    startX = e.clientX;
    startOffset = offset;
    marquee.setPointerCapture(e.pointerId);
  });
  marquee.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    dragDist = Math.max(dragDist, Math.abs(dx));
    offset = startOffset - dx;
  });
  marquee.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    // A press that barely moved is a tap/click — enlarge that photo
    if (dragDist < 8) {
      const fig = e.target.closest("figure");
      if (fig) {
        lightboxImg.src = fig.querySelector("img").src;
        lightbox.classList.add("open");
        document.body.style.overflow = "hidden";
      }
    }
  });
  marquee.addEventListener("pointercancel", () => { dragging = false; });

  /* Lightbox close: X button, backdrop click, or Escape */
  const closeLightbox = () => {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
  };
  lightbox.addEventListener("click", (e) => { if (e.target !== lightboxImg) closeLightbox(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && lightboxOpen()) closeLightbox(); });

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!hovered && !dragging && !reduced && !lightboxOpen()) {
      offset += DRIFT_SPEED * dt;
    }
    const h = halfWidth();
    offset = ((offset % h) + h) % h;
    track.style.transform = `translateX(${-offset}px)`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
});

/* ---------- Nav ---------- */
const nav = document.getElementById("nav");
const burger = document.getElementById("navBurger");
const navLinks = document.querySelector(".nav-links");

window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 40);
}, { passive: true });

burger.addEventListener("click", () => {
  burger.classList.toggle("open");
  navLinks.classList.toggle("open");
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    burger.classList.remove("open");
    navLinks.classList.remove("open");
  })
);

/* ---------- Scroll reveal ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${(i % 4) * 80}ms`;
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ---------- Animated counters ---------- */
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      const duration = 1600;
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll(".stat-num").forEach((el) => counterObserver.observe(el));
