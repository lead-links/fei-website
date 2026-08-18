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

  /* intl-tel-input (this vendored version) dropped the old `allowDropdown: false`
     option, so onlyCountries:["us"] alone still renders a clickable flag button
     that opens a (single-option) dialog. Disable that button directly so the
     country indicator is a fixed, non-interactive "US" — nothing else can be
     opened or selected, matching the other phone-locking option. */
  var lockPhoneCountrySelector = function (phoneInput) {
    var wrap = phoneInput && phoneInput.closest(".iti");
    var btn = wrap && wrap.querySelector(".iti__selected-country");
    if (btn) { btn.disabled = true; btn.tabIndex = -1; }
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
      grid.querySelectorAll("[data-cat]").forEach(function (item) {
        item.classList.toggle("is-hidden", !(f === "all" || item.dataset.cat === f));
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

  /* ---- Tracking capture: UTMs + ad click IDs + referrer, kept consistent per touch.
     A tagged inbound link is a fresh acquisition touch. When one arrives we REPLACE
     the whole set at once (params absent from the URL become blank) so values from
     two different campaigns never mix — e.g. a new Google touch must not keep a
     stale utm_source from an earlier ChatGPT touch. The referrer is refreshed
     alongside it so both describe the same touch. Between tracked touches (plain
     internal navigation, where document.referrer becomes the site itself and no
     tagged params are present) the stored values are left untouched.

     Click IDs (gclid/fbclid) are part of that same atomic set, deliberately:
       - They must TRIGGER a touch on their own. Google Ads auto-tagging appends
         only `gclid` with no utm_* at all; treating UTMs as the sole trigger meant
         those clicks were never captured.
       - They must be REBUILT with the rest. Pairing a gclid from one click with
         UTMs from a different campaign is the exact cross-contamination this block
         exists to prevent, and it would misattribute offline conversion imports.
     Note this means an fbclid-only visit (Facebook appends fbclid to organic shared
     links too, not just ads) counts as a new touch and clears earlier UTMs — correct
     under last-touch, but worth knowing when reading attribution. ---- */
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "utm_platform"];
  var CLICK_ID_KEYS = ["gclid", "fbclid"];
  var TOUCH_KEYS = UTM_KEYS.concat(CLICK_ID_KEYS);
  var feiUtms = {};
  try { feiUtms = JSON.parse(localStorage.getItem("fei_utms") || "{}") || {}; } catch (e) { feiUtms = {}; }

  /* The `referrer` sent with a lead is the LANDING PAGE the visitor arrived on
     (full fei.edu URL including its query string) — not document.referrer, which
     is the external site that linked here. It is stored exactly like the UTMs:
     captured with the touch, and NOT overwritten while the visitor browses the
     site, so a lead submitted five pages deep still reports the page that
     actually brought them in.
     New storage key on purpose: `fei_referrer` holds the OLD semantics (external
     referrer) for anyone who visited before this change, and reusing it would
     silently report facebook.com as a landing page. */
  var feiLanding = "";
  try { feiLanding = localStorage.getItem("fei_landing") || ""; } catch (e) { feiLanding = ""; }
  try {
    var qp = new URLSearchParams(window.location.search);
    var hasTouch = TOUCH_KEYS.some(function (k) { return qp.get(k); });
    if (hasTouch) {
      // New tracked touch: rebuild the ENTIRE set so no stale field survives.
      feiUtms = {};
      TOUCH_KEYS.forEach(function (k) { feiUtms[k] = qp.get(k) || ""; });
      localStorage.setItem("fei_utms", JSON.stringify(feiUtms));
      // The landing URL belongs to this touch — it carries this touch's own
      // params — so it is replaced alongside them, never mixed across campaigns.
      feiLanding = window.location.href;
      localStorage.setItem("fei_landing", feiLanding);
    } else if (!feiLanding) {
      // First visit with nothing tagged (organic/direct): still record the entry
      // page once. Later internal navigation must not overwrite it.
      feiLanding = window.location.href;
      localStorage.setItem("fei_landing", feiLanding);
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
  // ⚠️ TEST endpoint. n8n's /webhook-test/ path only responds while the workflow
  // editor is actively "listening for a test event", and only for a single
  // request — it 404s otherwise, which would drop leads silently in production.
  // Before going live, switch to the production path: /webhook/lead-conversion
  var LEAD_WEBHOOK_URL = "https://flow.fei.edu/webhook-test/lead-conversion";

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
        // If pName isn't one of the standard dropdown options (e.g. an in-approval
        // IT "Course Prep" course), inject it so the value sticks and the lead still
        // carries the program. The field is hidden here, so this never shows in the UI.
        if (progSelect.value !== pName) {
          var injOpt = document.createElement("option");
          injOpt.value = pName;
          injOpt.textContent = pName;
          progSelect.appendChild(injOpt);
          progSelect.value = pName;
        }
        progField.hidden = true;
        if (titleEl) {
          var applyTo = titleEl.getAttribute("data-apply-to") || "Apply to";
          var label = progMeta.getAttribute("data-program-label") || pName;
          titleEl.textContent = applyTo + " " + label;
        }
      }
      if (pType && progTypeHidden) progTypeHidden.value = pType;
    }

    // Hidden attribution fields (utm_* + gclid/fbclid) <- persisted touch values.
    TOUCH_KEYS.forEach(function (k) {
      var input = byId(k.replace(/_/g, "-"));
      if (input && feiUtms[k]) input.value = feiUtms[k];
    });

    // Phone: US-only, fixed — no other country can be selected (no flag dropdown).
    var phoneInput = byId("phone");
    var iti = null;
    if (phoneInput && window.intlTelInput) {
      iti = window.intlTelInput(phoneInput, {
        initialCountry: "us",
        onlyCountries: ["us"],
        allowDropdown: false,
        separateDialCode: true,
        strictMode: true,
        formatAsYouType: true,
      });
      lockPhoneCountrySelector(phoneInput);
    }

    // 2-step "complete" flow (LP variant): prefill from the step-1 pre-registration
    // and carry its id so n8n updates the same record instead of creating a new one.
    var lpStage = form.getAttribute("data-stage");
    var preReg = null;
    if (lpStage) {
      try { preReg = JSON.parse(sessionStorage.getItem("fei_prereg") || "null"); } catch (e) { preReg = null; }
      if (preReg) {
        if (byId("first")) byId("first").value = preReg.firstName || "";
        if (byId("last")) byId("last").value = preReg.lastName || "";
        if (byId("email")) byId("email").value = preReg.email || "";
        if (preReg.phone && iti) { try { iti.setNumber(preReg.phone); } catch (e) {} }
        else if (preReg.phone && phoneInput) { phoneInput.value = preReg.phone; }
      }
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
        referrer: feiLanding,
        ip: feiClientIp
      };
      TOUCH_KEYS.forEach(function (k) { payload[k] = feiUtms[k] || ""; });
      // 2-step flow: tag the stage and the pre-registration id (see initPreRegForm).
      if (lpStage) { payload.stage = lpStage; if (preReg && preReg.id) payload.preRegId = preReg.id; }

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

  /* ---- LP 2-step: step-2 "complete" form (full ApplyForm, prefix "lp") ---- */
  var lpForm = document.getElementById("lpApplyForm");
  if (lpForm) {
    var lpFormWrap = document.getElementById("lpFormWrap");
    var lpSuccess = document.getElementById("lpSuccess");
    initApplyForm({
      prefix: "lp",
      formId: "lpApplyForm",
      successNameId: "lpSuccessName",
      onSuccess: function () {
        if (lpFormWrap) lpFormWrap.hidden = true;
        if (lpSuccess) { lpSuccess.hidden = false; lpSuccess.focus(); }
      }
    });
  }

  /* ---- LP 2-step: step-1 pre-registration (minimal hero form) ----
     Captures name/email/phone, generates a pre-registration id, fires a partial
     "pre" lead to the webhook, stashes {id, fields} in sessionStorage, then hands
     off to step 2 (data-next). Advances even if the POST fails — step 2 re-sends
     the same id, so the record still lands. */
  var preRegForm = document.getElementById("preRegForm");
  if (preRegForm) {
    var prBy = function (s) { return document.getElementById("pr-" + s); };
    var prFirst = prBy("first"), prLast = prBy("last"), prEmail = prBy("email"), prPhoneInput = prBy("phone");
    var prIti = null;
    if (prPhoneInput && window.intlTelInput) {
      // US-only, fixed — no other country can be selected (no flag dropdown).
      prIti = window.intlTelInput(prPhoneInput, {
        initialCountry: "us", onlyCountries: ["us"], allowDropdown: false,
        separateDialCode: true, strictMode: true, formatAsYouType: true,
      });
      lockPhoneCountrySelector(prPhoneInput);
    }
    var prSummary = prBy("summary");
    var prMsg = function (k) { return preRegForm.getAttribute("data-msg-" + k) || ""; };

    preRegForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var invalids = [];
      var mark = function (fld, bad, key) {
        if (!fld) return;
        fld.classList.toggle("is-invalid", bad);
        fld.setAttribute("aria-invalid", String(bad));
        var er = document.getElementById(fld.id + "-error");
        if (er) { er.textContent = bad ? prMsg(key) : ""; er.hidden = !bad; }
        if (bad) invalids.push(fld);
      };
      mark(prFirst, !prFirst.value.trim(), "required");
      mark(prLast, !prLast.value.trim(), "required");
      mark(prEmail, !EMAIL_RE.test(prEmail.value.trim()), "invalid-email");
      var prPhoneOk = prIti ? prIti.isValidNumber() : !!prPhoneInput.value.trim();
      mark(prPhoneInput, !prPhoneOk, "invalid-phone");
      if (invalids.length) {
        if (prSummary) { prSummary.textContent = prMsg("error-summary"); prSummary.hidden = false; prSummary.focus(); }
        else invalids[0].focus();
        return;
      }
      if (prSummary) prSummary.hidden = true;

      var id = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : ("pre-" + Date.now() + "-" + Math.round(Math.random() * 1e9));
      var firstV = prFirst.value.trim(), lastV = prLast.value.trim(), emailV = prEmail.value.trim();
      var phoneV = prIti ? prIti.getNumber() : prPhoneInput.value.trim();

      try {
        sessionStorage.setItem("fei_prereg", JSON.stringify({ id: id, firstName: firstV, lastName: lastV, email: emailV, phone: phoneV }));
      } catch (e2) {}

      var payload = {
        stage: "pre",
        preRegId: id,
        firstName: firstV, lastName: lastV, email: emailV, phone: phoneV,
        program: preRegForm.getAttribute("data-program") || "",
        programType: preRegForm.getAttribute("data-program-type") || "",
        referrer: feiLanding,
        ip: feiClientIp
      };
      TOUCH_KEYS.forEach(function (k) { payload[k] = feiUtms[k] || ""; });

      var next = preRegForm.getAttribute("data-next") || "/apply";
      var submitBtn = preRegForm.querySelector('[type="submit"]');
      var prErr = prBy("error");
      if (prErr) prErr.hidden = true;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }

      var go = function () { window.location.href = next; };
      fetch(LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).then(go).catch(go);
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
