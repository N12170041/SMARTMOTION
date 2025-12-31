(() => {
  "use strict";
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  // Mobile nav

  // Keep CSS var in sync with sticky topbar height (for fixed mobile menu positioning)
  const topbar = $(".topbar");
  const setTopbarHeight = () => {
    if (!topbar) return;
    const h = Math.round(topbar.getBoundingClientRect().height);
    document.documentElement.style.setProperty("--topbarH", h + "px");
  };
  setTopbarHeight();
  window.addEventListener("resize", setTopbarHeight);

  const burger = $(".hamburger");
  const mobileNav = $(".mobileNav");
  // Backdrop for mobile menu (improves tap-to-close + prevents "stuck" feeling)
  let navBackdrop = $(".navBackdrop");
  if (!navBackdrop) {
    navBackdrop = document.createElement("div");
    navBackdrop.className = "navBackdrop";
    navBackdrop.setAttribute("aria-hidden", "true");
    document.body.appendChild(navBackdrop);
  }

  if (burger && mobileNav) {
    burger.addEventListener("click", () => {
      const expanded = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!expanded));
      mobileNav.classList.toggle("show");
      mobileNav.setAttribute("aria-hidden", expanded ? "true" : "false");

      // lock/unlock background scroll
      document.body.classList.toggle("menuOpen", !expanded);

      // keep submenu collapsed when closing
      const g = $(".mobileNav__group");
      const sub = $(".mobileNav__submenu");
      if (expanded && g && sub) {
        g.setAttribute("aria-expanded", "false");
        sub.hidden = true;
      }
    });
    
    // Close on backdrop tap
    if (navBackdrop) {
      navBackdrop.addEventListener("click", () => {
        burger.setAttribute("aria-expanded", "false");
        mobileNav.classList.remove("show");
        mobileNav.setAttribute("aria-hidden", "true");
        document.body.classList.remove("menuOpen");
      });
    }

    // Close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        burger.setAttribute("aria-expanded", "false");
        mobileNav.classList.remove("show");
        mobileNav.setAttribute("aria-hidden", "true");
        document.body.classList.remove("menuOpen");
      }
    });

    $$(".mobileNav a").forEach(a => a.addEventListener("click", () => {
      burger.setAttribute("aria-expanded", "false");
      mobileNav.classList.remove("show");
      mobileNav.setAttribute("aria-hidden", "true");
    }));

  }

  // Mobile submenu toggle (探索智動)
  const mobileGroup = $(".mobileNav__group");
  const mobileSub = $(".mobileNav__submenu");
  if (mobileGroup && mobileSub) {
    mobileGroup.addEventListener("click", () => {
      const expanded = mobileGroup.getAttribute("aria-expanded") === "true";
      mobileGroup.setAttribute("aria-expanded", String(!expanded));
      mobileSub.hidden = expanded;
    });
  }

  // Dropdown (desktop/tablet): click to open/close (better for touch devices)
  const dropdown = $(".dropdown");
  const dropBtn = $(".dropdown__toggle");
  const dropMenu = $(".dropdown__menu");
  if (dropdown && dropBtn && dropMenu) {
    const closeDrop = () => {
      dropdown.classList.remove("open");
      dropBtn.setAttribute("aria-expanded", "false");
    };
    dropBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const isOpen = dropdown.classList.toggle("open");
      dropBtn.setAttribute("aria-expanded", String(isOpen));
    });
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) closeDrop();
    }, { capture: true });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrop();
    });
  }

  // Scroll reveal
  const revealEls = $$(".reveal");
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // Soft hint
  const hints = ["你可以慢慢來。","不用表現什麼。","今天只要有人在就好。","不用回應，也沒關係。","陪伴不需要理由。"];
  const hintEl = document.createElement("div");
  hintEl.className = "softHint";
  document.body.appendChild(hintEl);
  let hi = 0;
  const showHint = () => {
    hintEl.textContent = hints[hi % hints.length];
    hintEl.classList.add("show");
    setTimeout(() => hintEl.classList.remove("show"), 4200);
    hi++;
  };
  setTimeout(showHint, 2200);
  setInterval(showHint, 9800);

  // Form micro-conversion (demo)
  const form = $("#leadForm");
  const msg = $("#formMsg");
  if (form && msg) {
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();
      const email = ($("#email")?.value || "").trim();
      if (!email) return;
      try {
        const leads = JSON.parse(localStorage.getItem("zhimotion_leads") || "[]");
        leads.push({ email, ts: Date.now() });
        localStorage.setItem("zhimotion_leads", JSON.stringify(leads));
      } catch (_) {}
      msg.textContent = "已收到！我們會用 Email 通知你開通試用（可隨時取消）。";
      form.reset();
      msg.animate([{ transform: "translateY(6px)", opacity: 0.2 }, { transform: "translateY(0)", opacity: 1 }],
        { duration: 420, easing: "cubic-bezier(.2,.9,.2,1)" });
    });
  }

  // Magnet buttons (subtle)
  const magnets = $$(".magnet");
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  magnets.forEach(btn => {
    let raf = 0;
    const onMove = (ev) => {
      const r = btn.getBoundingClientRect();
      const x = (ev.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const y = (ev.clientY - (r.top + r.height / 2)) / (r.height / 2);
      const tx = clamp(x, -1, 1) * 3;
      const ty = clamp(y, -1, 1) * 3;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => btn.style.transform = `translate(${tx}px, ${ty}px)`);
    };
    const onLeave = () => { if (raf) cancelAnimationFrame(raf); btn.style.transform = "translate(0,0)"; };
    btn.addEventListener("mousemove", onMove);
    btn.addEventListener("mouseleave", onLeave);
    btn.addEventListener("touchstart", onLeave, { passive: true });
  });

  // Particles (calm)
  const canvas = $("#bgParticles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  const DPR = Math.min(2, window.devicePixelRatio || 1);
  const state = { w: 0, h: 0, particles: [], mouse: { x: -9999, y: -9999 }, last: performance.now() };

  function resize() {
    state.w = Math.floor(window.innerWidth);
    state.h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(state.w * DPR);
    canvas.height = Math.floor(state.h * DPR);
    canvas.style.width = `${state.w}px`;
    canvas.style.height = `${state.h}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const count = Math.floor(Math.max(40, Math.min(90, (state.w * state.h) / 26000)));
    state.particles = new Array(count).fill(0).map(spawn);
  }
  function spawn() {
    return { x: Math.random() * state.w, y: Math.random() * state.h, vx: (Math.random() - 0.5) * 0.30, vy: (Math.random() - 0.5) * 0.30, r: 1 + Math.random() * 2.0, a: 0.16 + Math.random() * 0.26 };
  }
  function draw(now) {
    const dt = Math.min(32, now - state.last);
    state.last = now;
    ctx.clearRect(0, 0, state.w, state.h);

    for (const p of state.particles) {
      const dx = p.x - state.mouse.x, dy = p.y - state.mouse.y;
      const d2 = dx*dx + dy*dy;
      if (d2 < 130*130) {
        const inv = 1 / Math.max(90, Math.sqrt(d2));
        p.vx += dx * inv * 0.012;
        p.vy += dy * inv * 0.012;
      }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.x < -20) p.x = state.w + 20;
      if (p.x > state.w + 20) p.x = -20;
      if (p.y < -20) p.y = state.h + 20;
      if (p.y > state.h + 20) p.y = -20;
      p.vx *= 0.996; p.vy *= 0.996;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${p.a})`;
      ctx.fill();
    }

    const pts = state.particles;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      for (let j = i + 1; j < i + 8 && j < pts.length; j++) {
        const b = pts[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 105) {
          const alpha = (1 - d / 105) * 0.14;
          ctx.strokeStyle = `rgba(122,162,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener("mousemove", (e) => { state.mouse.x = e.clientX; state.mouse.y = e.clientY; }, { passive: true });
  window.addEventListener("mouseleave", () => { state.mouse.x = -9999; state.mouse.y = -9999; });
  window.addEventListener("resize", resize);

  resize();
  requestAnimationFrame(draw);
})();