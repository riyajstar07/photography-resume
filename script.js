// ───────── theme (paper / chalkboard) ─────────
const root = document.documentElement;
const darkQuery = matchMedia("(prefers-color-scheme: dark)");
try {
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;
} catch (e) {}
document.getElementById("themeToggle").addEventListener("click", () => {
  const isDark = root.dataset.theme ? root.dataset.theme === "dark" : darkQuery.matches;
  const next = isDark ? "light" : "dark";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// ───────── mobile nav ─────────
const burger = document.getElementById("burger");
const links = document.getElementById("navLinks");
const setMenu = (open) => {
  burger.classList.toggle("open", open);
  links.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open);
};
burger.addEventListener("click", () => setMenu(!links.classList.contains("open")));
links.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

// ───────── reveal on scroll + counters ─────────
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      entry.target.querySelectorAll("[data-count]").forEach(countUp);
      io.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  io.observe(el);
});

function countUp(el) {
  const target = +el.dataset.count;
  const start = performance.now();
  const step = (t) => {
    const p = Math.min((t - start) / 1300, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ───────── work filter ─────────
const filterBtns = document.querySelectorAll(".filters button");
filterBtns.forEach((btn) =>
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.toggle("active", b === btn));
    const f = btn.dataset.filter;
    document.querySelectorAll(".wall .polaroid").forEach((p) =>
      p.classList.toggle("dim", f !== "all" && p.dataset.cat !== f)
    );
  })
);

// ───────── camera flash + lightbox / albums ─────────
const albums = {
  golden: [
    ["01", "Qutub Minar at night"],
    ["02", "sunset over the hills"],
    ["03", "moon behind the clouds"],
    ["04", "sunset through the leaves"],
    ["05", "Red Fort after dark"],
    ["06", "a lot goes wrong before everything goes right"],
    ["07", "above the clouds ✈️"],
    ["08", "Dilli through my eyes 🤍"],
    ["09", "a plane in a golden sky"],
    ["10", "golden full moon 🌕"],
    ["11", "dusk over the rooftops"],
    ["12", "monsoon skies"],
    ["13", "evening blues"],
    ["14", "golden clouds over the street"],
    ["15", "purple dusk"],
    ["16", "birds & clouds"],
    ["17", "clouds & greens"],
    ["18", "sunset through the trees"],
    ["19", "red blossoms, blue sky"],
    ["20", "city lights after sunset"],
    ["21", "crescent moon & a star ✨"],
  ].map(([n, cap]) => ({ src: `images/golden/${n}.jpg`, cap })),
  lifestyle: [
    ["01", "on top of the world ⛰️"],
    ["02", "my purple room vibes 💜"],
    ["03", "late-night desk setup 🌙"],
    ["04", "this corner of my room 🧿"],
    ["05", "capturing the capturer 📱"],
    ["06", "evening aarti 🪔"],
    ["07", "street art & good dogs 🐶"],
    ["08", "rider's POV 🏍️"],
    ["09", "adventure mode on 🌊"],
    ["10", "ye waadiyan 🏔️"],
    ["11", "always capturing 📸"],
    ["12", "wildflowers from the trail 🌼"],
    ["13", "lost in the green 🌿"],
    ["14", "angry eyes on the road 👀"],
    ["15", "me & the red Enfield ❤️"],
    ["16", "Thar & me 🖤"],
    ["17", "a quiet prayer 🙏"],
    ["18", "pit stop under the tree 🌳"],
    ["19", "cold coffee at Dora Pancakes ☕"],
  ].map(([n, cap]) => ({ src: `images/lifestyle/${n}.jpg`, cap })),
  bts: [
    { src: "images/bts.mp4", cap: "event stage BTS 🎤", video: true },
    { src: "images/bts-2.mp4", cap: "life after no contact 🏔️", video: true },
  ],
};
const flash = document.getElementById("flash");
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbVid = document.getElementById("lbVid");
const lbCap = document.getElementById("lbCap");
const lbCount = document.getElementById("lbCount");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");
let slides = [];
let at = 0;
const show = (i) => {
  at = (i + slides.length) % slides.length;
  const isVid = !!slides[at].video;
  lbImg.hidden = isVid;
  lbVid.hidden = !isVid;
  if (isVid) {
    lbVid.src = slides[at].src;
    lbVid.play().catch(() => {});
  } else {
    lbVid.pause();
    lbImg.src = slides[at].src;
  }
  lbImg.alt = slides[at].cap;
  lbCap.textContent = slides[at].cap;
  lbCount.textContent = slides.length > 1 ? `${at + 1} / ${slides.length}` : "";
  const nextSlide = slides[(at + 1) % slides.length];
  if (slides.length > 1 && !nextSlide.video) new Image().src = nextSlide.src;
};
const openLb = (list) => {
  slides = list;
  lbPrev.hidden = lbNext.hidden = list.length < 2;
  show(0);
  setTimeout(() => (lightbox.hidden = false), 180);
};
document.querySelectorAll("[data-flash]").forEach((pol) =>
  pol.addEventListener("click", () => {
    flash.classList.remove("go");
    void flash.offsetWidth;
    flash.classList.add("go");
    if (pol.dataset.album) return openLb(albums[pol.dataset.album]);
    const img = pol.querySelector("img");
    if (img) openLb([{ src: img.src, cap: pol.querySelector("figcaption").textContent }]);
  })
);
const closeLb = () => {
  lightbox.hidden = true;
  lbVid.pause();
};
document.getElementById("lbClose").addEventListener("click", closeLb);
lbPrev.addEventListener("click", () => show(at - 1));
lbNext.addEventListener("click", () => show(at + 1));
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLb(); });
addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeLb();
  if (e.key === "ArrowRight" && slides.length > 1) show(at + 1);
  if (e.key === "ArrowLeft" && slides.length > 1) show(at - 1);
});
let touchX = null;
lightbox.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
lightbox.addEventListener("touchend", (e) => {
  if (touchX === null || slides.length < 2) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) show(at + (dx < 0 ? 1 : -1));
  touchX = null;
});

// ───────── bike rides across with scroll ─────────
const rider = document.getElementById("rider");
const ride = document.getElementById("ride");
const moveRider = () => {
  const r = ride.getBoundingClientRect();
  const p = Math.min(Math.max((innerHeight - r.top) / (innerHeight + r.height), 0), 1);
  const max = ride.clientWidth - rider.clientWidth;
  rider.style.transform = `translateX(${p * max}px) rotate(${Math.sin(p * 40) * 2}deg)`;
};
addEventListener("scroll", moveRider, { passive: true });
addEventListener("resize", moveRider);
moveRider();

// ───────── sparkle cursor trail ─────────
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
if (!reduce && matchMedia("(pointer: fine)").matches) {
  const colors = ["#ffd84d", "#ff9ec0", "#8fd0ff", "#93e3b8", "#cbb2ff"];
  let last = 0;
  addEventListener("pointermove", (e) => {
    const now = performance.now();
    if (now - last < 45) return;
    last = now;
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("class", "trail");
    s.style.left = e.clientX + "px";
    s.style.top = e.clientY + "px";
    s.style.color = colors[(Math.random() * colors.length) | 0];
    s.innerHTML = '<use href="#d-sparkle"/>';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 900);
  });
}

// ───────── contact form → email ─────────
document.getElementById("contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const d = new FormData(e.target);
  const subject = `${d.get("type")} enquiry from ${d.get("name")}`;
  const body = `Hi Riya!\n\n${d.get("msg") || ""}\n\n— ${d.get("name")}`;
  location.href = `mailto:riyajstar07@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.getElementById("year").textContent = new Date().getFullYear();
