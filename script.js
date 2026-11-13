// SyncHigh Media — interactions
(function () {
  "use strict";

  // Preloader intro
  var pre = document.getElementById("preloader");
  function hidePre() { if (pre) pre.classList.add("done"); }
  window.addEventListener("load", function () { setTimeout(hidePre, 500); });
  setTimeout(hidePre, 2600); // safety

  // Header on scroll
  var header = document.querySelector("header");
  function onScroll() { header.classList.toggle("scrolled", window.scrollY > 24); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var menuBtn = document.getElementById("menuBtn");
  var navLinks = document.querySelector(".nav-links");
  if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", function () { navLinks.classList.toggle("open"); });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") navLinks.classList.remove("open");
    });
  }

  // Reveal on scroll
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  // Count-up stats
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = parseFloat(el.getAttribute("data-count"));
        var suffix = el.getAttribute("data-suffix") || "";
        var start = null;
        function tick(ts) {
          if (!start) start = ts;
          var p = Math.min((ts - start) / 1300, 1);
          el.textContent = Math.round(target * (0.2 + 0.8 * p)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  // Reviews slideshow
  var track = document.getElementById("reviewTrack");
  if (track) {
    var slides = track.children.length;
    var idx = 0, timer = null;
    var dotsWrap = document.getElementById("rvDots");
    var dots = [];
    for (var i = 0; i < slides; i++) {
      var d = document.createElement("button");
      d.setAttribute("aria-label", "Show review " + (i + 1));
      (function (n) { d.addEventListener("click", function () { go(n); restart(); }); })(i);
      dotsWrap.appendChild(d); dots.push(d);
    }
    function render() {
      track.style.transform = "translateX(-" + idx * 100 + "%)";
      dots.forEach(function (dt, n) { dt.classList.toggle("on", n === idx); });
    }
    function go(n) { idx = (n + slides) % slides; render(); }
    function restart() { clearInterval(timer); timer = setInterval(function () { go(idx + 1); }, 5200); }
    var prev = document.getElementById("rvPrev"), next = document.getElementById("rvNext");
    if (prev) prev.addEventListener("click", function () { go(idx - 1); restart(); });
    if (next) next.addEventListener("click", function () { go(idx + 1); restart(); });
    var shell = document.querySelector(".reviews-shell");
    if (shell) {
      shell.addEventListener("mouseenter", function () { clearInterval(timer); });
      shell.addEventListener("mouseleave", restart);
      var tx = null;
      shell.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
      shell.addEventListener("touchend", function (e) {
        if (tx === null) return;
        var dx = e.changedTouches[0].clientX - tx;
        if (Math.abs(dx) > 42) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
        tx = null;
      }, { passive: true });
    }
    render(); restart();
  }

  // Contact form -> WhatsApp (no backend needed)
  var form = document.getElementById("quoteForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.querySelector("#f-name").value.trim();
      var biz = form.querySelector("#f-biz").value.trim();
      var type = form.querySelector("#f-type").value;
      var msg = form.querySelector("#f-msg").value.trim();
      var lines = ["Hi SyncHigh Media! I would like a quote for a website."];
      if (name) lines.push("Name: " + name);
      if (biz) lines.push("Business: " + biz);
      if (type) lines.push("I need: " + type);
      if (msg) lines.push("Details: " + msg);
      var url = "https://wa.me/9779811499170?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank");
    });
  }

  // Footer year
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  // ---- v2: scroll progress line (draws as you scroll) ----
  var prog = document.createElement("div");
  prog.id = "scrollProgress";
  document.body.appendChild(prog);
  var pTick = false;
  function updProgress() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    prog.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
    pTick = false;
  }
  window.addEventListener("scroll", function () {
    if (!pTick) { pTick = true; requestAnimationFrame(updProgress); }
  }, { passive: true });
  updProgress();

  // ---- v2 (restored): buttery smooth scrolling (Lenis, glide tuned smoother) ----
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion) {
    var ls = document.createElement("script");
    ls.src = "https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js";
    ls.onload = function () {
      if (typeof Lenis === "undefined") return; // CDN failed -> native scroll, site still fine
      var lenis = new Lenis({ lerp: 0.085, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.15 });
      function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
      requestAnimationFrame(raf);
      // in-page anchor links glide to their target instead of jumping
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener("click", function (e) {
          var id = a.getAttribute("href");
          if (id && id.length > 1) {
            var t = document.querySelector(id);
            if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -100 }); }
          }
        });
      });
    };
    document.head.appendChild(ls);
  }

  // ---- v3: floating bottom CTA pill (homepage) — appears at the Why section, stays until the footer ----
  var pill = document.getElementById("ctaPill");
  var whySec = document.getElementById("whyUs");
  if (pill && whySec) {
    var footEl = document.querySelector("footer");
    var pillTick = false;
    var updPill = function () {
      pillTick = false;
      var vh = window.innerHeight;
      var wy = whySec.getBoundingClientRect();
      var ft = footEl ? footEl.getBoundingClientRect() : null;
      var show = wy.top < vh * 0.9 && (!ft || ft.top > vh * 0.94);
      pill.classList.toggle("show", show);
      document.body.classList.toggle("cta-on", show);
    };
    var onScrollPill = function () {
      if (!pillTick) { pillTick = true; requestAnimationFrame(updPill); }
    };
    window.addEventListener("scroll", onScrollPill, { passive: true });
    window.addEventListener("resize", onScrollPill);
    updPill();
  }

  // ---- v2: hero browser-card tilt (fine pointers / desktop only) ----
  var hv = document.querySelector(".hero-visual");
  if (hv && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    var card = hv.querySelector(".browser-card");
    if (card) {
      var tRaf = null;
      hv.addEventListener("pointermove", function (e) {
        if (tRaf) return;
        tRaf = requestAnimationFrame(function () {
          var r = hv.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - 0.5;
          var y = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform = "rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" + (-y * 7).toFixed(2) + "deg)";
          tRaf = null;
        });
      });
      hv.addEventListener("pointerleave", function () {
        card.style.transition = "transform .6s cubic-bezier(.2,.7,.3,1)";
        card.style.transform = "";
        setTimeout(function () { card.style.transition = ""; }, 650);
      });
    }
  }
})();
