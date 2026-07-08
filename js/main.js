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

  const marquee = document.querySelector(".photo-marquee");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DRIFT_SPEED = 22; // px per second — a relaxed stroll
  const GAP = 26;
  let offset = 0;
  let paused = false;
  let tween = null;

  marquee.addEventListener("pointerenter", () => { paused = true; });
  marquee.addEventListener("pointerleave", () => { paused = false; });

  const halfWidth = () => track.scrollWidth / 2;
  const cardStep = () => photos[0].getBoundingClientRect().width + GAP;

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (tween) {
      const p = Math.min((now - tween.start) / tween.dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      offset = tween.from + (tween.to - tween.from) * eased;
      if (p >= 1) tween = null;
    } else if (!paused && !reduced) {
      offset += DRIFT_SPEED * dt;
    }
    const h = halfWidth();
    offset = ((offset % h) + h) % h;
    track.style.transform = `translateX(${-offset}px)`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  const go = (dir) => {
    const from = tween ? tween.to : offset;
    tween = { from: offset, to: from + dir * cardStep(), start: performance.now(), dur: 450 };
  };
  document.querySelector(".car-btn.next").addEventListener("click", () => go(1));
  document.querySelector(".car-btn.prev").addEventListener("click", () => go(-1));
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
