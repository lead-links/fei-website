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

  /* ---- UTM capture: persist first-touch UTMs across navigation ---- */
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id"];
  var feiUtms = {};
  try { feiUtms = JSON.parse(localStorage.getItem("fei_utms") || "{}") || {}; } catch (e) { feiUtms = {}; }
  try {
    var qp = new URLSearchParams(window.location.search);
    var utmChanged = false;
    UTM_KEYS.forEach(function (k) {
      var v = qp.get(k);
      if (v) { feiUtms[k] = v; utmChanged = true; }
    });
    if (utmChanged) localStorage.setItem("fei_utms", JSON.stringify(feiUtms));
  } catch (e) {}

  /* ---- Apply form (single source, shared by the modal overlay and the /apply page) ---- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Wire up one apply form instance. Fields are found by an id prefix ("am" for the
  // modal, "af" for the /apply page) so both can coexist on the same page.
  function initApplyForm(cfg) {
    var form = document.getElementById(cfg.formId);
    if (!form) return null;
    var byId = function (suffix) { return document.getElementById(cfg.prefix + "-" + suffix); };

    // Program context: dropdown visible by default (choose), hidden + pre-filled on program pages.
    var progSelect = byId("program");
    var progField = byId("program-field");
    var progTypeHidden = byId("program-type");
    var titleEl = cfg.titleId ? document.getElementById(cfg.titleId) : null;
    var progMeta = document.getElementById("feiProgramMeta");
    if (progMeta && progField && progSelect) {
      var pName = progMeta.getAttribute("data-program") || "";
      var pType = progMeta.getAttribute("data-program-type") || "";
      if (pName) {
        progSelect.value = pName;
        progField.hidden = true;
        if (titleEl) titleEl.textContent = "Apply to " + pName;
      }
      if (pType && progTypeHidden) progTypeHidden.value = pType;
    }

    // Hidden UTM fields <- persisted first-touch values.
    UTM_KEYS.forEach(function (k) {
      var input = byId(k.replace(/_/g, "-"));
      if (input && feiUtms[k]) input.value = feiUtms[k];
    });

    // International phone: flags + per-country formatting, US default with mask.
    var phoneInput = byId("phone");
    var iti = null;
    if (phoneInput && window.intlTelInput) {
      iti = window.intlTelInput(phoneInput, {
        initialCountry: "us",
        separateDialCode: true,
        strictMode: true,
        formatAsYouType: true,
        countryOrder: ["us", "ca", "mx"],
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var first = byId("first");
      var last = byId("last");
      var email = byId("email");
      var zip = byId("zip");
      var smsMarketing = byId("sms-marketing");
      var smsTransactional = byId("sms-transactional");
      var ok = true;
      var bad = function (f, isBad) { if (f) f.classList.toggle("is-invalid", isBad); if (isBad) ok = false; };
      bad(first, !first.value.trim());
      bad(last, !last.value.trim());
      bad(email, !EMAIL_RE.test(email.value.trim()));
      bad(zip, !zip.value.trim());
      var phoneOk = iti ? iti.isValidNumber() : !!phoneInput.value.trim();
      bad(phoneInput, !phoneOk);
      bad(progSelect, !progSelect.value);
      // SMS consent is optional (not a condition of enrollment), so it does not gate submission.
      if (!ok) return;

      // Lead payload — ready to POST to the n8n endpoint when wiring is enabled.
      var payload = {
        firstName: first.value.trim(),
        lastName: last.value.trim(),
        email: email.value.trim(),
        phone: iti ? iti.getNumber() : phoneInput.value.trim(),
        zip: zip.value.trim(),
        program: progSelect ? progSelect.value : "",
        programType: progTypeHidden ? progTypeHidden.value : "",
        smsMarketingConsent: smsMarketing ? smsMarketing.checked : false,
        smsTransactionalConsent: smsTransactional ? smsTransactional.checked : false
      };
      UTM_KEYS.forEach(function (k) { payload[k] = feiUtms[k] || ""; });
      // NOTE: not wired yet — when ready, POST `payload` to
      // https://flow.leadlinks.com.br/webhook/fei-lead (and enable the Power Automate node).

      var nameEl = cfg.successNameId ? document.getElementById(cfg.successNameId) : null;
      if (nameEl) nameEl.textContent = first.value.trim().split(" ")[0] || "there";
      if (typeof cfg.onSuccess === "function") cfg.onSuccess();
    });

    return { focusFirst: function () { var f = byId("first"); if (f) f.focus(); } };
  }

  /* ---- Apply modal overlay ---- */
  var overlay = document.getElementById("applyModal");
  if (overlay) {
    var formWrap = document.getElementById("modalFormWrap");
    var successWrap = document.getElementById("modalSuccessWrap");
    var modalForm = initApplyForm({
      prefix: "am",
      formId: "applyModalForm",
      titleId: "applyModalTitle",
      successNameId: "modalSuccessName",
      onSuccess: function () {
        if (formWrap) formWrap.hidden = true;
        if (successWrap) successWrap.hidden = false;
      }
    });

    var openModal = function () {
      var mm = document.getElementById("mobileMenu");
      if (mm) mm.classList.remove("is-open");
      var tg = document.getElementById("navToggle");
      if (tg) { tg.classList.remove("is-open"); tg.setAttribute("aria-expanded", "false"); }
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (modalForm) setTimeout(modalForm.focusFirst, 60);
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
  }

  /* ---- Apply page standalone form ---- */
  var applyPageForm = document.getElementById("applyForm");
  if (applyPageForm) {
    var applySuccess = document.getElementById("applySuccess");
    initApplyForm({
      prefix: "af",
      formId: "applyForm",
      successNameId: "successName",
      onSuccess: function () {
        applyPageForm.hidden = true;
        if (applySuccess) applySuccess.hidden = false;
      }
    });
  }
})();
