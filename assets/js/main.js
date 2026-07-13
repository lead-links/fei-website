/* ============================================================
   FEI, interactions: nav, mobile menu, program grid + filter,
   scroll reveals, marquee sync.
   ============================================================ */
(function () {
  "use strict";

  /* Depth-aware base prefix, so JS-driven redirects work under any relative
     hosting path (e.g. GitHub Pages project sites) regardless of page depth. */
  var BASE = /\/programs\//.test(window.location.pathname) ? "../" : "";

  /* ---- Program data ---- */
  const ICONS = {
    stethoscope: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v5a4 4 0 0 0 8 0V3"/><path d="M6 3H4M14 3h2M10 16v2a4 4 0 0 0 8 0v-2"/><circle cx="18" cy="14" r="2"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>',
    pill: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="8" rx="4"/><path d="M12 8v8"/></svg>',
    building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3"/></svg>',
    chef: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 14a4 4 0 0 1-1-7.9A4 4 0 0 1 12 4a4 4 0 0 1 7 2.1A4 4 0 0 1 18 14"/><path d="M7 14h10v4a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z"/></svg>',
    cake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16v-6a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3z"/><path d="M12 8V4M9 6l3-2 3 2M4 15c2 1 3 1 4 0s3-1 4 0 3 1 4 0"/></svg>',
    wrench: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.4-.4-2.4z"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/></svg>',
  };

  const CAT_LABELS = { health: "Healthcare", culinary: "Culinary Arts", trades: "Skilled Trades", business: "Business" };

  /* Kept in sync with docs/programas-dados.json (11 real FEI programs). */
  const PROGRAMS = [
    { slug: "medical-assistant",               cat: "health",   tag: "Diploma",    icon: "stethoscope", img: "health",          title: "Medical Assistant", desc: "Clinical and administrative skills for physician offices, clinics, and urgent care." },
    { slug: "medical-billing-coding",          cat: "health",   tag: "Diploma",    icon: "file",        img: "billing",         title: "Medical Billing & Coding", desc: "Manage claims, medical coding, and records that keep healthcare running." },
    { slug: "pharmacy-technician",              cat: "health",   tag: "Diploma",    icon: "pill",        img: "pharmacy",        title: "Pharmacy Technician", desc: "Support pharmacists in dispensing medication and caring for patients." },
    { slug: "medical-office-administrator",     cat: "health",   tag: "A.A.S.",     icon: "building",    img: "office-admin",    title: "Medical Office Administrator", desc: "An associate degree in the business and operations of modern healthcare." },
    { slug: "culinary-arts",                    cat: "culinary", tag: "Diploma",    icon: "chef",        img: "culinary",        title: "Culinary Arts", desc: "Professional cooking technique, kitchen leadership, and real-service experience." },
    { slug: "culinary-hospitality-management",  cat: "culinary", tag: "A.A.S.",     icon: "building",    img: "hospitality",     title: "Culinary & Hospitality Management", desc: "Professional cooking paired with restaurant and hospitality leadership." },
    { slug: "pastry-baking-arts",                cat: "culinary", tag: "Diploma",    icon: "cake",        img: "pastry",          title: "Pastry & Baking Arts", desc: "Artisan breads, desserts, and pastry craft, from fundamentals to finesse." },
    { slug: "pastry-baking-management",          cat: "culinary", tag: "A.A.S.",     icon: "cake",        img: "pastry-mgmt",     title: "Pastry & Baking Management", desc: "Pastry craft plus the business skills to run a bakery or pastry program." },
    { slug: "hvac",                              cat: "trades",   tag: "Diploma",    icon: "wrench",      img: "hvac",            title: "HVAC / R", desc: "Air conditioning, heating, and refrigeration systems South Florida depends on." },
    { slug: "business-management",               cat: "business", tag: "Diploma",    icon: "briefcase",   img: "business",        title: "Business Management", desc: "Foundations of management, operations, and leadership to run and grow a business." },
    { slug: "business-administration",           cat: "business", tag: "A.A.S.",     icon: "briefcase",   img: "business-admin",  title: "Business Administration", desc: "A deeper foundation in business leadership, management, and entrepreneurship." },
  ];

  /* ---- Render program cards ---- */
  const grid = document.getElementById("progGrid");
  if (grid) {
    grid.innerHTML = PROGRAMS.map(function (p) {
      return (
        '<article class="card reveal" data-cat="' + p.cat + '">' +
          '<a href="programs/' + p.slug + '.html" class="card__media" tabindex="-1" aria-hidden="true">' +
            '<span class="card__badge">' + p.tag + '</span>' +
            '<img src="assets/img/programs/' + p.slug + '.webp" alt="" loading="lazy" />' +
            '<span class="card__icon">' + ICONS[p.icon] + '</span>' +
          '</a>' +
          '<div class="card__body">' +
            '<span class="card__tag">' + CAT_LABELS[p.cat] + '</span>' +
            '<h3 class="card__title">' + p.title + '</h3>' +
            '<p class="card__desc">' + p.desc + '</p>' +
            '<a href="programs/' + p.slug + '.html" class="card__link">Program details' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>' +
            '</a>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  /* ---- Filter chips ---- */
  const filters = document.getElementById("filters");
  if (filters) {
    filters.addEventListener("click", function (e) {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      filters.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("is-active"); });
      btn.classList.add("is-active");
      const f = btn.dataset.filter;
      grid.querySelectorAll(".card").forEach(function (card) {
        const show = f === "all" || card.dataset.cat === f;
        card.classList.toggle("is-hidden", !show);
      });
    });
  }

  /* ---- Sticky nav state ---- */
  const nav = document.getElementById("nav");
  const onScroll = function () {
    nav.classList.toggle("is-stuck", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---- Language switcher (mockup only, no real i18n yet) ---- */
  document.querySelectorAll(".lang-switch").forEach(function (group) {
    group.addEventListener("click", function (e) {
      const btn = e.target.closest(".lang-switch__opt");
      if (!btn) return;
      group.querySelectorAll(".lang-switch__opt").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
    });
  });

  /* ---- Mobile menu ---- */
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");
  if (toggle && menu) {
    const setOpen = function (open) {
      toggle.classList.toggle("is-open", open);
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    toggle.addEventListener("click", function () {
      setOpen(!menu.classList.contains("is-open"));
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setOpen(false); });
    });
    var closeBtn = menu.querySelector(".mobile-menu__close");
    if (closeBtn) closeBtn.addEventListener("click", function () { setOpen(false); });
  }

  /* ---- FAQ accordion ---- */
  const accordion = document.getElementById("accordion");
  if (accordion) {
    accordion.addEventListener("click", function (e) {
      const trigger = e.target.closest(".acc-trigger");
      if (!trigger) return;
      const item = trigger.closest(".acc-item");
      const isOpen = item.classList.contains("is-open");
      item.classList.toggle("is-open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
    });
  }

  /* ---- Scroll reveal ---- */
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add("is-in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  /* Above-the-fold hero reveals fire immediately (home + inner-page heroes) */
  var fireHero = function () {
    document.querySelectorAll(".hero .reveal, .phero .reveal").forEach(function (el, i) {
      setTimeout(function () { el.classList.add("is-in"); }, 40 + i * 70);
    });
  };
  if (document.readyState === "complete") fireHero();
  else window.addEventListener("load", fireHero);

  /* ---- Apply modals ----
     Institutional pages: short modal (name + email + program) -> redirects
     to apply.html to finish. Program pages: full modal, already specific to
     that program (no dropdown), submits and confirms right in the modal, no
     scrolling or page navigation involved (a plain anchor-scroll CTA reads as
     a false-positive "conversion" in analytics, so every CTA opens a real,
     trackable modal interaction instead). */
  var isApplyPage = document.body.getAttribute("data-page") === "apply";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  function markInvalid(input, bad) { input.classList.toggle("is-invalid", bad); }

  var programMatch = window.location.pathname.match(/\/programs\/([a-z0-9-]+)\.html/);
  var currentProgram = null;
  if (programMatch) {
    for (var pi = 0; pi < PROGRAMS.length; pi++) {
      if (PROGRAMS[pi].slug === programMatch[1]) { currentProgram = PROGRAMS[pi]; break; }
    }
  }

  function wireModalChrome(modal, closeBtnId, focusId) {
    function open() {
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      var first = document.getElementById(focusId);
      if (first) setTimeout(function () { first.focus(); }, 60);
    }
    function close() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }
    document.getElementById(closeBtnId).addEventListener("click", close);
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) close();
    });
    return { open: open, close: close };
  }

  function wireApplyNowLinks(openFn) {
    document.querySelectorAll("a").forEach(function (a) {
      if (a.textContent.trim() === "Apply Now") {
        a.addEventListener("click", function (e) {
          e.preventDefault();
          if (menu && menu.classList.contains("is-open")) toggle.click();
          openFn();
        });
      }
    });
  }

  if (currentProgram) {
    /* ---- Full, program-specific modal: submits and confirms inline ---- */
    var el = document.createElement("div");
    el.className = "modal-overlay";
    el.id = "applyModal";
    el.setAttribute("aria-hidden", "true");
    el.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="applyModalTitle">' +
        '<button class="modal__close" id="applyModalClose" aria-label="Close">' +
          '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        "</button>" +
        '<div id="modalFormWrap">' +
          '<p class="modal__eyebrow">Apply to FEI</p>' +
          '<h2 class="modal__title" id="applyModalTitle">Apply to ' + currentProgram.title + "</h2>" +
          '<p class="modal__sub">Tell us how to reach you, an Admissions Advisor will follow up about the ' + currentProgram.title + " program.</p>" +
          '<form class="form" id="applyModalForm" novalidate>' +
            '<div class="field field--full"><label for="am-name">Full name</label><input type="text" id="am-name" autocomplete="name" required /></div>' +
            '<div class="field field--full"><label for="am-email">Email</label><input type="email" id="am-email" autocomplete="email" required /></div>' +
            '<div class="field field--full"><label for="am-phone">Phone <span class="field__opt">(optional)</span></label><input type="tel" id="am-phone" autocomplete="tel" inputmode="tel" /></div>' +
            '<div class="field field--full"><label for="am-msg">Anything you would like us to know? <span class="field__opt">(optional)</span></label><textarea id="am-msg" rows="3"></textarea></div>' +
            '<label class="consent"><input type="checkbox" id="am-consent" required /><span>I agree to be contacted by Florida Education Institute by phone, text, or email about its programs.</span></label>' +
            '<button type="submit" class="btn btn--solid btn--lg modal__submit">Submit application' +
              '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M5 12h12.2l-4.6-4.6L14 6l7 7-7 7-1.4-1.4 4.6-4.6H5z"/></svg>' +
            "</button>" +
          "</form>" +
          '<p class="modal__phone">Prefer to talk to a person?<br/><a href="tel:3054441515">305-444-1515</a></p>' +
        "</div>" +
        '<div id="modalSuccessWrap" hidden>' +
          '<div class="apply-success__mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></div>' +
          '<h2 class="modal__title">Thank you, <span id="modalSuccessName">there</span>.</h2>' +
          '<p class="modal__sub">Your information has been received. An FEI Admissions Advisor will reach out soon about the ' + currentProgram.title + " program.</p>" +
          '<p class="modal__sub">Want to talk sooner? Call <a href="tel:3054441515">305-444-1515</a>.</p>' +
        "</div>" +
      "</div>";
    document.body.appendChild(el);

    var chrome = wireModalChrome(el, "applyModalClose", "am-name");
    var formWrap = document.getElementById("modalFormWrap");
    var successWrap = document.getElementById("modalSuccessWrap");

    document.getElementById("applyModalForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("am-name");
      var email = document.getElementById("am-email");
      var consent = document.getElementById("am-consent");
      var bad = false;
      markInvalid(name, !name.value.trim()); bad = bad || !name.value.trim();
      var emailBad = !EMAIL_RE.test(email.value.trim()); markInvalid(email, emailBad); bad = bad || emailBad;
      if (bad || !consent.checked) {
        if (!consent.checked && !bad) consent.focus();
        return;
      }
      document.getElementById("modalSuccessName").textContent = name.value.trim().split(" ")[0] || "there";
      formWrap.hidden = true;
      successWrap.hidden = false;
    });

    wireApplyNowLinks(chrome.open);
  } else if (!isApplyPage) {
    /* ---- Short modal: name + email + program -> redirects to apply.html ---- */
    var opts = PROGRAMS.map(function (p) {
      return '<option value="' + p.slug + '">' + p.title + "</option>";
    }).join("");
    var el2 = document.createElement("div");
    el2.className = "modal-overlay";
    el2.id = "applyModal";
    el2.setAttribute("aria-hidden", "true");
    el2.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="applyModalTitle">' +
        '<button class="modal__close" id="applyModalClose" aria-label="Close">' +
          '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        "</button>" +
        '<p class="modal__eyebrow">Apply to FEI</p>' +
        '<h2 class="modal__title" id="applyModalTitle">Let us get you started.</h2>' +
        '<p class="modal__sub">Tell us who you are and what you want to study, we will take you to your application with these details filled in.</p>' +
        '<form class="form" id="applyModalForm" novalidate>' +
          '<div class="field"><label for="am-name">Full name</label><input type="text" id="am-name" name="name" autocomplete="name" required /></div>' +
          '<div class="field"><label for="am-email">Email</label><input type="email" id="am-email" name="email" autocomplete="email" required /></div>' +
          '<div class="field"><label for="am-program">Program of interest</label><select id="am-program" name="program" required>' +
            '<option value="" disabled selected>Select a program</option>' + opts +
          "</select></div>" +
          '<button type="submit" class="btn btn--solid btn--lg modal__submit">Continue to application' +
            '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M5 12h12.2l-4.6-4.6L14 6l7 7-7 7-1.4-1.4 4.6-4.6H5z"/></svg>' +
          "</button>" +
        "</form>" +
        '<p class="modal__phone">Prefer to talk to a person?<br/><a href="tel:3054441515">305-444-1515</a></p>' +
      "</div>";
    document.body.appendChild(el2);

    var chrome2 = wireModalChrome(el2, "applyModalClose", "am-name");

    document.getElementById("applyModalForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("am-name");
      var email = document.getElementById("am-email");
      var program = document.getElementById("am-program");
      var bad = false;
      markInvalid(name, !name.value.trim()); bad = bad || !name.value.trim();
      var emailBad = !EMAIL_RE.test(email.value.trim()); markInvalid(email, emailBad); bad = bad || emailBad;
      var progBad = !program.value; markInvalid(program, progBad); bad = bad || progBad;
      if (bad) { (name.value.trim() ? (emailBad ? email : program) : name).focus(); return; }
      var qs = "name=" + encodeURIComponent(name.value.trim()) +
               "&email=" + encodeURIComponent(email.value.trim()) +
               "&program=" + encodeURIComponent(program.value);
      window.location.href = BASE + "apply.html?" + qs;
    });

    wireApplyNowLinks(chrome2.open);
  }

  /* ---- Apply page: prefill from query + submit ---- */
  var applyForm = document.getElementById("applyForm");
  if (applyForm) {
    var params = new URLSearchParams(window.location.search);
    var setVal = function (id, key) {
      var v = params.get(key);
      var f = document.getElementById(id);
      if (v && f) f.value = v;
    };
    setVal("af-name", "name");
    setVal("af-email", "email");
    setVal("af-program", "program");

    applyForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = document.getElementById("af-name");
      var email = document.getElementById("af-email");
      var program = document.getElementById("af-program");
      var consent = document.getElementById("af-consent");
      var bad = false;
      markInvalid(name, !name.value.trim()); bad = bad || !name.value.trim();
      var emailBad = !EMAIL_RE.test(email.value.trim()); markInvalid(email, emailBad); bad = bad || emailBad;
      var progBad = !program.value; markInvalid(program, progBad); bad = bad || progBad;
      if (bad || !consent.checked) {
        if (!consent.checked && !bad) consent.focus();
        return;
      }
      var success = document.getElementById("applySuccess");
      var sName = document.getElementById("successName");
      if (sName) sName.textContent = name.value.trim().split(" ")[0] || "there";
      applyForm.hidden = true;
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  /* ---- Year ---- */
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
