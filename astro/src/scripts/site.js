/* FEI — client behaviors: sticky nav, mobile menu, program filter, FAQ, reveals. */
(function () {
  "use strict";

  /* ---- Shared keyboard-focus helpers (mobile menu + apply modal) ---- */
  var FOCUSABLE_SEL = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var focusables = function (root) {
    return Array.prototype.slice.call(root.querySelectorAll(FOCUSABLE_SEL)).filter(function (el) {
      return el.offsetParent !== null || el === document.activeElement;
    });
  };
  var trapTab = function (container, e) {
    if (e.key !== "Tab" || !container) return;
    var items = focusables(container);
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  var setBackgroundInert = function (on, exceptEl) {
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el === exceptEl) return;
      if (on) el.setAttribute("inert", ""); else el.removeAttribute("inert");
    });
  };

  // Sticky nav (pages with data-force-stuck render the nav permanently solid,
  // e.g. full-bleed pages with no dark hero for it to sit transparently over)
  var nav = document.getElementById("nav");
  if (nav && !nav.hasAttribute("data-force-stuck")) {
    var onScroll = function () { nav.classList.toggle("is-stuck", window.scrollY > 24); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile menu open/close
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    menu.setAttribute("inert", ""); // starts closed
    var setOpen = function (open) {
      toggle.classList.toggle("is-open", open);
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      menu.toggleAttribute("inert", !open);
      document.body.style.overflow = open ? "hidden" : "";
      if (open) {
        var closeBtn = menu.querySelector(".mobile-menu__close");
        if (closeBtn) setTimeout(function () { closeBtn.focus(); }, 60);
      } else {
        toggle.focus();
      }
    };
    toggle.addEventListener("click", function () { setOpen(!menu.classList.contains("is-open")); });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
    var closeBtn = menu.querySelector(".mobile-menu__close");
    if (closeBtn) closeBtn.addEventListener("click", function () { setOpen(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) { setOpen(false); return; }
      if (menu.classList.contains("is-open")) trapTab(menu, e);
    });
  }

  // Program filter chips (cards are server-rendered by Astro)
  var filters = document.getElementById("filters");
  var grid = document.getElementById("progGrid");
  if (filters && grid) {
    filters.addEventListener("click", function (e) {
      var btn = e.target.closest(".chip");
      if (!btn) return;
      filters.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); c.setAttribute("aria-pressed", "false"); });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
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

  /* ---- Referrer capture: persist the FIRST-touch referrer across navigation.
     Unlike UTMs (only present in the URL on a tracked inbound link), document.referrer
     changes on every internal page-to-page navigation — so once a value is stored we
     never overwrite it, or we'd lose the original external referrer (e.g. Google) the
     moment the visitor clicks to a second page on the site. ---- */
  var feiReferrer = "";
  try { feiReferrer = localStorage.getItem("fei_referrer") || ""; } catch (e) { feiReferrer = ""; }
  try {
    if (!feiReferrer && document.referrer) {
      feiReferrer = document.referrer;
      localStorage.setItem("fei_referrer", feiReferrer);
    }
  } catch (e) {}

  /* ---- Client IP capture: the browser has no built-in way to know its own public
     IP, so this asks a third-party lookup on page load (fire-and-forget, well before
     the visitor finishes filling out the form) and uses whatever came back — or
     nothing — at submit time. Never blocks or delays submission if it fails/is slow. ---- */
  var feiClientIp = "";
  try {
    fetch("https://api.ipify.org?format=json").then(function (r) { return r.json(); }).then(function (d) {
      feiClientIp = (d && d.ip) || "";
    }).catch(function () {});
  } catch (e) {}

  /* ---- Apply form (single source, shared by the modal overlay and the /apply page) ---- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var LEAD_WEBHOOK_URL = "https://flow.leadlinks.app/webhook/fei-lead";

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
        if (titleEl) {
          var applyTo = titleEl.getAttribute("data-apply-to") || "Apply to";
          var label = progMeta.getAttribute("data-program-label") || pName;
          titleEl.textContent = applyTo + " " + label;
        }
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

    var summaryEl = byId("summary");
    var msgFor = function (key) { return form.getAttribute("data-msg-" + key) || ""; };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var first = byId("first");
      var last = byId("last");
      var email = byId("email");
      var zip = byId("zip");
      var smsMarketing = byId("sms-marketing");
      var smsTransactional = byId("sms-transactional");
      var invalids = [];
      var mark = function (field, isBad, msgKey) {
        if (!field) return;
        field.classList.toggle("is-invalid", isBad);
        field.setAttribute("aria-invalid", String(isBad));
        var errEl = document.getElementById(field.id + "-error");
        if (errEl) { errEl.textContent = isBad ? msgFor(msgKey) : ""; errEl.hidden = !isBad; }
        if (isBad) invalids.push(field);
      };
      mark(first, !first.value.trim(), "required");
      mark(last, !last.value.trim(), "required");
      mark(email, !EMAIL_RE.test(email.value.trim()), "invalid-email");
      mark(zip, !zip.value.trim(), "invalid-zip");
      var phoneOk = iti ? iti.isValidNumber() : !!phoneInput.value.trim();
      mark(phoneInput, !phoneOk, "invalid-phone");
      mark(progSelect, !progSelect.value, "select-program");
      // SMS consent is optional (not a condition of enrollment), so it does not gate submission.

      if (invalids.length) {
        if (summaryEl) {
          summaryEl.textContent = msgFor("error-summary");
          summaryEl.hidden = false;
          summaryEl.focus();
        } else {
          invalids[0].focus();
        }
        return;
      }
      if (summaryEl) summaryEl.hidden = true;

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
        smsTransactionalConsent: smsTransactional ? smsTransactional.checked : false,
        referrer: feiReferrer,
        ip: feiClientIp
      };
      UTM_KEYS.forEach(function (k) { payload[k] = feiUtms[k] || ""; });

      // POST the lead to the n8n webhook; show success only after it is accepted.
      var submitBtn = form.querySelector('[type="submit"]');
      var errEl = byId("error");
      if (errEl) errEl.hidden = true;
      var btnHTML = submitBtn ? submitBtn.innerHTML : "";
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }

      fetch(LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        var nameEl = cfg.successNameId ? document.getElementById(cfg.successNameId) : null;
        if (nameEl) nameEl.textContent = first.value.trim().split(" ")[0] || "there";
        if (typeof cfg.onSuccess === "function") cfg.onSuccess();
      }).catch(function () {
        if (errEl) errEl.hidden = false;
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = btnHTML; }
      });
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
        if (successWrap) { successWrap.hidden = false; successWrap.focus(); }
      }
    });

    var openModal = function () {
      var mm = document.getElementById("mobileMenu");
      if (mm) { mm.classList.remove("is-open"); mm.setAttribute("inert", ""); mm.setAttribute("aria-hidden", "true"); }
      var tg = document.getElementById("navToggle");
      if (tg) { tg.classList.remove("is-open"); tg.setAttribute("aria-expanded", "false"); }
      overlay._lastFocused = document.activeElement;
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      setBackgroundInert(true, overlay);
      if (modalForm) setTimeout(modalForm.focusFirst, 60);
    };
    var closeModal = function () {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      setBackgroundInert(false);
      if (overlay._lastFocused && typeof overlay._lastFocused.focus === "function") overlay._lastFocused.focus();
    };

    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
    var mClose = document.getElementById("applyModalClose");
    if (mClose) mClose.addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (!overlay.classList.contains("is-open")) return;
      if (e.key === "Escape") { closeModal(); return; }
      trapTab(overlay.querySelector(".modal"), e);
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
        if (applySuccess) { applySuccess.hidden = false; applySuccess.focus(); }
      }
    });
  }

  /* ---- Full-bleed iframe pages (Net Price Calculator): size the wrapper to
     the exact viewport space left below the nav. The nav is fixed and its
     rendered height differs with/without the utility bar (desktop vs mobile),
     so this is measured live rather than hardcoded. The iframe itself scrolls
     internally (scrolling="yes"); this only sizes its container. */
  var npcFullbleed = document.querySelector(".npc-fullbleed");
  if (npcFullbleed) {
    var navEl = document.getElementById("nav");
    var setHeaderHeightVar = function () {
      var h = navEl ? navEl.getBoundingClientRect().bottom : 0;
      document.documentElement.style.setProperty("--header-h", Math.max(h, 0) + "px");
    };
    setHeaderHeightVar();
    // Re-measure once webfonts finish loading — Montserrat can arrive after
    // the first paint and shift the nav's real pixel height by a couple px.
    window.addEventListener("load", setHeaderHeightVar);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(setHeaderHeightVar);
    window.addEventListener("resize", setHeaderHeightVar, { passive: true });
    window.addEventListener("orientationchange", setHeaderHeightVar);
  }
})();
