(function () {
  "use strict";

  /* ── PAGE DETECTION HELPERS ── */
  function checkIsLogin() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf("moas/redirecttoidplogin") !== -1) {
      return false;
    }
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

  function checkIsRedirectToIdp() {
    var path = window.location.pathname.toLowerCase();
    if (path.indexOf("moas/redirecttoidplogin") !== -1) {
      return true;
    }
    // Exclude standard login pages explicitly
    if (path.indexOf("/moas/login") !== -1 || path.indexOf("/moas/idp/userlogin") !== -1) {
      return false;
    }
    if (document.getElementById("enduserloginform") || document.getElementById("idploginform")) {
      return false;
    }
    var form = document.querySelector("form[action*='idplogin']");
    if (form && document.getElementById("username") && document.getElementById("plaintextPassword")) {
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
        "}" +

        /* Input Error Styling */
        ".mo-input-error { border-color: #ef2f2f!important; }" +
        ".mo-input-error:focus { box-shadow: 0 0 0 3px rgba(239, 47, 47, .12)!important; }" +
        ".mo-error-text { color: #ef2f2f; font-size: 13px; font-weight: 500; margin-top: 6px; text-align: left; display: block; font-family: 'Figtree', sans-serif; }" +
        "[dir='rtl'] .mo-error-text { text-align: right!important; }" +
        ".mo-error-icon { position: absolute; right: 12px; display: flex; align-items: center; pointer-events: none; color: #ef2f2f; }" +
        ".mo-error-icon svg { width: 18px; height: 18px; fill: currentColor; }" +
        ".mo-input-error { padding-right: 40px!important; }" +
        "[dir='rtl'] .mo-error-icon { right: auto!important; left: 12px!important; }" +
        "[dir='rtl'] .mo-input-error { padding-right: 12px!important; padding-left: 40px!important; }" +
        ".mo-pw-wrap .mo-error-icon { right: 36px!important; }" +
        "[dir='rtl'] .mo-pw-wrap .mo-error-icon { right: auto!important; left: 36px!important; }";

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
    if (!document.getElementById("mo-title")) {
      var t = document.createElement("span");
      t.id = "mo-title"; t.textContent = "LOG IN";
      wrapper.insertBefore(t, wrapper.firstChild);
    }

    /* Email label above the username input */
    var userDiv = document.getElementById("userName");
    if (userDiv && !document.getElementById("mo-email-lbl")) {
      var fg = document.createElement("div"); fg.className = "mo-fg";
      var lbl = document.createElement("label");
      lbl.id = "mo-email-lbl"; lbl.className = "mo-lbl";
      lbl.setAttribute("for", "username");
      lbl.innerHTML = 'Email address <span class="mo-req">*</span>';
      fg.appendChild(lbl);
      userDiv.parentNode.insertBefore(fg, userDiv);
      fg.appendChild(userDiv);
      var inp = document.getElementById("username");
      if (inp) inp.setAttribute("placeholder", "email");
    }

    /* Button label */
    var btn = document.getElementById("loginbutton");
    if (btn && !btn.dataset.mo) {
      btn.value = "LOG IN \u2192";
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

    /* LOG IN title — insert once before any form child */
    var wrapper = document.getElementById("login-wrapper");
    if (wrapper && !document.getElementById("mo-title")) {
      var t = document.createElement("span");
      t.id = "mo-title"; t.textContent = "LOG IN";
      wrapper.insertBefore(t, wrapper.firstChild);
    }

    /* Button label */
    var btn = document.getElementById("loginbutton");
    if (btn && btn.value !== "LOG IN \u2192") {
      btn.value = "LOG IN \u2192";
    }

    if (document.getElementById("mo-pw-lbl")) return; // already applied

    /* Password label above #plaintextPassword */
    var pwLbl = document.createElement("label");
    pwLbl.id = "mo-pw-lbl"; pwLbl.className = "mo-lbl";
    pwLbl.setAttribute("for", "plaintextPassword");
    pwLbl.innerHTML = 'Password <span class="mo-req">*</span>';
    pwField.parentNode.insertBefore(pwLbl, pwField);

    /* Show read-only username above password field */
    if (!document.getElementById("mo-user-display")) {
      var usernameVal = "";
      var unInp = document.getElementById("username");
      if (unInp && unInp.value) usernameVal = unInp.value;
      if (!usernameVal && dynUser) usernameVal = dynUser.textContent.trim();
      if (usernameVal) {
        var userFg = document.createElement("div"); userFg.className = "mo-fg";
        var userLbl = document.createElement("label"); userLbl.className = "mo-lbl";
        userLbl.textContent = "Email address";
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

    /* Forgot password link only (no Remember me checkbox) */
    if (!document.getElementById("mo-bottom")) {
      var row = document.createElement("div"); row.id = "mo-bottom";
      var fl = document.createElement("a"); fl.id = "mo-forgot";
      fl.href = getForgotHref(); fl.textContent = "Forgot password";
      row.appendChild(fl);
      wrap.parentNode.insertBefore(row, wrap.nextSibling);
    }

    /* Disable browser default validation bubbles/hovers */
    var form = document.getElementById("enduserloginform") || document.getElementById("idploginform");
    if (form) {
      form.setAttribute("novalidate", "true");
      
      /* Bind custom empty check on form submit */
      if (!form.dataset.moLoginValidationBound) {
        form.dataset.moLoginValidationBound = "true";
        form.addEventListener("submit", function (e) {
          var pwField = document.getElementById("plaintextPassword");
          // Validate password field only when it is visible/active
          if (pwField && pwField.style.display !== "none" && !pwField.classList.contains("d-none")) {
            var val = pwField.value.trim();
            if (!val) {
              e.preventDefault();
              
              // Remove old error
              pwField.classList.remove("mo-input-error");
              var wrap = pwField.closest(".mo-pw-wrap");
              if (wrap) {
                var ico = wrap.querySelector(".mo-error-icon");
                if (ico) ico.remove();
              }
              var msg = document.getElementById("mo-pw-error-msg");
              if (msg) msg.remove();

              // Apply custom error
              pwField.classList.add("mo-input-error");
              if (wrap && !wrap.querySelector(".mo-error-icon")) {
                var icon = document.createElement("span");
                icon.className = "mo-error-icon";
                icon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
                wrap.appendChild(icon);
              }

              var errorMsg = document.createElement("span");
              errorMsg.id = "mo-pw-error-msg";
              errorMsg.className = "mo-error-text";
              errorMsg.textContent = "Password is required.";
              
              var insertTarget = wrap || pwField;
              insertTarget.parentNode.insertBefore(errorMsg, insertTarget.nextSibling);
              
              pwField.focus();
            }
          }
        });
      }
    }

    /* Bind dynamic input listener to clear the error state */
    if (!pwField.dataset.moListener) {
      pwField.dataset.moListener = "true";
      pwField.addEventListener("input", function () {
        pwField.classList.remove("mo-input-error");
        var wrap = pwField.closest(".mo-pw-wrap");
        if (wrap) {
          var ico = wrap.querySelector(".mo-error-icon");
          if (ico) ico.remove();
        }
        var msg = document.getElementById("mo-pw-error-msg");
        if (msg) msg.remove();
      });
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

  /* ── LOGIN ERROR HANDLER ── */
  function handleLoginErrors() {
    var feedbackEl = document.getElementById("feedback-msg");
    var userErrorEl = document.getElementById("username-error");
    var errorText = "";

    if (feedbackEl && feedbackEl.textContent.trim()) {
      errorText = feedbackEl.textContent.trim();
    } else if (userErrorEl && userErrorEl.textContent.trim()) {
      errorText = userErrorEl.textContent.trim();
    }

    // Clean existing styled error indicators
    document.querySelectorAll(".mo-input-error").forEach(function (inp) {
      inp.classList.remove("mo-input-error");
    });
    document.querySelectorAll(".mo-error-icon").forEach(function (ico) {
      ico.remove();
    });
    document.querySelectorAll(".mo-error-text").forEach(function (txt) {
      txt.remove();
    });

    if (!errorText) return;

    var isLogin = checkIsLogin();
    if (!isLogin) return;

    var pwField = document.getElementById("plaintextPassword");
    var isPasswordStep = pwField && pwField.style.display !== "none" && !pwField.classList.contains("d-none");

    if (isPasswordStep) {
      var input = document.getElementById("plaintextPassword");
      if (input) {
        input.classList.add("mo-input-error");
        var wrap = input.closest(".mo-pw-wrap");
        if (wrap && !wrap.querySelector(".mo-error-icon")) {
          var icon = document.createElement("span");
          icon.className = "mo-error-icon";
          icon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
          wrap.appendChild(icon);
        }
        var errorMsgId = "mo-pw-error-msg";
        var errorMsg = document.getElementById(errorMsgId);
        if (!errorMsg) {
          errorMsg = document.createElement("span");
          errorMsg.id = errorMsgId;
          errorMsg.className = "mo-error-text";
          var insertTarget = wrap || input;
          insertTarget.parentNode.insertBefore(errorMsg, insertTarget.nextSibling);
        }
        errorMsg.textContent = errorText;
      }
    } else {
      var input = document.getElementById("username");
      if (input) {
        input.classList.add("mo-input-error");
        var wrap = input.parentNode;
        if (wrap.className !== "mo-input-wrap") {
          wrap = document.createElement("div");
          wrap.className = "mo-input-wrap";
          wrap.style.position = "relative";
          wrap.style.display = "flex";
          wrap.style.alignItems = "center";
          wrap.style.width = "100%";
          input.parentNode.insertBefore(wrap, input);
          wrap.appendChild(input);
        }
        if (wrap && !wrap.querySelector(".mo-error-icon")) {
          var icon = document.createElement("span");
          icon.className = "mo-error-icon";
          icon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
          wrap.appendChild(icon);
        }
        var errorMsgId = "mo-email-error-msg";
        var errorMsg = document.getElementById(errorMsgId);
        if (!errorMsg) {
          errorMsg = document.createElement("span");
          errorMsg.id = errorMsgId;
          errorMsg.className = "mo-error-text";
          wrap.parentNode.insertBefore(errorMsg, wrap.nextSibling);
        }
        errorMsg.textContent = errorText;
      }
    }
  }

  /* ── REDIRECT TO IDP LOGIN PAGE (/moas/redirecttoidplogin) ── */
  function showRedirectError(fieldId, msg) {
    var input = document.getElementById(fieldId);
    if (!input) return;
    input.classList.add("mo-input-error");
    var wrap = input.closest(".mo-pw-wrap") || input.closest(".mo-input-wrap") || input.parentNode;
    if (wrap && !wrap.querySelector(".mo-error-icon")) {
      var icon = document.createElement("span");
      icon.className = "mo-error-icon";
      icon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
      wrap.appendChild(icon);
    }
    
    var errorMsgId = "mo-" + fieldId + "-error-msg";
    var errorMsg = document.getElementById(errorMsgId);
    if (!errorMsg) {
      errorMsg = document.createElement("span");
      errorMsg.id = errorMsgId;
      errorMsg.className = "mo-error-text";
      var insertTarget = wrap || input;
      insertTarget.parentNode.insertBefore(errorMsg, insertTarget.nextSibling);
    }
    errorMsg.textContent = msg;
  }

  function clearRedirectError(fieldId) {
    var input = document.getElementById(fieldId);
    if (!input) return;
    input.classList.remove("mo-input-error");
    var wrap = input.closest(".mo-pw-wrap") || input.closest(".mo-input-wrap") || input.parentNode;
    if (wrap) {
      var icon = wrap.querySelector(".mo-error-icon");
      if (icon) icon.remove();
    }
    var errorMsgId = "mo-" + fieldId + "-error-msg";
    var errorMsg = document.getElementById(errorMsgId);
    if (errorMsg) errorMsg.remove();
  }

  function applyRedirectToIdpLogin() {
    var wrapper = document.getElementById("login-wrapper");
    if (!wrapper) return;

    var form = wrapper.querySelector("form");
    if (!form) return;

    var oldHeader = wrapper.querySelector(".login-header");
    if (oldHeader) oldHeader.style.display = "none";
    var hr = wrapper.querySelector("hr");
    if (hr) hr.style.display = "none";

    if (!document.getElementById("mo-title")) {
      var t = document.createElement("span");
      t.id = "mo-title"; 
      t.textContent = "LOG IN";
      wrapper.insertBefore(t, wrapper.firstChild);
    }

    form.setAttribute("novalidate", "true");
    form.style.alignItems = "stretch";
    form.classList.remove("align-items-center");

    wrapper.querySelectorAll(".row.w-75, .row").forEach(function (row) {
      row.style.width = "100%";
      row.style.maxWidth = "100%";
      row.style.paddingLeft = "0";
      row.style.paddingRight = "0";
      row.style.marginLeft = "0";
      row.style.marginRight = "0";
    });

    form.querySelectorAll("br").forEach(function (br) {
      br.style.display = "none";
    });

    var usernameInput = document.getElementById("username");
    if (usernameInput && !document.getElementById("mo-email-lbl")) {
      var emailFg = document.createElement("div");
      emailFg.className = "mo-fg";
      
      var emailLbl = document.createElement("label");
      emailLbl.id = "mo-email-lbl";
      emailLbl.className = "mo-lbl";
      emailLbl.setAttribute("for", "username");
      emailLbl.innerHTML = 'Email address <span class="mo-req">*</span>';
      
      var emailWrap = document.createElement("div");
      emailWrap.className = "mo-input-wrap";
      emailWrap.style.position = "relative";
      emailWrap.style.display = "flex";
      emailWrap.style.alignItems = "center";
      emailWrap.style.width = "100%";

      if (usernameInput.parentNode) {
        usernameInput.parentNode.insertBefore(emailWrap, usernameInput);
      }
      emailWrap.appendChild(usernameInput);

      emailFg.appendChild(emailLbl);
      emailFg.appendChild(emailWrap);
      
      form.insertBefore(emailFg, form.querySelector(".row") || form.firstChild);
      
      usernameInput.setAttribute("placeholder", "email");
      
      usernameInput.addEventListener("input", function () {
        clearRedirectError("username");
      });
    }

    var pwField = document.getElementById("plaintextPassword");
    if (pwField && !document.getElementById("mo-pw-lbl")) {
      var pwFg = document.createElement("div");
      pwFg.className = "mo-fg";
      
      var pwLbl = document.createElement("label");
      pwLbl.id = "mo-pw-lbl";
      pwLbl.className = "mo-lbl";
      pwLbl.setAttribute("for", "plaintextPassword");
      pwLbl.innerHTML = 'Password <span class="mo-req">*</span>';
      
      var pwWrap = document.createElement("div");
      pwWrap.className = "mo-pw-wrap";

      if (pwField.parentNode) {
        pwField.parentNode.insertBefore(pwWrap, pwField);
      }
      pwWrap.appendChild(pwField);
      
      pwFg.appendChild(pwLbl);
      pwFg.appendChild(pwWrap);
      
      var emailFg = document.getElementById("mo-email-lbl") ? document.getElementById("mo-email-lbl").parentNode : null;
      if (emailFg && emailFg.parentNode) {
        emailFg.parentNode.insertBefore(pwFg, emailFg.nextSibling);
      } else if (pwField.parentNode) {
        form.insertBefore(pwFg, pwField.parentNode);
      } else {
        form.appendChild(pwFg);
      }

      pwField.setAttribute("placeholder", "Password");

      var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
      var EYE_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
      var eyeBtn = document.createElement("button");
      eyeBtn.type = "button";
      eyeBtn.className = "mo-eye";
      eyeBtn.setAttribute("aria-label", "Toggle password visibility");
      eyeBtn.innerHTML = EYE_OFF;
      eyeBtn.addEventListener("click", function () {
        var show = pwField.type === "password";
        pwField.type = show ? "text" : "password";
        eyeBtn.innerHTML = show ? EYE_ON : EYE_OFF;
      });
      pwWrap.appendChild(eyeBtn);

      pwField.addEventListener("input", function () {
        clearRedirectError("plaintextPassword");
      });
    }

    var forgotDiv = document.getElementById("forgotPasswordUrl");
    if (forgotDiv) forgotDiv.style.display = "none";

    if (!document.getElementById("mo-bottom-redirect")) {
      var bottomRow = document.createElement("div");
      bottomRow.id = "mo-bottom-redirect";
      bottomRow.style.display = "flex";
      bottomRow.style.alignItems = "center";
      bottomRow.style.justifyContent = "space-between";
      bottomRow.style.margin = "16px 0 20px";
      bottomRow.style.width = "100%";

      var remWrap = document.createElement("label");
      remWrap.style.display = "inline-flex";
      remWrap.style.alignItems = "center";
      remWrap.style.gap = "8px";
      remWrap.style.cursor = "pointer";
      remWrap.style.fontSize = "14px";
      remWrap.style.color = "#3c515d";
      remWrap.style.fontFamily = "'Figtree', sans-serif";

      var remChk = document.createElement("input");
      remChk.type = "checkbox";
      remChk.name = "rememberme";
      remChk.style.width = "16px";
      remChk.style.height = "16px";
      remChk.style.border = "1px solid #C1CFD7";
      remChk.style.borderRadius = "2px";
      remChk.style.cursor = "pointer";
      
      remWrap.appendChild(remChk);
      remWrap.appendChild(document.createTextNode("Remember me"));

      var forgotLink = document.createElement("a");
      forgotLink.id = "mo-forgot-redirect";
      forgotLink.href = getForgotHref();
      forgotLink.textContent = "Forgot password";
      forgotLink.style.fontSize = "13px";
      forgotLink.style.fontWeight = "500";
      forgotLink.style.color = "#0A55D7";
      forgotLink.style.textDecoration = "none";
      forgotLink.style.fontFamily = "'Figtree', sans-serif";
      forgotLink.addEventListener("mouseover", function () {
        forgotLink.style.textDecoration = "underline";
      });
      forgotLink.addEventListener("mouseout", function () {
        forgotLink.style.textDecoration = "none";
      });

      bottomRow.appendChild(remWrap);
      bottomRow.appendChild(forgotLink);

      var btn = document.getElementById("loginbutton");
      if (btn) {
        var btnRow = btn.closest(".row");
        if (btnRow && btnRow.parentNode) {
          btnRow.parentNode.insertBefore(bottomRow, btnRow);
        }
      }
    }

    var btn = document.getElementById("loginbutton");
    if (btn) {
      if (btn.value !== "LOG IN \u2192") {
        btn.value = "LOG IN \u2192";
      }
      btn.style.backgroundColor = "#0A55D7";
      btn.style.borderColor = "#0A55D7";
      btn.classList.add("mo-btn-primary");
      btn.style.width = "auto";
      
      var btnRow = btn.closest(".row");
      if (btnRow) {
        btnRow.style.textAlign = "left";
        var btnCol = btn.parentNode;
        if (btnCol) {
          btnCol.style.textAlign = "left";
          btnCol.style.display = "block";
        }
      }
    }

    if (form && !form.dataset.moRedirectValidationBound) {
      form.dataset.moRedirectValidationBound = "true";
      form.addEventListener("submit", function (e) {
        var emailVal = usernameInput ? usernameInput.value.trim() : "";
        var passVal = pwField ? pwField.value.trim() : "";
        var hasError = false;

        clearRedirectError("username");
        clearRedirectError("plaintextPassword");

        if (!emailVal) {
          e.preventDefault();
          showRedirectError("username", "Email address is required.");
          hasError = true;
        }

        if (!passVal) {
          e.preventDefault();
          showRedirectError("plaintextPassword", "Password is required.");
          hasError = true;
        }

        if (hasError) {
          if (!emailVal && usernameInput) {
            usernameInput.focus();
          } else if (!passVal && pwField) {
            pwField.focus();
          }
        }
      });
    }

    var feedbackEl = document.getElementById("feedback-msg");
    var userErrorEl = document.getElementById("username-error");
    var errorAlertEl = document.getElementById("error-alert-message");
    var errorText = "";

    if (feedbackEl && feedbackEl.textContent.trim()) {
      errorText = feedbackEl.textContent.trim();
      feedbackEl.style.display = "none";
    } else if (userErrorEl && userErrorEl.textContent.trim()) {
      errorText = userErrorEl.textContent.trim();
      userErrorEl.style.display = "none";
    } else if (errorAlertEl && errorAlertEl.textContent.trim()) {
      var errSpan = errorAlertEl.querySelector(".errorMessage li span") || errorAlertEl.querySelector(".errorMessage span") || errorAlertEl;
      errorText = errSpan.textContent.trim();
      if (errorText.indexOf("Close") === 0) {
        errorText = errorText.replace(/^Close\s*/i, "").trim();
      }
      errorAlertEl.style.display = "none";
    }

    if (errorText) {
      if (errorText.toLowerCase().indexOf("email") !== -1 || 
          errorText.toLowerCase().indexOf("username") !== -1 || 
          errorText.toLowerCase().indexOf("account") !== -1 || 
          errorText.toLowerCase().indexOf("user") !== -1) {
        showRedirectError("username", errorText);
      } else {
        showRedirectError("plaintextPassword", errorText);
      }
    }
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
        "width:100%!important;max-  width:100%!important;margin:0 auto!important;padding:24px 16px!important;" +
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

    /* ── DOM injection — only once ── */
    if (document.getElementById("mo-forgot-done")) return;

    /* Find the form element */
    var fpForm = emailInput.closest("form");
    if (!fpForm) return;

    /* Insert RESET PASSWORD title + subtitle before the form */
    if (!document.getElementById("mo-fp-title")) {
      var fpTitle = document.createElement("span");
      fpTitle.id = "mo-fp-title"; fpTitle.textContent = "RESET PASSWORD";
      fpForm.parentNode.insertBefore(fpTitle, fpForm);

      var fpSub = document.createElement("span");
      fpSub.id = "mo-fp-subtitle";
      fpSub.textContent = "We will send you an email with instructions on how to recover it";
      fpForm.parentNode.insertBefore(fpSub, fpForm);
    }

    /* Replace/create label text */
    var origLabel = fpForm.querySelector("label[for='emailAddress']") || fpForm.querySelector("label[for='username']") || document.getElementById("mo-fp-lbl");
    if (!origLabel) {
      origLabel = document.createElement("label");
      origLabel.setAttribute("for", emailInput.id);
      origLabel.id = "mo-fp-lbl";
      origLabel.innerHTML = 'Email address <span class="mo-req">*</span>';
      emailInput.parentNode.insertBefore(origLabel, emailInput);
    } else if (origLabel.id !== "mo-fp-lbl") {
      origLabel.id = "mo-fp-lbl"; origLabel.className = "";
      origLabel.innerHTML = 'Email address <span class="mo-req">*</span>';
    }

    /* Fix input placeholder */
    emailInput.setAttribute("placeholder", "email");

    /* Insert helper text after the input wrapper (once) */
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

    /* Change button text to NEXT → */
    var fpBtn = fpForm.querySelector("button") || fpForm.querySelector("input[type='submit']");
    if (fpBtn && fpBtn.textContent.trim().indexOf("NEXT") === -1) {
      fpBtn.innerHTML = 'NEXT <span style="margin-left: 6px;">&rarr;</span>';
    }

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

    /* DOM changes — only once */
    if (document.getElementById("mo-otp-done")) return;
    var otpInput = document.getElementById("otpToken");
    if (!otpInput) return;

    /* VERIFY YOUR IDENTITY title */
    var modalHeader = document.getElementById("modal-header-main");
    if (modalHeader && !document.getElementById("mo-otp-title")) {
      var otpTitle = document.createElement("span");
      otpTitle.id = "mo-otp-title";
      otpTitle.textContent = "VERIFY YOUR IDENTITY";
      modalHeader.insertBefore(otpTitle, modalHeader.firstChild);
    }

    /* Label above OTP input */
    if (!document.getElementById("mo-otp-lbl")) {
      var otpLbl = document.createElement("label");
      otpLbl.id = "mo-otp-lbl";
      otpLbl.setAttribute("for", "otpToken");
      otpLbl.innerHTML = 'Enter OTP here <span class="mo-req">*</span>';
      otpInput.parentNode.insertBefore(otpLbl, otpInput);
    }

    /* Placeholder */
    otpInput.setAttribute("placeholder", "OTP number");

    /* Verify button */
    var verifyBtn = document.getElementById("validate");
    if (verifyBtn) verifyBtn.value = "VERIFY \u2192";

    /* Cancel button */
    var cancelBtn = document.querySelector(".btn-cancel");
    if (cancelBtn) cancelBtn.textContent = "CANCEL";

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

        /* Hide line separators and old alert box */
        "#login-wrapper hr,.password-padding{display:none!important;}" +

        /* Form stack */
        "#passwordform .row,#userform .row{margin:0!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;}" +
        "#passwordform .col-md-5,#passwordform .col-md-8,#passwordform .offset-md-1,#passwordform .offset-md-2," +
        "#userform .col-xs-5,#userform .col-xs-offset-1,#userform .col-xs-10,#userform .col-xs-offset-2{" +
        "width:100%!important;max-width:100%!important;padding:0!important;margin:0!important;text-align:left!important;" +
        "}" +

        /* Style label/text above inputs */
        "#passwordform p.text-left,#userform span.align-items-left,#userform span.d-flex{" +
        "display:block!important;color:#3c515d!important;font-size:14px!important;" +
        "font-weight:700!important;font-family:'Figtree',sans-serif!important;" +
        "text-align:left!important;margin:0 0 6px 0!important;" +
        "}" +

        /* Password Wrapper for eye toggle */
        ".mo-pw-wrap{" +
        "position:relative!important;display:flex!important;align-items:center!important;width:100%!important;margin-bottom:16px!important;" +
        "}" +

        /* Style inputs */
        "#newPassword,#confirmPassword,#password,#userform input[type='password']{" +
        "height:40px!important;border:1px solid #C1CFD7!important;border-radius:4px!important;" +
        "padding:0 42px 0 12px!important;font-size:14px!important;font-family:'Figtree',sans-serif!important;" +
        "color:#000933!important;background:#fff!important;width:100%!important;" +
        "box-shadow:none!important;outline:none!important;box-sizing:border-box!important;" +
        "margin-bottom:0!important;display:block!important;" +
        "}" +
        "#newPassword:focus,#confirmPassword:focus,#password:focus,#userform input[type='password']:focus{" +
        "border-color:#0A55D7!important;box-shadow:0 0 0 3px rgba(10,85,215,.12)!important;" +
        "}" +

        /* Padding adjustment for error + eye toggle icons */
        ".mo-pw-wrap .mo-input-error{padding-right:64px!important;}" +
        "[dir='rtl'] .mo-pw-wrap .mo-input-error{padding-right:12px!important;padding-left:64px!important;}" +

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

    /* Update title to RESET PASSWORD with close x button */
    var h3 = document.querySelector(".login-header");
    if (h3) {
      var titleTextNode = null;
      for (var i = 0; i < h3.childNodes.length; i++) {
        var node = h3.childNodes[i];
        if (node.nodeType === 3) {
          titleTextNode = node;
          break;
        }
      }
      if (titleTextNode) {
        titleTextNode.nodeValue = "RESET PASSWORD";
      } else {
        h3.insertBefore(document.createTextNode("RESET PASSWORD"), h3.firstChild);
      }

      if (!document.getElementById("mo-cp-close")) {
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
    }

    /* Add * to labels */
    var labelSelector = "#passwordform p.text-left, #userform span.align-items-left, #userform span.d-flex";
    document.querySelectorAll(labelSelector).forEach(function (p) {
      var t = p.textContent.trim();
      if (t.toLowerCase().indexOf("new password") !== -1 && !p.querySelector(".mo-req")) {
        p.innerHTML = 'New password <span class="mo-req" style="color:#e02020; margin-left:2px;">*</span>';
      } else if (t.toLowerCase().indexOf("confirm password") !== -1 && !p.querySelector(".mo-req")) {
        p.innerHTML = 'Confirm password <span class="mo-req" style="color:#e02020; margin-left:2px;">*</span>';
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

    /* Move requirements block below new password input (above confirm password input) */
    var newPasswordCol = newPasswordInput ? newPasswordInput.closest("div") : null;
    var requirementsBlock = document.querySelector(".password-padding");
    if (newPasswordCol && requirementsBlock && requirementsBlock.previousSibling !== newPasswordCol) {
      newPasswordCol.parentNode.insertBefore(requirementsBlock, newPasswordCol.nextSibling);
    }

    /* Wrap new password in .mo-pw-wrap for eye toggle */
    if (newPasswordInput && !newPasswordInput.parentNode.classList.contains("mo-pw-wrap")) {
      var wrap = document.createElement("div");
      wrap.className = "mo-pw-wrap";
      newPasswordInput.parentNode.insertBefore(wrap, newPasswordInput);
      wrap.appendChild(newPasswordInput);
      newPasswordInput.setAttribute("placeholder", "Password");

      // Append eye toggle
      var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
      var EYE_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
      var eyeBtn = document.createElement("button");
      eyeBtn.type = "button"; eyeBtn.className = "mo-eye";
      eyeBtn.setAttribute("aria-label", "Toggle password visibility");
      eyeBtn.innerHTML = EYE_OFF;
      eyeBtn.addEventListener("click", function () {
        var show = newPasswordInput.type === "password";
        newPasswordInput.type = show ? "text" : "password";
        eyeBtn.innerHTML = show ? EYE_ON : EYE_OFF;
      });
      wrap.appendChild(eyeBtn);
    }

    /* Wrap confirm password in .mo-pw-wrap for eye toggle */
    if (confirmPasswordInput && !confirmPasswordInput.parentNode.classList.contains("mo-pw-wrap")) {
      var wrap = document.createElement("div");
      wrap.className = "mo-pw-wrap";
      confirmPasswordInput.parentNode.insertBefore(wrap, confirmPasswordInput);
      wrap.appendChild(confirmPasswordInput);
      confirmPasswordInput.setAttribute("placeholder", "Password");

      // Append eye toggle
      var EYE_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
      var EYE_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
      var eyeBtn = document.createElement("button");
      eyeBtn.type = "button"; eyeBtn.className = "mo-eye";
      eyeBtn.setAttribute("aria-label", "Toggle password visibility");
      eyeBtn.innerHTML = EYE_OFF;
      eyeBtn.addEventListener("click", function () {
        var show = confirmPasswordInput.type === "password";
        confirmPasswordInput.type = show ? "text" : "password";
        eyeBtn.innerHTML = show ? EYE_ON : EYE_OFF;
      });
      wrap.appendChild(eyeBtn);
    }

    /* Helper text and Error message injection */
    var newPasswordWrap = newPasswordInput ? newPasswordInput.closest(".mo-pw-wrap") : null;
    if (newPasswordWrap && !document.getElementById("mo-cp-helper-text")) {
      // Error text container
      var errorText = document.createElement("div");
      errorText.id = "mo-cp-error-text";
      errorText.className = "mo-error-text";
      errorText.style.fontFamily = "'Figtree', sans-serif";
      errorText.style.fontSize = "12px";
      errorText.style.color = "#ef2f2f";
      errorText.style.lineHeight = "1.5";
      errorText.style.marginTop = "-10px";
      errorText.style.marginBottom = "16px";
      errorText.style.textAlign = "left";
      errorText.style.display = "none";

      // Helper text
      var helper = document.createElement("div");
      helper.id = "mo-cp-helper-text";
      helper.style.fontFamily = "'Figtree', sans-serif";
      helper.style.fontSize = "12px";
      helper.style.color = "#6b7a8d";
      helper.style.lineHeight = "1.5";
      helper.style.marginTop = "-10px";
      helper.style.marginBottom = "16px";
      helper.style.textAlign = "left";
      helper.style.display = "block";
      helper.textContent = "8–50 characters, including 1 uppercase, 1 number, and 1 symbol (!@#$.%^&*_-). Must not contain more than 2 consecutive characters from your name, username, or email.";

      newPasswordWrap.parentNode.insertBefore(errorText, newPasswordWrap.nextSibling);
      newPasswordWrap.parentNode.insertBefore(helper, newPasswordWrap.nextSibling);
    }

    /* Dynamic Validation Function (keeps list updated behind the scenes for validation checks) */
    function updatePasswordRequirementsAndStrength() {
      if (!newPasswordInput) return;
      var val = newPasswordInput.value || "";

      var listItems = document.querySelectorAll("#listcontent li");
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
        } else {
          li.classList.add("mo-invalid");
          li.classList.remove("mo-valid");
        }
      });
    }

    /* Bind events for dynamic updates */
    if (newPasswordInput && !newPasswordInput.dataset.moListener) {
      newPasswordInput.dataset.moListener = "true";
      newPasswordInput.addEventListener("input", updatePasswordRequirementsAndStrength);
      newPasswordInput.addEventListener("input", clearCpError);
      updatePasswordRequirementsAndStrength();
    }
    if (confirmPasswordInput && !confirmPasswordInput.dataset.moListener) {
      confirmPasswordInput.dataset.moListener = "true";
      confirmPasswordInput.addEventListener("input", clearCpError);
    }

    /* Update button text to NEXT → */
    var saveBtn = document.getElementById("validate") || document.getElementById("submit");
    if (saveBtn) {
      if (saveBtn.tagName === "INPUT") {
        saveBtn.value = "NEXT \u2192";
      } else {
        saveBtn.innerHTML = 'NEXT <span style="margin-left: 6px;">&rarr;</span>';
      }
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

    /* Hide original error container #pwd_strength */
    var pwdStrengthDiv = document.getElementById("pwd_strength");
    if (pwdStrengthDiv) {
      pwdStrengthDiv.style.display = "none";
    }

    /* Error UI helper functions */
    function showCpError(msg) {
      var errEl = document.getElementById("mo-cp-error-text");
      var helpEl = document.getElementById("mo-cp-helper-text");

      // Highlight inputs
      if (newPasswordInput) newPasswordInput.classList.add("mo-input-error");
      if (confirmPasswordInput) confirmPasswordInput.classList.add("mo-input-error");

      // Add red cross icons inside wraps if not already present
      [newPasswordInput, confirmPasswordInput].forEach(function (inp) {
        if (inp) {
          var wrap = inp.closest(".mo-pw-wrap");
          if (wrap && !wrap.querySelector(".mo-error-icon")) {
            var icon = document.createElement("span");
            icon.className = "mo-error-icon";
            icon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
            wrap.appendChild(icon);
          }
        }
      });

      // Show message and toggle visibility
      if (errEl) {
        errEl.textContent = msg;
        errEl.style.display = "block";
      }
      if (helpEl) {
        helpEl.style.display = "none";
      }
    }

    function clearCpError() {
      var errEl = document.getElementById("mo-cp-error-text");
      var helpEl = document.getElementById("mo-cp-helper-text");

      // Remove highlighting
      if (newPasswordInput) newPasswordInput.classList.remove("mo-input-error");
      if (confirmPasswordInput) confirmPasswordInput.classList.remove("mo-input-error");

      // Remove red cross icons
      document.querySelectorAll(".mo-pw-wrap .mo-error-icon").forEach(function (ico) {
        ico.remove();
      });

      // Hide message and show helper text
      if (errEl) {
        errEl.textContent = "";
        errEl.style.display = "none";
      }
      if (helpEl) {
        helpEl.style.display = "block";
      }
    }

    /* Bind custom validation on submit to show neat errors instead of bubbles */
    if (form && !form.dataset.moValidationBound) {
      form.dataset.moValidationBound = "true";
      form.addEventListener("submit", function (e) {
        clearCpError();
        var val = newPasswordInput ? newPasswordInput.value : "";
        var confirmVal = confirmPasswordInput ? confirmPasswordInput.value : "";

        if (!val) {
          e.preventDefault();
          showCpError("New password is required.");
          if (newPasswordInput) newPasswordInput.focus();
          return;
        }

        var invalidItems = document.querySelectorAll("#listcontent li.mo-invalid");
        if (invalidItems.length > 0) {
          e.preventDefault();
          showCpError("Please satisfy all password requirements.");
          if (newPasswordInput) newPasswordInput.focus();
          return;
        }

        if (val !== confirmVal) {
          e.preventDefault();
          showCpError("The password don't match. Please try again");
          if (confirmPasswordInput) confirmPasswordInput.focus();
          return;
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
    var isRedirectToIdp = checkIsRedirectToIdp();

    if (!isLogin && !isForgot && !isOtp && !isChangePass && !isRedirectToIdp) return;

    injectFontAndCss();

    if (isLogin) {
      applyEmailStep();
      applyPasswordStep();
      handleLoginErrors();
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
    if (isRedirectToIdp) { applyRedirectToIdpLogin(); }
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
    var isRedirectToIdp = checkIsRedirectToIdp();

    if (isLogin) { forceHide(); applyPasswordStep(); handleLoginErrors(); }
    if (isForgot) { applyForgotPage(); }
    if (isOtp) { applyOtpPage(); }
    if (isChangePass) { applyChangePasswordPage(); }
    if (isRedirectToIdp) { applyRedirectToIdpLogin(); }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"]
  });

}());
