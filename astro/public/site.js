/* FEI — client behaviors: sticky nav, mobile menu, program filter, FAQ, reveals. */
(function () {
  "use strict";

  // Sticky nav
  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("is-stuck", window.scrollY > 24); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile menu open/close
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    var setOpen = function (open) {
      toggle.classList.toggle("is-open", open);
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", function () { setOpen(!menu.classList.contains("is-open")); });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    var closeBtn = menu.querySelector(".mobile-menu__close");
    if (closeBtn) closeBtn.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });
  }

  // Program filter chips (cards are server-rendered by Astro)
  var filters = document.getElementById("filters");
  var grid = document.getElementById("progGrid");
  if (filters && grid) {
    filters.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      filters.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var f = btn.dataset.filter;
      grid.querySelectorAll(".card").forEach(function (card) {
        card.classList.toggle("is-hidden", !(f === "all" || card.dataset.cat === f));
      });
    });
  }

  // FAQ accordion
  document.querySelectorAll(".acc-item").forEach(function (item) {
    var trig = item.querySelector(".acc-trigger");
    if (!trig) return;
    trig.addEventListener("click", function () {
      var open = item.classList.toggle("is-open");
      trig.setAttribute("aria-expanded", String(open));
    });
  });

  // Scroll reveal
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  // Above-the-fold hero reveals fire immediately
  requestAnimationFrame(function () {
    document.querySelectorAll(".hero .reveal, .phero .reveal").forEach(function (el, i) {
      setTimeout(function () { el.classList.add("is-in"); }, 40 + i * 70);
    });
  });

  /* ---- Apply modal ---- */
  var overlay = document.getElementById("applyModal");
  if (overlay) {
    var formWrap = document.getElementById("modalFormWrap");
    var successWrap = document.getElementById("modalSuccessWrap");
    var titleEl = document.getElementById("applyModalTitle");
    var progField = document.getElementById("am-program-field");
    var progSelect = document.getElementById("am-program");
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Pre-fill program context on program detail pages, and hide the dropdown.
    var pm = window.location.pathname.match(/\/programs\/([a-z0-9-]+)/);
    if (pm && progSelect) {
      var opt = progSelect.querySelector('option[value="' + pm[1] + '"]');
      if (opt) {
        progSelect.value = pm[1];
        if (titleEl) titleEl.textContent = "Apply to " + opt.textContent;
        if (progField) progField.hidden = true;
      }
    }

    var openModal = function () {
      var mm = document.getElementById("mobileMenu");
      if (mm) mm.classList.remove("is-open");
      var tg = document.getElementById("navToggle");
      if (tg) { tg.classList.remove("is-open"); tg.setAttribute("aria-expanded", "false"); }
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      var nameF = document.getElementById("am-name");
      if (nameF) setTimeout(function () { nameF.focus(); }, 60);
    };
    var closeModal = function () {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
    var mClose = document.getElementById("applyModalClose");
    if (mClose) mClose.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) closeModal();
    });

    // Any "Apply Now" link/button (or [data-apply]) opens the modal.
    document.querySelectorAll("a, button").forEach(function (el) {
      if (el.closest("#applyModal")) return;
      var txt = (el.textContent || "").trim();
      if (txt === "Apply Now" || el.hasAttribute("data-apply")) {
        el.addEventListener("click", function (e) { e.preventDefault(); openModal(); });
      }
    });

    var mForm = document.getElementById("applyModalForm");
    if (mForm) {
      mForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = document.getElementById("am-name");
        var email = document.getElementById("am-email");
        var consent = document.getElementById("am-consent");
        var program = document.getElementById("am-program");
        var ok = true;
        var bad = function (f, isBad) { if (f) f.classList.toggle("is-invalid", isBad); };
        bad(name, !name.value.trim()); if (!name.value.trim()) ok = false;
        bad(email, !EMAIL_RE.test(email.value.trim())); if (!EMAIL_RE.test(email.value.trim())) ok = false;
        if (progField && !progField.hidden) { bad(program, !program.value); if (!program.value) ok = false; }
        if (!consent.checked) ok = false;
        if (!ok) return;
        // NOTE: client-side only for now — wire to the n8n lead webhook in the forms step.
        document.getElementById("modalSuccessName").textContent = name.value.trim().split(" ")[0] || "there";
        if (formWrap) formWrap.hidden = true;
        if (successWrap) successWrap.hidden = false;
      });
    }
  }
})();
