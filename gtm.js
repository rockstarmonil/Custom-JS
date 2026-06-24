(function () {
  "use strict";

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

  /* ── INJECT FONT AND CSS ── */
  function injectFontAndCss() {

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
        "}";

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

  /*
   * getForgotLinkText()
   * Read the platform's own "Forgot password" link text so it is already
   * translated by the server.  Falls back to the link's href-based text or
   * an empty string so the anchor still works even if no text is found.
   */
  function getForgotLinkText() {
    var a = document.querySelector("a[href*='forgotpassword'], a[href*='resetpassword']");
    if (a) {
      var txt = a.textContent.trim();
      if (txt) return txt;
    }
    return "";
  }

  /* ── STEP 1: Email page UI ── */
  function applyEmailStep() {
    var wrapper = document.getElementById("login-wrapper");
    if (!wrapper) return;

    /*
     * LOG IN title — read from the platform's existing .login-header or
     * .custom-title element so the server-translated text is preserved.
     * Only inject #mo-title if the platform has not already rendered a
     * visible heading we can promote.
     */
    if (!document.getElementById("mo-title")) {
      var existingHeader = document.querySelector(".login-header, .custom-title");
      var titleText = existingHeader ? existingHeader.textContent.trim() : "";
      var t = document.createElement("span");
      t.id = "mo-title";
      t.textContent = titleText; /* may be "" — CSS hides the original header */
      wrapper.insertBefore(t, wrapper.firstChild);
    }

    /*
     * Email label — read the platform's own <label for="username"> rather
     * than injecting an English string.  We only add the required-star span
     * for visual styling; the label text itself comes from the DOM.
     */
    var userDiv = document.getElementById("userName");
    if (userDiv && !document.getElementById("mo-email-lbl")) {
      var fg = document.createElement("div"); fg.className = "mo-fg";
      var lbl = document.createElement("label");
      lbl.id = "mo-email-lbl"; lbl.className = "mo-lbl";
      lbl.setAttribute("for", "username");

      /* Try to find the platform's label for this field */
      var platformLbl = document.querySelector("label[for='username']");
      var lblText = platformLbl ? platformLbl.textContent.trim() : "";
      lbl.innerHTML = lblText + ' <span class="mo-req">*</span>';

      fg.appendChild(lbl);
      userDiv.parentNode.insertBefore(fg, userDiv);
      fg.appendChild(userDiv);

      /* Remove the original platform label now that we have promoted it */
      if (platformLbl && platformLbl !== lbl) {
        platformLbl.style.display = "none";
      }

      /* Do NOT overwrite the placeholder — the platform sets it translated */
    }

    /* Button label — keep platform text, just ensure dataset flag is set so
       we don't re-process on subsequent observer calls */
    var btn = document.getElementById("loginbutton");
    if (btn && !btn.dataset.mo) {
      /* Leave btn.value as-is: the platform has already set translated text */
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
    var emailLbl = document.getElementById("mo-email-lbl");
    if (emailLbl) {
      var emailFg = emailLbl.closest(".mo-fg") || emailLbl.parentElement;
      if (emailFg) emailFg.style.setProperty("display", "none", "important");
    }

    /* LOG IN title — same logic as applyEmailStep: read from existing header */
    var wrapper = document.getElementById("login-wrapper");
    if (wrapper && !document.getElementById("mo-title")) {
      var existingHeader = document.querySelector(".login-header, .custom-title");
      var titleText = existingHeader ? existingHeader.textContent.trim() : "";
      var t = document.createElement("span");
      t.id = "mo-title";
      t.textContent = titleText;
      wrapper.insertBefore(t, wrapper.firstChild);
    }

    /* Button label — keep platform text unchanged */
    /* (no assignment to btn.value here — let the platform text stand) */

    if (document.getElementById("mo-pw-lbl")) return; // already applied

    /*
     * Password label — read from platform's <label for="plaintextPassword">
     * so the translated text is used.
     */
    var platformPwLbl = document.querySelector("label[for='plaintextPassword']");
    var pwLblText = platformPwLbl ? platformPwLbl.textContent.trim() : "";

    var pwLbl = document.createElement("label");
    pwLbl.id = "mo-pw-lbl"; pwLbl.className = "mo-lbl";
    pwLbl.setAttribute("for", "plaintextPassword");
    pwLbl.innerHTML = pwLblText + ' <span class="mo-req">*</span>';
    pwField.parentNode.insertBefore(pwLbl, pwField);

    /* Hide original platform label now that we promoted it */
    if (platformPwLbl && platformPwLbl !== pwLbl) {
      platformPwLbl.style.display = "none";
    }

    /* Show read-only username above password field.
       Label text: read from the platform's label for #username */
    if (!document.getElementById("mo-user-display")) {
      var usernameVal = "";
      var unInp = document.getElementById("username");
      if (unInp && unInp.value) usernameVal = unInp.value;
      if (!usernameVal && dynUser) usernameVal = dynUser.textContent.trim();
      if (usernameVal) {
        var platformEmailLbl = document.querySelector("label[for='username']") ||
                               document.getElementById("mo-email-lbl");
        var emailLblText = platformEmailLbl ? platformEmailLbl.textContent.replace("*", "").trim() : "";

        var userFg = document.createElement("div"); userFg.className = "mo-fg";
        var userLbl = document.createElement("label"); userLbl.className = "mo-lbl";
        userLbl.textContent = emailLblText;
        var userBox = document.createElement("div"); userBox.id = "mo-user-display";
        userBox.className = "mo-user-display";
        userBox.textContent = usernameVal;
        userFg.appendChild(userLbl); userFg.appendChild(userBox);
        pwLbl.parentNode.insertBefore(userFg, pwLbl);
      }
    }

    /* Wrap password field in .mo-pw-wrap for eye toggle */
    var wrap = document.createElement("div"); wrap.className = "mo-pw-wrap";
    pwField.parentNode.insertBefore(wrap, pwField);
    wrap.appendChild(pwField);
    /* Do NOT overwrite placeholder — keep platform's translated placeholder */

    /* Eye toggle button — icon only, no visible text; aria-label is
       intentionally left empty so screen readers fall back to the SVG title.
       The icon itself is universal and needs no translation. */
    var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
    var EYE_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    var eyeBtn = document.createElement("button");
    eyeBtn.type = "button"; eyeBtn.className = "mo-eye";
    eyeBtn.setAttribute("aria-label", "");
    eyeBtn.innerHTML = EYE_OFF;
    eyeBtn.addEventListener("click", function () {
      var show = pwField.type === "password";
      pwField.type = show ? "text" : "password";
      eyeBtn.innerHTML = show ? EYE_ON : EYE_OFF;
    });
    wrap.appendChild(eyeBtn);

    /*
     * Forgot password link — read text from the platform's own link so the
     * translated label is used.  The href is also read from the platform link.
     */
    if (!document.getElementById("mo-bottom")) {
      var row = document.createElement("div"); row.id = "mo-bottom";
      var fl = document.createElement("a"); fl.id = "mo-forgot";
      fl.href = getForgotHref();
      fl.textContent = getForgotLinkText();
      row.appendChild(fl);
      wrap.parentNode.insertBefore(row, wrap.nextSibling);
    }
  }

  /* ── Force-hide specific elements that jQuery's showAdminPassword() re-shows ── */
  function forceHide() {
    /* Hide by ID — only the element itself, never its parent */
    ["dynamicUserName", "goBack"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.setProperty("display", "none", "important");
    });

    /* Hide "Sign in with another account" links — check the link's OWN text node */
    document.querySelectorAll("a").forEach(function (a) {
      var txt = "";
      a.childNodes.forEach(function (n) { if (n.nodeType === 3) txt += n.nodeValue; });
      txt = txt.trim().toLowerCase();
      if (txt.indexOf("sign in with another") !== -1) {
        a.style.setProperty("display", "none", "important");
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
    if (!emailInput) return;

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
    document.querySelectorAll("div.w-100.d-flex").forEach(function (el) {
      if (el.classList.contains("justify-content-between") && el.classList.contains("align-items-start")) {
        el.style.setProperty("display", "none", "important");
      }
    });
    document.querySelectorAll("h4").forEach(function (el) {
      el.style.setProperty("display", "none", "important");
    });
    document.querySelectorAll("p.text-muted").forEach(function (el) {
      el.style.setProperty("display", "none", "important");
    });
    var cardHeading = document.querySelector(".d-flex.flex-column.gap-2.mb-2");
    if (cardHeading) { cardHeading.style.setProperty("display", "none", "important"); }
    document.querySelectorAll("#login-wrapper hr,#userform hr").forEach(function (el) {
      el.style.setProperty("display", "none", "important");
    });

    /* ── DOM injection — only once ── */
    if (document.getElementById("mo-forgot-done")) return;

    var fpForm = emailInput.closest("form");
    if (!fpForm) return;

    /*
     * Title + subtitle — read from the platform's existing heading elements
     * so the server-translated text is used.  The platform typically renders
     * an h4 or .login-header with the page title; we promote that text into
     * our styled #mo-fp-title span and inject a subtitle only if the platform
     * provides one (e.g. a <p class="text-muted">).
     */
    if (!document.getElementById("mo-fp-title")) {
      var platformTitle = document.querySelector(".login-header, h4.fw-medium, h4.my-4");
      var titleText = platformTitle ? platformTitle.textContent.trim() : "";

      var fpTitle = document.createElement("span");
      fpTitle.id = "mo-fp-title";
      fpTitle.textContent = titleText;
      fpForm.parentNode.insertBefore(fpTitle, fpForm);

      /* Subtitle — read from platform's subtitle paragraph if present */
      var platformSubtitle = document.querySelector("p.text-muted");
      var subtitleText = platformSubtitle ? platformSubtitle.textContent.trim() : "";

      if (subtitleText) {
        var fpSub = document.createElement("span");
        fpSub.id = "mo-fp-subtitle";
        fpSub.textContent = subtitleText;
        fpForm.parentNode.insertBefore(fpSub, fpForm);
      }
    }

    /*
     * Email label — read from platform's own <label> so translated text is
     * preserved.  We restyle it via #mo-fp-lbl and add the required star.
     */
    var origLabel = fpForm.querySelector("label[for='emailAddress']") ||
                    fpForm.querySelector("label[for='username']") ||
                    document.getElementById("mo-fp-lbl");
    if (!origLabel) {
      origLabel = document.createElement("label");
      origLabel.setAttribute("for", emailInput.id);
      origLabel.id = "mo-fp-lbl";
      origLabel.innerHTML = ' <span class="mo-req">*</span>';
      emailInput.parentNode.insertBefore(origLabel, emailInput);
    } else if (origLabel.id !== "mo-fp-lbl") {
      var existingLblText = origLabel.textContent.trim();
      origLabel.id = "mo-fp-lbl"; origLabel.className = "";
      origLabel.innerHTML = existingLblText + ' <span class="mo-req" style="color:#e02020; margin-left:2px;">*</span>';
    }

    /* Do NOT overwrite placeholder — keep platform's translated placeholder */

    /* Helper text — this is custom copy not rendered by the platform, so it
       must stay in this file.  If localization of this text is needed in the
       future, it is the one place to add a translation map. */
    if (!document.getElementById("mo-fp-helper")) {
      var inputWrapper = emailInput.closest(".mb-3") || emailInput.closest(".username-custom") || emailInput.closest(".row");
      if (inputWrapper) {
        var helper = document.createElement("p");
        helper.id = "mo-fp-helper";
        helper.innerHTML =
          "Not receiving an email to reset your password? Then the e-mail address used is not known to us. Can\u2019t figure it out?<br>" +
          '<a href="mailto:support@example.com">Contact customer service</a>';
        inputWrapper.parentNode.insertBefore(helper, inputWrapper.nextSibling);
      }
    }

    /* Button text — keep platform's translated text; do not overwrite */
    /* (no assignment to fpBtn.innerHTML here) */

    /* Mark as done */
    var done = document.createElement("span");
    done.id = "mo-forgot-done"; done.style.display = "none";
    document.body.appendChild(done);
  }

  /* ── OTP VERIFY PAGE (/moas/idp/validatenextfactor) ── */
  function applyOtpPage() {
    if (!checkIsOtp()) return;

    /* CSS — inject once */
    if (!document.getElementById("mo-otp-css")) {
      var otpCss =
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

    /* DOM changes — only once */
    if (document.getElementById("mo-otp-done")) return;
    var otpInput = document.getElementById("otpToken");
    if (!otpInput) return;

    /*
     * OTP page title — read from the platform's .modal-title so the
     * translated text is used instead of hardcoding English.
     */
    var modalHeader = document.getElementById("modal-header-main");
    if (modalHeader && !document.getElementById("mo-otp-title")) {
      var platformModalTitle = modalHeader.querySelector(".modal-title");
      var otpTitleText = platformModalTitle ? platformModalTitle.textContent.trim() : "";
      var otpTitle = document.createElement("span");
      otpTitle.id = "mo-otp-title";
      otpTitle.textContent = otpTitleText;
      modalHeader.insertBefore(otpTitle, modalHeader.firstChild);
    }

    /*
     * OTP label — read from the platform's existing label for #otpToken.
     * Falls back to an empty label (styled via CSS) if none exists.
     */
    if (!document.getElementById("mo-otp-lbl")) {
      var platformOtpLbl = document.querySelector("label[for='otpToken']");
      var otpLblText = platformOtpLbl ? platformOtpLbl.textContent.trim() : "";
      var otpLbl = document.createElement("label");
      otpLbl.id = "mo-otp-lbl";
      otpLbl.setAttribute("for", "otpToken");
      otpLbl.innerHTML = otpLblText + ' <span class="mo-req">*</span>';
      otpInput.parentNode.insertBefore(otpLbl, otpInput);
      if (platformOtpLbl && platformOtpLbl !== otpLbl) {
        platformOtpLbl.style.display = "none";
      }
    }

    /* Do NOT overwrite placeholder — keep platform's translated placeholder */

    /* Verify and Cancel buttons — keep platform's translated text unchanged */

    /* Mark done */
    var otpDone = document.createElement("span");
    otpDone.id = "mo-otp-done"; otpDone.style.display = "none";
    document.body.appendChild(otpDone);
  }

  /* ── CHANGE PASSWORD PAGE (/moas/idp/changepassword) ── */
  function applyChangePasswordPage() {
    if (!checkIsChangePass()) return;

    /* CSS — inject once */
    if (!document.getElementById("mo-cp-css")) {
      var cpCss =
        "body,#login-body{background:#eef1f7!important;font-family:'Figtree',sans-serif!important;min-height:100vh!important;}" +
        "#login-header{display:none!important;}" +

        "#login-wrapper{" +
        "background:#fff!important;border:1px solid #e0e7ef!important;" +
        "border-radius:4px!important;box-shadow:0 2px 12px rgba(0,0,0,.08)!important;" +
        "padding:36px 40px 32px!important;max-width:560px!important;width:100%!important;" +
        "margin:40px auto!important;box-sizing:border-box!important;" +
        "}" +

        "#login-wrapper .login-header{" +
        "display:flex!important;justify-content:space-between!important;align-items:center!important;" +
        "font-family:'Figtree',sans-serif!important;font-size:24px!important;" +
        "font-weight:800!important;color:#0d1b2a!important;text-transform:uppercase!important;" +
        "letter-spacing:-.3px!important;margin-bottom:20px!important;text-align:left!important;" +
        "border:none!important;padding:0!important;" +
        "}" +

        "#login-wrapper hr{display:none!important;}" +

        "#passwordform .row,#userform .row{margin:0!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;}" +
        "#passwordform .col-md-5,#passwordform .col-md-8,#passwordform .offset-md-1,#passwordform .offset-md-2," +
        "#userform .col-xs-5,#userform .col-xs-offset-1,#userform .col-xs-10,#userform .col-xs-offset-2{" +
        "width:100%!important;max-width:100%!important;padding:0!important;margin:0!important;text-align:left!important;" +
        "}" +

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

        "#passwordform p.text-left,#userform span.align-items-left,#userform span.d-flex{" +
        "display:block!important;color:#3c515d!important;font-size:14px!important;" +
        "font-weight:700!important;font-family:'Figtree',sans-serif!important;" +
        "text-align:left!important;margin:0 0 6px 0!important;" +
        "}" +

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

        "#passwordform a.btn-link,#back-link{display:none!important;}";

      var cpSt = document.createElement("style");
      cpSt.id = "mo-cp-css"; cpSt.textContent = cpCss;
      document.head.appendChild(cpSt);
    }

    var fpForm = document.getElementById("passwordform") || document.getElementById("userform");
    if (!fpForm) return;

    var newPasswordInput = document.getElementById("newPassword") || fpForm.querySelector("input[name='password']");
    var confirmPasswordInput = document.getElementById("confirmPassword") || fpForm.querySelector("input[name='confirmPassword']");

    /*
     * Page title — keep the platform's .login-header text as-is (it is
     * already translated by the server).  We only append the close ✕ button
     * as a structural element; no text overwrite.
     */
    var h3 = document.querySelector(".login-header");
    if (h3 && !document.getElementById("mo-cp-close")) {
      /* Do NOT overwrite h3.textContent — preserve the platform's translation */
      var closeBtn = document.createElement("a");
      closeBtn.id = "mo-cp-close";
      closeBtn.href = "login";
      closeBtn.innerHTML = "&times;";
      closeBtn.style.color = "#a0aab6";
      closeBtn.style.textDecoration = "none";
      closeBtn.style.fontSize = "24px";
      closeBtn.style.fontWeight = "400";
      closeBtn.style.cursor = "pointer";
      closeBtn.style.lineHeight = "1";
      h3.appendChild(closeBtn);
    }

    /*
     * Password field labels — add the required-star span only; do NOT
     * replace the label text so the platform's translation is preserved.
     */
    var labelSelector = "#passwordform p.text-left, #userform span.align-items-left, #userform span.d-flex";
    document.querySelectorAll(labelSelector).forEach(function (p) {
      if (!p.querySelector(".mo-req")) {
        p.innerHTML = p.textContent.trim() + ' <span class="mo-req" style="color:#e02020; margin-left:2px;">*</span>';
      }
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

    /* Move requirements block below new password input */
    var newPasswordCol = newPasswordInput ? newPasswordInput.closest("div") : null;
    var requirementsBlock = document.querySelector(".password-padding");
    if (newPasswordCol && requirementsBlock && requirementsBlock.previousSibling !== newPasswordCol) {
      newPasswordCol.parentNode.insertBefore(requirementsBlock, newPasswordCol.nextSibling);
    }

    /*
     * Strength meter — this widget is entirely custom (not rendered by the
     * platform), so its labels are the one place where we keep injected
     * strings.  If Arabic support for these labels is needed later, add a
     * small translation map here only.
     */
    if (requirementsBlock && !document.getElementById("mo-strength-container")) {
      var strengthContainer = document.createElement("div");
      strengthContainer.id = "mo-strength-container";
      strengthContainer.style.width = "100%";
      strengthContainer.style.boxSizing = "border-box";
      strengthContainer.innerHTML =
        '<div style="display:flex; justify-content:space-between; align-items:center; margin: 16px 0 6px 0; width:100%;">' +
        '<span id="mo-strength-label" style="font-family:\'Figtree\',sans-serif; font-size:13px; font-weight:700; color:#3c515d;">Password strength</span>' +
        '<span id="mo-strength-value" style="font-family:\'Figtree\',sans-serif; font-size:13px; font-weight:700; color:#a0aab6;">Weak</span>' +
        '</div>' +
        '<div id="mo-strength-bar-wrap" style="height:4px; background:#e0e7ef; border-radius:2px; overflow:hidden; width:100%;">' +
        '<div id="mo-strength-bar-fill" style="height:100%; width:0%; background:#e0e7ef; transition: width 0.3s ease, background-color 0.3s ease;"></div>' +
        '</div>';
      requirementsBlock.appendChild(strengthContainer);
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
          strengthValue.textContent = "Weak";
          strengthValue.style.color = "#a0aab6";
          strengthFill.style.width = "0%";
          strengthFill.style.backgroundColor = "#e0e7ef";
        } else {
          var pct = Math.round((score / totalRules) * 100);
          strengthFill.style.width = pct + "%";

          if (pct < 40) {
            strengthValue.textContent = "Weak";
            strengthValue.style.color = "#e02020";
            strengthFill.style.backgroundColor = "#e02020";
          } else if (pct < 70) {
            strengthValue.textContent = "Medium";
            strengthValue.style.color = "#ff9800";
            strengthFill.style.backgroundColor = "#ff9800";
          } else if (pct < 100) {
            strengthValue.textContent = "Strong";
            strengthValue.style.color = "#0A55D7";
            strengthFill.style.backgroundColor = "#0A55D7";
          } else {
            strengthValue.textContent = "Sufficient";
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

    /* Submit button — keep platform's translated text unchanged */

    /* Disable native HTML5 validation bubbles */
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

    /* Shift the error display container (#pwd_strength) below confirm input */
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

    /*
     * Custom submit validation — error messages are injected by this script
     * (the platform does not render them).  These are the only strings that
     * genuinely cannot come from the platform.  Add a translation map here
     * if Arabic error messages are required in the future.
     */
    if (form && !form.dataset.moValidationBound) {
      form.dataset.moValidationBound = "true";
      form.addEventListener("submit", function (e) {
        var val = newPasswordInput ? newPasswordInput.value : "";
        var confirmVal = confirmPasswordInput ? confirmPasswordInput.value : "";
        var pwdStrengthDiv = document.getElementById("pwd_strength");

        if (!val) {
          e.preventDefault();
          if (pwdStrengthDiv) {
            pwdStrengthDiv.innerHTML = "<font style='color:rgb(239, 47, 47);'>New password is required.</font>";
          }
          if (newPasswordInput) newPasswordInput.focus();
          return;
        }

        var invalidItems = document.querySelectorAll("#listcontent li.mo-invalid");
        if (invalidItems.length > 0) {
          e.preventDefault();
          if (pwdStrengthDiv) {
            pwdStrengthDiv.innerHTML = "<font style='color:rgb(239, 47, 47);'>Please satisfy all password requirements.</font>";
          }
          if (newPasswordInput) newPasswordInput.focus();
          return;
        }

        if (val !== confirmVal) {
          e.preventDefault();
          if (pwdStrengthDiv) {
            pwdStrengthDiv.innerHTML = "<font style='color:rgb(239, 47, 47);'>The two passwords must match.</font>";
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
