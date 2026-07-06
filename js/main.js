/* ============ Software Expert Systems — interactions & 3D ============ */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Loader ---------- */
window.addEventListener("load", () => {
  setTimeout(() => document.getElementById("loader").classList.add("done"), 600);
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
  // Duplicate the set once so the -50% drift loops seamlessly
  photos.forEach((f) => track.appendChild(f.cloneNode(true)));
});

/* ---------- Cursor glow ---------- */
const glow = document.getElementById("cursorGlow");
window.addEventListener("pointermove", (e) => {
  glow.style.left = e.clientX + "px";
  glow.style.top = e.clientY + "px";
}, { passive: true });

/* ---------- Scroll reveal ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${(i % 4) * 90}ms`;
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

/* ---------- 3D tilt cards ---------- */
if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.transform =
        `perspective(900px) rotateY(${(x - 0.5) * 10}deg) rotateX(${(0.5 - y) * 10}deg) translateZ(6px)`;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
    });
  });
}

/* ---------- Three.js scene: starfield + DNA double helix ---------- */
(function initScene() {
  if (typeof THREE === "undefined") return;

  const canvas = document.getElementById("scene");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050a34, 0.035);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 9;

  /* Starfield particles */
  const STAR_COUNT = 2400;
  const positions = new Float32Array(STAR_COUNT * 3);
  const colors = new Float32Array(STAR_COUNT * 3);
  const cyan = new THREE.Color(0x00a9f2);
  const violet = new THREE.Color(0xb3d4e0);
  const white = new THREE.Color(0xf4f9fc);

  for (let i = 0; i < STAR_COUNT; i++) {
    // Scatter in a large sphere shell around the camera
    const radius = 6 + Math.random() * 22;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi) - 6;

    const c = Math.random() < 0.75 ? white : Math.random() < 0.5 ? cyan : violet;
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }

  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    size: 0.045,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  }));
  scene.add(stars);

  /* Mouse parallax + scroll drift */
  let mouseX = 0, mouseY = 0, scrollY = 0;
  window.addEventListener("pointermove", (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });
  window.addEventListener("scroll", () => { scrollY = window.scrollY; }, { passive: true });

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    if (!prefersReducedMotion) {
      stars.rotation.y = t * 0.015 + scrollY * 0.0002;
      stars.rotation.x = Math.sin(t * 0.05) * 0.05;

      // Parallax: ease camera toward mouse
      camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 0.8 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
  }
  animate();
})();
