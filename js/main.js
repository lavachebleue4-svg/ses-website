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
  scene.fog = new THREE.FogExp2(0x05060f, 0.035);

  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 9;

  /* Starfield particles */
  const STAR_COUNT = 2400;
  const positions = new Float32Array(STAR_COUNT * 3);
  const colors = new Float32Array(STAR_COUNT * 3);
  const cyan = new THREE.Color(0x4ee1ff);
  const violet = new THREE.Color(0x8b5cf6);
  const white = new THREE.Color(0xeef0ff);

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

  /* Central DNA double helix (medical e-learning core) */
  const coreGroup = new THREE.Group();

  const DNA_COUNT = 170;
  const dnaRadius = 2.0, dnaHeight = 11, dnaTwist = 1.25;
  const strandA = new Float32Array(DNA_COUNT * 3);
  const strandB = new Float32Array(DNA_COUNT * 3);
  const rungVerts = [];
  for (let i = 0; i < DNA_COUNT; i++) {
    const y = (i / (DNA_COUNT - 1) - 0.5) * dnaHeight;
    const a = y * dnaTwist;
    strandA[i * 3] = Math.cos(a) * dnaRadius;
    strandA[i * 3 + 1] = y;
    strandA[i * 3 + 2] = Math.sin(a) * dnaRadius;
    strandB[i * 3] = Math.cos(a + Math.PI) * dnaRadius;
    strandB[i * 3 + 1] = y;
    strandB[i * 3 + 2] = Math.sin(a + Math.PI) * dnaRadius;
    // Base-pair rungs between the strands
    if (i % 8 === 0) {
      rungVerts.push(strandA[i * 3], y, strandA[i * 3 + 2], strandB[i * 3], y, strandB[i * 3 + 2]);
    }
  }
  const strandMat = (color) => new THREE.PointsMaterial({
    color, size: 0.075, transparent: true, opacity: 0.85, depthWrite: false,
  });
  const strandAGeo = new THREE.BufferGeometry();
  strandAGeo.setAttribute("position", new THREE.BufferAttribute(strandA, 3));
  const strandAPoints = new THREE.Points(strandAGeo, strandMat(0x4ee1ff));
  coreGroup.add(strandAPoints);
  const strandBGeo = new THREE.BufferGeometry();
  strandBGeo.setAttribute("position", new THREE.BufferAttribute(strandB, 3));
  const strandBPoints = new THREE.Points(strandBGeo, strandMat(0xe879f9));
  coreGroup.add(strandBPoints);
  const rungGeo = new THREE.BufferGeometry();
  rungGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(rungVerts), 3));
  coreGroup.add(new THREE.LineSegments(rungGeo, new THREE.LineBasicMaterial({
    color: 0x8b5cf6, transparent: true, opacity: 0.3,
  })));

  coreGroup.rotation.z = 0.14;
  scene.add(coreGroup);

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
      stars.rotation.y = t * 0.015;
      stars.rotation.x = Math.sin(t * 0.05) * 0.05;

      coreGroup.rotation.y = t * 0.22 + scrollY * 0.0006;
      strandAPoints.material.opacity = 0.75 + Math.sin(t * 1.8) * 0.15;
      strandBPoints.material.opacity = 0.75 + Math.cos(t * 1.8) * 0.15;

      // Parallax: ease camera toward mouse; sink helix as user scrolls
      camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 0.8 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      coreGroup.position.y = -scrollY * 0.0022;
    }

    renderer.render(scene, camera);
  }
  animate();
})();
