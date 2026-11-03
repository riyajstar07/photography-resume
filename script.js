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

// ───────── camera flash + lightbox ─────────
const flash = document.getElementById("flash");
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCap = document.getElementById("lbCap");
document.querySelectorAll("[data-flash]").forEach((pol) =>
  pol.addEventListener("click", () => {
    flash.classList.remove("go");
    void flash.offsetWidth;
    flash.classList.add("go");
    const img = pol.querySelector("img");
    if (!img) return;
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = pol.querySelector("figcaption").textContent;
    setTimeout(() => (lightbox.hidden = false), 180);
  })
);
const closeLb = () => (lightbox.hidden = true);
document.getElementById("lbClose").addEventListener("click", closeLb);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLb(); });
addEventListener("keydown", (e) => { if (e.key === "Escape") closeLb(); });

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
