(function () {
  "use strict";

  /* ── LOCALE & REDIRECT SYNC ── */
  function syncLocaleParam() {
    var params = new URLSearchParams(window.location.search);
    var urlLocale = params.get("request_locale");

    function getStoredLocale() {
      try {
        var sessionLocale = sessionStorage.getItem("request_locale");
        if (sessionLocale) return sessionLocale.toLowerCase();
      } catch (e) {}
      try {
        var localLocale = localStorage.getItem("request_locale");
        if (localLocale) return localLocale.toLowerCase();
      } catch (e) {}
      try {
        var match = document.cookie.match(new RegExp('(^| )request_locale=([^;]+)'));
        if (match) return match[2].toLowerCase();
      } catch (e) {}
      return null;
    }

    function saveLocale(locale) {
      locale = locale.toLowerCase();
      try {
        sessionStorage.setItem("request_locale", locale);
      } catch (e) {}
      try {
        localStorage.setItem("request_locale", locale);
      } catch (e) {}
      try {
        document.cookie = "request_locale=" + locale + "; path=/; max-age=31536000";
      } catch (e) {}
    }

    if (urlLocale) {
      saveLocale(urlLocale);
    } else {
      var stored = getStoredLocale();
      if (stored) {
        params.set("request_locale", stored);
        var newSearch = params.toString();
        var newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?" + newSearch + window.location.hash;
        window.location.replace(newUrl);
      }
    }
  }

  // Sync redirect check runs immediately
  syncLocaleParam();

  /* ── PAGE DETECTION HELPERS ── */
  function checkIsLogin() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf("/moas/login") !== -1 || path.indexOf("/moas/idp/userlogin") !== -1) {
      return true;
    }
    return !!document.getElementById("enduserloginform") || !!document.getElementById("idploginform");
  }

  function checkIsForgot() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf("moas/idp/forgotpassword") !== -1 ||
      path.indexOf("moas/idp/resetpassword") !== -1 ||
      path.indexOf("moas/idp/resetuserpassword") !== -1) {
      return true;
    }
    var userform = document.getElementById("userform");
    if (userform) {
      var act = (userform.getAttribute("action") || "").toLowerCase();
      if (act.indexOf("resetuserpassword") !== -1 || act.indexOf("resetpassword") !== -1 || act.indexOf("forgotpassword") !== -1) {
        return true;
      }
    }
    return false;
  }

  function checkIsOtp() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf("/moas/idp/validatenextfactor") !== -1) {
      return true;
    }
    return !!document.getElementById("otpToken");
  }

  function checkIsChangePass() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf("moas/idp/changepassword") !== -1 ||
      path.indexOf("moas/idp/changeuserpassword") !== -1) {
      return true;
    }
    if (document.getElementById("passwordform")) {
      return true;
    }
    var lh = document.querySelector(".login-header");
    if (lh && lh.textContent.toLowerCase().indexOf("change") !== -1) {
      return true;
    }
    return false;
  }

  function getLocale() {
    var params = new URLSearchParams(window.location.search);
    var urlLocale = params.get("request_locale");
    if (urlLocale) {
      return urlLocale.toLowerCase();
    }
    try {
      var sessionLocale = sessionStorage.getItem("request_locale");
      if (sessionLocale) return sessionLocale.toLowerCase();
    } catch (e) {}
    try {
      var match = document.cookie.match(new RegExp('(^| )request_locale=([^;]+)'));
      if (match) return match[2].toLowerCase();
    } catch (e) {}
    try {
      var navLang = navigator.language || navigator.userLanguage || "en";
      return navLang.substring(0, 2).toLowerCase();
    } catch (e) {}
    return "en";
  }

  function isRtlLocale(locale) {
    var rtlLocales = ["ar", "he", "fa", "ur"];
    return rtlLocales.indexOf(locale) !== -1;
  }

  /* Translation dictionary only for 100% custom non-miniOrange elements */
  var translations = {
    en: {
      passwordStrength: "Password strength",
      strengthWeak: "Weak",
      strengthMedium: "Medium",
      strengthStrong: "Strong",
      strengthSufficient: "Sufficient",
      newPasswordRequired: "New password is required.",
      satisfyRequirements: "Please satisfy all password requirements.",
      passwordsMustMatch: "The two passwords must match."
    },
    ar: {
      passwordStrength: "قوة كلمة المرور",
      strengthWeak: "ضعيف",
      strengthMedium: "متوسط",
      strengthStrong: "قوي",
      strengthSufficient: "كافٍ",
      newPasswordRequired: "كلمة المرور الجديدة مطلوبة.",
      satisfyRequirements: "يرجى تلبية جميع متطلبات كلمة المرور.",
      passwordsMustMatch: "يجب أن تتطابق كلمتا المرور."
    }
  };

  function getTranslation(key) {
    var locale = getLocale();
    var dict = translations[locale] || translations["en"];
    return dict[key] || translations["en"][key] || "";
  }

  /* ── INJECT FONT AND CSS ── */
  function injectFontAndCss() {
    var locale = getLocale();
    if (isRtlLocale(locale)) {
      document.documentElement.setAttribute("dir", "rtl");
    } else {
      document.documentElement.removeAttribute("dir");
    }

    /* ── FONT ── */
    if (!document.getElementById("mo-font")) {
      var lk = document.createElement("link");
      lk.id = "mo-font"; lk.rel = "stylesheet";
      lk.href = "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap";
      document.head.appendChild(lk);
    }

    /* ── CSS ── */
    if (!document.getElementById("mo-css")) {
      var css =
        /* Page bg — keep full viewport height so flex centering works */
        "#login-main-body{" +
        "background:#eef1f7!important;" +
        "font-family:'Figtree',sans-serif!important;" +
        "min-height:100vh!important;" +
        "display:flex!important;" +
        "align-items:center!important;" +
        "justify-content:center!important;" +
        "flex-direction:column!important;" +
        "box-sizing:border-box!important;" +
        "padding:40px 16px!important;" +
        "}" +
        "#login-body > br,#login-main-body > br{display:none!important;}" +

        /* Logo — hidden */
        "#login-header{display:none!important;}" +

        /* Card */
        "#login-wrapper{" +
        "background:#fff!important;border:1px solid #e0e7ef!important;" +
        "border-radius:4px!important;box-shadow:0 2px 12px rgba(0,0,0,.08)!important;" +
        "padding:36px 40px 32px!important;max-width:560px!important;margin:0 auto!important;" +
        "}" +

        /* Form: stretch children to full width (removes Bootstrap center alignment) */
        "#enduserloginform,#idploginform{align-items:stretch!important;}" +

        /* Inner containers: full width, no extra padding */
        "#enduserloginform .w-75,#enduserloginform .px-4,#idploginform .w-75,#idploginform .px-4{width:100%!important;padding-left:0!important;padding-right:0!important;max-width:100%!important;}" +
        "#enduserloginform .row,#idploginform .row{margin:0!important;}" +

        /* Hide original page elements */
        ".login-header.custom-title,hr,#dynamicUserName,#feedback-msg,#username-error,br.my-2," +
        "#goBack," +
        "a[href*='businessfreetrial'],a[href*='forgotpassword']:not(#mo-forgot),a[href*='resetpassword']:not(#mo-forgot),.col-auto.form-group{display:none!important;}" +

        /* LOG IN heading — top LEFT */
        "#mo-title{display:block;font-family:'Figtree',sans-serif;font-size:26px;font-weight:800;" +
        "color:#0d1b2a;margin-bottom:22px;text-align:left;}" +

        /* Labels — left aligned */
        ".mo-lbl{display:block;color:#3c515d;font-size:14px;font-weight:700;padding:0 0 4px;" +
        "font-family:'Figtree',sans-serif;text-align:left;}" +
        ".mo-lbl .mo-req{color:#e02020;margin-left:2px;}" +

        /* Field group spacing */
        ".mo-fg{margin-bottom:14px;width:100%;}" +

        /* Shared input style */
        "#username,#plaintextPassword,.mo-styled-input{" +
        "height:40px!important;border:1px solid #C1CFD7!important;border-radius:4px!important;" +
        "padding:0 12px!important;font-size:14px!important;font-family:'Figtree',sans-serif!important;" +
        "color:#000933!important;background:#fff!important;width:100%!important;" +
        "box-shadow:none!important;outline:none!important;box-sizing:border-box!important;" +
        "margin-bottom:0!important;display:block!important;" +
        "}" +
        "#username::placeholder,#plaintextPassword::placeholder,.mo-styled-input::placeholder{color:#a0aab6!important;}" +
        "#username:focus,#plaintextPassword:focus,.mo-styled-input:focus{border-color:#0A55D7!important;box-shadow:0 0 0 3px rgba(10,85,215,.12)!important;}" +

        /* Password wrapper (eye toggle) */
        ".mo-pw-wrap{position:relative;display:flex;align-items:center;width:100%;}" +
        "#plaintextPassword,.mo-styled-input{padding-right:42px!important;}" +
        ".mo-eye{position:absolute;right:10px;background:none;border:none;cursor:pointer;" +
        "color:#6b7a8d;padding:4px;display:flex;align-items:center;}" +
        ".mo-eye:hover{color:#0A55D7;}" +
        ".mo-eye svg{width:18px;height:18px;pointer-events:none;}" +

        /* Forgot link row — right aligned */
        "#mo-bottom{display:flex;align-items:center;justify-content:flex-end;margin:16px 0 20px;width:100%;}" +
        "#mo-forgot{font-size:13px;font-weight:500;color:#0A55D7;text-decoration:none;font-family:'Figtree',sans-serif;}" +
        "#mo-forgot:hover{text-decoration:underline;}" +

        /* Read-only username display on password step */
        ".mo-user-display{height:40px;border:1px solid #C1CFD7;border-radius:4px;padding:0 12px;" +
        "font-size:14px;color:#6b7a8d;background:#f5f7fa;display:flex;align-items:center;" +
        "font-family:'Figtree',sans-serif;box-sizing:border-box;width:100%;cursor:default;}" +

        /* Login button — left-aligned */
        "#loginbutton{" +
        "display:inline-flex!important;align-items:center!important;justify-content:center!important;" +
        "gap:8px!important;min-height:40px!important;padding:8px 20px!important;" +
        "border-radius:0!important;background:#0A55D7!important;background-color:#0A55D7!important;" +
        "border:none!important;color:#fff!important;font-family:'Figtree',sans-serif!important;" +
        "font-size:14px!important;font-weight:700!important;letter-spacing:.6px!important;" +
        "text-transform:uppercase!important;cursor:pointer!important;box-shadow:none!important;width:auto!important;" +
        "}" +
        "#loginbutton:hover{background:#0844b0!important;background-color:#0844b0!important;}" +
        /* button row — left align the submit button */
        "#enduserloginform .row div:has(#loginbutton),#idploginform .row div:has(#loginbutton){text-align:left!important;display:block!important;}" +

        /* Mobile */
        "@media(max-width:576px){" +
        "#login-wrapper{padding:24px 18px 20px!important;}" +
        ".mo-lbl,#username,#plaintextPassword{font-size:16px!important;}" +
        "#loginbutton{font-size:12px!important;}" +
        "}" +

        /* RTL Overrides */
        "[dir='rtl'] #mo-title{text-align:right!important;}" +
        "[dir='rtl'] .mo-lbl{text-align:right!important;}" +
        "[dir='rtl'] #enduserloginform .row div:has(#loginbutton),[dir='rtl'] #idploginform .row div:has(#loginbutton){text-align:right!important;}" +
        "[dir='rtl'] .mo-eye{right:auto!important;left:10px!important;}" +
        "[dir='rtl'] #plaintextPassword,[dir='rtl'] .mo-styled-input{padding-right:12px!important;padding-left:42px!important;}" +
        "[dir='rtl'] #mo-bottom{justify-content:flex-start!important;}" +
        "[dir='rtl'] #loginbutton{flex-direction:row-reverse!important;}";

      var st = document.createElement("style");
      st.id = "mo-css"; st.textContent = css;
      document.head.appendChild(st);
    }
  }

  /* ── HELPERS ── */
  function getForgotHref() {
    var a = document.querySelector("a[href*='forgotpassword'], a[href*='resetpassword']");
    return a ? a.href : "#";
  }

  /* ── STEP 1: Email page UI ── */
  function applyEmailStep() {
    var wrapper = document.getElementById("login-wrapper");
    if (!wrapper) return;

    /* LOG IN title — insert once before any form child */
    var t = document.getElementById("mo-title");
    if (!t) {
      t = document.createElement("span");
      t.id = "mo-title";
      wrapper.insertBefore(t, wrapper.firstChild);
    }
    var origHeader = document.querySelector(".login-header");
    var titleText = origHeader ? origHeader.textContent.trim() : "LOG IN";
    t.textContent = titleText;

    /* Email label above the username input */
    var userDiv = document.getElementById("userName");
    var fg = document.getElementById("mo-email-fg");
    if (userDiv && !fg) {
      fg = document.createElement("div"); fg.className = "mo-fg"; fg.id = "mo-email-fg";
      var lbl = document.createElement("label");
      lbl.id = "mo-email-lbl"; lbl.className = "mo-lbl";
      lbl.setAttribute("for", "username");
      fg.appendChild(lbl);
      userDiv.parentNode.insertBefore(fg, userDiv);
      fg.appendChild(userDiv);
      var inp = document.getElementById("username");
      if (inp) inp.setAttribute("placeholder", "email");
    }
    var emailLbl = document.getElementById("mo-email-lbl");
    if (emailLbl) {
      var origEmailLbl = document.querySelector("label[for='username']");
      var emailLblText = origEmailLbl ? origEmailLbl.textContent.replace(/\*/g, "").trim() : "Email address";
      emailLbl.innerHTML = emailLblText + ' <span class="mo-req">*</span>';
    }

    /* Button label */
    var btn = document.getElementById("loginbutton");
    if (btn) {
      var isRtl = isRtlLocale(getLocale());
      var arrowStr = isRtl ? " \u2190" : " \u2192";
      var origBtnText = btn.value || btn.textContent || "LOG IN";
      origBtnText = origBtnText.replace(/[\u2190\u2192]/g, "").trim();
      btn.value = origBtnText + arrowStr;
      btn.dataset.mo = "1";
    }

    /* Hide hr and br */
    wrapper.querySelectorAll("hr,br").forEach(function (el) {
      el.style.display = "none";
    });
  }

  /* ── STEP 2: Password page UI ── */
  function applyPasswordStep() {
    var pwField = document.getElementById("plaintextPassword");
    if (!pwField) return;                          // not the password step yet
    if (pwField.style.display === "none" || pwField.classList.contains("d-none")) return;

    /* Force-hide elements that jQuery's showAdminPassword() re-shows */
    var dynUser = document.getElementById("dynamicUserName");
    if (dynUser) { dynUser.style.setProperty("display", "none", "important"); }
    var goBack = document.getElementById("goBack");
    if (goBack) { goBack.style.setProperty("display", "none", "important"); }

    /* Hide the step-1 email label+input wrapper (Xecurify only hides #userName, not our wrapper) */
    var emailFg = document.getElementById("mo-email-fg");
    if (emailFg) {
      emailFg.style.setProperty("display", "none", "important");
    }

    /* LOG IN title ── */
    var wrapper = document.getElementById("login-wrapper");
    var t = document.getElementById("mo-title");
    if (wrapper && !t) {
      t = document.createElement("span");
      t.id = "mo-title";
      wrapper.insertBefore(t, wrapper.firstChild);
    }
    if (t) {
      var origHeader = document.querySelector(".login-header");
      var titleText = origHeader ? origHeader.textContent.trim() : "LOG IN";
      t.textContent = titleText;
    }

    /* Button label */
    var btn = document.getElementById("loginbutton");
    if (btn) {
      var isRtl = isRtlLocale(getLocale());
      var arrowStr = isRtl ? " \u2190" : " \u2192";
      var origBtnText = btn.value || btn.textContent || "LOG IN";
      origBtnText = origBtnText.replace(/[\u2190\u2192]/g, "").trim();
      btn.value = origBtnText + arrowStr;
    }

    /* Password label above #plaintextPassword */
    var pwLbl = document.getElementById("mo-pw-lbl");
    if (!pwLbl) {
      pwLbl = document.createElement("label");
      pwLbl.id = "mo-pw-lbl"; pwLbl.className = "mo-lbl";
      pwLbl.setAttribute("for", "plaintextPassword");
      pwField.parentNode.insertBefore(pwLbl, pwField);
    }
    var origPwLbl = document.querySelector("label[for='plaintextPassword']");
    var pwLblText = origPwLbl ? origPwLbl.textContent.replace(/\*/g, "").trim() : "Password";
    pwLbl.innerHTML = pwLblText + ' <span class="mo-req">*</span>';

    /* Show read-only username above password field */
    if (!document.getElementById("mo-user-display")) {
      var usernameVal = "";
      var unInp = document.getElementById("username");
      if (unInp && unInp.value) usernameVal = unInp.value;
      if (!usernameVal && dynUser) usernameVal = dynUser.textContent.trim();
      if (usernameVal) {
        var userFg = document.createElement("div"); userFg.className = "mo-fg"; userFg.id = "mo-user-fg";
        var userLbl = document.createElement("label"); userLbl.className = "mo-lbl"; userLbl.id = "mo-user-lbl";
        var userBox = document.createElement("div"); userBox.id = "mo-user-display";
        userBox.className = "mo-user-display";
        userBox.textContent = usernameVal;
        userFg.appendChild(userLbl); userFg.appendChild(userBox);
        pwLbl.parentNode.insertBefore(userFg, pwLbl);
      }
    }
    var userLblEl = document.getElementById("mo-user-lbl");
    if (userLblEl) {
      var origEmailLbl = document.querySelector("label[for='username']");
      var emailLblText = origEmailLbl ? origEmailLbl.textContent.replace(/\*/g, "").trim() : "Email address";
      userLblEl.textContent = emailLblText;
    }

    /* Wrap password field in .mo-pw-wrap for eye toggle */
    if (pwField.parentNode.className !== "mo-pw-wrap") {
      var wrap = document.createElement("div"); wrap.className = "mo-pw-wrap";
      pwField.parentNode.insertBefore(wrap, pwField);
      wrap.appendChild(pwField);
      pwField.setAttribute("placeholder", "Password");

      /* Eye toggle button */
      var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
      var EYE_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
      var eyeBtn = document.createElement("button");
      eyeBtn.type = "button"; eyeBtn.className = "mo-eye";
      eyeBtn.setAttribute("aria-label", "Toggle password visibility");
      eyeBtn.innerHTML = EYE_OFF;
      eyeBtn.addEventListener("click", function () {
        var show = pwField.type === "password";
        pwField.type = show ? "text" : "password";
        eyeBtn.innerHTML = show ? EYE_ON : EYE_OFF;
      });
      wrap.appendChild(eyeBtn);
    }

    /* Forgot password link only (no Remember me checkbox) */
    var bottomRow = document.getElementById("mo-bottom");
    if (!bottomRow) {
      bottomRow = document.createElement("div"); bottomRow.id = "mo-bottom";
      var fl = document.createElement("a"); fl.id = "mo-forgot";
      fl.href = getForgotHref();
      bottomRow.appendChild(fl);
      var wrapEl = pwField.closest(".mo-pw-wrap") || pwField;
      wrapEl.parentNode.insertBefore(bottomRow, wrapEl.nextSibling);
    }
    var forgotLinkEl = document.getElementById("mo-forgot");
    if (forgotLinkEl) {
      var origForgotLink = document.querySelector("a[href*='forgotpassword'], a[href*='resetpassword']");
      var forgotLinkText = origForgotLink ? origForgotLink.textContent.trim() : "Forgot password";
      forgotLinkEl.textContent = forgotLinkText;
    }
  }

  /* ── Force-hide specific elements that jQuery's showAdminPassword() re-shows ── */
  function forceHide() {
    /* Hide by ID — only the element itself, never its parent */
    ["dynamicUserName", "goBack"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.setProperty("display", "none", "important");
    });

    /* Hide "Sign in with another account" links only — check the link's OWN text, not children */
    document.querySelectorAll("a").forEach(function (a) {
      var txt = "";
      a.childNodes.forEach(function (n) { if (n.nodeType === 3) txt += n.nodeValue; });
      txt = txt.trim().toLowerCase();
      if (txt.indexOf("sign in with another") !== -1) {
        a.style.setProperty("display", "none", "important");
        /* Only hide parent if it is a safe small container (.col-auto or .form-group) */
        var p = a.parentElement;
        if (p && (p.classList.contains("col-auto") || p.classList.contains("form-group"))) {
          p.style.setProperty("display", "none", "important");
        }
      }
    });
  }

  /* ── FORGOT PASSWORD PAGE (/moas/idp/forgotpassword) ── */
  function applyForgotPage() {
    if (!checkIsForgot()) return;

    /* Wait for form to load */
    var emailInput = document.getElementById("emailAddress") || document.getElementById("username");
    if (!emailInput) return; // not ready yet

    /* ── CSS injection (once) ── */
    if (!document.getElementById("mo-fp-css")) {
      var fpCss =
        /* Page background */
        "body{" +
        "min-height:100vh!important;margin:0!important;padding:0!important;" +
        "display:flex!important;flex-direction:column!important;justify-content:center!important;align-items:center!important;" +
        "background:#eef1f7!important;" +
        "}" +
        "#root,#login-body{background:#eef1f7!important;}" +
        "#root>div{background:#eef1f7!important;}" +
        "#login-header{display:none!important;}" +
        "body #login-body, body .container-fluid{" +
        "width:100%!important;max-width:100%!important;margin:0 auto!important;padding:24px 16px!important;" +
        "display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;" +
        "box-sizing:border-box!important;background:transparent!important;float:none!important;" +
        "height:auto!important;min-height:unset!important;" +
        "}" +
        "#root .d-flex.flex-column.align-items-center{" +
        "align-items:center!important;" +
        "justify-content:center!important;" +
        "min-height:100vh!important;" +
        "padding:40px 16px!important;" +
        "box-sizing:border-box!important;" +
        "background:#eef1f7!important;" +
        "}" +

        /* Card */
        "body #login-body .container-fluid #login-wrapper, body #login-wrapper, #login-wrapper{" +
        "background:#fff!important;border:1px solid #e0e7ef!important;" +
        "border-radius:4px!important;box-shadow:0 2px 12px rgba(0,0,0,.08)!important;" +
        "max-width:560px!important;width:100%!important;" +
        "margin-left:auto!important;margin-right:auto!important;" +
        "margin-top:0!important;margin-bottom:0!important;" +
        "display:block!important;float:none!important;" +
        "position:relative!important;left:auto!important;right:auto!important;" +
        "padding:36px 40px 32px!important;box-sizing:border-box!important;" +
        "height:auto!important;min-height:unset!important;align-self:center!important;" +
        "}" +

        /* Form override (remove grey background) */
        "#userform,.login-form{" +
        "background:transparent!important;border:none!important;box-shadow:none!important;" +
        "padding:0!important;margin:0!important;width:100%!important;max-width:100%!important;" +
        "display:flex!important;flex-direction:column!important;align-items:stretch!important;" +
        "}" +

        /* Hide logo row, h4, p, separators */
        ".w-100.d-flex.justify-content-between.align-items-start.mb-4{display:none!important;}" +
        "h4.fw-medium.text-dark.mb-1,h4.fw-medium,h4.my-4{display:none!important;}" +
        "p.text-muted.small{display:none!important;}" +
        "#login-wrapper hr,#userform hr{display:none!important;}" +

        /* Hide card's inner heading */
        "#mo-fp-hide-section{display:none!important;}" +

        /* RESET PASSWORD heading */
        "#mo-fp-title{display:block;font-family:'Figtree',sans-serif;font-size:24px;font-weight:800;" +
        "color:#0d1b2a;margin-bottom:6px;letter-spacing:-.3px;text-align:left!important;}" +

        /* Subtitle */
        "#mo-fp-subtitle{display:block;font-size:14px;color:#6b7a8d;font-family:'Figtree',sans-serif;margin-bottom:20px;text-align:left!important;}" +

        /* Label */
        "#mo-fp-lbl{" +
        "display:block!important;color:#3c515d!important;font-size:14px!important;font-weight:700!important;" +
        "padding:0 0 6px!important;font-family:'Figtree',sans-serif!important;margin-bottom:0!important;" +
        "text-align:left!important;width:100%!important;" +
        "}" +
        "#mo-fp-lbl .mo-req{color:#e02020!important;margin-left:2px!important;}" +

        /* Email input */
        "#emailAddress,#username{" +
        "height:40px!important;border:1px solid #C1CFD7!important;border-radius:4px!important;" +
        "padding:0 12px!important;padding-left:12px!important;font-size:14px!important;" +
        "font-family:'Figtree',sans-serif!important;color:#000933!important;" +
        "background:#fff!important;width:100%!important;box-shadow:none!important;" +
        "outline:none!important;box-sizing:border-box!important;" +
        "margin-bottom:0!important;display:block!important;" +
        "}" +
        "#emailAddress::placeholder,#username::placeholder{color:#a0aab6!important;font-size:14px!important;}" +
        "#emailAddress:focus,#username:focus{border-color:#0A55D7!important;box-shadow:0 0 0 3px rgba(10,85,215,.12)!important;}" +

        /* Remove input icon */
        ".position-relative span.position-absolute{display:none!important;}" +

        /* Form / row scaling for legacy */
        "#userform .w-75,#userform .row,#userform .username-custom{" +
        "width:100%!important;max-width:100%!important;padding:0!important;margin:0!important;" +
        "display:block!important;" +
        "}" +

        /* Helper text */
        "#mo-fp-helper{font-size:13px;color:#6b7a8d;font-family:'Figtree',sans-serif;" +
        "margin:14px 0 18px;line-height:1.5;text-align:left!important;width:100%!important;}" +
        "#mo-fp-helper a{color:#0A55D7;text-decoration:none;font-weight:500;}" +
        "#mo-fp-helper a:hover{text-decoration:underline;}" +

        /* NEXT button */
        ".d-grid.mb-3{display:block!important;}" +
        ".d-grid.mb-3 button[type=submit],#userform button[type=submit],#userform button.custom-button{" +
        "display:inline-flex!important;align-items:center!important;justify-content:center!important;" +
        "gap:8px!important;min-height:40px!important;padding:8px 24px!important;" +
        "border-radius:0!important;background:#0A55D7!important;background-color:#0A55D7!important;" +
        "border:none!important;color:#fff!important;font-family:'Figtree',sans-serif!important;" +
        "font-size:14px!important;font-weight:700!important;letter-spacing:.6px!important;" +
        "text-transform:uppercase!important;cursor:pointer!important;box-shadow:none!important;" +
        "width:auto!important;margin:10px auto 10px 0!important;align-self:flex-start!important;" +
        "}" +
        ".d-grid.mb-3 button[type=submit]:hover,#userform button[type=submit]:hover,#userform button.custom-button:hover{" +
        "background:#0844b0!important;background-color:#0844b0!important;" +
        "}" +
        "#userform .row div:has(.custom-button){text-align:left!important;width:100%!important;}" +

        /* Hide Go back button */
        ".text-center button.btn-link,#go-back-link,#userform p:has(#go-back-link){display:none!important;}";

      var fpSt = document.createElement("style");
      fpSt.id = "mo-fp-css"; fpSt.textContent = fpCss;
      document.head.appendChild(fpSt);
    }

    /* ── JS force-hide (runs every call — beats React re-renders & inline styles) ── */
    /* Logo row */
    document.querySelectorAll("div.w-100.d-flex").forEach(function (el) {
      if (el.classList.contains("justify-content-between") && el.classList.contains("align-items-start")) {
        el.style.setProperty("display", "none", "important");
      }
    });
    /* h4 heading */
    document.querySelectorAll("h4").forEach(function (el) {
      el.style.setProperty("display", "none", "important");
    });
    /* Subtitle paragraph */
    document.querySelectorAll("p.text-muted").forEach(function (el) {
      el.style.setProperty("display", "none", "important");
    });
    /* Card heading block */
    var cardHeading = document.querySelector(".d-flex.flex-column.gap-2.mb-2");
    if (cardHeading) { cardHeading.style.setProperty("display", "none", "important"); }

    /* separators and headers */
    document.querySelectorAll("#login-wrapper hr,#userform hr").forEach(function (el) {
      el.style.setProperty("display", "none", "important");
    });

    /* Find the form element */
    var fpForm = emailInput.closest("form");
    if (!fpForm) return;

    /* Insert RESET PASSWORD title + subtitle before the form */
    var fpTitle = document.getElementById("mo-fp-title");
    if (!fpTitle) {
      fpTitle = document.createElement("span");
      fpTitle.id = "mo-fp-title";
      fpForm.parentNode.insertBefore(fpTitle, fpForm);
    }
    var origH4 = document.querySelector("h4");
    var fpTitleText = origH4 ? origH4.textContent.trim() : "RESET PASSWORD";
    fpTitle.textContent = fpTitleText;

    var fpSub = document.getElementById("mo-fp-subtitle");
    if (!fpSub) {
      fpSub = document.createElement("span");
      fpSub.id = "mo-fp-subtitle";
      fpForm.parentNode.insertBefore(fpSub, fpForm);
    }
    var origP = document.querySelector("p.text-muted");
    var fpSubtitleText = origP ? origP.textContent.trim() : "We will send you an email with instructions on how to recover it";
    fpSub.textContent = fpSubtitleText;

    /* Replace/create label text */
    var origLabel = fpForm.querySelector("label[for='emailAddress']") || fpForm.querySelector("label[for='username']") || document.getElementById("mo-fp-lbl");
    if (!origLabel) {
      origLabel = document.createElement("label");
      origLabel.setAttribute("for", emailInput.id);
      origLabel.id = "mo-fp-lbl";
      emailInput.parentNode.insertBefore(origLabel, emailInput);
    } else if (origLabel.id !== "mo-fp-lbl") {
      origLabel.id = "mo-fp-lbl"; origLabel.className = "";
    }
    var origLabelText = origLabel ? origLabel.textContent.replace(/\*/g, "").trim() : "Email address";
    origLabel.innerHTML = origLabelText + ' <span class="mo-req">*</span>';

    /* Fix input placeholder */
    emailInput.setAttribute("placeholder", "email");

    /* Insert helper text after the input wrapper */
    var helper = document.getElementById("mo-fp-helper");
    if (!helper) {
      var inputWrapper = emailInput.closest(".mb-3") || emailInput.closest(".username-custom") || emailInput.closest(".row");
      if (inputWrapper) {
        helper = document.createElement("p");
        helper.id = "mo-fp-helper";
        inputWrapper.parentNode.insertBefore(helper, inputWrapper.nextSibling);
      }
    }
    if (helper) {
      var origHelpDiv = document.querySelector(".small.text-muted") || document.querySelector("p.text-muted.small");
      var helpText = origHelpDiv ? origHelpDiv.innerHTML : "Not receiving an email to reset your password? Then the e-mail address used is not known to us. Can’t figure it out?<br><a href=\"mailto:support@example.com\">Contact customer service</a>";
      helper.innerHTML = helpText;
    }

    /* Change button text to NEXT → */
    var fpBtn = fpForm.querySelector("button") || fpForm.querySelector("input[type='submit']");
    if (fpBtn) {
      var isRtl = isRtlLocale(getLocale());
      var origBtnText = (fpBtn.value || fpBtn.textContent || "NEXT").trim();
      origBtnText = origBtnText.replace(/[\u2190\u2192]/g, "").trim();
      var arrowSpan = isRtl ? '<span style="margin-right: 6px;">&larr;</span>' : '<span style="margin-left: 6px;">&rarr;</span>';
      fpBtn.innerHTML = origBtnText + ' ' + arrowSpan;
    }

    /* Mark as done */
    if (!document.getElementById("mo-forgot-done")) {
      var done = document.createElement("span");
      done.id = "mo-forgot-done"; done.style.display = "none";
      document.body.appendChild(done);
    }
  }

  /* ── OTP VERIFY PAGE (/moas/idp/validatenextfactor) ── */
  function applyOtpPage() {
    if (!checkIsOtp()) return;

    /* CSS — inject once */
    if (!document.getElementById("mo-otp-css")) {
      var otpCss =
        /* Page: remove grey overlay, set brand bg */
        "body{background:#eef1f7!important;overflow:auto!important;" +
        "padding-right:0!important;font-family:'Figtree',sans-serif!important;}" +
        ".modal-backdrop{display:none!important;}" +
        ".modal.show{position:static!important;display:flex!important;" +
        "align-items:center!important;justify-content:center!important;" +
        "min-height:100vh!important;background:#eef1f7!important;" +
        "padding:40px 16px!important;box-sizing:border-box!important;}" +
        ".modal-dialog{margin:0!important;max-width:640px!important;width:100%!important;}" +
        ".modal-content{border:1px solid #e0e7ef!important;border-radius:4px!important;" +
        "box-shadow:0 2px 12px rgba(0,0,0,.08)!important;}" +
        "#modal-header-main{border-bottom:none!important;padding:32px 36px 12px!important;}" +
        ".modal-title{font-size:0!important;color:transparent!important;}" +
        "#mo-otp-title{display:block;font-family:'Figtree',sans-serif;font-size:24px;" +
        "font-weight:800;color:#0d1b2a;text-transform:uppercase;letter-spacing:-.3px;margin:0;}" +
        "#modal-body{padding:4px 36px 4px!important;}" +
        "#success-alert-message{background:#e8f5e9!important;border:none!important;" +
        "border-left:4px solid #2e7d32!important;border-radius:4px!important;" +
        "color:#1b5e20!important;padding:12px 16px!important;display:flex!important;" +
        "align-items:flex-start!important;gap:10px!important;margin-bottom:20px!important;}" +
        "#success-alert-message .fa-check-circle{color:#2e7d32!important;" +
        "font-size:18px!important;flex-shrink:0;margin-top:2px!important;}" +
        "#success-alert-message .btn-close{display:none!important;}" +
        "#success-alert-message .actionMessage{list-style:none!important;" +
        "padding:0!important;margin:0!important;}" +
        "#success-alert-message .actionMessage li span{font-family:'Figtree',sans-serif;" +
        "font-size:14px;line-height:1.5;}" +
        "#mo-otp-lbl{display:block;font-family:'Figtree',sans-serif;font-size:14px;" +
        "font-weight:700;color:#3c515d;margin-bottom:6px;}" +
        "#mo-otp-lbl .mo-req{color:#e02020;margin-left:2px;}" +
        "#otpToken{height:40px!important;border:1px solid #C1CFD7!important;" +
        "border-radius:4px!important;padding:0 12px!important;font-size:14px!important;" +
        "font-family:'Figtree',sans-serif!important;color:#000933!important;" +
        "background:#fff!important;box-shadow:none!important;" +
        "width:100%!important;box-sizing:border-box!important;}" +
        "#otpToken::placeholder{color:#a0aab6!important;font-size:14px!important;}" +
        "#otpToken:focus{border-color:#0A55D7!important;" +
        "box-shadow:0 0 0 3px rgba(10,85,215,.12)!important;outline:none!important;}" +
        "#resendIdpOtpLink{color:#0A55D7!important;font-family:'Figtree',sans-serif!important;" +
        "font-size:14px!important;text-decoration:none!important;font-weight:500!important;" +
        "display:inline-block!important;margin-top:12px!important;}" +
        "#resendIdpOtpLink:hover{text-decoration:underline!important;}" +
        "#modal-footer{border-top:none!important;padding:20px 36px 32px!important;" +
        "justify-content:flex-start!important;gap:12px!important;}" +
        "#validate{background:#0A55D7!important;background-color:#0A55D7!important;" +
        "border:none!important;border-radius:0!important;color:#fff!important;" +
        "font-family:'Figtree',sans-serif!important;font-size:14px!important;" +
        "font-weight:700!important;text-transform:uppercase!important;" +
        "letter-spacing:.6px!important;padding:8px 24px!important;" +
        "cursor:pointer!important;min-height:40px!important;}" +
        "#validate:hover{background:#0844b0!important;background-color:#0844b0!important;}" +
        ".btn-cancel{background:#e9ecef!important;border:none!important;" +
        "border-radius:0!important;color:#3c515d!important;" +
        "font-family:'Figtree',sans-serif!important;font-size:14px!important;" +
        "font-weight:700!important;text-transform:uppercase!important;" +
        "letter-spacing:.6px!important;padding:8px 24px!important;min-height:40px!important;}" +
        ".btn-cancel:hover{background:#dee2e6!important;}";

      var otpSt = document.createElement("style");
      otpSt.id = "mo-otp-css"; otpSt.textContent = otpCss;
      document.head.appendChild(otpSt);
    }

    var otpInput = document.getElementById("otpToken");
    if (!otpInput) return;

    /* VERIFY YOUR IDENTITY title */
    var modalHeader = document.getElementById("modal-header-main");
    var otpTitle = document.getElementById("mo-otp-title");
    if (modalHeader && !otpTitle) {
      otpTitle = document.createElement("span");
      otpTitle.id = "mo-otp-title";
      modalHeader.insertBefore(otpTitle, modalHeader.firstChild);
    }
    if (otpTitle) {
      var origOtpTitle = document.querySelector(".modal-title");
      var otpTitleText = origOtpTitle ? origOtpTitle.textContent.trim() : "VERIFY YOUR IDENTITY";
      otpTitle.textContent = otpTitleText;
    }

    /* Label above OTP input */
    var otpLbl = document.getElementById("mo-otp-lbl");
    if (!otpLbl) {
      otpLbl = document.createElement("label");
      otpLbl.id = "mo-otp-lbl";
      otpLbl.setAttribute("for", "otpToken");
      otpInput.parentNode.insertBefore(otpLbl, otpInput);
    }
    var origOtpLbl = document.querySelector("label[for='otpToken']");
    var otpLblText = origOtpLbl ? origOtpLbl.textContent.replace(/\*/g, "").trim() : "Enter OTP here";
    otpLbl.innerHTML = otpLblText + ' <span class="mo-req">*</span>';

    /* Placeholder */
    var origPlaceholder = otpInput.getAttribute("placeholder") || "OTP number";
    otpInput.setAttribute("placeholder", origPlaceholder);

    /* Verify button */
    var verifyBtn = document.getElementById("validate");
    if (verifyBtn) {
      var isRtl = isRtlLocale(getLocale());
      var arrowStr = isRtl ? " \u2190" : " \u2192";
      var origBtnText = (verifyBtn.value || verifyBtn.textContent || "VERIFY").trim();
      origBtnText = origBtnText.replace(/[\u2190\u2192]/g, "").trim();
      verifyBtn.value = origBtnText + arrowStr;
    }

    /* Cancel button */
    var cancelBtn = document.querySelector(".btn-cancel");
    if (cancelBtn) {
      var origCancelBtn = document.querySelector(".btn-cancel");
      var cancelBtnText = origCancelBtn ? origCancelBtn.textContent.trim() : "CANCEL";
      cancelBtn.textContent = cancelBtnText;
    }

    /* Mark done */
    if (!document.getElementById("mo-otp-done")) {
      var otpDone = document.createElement("span");
      otpDone.id = "mo-otp-done"; otpDone.style.display = "none";
      document.body.appendChild(otpDone);
    }
  }

  /* ── CHANGE PASSWORD PAGE (/moas/idp/changepassword) ── */
  function applyChangePasswordPage() {
    if (!checkIsChangePass()) return;

    /* CSS — inject once */
    if (!document.getElementById("mo-cp-css")) {
      var cpCss =
        /* Page bg */
        "body,#login-body{background:#eef1f7!important;font-family:'Figtree',sans-serif!important;min-height:100vh!important;}" +
        "#login-header{display:none!important;}" +

        /* Card wrapper */
        "#login-wrapper{" +
        "background:#fff!important;border:1px solid #e0e7ef!important;" +
        "border-radius:4px!important;box-shadow:0 2px 12px rgba(0,0,0,.08)!important;" +
        "padding:36px 40px 32px!important;max-width:560px!important;width:100%!important;" +
        "margin:40px auto!important;box-sizing:border-box!important;" +
        "}" +

        /* Title styling */
        "#login-wrapper .login-header{" +
        "display:flex!important;justify-content:space-between!important;align-items:center!important;" +
        "font-family:'Figtree',sans-serif!important;font-size:24px!important;" +
        "font-weight:800!important;color:#0d1b2a!important;text-transform:uppercase!important;" +
        "letter-spacing:-.3px!important;margin-bottom:20px!important;text-align:left!important;" +
        "border:none!important;padding:0!important;" +
        "}" +

        /* Hide line separators */
        "#login-wrapper hr{display:none!important;}" +

        /* Form stack */
        "#passwordform .row,#userform .row{margin:0!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;}" +
        "#passwordform .col-md-5,#passwordform .col-md-8,#passwordform .offset-md-1,#passwordform .offset-md-2," +
        "#userform .col-xs-5,#userform .col-xs-offset-1,#userform .col-xs-10,#userform .col-xs-offset-2{" +
        "width:100%!important;max-width:100%!important;padding:0!important;margin:0!important;text-align:left!important;" +
        "}" +

        /* Password requirements alert box customization */
        ".password-padding{padding:0!important;margin:10px 0 20px 0!important;width:100%!important;}" +
        ".password-padding .alert-info{" +
        "background:transparent!important;border:none!important;" +
        "padding:0!important;margin:0!important;width:100%!important;" +
        "}" +
        ".password-padding h5{" +
        "font-family:'Figtree',sans-serif!important;font-size:14px!important;" +
        "font-weight:700!important;color:#3c515d!important;" +
        "margin-bottom:8px!important;" +
        "}" +
        "#listcontent{padding-left:0!important;margin:0!important;list-style:none!important;}" +
        "#listcontent li{" +
        "font-family:'Figtree',sans-serif!important;font-size:13px!important;" +
        "margin-bottom:6px!important;" +
        "display:flex!important;align-items:center!important;" +
        "gap:8px!important;" +
        "list-style:none!important;" +
        "position:relative!important;" +
        "padding-left:20px!important;" +
        "text-align:left!important;" +
        "transition:color 0.2s ease!important;" +
        "}" +
        "#listcontent li.mo-valid{color:#2e7d32!important;}" +
        "#listcontent li.mo-invalid{color:#82829c!important;}" +
        "#listcontent li.mo-valid::before{" +
        "content:'✓'!important;position:absolute!important;left:0!important;" +
        "color:#2e7d32!important;font-weight:bold!important;" +
        "}" +
        "#listcontent li.mo-invalid::before{" +
        "content:'○'!important;position:absolute!important;left:0!important;" +
        "color:#82829c!important;font-weight:normal!important;font-size:14px!important;" +
        "}" +

        /* Style label/text above inputs */
        "#passwordform p.text-left,#userform span.align-items-left,#userform span.d-flex{" +
        "display:block!important;color:#3c515d!important;font-size:14px!important;" +
        "font-weight:700!important;font-family:'Figtree',sans-serif!important;" +
        "text-align:left!important;margin:0 0 6px 0!important;" +
        "}" +

        /* Style inputs */
        "#newPassword,#confirmPassword,#password,#userform input[type='password']{" +
        "height:40px!important;border:1px solid #C1CFD7!important;border-radius:4px!important;" +
        "padding:0 12px!important;font-size:14px!important;font-family:'Figtree',sans-serif!important;" +
        "color:#000933!important;background:#fff!important;width:100%!important;" +
        "box-shadow:none!important;outline:none!important;box-sizing:border-box!important;" +
        "margin-bottom:16px!important;display:block!important;" +
        "}" +
        "#newPassword:focus,#confirmPassword:focus,#password:focus,#userform input[type='password']:focus{" +
        "border-color:#0A55D7!important;box-shadow:0 0 0 3px rgba(10,85,215,.12)!important;" +
        "}" +

        /* Submit button styling */
        "#validate,#submit{" +
        "display:inline-flex!important;align-items:center!important;justify-content:center!important;" +
        "gap:8px!important;min-height:40px!important;padding:8px 24px!important;" +
        "border-radius:0!important;background:#0A55D7!important;background-color:#0A55D7!important;" +
        "border:none!important;color:#fff!important;font-family:'Figtree',sans-serif!important;" +
        "font-size:14px!important;font-weight:700!important;letter-spacing:.6px!important;" +
        "text-transform:uppercase!important;cursor:pointer!important;box-shadow:none!important;" +
        "width:auto!important;margin:10px auto 10px 0!important;align-self:flex-start!important;" +
        "}" +
        "#validate:hover,#submit:hover{background:#0844b0!important;background-color:#0844b0!important;}" +

        /* Hide Go Back to Login link */
        "#passwordform a.btn-link,#back-link{display:none!important;}";

      var cpSt = document.createElement("style");
      cpSt.id = "mo-cp-css"; cpSt.textContent = cpCss;
      document.head.appendChild(cpSt);
    }

    var fpForm = document.getElementById("passwordform") || document.getElementById("userform");
    if (!fpForm) return;

    var newPasswordInput = document.getElementById("newPassword") || fpForm.querySelector("input[name='password']");
    var confirmPasswordInput = document.getElementById("confirmPassword") || fpForm.querySelector("input[name='confirmPassword']");

    /* Update title to LOGIN DETAILS with close x button */
    var h3 = document.querySelector(".login-header");
    if (h3) {
      var closeBtn = document.getElementById("mo-cp-close");
      if (!closeBtn) {
        closeBtn = document.createElement("a");
        closeBtn.id = "mo-cp-close";
        closeBtn.href = "login";
        closeBtn.innerHTML = "&times;";
        closeBtn.style.color = "#a0aab6";
        closeBtn.style.textDecoration = "none";
        closeBtn.style.fontSize = "24px";
        closeBtn.style.fontWeight = "400";
        closeBtn.style.cursor = "pointer";
        closeBtn.style.lineHeight = "1";
      }
      var origH3 = document.querySelector(".login-header");
      var h3Text = origH3 ? origH3.textContent.replace(/×/g, "").trim() : "LOGIN DETAILS";
      h3.textContent = h3Text + " ";
      h3.appendChild(closeBtn);
    }

    /* Add * to labels */
    var labelSelector = "#passwordform p.text-left, #userform span.align-items-left, #userform span.d-flex";
    document.querySelectorAll(labelSelector).forEach(function (p) {
      if (p.querySelector(".mo-req")) return; // already added
      p.innerHTML = p.innerHTML.trim() + ' <span class="mo-req" style="color:#e02020; margin-left:2px;">*</span>';
    });

    /* Deduplicate requirements list if Xecurify script duplicated them */
    var listcontent = document.getElementById("listcontent");
    if (listcontent) {
      var items = listcontent.querySelectorAll("li");
      var seen = {};
      items.forEach(function (li) {
        var txt = li.textContent.trim();
        if (!txt || seen[txt]) {
          li.remove();
        } else {
          seen[txt] = true;
        }
      });
    }

    /* Move requirements block below new password input (above confirm password input) */
    var newPasswordCol = newPasswordInput ? newPasswordInput.closest("div") : null;
    var requirementsBlock = document.querySelector(".password-padding");
    if (newPasswordCol && requirementsBlock && requirementsBlock.previousSibling !== newPasswordCol) {
      newPasswordCol.parentNode.insertBefore(requirementsBlock, newPasswordCol.nextSibling);
    }

    /* Append strength meter */
    var strengthContainer = document.getElementById("mo-strength-container");
    if (requirementsBlock && !strengthContainer) {
      strengthContainer = document.createElement("div");
      strengthContainer.id = "mo-strength-container";
      strengthContainer.style.width = "100%";
      strengthContainer.style.boxSizing = "border-box";
      strengthContainer.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center; margin: 16px 0 6px 0; width:100%;">' +
        '<span id="mo-strength-label" style="font-family:\'Figtree\',sans-serif; font-size:13px; font-weight:700; color:#3c515d;"></span>' +
        '<span id="mo-strength-value" style="font-family:\'Figtree\',sans-serif; font-size:13px; font-weight:700; color:#a0aab6;"></span>' +
        '</div>' +
        '<div id="mo-strength-bar-wrap" style="height:4px; background:#e0e7ef; border-radius:2px; overflow:hidden; width:100%;">' +
        '<div id="mo-strength-bar-fill" style="height:100%; width:0%; background:#e0e7ef; transition: width 0.3s ease, background-color 0.3s ease;"></div>' +
        '</div>';
      requirementsBlock.appendChild(strengthContainer);
    }
    if (strengthContainer) {
      var lblEl = document.getElementById("mo-strength-label");
      var valEl = document.getElementById("mo-strength-value");
      if (lblEl) lblEl.textContent = getTranslation("passwordStrength");
      if (valEl && (!newPasswordInput || newPasswordInput.value === "")) {
        valEl.textContent = getTranslation("strengthWeak");
      }
    }

    /* Dynamic Validation Function */
    function updatePasswordRequirementsAndStrength() {
      if (!newPasswordInput) return;
      var val = newPasswordInput.value || "";

      var listItems = document.querySelectorAll("#listcontent li");
      var score = 0;
      var totalRules = listItems.length || 1;

      listItems.forEach(function (li) {
        var txt = li.textContent.trim().toLowerCase();
        var isValid = false;

        if (txt.indexOf("minimum") !== -1 || txt.indexOf("characters") !== -1) {
          var minMatch = txt.match(/minimum\s+(\d+)/) || txt.match(/(\d+)-(\d+)\s+characters/);
          if (minMatch) {
            var minLen = parseInt(minMatch[1], 10);
            if (val.length >= minLen) isValid = true;
          } else {
            if (val.length >= 6) isValid = true;
          }
        } else if (txt.indexOf("maximum") !== -1) {
          var maxMatch = txt.match(/maximum\s+(\d+)/);
          if (maxMatch) {
            var maxLen = parseInt(maxMatch[1], 10);
            if (val.length <= maxLen && val.length > 0) isValid = true;
          } else {
            if (val.length <= 20 && val.length > 0) isValid = true;
          }
        } else if (txt.indexOf("uppercase") !== -1) {
          if (/[A-Z]/.test(val)) isValid = true;
        } else if (txt.indexOf("lowercase") !== -1) {
          if (/[a-z]/.test(val)) isValid = true;
        } else if (txt.indexOf("number") !== -1 || txt.indexOf("digit") !== -1) {
          if (/[0-9]/.test(val)) isValid = true;
        } else if (txt.indexOf("symbol") !== -1 || txt.indexOf("special") !== -1 || txt.indexOf("allowed symbols") !== -1) {
          if (/[!@#\$%\^&\*\-_\.]/.test(val)) isValid = true;
        } else {
          if (val.length > 0) isValid = true;
        }

        if (isValid) {
          li.classList.add("mo-valid");
          li.classList.remove("mo-invalid");
          score++;
        } else {
          li.classList.add("mo-invalid");
          li.classList.remove("mo-valid");
        }
      });

      var strengthValue = document.getElementById("mo-strength-value");
      var strengthFill = document.getElementById("mo-strength-bar-fill");
      if (strengthValue && strengthFill) {
        if (val.length === 0) {
          strengthValue.textContent = getTranslation("strengthWeak");
          strengthValue.style.color = "#a0aab6";
          strengthFill.style.width = "0%";
          strengthFill.style.backgroundColor = "#e0e7ef";
        } else {
          var pct = Math.round((score / totalRules) * 100);
          strengthFill.style.width = pct + "%";

          if (pct < 40) {
            strengthValue.textContent = getTranslation("strengthWeak");
            strengthValue.style.color = "#e02020";
            strengthFill.style.backgroundColor = "#e02020";
          } else if (pct < 70) {
            strengthValue.textContent = getTranslation("strengthMedium");
            strengthValue.style.color = "#ff9800";
            strengthFill.style.backgroundColor = "#ff9800";
          } else if (pct < 100) {
            strengthValue.textContent = getTranslation("strengthStrong");
            strengthValue.style.color = "#0A55D7";
            strengthFill.style.backgroundColor = "#0A55D7";
          } else {
            strengthValue.textContent = getTranslation("strengthSufficient");
            strengthValue.style.color = "#2e7d32";
            strengthFill.style.backgroundColor = "#2e7d32";
          }
        }
      }
    }

    /* Bind events for dynamic updates */
    if (newPasswordInput && !newPasswordInput.dataset.moListener) {
      newPasswordInput.dataset.moListener = "true";
      newPasswordInput.addEventListener("input", updatePasswordRequirementsAndStrength);
      updatePasswordRequirementsAndStrength();
    }

    /* Disable native HTML5 validation bubbles/hovers */
    var form = document.getElementById("passwordform") || document.getElementById("userform");
    if (form) {
      form.setAttribute("novalidate", "true");
    }
    if (newPasswordInput) {
      newPasswordInput.removeAttribute("title");
    }
    if (confirmPasswordInput) {
      confirmPasswordInput.removeAttribute("title");
    }

    /* Shift the error display container (#pwd_strength) below the confirm password input */
    var pwdStrengthDiv = document.getElementById("pwd_strength");
    if (confirmPasswordInput && pwdStrengthDiv && pwdStrengthDiv.parentNode !== confirmPasswordInput.parentNode) {
      confirmPasswordInput.parentNode.appendChild(pwdStrengthDiv);
      pwdStrengthDiv.style.fontFamily = "'Figtree', sans-serif";
      pwdStrengthDiv.style.fontSize = "13px";
      pwdStrengthDiv.style.fontWeight = "700";
      pwdStrengthDiv.style.textAlign = "left";
      pwdStrengthDiv.style.marginTop = "6px";
      pwdStrengthDiv.style.marginBottom = "0";
      pwdStrengthDiv.style.display = "block";
    }

    /* Bind custom validation on submit to show neat errors instead of bubbles */
    if (form && !form.dataset.moValidationBound) {
      form.dataset.moValidationBound = "true";
      form.addEventListener("submit", function (e) {
        var val = newPasswordInput ? newPasswordInput.value : "";
        var confirmVal = confirmPasswordInput ? confirmPasswordInput.value : "";
        var pwdStrengthDiv = document.getElementById("pwd_strength");

        if (!val) {
          e.preventDefault();
          if (pwdStrengthDiv) {
            pwdStrengthDiv.innerHTML = "<font style='color:rgb(239, 47, 47);'>" + getTranslation("newPasswordRequired") + "</font>";
          }
          if (newPasswordInput) newPasswordInput.focus();
          return;
        }

        var invalidItems = document.querySelectorAll("#listcontent li.mo-invalid");
        if (invalidItems.length > 0) {
          e.preventDefault();
          if (pwdStrengthDiv) {
            pwdStrengthDiv.innerHTML = "<font style='color:rgb(239, 47, 47);'>" + getTranslation("satisfyRequirements") + "</font>";
          }
          if (newPasswordInput) newPasswordInput.focus();
          return;
        }

        if (val !== confirmVal) {
          e.preventDefault();
          if (pwdStrengthDiv) {
            pwdStrengthDiv.innerHTML = "<font style='color:rgb(239, 47, 47);'>" + getTranslation("passwordsMustMatch") + "</font>";
          }
          if (confirmPasswordInput) confirmPasswordInput.focus();
          return;
        }

        if (pwdStrengthDiv) {
          pwdStrengthDiv.innerHTML = "";
        }
      });
    }
  }

  /* ── MAIN RUN ── */
  function run() {
    var isLogin = checkIsLogin();
    var isForgot = checkIsForgot();
    var isOtp = checkIsOtp();
    var isChangePass = checkIsChangePass();

    if (!isLogin && !isForgot && !isOtp && !isChangePass) return;

    injectFontAndCss();

    if (isLogin) {
      applyEmailStep();
      applyPasswordStep();
      forceHide();

      /* Hide original forgot/create link wrappers — skip our custom #mo-forgot */
      document.querySelectorAll("a[href*='forgotpassword'],a[href*='resetpassword'],a[href*='businessfreetrial']").forEach(function (a) {
        if (a.id === "mo-forgot") return;
        var c = a.closest(".col-auto");
        if (c) c.style.setProperty("display", "none", "important");
        else a.style.setProperty("display", "none", "important");
      });

      var wrapper = document.getElementById("login-wrapper");
      if (wrapper) wrapper.querySelectorAll("hr,br").forEach(function (el) { el.style.display = "none"; });
    }

    if (isForgot) { applyForgotPage(); }
    if (isOtp) { applyOtpPage(); }
    if (isChangePass) { applyChangePasswordPage(); }
  }

  /* ── TIMING ── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else { run(); }
  setTimeout(run, 300);
  setTimeout(run, 800);
  setTimeout(run, 1500);

  /* ── OBSERVER ── */
  var observer = new MutationObserver(function () {
    var isLogin = checkIsLogin();
    var isForgot = checkIsForgot();
    var isOtp = checkIsOtp();
    var isChangePass = checkIsChangePass();

    if (isLogin) { forceHide(); applyPasswordStep(); }
    if (isForgot) { applyForgotPage(); }
    if (isOtp) { applyOtpPage(); }
    if (isChangePass) { applyChangePasswordPage(); }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"]
  });

}());
