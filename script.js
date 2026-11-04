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
    ["07", "above the clouds"],
    ["08", "Dilli through my eyes"],
    ["09", "a plane in a golden sky"],
    ["10", "golden full moon"],
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
    ["21", "crescent moon & a star"],
  ].map(([n, cap]) => ({ src: `images/golden/${n}.jpg`, cap })),
  lifestyle: [
    ["01", "on top of the world"],
    ["02", "my room in purple light"],
    ["05", "capturing the capturer"],
    ["09", "waterfall trail"],
    ["07", "street art"],
    ["08", "rider's point of view"],
    ["03", "late-night desk setup"],
    ["10", "ye waadiyan"],
    ["06", "evening aarti"],
    ["15", "me & the red Enfield"],
    ["04", "this corner of my room"],
    ["12", "wildflowers from the trail"],
    ["14", "night traffic"],
    ["11", "always capturing"],
    ["16", "Thar & me"],
    ["13", "lost in the green"],
    ["18", "His guidance above everything"],
    ["17", "pit stop under the tree"],
    ["19", "cold coffee at Dora Pancakes"],
  ].map(([n, cap]) => ({ src: `images/lifestyle/${n}.jpg`, cap })),
  events: [
    { src: "images/events/p6.jpg", cap: "Genero 2026 — Coordinator, Social Media & Photography" },
    { src: "images/events/p1.jpg", cap: "qawwali night" },
    { src: "images/events/v1.mp4", cap: "live on stage", video: true },
    { src: "images/events/p2.jpg", cap: "LED fashion walk" },
    { src: "images/events/p4.jpg", cap: "under the spotlight" },
    { src: "images/events/p3.jpg", cap: "theatre night" },
    { src: "images/events/p5.jpg", cap: "the full stage" },
    { src: "images/events/v2.mp4", cap: "fest nights", video: true },
  ],
  ride: [
    { src: "images/ride/p1.jpg", cap: "pit stop with a view" },
    { src: "images/ride/v4.mp4", cap: "off-road on the hilltop", video: true },
    { src: "images/ride/v6.mp4", cap: "mountain roads, rider's view", video: true },
    { src: "images/ride/p2.jpg", cap: "golden hour & my Enfield" },
    { src: "images/ride/v1.mp4", cap: "Sunday night drive", video: true },
    { src: "images/ride/v3.mp4", cap: "late-night drives", video: true },
    { src: "images/ride/v7.mp4", cap: "dirt trail, rider's view", video: true },
    { src: "images/ride/v2.mp4", cap: "city rides", video: true },
    { src: "images/ride/v5.mp4", cap: "sun over the hills", video: true },
  ],
  bts: [
    { src: "images/bts.mp4", cap: "behind the scenes at an event", video: true },
    { src: "images/bts-2.mp4", cap: "quiet hills", video: true },
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
const lbFig = lightbox.querySelector("figure");
const cache = new Map();
const preload = (s) => {
  if (!s || s.video || cache.has(s.src)) return;
  const im = new Image();
  im.decoding = "async";
  im.src = s.src;
  cache.set(s.src, im);
};
let showToken = 0;
const show = (i) => {
  at = (i + slides.length) % slides.length;
  const s = slides[at];
  const token = ++showToken;
  lbCount.textContent = slides.length > 1 ? `${at + 1} / ${slides.length}` : "";
  if (s.video) {
    lbFig.classList.remove("loading");
    lbImg.hidden = true;
    lbVid.hidden = false;
    lbVid.src = s.src;
    lbVid.play().catch(() => {});
    lbCap.textContent = s.cap;
  } else {
    lbVid.pause();
    lbVid.removeAttribute("src");
    lbVid.hidden = true;
    lbImg.hidden = false;
    preload(s);
    const im = cache.get(s.src);
    const reveal = () => {
      if (token !== showToken) return; // a newer slide was requested meanwhile
      lbImg.src = s.src;
      lbImg.alt = s.cap;
      lbCap.textContent = s.cap;
      lbFig.classList.remove("loading");
    };
    if (im.complete && im.naturalWidth) reveal();
    else {
      lbFig.classList.add("loading");
      im.decode ? im.decode().then(reveal, reveal) : (im.onload = reveal);
    }
  }
  if (slides.length > 1) {
    preload(slides[(at + 1) % slides.length]);
    preload(slides[(at - 1 + slides.length) % slides.length]);
  }
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
  showToken++;
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

// ───────── featured reels carousel ─────────
const track = document.getElementById("reelTrack");
if (track) {
  const cards = [...track.children];
  const dots = document.getElementById("reelDots");
  const prev = document.querySelector(".car-prev");
  const next = document.querySelector(".car-next");
  cards.forEach((_, i) => {
    const d = document.createElement("button");
    d.type = "button";
    d.setAttribute("aria-label", `Reel ${i + 1}`);
    d.addEventListener("click", () => goTo(i));
    dots.appendChild(d);
  });
  let current = 0;
  const goTo = (i) => {
    const c = cards[Math.max(0, Math.min(cards.length - 1, i))];
    track.scrollTo({ left: c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2 });
  };
  const update = () => {
    const mid = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    cards.forEach((c, i) => {
      if (Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid) < Math.abs(cards[best].offsetLeft + cards[best].offsetWidth / 2 - mid)) best = i;
    });
    current = best;
    cards.forEach((c, i) => c.classList.toggle("is-active", i === best));
    [...dots.children].forEach((d, i) => d.classList.toggle("on", i === best));
    prev.disabled = best === 0;
    next.disabled = best === cards.length - 1;
  };
  prev.addEventListener("click", () => goTo(current - 1));
  next.addEventListener("click", () => goTo(current + 1));
  cards.forEach((c, i) => c.addEventListener("click", () => i !== current && goTo(i), true));
  let raf;
  track.addEventListener("scroll", () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener("resize", update);
  update();
}

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
    if (!lightbox.hidden) return;
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

// ───────── contact form → straight to Riya's inbox (FormSubmit) ─────────
const form = document.getElementById("contactForm");
const formMsg = document.getElementById("formMsg");
const sendBtn = form.querySelector('button[type="submit"]');
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const d = new FormData(form);
  if (d.get("_honey")) return; // bots fill the hidden field
  const payload = {
    name: d.get("name"),
    contact: d.get("contact"),
    service: d.get("type"),
    message: d.get("msg") || "-",
    _subject: `New ${d.get("type")} enquiry from ${d.get("name")}`,
    _template: "table",
  };
  sendBtn.disabled = true;
  sendBtn.firstChild.textContent = "Sending… ";
  formMsg.className = "form-msg";
  formMsg.textContent = "";
  try {
    const res = await fetch("https://formsubmit.co/ajax/riyajstar07@gmail.com", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || String(out.success) === "false") throw new Error(out.message || "failed");
    form.reset();
    formMsg.classList.add("ok");
    formMsg.textContent = "Thank you! Your enquiry has been sent — I'll get back to you soon ✿";
  } catch (err) {
    const body = `Hi Riya,\n\n${payload.message}\n\nName: ${payload.name}\nContact: ${payload.contact}\nService: ${payload.service}`;
    formMsg.classList.add("err");
    formMsg.innerHTML = `Couldn't send right now. <a href="mailto:riyajstar07@gmail.com?subject=${encodeURIComponent(payload._subject)}&body=${encodeURIComponent(body)}">Email me directly instead →</a>`;
  } finally {
    sendBtn.disabled = false;
    sendBtn.firstChild.textContent = "Send enquiry ";
  }
});

// ───────── copy email, Delhi time, back to top ─────────
document.querySelectorAll("[data-copy]").forEach((btn) =>
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      btn.textContent = "copied ✓";
    } catch (e) {
      btn.textContent = "select & copy";
    }
    btn.classList.add("done");
    setTimeout(() => { btn.textContent = "copy"; btn.classList.remove("done"); }, 1800);
  })
);
const delhiTime = document.getElementById("delhiTime");
const tick = () => {
  delhiTime.textContent = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" });
};
tick();
setInterval(tick, 30000);
const toTop = document.getElementById("toTop");
addEventListener("scroll", () => toTop.classList.toggle("show", scrollY > 900), { passive: true });

// ───────── "Photograph" on the contact section (lyric video, 0:53 → 1:27) ─────────
const SONG = { videoId: "KKQl-pIRQMY", start: 53, end: 87 };
const np = document.getElementById("nowPlaying");
const npState = np.querySelector(".np-state");
let player = null;
let playerReady = false;
let musicOn = true; // visitor can switch it off; then it stays off
let inContact = false;
const showState = (playing) => {
  np.classList.toggle("on", playing);
  np.setAttribute("aria-pressed", playing);
  npState.textContent = playing ? "now playing" : musicOn ? "tap for music" : "music off";
};
const loadPlayer = () => {
  if (player) return;
  player = true;
  window.onYouTubeIframeAPIReady = () => {
    player = new YT.Player("ytSong", {
      width: 220,
      height: 220,
      videoId: SONG.videoId,
      playerVars: { start: SONG.start, end: SONG.end, playsinline: 1, rel: 0, controls: 0, disablekb: 1, modestbranding: 1 },
      events: {
        onReady: () => { playerReady = true; if (inContact || pendingPlay) startMusic(true); },
        onStateChange: (e) => {
          showState(e.data === YT.PlayerState.PLAYING);
          if (e.data === YT.PlayerState.ENDED) player.seekTo(SONG.start, true), player.pauseVideo();
        },
      },
    });
  };
  const s = document.createElement("script");
  s.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(s);
};
let pendingPlay = false;
const startMusic = (force = false) => {
  if (!musicOn || (!inContact && !force)) return;
  if (!playerReady) { pendingPlay = force || pendingPlay; return; }
  const st = player.getPlayerState();
  if (st === YT.PlayerState.PLAYING || st === YT.PlayerState.BUFFERING) return;
  const t = player.getCurrentTime();
  if (t < SONG.start || t >= SONG.end - 0.5) player.seekTo(SONG.start, true);
  player.playVideo();
};
const stopMusic = () => playerReady && player.pauseVideo();
np.addEventListener("click", () => {
  if (!playerReady) return;
  if (player.getPlayerState() === YT.PlayerState.PLAYING) {
    musicOn = false;
    stopMusic();
    showState(false);
  } else {
    musicOn = true;
    startMusic();
  }
});
// browsers only allow sound after the visitor has tapped/clicked once,
// so get the player ready on the first interaction anywhere on the page
["pointerdown", "keydown", "touchstart"].forEach((ev) =>
  addEventListener(ev, (e) => {
    loadPlayer();
    if (inContact && !np.contains(e.target)) startMusic();
  }, { passive: true })
);
// "Hire me" / "Book a shoot": start the song inside the click itself (needed by Brave/Safari)
document.querySelectorAll('a[href="#contact"]').forEach((a) =>
  a.addEventListener("click", () => {
    musicOn = true;
    loadPlayer();
    startMusic(true);
  })
);
const contactEl = document.getElementById("contact");
// warm the player up a few seconds after load so a "Hire me" click can start it instantly
addEventListener("load", () => setTimeout(() => ("requestIdleCallback" in window ? requestIdleCallback(loadPlayer) : loadPlayer()), 3000));
new IntersectionObserver(([e]) => e.isIntersecting && loadPlayer(), { rootMargin: "800px 0px" }).observe(contactEl);
new IntersectionObserver(
  ([entry]) => {
    inContact = entry.isIntersecting;
    inContact ? startMusic() : stopMusic();
  },
  { threshold: 0.3 }
).observe(contactEl);

document.getElementById("year").textContent = new Date().getFullYear();
