(function () {
    "use strict";

    /* ── CONFIG: hardcoded external URLs (edit here in one place) ── */
    var MO_URLS = {
        /* Logout page -> external account logout */
        logoutRedirect: "https://dev.account.bouwmaat.nl/account/logout?returnTo=https://dev.bouwmaat.nl/account/logout",
        /* Enduser dashboard -> broker login */
        dashboardRedirect: "https://store.xecurify.com/moas/broker/login/shopify/dev.bouwmaat.nl/account?idpname=custom_oauth_Hhc&redirect_endpoint=/usersession",
        /* OTP page (validatenextfactor) Cancel button -> account login page */
        otpCancelRedirect: "https://dev.account.bouwmaat.nl/inloggen",
        /* Forgot-password helper -> customer support page */
        supportPage: "https://dev.bouwmaat.nl/pages/customer-support-page",
        /* Login-page create-account helper ("create your account here") */
        createAccount: "https://dev.account.bouwmaat.nl/inloggen",
        customerService: "https://bouwmaat.nl/pages/klantenservice",
        /* Figtree webfont stylesheet */
        fontStylesheet: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap"
    };

    /* URL parameter forwarded from the SSO request when a customer opens a
       bookmarked SSO link directly and the backend finds no account: the URL
       then carries is_exist=false, and the register-error message
       (login.register.* copy) is shown under the email field without any form
       submission. STRICT VALUE CHECK — only the exact value "false" triggers
       it; param absent or any other value keeps the generic error prompts
       (showing the Bouwmaat message to everyone would cause confusion). */
    var MO_REGISTER_ERROR_PARAM = "is_exist";
    var MO_REGISTER_ERROR_VALUE = "false";

    /* White right-arrow as an inline SVG data URI — used as a background-image
       inside the brand submit buttons. <input> buttons can't hold a child <i>
       or use ::after, so the icon lives in the button's background instead. */
    var MO_ARROW_BG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='4' y1='12' x2='20' y2='12'/%3E%3Cpolyline points='13 5 20 12 13 19'/%3E%3C/svg%3E\")";

    document.querySelectorAll('#login-main-body, #login-header, #login-body')
        .forEach(el => {
            el.style.setProperty('display', 'randomstring', 'important');
        });
    document.querySelectorAll('#login-body')
        .forEach(el => {
            el.style.setProperty('display', 'flex', 'important');
        });

    /* ── GLOBAL: brand-colored loading spinner (all pages, all viewports) ──
       The platform loader (.loadingbar) is already a pure CSS border-spinner,
       just in orange (#ff972f) — recolor its borders to the brand blue. The
       spin animation, size and shape stay the platform's own. Injected once,
       unconditionally, so it applies on every IdP page at any screen size. */
    if (!document.getElementById("mo-loader-css")) {
        var moLoaderSt = document.createElement("style");
        moLoaderSt.id = "mo-loader-css";
        moLoaderSt.textContent =
            ".loadingbar{" +
            "border-top-color:rgba(10,85,215,.2)!important;" +
            "border-right-color:rgba(10,85,215,.2)!important;" +
            "border-bottom-color:rgba(10,85,215,.2)!important;" +
            "border-left-color:#0A55D7!important;" +
            "}";
        document.head.appendChild(moLoaderSt);
    }

    /* ── PAGE DETECTION HELPERS ── */
    function checkIsLogin() {
        var path = window.location.pathname.toLowerCase();
        if (path.indexOf("/moas/login") !== -1 || path.indexOf("/moas/idp/userlogin") !== -1 ||
            path.indexOf("/moas/validatepassword") !== -1) {   /* failed password submit re-render — same page as userlogin */
            return true;
        }
        return !!document.getElementById("enduserloginform") || !!document.getElementById("idploginform");
    }

    function checkIsRedirectToIdpLogin() {
        var path = window.location.pathname.toLowerCase();
        return path.indexOf("/moas/redirecttoidplogin") !== -1;
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
            path.indexOf("moas/idp/changeuserpassword") !== -1 ||
            path.indexOf("moas/idp/updateuserpassword") !== -1) {
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

    function checkIsLogout() {
        var path = window.location.pathname.toLowerCase();
        return path.indexOf("/moas/logoutpage") !== -1;
    }

    function checkIsEnduserDashboard() {
        var path = window.location.pathname.toLowerCase();
        return path.indexOf("/moas/enduserwelcome") !== -1;
    }

    function checkIsPasswordSentMessage() {
        var path = window.location.pathname.toLowerCase();
        return path.indexOf("idp/showpasswordsentmessage") !== -1;
    }


    /* ── LOGOUT PAGE: auto-redirect ── */
    function applyLogoutPage() {
        if (!checkIsLogout()) return;
        $('.d-flex.justify-content-center.align-items-center.h-25').addClass('d-none')
        window.location.replace(MO_URLS.logoutRedirect);
    }

    /* ── ENDUSER DASHBOARD PAGE (/moas/enduserwelcome) ── */
    function applyEnduserDashboard() {
        if (!checkIsEnduserDashboard()) return;
        window.location.replace(MO_URLS.dashboardRedirect);
    }

    /* ── PASSWORD SENT MESSAGE PAGE (idp/showpasswordsentmessage) ── */
    function applyPasswordSentMessage() {
        if (!checkIsPasswordSentMessage()) return;

        /* Reuse the shared /login page styling (background, card, font, etc.) */
        injectFontAndCss();

        /* This page only: override the card padding to 20px 28px. An inline
           !important is required to beat the #mo-psm-css `#login-wrapper` rule
           (jQuery's .css() can't set !important). Guarded (only write when it
           differs) so the style mutation doesn't retrigger the observer loop. */
        $('#login-wrapper').each(function () {
            if (this.style.padding !== "20px 28px") {
                this.style.setProperty("padding", "20px 28px", "important");
            }
        });

        /* Full-height centering for the React layout wrapper.
           Only set when not already set — otherwise the style mutation
           retriggers the observer and creates an infinite loop. */
        $('.d-flex.flex-column.align-items-center.justify-content-center').each(function () {
            if (this.style.height !== "100vh") this.style.height = "100vh";
        });

        /* Heading text localization. Guard compares TRIMMED text — the
           server-rendered <h4> carries newlines/indentation around the label, so
           a raw textContent comparison never matches and rewrites every observer
           pass (the old "stuck on loading" loop). After our write textContent is
           exactly tr(), so the trimmed guard holds and this is loop-safe. */
        var psmTitle = document.querySelector("#login-wrapper h4");
        if (psmTitle && psmTitle.textContent.trim() !== tr("psm.title")) {
            psmTitle.textContent = tr("psm.title");
        }

        /* Point "Go back to Login Page" at the broker login (dashboard) URL.
           (Not a translation — kept active.) */
        var goBackLink = document.getElementById("go-back-link");
        if (goBackLink && goBackLink.getAttribute("href") !== MO_URLS.dashboardRedirect) {
            goBackLink.setAttribute("href", MO_URLS.dashboardRedirect);
        }

        /* Go-back link label localization (trimmed-guard, loop-safe — same
           pattern as the heading above). */
        $('#go-back-link').each(function () {
            if (this.textContent.trim() !== tr("goback.login")) this.textContent = tr("goback.login");
        });

        /* Success-alert message: the backend serves varying strings (per locale/
           flow), so replace whatever it sent with our psm.alert copy for the
           active locale, parsing the backend's MASKED email out of its message
           and re-inserting it into the EMAIL token (quotes around the token are
           dropped). The pattern allows asterisks on both sides of the @ to match
           mask formats like "am****ar@gm***.com". If parsing ever fails (no
           email-shaped string in the message), the old "xxxxxx@xxxx" placeholder
           is the fallback so the raw EMAIL token never shows. Only spans that
           already carry text are touched — an empty box must keep falling
           through to the "Something went wrong" handler below. Loop-safe: after
           our write the masked email is still in the text, so the next tick
           parses the same value, builds the same target, and the
           compare-before-write guard holds (the placeholder has no dot in its
           domain, so it never re-matches either). */
        $('.alert-success .actionMessage span').each(function () {
            var psmCur = this.textContent.trim();
            if (!psmCur) return;
            var psmEmailMatch = psmCur.match(/[\w.*+-]+@[\w.*-]+\.[\w.*-]+/);
            /* trailing dots stripped — the domain part grabs the sentence period */
            var psmEmail = psmEmailMatch ? psmEmailMatch[0].replace(/\.+$/, "") : "xxxxxx@xxxx";
            var psmTarget = tr("psm.alert").replace(/['"]?EMAIL['"]?/, psmEmail);
            if (psmCur !== psmTarget) this.textContent = psmTarget;
        });

        /* Empty success box -> the server had no message to show. Hide the green
           box and show a "Something went wrong" line instead. If a message shows
           up on a later pass, restore the box and drop the error line. All writes
           are guarded so observer ticks stay loop-safe. */
        var psmAlert = document.querySelector("#login-wrapper .alert-success");
        if (psmAlert) {
            var psmErrEl = document.getElementById("mo-psm-error");
            if (!psmAlert.textContent.trim()) {
                if (psmAlert.style.display !== "none") psmAlert.style.display = "none";
                if (!psmErrEl) {
                    psmErrEl = document.createElement("div");
                    psmErrEl.id = "mo-psm-error";
                    psmErrEl.textContent = tr("psm.error");
                    psmAlert.parentNode.insertBefore(psmErrEl, psmAlert);
                }
            } else {
                if (psmAlert.style.display === "none") psmAlert.style.display = "";
                if (psmErrEl) psmErrEl.remove();
            }
        }

        /* Page-specific styling (inject once) — makes this page match /login:
           carded wrapper, left-aligned bold heading, clean green message box,
           and styled links. */
        if (!document.getElementById("mo-psm-css")) {
            console.log('on passowrd sent message page');
            var psmCss =
                /* Page background + font */
                "body,#login-body,#root{background:#eef1f7!important;font-family:'Figtree',sans-serif!important;}" +
                "#root>div{background:#eef1f7!important;}" +

                /* Center the card in the viewport */
                "body #login-body,body .container-fluid{min-height:100vh!important;display:flex!important;" +
                "flex-direction:column!important;align-items:center!important;justify-content:center!important;" +
                "box-sizing:border-box!important;padding:40px 16px!important;background:transparent!important;}" +

                /* Card (override the inline white border/bg from the markup) */
                "#login-wrapper{background:#fff!important;border:1px solid #e0e7ef!important;" +
                "border-radius:4px!important;box-shadow:0 2px 12px rgba(0,0,0,.08)!important;" +
                "padding:28px 14px!important;max-width:560px!important;width:100%!important;margin:0 auto!important;}" +

                /* Heading -> left-aligned bold, like the LOG IN title */
                "#login-wrapper h4{font-family:'Figtree',sans-serif!important;font-size:24px!important;" +
                "font-weight:800!important;color:#000933!important;text-align:left!important;margin:0 0 20px 0!important;}" +

                /* Hide the separator */
                "#login-wrapper hr{display:none!important;}" +

                /* Green success message box */
                "#login-wrapper .alert-success{background:#e8f5e9!important;border:none!important;" +
                "border-left:4px solid #2e7d32!important;border-radius:4px!important;color:#1b5e20!important;" +
                "padding:14px 16px!important;text-align:left!important;font-family:'Figtree',sans-serif!important;" +
                "font-size:14px!important;line-height:1.5!important;margin-bottom:0!important;}" +
                "#login-wrapper .alert-success .actionMessage{list-style:none!important;padding:0!important;margin:0!important;}" +
                "#login-wrapper .alert-success .actionMessage li span{font-weight:600!important;}" +

                /* "Something went wrong" line (replaces an empty success box) */
                "#mo-psm-error{font-family:'Figtree',sans-serif!important;font-size:14px!important;" +
                "font-weight:600!important;color:#E91616!important;text-align:start!important;margin:0!important;}" +

                /* Links row -> left aligned, blue links like #mo-forgot */
                "#login-wrapper .d-flex.justify-content-center{justify-content:flex-start!important;gap:16px!important;margin-top:18px!important;}" +
                "#go-back-link,#try-again-link{font-family:'Figtree',sans-serif!important;font-size:13px!important;" +
                "font-weight:500!important;color:#0A55D7!important;text-decoration:none!important;padding:0!important;}" +
                "#go-back-link:hover,#try-again-link:hover{text-decoration:underline!important;}" +

                /* Mobile: white page background, card pinned to top, flush edges.
                   body.justify-content-center out-specifies Bootstrap's utility class;
                   #login-body and .container-fluid each get 100vh centering from the
                   desktop rule above, so both need flex-start/min-height:unset too. */
                "@media(max-width:576px){" +
                "body,#login-body,#root,#root>div{background:#ffffff!important;}" +
                "body,body.justify-content-center{justify-content:flex-start!important;}" +
                "body #login-body,body .container-fluid{min-height:unset!important;justify-content:flex-start!important;}" +
                "body #login-body{padding:60px 0 0!important;}" +
                "body .container-fluid{padding:0!important;}" +
                "#login-wrapper{padding:0!important;border:none!important;box-shadow:none!important;}" +
                "}";

            var psmSt = document.createElement("style");
            psmSt.id = "mo-psm-css"; psmSt.textContent = psmCss;
            document.head.appendChild(psmSt);
        }
    }

    /* ── ERROR DETECTION HELPER ── */
    /* Detects the server-rendered error banner (#error-alert-message).
       The wrapper structure stays constant — only the message text changes:
         #error-alert-message > ul.errorMessage > li > span  ("...message...")
       Returns true when a non-empty error message is present. */
    function errorOnPage() {
        var banner = document.getElementById("error-alert-message");
        if (!banner) return false;

        var span = banner.querySelector(".errorMessage li span");
        var message = span ? span.textContent.trim() : "";
        if (!message) return false;

        console.log("THIS PAGE HAS ERROR");
        return true;
    }

    /* ── INJECT FONT AND CSS ── */
    function injectFontAndCss() {

        /* ── FONT ── */
        if (!document.getElementById("mo-font")) {
            var lk = document.createElement("link");
            lk.id = "mo-font"; lk.rel = "stylesheet";
            lk.href = MO_URLS.fontStylesheet;
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

                /* Error messages — uniform 12px, medium weight */
                ".error-message{font-size:12px!important;color:#E91616!important;font-weight:500!important;}" +
                ".border-danger{border-color:#E91616!important;}" +

                /* Logo — hidden */
                "#login-header{display:none!important;}" +

                /* Card */
                "#login-wrapper{" +
                "background:#fff!important;border:1px solid #e0e7ef!important;" +
                "border-radius:4px!important;box-shadow:0 2px 12px rgba(0,0,0,.08)!important;" +
                "padding:28px 14px!important;max-width:560px!important;margin:0 auto!important;" +
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

                /* Hide the bottom links block ("Sign in with another account" + forgot).
                   There are two .w-75.px-4 wrappers; the FIRST holds the form (its row is
                   plain .row) and the SECOND holds only these links (its row is
                   .row.justify-content-center). :has() targets just the second so the
                   form is never hidden. */
                "#enduserloginform .w-75.px-4:has(.row.justify-content-center),#idploginform .w-75.px-4:has(.row.justify-content-center){display:none!important;}" +

                /* LOG IN heading — top LEFT */
                "#mo-title{display:block;font-family:'Figtree',sans-serif;font-size:24px;font-weight:800;" +
                "color:#000933;margin-bottom:12px;text-align:left;}" +

                /* Labels — left aligned */
                ".mo-lbl{display:block;color:#3c515d;font-size:14px;font-weight:700;padding:0 0 4px;" +
                "font-family:'Figtree',sans-serif;text-align:left;}" +
                ".mo-lbl .mo-req{color:#e02020;margin-left:2px;}" +

                /* Field group spacing */
                ".mo-fg{margin-bottom:14px;width:100%;}" +

                /* Shared input style */
                "#username,#plaintextPassword,.mo-styled-input{" +
                "height:40px!important;border:1px solid #C1CFD7;border-radius:0!important;" +
                "padding:0 12px!important;font-size:14px!important;font-family:'Figtree',sans-serif!important;" +
                "color:#000933!important;background:#fff!important;width:100%!important;" +
                "box-shadow:none!important;outline:none!important;box-sizing:border-box!important;" +
                "margin-bottom:0!important;display:block!important;" +
                "}" +
                "#username::placeholder,#plaintextPassword::placeholder,.mo-styled-input::placeholder{color:#a0aab6!important;}" +
                "#username:focus,#plaintextPassword:focus,.mo-styled-input:focus{border-color:#0A55D7!important;box-shadow:0 0 0 3px rgba(10,85,215,.12)!important;}" +

                /* Hide the browser's native password reveal/clear buttons (Edge/IE)
                   so only our .mo-eye toggle shows */
                "input[type='password']::-ms-reveal{display:none!important;}" +
                "input[type='password']::-ms-clear{display:none!important;}" +

                /* Password wrapper (eye toggle) */
                ".mo-pw-wrap{position:relative;display:flex;align-items:center;width:100%;}" +
                "#plaintextPassword,.mo-styled-input{padding-right:42px!important;}" +
                ".mo-eye{position:absolute;right:10px;background:none;border:none;cursor:pointer;" +
                "color:#000933;padding:4px;display:flex;align-items:center;}" +
                ".mo-eye:hover{color:#000933;}" +
                ".mo-eye svg{width:20px;height:20px;pointer-events:none;}" +

                /* Forgot link row — right aligned */
                "#mo-bottom{display:flex;align-items:center;justify-content:flex-end;margin:16px 0 20px;width:100%;}" +
                "#mo-forgot{font-size:13px;font-weight:500;color:#0A55D7;text-decoration:none;font-family:'Figtree',sans-serif;}" +
                "#mo-forgot:hover{text-decoration:underline;}" +

                /* Read-only username display on password step */
                ".mo-user-display{height:40px;border:1px solid #C1CFD7;border-radius:0;padding:0 12px;" +
                "font-size:14px;color:#6b7a8d;background:#f5f7fa;display:flex;align-items:center;" +
                "font-family:'Figtree',sans-serif;box-sizing:border-box;width:100%;cursor:default;}" +

                /* Login button — left-aligned */
                "#loginbutton{" +
                "display:inline-flex!important;align-items:center!important;justify-content:center!important;" +
                "gap:8px!important;min-height:40px!important;padding:8px 20px!important;" +
                "border-radius:0!important;background:#0A55D7!important;background-color:#0A55D7!important;" +
                "border:none!important;color:#fff!important;font-family:'Figtree',sans-serif!important;" +
                "font-size:16px!important;font-weight:700!important;letter-spacing:.6px!important;" +
                "text-transform:uppercase!important;cursor:pointer!important;box-shadow:none!important;width:auto!important;" +
                "padding-right:44px!important;background-image:" + MO_ARROW_BG + "!important;" +
                "background-repeat:no-repeat!important;background-position:right 18px center!important;background-size:15px 15px!important;" +
                "}" +
                "#loginbutton:hover{background-color:#0844b0!important;}" +
                /* button row — left align the submit button */
                "#enduserloginform .row div:has(#loginbutton),#idploginform .row div:has(#loginbutton){text-align:left!important;display:block!important;}" +

                /* SSO register-error message (param-driven, under the email field) */
                "#mo-register-error{color:#E91616!important;font-size:12px!important;font-weight:500!important;" +
                "font-family:'Figtree',sans-serif!important;text-align:start!important;" +
                "margin:-8px 0 14px!important;line-height:1.5!important;}" +
                "#mo-register-error a{color:inherit!important;text-decoration:underline!important;font-weight:600!important;}" +

                /* Register helper below the login button */
                "#mo-register-helper{font-size:14px!important;font-weight:400!important;" +
                "color:#000933!important;font-family:'Figtree',sans-serif!important;text-align:start!important;" +
                "padding:13px 13px 0 13px!important;line-height:1.5!important;}" +
                "#mo-register-helper a{color:#0A55D7!important;text-decoration:none!important;font-weight:500!important;}" +
                "#mo-register-helper a:hover{text-decoration:underline!important;}" +

                /* Mobile — full-bleed card: no centering, no border/shadow, flush left/right */
                "@media(max-width:576px){" +
                "#login-main-body{background:#ffffff!important;" +
                "align-items:normal!important;justify-content:flex-start!important;" +
                "padding:60px 0 0!important;}" +
                "#login-wrapper{padding:24px 0 0 0!important;border:none!important;box-shadow:none!important;}" +
                ".mo-lbl,#username,#plaintextPassword{font-size:16px!important;}" +
                "#loginbutton{font-size:16px!important;}" +
                "}" +

                /* Input Error Styling */
                ".mo-input-error { border-color: #ef2f2f!important; }" +
                ".mo-input-error:focus { box-shadow: 0 0 0 3px rgba(239, 47, 47, .12)!important; }" +
                ".mo-error-text { color: #ef2f2f; font-size: 13px; font-weight: 500; margin-top: 6px; text-align: left; display: block; font-family: 'Figtree', sans-serif; }" +
                "[dir='rtl'] .mo-error-text { text-align: right!important; }" +
                ".mo-error-icon { position: absolute; right: 12px; display: flex; align-items: center; pointer-events: none; color: #E91616; }" +
                ".mo-error-icon svg { width: 18px; height: 18px; fill: currentColor; }" +
                ".mo-input-error { padding-right: 40px!important; }" +
                "[dir='rtl'] .mo-error-icon { right: auto!important; left: 12px!important; }" +
                "[dir='rtl'] .mo-input-error { padding-right: 12px!important; padding-left: 40px!important; }" +
                ".mo-pw-wrap .mo-error-icon { right: 36px!important; }" +
                "[dir='rtl'] .mo-pw-wrap .mo-error-icon { right: auto!important; left: 36px!important; }" +
                ".mo-pw-wrap .mo-input-error { padding-right: 64px!important; }" +
                "[dir='rtl'] .mo-pw-wrap .mo-input-error { padding-right: 12px!important; padding-left: 64px!important; }";

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

    /* Set a submit button's label. The trailing white right-arrow is supplied
       by CSS (background-image: MO_ARROW_BG) on the button selectors, so the
       look is identical whether the button is an <input> or a <button>.
       Idempotent — safe to call on every observer pass. */
    function setBtnArrowLabel(btn, label) {
        if (!btn) return;
        if (btn.tagName === "INPUT") {
            if (btn.value !== label) { btn.value = label; btn.dataset.mo = "1"; }
        } else {
            if (btn.textContent !== label) { btn.textContent = label; btn.dataset.mo = "1"; }
        }
    }

    function getUrlParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    function getLocale() {
        /* Normalize any locale string ("it", "it-IT", "it_IT", " IT ") to the
           2-letter lowercase key used in TRANSLATIONS. Returns "" unless we
           actually ship translations for it, so an unknown value falls through
           to the next signal instead of forcing English via tr()'s fallback. */
        function norm(v) {
            if (!v) return "";
            var code = String(v).trim().toLowerCase().split(/[-_]/)[0];
            return TRANSLATIONS[code] ? code : "";
        }

        /* Priority: signals the SERVER controls beat the client-side dropdown.
             1. ?request_locale — authoritative on the /openidsso entry page.
             2. <html lang>     — set by the server from request_locale and, unlike
                the query param, survives the 302 -> /userlogin redirect.
             3. #languageSelect — only a UI widget; its default may not reflect the
                locale actually applied, so it ranks last among live signals.
             4. localStorage    — final fallback so a resolved locale persists onto
                pages that expose none of the above. */
        var sel = document.getElementById("languageSelect");
        var lang =
            norm(getUrlParam("request_locale")) ||
            norm(document.documentElement.getAttribute("lang")) ||
            norm(sel && sel.value) ||
            norm(localStorage.getItem("mo_locale")) ||
            "nl";   /* default locale when no other signal resolves */

        if (lang) localStorage.setItem("mo_locale", lang);
        return lang;
    }

    /* ── TRANSLATIONS ──
       Keyed by locale code (matches #languageSelect option values + mo_locale).
       tr(key) resolves against the current mo_locale, falling back to English,
       then to the raw key if nothing is found. Structural glyphs (→, *) are
       appended in code, never stored here. */
    var TRANSLATIONS = {
        en: {
            "login.page.title": "LOG IN",
            "login.page.button": "LOG IN",
            "email.field.placeholder": "email",
            "email.field.label": "Email address",
            "password.field.label": "Password",
            "password.field.placeholder": "Password",
            "forgot.password.link": "Forgot Password",
            "reset.password": "RESET PASSWORD",
            "reset.password.subtext": "We will send you an email with instructions on how to recover it",
            "forgot.page.helper": "Not receiving an email to reset your password? Then the e-mail address used is not known to us. Can’t figure it out?",
            "forgot.page.helper.link": "Contact customer service",
            "login.register.helper": "Please use your Bouwmaat Pass to register. If you experience any issues, please contact {link}.",
            "login.register.link": "Customer Service",
            "login.createacct.helper": "If you do not have an Online Account, please create your account {link}.",
            "login.createacct.link": "here",
            "next.button": "NEXT",
            "otp.page.title": "VERIFY YOUR IDENTITY",
            "otp.field.label": "Enter OTP here",
            "otp.field.placeholder": "OTP number",
            "otp.verify.button": "Verify",
            "otp.cancel.button": "Cancel",
            "otp.alert": "The OTP has been sent to {Email}. Please enter the OTP you received to Validate.",
            "otp.resend.link": "Did not receive OTP? Click here to Resend OTP",
            "otp.resent.message": "OTP Sent. Click again in case you did not receive it.",
            "otp.resend.timer": "You will be able to send a new OTP in {X} seconds.",
            "otp.error.invalid": "Invalid OTP provided. Please try again. You have {X} more attempt(s) left.",
            "changepw.title": "RESET PASSWORD",
            "changepw.newpassword.label": "New password",
            "changepw.confirmpassword.label": "Confirm password",
            "changepw.req.length": "{min}-{max} characters",
            "changepw.req.uppercase": "1 uppercase character should be present",
            "changepw.req.number": "1 number character should be present",
            "changepw.req.symbol": "At least one of the following symbols ( {symbols} ) should be present",
            "changepw.req.consecutive": "Does not contain more than {n} consecutive characters of {fields}",
            "changepw.field.firstname": "first name",
            "changepw.field.lastname": "last name",
            "changepw.field.username": "username",
            "changepw.field.email": "email",
            "changepw.strength.label": "Password strength",
            "changepw.strength.weak": "Poor",
            "changepw.strength.fair": "Average",
            "changepw.strength.good": "Sufficient",
            "changepw.strength.strong": "Perfect!",
            "changepw.error.required": "New password is required.",
            "changepw.error.requirements": "Please satisfy all password requirements.",
            "changepw.error.mismatch": "The password don't match. Please try again",
            "changepw.expired.title": "Password Link Expired",
            "changepw.expired.message": "Your password reset link has been expired. Please use valid link to reset your password.",
            "psm.title": "Reset Password",
            "psm.alert": "You will receive a password reset email shortly if the \"EMAIL\" is associated with an account.",
            "psm.error": "Something went wrong",
            "goback.login": "Go back to Login Page",
            "changepw.success.title": "Password Successfully Changed",
            "changepw.success.text": "Your password has been successfully changed",
            "login.error.invalid": "Invalid username or password. You have {X} more attempt(s) left."
        },
        de: {
            "login.page.title": "ANMELDEN",
            "login.page.button": "ANMELDEN",
            "email.field.placeholder": "E-Mail",
            "email.field.label": "E-Mail-Adresse",
            "password.field.label": "Passwort",
            "password.field.placeholder": "Passwort",
            "forgot.password.link": "Passwort vergessen",
            "reset.password": "PASSWORT ZURÜCKSETZEN",
            "reset.password.subtext": "Wir senden Ihnen eine E-Mail mit Anweisungen zur Wiederherstellung",
            "forgot.page.helper": "Sie erhalten keine E-Mail zum Zurücksetzen Ihres Passworts? Dann ist die verwendete E-Mail-Adresse uns nicht bekannt. Kommen Sie nicht weiter?",
            "forgot.page.helper.link": "Kundenservice kontaktieren",
            "login.register.helper": "Bitte verwenden Sie Ihren Bouwmaat-Pass, um sich zu registrieren. Bei Problemen wenden Sie sich bitte an den {link}.",
            "login.register.link": "Kundenservice",
            "login.createacct.helper": "Wenn Sie noch kein Online-Konto haben, erstellen Sie Ihr Konto bitte {link}.",
            "login.createacct.link": "hier",
            "next.button": "WEITER",
            "otp.page.title": "IDENTITÄT BESTÄTIGEN",
            "otp.field.label": "OTP hier eingeben",
            "otp.field.placeholder": "OTP-Nummer",
            "otp.verify.button": "BESTÄTIGEN",
            "otp.cancel.button": "ABBRECHEN",
            "otp.alert": "Der OTP wurde an {Email} gesendet. Bitte geben Sie den erhaltenen OTP zur Bestätigung ein.",
            "otp.resend.link": "Keinen OTP erhalten? Klicken Sie hier, um den OTP erneut zu senden",
            "otp.resent.message": "OTP gesendet. Klicken Sie erneut, falls Sie ihn nicht erhalten haben.",
            "otp.resend.timer": "Sie können in {X} Sekunden einen neuen OTP anfordern.",
            "otp.error.invalid": "Ungültiger OTP eingegeben. Bitte versuchen Sie es erneut. Sie haben noch {X} Versuch(e) übrig.",
            "changepw.title": "PASSWORT ZURÜCKSETZEN",
            "changepw.newpassword.label": "Neues Passwort",
            "changepw.confirmpassword.label": "Passwort bestätigen",
            "changepw.req.length": "{min}-{max} Zeichen",
            "changepw.req.uppercase": "Es muss mindestens ein Großbuchstabe vorhanden sein",
            "changepw.req.number": "Es muss mindestens eine Ziffer vorhanden sein",
            "changepw.req.symbol": "Mindestens eines der folgenden Sonderzeichen ( {symbols} ) muss vorhanden sein",
            "changepw.req.consecutive": "Enthält nicht mehr als {n} aufeinanderfolgende Zeichen von {fields}",
            "changepw.field.firstname": "Vorname",
            "changepw.field.lastname": "Nachname",
            "changepw.field.username": "Benutzername",
            "changepw.field.email": "E-Mail",
            "changepw.strength.label": "Passwortstärke",
            "changepw.strength.weak": "Schwach",
            "changepw.strength.fair": "Durchschnittlich",
            "changepw.strength.good": "Ausreichend",
            "changepw.strength.strong": "Perfekt!",
            "changepw.error.required": "Neues Passwort ist erforderlich.",
            "changepw.error.requirements": "Bitte erfüllen Sie alle Passwortanforderungen.",
            "changepw.error.mismatch": "Die Passwörter stimmen nicht überein. Bitte versuchen Sie es erneut.",
            "changepw.expired.title": "Passwort-Link abgelaufen",
            "changepw.expired.message": "Ihr Link zum Zurücksetzen des Passworts ist abgelaufen. Bitte verwenden Sie einen gültigen Link, um Ihr Passwort zurückzusetzen.",
            "psm.title": "Passwort zurücksetzen",
            "psm.alert": "Sie erhalten in Kürze eine E-Mail zum Zurücksetzen des Passworts, wenn die \"EMAIL\" mit einem Konto verknüpft ist.",
            "psm.error": "Etwas ist schiefgelaufen",
            "goback.login": "Zurück zur Anmeldeseite",
            "changepw.success.title": "Passwort erfolgreich geändert",
            "changepw.success.text": "Ihr Passwort wurde erfolgreich geändert",
            "login.error.invalid": "Ungültiger Benutzername oder ungültiges Passwort. Sie haben noch {X} Versuch(e) übrig."
        },
        it: {
            "login.page.title": "ACCEDI",
            "login.page.button": "ACCEDI",
            "email.field.placeholder": "Email",
            "email.field.label": "Indirizzo email",
            "password.field.label": "Password",
            "password.field.placeholder": "Password",
            "forgot.password.link": "Password dimenticata",
            "reset.password": "REIMPOSTA PASSWORD",
            "reset.password.subtext": "Ti invieremo un'email con le istruzioni su come recuperarla",
            "forgot.page.helper": "Non ricevi l'email per reimpostare la password? Allora l'indirizzo email utilizzato non è registrato. Non riesci a capire?",
            "forgot.page.helper.link": "Contatta il servizio clienti",
            "login.register.helper": "Utilizza il tuo Bouwmaat Pass per registrarti. In caso di problemi, contatta il {link}.",
            "login.register.link": "servizio clienti",
            "login.createacct.helper": "Se non hai un account online, crea il tuo account {link}.",
            "login.createacct.link": "qui",
            "next.button": "AVANTI",
            "otp.page.title": "VERIFICA LA TUA IDENTITÀ",
            "otp.field.label": "Inserisci qui l'OTP",
            "otp.field.placeholder": "Numero OTP",
            "otp.verify.button": "VERIFICA",
            "otp.cancel.button": "ANNULLA",
            "otp.alert": "Il codice OTP è stato inviato a {Email}. Inserisci il codice OTP ricevuto per confermare.",
            "otp.resend.link": "Non hai ricevuto l'OTP? Clicca qui per inviarlo di nuovo",
            "otp.resent.message": "OTP inviato. Clicca di nuovo se non l'hai ricevuto.",
            "otp.resend.timer": "Potrai richiedere un nuovo OTP tra {X} secondi.",
            "otp.error.invalid": "OTP non valido. Riprova. Hai ancora {X} tentativo/i.",
            "changepw.title": "REIMPOSTA PASSWORD",
            "changepw.newpassword.label": "Nuova password",
            "changepw.confirmpassword.label": "Conferma password",
            "changepw.req.length": "{min}-{max} caratteri",
            "changepw.req.uppercase": "Deve essere presente almeno una lettera maiuscola",
            "changepw.req.number": "Deve essere presente almeno un numero",
            "changepw.req.symbol": "Deve essere presente almeno uno dei seguenti simboli ( {symbols} )",
            "changepw.req.consecutive": "Non contiene più di {n} caratteri consecutivi di {fields}",
            "changepw.field.firstname": "nome",
            "changepw.field.lastname": "cognome",
            "changepw.field.username": "nome utente",
            "changepw.field.email": "email",
            "changepw.strength.label": "Sicurezza della password",
            "changepw.strength.weak": "Debole",
            "changepw.strength.fair": "Media",
            "changepw.strength.good": "Sufficiente",
            "changepw.strength.strong": "Perfetta!",
            "changepw.error.required": "La nuova password è obbligatoria.",
            "changepw.error.requirements": "Soddisfa tutti i requisiti della password.",
            "changepw.error.mismatch": "Le password non corrispondono. Riprova.",
            "changepw.expired.title": "Link della password scaduto",
            "changepw.expired.message": "Il tuo link per reimpostare la password è scaduto. Utilizza un link valido per reimpostare la password.",
            "psm.title": "Reimposta password",
            "psm.alert": "Riceverai a breve un'email per reimpostare la password se \"EMAIL\" è associata a un account.",
            "psm.error": "Qualcosa è andato storto",
            "goback.login": "Torna alla pagina di accesso",
            "changepw.success.title": "Password modificata con successo",
            "changepw.success.text": "La tua password è stata modificata con successo",
            "login.error.invalid": "Nome utente o password non validi. Hai ancora {X} tentativo/i."
        },
        ar: {
            "login.page.title": "تسجيل الدخول",
            "login.page.button": "تسجيل الدخول",
            "email.field.placeholder": "البريد الإلكتروني",
            "email.field.label": "عنوان البريد الإلكتروني",
            "password.field.label": "كلمة المرور",
            "password.field.placeholder": "كلمة المرور",
            "forgot.password.link": "نسيت كلمة المرور",
            "reset.password": "إعادة تعيين كلمة المرور",
            "reset.password.subtext": "سنرسل لك بريدًا إلكترونيًا يحتوي على تعليمات حول كيفية استعادتها",
            "forgot.page.helper": "ألا تتلقى بريدًا إلكترونيًا لإعادة تعيين كلمة المرور؟ إذًا عنوان البريد الإلكتروني المستخدم غير معروف لدينا. لا يمكنك معرفة ذلك؟",
            "forgot.page.helper.link": "اتصل بخدمة العملاء",
            "login.register.helper": "يرجى استخدام بطاقة Bouwmaat الخاصة بك للتسجيل. إذا واجهت أي مشكلة، يرجى التواصل مع {link}.",
            "login.register.link": "خدمة العملاء",
            "login.createacct.helper": "إذا لم يكن لديك حساب عبر الإنترنت، يرجى إنشاء حسابك {link}.",
            "login.createacct.link": "هنا",
            "next.button": "التالي",
            "otp.page.title": "تحقق من هويتك",
            "otp.field.label": "أدخل رمز OTP هنا",
            "otp.field.placeholder": "رقم OTP",
            "otp.verify.button": "تحقق",
            "otp.cancel.button": "إلغاء",
            "otp.alert": "تم إرسال رمز OTP إلى {Email}. يرجى إدخال الرمز الذي تلقيته للتحقق.",
            "otp.resend.link": "لم تتلقَّ رمز OTP؟ انقر هنا لإعادة إرساله",
            "otp.resent.message": "تم إرسال رمز OTP. انقر مرة أخرى إذا لم تستلمه.",
            "otp.resend.timer": "يمكنك إرسال رمز OTP جديد بعد {X} ثانية.",
            "otp.error.invalid": "رمز OTP غير صالح. يرجى المحاولة مرة أخرى. لديك {X} محاولة/محاولات متبقية.",
            "changepw.title": "إعادة تعيين كلمة المرور",
            "changepw.newpassword.label": "كلمة المرور الجديدة",
            "changepw.confirmpassword.label": "تأكيد كلمة المرور",
            "changepw.req.length": "{min}-{max} حرفًا",
            "changepw.req.uppercase": "يجب أن يحتوي على حرف كبير واحد على الأقل",
            "changepw.req.number": "يجب أن يحتوي على رقم واحد على الأقل",
            "changepw.req.symbol": "يجب أن يحتوي على واحد على الأقل من الرموز التالية ( {symbols} )",
            "changepw.req.consecutive": "لا يحتوي على أكثر من {n} أحرف متتالية من {fields}",
            "changepw.field.firstname": "الاسم الأول",
            "changepw.field.lastname": "اسم العائلة",
            "changepw.field.username": "اسم المستخدم",
            "changepw.field.email": "البريد الإلكتروني",
            "changepw.strength.label": "قوة كلمة المرور",
            "changepw.strength.weak": "ضعيفة",
            "changepw.strength.fair": "متوسطة",
            "changepw.strength.good": "كافية",
            "changepw.strength.strong": "ممتازة!",
            "changepw.error.required": "كلمة المرور الجديدة مطلوبة.",
            "changepw.error.requirements": "يرجى استيفاء جميع متطلبات كلمة المرور.",
            "changepw.error.mismatch": "كلمتا المرور غير متطابقتين. يرجى المحاولة مرة أخرى.",
            "changepw.expired.title": "انتهت صلاحية رابط كلمة المرور",
            "changepw.expired.message": "انتهت صلاحية رابط إعادة تعيين كلمة المرور. يرجى استخدام رابط صالح لإعادة تعيين كلمة المرور.",
            "psm.title": "إعادة تعيين كلمة المرور",
            "psm.alert": "ستتلقى قريبًا بريدًا إلكترونيًا لإعادة تعيين كلمة المرور إذا كان \"EMAIL\" مرتبطًا بحساب.",
            "psm.error": "حدث خطأ ما",
            "goback.login": "العودة إلى صفحة تسجيل الدخول",
            "changepw.success.title": "تم تغيير كلمة المرور بنجاح",
            "changepw.success.text": "تم تغيير كلمة المرور الخاصة بك بنجاح",
            "login.error.invalid": "اسم المستخدم أو كلمة المرور غير صالحة. لديك {X} محاولة/محاولات متبقية."
        },
        pt: {
            "login.page.title": "ENTRAR",
            "login.page.button": "ENTRAR",
            "email.field.placeholder": "E-mail",
            "email.field.label": "Endereço de e-mail",
            "password.field.label": "Senha",
            "password.field.placeholder": "Senha",
            "forgot.password.link": "Esqueceu a senha",
            "reset.password": "REDEFINIR SENHA",
            "reset.password.subtext": "Enviaremos um e-mail com instruções sobre como recuperá-la",
            "forgot.page.helper": "Não está recebendo um e-mail para redefinir sua senha? Então o endereço de e-mail usado não é conhecido por nós. Não consegue descobrir?",
            "forgot.page.helper.link": "Entre em contato com o atendimento ao cliente",
            "login.register.helper": "Use o seu Bouwmaat Pass para se registrar. Se tiver algum problema, entre em contato com o {link}.",
            "login.register.link": "atendimento ao cliente",
            "login.createacct.helper": "Se você não tem uma conta online, crie a sua conta {link}.",
            "login.createacct.link": "aqui",
            "next.button": "PRÓXIMO",
            "otp.page.title": "VERIFIQUE SUA IDENTIDADE",
            "otp.field.label": "Digite o OTP aqui",
            "otp.field.placeholder": "Número OTP",
            "otp.verify.button": "VERIFICAR",
            "otp.cancel.button": "CANCELAR",
            "otp.alert": "O código OTP foi enviado para {Email}. Insira o código OTP recebido para validar.",
            "otp.resend.link": "Não recebeu o OTP? Clique aqui para reenviar o OTP",
            "otp.resent.message": "OTP enviado. Clique novamente caso não o tenha recebido.",
            "otp.resend.timer": "Você poderá enviar um novo OTP em {X} segundos.",
            "otp.error.invalid": "OTP inválido. Tente novamente. Você tem mais {X} tentativa(s).",
            "changepw.title": "REDEFINIR SENHA",
            "changepw.newpassword.label": "Nova senha",
            "changepw.confirmpassword.label": "Confirmar senha",
            "changepw.req.length": "{min}-{max} caracteres",
            "changepw.req.uppercase": "Deve conter pelo menos uma letra maiúscula",
            "changepw.req.number": "Deve conter pelo menos um número",
            "changepw.req.symbol": "Deve conter pelo menos um dos seguintes símbolos ( {symbols} )",
            "changepw.req.consecutive": "Não contém mais de {n} caracteres consecutivos de {fields}",
            "changepw.field.firstname": "nome",
            "changepw.field.lastname": "sobrenome",
            "changepw.field.username": "nome de usuário",
            "changepw.field.email": "e-mail",
            "changepw.strength.label": "Força da senha",
            "changepw.strength.weak": "Fraca",
            "changepw.strength.fair": "Média",
            "changepw.strength.good": "Suficiente",
            "changepw.strength.strong": "Perfeita!",
            "changepw.error.required": "A nova senha é obrigatória.",
            "changepw.error.requirements": "Atenda a todos os requisitos da senha.",
            "changepw.error.mismatch": "As senhas não coincidem. Tente novamente.",
            "changepw.expired.title": "Link de senha expirado",
            "changepw.expired.message": "Seu link de redefinição de senha expirou. Use um link válido para redefinir sua senha.",
            "psm.title": "Redefinir senha",
            "psm.alert": "Você receberá em breve um e-mail de redefinição de senha se \"EMAIL\" estiver associado a uma conta.",
            "psm.error": "Algo deu errado",
            "goback.login": "Voltar para a página de login",
            "changepw.success.title": "Senha alterada com sucesso",
            "changepw.success.text": "Sua senha foi alterada com sucesso",
            "login.error.invalid": "Nome de usuário ou senha inválidos. Você tem mais {X} tentativa(s)."
        },
        es: {
            "login.page.title": "INICIAR SESIÓN",
            "login.page.button": "INICIAR SESIÓN",
            "email.field.placeholder": "correo electrónico",
            "email.field.label": "Correo electrónico",
            "password.field.label": "Contraseña",
            "password.field.placeholder": "Contraseña",
            "forgot.password.link": "¿Olvidó su contraseña?",
            "reset.password": "RESTABLECER CONTRASEÑA",
            "reset.password.subtext": "Le enviaremos un correo electrónico con instrucciones sobre cómo recuperarla",
            "forgot.page.helper": "¿No recibe un correo electrónico para restablecer su contraseña? Entonces la dirección de correo electrónico utilizada no es conocida por nosotros. ¿No lo puede averiguar?",
            "forgot.page.helper.link": "Contactar con atención al cliente",
            "login.register.helper": "Utilice su Bouwmaat Pass para registrarse. Si tiene algún problema, póngase en contacto con el {link}.",
            "login.register.link": "servicio de atención al cliente",
            "login.createacct.helper": "Si no tiene una cuenta online, cree su cuenta {link}.",
            "login.createacct.link": "aquí",
            "next.button": "SIGUIENTE",
            "otp.page.title": "VERIFIQUE SU IDENTIDAD",
            "otp.field.label": "Ingrese el OTP aquí",
            "otp.field.placeholder": "Número OTP",
            "otp.verify.button": "VERIFICAR",
            "otp.cancel.button": "CANCELAR",
            "otp.alert": "El código OTP se ha enviado a {Email}. Introduzca el código OTP recibido para validar.",
            "otp.resend.link": "¿No recibió el OTP? Haga clic aquí para reenviarlo",
            "otp.resent.message": "OTP enviado. Haga clic de nuevo si no lo ha recibido.",
            "otp.resend.timer": "Podrá enviar un nuevo OTP en {X} segundos.",
            "otp.error.invalid": "OTP no válido. Inténtelo de nuevo. Le queda(n) {X} intento(s).",
            "changepw.title": "RESTABLECER CONTRASEÑA",
            "changepw.newpassword.label": "Nueva contraseña",
            "changepw.confirmpassword.label": "Confirmar contraseña",
            "changepw.req.length": "{min}-{max} caracteres",
            "changepw.req.uppercase": "Debe contener al menos una letra mayúscula",
            "changepw.req.number": "Debe contener al menos un número",
            "changepw.req.symbol": "Debe contener al menos uno de los siguientes símbolos ( {symbols} )",
            "changepw.req.consecutive": "No contiene más de {n} caracteres consecutivos de {fields}",
            "changepw.field.firstname": "nombre",
            "changepw.field.lastname": "apellido",
            "changepw.field.username": "nombre de usuario",
            "changepw.field.email": "correo electrónico",
            "changepw.strength.label": "Seguridad de la contraseña",
            "changepw.strength.weak": "Débil",
            "changepw.strength.fair": "Media",
            "changepw.strength.good": "Suficiente",
            "changepw.strength.strong": "¡Perfecta!",
            "changepw.error.required": "La nueva contraseña es obligatoria.",
            "changepw.error.requirements": "Cumpla con todos los requisitos de la contraseña.",
            "changepw.error.mismatch": "Las contraseñas no coinciden. Inténtelo de nuevo.",
            "changepw.expired.title": "Enlace de contraseña caducado",
            "changepw.expired.message": "Su enlace para restablecer la contraseña ha caducado. Utilice un enlace válido para restablecer su contraseña.",
            "psm.title": "Restablecer contraseña",
            "psm.alert": "Recibirá en breve un correo electrónico para restablecer la contraseña si \"EMAIL\" está asociado a una cuenta.",
            "psm.error": "Algo salió mal",
            "goback.login": "Volver a la página de inicio de sesión",
            "changepw.success.title": "Contraseña cambiada correctamente",
            "changepw.success.text": "Su contraseña se ha cambiado correctamente",
            "login.error.invalid": "Nombre de usuario o contraseña no válidos. Le queda(n) {X} intento(s)."
        },
        fr: {
            "login.page.title": "CONNEXION",
            "login.page.button": "CONNEXION",
            "email.field.placeholder": "E-mail",
            "email.field.label": "Adresse e-mail",
            "password.field.label": "Mot de passe",
            "password.field.placeholder": "Mot de passe",
            "forgot.password.link": "Mot de passe oublié",
            "reset.password": "RÉINITIALISER LE MOT DE PASSE",
            "reset.password.subtext": "Nous vous enverrons un e-mail contenant des instructions pour le récupérer",
            "forgot.page.helper": "Vous ne recevez pas d'e-mail pour réinitialiser votre mot de passe ? Alors l'adresse e-mail utilisée ne nous est pas connue. Vous ne trouvez pas ?",
            "forgot.page.helper.link": "Contacter le service client",
            "login.register.helper": "Veuillez utiliser votre Bouwmaat Pass pour vous inscrire. En cas de problème, veuillez contacter le {link}.",
            "login.register.link": "service client",
            "login.createacct.helper": "Si vous n'avez pas de compte en ligne, veuillez créer votre compte {link}.",
            "login.createacct.link": "ici",
            "next.button": "SUIVANT",
            "otp.page.title": "VÉRIFIEZ VOTRE IDENTITÉ",
            "otp.field.label": "Saisissez l'OTP ici",
            "otp.field.placeholder": "Numéro OTP",
            "otp.verify.button": "VÉRIFIER",
            "otp.cancel.button": "ANNULER",
            "otp.alert": "Le code OTP a été envoyé à {Email}. Veuillez saisir le code OTP reçu pour valider.",
            "otp.resend.link": "Vous n'avez pas reçu l'OTP ? Cliquez ici pour le renvoyer",
            "otp.resent.message": "OTP envoyé. Cliquez à nouveau si vous ne l'avez pas reçu.",
            "otp.resend.timer": "Vous pourrez envoyer un nouvel OTP dans {X} secondes.",
            "otp.error.invalid": "OTP invalide. Veuillez réessayer. Il vous reste {X} tentative(s).",
            "changepw.title": "RÉINITIALISER LE MOT DE PASSE",
            "changepw.newpassword.label": "Nouveau mot de passe",
            "changepw.confirmpassword.label": "Confirmer le mot de passe",
            "changepw.req.length": "{min}-{max} caractères",
            "changepw.req.uppercase": "Au moins une lettre majuscule doit être présente",
            "changepw.req.number": "Au moins un chiffre doit être présent",
            "changepw.req.symbol": "Au moins un des symboles suivants ( {symbols} ) doit être présent",
            "changepw.req.consecutive": "Ne contient pas plus de {n} caractères consécutifs de {fields}",
            "changepw.field.firstname": "prénom",
            "changepw.field.lastname": "nom de famille",
            "changepw.field.username": "nom d'utilisateur",
            "changepw.field.email": "e-mail",
            "changepw.strength.label": "Force du mot de passe",
            "changepw.strength.weak": "Faible",
            "changepw.strength.fair": "Moyen",
            "changepw.strength.good": "Suffisant",
            "changepw.strength.strong": "Parfait !",
            "changepw.error.required": "Le nouveau mot de passe est requis.",
            "changepw.error.requirements": "Veuillez satisfaire à toutes les exigences du mot de passe.",
            "changepw.error.mismatch": "Les mots de passe ne correspondent pas. Veuillez réessayer.",
            "changepw.expired.title": "Lien de mot de passe expiré",
            "changepw.expired.message": "Votre lien de réinitialisation du mot de passe a expiré. Veuillez utiliser un lien valide pour réinitialiser votre mot de passe.",
            "psm.title": "Réinitialiser le mot de passe",
            "psm.alert": "Vous recevrez sous peu un e-mail de réinitialisation du mot de passe si \"EMAIL\" est associé à un compte.",
            "psm.error": "Une erreur s'est produite",
            "goback.login": "Retour à la page de connexion",
            "changepw.success.title": "Mot de passe modifié avec succès",
            "changepw.success.text": "Votre mot de passe a été modifié avec succès",
            "login.error.invalid": "Nom d'utilisateur ou mot de passe invalide. Il vous reste {X} tentative(s)."
        },
        nl: {
            "login.page.title": "INLOGGEN",
            "login.page.button": "INLOGGEN",
            "email.field.placeholder": "E-mail",
            "email.field.label": "E-mailadres",
            "password.field.label": "Wachtwoord",
            "password.field.placeholder": "Wachtwoord",
            "forgot.password.link": "Wachtwoord vergeten?",
            "reset.password": "WACHTWOORD WIJZIGEN",
            "reset.password.subtext": "We sturen je een e-mail met instructies om je wachtwoord opnieuw in te stellen.",
            "forgot.page.helper": "Geen e-mail ontvangen? Controleer of het juiste e-mailadres is ingevoerd, of het opgegeven e-mailadres is niet bij ons bekend.",
            "forgot.page.helper.link": "Neem contact op met onze klantenservice.",
            "login.register.helper": "Registreer je met je Bouwmaat-pas. Hulp nodig? Neem contact op met onze {link}.",
            "login.register.link": "klantenservice",
            "login.createacct.helper": "Nog geen online account? Maak dan {link} een account aan",
            "login.createacct.link": "hier",
            "next.button": "VOLGENDE",
            "otp.page.title": "BEVESTIG DAT JIJ HET BENT",
            "otp.field.label": "Vul eenmalige login code in",
            "otp.field.placeholder": "Eenmalige code",
            "otp.verify.button": "BEVESTIG",
            "otp.cancel.button": "ANNULEER",
            "otp.alert": "De eenmalige code is verzonden naar {Email}. Vul de code in om verder te gaan.",
            "otp.resend.link": "Geen eenmalige code ontvangen? Vraag een nieuwe code aan.",
            "otp.resent.message": "Eenmalige code verzonden. Klik opnieuw als je deze niet hebt ontvangen.",
            "otp.resend.timer": "Je kunt over {X} seconden een nieuwe code aanvragen.",
            "otp.error.invalid": "Ongeldige eenmalige code. Je mag het nog {X} keer proberen.",
            "changepw.title": "NIEUW WACHTWOORD INSTELLEN",
            "changepw.newpassword.label": "Vul een nieuw wachtwoord in",
            "changepw.confirmpassword.label": "Bevestig wachtwoord",
            "changepw.req.length": "{min}-{max} karakters",
            "changepw.req.uppercase": "Minimaal één hoofdletter",
            "changepw.req.number": "Minimaal één cijfer",
            "changepw.req.symbol": "Minimaal één speciaal karakter {symbols}",
            "changepw.req.consecutive": "Bevat niet meer dan {n} opeenvolgende tekens van {fields}",
            "changepw.field.firstname": "voornaam",
            "changepw.field.lastname": "achternaam",
            "changepw.field.username": "gebruikersnaam",
            "changepw.field.email": "e-mailadres",
            "changepw.strength.label": "Wachtwoordsterkte",
            "changepw.strength.weak": "Zwak",
            "changepw.strength.fair": "Gemiddeld",
            "changepw.strength.good": "Goed",
            "changepw.strength.strong": "Uitstekend",
            "changepw.error.required": "Nieuw wachtwoord is vereist.",
            "changepw.error.requirements": "Voldoe aan alle wachtwoordvereisten.",
            "changepw.error.mismatch": "De wachtwoorden komen niet overeen. Probeer het opnieuw.",
            "changepw.expired.title": "Wachtwoordlink verlopen",
            "changepw.expired.message": "Je wachtwoordlink is verlopen. Gebruik een geldige link om je wachtwoord opnieuw in te stellen.",
            "psm.title": "NIEUW WACHTWOORD INSTELLEN",
            "psm.alert": "Als 'EMAIL' is gekoppeld aan een account, ontvang je een e-mail om je wachtwoord opnieuw in te stellen.",
            "psm.error": "Er is iets misgegaan",
            "goback.login": "Terug naar inloggen",
            "changepw.success.title": "Wachtwoord gewijzigd",
            "changepw.success.text": "Je wachtwoord is gewijzigd",
            "login.error.invalid": "De combinatie van e-mailadres en wachtwoord is niet geldig. Je mag het nog {X} keer proberen."
        },
        tr: {
            "login.page.title": "GİRİŞ YAP",
            "login.page.button": "GİRİŞ YAP",
            "email.field.placeholder": "e-posta",
            "email.field.label": "E-posta adresi",
            "password.field.label": "Şifre",
            "password.field.placeholder": "Şifre",
            "forgot.password.link": "Şifremi Unuttum",
            "reset.password": "ŞİFREYİ SIFIRLA",
            "reset.password.subtext": "Şifrenizi nasıl kurtaracağınıza dair talimatları içeren bir e-posta göndereceğiz",
            "forgot.page.helper": "Şifrenizi sıfırlamak için bir e-posta almadınız mı? O halde kullanılan e-posta adresi bizde kayıtlı değil. Sorunu çözemiyor musunuz?",
            "forgot.page.helper.link": "Müşteri hizmetleriyle iletişime geçin",
            "login.register.helper": "Kaydolmak için lütfen Bouwmaat Pass'inizi kullanın. Herhangi bir sorun yaşarsanız lütfen {link} ile iletişime geçin.",
            "login.register.link": "müşteri hizmetleri",
            "login.createacct.helper": "Çevrimiçi bir hesabınız yoksa lütfen hesabınızı {link} oluşturun.",
            "login.createacct.link": "buradan",
            "next.button": "İLERİ",
            "otp.page.title": "KİMLİĞİNİZİ DOĞRULAYIN",
            "otp.field.label": "OTP'yi buraya girin",
            "otp.field.placeholder": "OTP numarası",
            "otp.verify.button": "DOĞRULA",
            "otp.cancel.button": "İPTAL",
            "otp.alert": "OTP, {Email} adresine gönderildi. Doğrulamak için aldığınız OTP'yi girin.",
            "otp.resend.link": "OTP almadınız mı? Yeniden göndermek için buraya tıklayın",
            "otp.resent.message": "OTP gönderildi. Almadıysanız tekrar tıklayın.",
            "otp.resend.timer": "{X} saniye sonra yeni bir OTP gönderebilirsiniz.",
            "otp.error.invalid": "Geçersiz OTP girildi. Lütfen tekrar deneyin. {X} deneme hakkınız kaldı.",
            "changepw.title": "ŞİFREYİ SIFIRLA",
            "changepw.newpassword.label": "Yeni şifre",
            "changepw.confirmpassword.label": "Şifreyi onayla",
            "changepw.req.length": "{min}-{max} karakter",
            "changepw.req.uppercase": "En az 1 büyük harf içermelidir",
            "changepw.req.number": "En az 1 rakam içermelidir",
            "changepw.req.symbol": "Aşağıdaki sembollerden en az biri bulunmalıdır ( {symbols} )",
            "changepw.req.consecutive": "{fields} içinden {n} karakterden fazla ardışık karakter içermemelidir",
            "changepw.field.firstname": "ad",
            "changepw.field.lastname": "soyad",
            "changepw.field.username": "kullanıcı adı",
            "changepw.field.email": "e-posta",
            "changepw.strength.label": "Şifre gücü",
            "changepw.strength.weak": "Zayıf",
            "changepw.strength.fair": "Orta",
            "changepw.strength.good": "Yeterli",
            "changepw.strength.strong": "Mükemmel!",
            "changepw.error.required": "Yeni şifre gereklidir.",
            "changepw.error.requirements": "Lütfen tüm şifre gereksinimlerini karşılayın.",
            "changepw.error.mismatch": "Şifreler eşleşmiyor. Lütfen tekrar deneyin",
            "changepw.expired.title": "Şifre Bağlantısının Süresi Doldu",
            "changepw.expired.message": "Şifre sıfırlama bağlantınızın süresi doldu. Lütfen şifrenizi sıfırlamak için geçerli bir bağlantı kullanın.",
            "psm.title": "Şifreyi Sıfırla",
            "psm.alert": "\"EMAIL\" bir hesapla ilişkilendirilmişse kısa süre içinde bir şifre sıfırlama e-postası alacaksınız.",
            "psm.error": "Bir şeyler ters gitti",
            "goback.login": "Giriş Sayfasına Geri Dön",
            "changepw.success.title": "Şifre Başarıyla Değiştirildi",
            "changepw.success.text": "Şifreniz başarıyla değiştirildi",
            "login.error.invalid": "Geçersiz kullanıcı adı veya şifre. {X} deneme hakkınız kaldı."
        },
        pl: {
            "login.page.title": "ZALOGUJ SIĘ",
            "login.page.button": "ZALOGUJ SIĘ",
            "email.field.placeholder": "e-mail",
            "email.field.label": "Adres e-mail",
            "password.field.label": "Hasło",
            "password.field.placeholder": "Hasło",
            "forgot.password.link": "Nie pamiętam hasła",
            "reset.password": "ZRESETUJ HASŁO",
            "reset.password.subtext": "Wyślemy Ci e-mail z instrukcjami, jak je odzyskać",
            "forgot.page.helper": "Nie otrzymujesz e-maila umożliwiającego zresetowanie hasła? Oznacza to, że podany adres e-mail nie jest nam znany. Nie możesz sobie poradzić?",
            "forgot.page.helper.link": "Skontaktuj się z obsługą klienta",
            "login.register.helper": "Aby się zarejestrować, użyj karty Bouwmaat Pass. W razie problemów skontaktuj się z {link}.",
            "login.register.link": "obsługą klienta",
            "login.createacct.helper": "Jeśli nie masz konta online, utwórz swoje konto {link}.",
            "login.createacct.link": "tutaj",
            "next.button": "DALEJ",
            "otp.page.title": "ZWERYFIKUJ SWOJĄ TOŻSAMOŚĆ",
            "otp.field.label": "Wprowadź kod OTP tutaj",
            "otp.field.placeholder": "Numer OTP",
            "otp.verify.button": "ZWERYFIKUJ",
            "otp.cancel.button": "ANULUJ",
            "otp.alert": "Kod OTP został wysłany na adres {Email}. Wprowadź otrzymany kod OTP, aby zweryfikować.",
            "otp.resend.link": "Nie otrzymałeś kodu OTP? Kliknij tutaj, aby wysłać go ponownie",
            "otp.resent.message": "Kod OTP został wysłany. Kliknij ponownie, jeśli go nie otrzymałeś.",
            "otp.resend.timer": "Nowy kod OTP będzie można wysłać za {X} sekund.",
            "otp.error.invalid": "Podano nieprawidłowy kod OTP. Spróbuj ponownie. Pozostało Ci {X} prób(y).",
            "changepw.title": "ZRESETUJ HASŁO",
            "changepw.newpassword.label": "Nowe hasło",
            "changepw.confirmpassword.label": "Potwierdź hasło",
            "changepw.req.length": "{min}-{max} znaków",
            "changepw.req.uppercase": "Musi zawierać co najmniej 1 wielką literę",
            "changepw.req.number": "Musi zawierać co najmniej 1 cyfrę",
            "changepw.req.symbol": "Musi zawierać co najmniej jeden z następujących symboli ( {symbols} )",
            "changepw.req.consecutive": "Nie zawiera więcej niż {n} kolejnych znaków z {fields}",
            "changepw.field.firstname": "imię",
            "changepw.field.lastname": "nazwisko",
            "changepw.field.username": "nazwa użytkownika",
            "changepw.field.email": "e-mail",
            "changepw.strength.label": "Siła hasła",
            "changepw.strength.weak": "Słabe",
            "changepw.strength.fair": "Średnie",
            "changepw.strength.good": "Wystarczające",
            "changepw.strength.strong": "Doskonałe!",
            "changepw.error.required": "Nowe hasło jest wymagane.",
            "changepw.error.requirements": "Spełnij wszystkie wymagania dotyczące hasła.",
            "changepw.error.mismatch": "Hasła nie są zgodne. Spróbuj ponownie",
            "changepw.expired.title": "Link do zmiany hasła wygasł",
            "changepw.expired.message": "Twój link do zresetowania hasła wygasł. Użyj ważnego linku, aby zresetować hasło.",
            "psm.title": "Zresetuj hasło",
            "psm.alert": "Wkrótce otrzymasz e-mail z linkiem do zresetowania hasła, jeśli \"EMAIL\" jest powiązany z kontem.",
            "psm.error": "Coś poszło nie tak",
            "goback.login": "Powrót do strony logowania",
            "changepw.success.title": "Hasło zostało pomyślnie zmienione",
            "changepw.success.text": "Twoje hasło zostało pomyślnie zmienione",
            "login.error.invalid": "Nieprawidłowa nazwa użytkownika lub hasło. Pozostało Ci {X} prób(y)."
        }
    };

    function tr(key) {
        /* Default to 'nl' so any tr() call before getLocale() resolves (or on a
           page exposing no locale signal) renders Dutch rather than English. */
        var locale = localStorage.getItem("mo_locale") || "nl";
        var dict = TRANSLATIONS[locale] || TRANSLATIONS.nl || TRANSLATIONS.en;
        if (dict && dict[key] != null) return dict[key];
        if (TRANSLATIONS.nl && TRANSLATIONS.nl[key] != null) return TRANSLATIONS.nl[key];
        if (TRANSLATIONS.en && TRANSLATIONS.en[key] != null) return TRANSLATIONS.en[key];
        return key;
    }

    /* Backend login errors talk about the "username" where our UI shows an
       email field. Two normalizations, login pages only:
       1. Both-fields variants ("Invalid username/email or password.",
          "Ongeldige gebruikersnaam/e-mailadres of wachtwoord.") — wording
          varies per locale, so no string comparison: when the message contains
          '/', drop the WORD left of it (plus the slash) and keep the rest
          -> "Invalid email or password.".
       2. Single-word variants ("Invalid username or password." on
          /moas/validatepassword) — swap the word itself for the email wording,
          preserving a leading capital. en + nl for now; add pairs for other
          locales when the backend copy is known. */
    function cleanLoginErrorMessage(msg) {
        /* The backend's "not authorized for THIS application" error
           (error.idp.policy.not.found.not.authorized) is replaced with a friendly
           message + customer-service link. The backend may render it in English OR
           Dutch (its server-side locale can differ from our mo_locale), so detect
           EITHER source string, then pick the friendly copy by the ACTIVE locale:
           nl -> Dutch, en -> English. Any other locale falls through to the raw
           message (and any other message to the normal cleaning below). Returns
           HTML — the three login handlers insert the result via innerHTML. */
        var mmLocale = localStorage.getItem("mo_locale") || "nl";
        var mmMsg = msg.trim();
        var mmIsAuthAppError =
            mmMsg === "U bent niet bevoegd om in te loggen op deze applicatie." ||
            mmMsg === "You are not authorized to login into this application.";
        if (mmIsAuthAppError && mmLocale === "nl") {
            return 'Er ging iets mis. Probeer het opnieuw of neem contact op met onze ' +
                '<a href="' + MO_URLS.customerService + '" style="color:inherit;text-decoration:underline;font-weight:600;">klantenservice</a>.';
        }
        if (mmIsAuthAppError && mmLocale === "en") {
            return 'Something went wrong. Please try again or contact our ' +
                '<a href="' + MO_URLS.customerService + '" style="color:inherit;text-decoration:underline;font-weight:600;">customer service</a>.';
        }

        /* The backend's "not authorized to login" lockout message (distinct from
           the "...op deze applicatie"/"...this application" case above) is
           replaced with a friendly retry message pointing at a one-time login
           code. Same locale-detect-by-active-mo_locale approach as above. */
        var mmIsNotAuthorizedError =
            mmMsg === "U bent niet bevoegd om in te loggen." ||
            mmMsg === "You are not authorized to login.";
        if (mmIsNotAuthorizedError && mmLocale === "nl") {
            return 'Te vaak geprobeerd in te loggen. Probeer het over 5 minuten opnieuw';
        }
        if (mmIsNotAuthorizedError && mmLocale === "en") {
            return 'Too many login attempts. Please try again in 5 minutes.';
        }

        /* Wrong-password attempts-remaining message on /moas/validatepassword,
           NL only (other locales keep the generic username/gebruikersnaam swap
           below until their backend copy is confirmed, same pattern as the two
           blocks above). Backend renders "Ongeldige gebruikersnaam of wachtwoord.
           U heeft nog {X} meer poging(en) over." â€” detect by prefix (wording
           after "nog" carries the live attempt count, so no exact-match compare),
           pull out the number, and substitute it into the friendlier copy. */
        if (mmLocale === "nl" && mmMsg.indexOf("Ongeldige gebruikersnaam of wachtwoord. U heeft nog") === 0) {
            var mmAttemptsLeft = mmMsg.match(/\d+/);
            if (mmAttemptsLeft) {
                return tr("login.error.invalid").replace("{X}", mmAttemptsLeft[0]);
            }
        }

        /* /moas/idp/userlogin: the backend sometimes fails to localize the
           both-fields invalid-credentials message and renders it in English
           regardless of mo_locale ("Invalid username/email or password.").
           When the active locale is nl, translate that specific English
           string directly instead of letting it fall through to the generic
           "/" split below (which would only strip "username" and leave the
           rest in English). Prefix match, not exact-equality, in case the
           backend appends trailing punctuation/whitespace differences. */
        if (mmLocale === "nl" && mmMsg.indexOf("Invalid username/email or password") === 0) {
            return "Ongeldig e-mailadres of wachtwoord.";
        }

        if (msg.indexOf("/") !== -1) {
            msg = msg.replace(/\S+\//g, "").replace(/\s{2,}/g, " ").trim();
        }
        msg = msg.replace(/username/gi, function (m) {
            return m.charAt(0) === "U" ? "Email" : "email";
        });
        msg = msg.replace(/gebruikersnaam/gi, function (m) {
            return m.charAt(0) === "G" ? "E-mailadres" : "e-mailadres";
        });
        return msg;
    }

    /* Register-helper copy below the login button; {link} resolves to the
       Customer Service anchor pointing at MO_URLS.supportPage in every locale. */
    function registerHelperHtml() {
        return tr("login.register.helper").replace(
            "{link}",
            '<a href="' + MO_URLS.supportPage + '">' + tr("login.register.link") + "</a>"
        );
    }

    /* ── SSO REGISTER-ERROR (param-driven, no form submission) ──
       When the page URL carries is_exist=false (bookmarked SSO link, account
       not found), show the register-error message under the email field with
       the standard error treatment (red border + cross icon on the field).
       Runs on every tick on all three login endpoints; the param never leaves
       location.search, so every write is guarded. The message is NOT cleared
       on input — it is request-driven guidance, not a wrong-input error.
       The cross icon reuses id mo-userlogin-icon so handleLoginErrors() treats
       it as exempt and keeps the field's mo-input-error class. */
    /* True only for is_exist=false — the bookmarked-SSO-link, account-not-found
       case. Shared by the register error (shows it) and the create-account
       helper (hides itself: the two are mutually exclusive). */
    function isRegisterErrorRequest() {
        var v = getUrlParam(MO_REGISTER_ERROR_PARAM);
        return v != null && v.trim().toLowerCase() === MO_REGISTER_ERROR_VALUE;
    }

    function applyRegisterErrorParam() {
        if (!isRegisterErrorRequest()) return;
        var emailInp = document.getElementById("username");
        if (!emailInp) return;

        /* Message anchor is STEP-AWARE. Step 1: after the email field group
           (.mo-fg), OUTSIDE it. Step 2 (incl. userlogin?username=... which lands
           straight on the password step): the email .mo-fg is force-hidden and
           the email lives in the read-only #mo-user-display box — anchor the
           message right below THAT box instead. #mo-user-display is created by
           applyPasswordStep on a later tick, so re-evaluate the anchor on every
           tick and move the node only when it isn't already in place (the
           previousElementSibling guard keeps this observer-loop safe). */
        var regUserDisplay = document.getElementById("mo-user-display");
        var regAnchor = regUserDisplay || emailInp.closest(".mo-fg") || emailInp.closest(".row") || emailInp.parentNode;
        var regErr = document.getElementById("mo-register-error");
        if (!regErr) {
            regErr = document.createElement("div");
            regErr.id = "mo-register-error";
        }
        if (regErr.previousElementSibling !== regAnchor) {
            regAnchor.parentNode.insertBefore(regErr, regAnchor.nextSibling);
        }
        /* The CSS margin-top of -8px tucks the message under the email .mo-fg's
           14px bottom margin (step 1). Below #mo-user-display there is no such
           gap, so override to a small positive margin there. Guarded writes. */
        if (regUserDisplay) {
            if (regErr.style.marginTop !== "6px") regErr.style.setProperty("margin-top", "6px", "important");
        } else if (regErr.style.marginTop !== "") {
            regErr.style.removeProperty("margin-top");
        }
        /* Locale re-sync every tick (late <html lang>) — compare before write. */
        var regHtml = registerHelperHtml();
        if (regErr.innerHTML !== regHtml) regErr.innerHTML = regHtml;

        /* Step 2: red treatment on the visible read-only email box (the hidden
           #username input keeps its own, invisible there). Icon reuses id
           mo-email-server-icon so handleLoginErrors() leaves it alone. If the
           user's password input clears these (moLoginClear), the next tick
           re-applies them — the register error persists for the whole visit. */
        if (regUserDisplay) {
            if (!regUserDisplay.classList.contains("border-danger")) {
                regUserDisplay.classList.add("border", "border-danger");
            }
            if (!regUserDisplay.querySelector(".mo-error-icon")) {
                regUserDisplay.style.position = "relative";
                regUserDisplay.style.paddingRight = "40px";
                var regDispIcon = document.createElement("span");
                regDispIcon.id = "mo-email-server-icon";
                regDispIcon.className = "mo-error-icon";
                regDispIcon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
                regUserDisplay.appendChild(regDispIcon);
            }
        }

        /* Password field (when visible): same red treatment — border + cross
           inside its .mo-pw-wrap (left of the eye toggle). The wrap is created by
           applyPasswordStep/applyEmailPasswordStep on a later tick, so this
           simply applies once the wrap exists. Icon reuses id mo-pw-server-icon
           so handleLoginErrors() leaves it (and the field's mo-input-error class)
           alone; if the user's typing clears it via moLoginClear, the next tick
           re-applies. All writes guarded -> observer-loop safe. */
        var regPw = document.getElementById("plaintextPassword");
        if (regPw && regPw.style.display !== "none" && !regPw.classList.contains("d-none")) {
            if (!regPw.classList.contains("mo-input-error")) {
                regPw.classList.add("border", "border-danger", "mo-input-error");
            }
            var regPwWrap = regPw.closest(".mo-pw-wrap");
            if (regPwWrap && !regPwWrap.querySelector(".mo-error-icon")) {
                var regPwIcon = document.createElement("span");
                regPwIcon.id = "mo-pw-server-icon";
                regPwIcon.className = "mo-error-icon";
                regPwIcon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
                regPwWrap.appendChild(regPwIcon);
            }
        }

        /* Red border on the email field. MUST be guarded with contains(): an
           unconditional classList.add re-SETS the class attribute even when the
           token is already present, which queues a mutation record on every
           observer tick -> infinite loop (froze the whole login page). */
        if (!emailInp.classList.contains("mo-input-error")) {
            emailInp.classList.add("mo-input-error");
        }

        /* Cross icon inside the field — same .mo-input-wrap pattern as
           handleLoginErrors(); all structural writes happen once (guarded by the
           icon's absence, so observer ticks are loop-safe). */
        var regWrap = emailInp.parentNode;
        if (!regWrap.querySelector(".mo-error-icon")) {
            if (regWrap.id === "userName") {
                /* Two-step page: #userName is already the field's own container —
                   make it the positioning context instead of adding a wrapper. */
                regWrap.style.position = "relative";
                regWrap.style.display = "flex";
                regWrap.style.alignItems = "center";
            } else if (!regWrap.classList.contains("mo-input-wrap")) {
                var w = document.createElement("div");
                w.className = "mo-input-wrap";
                w.style.position = "relative";
                w.style.display = "flex";
                w.style.alignItems = "center";
                w.style.width = "100%";
                emailInp.parentNode.insertBefore(w, emailInp);
                w.appendChild(emailInp);
                regWrap = w;
            }
            var regIcon = document.createElement("span");
            regIcon.id = "mo-userlogin-icon";
            regIcon.className = "mo-error-icon";
            regIcon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
            regWrap.appendChild(regIcon);
        }
    }

    /* ── CREATE-ACCOUNT HELPER (login pages, below the button) ──
       "If you do not have an Online Account, please create your account here."
       with "here" -> MO_URLS.createAccount. Shows ONLY when the server
       rendered an error banner (errorOnPage() — e.g. wrong credentials /
       unknown user), and never when is_exist=false (there the register error
       above replaces it — one message at a time). errorOnPage() stays true for
       the whole visit (the hidden banner keeps its text), so once shown the
       helper persists. Reuses the #mo-register-helper id so the existing
       neutral #mo-css styling applies. Insert-once + compare-before-write, so
       it's observer-loop safe. */
    function createAccountHelperHtml() {
        return tr("login.createacct.helper").replace(
            "{link}",
            '<a href="' + MO_URLS.createAccount + '">' + tr("login.createacct.link") + "</a>"
        );
    }

    function applyCreateAccountHelper() {
        if (isRegisterErrorRequest()) return;   // register error owns this visit
        if (!errorOnPage()) return;             // only alongside a server error
        var btn = document.getElementById("loginbutton");
        if (!btn) return;
        var helper = document.getElementById("mo-register-helper");
        if (!helper) {
            helper = document.createElement("div");
            helper.id = "mo-register-helper";
            var helperRow = btn.closest(".row") || btn.parentNode;
            helperRow.parentNode.insertBefore(helper, helperRow.nextSibling);
        }
        /* Locale re-sync every tick (late <html lang>) — compare before write. */
        var helperHtml = createAccountHelperHtml();
        if (helper.innerHTML !== helperHtml) helper.innerHTML = helperHtml;
    }

    /* Re-sync every locale-dependent text node on the login page on EVERY tick.
       The custom nodes are inserted once (guarded by id), but their text must be
       refreshed later: on a cold load the /openidsso 302 means our JS never ran
       to capture ?request_locale, so <html lang> is the only locale carrier and
       miniOrange can set it AFTER our first ticks — labels first render in English
       and must correct to the resolved locale once it settles. Compare before
       writing so a matched value doesn't retrigger the MutationObserver. */
    function syncLoginText() {
        function setText(el, val) { if (el && el.textContent !== val) el.textContent = val; }
        function setHtml(el, val) { if (el && el.innerHTML !== val) el.innerHTML = val; }
        function setPh(el, val) { if (el && el.getAttribute("placeholder") !== val) el.setAttribute("placeholder", val); }

        setText(document.getElementById("mo-title"), tr("login.page.title"));
        setHtml(document.getElementById("mo-email-lbl"), tr("email.field.label") + ' <span class="mo-req">*</span>');
        setHtml(document.getElementById("mo-pw-lbl"), tr("password.field.label") + ' <span class="mo-req">*</span>');
        setText(document.getElementById("mo-user-display-lbl"), tr("email.field.label"));
        setText(document.getElementById("mo-forgot"), tr("forgot.password.link"));
        setPh(document.getElementById("username"), tr("email.field.placeholder"));
        setPh(document.getElementById("plaintextPassword"), tr("password.field.placeholder"));
    }

    /* ── STEP 1: Email page UI ── */
    function applyEmailStep() {
        var wrapper = document.getElementById("login-wrapper");
        if (!wrapper) return;

        syncLoginText();

        /* LOG IN title — insert once before any form child */
        if (!document.getElementById("mo-title")) {
            var t = document.createElement("span");
            t.id = "mo-title"; t.className = "px-2 mx-1"; t.textContent = tr("login.page.title");
            wrapper.insertBefore(t, wrapper.firstChild);
        }

        /* Email label above the username input */
        var userDiv = document.getElementById("userName");
        if (userDiv && !document.getElementById("mo-email-lbl")) {
            var fg = document.createElement("div"); fg.className = "mo-fg";
            var lbl = document.createElement("label");
            lbl.id = "mo-email-lbl"; lbl.className = "mo-lbl";
            lbl.setAttribute("for", "username");
            lbl.innerHTML = tr("email.field.label") + ' <span class="mo-req">*</span>';
            fg.appendChild(lbl);
            userDiv.parentNode.insertBefore(fg, userDiv);
            fg.appendChild(userDiv);
            var inp = document.getElementById("username");
            if (inp) inp.setAttribute("placeholder", tr("email.field.placeholder"));
        }



        /* Button label */
        var btn = document.getElementById("loginbutton");
        setBtnArrowLabel(btn, tr("login.page.button"));

        /* Server-rendered error banner -> show below the email field.
           Guarded by #mo-userlogin-error so it runs ONCE (avoids the
           observer infinite-loop from repeated DOM mutations). */
        var isPageHasError = errorOnPage();
        var unameEl = document.getElementById("username");
        if (isPageHasError && !document.getElementById("mo-userlogin-error") && !(unameEl && unameEl.dataset.moUserErrDismissed)) {
            console.log('IN ERROR SECTION ');
            var message = cleanLoginErrorMessage($('#error-alert-message .errorMessage li span').text().trim());
            $('#userName').after(
                '<div id="mo-userlogin-error" class="error-message text-start" style="color:#E91616;">' + message + '</div>'
            );
            /* Red border + cross icon on the username field */
            $('#username').addClass('border border-danger mo-input-error');
            var userNameWrap = document.getElementById("userName");
            if (userNameWrap && !userNameWrap.querySelector(".mo-error-icon")) {
                userNameWrap.style.position = "relative";
                userNameWrap.style.display = "flex";
                userNameWrap.style.alignItems = "center";
                var ulIcon = document.createElement("span");
                ulIcon.id = "mo-userlogin-icon";
                ulIcon.className = "mo-error-icon";
                ulIcon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
                userNameWrap.appendChild(ulIcon);
            }
            /* Clear the error indicators once the user edits the email again */
            if (unameEl && !unameEl.dataset.moEmailClear) {
                unameEl.dataset.moEmailClear = "true";
                unameEl.addEventListener("input", function () {
                    this.dataset.moUserErrDismissed = "true";
                    $('#mo-userlogin-error').remove();
                    $('#mo-userlogin-icon').remove();
                    $('#username').removeClass('border border-danger mo-input-error');
                });
            }
            $('#error-alert-message').hide();
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

        syncLoginText();

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
            t.id = "mo-title"; t.className = "px-2 mx-1"; t.textContent = tr("login.page.title");
            wrapper.insertBefore(t, wrapper.firstChild);
        }

        /* Button label */
        var btn = document.getElementById("loginbutton");
        setBtnArrowLabel(btn, tr("login.page.button"));

        if (document.getElementById("mo-pw-lbl")) return; // already applied

        /* Password label above #plaintextPassword */
        var pwLbl = document.createElement("label");
        pwLbl.id = "mo-pw-lbl"; pwLbl.className = "mo-lbl";
        pwLbl.setAttribute("for", "plaintextPassword");
        pwLbl.innerHTML = tr("password.field.label") + ' <span class="mo-req">*</span>';
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
                userLbl.id = "mo-user-display-lbl";
                userLbl.textContent = tr("email.field.label");
                var userBox = document.createElement("div"); userBox.id = "mo-user-display";
                userBox.className = "mo-user-display";
                userBox.textContent = usernameVal;
                userFg.appendChild(userLbl); userFg.appendChild(userBox);
                pwLbl.parentNode.insertBefore(userFg, pwLbl);
            }
        }

        /* Guarded by #mo-pw-error so it appends ONCE (otherwise the observer
           re-runs this block and stacks duplicate error messages). */
        var isPageHasError = errorOnPage();
        if (isPageHasError && !document.getElementById("mo-pw-error")) {
            console.log('IN ERROR SECTION ')
            var message = cleanLoginErrorMessage($('#error-alert-message .errorMessage li span').text().trim());
            $('#mo-user-display').after(
                '<div id="mo-pw-error" class="error-message text-start" style="color:#E91616;">' + message + '</div>'
            );
            $('#username, #plaintextPassword').addClass('border border-danger');
            $('.mo-user-display').addClass('border border-danger');
            /* Red cross icon inside the read-only email display box */
            var userBox = document.getElementById("mo-user-display");
            if (userBox && !userBox.querySelector(".mo-error-icon")) {
                userBox.style.position = "relative";
                userBox.style.paddingRight = "40px";
                var emailErrIcon = document.createElement("span");
                emailErrIcon.id = "mo-email-server-icon";
                emailErrIcon.className = "mo-error-icon";
                emailErrIcon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
                userBox.appendChild(emailErrIcon);
            }
            $('#error-alert-message').hide();
        }

        /* Wrap password field in .mo-pw-wrap for eye toggle */
        var wrap = document.createElement("div"); wrap.className = "mo-pw-wrap";
        pwField.parentNode.insertBefore(wrap, pwField);
        wrap.appendChild(pwField);
        pwField.setAttribute("placeholder", tr("password.field.placeholder"));

        /* Eye toggle button */
        var EYE_OFF = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.3973 7.18582C12.7359 7.52457 12.9977 7.93617 13.1825 8.42061C13.3674 8.9052 13.4373 9.39159 13.3923 9.87978C13.3923 10.0401 13.3347 10.1758 13.2194 10.2869C13.104 10.398 12.9661 10.4535 12.8059 10.4535C12.6456 10.4535 12.5099 10.398 12.3988 10.2869C12.2877 10.1758 12.2321 10.0401 12.2321 9.87978C12.2856 9.51339 12.2554 9.16617 12.1417 8.83811C12.0279 8.5102 11.853 8.22818 11.6169 7.99207C11.3808 7.75596 11.0961 7.57673 10.7627 7.45436C10.4294 7.332 10.0779 7.3002 9.70815 7.35895C9.54787 7.36436 9.40954 7.31068 9.29315 7.19791C9.17662 7.08527 9.11572 6.94881 9.11044 6.78853C9.10503 6.62825 9.15655 6.48985 9.26503 6.37332C9.3735 6.25693 9.50787 6.1961 9.66815 6.19082C10.1532 6.13527 10.6406 6.19853 11.1304 6.38062C11.6203 6.56284 12.0426 6.83124 12.3973 7.18582ZM9.99982 4.99999C9.70385 4.99999 9.4135 5.01443 9.12878 5.04332C8.84405 5.07207 8.56065 5.11957 8.27857 5.18582C8.10121 5.22221 7.94148 5.19687 7.7994 5.10978C7.65732 5.0227 7.55961 4.89742 7.50628 4.73395C7.4528 4.5652 7.47044 4.40471 7.55919 4.25249C7.6478 4.10027 7.77648 4.00596 7.94523 3.96957C8.28079 3.88943 8.61975 3.83284 8.96211 3.79978C9.30461 3.76659 9.65051 3.74999 9.99982 3.74999C11.7904 3.74999 13.4352 4.21527 14.9342 5.14582C16.4331 6.07638 17.5858 7.33548 18.3923 8.92311C18.4479 9.02881 18.4882 9.13534 18.5134 9.2427C18.5385 9.35006 18.5511 9.4636 18.5511 9.58332C18.5511 9.70305 18.5407 9.81659 18.5198 9.92395C18.499 10.0313 18.4608 10.1378 18.4052 10.2435C18.15 10.7777 17.8396 11.2758 17.4742 11.7379C17.1088 12.2 16.7065 12.6244 16.2673 13.0112C16.1382 13.1267 15.9905 13.1744 15.8244 13.1546C15.6582 13.1349 15.5216 13.0518 15.4148 12.9054C15.308 12.759 15.2637 12.602 15.2819 12.4344C15.3001 12.2666 15.3738 12.125 15.5029 12.0096C15.8791 11.6687 16.222 11.2962 16.5319 10.8919C16.8418 10.4874 17.1088 10.0512 17.3332 9.58332C16.6387 8.18055 15.6352 7.06596 14.3227 6.23957C13.0102 5.41318 11.5693 4.99999 9.99982 4.99999ZM9.99982 15.4167C8.24551 15.4167 6.6376 14.9479 5.17607 14.0104C3.71454 13.0729 2.55273 11.8381 1.69065 10.306C1.62121 10.2003 1.57044 10.0855 1.53836 9.96145C1.50628 9.83756 1.49023 9.71152 1.49023 9.58332C1.49023 9.45513 1.50412 9.33117 1.5319 9.21145C1.55968 9.09187 1.60829 8.97492 1.67773 8.86061C1.9876 8.29436 2.33857 7.75506 2.73065 7.2427C3.12273 6.73048 3.57357 6.27138 4.08315 5.86541L2.20169 3.97103C2.08641 3.84714 2.02954 3.69999 2.03107 3.52957C2.03273 3.35916 2.09391 3.2136 2.21461 3.09291C2.3353 2.97221 2.48169 2.91187 2.65378 2.91187C2.82572 2.91187 2.97204 2.97221 3.09273 3.09291L16.9069 16.9071C17.0223 17.0225 17.0835 17.1653 17.0904 17.3356C17.0974 17.506 17.0362 17.6559 16.9069 17.7852C16.7862 17.9059 16.6398 17.9662 16.4677 17.9662C16.2958 17.9662 16.1495 17.9059 16.0288 17.7852L13.0961 14.8781C12.6045 15.0683 12.0994 15.2055 11.5807 15.29C11.062 15.3744 10.5351 15.4167 9.99982 15.4167ZM4.96148 6.74353C4.47315 7.12075 4.03426 7.54728 3.64482 8.02311C3.25537 8.49909 2.92926 9.01916 2.66648 9.58332C3.36093 10.9861 4.3644 12.1007 5.6769 12.9271C6.9894 13.7535 8.43037 14.1667 9.99982 14.1667C10.3577 14.1667 10.71 14.1426 11.0567 14.0946C11.4034 14.0465 11.7477 13.9723 12.0896 13.8719L11.035 12.7917C10.8663 12.8654 10.6977 12.9153 10.5294 12.9414C10.3612 12.9677 10.1847 12.9808 9.99982 12.9808C9.05426 12.9808 8.25162 12.651 7.5919 11.9912C6.93218 11.3315 6.60232 10.5289 6.60232 9.58332C6.60232 9.39846 6.61676 9.22193 6.64565 9.05374C6.67454 8.88541 6.72315 8.71686 6.79148 8.54811L4.96148 6.74353Z" fill="currentColor"/></svg>';
        var EYE_ON = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.99982 4.99999C11.7904 4.99999 13.4352 5.46527 14.9342 6.39582C16.4331 7.32638 17.5858 8.58548 18.3923 10.1731C18.4479 10.2788 18.4882 10.3853 18.5134 10.4927C18.5385 10.6001 18.5511 10.7136 18.5511 10.8333C18.5511 10.9531 18.5385 11.0666 18.5134 11.174C18.4882 11.2813 18.4479 11.3878 18.3923 11.4935C17.5858 13.0812 16.4331 14.3403 14.9342 15.2708C13.4352 16.2014 11.7904 16.6667 9.99982 16.6667C8.20926 16.6667 6.5644 16.2014 5.06523 15.2708C3.56607 14.3403 2.41343 13.0812 1.60732 11.4935C1.55176 11.3878 1.51149 11.2813 1.48649 11.174C1.4615 11.0666 1.449 10.9531 1.449 10.8333C1.449 10.7136 1.4615 10.6001 1.48649 10.4927C1.51149 10.3853 1.55176 10.2788 1.60732 10.1731C2.41343 8.58548 3.56607 7.32638 5.06523 6.39582C6.5644 5.46527 8.20926 4.99999 9.99982 4.99999ZM9.99982 6.24999C8.43037 6.24999 6.9894 6.66318 5.6769 7.48957C4.3644 8.31596 3.36093 9.43055 2.66648 10.8333C3.36093 12.2361 4.3644 13.3507 5.6769 14.1771C6.9894 15.0035 8.43037 15.4167 9.99982 15.4167C11.5693 15.4167 13.0102 15.0035 14.3227 14.1771C15.6352 13.3507 16.6387 12.2361 17.3332 10.8333C16.6387 9.43055 15.6352 8.31596 14.3227 7.48957C13.0102 6.66318 11.5693 6.24999 9.99982 6.24999ZM9.99982 8.02082C10.7776 8.02082 11.4396 8.29403 11.9857 8.84044C12.5319 9.38684 12.805 10.0488 12.805 10.8264C12.805 11.6041 12.5319 12.2662 11.9857 12.8126C11.4396 13.359 10.7776 13.6322 9.99982 13.6322C9.22204 13.6322 8.55999 13.359 8.01357 12.8126C7.46718 12.2662 7.19398 11.6041 7.19398 10.8264C7.19398 10.0488 7.46718 9.38684 8.01357 8.84044C8.55999 8.29403 9.22204 8.02082 9.99982 8.02082ZM9.99982 9.27082C9.55926 9.27082 9.18398 9.42557 8.87398 9.73507C8.56398 10.0446 8.40898 10.4189 8.40898 10.8579C8.40898 11.2969 8.56398 11.6712 8.87398 11.9807C9.18398 12.2902 9.55926 12.445 9.99982 12.445C10.4404 12.445 10.8157 12.2902 11.1257 11.9807C11.4357 11.6712 11.5907 11.2969 11.5907 10.8579C11.5907 10.4189 11.4357 10.0446 11.1257 9.73507C10.8157 9.42557 10.4404 9.27082 9.99982 9.27082Z" fill="currentColor"/></svg>';
        var eyeBtn = document.createElement("button");
        eyeBtn.type = "button"; eyeBtn.className = "mo-eye";
        eyeBtn.setAttribute("aria-label", "Toggle password visibility");
        eyeBtn.innerHTML = EYE_OFF;
        eyeBtn.addEventListener("click", function () {
            var show = pwField.type === "password";
            pwField.type = show ? "text" : "password";
            eyeBtn.innerHTML = show ? EYE_ON : EYE_OFF;
        });
        if (!wrap.querySelector(".mo-eye")) wrap.appendChild(eyeBtn);

        /* On server error, add the red cross icon inside the password field
           (same look as the change-password page) */
        if (isPageHasError) {
            pwField.classList.add("mo-input-error");
            if (!wrap.querySelector(".mo-error-icon")) {
                var pwErrIcon = document.createElement("span");
                pwErrIcon.id = "mo-pw-server-icon";
                pwErrIcon.className = "mo-error-icon";
                pwErrIcon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
                wrap.appendChild(pwErrIcon);
            }
        }

        /* Clear all login error indicators once the user edits the password
           (message, red borders, and both cross icons) — like the reset page. */
        if (!pwField.dataset.moLoginClear) {
            pwField.dataset.moLoginClear = "true";
            pwField.addEventListener("input", function () {
                $('#mo-pw-error').remove();
                $('#mo-pw-server-icon, #mo-email-server-icon').remove();
                $('#username, #plaintextPassword').removeClass('border border-danger mo-input-error');
                $('.mo-user-display').removeClass('border border-danger').css('padding-right', '');
            });
        }

        /* Forgot password link only (no Remember me checkbox) */
        if (!document.getElementById("mo-bottom")) {
            var row = document.createElement("div"); row.id = "mo-bottom";
            var fl = document.createElement("a"); fl.id = "mo-forgot";
            fl.href = "/moas/idp/resetpassword"; fl.textContent = tr("forgot.password.link");
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

        // Clean existing styled error indicators.
        // Preserve the server-error icon/state owned by applyPasswordStep
        // (#mo-pw-server-icon) so its cross isn't wiped on every cycle.
        var hasServerIcon = !!document.getElementById("mo-pw-server-icon");
        var hasUserIcon = !!document.getElementById("mo-userlogin-icon");
        document.querySelectorAll(".mo-input-error").forEach(function (inp) {
            if (hasServerIcon && inp.id === "plaintextPassword") return;
            if (hasUserIcon && inp.id === "username") return;
            inp.classList.remove("mo-input-error");
        });
        document.querySelectorAll(".mo-error-icon").forEach(function (ico) {
            if (ico.id === "mo-pw-server-icon" || ico.id === "mo-email-server-icon" || ico.id === "mo-userlogin-icon") return;
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

    /* ── COMBINED EMAIL + PASSWORD STEP (redirecttoidplogin) ── */
    /* On this page both the email and password fields are visible at once,
       so we style both together — no two-step toggle and no read-only
       username box (the email field stays editable). */
    function applyEmailPasswordStep() {
        var wrapper = document.getElementById("login-wrapper");
        if (!wrapper) return;

        /* LOG IN title — insert once before any form child */
        if (!document.getElementById("mo-title")) {
            var t = document.createElement("span");
            t.id = "mo-title"; t.className = "px-2 mx-1"; t.textContent = tr("login.page.title");
            wrapper.insertBefore(t, wrapper.firstChild);
        }

        $('.d-flex.justify-content-center.container-fluid.w-100').addClass('h-100 align-items-center');
        $('.row.w-75.px-4').removeClass('w-75 px-4').addClass('w-100');
        $('.login-header').hide();

        /* Email label + placeholder */
        var userDiv = document.getElementById("userName");
        if (userDiv && !document.getElementById("mo-email-lbl")) {
            var fg = document.createElement("div"); fg.className = "mo-fg";
            var lbl = document.createElement("label");
            lbl.id = "mo-email-lbl"; lbl.className = "mo-lbl";
            lbl.setAttribute("for", "username");
            lbl.innerHTML = tr("email.field.label") + ' <span class="mo-req">*</span>';
            fg.appendChild(lbl);
            userDiv.parentNode.insertBefore(fg, userDiv);
            fg.appendChild(userDiv);
        }
        /* redirecttoidplogin only: drop the #userName id from the wrapper div */
        var userNameDiv = document.getElementById("userName");
        if (userNameDiv) userNameDiv.removeAttribute("id");
        var emailInp = document.getElementById("username");
        if (emailInp) emailInp.setAttribute("placeholder", tr("email.field.placeholder"));

        /* Password label + eye toggle + placeholder */
        var pwField = document.getElementById("plaintextPassword");
        if (pwField) {
            pwField.setAttribute("placeholder", tr("password.field.placeholder"));

            if (!document.getElementById("mo-pw-lbl")) {
                var pwLbl = document.createElement("label");
                pwLbl.id = "mo-pw-lbl"; pwLbl.className = "mo-lbl";
                pwLbl.setAttribute("for", "plaintextPassword");
                pwLbl.innerHTML = tr("password.field.label") + ' <span class="mo-req">*</span>';
                pwField.parentNode.insertBefore(pwLbl, pwField);
            }

            /* Wrap password field in .mo-pw-wrap for eye toggle (once) */
            if (!pwField.parentNode.classList.contains("mo-pw-wrap")) {
                var wrap = document.createElement("div"); wrap.className = "mo-pw-wrap";
                pwField.parentNode.insertBefore(wrap, pwField);
                wrap.appendChild(pwField);

                var EYE_OFF = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.3973 7.18582C12.7359 7.52457 12.9977 7.93617 13.1825 8.42061C13.3674 8.9052 13.4373 9.39159 13.3923 9.87978C13.3923 10.0401 13.3347 10.1758 13.2194 10.2869C13.104 10.398 12.9661 10.4535 12.8059 10.4535C12.6456 10.4535 12.5099 10.398 12.3988 10.2869C12.2877 10.1758 12.2321 10.0401 12.2321 9.87978C12.2856 9.51339 12.2554 9.16617 12.1417 8.83811C12.0279 8.5102 11.853 8.22818 11.6169 7.99207C11.3808 7.75596 11.0961 7.57673 10.7627 7.45436C10.4294 7.332 10.0779 7.3002 9.70815 7.35895C9.54787 7.36436 9.40954 7.31068 9.29315 7.19791C9.17662 7.08527 9.11572 6.94881 9.11044 6.78853C9.10503 6.62825 9.15655 6.48985 9.26503 6.37332C9.3735 6.25693 9.50787 6.1961 9.66815 6.19082C10.1532 6.13527 10.6406 6.19853 11.1304 6.38062C11.6203 6.56284 12.0426 6.83124 12.3973 7.18582ZM9.99982 4.99999C9.70385 4.99999 9.4135 5.01443 9.12878 5.04332C8.84405 5.07207 8.56065 5.11957 8.27857 5.18582C8.10121 5.22221 7.94148 5.19687 7.7994 5.10978C7.65732 5.0227 7.55961 4.89742 7.50628 4.73395C7.4528 4.5652 7.47044 4.40471 7.55919 4.25249C7.6478 4.10027 7.77648 4.00596 7.94523 3.96957C8.28079 3.88943 8.61975 3.83284 8.96211 3.79978C9.30461 3.76659 9.65051 3.74999 9.99982 3.74999C11.7904 3.74999 13.4352 4.21527 14.9342 5.14582C16.4331 6.07638 17.5858 7.33548 18.3923 8.92311C18.4479 9.02881 18.4882 9.13534 18.5134 9.2427C18.5385 9.35006 18.5511 9.4636 18.5511 9.58332C18.5511 9.70305 18.5407 9.81659 18.5198 9.92395C18.499 10.0313 18.4608 10.1378 18.4052 10.2435C18.15 10.7777 17.8396 11.2758 17.4742 11.7379C17.1088 12.2 16.7065 12.6244 16.2673 13.0112C16.1382 13.1267 15.9905 13.1744 15.8244 13.1546C15.6582 13.1349 15.5216 13.0518 15.4148 12.9054C15.308 12.759 15.2637 12.602 15.2819 12.4344C15.3001 12.2666 15.3738 12.125 15.5029 12.0096C15.8791 11.6687 16.222 11.2962 16.5319 10.8919C16.8418 10.4874 17.1088 10.0512 17.3332 9.58332C16.6387 8.18055 15.6352 7.06596 14.3227 6.23957C13.0102 5.41318 11.5693 4.99999 9.99982 4.99999ZM9.99982 15.4167C8.24551 15.4167 6.6376 14.9479 5.17607 14.0104C3.71454 13.0729 2.55273 11.8381 1.69065 10.306C1.62121 10.2003 1.57044 10.0855 1.53836 9.96145C1.50628 9.83756 1.49023 9.71152 1.49023 9.58332C1.49023 9.45513 1.50412 9.33117 1.5319 9.21145C1.55968 9.09187 1.60829 8.97492 1.67773 8.86061C1.9876 8.29436 2.33857 7.75506 2.73065 7.2427C3.12273 6.73048 3.57357 6.27138 4.08315 5.86541L2.20169 3.97103C2.08641 3.84714 2.02954 3.69999 2.03107 3.52957C2.03273 3.35916 2.09391 3.2136 2.21461 3.09291C2.3353 2.97221 2.48169 2.91187 2.65378 2.91187C2.82572 2.91187 2.97204 2.97221 3.09273 3.09291L16.9069 16.9071C17.0223 17.0225 17.0835 17.1653 17.0904 17.3356C17.0974 17.506 17.0362 17.6559 16.9069 17.7852C16.7862 17.9059 16.6398 17.9662 16.4677 17.9662C16.2958 17.9662 16.1495 17.9059 16.0288 17.7852L13.0961 14.8781C12.6045 15.0683 12.0994 15.2055 11.5807 15.29C11.062 15.3744 10.5351 15.4167 9.99982 15.4167ZM4.96148 6.74353C4.47315 7.12075 4.03426 7.54728 3.64482 8.02311C3.25537 8.49909 2.92926 9.01916 2.66648 9.58332C3.36093 10.9861 4.3644 12.1007 5.6769 12.9271C6.9894 13.7535 8.43037 14.1667 9.99982 14.1667C10.3577 14.1667 10.71 14.1426 11.0567 14.0946C11.4034 14.0465 11.7477 13.9723 12.0896 13.8719L11.035 12.7917C10.8663 12.8654 10.6977 12.9153 10.5294 12.9414C10.3612 12.9677 10.1847 12.9808 9.99982 12.9808C9.05426 12.9808 8.25162 12.651 7.5919 11.9912C6.93218 11.3315 6.60232 10.5289 6.60232 9.58332C6.60232 9.39846 6.61676 9.22193 6.64565 9.05374C6.67454 8.88541 6.72315 8.71686 6.79148 8.54811L4.96148 6.74353Z" fill="currentColor"/></svg>';
                var EYE_ON = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.99982 4.99999C11.7904 4.99999 13.4352 5.46527 14.9342 6.39582C16.4331 7.32638 17.5858 8.58548 18.3923 10.1731C18.4479 10.2788 18.4882 10.3853 18.5134 10.4927C18.5385 10.6001 18.5511 10.7136 18.5511 10.8333C18.5511 10.9531 18.5385 11.0666 18.5134 11.174C18.4882 11.2813 18.4479 11.3878 18.3923 11.4935C17.5858 13.0812 16.4331 14.3403 14.9342 15.2708C13.4352 16.2014 11.7904 16.6667 9.99982 16.6667C8.20926 16.6667 6.5644 16.2014 5.06523 15.2708C3.56607 14.3403 2.41343 13.0812 1.60732 11.4935C1.55176 11.3878 1.51149 11.2813 1.48649 11.174C1.4615 11.0666 1.449 10.9531 1.449 10.8333C1.449 10.7136 1.4615 10.6001 1.48649 10.4927C1.51149 10.3853 1.55176 10.2788 1.60732 10.1731C2.41343 8.58548 3.56607 7.32638 5.06523 6.39582C6.5644 5.46527 8.20926 4.99999 9.99982 4.99999ZM9.99982 6.24999C8.43037 6.24999 6.9894 6.66318 5.6769 7.48957C4.3644 8.31596 3.36093 9.43055 2.66648 10.8333C3.36093 12.2361 4.3644 13.3507 5.6769 14.1771C6.9894 15.0035 8.43037 15.4167 9.99982 15.4167C11.5693 15.4167 13.0102 15.0035 14.3227 14.1771C15.6352 13.3507 16.6387 12.2361 17.3332 10.8333C16.6387 9.43055 15.6352 8.31596 14.3227 7.48957C13.0102 6.66318 11.5693 6.24999 9.99982 6.24999ZM9.99982 8.02082C10.7776 8.02082 11.4396 8.29403 11.9857 8.84044C12.5319 9.38684 12.805 10.0488 12.805 10.8264C12.805 11.6041 12.5319 12.2662 11.9857 12.8126C11.4396 13.359 10.7776 13.6322 9.99982 13.6322C9.22204 13.6322 8.55999 13.359 8.01357 12.8126C7.46718 12.2662 7.19398 11.6041 7.19398 10.8264C7.19398 10.0488 7.46718 9.38684 8.01357 8.84044C8.55999 8.29403 9.22204 8.02082 9.99982 8.02082ZM9.99982 9.27082C9.55926 9.27082 9.18398 9.42557 8.87398 9.73507C8.56398 10.0446 8.40898 10.4189 8.40898 10.8579C8.40898 11.2969 8.56398 11.6712 8.87398 11.9807C9.18398 12.2902 9.55926 12.445 9.99982 12.445C10.4404 12.445 10.8157 12.2902 11.1257 11.9807C11.4357 11.6712 11.5907 11.2969 11.5907 10.8579C11.5907 10.4189 11.4357 10.0446 11.1257 9.73507C10.8157 9.42557 10.4404 9.27082 9.99982 9.27082Z" fill="currentColor"/></svg>';
                var eyeBtn = document.createElement("button");
                eyeBtn.type = "button"; eyeBtn.className = "mo-eye";
                eyeBtn.setAttribute("aria-label", "Toggle password visibility");
                eyeBtn.innerHTML = EYE_OFF;
                eyeBtn.addEventListener("click", function () {
                    var show = pwField.type === "password";
                    pwField.type = show ? "text" : "password";
                    eyeBtn.innerHTML = show ? EYE_ON : EYE_OFF;
                });
                if (!wrap.querySelector(".mo-eye")) wrap.appendChild(eyeBtn);

                /* Forgot password link row */
                if (!document.getElementById("mo-bottom")) {
                    var row = document.createElement("div"); row.id = "mo-bottom";
                    var fl = document.createElement("a"); fl.id = "mo-forgot";
                    fl.href = "/moas/idp/resetpassword"; fl.textContent = tr("forgot.password.link");
                    row.appendChild(fl);
                    wrap.parentNode.insertBefore(row, wrap.nextSibling);
                }
            }
        }

        /* Button label */
        var btn = document.getElementById("loginbutton");
        setBtnArrowLabel(btn, tr("login.page.button"));

        $('#loginbutton').parent().addClass('d-flex')

        /* Hide hr and br inside the card */
        wrapper.querySelectorAll("hr,br").forEach(function (el) { el.style.display = "none"; });
    }

    /* ── Redirect to IDP login PAGE (/moas/redirecttoidplogin) ── */
    /* Same styling/behaviour as the /moas/login page — reuses the shared
       CSS injection. Uses the combined step (both fields shown at once). */
    function applyRedirectToIdpLogin() {
        console.log('in apply redirecto idplogin')
        if (!checkIsRedirectToIdpLogin()) return;

        injectFontAndCss();
        applyEmailPasswordStep();
        handleLoginErrors();
        applyRegisterErrorParam();
        applyCreateAccountHelper();
        forceHide();

        /* Server-rendered error banner -> show below the password field.
           Guarded by #mo-redirect-error so it runs ONCE — otherwise the DOM
           mutations below keep re-triggering the observer (infinite loop). */
        var isPageHasError = errorOnPage();
        /* Also gate on a "dismissed" flag: the server banner (#error-alert-message)
           stays in the DOM (just hidden), so errorOnPage() keeps returning true.
           Without this flag the next observer tick would re-inject the message,
           border and icons the moment the user's input handler removes them. */
        var rdUname = document.getElementById("username");
        if (isPageHasError && !document.getElementById("mo-redirect-error") && !(rdUname && rdUname.dataset.moRedirectDismissed)) {
            console.log('IN ERROR SECTION ');
            var message = cleanLoginErrorMessage($('#error-alert-message .errorMessage li span').text().trim());
            var errHtml = '<div id="mo-redirect-error" class="error-message text-start" style="color:#E91616;">' + message + '</div>';
            if ($('.mo-pw-wrap').length) {
                $('.mo-pw-wrap').after(errHtml);
            } else {
                $('#username').after(errHtml);
            }
            $('#username, #plaintextPassword').addClass('border border-danger mo-input-error');

            var RD_CROSS = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';

            /* Red cross inside the email field (wrap it once for positioning).
               Uses id mo-userlogin-icon so handleLoginErrors() treats it as exempt
               and doesn't strip it on later observer ticks. */
            var rdEmail = document.getElementById("username");
            if (rdEmail) {
                var rdEw = rdEmail.parentNode;
                if (!rdEw.classList.contains("mo-input-wrap")) {
                    rdEw = document.createElement("div");
                    rdEw.className = "mo-input-wrap";
                    rdEw.style.position = "relative";
                    rdEw.style.display = "flex";
                    rdEw.style.alignItems = "center";
                    rdEw.style.width = "100%";
                    rdEmail.parentNode.insertBefore(rdEw, rdEmail);
                    rdEw.appendChild(rdEmail);
                }
                if (!rdEw.querySelector(".mo-error-icon")) {
                    var rdEIcon = document.createElement("span");
                    rdEIcon.id = "mo-userlogin-icon";
                    rdEIcon.className = "mo-error-icon";
                    rdEIcon.innerHTML = RD_CROSS;
                    rdEw.appendChild(rdEIcon);
                }
            }

            /* Red cross inside the password field (inside its .mo-pw-wrap).
               Uses id mo-pw-server-icon so handleLoginErrors() leaves it alone. */
            var rdPwWrap = document.querySelector(".mo-pw-wrap");
            if (rdPwWrap && !rdPwWrap.querySelector(".mo-error-icon")) {
                var rdPIcon = document.createElement("span");
                rdPIcon.id = "mo-pw-server-icon";
                rdPIcon.className = "mo-error-icon";
                rdPIcon.innerHTML = RD_CROSS;
                rdPwWrap.appendChild(rdPIcon);
            }

            /* Once the user edits either field, clear the error message, borders
               and cross icons (bound once per field). */
            ["username", "plaintextPassword"].forEach(function (id) {
                var el = document.getElementById(id);
                if (el && !el.dataset.moRedirectClear) {
                    el.dataset.moRedirectClear = "true";
                    el.addEventListener("input", function () {
                        /* Mark dismissed so the guarded block above won't re-inject on the
                           next observer tick (the server banner is still in the DOM). */
                        var u = document.getElementById("username");
                        if (u) u.dataset.moRedirectDismissed = "true";
                        $('#mo-redirect-error').remove();
                        $('#mo-userlogin-icon, #mo-pw-server-icon').remove();
                        $('#username, #plaintextPassword').removeClass('border border-danger mo-input-error');
                    });
                }
            });

            $('#error-alert-message').hide();
        }

        /* Hide original forgot/create link wrappers — skip our custom #mo-forgot */
        document.querySelectorAll("a[href*='forgotpassword'],a[href*='resetpassword'],a[href*='businessfreetrial']").forEach(function (a) {
            if (a.id === "mo-forgot") return;
            var c = a.closest(".col-auto");
            if (c) c.style.setProperty("display", "none", "important");
            else a.style.setProperty("display", "none", "important");
        });

        var wrapper = document.getElementById("login-wrapper");
        if (wrapper) wrapper.querySelectorAll("hr,br").forEach(function (el) { el.style.display = "none"; });

        $('body').addClass('h-100 align-items-center');
    }

    /* ── FORGOT PASSWORD PAGE (/moas/idp/forgotpassword) ── */
    function applyForgotPage() {
        if (!checkIsForgot()) return;

        /* Wait for form to load */
        var emailInput = document.getElementById("emailAddress") || document.getElementById("username");
        if (!emailInput) return; // not ready yet

        /* resetpassword endpoint: strip all <br> spacers (runs every tick to
           catch any re-added by React). */
        if (window.location.pathname.toLowerCase().indexOf("moas/idp/resetpassword") !== -1) {
            $('br').remove();

            /* This page only: override the card padding to 28px 20px. An inline
               !important is required to beat the #mo-fp-css `#login-wrapper` rule
               (jQuery's .css() can't set !important). Guarded (only write when it
               differs) so the style mutation doesn't retrigger the observer loop. */
            var rpWrapper = document.getElementById("login-wrapper");
            if (rpWrapper && rpWrapper.style.padding !== "28px 20px") {
                rpWrapper.style.setProperty("padding", "28px 20px", "important");
            }
        }

        /* resetuserpassword endpoint only: strip all <br> spacers (runs every
           tick, like the resetpassword equivalent above) and set card padding
           28px 28px — same inline !important + guard pattern as above. */
        if (window.location.pathname.toLowerCase().indexOf("moas/idp/resetuserpassword") !== -1) {
            $('br').remove();

            var rupWrapper = document.getElementById("login-wrapper");
            if (rupWrapper && rupWrapper.style.padding !== "28px") {
                rupWrapper.style.setProperty("padding", "28px 28px", "important");
            }
        }

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
                "padding:28px 14px!important;box-sizing:border-box!important;" +
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
                "color:#000933;margin-bottom:6px;letter-spacing:-.3px;text-align:left!important;}" +

                /* Subtitle */
                "#mo-fp-subtitle{display:block;font-size:14px;font-weight:400;color:#000933;font-family:'Figtree',sans-serif;margin-bottom:12px;text-align:left!important;}" +

                /* Label */
                "#mo-fp-lbl{" +
                "display:block!important;color:#3c515d!important;font-size:14px!important;font-weight:700!important;" +
                "padding:0 0 6px!important;font-family:'Figtree',sans-serif!important;margin-bottom:0!important;" +
                "text-align:left!important;width:100%!important;" +
                "}" +
                "#mo-fp-lbl .mo-req{color:#e02020!important;margin-left:2px!important;}" +

                /* Email input */
                "#emailAddress,#username{" +
                "height:40px!important;border:1px solid #C1CFD7;border-radius:0!important;" +
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
                /* resetpassword endpoint: restore horizontal padding on the field
                   container (JS adds .px-2 there only, so this is scoped to it and
                   out-specifies the padding:0 rule above via the extra class). */
                "#userform .w-75.px-2{padding-left:.5rem!important;padding-right:.5rem!important;}" +

                /* Helper text */
                "#mo-fp-helper{font-size:14px;font-weight:400;color:#000933;font-family:'Figtree',sans-serif;" +
                "margin:14px 0 18px;line-height:1.5;text-align:left!important;width:100%!important;padding-left:0;padding-right:0;}" +
                "#mo-fp-helper a{display:block;margin-top:4px;color:#0A55D7;text-decoration:none;font-weight:500;}" +
                "#mo-fp-helper a:hover{text-decoration:underline;}" +

                /* NEXT button */
                ".d-grid.mb-3{display:block!important;}" +
                ".d-grid.mb-3 button[type=submit],#userform button[type=submit],#userform button.custom-button{" +
                "display:inline-flex!important;align-items:center!important;justify-content:center!important;" +
                "gap:8px!important;min-height:40px!important;padding:8px 24px!important;" +
                "border-radius:0!important;background:#0A55D7!important;background-color:#0A55D7!important;" +
                "border:none!important;color:#fff!important;font-family:'Figtree',sans-serif!important;" +
                "font-size:16px!important;font-weight:700!important;letter-spacing:.6px!important;" +
                "text-transform:uppercase!important;cursor:pointer!important;box-shadow:none!important;" +
                "width:auto!important;margin:0 auto 0 0!important;align-self:flex-start!important;" +
                "padding-right:46px!important;background-image:" + MO_ARROW_BG + "!important;" +
                "background-repeat:no-repeat!important;background-position:right 18px center!important;background-size:15px 15px!important;" +
                "}" +
                ".d-grid.mb-3 button[type=submit]:hover,#userform button[type=submit]:hover,#userform button.custom-button:hover{" +
                "background-color:#0844b0!important;" +
                "}" +
                "#userform .row div:has(.custom-button){text-align:left!important;width:100%!important;}" +

                /* Hide Go back button */
                ".text-center button.btn-link,#go-back-link,#userform p:has(#go-back-link){display:none!important;}" +

                /* Mobile: white page background, card pinned to top, flush edges */
                "@media(max-width:576px){" +
                "body,#root,#login-body,#root>div,#root .d-flex.flex-column.align-items-center{background:#ffffff!important;}" +
                /* body.justify-content-center out-specifies Bootstrap's utility class
                   (element selector alone loses to the class rule, both !important) */
                "body,body.justify-content-center{justify-content:flex-start!important;}" +
                "body #login-body{padding:60px 0 0!important;}" +
                "body .container-fluid{padding:0!important;}" +
                "body #login-body .container-fluid #login-wrapper, body #login-wrapper, #login-wrapper{padding:0!important;border:none!important;box-shadow:none!important;}" +
                "}";

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
        /* Find the form element */
        var fpForm = emailInput.closest("form");
        if (!fpForm) return;

        /* Change button text to NEXT → . Runs on EVERY pass (before the
           mo-forgot-done guard below): the backend renders the button with its
           own label ("Wachtwoord resetten") which can appear or be re-rendered
           after our first pass. setBtnArrowLabel is idempotent, so this is
           observer-loop safe. */
        var fpBtn = fpForm.querySelector("button") || fpForm.querySelector("input[type='submit']");
        setBtnArrowLabel(fpBtn, tr("next.button"));

        if (document.getElementById("mo-forgot-done")) return;

        /* Insert RESET PASSWORD title + subtitle before the form */
        if (!document.getElementById("mo-fp-title")) {
            var fpTitle = document.createElement("span");
            fpTitle.id = "mo-fp-title"; fpTitle.textContent = tr("reset.password");
            fpForm.parentNode.insertBefore(fpTitle, fpForm);

            var fpSub = document.createElement("span");
            fpSub.id = "mo-fp-subtitle";
            fpSub.textContent = tr("reset.password.subtext");
            fpForm.parentNode.insertBefore(fpSub, fpForm);
        }

        /* resetpassword endpoint only: add horizontal padding (px-2) to the
           title, subtitle and the field container div. classList.add is a no-op
           when the class is already present, so this is observer-loop safe. */
        if (window.location.pathname.toLowerCase().indexOf("moas/idp/resetpassword") !== -1) {
            var rpTitle = document.getElementById("mo-fp-title");
            if (rpTitle) rpTitle.classList.add("px-2");
            var rpSub = document.getElementById("mo-fp-subtitle");
            if (rpSub) rpSub.classList.add("px-2");
            var rpBody = document.querySelector("#userform .w-75.px-4");
            if (rpBody) rpBody.classList.add("px-2");
        }

        /* Replace/create label text */
        var origLabel = fpForm.querySelector("label[for='emailAddress']") || fpForm.querySelector("label[for='username']") || document.getElementById("mo-fp-lbl");
        if (!origLabel) {
            origLabel = document.createElement("label");
            origLabel.setAttribute("for", emailInput.id);
            origLabel.id = "mo-fp-lbl";
            origLabel.innerHTML = tr("email.field.label") + ' <span class="mo-req">*</span>';
            emailInput.parentNode.insertBefore(origLabel, emailInput);
        } else if (origLabel.id !== "mo-fp-lbl") {
            origLabel.id = "mo-fp-lbl"; origLabel.className = "";
            origLabel.innerHTML = tr("email.field.label") + ' <span class="mo-req">*</span>';
        }

        /* Fix input placeholder */
        emailInput.setAttribute("placeholder", tr("email.field.placeholder"));

        /* Insert helper text after the input wrapper (once) */
        if (!document.getElementById("mo-fp-helper")) {
            var inputWrapper = emailInput.closest(".mb-3") || emailInput.closest(".username-custom") || emailInput.closest(".row");
            if (inputWrapper) {
                var helper = document.createElement("p");
                helper.id = "mo-fp-helper";
                helper.innerHTML =
                    tr("forgot.page.helper") + "<br>" +
                    '<a href="' + MO_URLS.customerService + '">' + tr("forgot.page.helper.link") + '</a>';
                inputWrapper.parentNode.insertBefore(helper, inputWrapper.nextSibling);
            }
        }

        /* Mark as done */
        var done = document.createElement("span");
        done.id = "mo-forgot-done"; done.style.display = "none";
        document.body.appendChild(done);

        $('.btn.mo-btn-primary.btn-block.custom-button.w-100').parent().addClass('px-0')

        /* Server-rendered error banner -> red border + cross on the input and a
           message directly below it. Runs after the label exists so the wrap won't
           trap the label. Guarded so it doesn't stack; cleared once the user edits.
    
           Exception: on the /moas/idp/resetpassword and /moas/idp/resetuserpassword
           endpoints (enter your email to get the reset link — the server has no
           meaningful error to show here), suppress ALL error UI (message, red
           border, cross icon). The forgotpassword endpoint keeps it. */
        var fpPath = window.location.pathname.toLowerCase();
        var isResetPasswordEndpoint =
            fpPath.indexOf("moas/idp/resetpassword") !== -1 ||
            fpPath.indexOf("moas/idp/resetuserpassword") !== -1;
        var fpHasError = errorOnPage();
        if (isResetPasswordEndpoint) {
            $('#error-alert-message').hide();
            $('#mo-fp-error').remove();
            $('#mo-fp-error-icon').remove();
            $(emailInput).removeClass("border border-danger mo-input-error");
        } else if (fpHasError && !document.getElementById("mo-fp-error")) {
            console.log('IN ERROR SECTION ');
            var fpMessage = $('#error-alert-message .errorMessage li span').text().trim();
            /* Wrap ONLY the input in a relative flex container for the cross icon */
            if (!emailInput.parentNode.classList.contains("mo-fp-inputwrap")) {
                var fpIw = document.createElement("div");
                fpIw.className = "mo-fp-inputwrap";
                fpIw.style.position = "relative";
                fpIw.style.display = "flex";
                fpIw.style.alignItems = "center";
                fpIw.style.width = "100%";
                emailInput.parentNode.insertBefore(fpIw, emailInput);
                fpIw.appendChild(emailInput);
            }
            $(emailInput).addClass("border border-danger mo-input-error");
            var fpIwrap = emailInput.closest(".mo-fp-inputwrap");
            if (fpIwrap && !fpIwrap.querySelector(".mo-error-icon")) {
                var fpIcon = document.createElement("span");
                fpIcon.id = "mo-fp-error-icon";
                fpIcon.className = "mo-error-icon";
                fpIcon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
                fpIwrap.appendChild(fpIcon);
            }
            /* Message directly below the input wrapper */
            $(fpIwrap || emailInput).after('<div id="mo-fp-error" class="error-message text-start" style="color:#E91616;font-size:13px;margin-top:6px;">' + fpMessage + '</div>');
            /* Clear once the user edits the email again */
            if (!emailInput.dataset.moFpClear) {
                emailInput.dataset.moFpClear = "true";
                emailInput.addEventListener("input", function () {
                    $('#mo-fp-error').remove();
                    $('#mo-fp-error-icon').remove();
                    $(this).removeClass("border border-danger mo-input-error");
                });
            }
            $('#error-alert-message').hide();
        }

        $('.btn.mo-btn-primary.btn-block.custom-button.w-100').parent().addClass('d-flex');
        $('#go-back-link').parent().hide();
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
                "#modal-header-main{border-bottom:none!important;padding:26px 26px 12px!important;}" +
                ".modal-title{font-size:0!important;color:transparent!important;}" +
                "#mo-otp-title{display:block;font-family:'Figtree',sans-serif;font-size:24px;" +
                "font-weight:800;color:#000933;text-transform:uppercase;letter-spacing:-.3px;margin:0;}" +
                "#modal-body{padding:4px 15px 4px!important;}" +
                "#success-alert-message{background:#D8F3EA!important;border:none!important;" +
                "border-left:4px solid #237659!important;border-radius:4px!important;" +
                "color:#000933!important;padding:12px 16px!important;display:flex!important;" +
                "align-items:flex-start!important;gap:10px!important;margin-bottom:20px!important;}" +
                "#success-alert-message .fa-check-circle{color:#237659!important;" +
                "font-size:18px!important;flex-shrink:0;margin-top:2px!important;}" +
                "#success-alert-message .btn-close{display:none!important;}" +
                "#success-alert-message .actionMessage{list-style:none!important;" +
                "padding:0!important;margin:0!important;}" +
                "#success-alert-message .actionMessage li span{font-family:'Figtree',sans-serif;" +
                "font-size:14px;line-height:1.5;color:#000933!important;}" +
                "#mo-otp-lbl{display:block;font-family:'Figtree',sans-serif;font-size:14px;" +
                "font-weight:700;color:#3c515d;margin-bottom:6px;}" +
                "#mo-otp-lbl .mo-req{color:#e02020;margin-left:2px;}" +
                "#otpToken{height:40px!important;border:1px solid #C1CFD7;" +
                "border-radius:0!important;padding:0 12px!important;font-size:14px!important;" +
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
                "font-family:'Figtree',sans-serif!important;font-size:16px!important;" +
                "font-weight:700!important;text-transform:uppercase!important;" +
                "letter-spacing:.6px!important;padding:8px 24px!important;" +
                "cursor:pointer!important;min-height:40px!important;}" +
                "#validate{padding-right:46px!important;background-image:" + MO_ARROW_BG + "!important;" +
                "background-repeat:no-repeat!important;background-position:right 18px center!important;background-size:15px 15px!important;}" +
                "#validate:hover{background-color:#0844b0!important;}" +
                ".btn-cancel{background:#EFF3F5!important;border:none!important;" +
                "border-radius:0!important;color:#000933!important;" +
                "font-family:'Figtree',sans-serif!important;font-size:14px!important;" +
                "font-weight:700!important;text-transform:uppercase!important;" +
                "letter-spacing:.6px!important;padding:8px 24px!important;min-height:40px!important;}" +
                ".btn-cancel:hover{background:#dee2e6!important;}" +

                /* Mobile: white page background, card pinned to top, flush edges.
                   .modal.show is a ROW flex container, so vertical centering is
                   align-items; .modal-content is the card (border/shadow off);
                   header/body lose their side padding. #modal-footer padding is set
                   inline by JS (handled separately). */
                "@media(max-width:576px){" +
                "body,.modal.show{background:#ffffff!important;}" +
                "body .modal.show{min-height:unset!important;align-items:flex-start!important;padding:60px 24px 0!important;}" +
                ".modal-dialog{max-width:100%!important;}" +
                ".modal-content{border:none!important;box-shadow:none!important;}" +
                "#modal-header-main{padding:0 0 12px!important;}" +
                "#modal-body{padding:4px 0!important;}" +
                ".modal .container-fluid,#container{padding:0!important;}" +
                /* Bootstrap gives .modal-footer children a margin — kill it; the
                   footer's gap:12px handles the spacing between the buttons */
                "#modal-footer #validate,#modal-footer .btn-cancel{margin:0!important;}" +
                "}";

            var otpSt = document.createElement("style");
            otpSt.id = "mo-otp-css"; otpSt.textContent = otpCss;
            document.head.appendChild(otpSt);
        }

        /* Idempotent UI bits below run on EVERY call (incl. observer ticks after
           the AJAX "resend OTP", which re-renders the OTP subtree without a page
           reload) — each block is guarded so it neither duplicates nor stacks. */
        var otpInput = document.getElementById("otpToken");
        if (!otpInput) return;

        /* VERIFY YOUR IDENTITY title — re-sync on every tick (don't freeze). The
           first tick can run before mo_locale settles (script imported early in the
           JSP), so tr() may return English; a later tick must be able to correct it.
           Compare before writing so a matched value doesn't retrigger the observer. */
        var modalHeader = document.getElementById("modal-header-main");
        if (modalHeader) {
            var otpTitle = document.getElementById("mo-otp-title");
            if (!otpTitle) {
                otpTitle = document.createElement("span");
                otpTitle.id = "mo-otp-title";
                modalHeader.insertBefore(otpTitle, modalHeader.firstChild);
            }
            var otpTitleTxt = tr("otp.page.title");
            if (otpTitle.textContent !== otpTitleTxt) otpTitle.textContent = otpTitleTxt;
        }

        /* Label above OTP input — reuse a server-rendered label[for=otpToken]
           if present, otherwise create one right before the input. Works whether
           or not the page ships its own label. */
        var otpLbl = document.getElementById("mo-otp-lbl") || otpInput.parentNode.querySelector('label[for="otpToken"]');
        if (!otpLbl) {
            otpLbl = document.createElement("label");
            otpLbl.setAttribute("for", "otpToken");
            otpInput.parentNode.insertBefore(otpLbl, otpInput);
        }
        if (otpLbl.id !== "mo-otp-lbl") otpLbl.id = "mo-otp-lbl";
        /* Re-sync on every tick like the title. Compare against the target first so
           we only touch innerHTML when the locale actually changed \u2014 otherwise the
           childList mutation retriggers the observer and loops infinitely. */
        var otpLblHtml = tr("otp.field.label") + ' <span class="mo-req">*</span>';
        if (otpLbl.innerHTML !== otpLblHtml) {
            otpLbl.innerHTML = otpLblHtml;
            otpLbl.dataset.moLocalized = "1";
        }

        /* Form padding (jQuery no-ops when classes already match, so no loop) */
        $('#validateIdentityForm').removeClass('p-4').addClass('p-0');

        /* Strip all <br> spacers on this page. No-op (no mutation) once none
           remain, so it's observer-loop safe even running every tick. */
        $('br').remove();

        /* modal-footer padding, this page only. jQuery selects it, but the value
           is applied via setProperty with !important (jQuery's .css() can't set
           !important, and this must beat the #mo-otp-css `#modal-footer` rule).
           Viewport-aware: no side padding on mobile (the 60px 24px 0 padding on
           .modal.show provides the inset there). Guarded against the NORMALIZED
           read-back ("0 0 24px 0" comes back as "0px 0px 24px") so the style
           write doesn't retrigger the observer loop. */
        var otpFooterIsMobile = window.matchMedia("(max-width:576px)").matches;
        var otpFooterPadNorm = otpFooterIsMobile ? "12px 0px 24px" : "0px 26px 24px 22px";
        var otpFooterPadSet = otpFooterIsMobile ? "12px 0 24px 0" : "0 26px 24px 22px";
        $('#modal-footer').each(function () {
            if (this.style.padding !== otpFooterPadNorm) {
                this.style.setProperty("padding", otpFooterPadSet, "important");
            }
        });

        /* Placeholder (attribute not observed) */
        if (otpInput.getAttribute("placeholder") !== tr("otp.field.placeholder")) {
            otpInput.setAttribute("placeholder", tr("otp.field.placeholder"));
        }

        /* Verify button */
        var verifyBtn = document.getElementById("validate");
        setBtnArrowLabel(verifyBtn, tr("otp.verify.button"));

        /* Cancel button */
        var cancelBtn = document.querySelector(".btn-cancel");
        if (cancelBtn && cancelBtn.textContent !== tr("otp.cancel.button")) {
            cancelBtn.textContent = tr("otp.cancel.button");
        }
        /* Redirect Cancel to the broker login instead of submitting the
           cancelauthentication form. Override the inline onclick once. */
        if (cancelBtn && !cancelBtn.dataset.moCancel) {
            cancelBtn.dataset.moCancel = "true";
            cancelBtn.removeAttribute("onclick");
            cancelBtn.addEventListener("click", function (e) {
                e.preventDefault();
                window.location.replace(MO_URLS.otpCancelRedirect);
            });
        }

        /* Backend typo fix in the OTP success message: "...to Validate." -> "...to validate."
           English only — detected via the "Please enter the OTP" phrase. Idempotent:
           only rewrites when the capitalised "Validate" is still present. */
        var otpSuccessSpan = document.querySelector("#success-alert-message .actionMessage li span");
        if (otpSuccessSpan) {
            var sm = otpSuccessSpan.textContent;
            if (sm.indexOf("Please enter the OTP") !== -1 && sm.indexOf("Validate") !== -1) {
                otpSuccessSpan.textContent = sm.replace(/Validate/g, "validate");
            }
        }

        /* Resend-link dynamic texts. The page's own resendOtpSubmit() (JSP)
           writes hardcoded ENGLISH strings into #resendIdpOtpLink — the "OTP
           Sent…" confirmation and the once-per-second countdown — so match those
           fixed English fragments here on every tick and rewrite them in the
           active locale. The countdown number is captured and re-inserted into
           {X} so it keeps ticking. Loop-safe: after our rewrite the text either
           no longer matches the English pattern, or (en locale) equals the
           target exactly, so observer ticks never rewrite twice.
           Also matches the server-rendered Dutch variant of the sent-message
           ("…als u het niet hebt ontvangen") so it uses our informal copy. */
        var resendA = document.getElementById("resendIdpOtpLink");
        if (resendA) {
            var resendTxt = resendA.textContent.trim();
            if (/^OTP Sent\. Click again/i.test(resendTxt) ||
                resendTxt === "OTP verzonden. Klik opnieuw als u het niet hebt ontvangen.") {
                var resentMsg = tr("otp.resent.message");
                if (resendTxt !== resentMsg) resendA.textContent = resentMsg;
            } else {
                var resendTimerMatch = resendTxt.match(/^You will be able to send a new OTP in (\d+) Second/i);
                if (resendTimerMatch) {
                    var resendTimerMsg = tr("otp.resend.timer").replace("{X}", resendTimerMatch[1]);
                    if (resendTxt !== resendTimerMsg) resendA.textContent = resendTimerMsg;
                }
            }
        }

        /* OTP-sent alert text (nl) — the email address in the middle of the
           server string varies per user, so match on the fixed tail instead of
           the whole string, then re-insert the parsed email into our copy. */
        var otpAlertSpanTxt = $("#success-alert-message .actionMessage li span").text().trim();
        if (otpAlertSpanTxt.indexOf("Voer de OTP in die u hebt ontvangen om te valideren.") !== -1) {
            /* Asterisk-tolerant: the backend masks the email (am****ar@gm***.com).
               Trailing dots stripped — the domain part grabs the sentence period. */
            var otpAlertEmailMatch = otpAlertSpanTxt.match(/[\w.*+-]+@[\w.*-]+\.[\w.*-]+/);
            var otpAlertEmail = otpAlertEmailMatch ? otpAlertEmailMatch[0].replace(/\.+$/, "") : "";
            $("#success-alert-message .actionMessage li span").text(
                'De eenmalige code is verzonden naar ' + otpAlertEmail + '. Vul de code in om verder te gaan.'
            );
        }

        /* ── One-time-only below (server error handling + done marker) ── */
        if (document.getElementById("mo-otp-done")) return;

        /* Mark done */
        var otpDone = document.createElement("span");
        otpDone.id = "mo-otp-done"; otpDone.style.display = "none";
        document.body.appendChild(otpDone);

        var isPageHasError = errorOnPage();
        if (isPageHasError) {
            console.log('IN ERROR SECTION ');
            var message = $('#error-alert-message .errorMessage li span').text().trim();
            $('#otpToken').after(
                '<div id="mo-userlogin-error" class="error-message text-start" style="color:#E91616;">' + message + '</div>'
            );
            $('input').addClass('border border-danger')
            /* Wrap the OTP input + add a red cross icon inside it */
            if (otpInput && !document.getElementById("mo-otp-icon")) {
                var otpWrap = document.createElement("div");
                otpWrap.style.position = "relative";
                otpWrap.style.display = "flex";
                otpWrap.style.alignItems = "center";
                otpInput.parentNode.insertBefore(otpWrap, otpInput);
                otpWrap.appendChild(otpInput);
                otpInput.classList.add("mo-input-error");
                var otpIcon = document.createElement("span");
                otpIcon.id = "mo-otp-icon";
                otpIcon.className = "mo-error-icon";
                otpIcon.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
                otpWrap.appendChild(otpIcon);
            }
            /* Clear the error indicators once the user edits the OTP again */
            if (otpInput && !otpInput.dataset.moOtpClear) {
                otpInput.dataset.moOtpClear = "true";
                otpInput.addEventListener("input", function () {
                    $('#mo-userlogin-error').remove();
                    $('#mo-otp-icon').remove();
                    $(this).removeClass('border border-danger mo-input-error');
                });
            }
            $('#error-alert-message').hide();
        }


    }

    /* ── CHANGE PASSWORD PAGE (/moas/idp/changepassword) ── */
    function applyChangePasswordPage() {
        if (!checkIsChangePass()) return;
        $('.col-xs-8.col-xs-offset-2').addClass('text-start');
        $('.form-group').addClass('text-start');
        $('br').remove();

        /* changeuserpassword endpoint only: override the card padding to 28px on
           all sides. An inline !important is required to beat the #mo-cp-css
           `#login-wrapper` rule (jQuery's .css() can't set !important). Guarded
           (only write when it differs) so the style mutation doesn't retrigger the
           observer loop. */
        if (window.location.pathname.toLowerCase().indexOf("changeuserpassword") !== -1) {
            var cupWrapper = document.getElementById("login-wrapper");
            if (cupWrapper && cupWrapper.style.padding !== "28px") {
                cupWrapper.style.setProperty("padding", "28px", "important");
            }

            /* #userform carries Bootstrap's .p-3 (padding:1rem!important), so zeroing
               it needs an inline !important too. Guarded against the NORMALIZED
               read-back ("0" comes back as "0px") so it doesn't loop the observer. */
            var cupForm = document.getElementById("userform");
            if (cupForm && cupForm.style.padding !== "0px") {
                cupForm.style.setProperty("padding", "0", "important");
            }
        }
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
                "padding:28px 14px!important;max-width:560px!important;width:100%!important;" +
                "margin:40px auto!important;box-sizing:border-box!important;" +
                "}" +

                /* Title styling */
                "#login-wrapper .login-header{" +
                "display:flex!important;justify-content:space-between!important;align-items:center!important;" +
                "font-family:'Figtree',sans-serif!important;font-size:24px!important;" +
                "font-weight:800!important;color:#000933!important;text-transform:uppercase!important;" +
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
                "height:40px!important;border:1px solid #C1CFD7;border-radius:0!important;" +
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
                "font-size:16px!important;font-weight:700!important;letter-spacing:.6px!important;" +
                "text-transform:uppercase!important;cursor:pointer!important;box-shadow:none!important;" +
                "width:auto!important;margin:0!important;align-self:flex-start!important;" +
                "}" +
                "#validate,#submit{padding-right:46px!important;background-image:" + MO_ARROW_BG + "!important;" +
                "background-repeat:no-repeat!important;background-position:right 18px center!important;background-size:15px 15px!important;}" +
                "#validate:hover,#submit:hover{background-color:#0844b0!important;}" +

                /* Hide Go Back to Login link */
                "#passwordform a.btn-link,#back-link{display:none!important;}" +

                /* Mobile: white page background, card pinned to top, flush edges.
                   #login-body is a ROW flex container (d-flex justify-content-center
                   align-items-center), so vertical centering is align-items here —
                   body #login-body out-specifies the Bootstrap utility classes. */
                "@media(max-width:576px){" +
                "body,#login-body{background:#ffffff!important;}" +
                "body #login-body{min-height:unset!important;align-items:flex-start!important;padding:60px 0 0!important;}" +
                "body .container-fluid{padding:0!important;}" +
                "#login-wrapper{padding:0!important;border:none!important;box-shadow:none!important;margin:0 auto!important;}" +
                "}";

            var cpSt = document.createElement("style");
            cpSt.id = "mo-cp-css"; cpSt.textContent = cpCss;
            document.head.appendChild(cpSt);
            $('#login-body').addClass('d-flex justify-content-center align-items-center')
        }

        /* On the /updateuserpassword success screen, repoint the "Go back to
           login page" link to the broker login URL. Runs before the form check
           below (the success screen has no password form). */
        if (window.location.pathname.toLowerCase().indexOf("updateuserpassword") !== -1) {
            var cpBackLink = document.querySelector('a.btn.btn-link.custom-small-text') || document.querySelector('a.btn-link[href="/login"]') || document.querySelector('a[href="/login"]');
            if (cpBackLink && cpBackLink.getAttribute("href") !== MO_URLS.dashboardRedirect) {
                cpBackLink.setAttribute("href", MO_URLS.dashboardRedirect);
            }

            var lang = localStorage.getItem('mo_locale');
            if (lang === 'nl') {
                var upTitle = document.querySelector(".login-header");
                if (upTitle && upTitle.textContent.trim() === 'Wachtwoord Succesvol veranderd.') {
                    upTitle.textContent = 'Wachtwoord gewijzigd';
                }
                var upMsg = document.querySelector(".row .col-xs-8.col-xs-offset-2");
                if (upMsg && upMsg.textContent.trim() === 'Uw wachtwoord is met succes gewijzigd.') {
                    upMsg.textContent = 'Je wachtwoord is gewijzigd';
                }
                if (cpBackLink && cpBackLink.textContent.trim() === 'Go back to Login Page') {
                    cpBackLink.textContent = 'Terug naar inloggen';
                }
            }

            /* The backend can render this success screen in ENGLISH even when the
               resolved locale is not English (its server-side locale differs from our
               mo_locale — e.g. English copy with mo_locale=nl). The nl block above
               only matches the Dutch source strings, so also translate from the
               English source here, into the ACTIVE locale via tr(). Trailing period
               tolerated; guarded compare-before-write so it's idempotent, and the
               success-only source strings never touch the expired-link screen handled
               above. */
            var upEnTitle = document.querySelector(".login-header");
            if (upEnTitle && upEnTitle.textContent.trim().replace(/\.+$/, "") === "Password Successfully Changed") {
                var upEnTitleTarget = tr("changepw.success.title");
                if (upEnTitle.textContent.trim() !== upEnTitleTarget) upEnTitle.textContent = upEnTitleTarget;
            }
            var upEnMsg = document.querySelector(".row .col-xs-8.col-xs-offset-2");
            if (upEnMsg && upEnMsg.textContent.trim().replace(/\.+$/, "") === "Your password has been successfully changed") {
                var upEnMsgTarget = tr("changepw.success.text");
                if (upEnMsg.textContent.trim() !== upEnMsgTarget) upEnMsg.textContent = upEnMsgTarget;
            }
            if (cpBackLink && cpBackLink.textContent.trim() === "Go back to Login Page") {
                var upEnLinkTarget = tr("goback.login");
                if (cpBackLink.textContent.trim() !== upEnLinkTarget) cpBackLink.textContent = upEnLinkTarget;
            }

            /* Slight breathing room below the success description before the link.
               Guarded against the normalized read-back so it doesn't loop. */
            var upDesc = document.querySelector(".row .col-xs-8.col-xs-offset-2");
            if (upDesc && upDesc.style.paddingBottom !== "12px") {
                upDesc.style.setProperty("padding-bottom", "12px", "important");
            }

            /* Success screen: card padding 24px 28px. Inline !important is required
               to beat the #mo-cp-css `#login-wrapper` rule (jQuery's .css() can't set
               !important). Guarded against the NORMALIZED read-back so the style write
               doesn't retrigger the observer loop. */
            var upWrapper = document.getElementById("login-wrapper");
            if (upWrapper && upWrapper.style.padding !== "24px 28px") {
                upWrapper.style.setProperty("padding", "24px 28px", "important");
            }

            /* Zero the padding on the small "Go back to login" link button. Guarded
               against the normalized "0px" read-back to stay observer-loop safe. */
            document.querySelectorAll(".btn.btn-link.custom-small-text").forEach(function (b) {
                if (b.style.padding !== "0px") b.style.setProperty("padding", "0", "important");
            });

            /* Hide empty <p> placeholders in the card (no text, no child elements)
               that otherwise reserve vertical space. Guarded on display so the write
               doesn't retrigger the observer. */
            document.querySelectorAll("#login-wrapper p").forEach(function (p) {
                if (!p.textContent.trim() && p.children.length === 0 && p.style.display !== "none") {
                    p.style.setProperty("display", "none", "important");
                }
            });
        }

        /* "Password Link Expired" error screen (changeuserpassword with an invalid/
           expired token). It has no password form, so translate its header + body
           here BEFORE the fpForm early-return below. Detected via the English title
           or its already-translated value so it stays idempotent across observer
           ticks. */
        var cpHeader = document.querySelector(".login-header");
        if (cpHeader && (cpHeader.textContent.trim() === "Password Link Expired" ||
            cpHeader.textContent.trim() === tr("changepw.expired.title"))) {
            if (cpHeader.textContent.trim() !== tr("changepw.expired.title")) {
                cpHeader.textContent = tr("changepw.expired.title");
            }
            /* This screen only: my-3 -> mb-3 (drop the top margin) */
            if (cpHeader.classList.contains("my-3")) {
                cpHeader.classList.remove("my-3");
                cpHeader.classList.add("mb-3");
            }
            var cpExpMsg = document.querySelector(".row .col-xs-8.col-xs-offset-2");
            if (cpExpMsg && cpExpMsg.textContent.trim() !== tr("changepw.expired.message")) {
                cpExpMsg.textContent = tr("changepw.expired.message");
            }
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
                titleTextNode.nodeValue = tr("changepw.title");
            } else {
                h3.insertBefore(document.createTextNode(tr("changepw.title")), h3.firstChild);
            }
        }

        /* Add * to labels */
        var labelSelector = "#passwordform p.text-left, #userform span.align-items-left, #userform span.d-flex";
        document.querySelectorAll(labelSelector).forEach(function (p) {
            var t = p.textContent.trim();
            if (t.toLowerCase().indexOf("new password") !== -1 && !p.querySelector(".mo-req")) {
                p.innerHTML = tr("changepw.newpassword.label") + ' <span class="mo-req" style="color:#e02020; margin-left:2px;">*</span>';
            } else if (t.toLowerCase().indexOf("confirm password") !== -1 && !p.querySelector(".mo-req")) {
                p.innerHTML = tr("changepw.confirmpassword.label") + ' <span class="mo-req" style="color:#e02020; margin-left:2px;">*</span>';
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

        /* Hardcoded password policy (kept in sync with the server policy manually).
           The displayed requirements and their live validation both use these. */
        var cpMin = 12, cpMax = 50, cpSymbols = "!@#$.%^&*-_";
        /* Consecutive-characters rule: N and the restricted fields shown on the
           (static, server-validated) consecutive line. */
        var cpConsecN = 2;
        var cpFields = ["username", "email", "firstname", "lastname"];
        var cpSymRegex = new RegExp("[" + cpSymbols.replace(/[\]\\^-]/g, "\\$&") + "]");
        /* Whole-password whitelist: letters, digits, and only the allowed symbols.
           Any other character (e.g. "?") makes the password invalid outright, even
           if an allowed symbol is also present elsewhere in the string. */
        var cpAllowedRegex = new RegExp("^[A-Za-z0-9" + cpSymbols.replace(/[\]\\^-]/g, "\\$&") + "]*$");

        /* Build the localized, comma-joined field list for the consecutive line. */
        var cpFieldNames = cpFields.map(function (f) { return tr("changepw.field." + f); });
        var cpFieldsStr = cpFieldNames.length === 1
            ? cpFieldNames[0]
            : cpFieldNames.slice(0, -1).join(", ") + " & " + cpFieldNames[cpFieldNames.length - 1];

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
            newPasswordInput.setAttribute("placeholder", tr("password.field.placeholder"));

            // Append eye toggle
            var EYE_OFF = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.3973 7.18582C12.7359 7.52457 12.9977 7.93617 13.1825 8.42061C13.3674 8.9052 13.4373 9.39159 13.3923 9.87978C13.3923 10.0401 13.3347 10.1758 13.2194 10.2869C13.104 10.398 12.9661 10.4535 12.8059 10.4535C12.6456 10.4535 12.5099 10.398 12.3988 10.2869C12.2877 10.1758 12.2321 10.0401 12.2321 9.87978C12.2856 9.51339 12.2554 9.16617 12.1417 8.83811C12.0279 8.5102 11.853 8.22818 11.6169 7.99207C11.3808 7.75596 11.0961 7.57673 10.7627 7.45436C10.4294 7.332 10.0779 7.3002 9.70815 7.35895C9.54787 7.36436 9.40954 7.31068 9.29315 7.19791C9.17662 7.08527 9.11572 6.94881 9.11044 6.78853C9.10503 6.62825 9.15655 6.48985 9.26503 6.37332C9.3735 6.25693 9.50787 6.1961 9.66815 6.19082C10.1532 6.13527 10.6406 6.19853 11.1304 6.38062C11.6203 6.56284 12.0426 6.83124 12.3973 7.18582ZM9.99982 4.99999C9.70385 4.99999 9.4135 5.01443 9.12878 5.04332C8.84405 5.07207 8.56065 5.11957 8.27857 5.18582C8.10121 5.22221 7.94148 5.19687 7.7994 5.10978C7.65732 5.0227 7.55961 4.89742 7.50628 4.73395C7.4528 4.5652 7.47044 4.40471 7.55919 4.25249C7.6478 4.10027 7.77648 4.00596 7.94523 3.96957C8.28079 3.88943 8.61975 3.83284 8.96211 3.79978C9.30461 3.76659 9.65051 3.74999 9.99982 3.74999C11.7904 3.74999 13.4352 4.21527 14.9342 5.14582C16.4331 6.07638 17.5858 7.33548 18.3923 8.92311C18.4479 9.02881 18.4882 9.13534 18.5134 9.2427C18.5385 9.35006 18.5511 9.4636 18.5511 9.58332C18.5511 9.70305 18.5407 9.81659 18.5198 9.92395C18.499 10.0313 18.4608 10.1378 18.4052 10.2435C18.15 10.7777 17.8396 11.2758 17.4742 11.7379C17.1088 12.2 16.7065 12.6244 16.2673 13.0112C16.1382 13.1267 15.9905 13.1744 15.8244 13.1546C15.6582 13.1349 15.5216 13.0518 15.4148 12.9054C15.308 12.759 15.2637 12.602 15.2819 12.4344C15.3001 12.2666 15.3738 12.125 15.5029 12.0096C15.8791 11.6687 16.222 11.2962 16.5319 10.8919C16.8418 10.4874 17.1088 10.0512 17.3332 9.58332C16.6387 8.18055 15.6352 7.06596 14.3227 6.23957C13.0102 5.41318 11.5693 4.99999 9.99982 4.99999ZM9.99982 15.4167C8.24551 15.4167 6.6376 14.9479 5.17607 14.0104C3.71454 13.0729 2.55273 11.8381 1.69065 10.306C1.62121 10.2003 1.57044 10.0855 1.53836 9.96145C1.50628 9.83756 1.49023 9.71152 1.49023 9.58332C1.49023 9.45513 1.50412 9.33117 1.5319 9.21145C1.55968 9.09187 1.60829 8.97492 1.67773 8.86061C1.9876 8.29436 2.33857 7.75506 2.73065 7.2427C3.12273 6.73048 3.57357 6.27138 4.08315 5.86541L2.20169 3.97103C2.08641 3.84714 2.02954 3.69999 2.03107 3.52957C2.03273 3.35916 2.09391 3.2136 2.21461 3.09291C2.3353 2.97221 2.48169 2.91187 2.65378 2.91187C2.82572 2.91187 2.97204 2.97221 3.09273 3.09291L16.9069 16.9071C17.0223 17.0225 17.0835 17.1653 17.0904 17.3356C17.0974 17.506 17.0362 17.6559 16.9069 17.7852C16.7862 17.9059 16.6398 17.9662 16.4677 17.9662C16.2958 17.9662 16.1495 17.9059 16.0288 17.7852L13.0961 14.8781C12.6045 15.0683 12.0994 15.2055 11.5807 15.29C11.062 15.3744 10.5351 15.4167 9.99982 15.4167ZM4.96148 6.74353C4.47315 7.12075 4.03426 7.54728 3.64482 8.02311C3.25537 8.49909 2.92926 9.01916 2.66648 9.58332C3.36093 10.9861 4.3644 12.1007 5.6769 12.9271C6.9894 13.7535 8.43037 14.1667 9.99982 14.1667C10.3577 14.1667 10.71 14.1426 11.0567 14.0946C11.4034 14.0465 11.7477 13.9723 12.0896 13.8719L11.035 12.7917C10.8663 12.8654 10.6977 12.9153 10.5294 12.9414C10.3612 12.9677 10.1847 12.9808 9.99982 12.9808C9.05426 12.9808 8.25162 12.651 7.5919 11.9912C6.93218 11.3315 6.60232 10.5289 6.60232 9.58332C6.60232 9.39846 6.61676 9.22193 6.64565 9.05374C6.67454 8.88541 6.72315 8.71686 6.79148 8.54811L4.96148 6.74353Z" fill="currentColor"/></svg>';
            var EYE_ON = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.99982 4.99999C11.7904 4.99999 13.4352 5.46527 14.9342 6.39582C16.4331 7.32638 17.5858 8.58548 18.3923 10.1731C18.4479 10.2788 18.4882 10.3853 18.5134 10.4927C18.5385 10.6001 18.5511 10.7136 18.5511 10.8333C18.5511 10.9531 18.5385 11.0666 18.5134 11.174C18.4882 11.2813 18.4479 11.3878 18.3923 11.4935C17.5858 13.0812 16.4331 14.3403 14.9342 15.2708C13.4352 16.2014 11.7904 16.6667 9.99982 16.6667C8.20926 16.6667 6.5644 16.2014 5.06523 15.2708C3.56607 14.3403 2.41343 13.0812 1.60732 11.4935C1.55176 11.3878 1.51149 11.2813 1.48649 11.174C1.4615 11.0666 1.449 10.9531 1.449 10.8333C1.449 10.7136 1.4615 10.6001 1.48649 10.4927C1.51149 10.3853 1.55176 10.2788 1.60732 10.1731C2.41343 8.58548 3.56607 7.32638 5.06523 6.39582C6.5644 5.46527 8.20926 4.99999 9.99982 4.99999ZM9.99982 6.24999C8.43037 6.24999 6.9894 6.66318 5.6769 7.48957C4.3644 8.31596 3.36093 9.43055 2.66648 10.8333C3.36093 12.2361 4.3644 13.3507 5.6769 14.1771C6.9894 15.0035 8.43037 15.4167 9.99982 15.4167C11.5693 15.4167 13.0102 15.0035 14.3227 14.1771C15.6352 13.3507 16.6387 12.2361 17.3332 10.8333C16.6387 9.43055 15.6352 8.31596 14.3227 7.48957C13.0102 6.66318 11.5693 6.24999 9.99982 6.24999ZM9.99982 8.02082C10.7776 8.02082 11.4396 8.29403 11.9857 8.84044C12.5319 9.38684 12.805 10.0488 12.805 10.8264C12.805 11.6041 12.5319 12.2662 11.9857 12.8126C11.4396 13.359 10.7776 13.6322 9.99982 13.6322C9.22204 13.6322 8.55999 13.359 8.01357 12.8126C7.46718 12.2662 7.19398 11.6041 7.19398 10.8264C7.19398 10.0488 7.46718 9.38684 8.01357 8.84044C8.55999 8.29403 9.22204 8.02082 9.99982 8.02082ZM9.99982 9.27082C9.55926 9.27082 9.18398 9.42557 8.87398 9.73507C8.56398 10.0446 8.40898 10.4189 8.40898 10.8579C8.40898 11.2969 8.56398 11.6712 8.87398 11.9807C9.18398 12.2902 9.55926 12.445 9.99982 12.445C10.4404 12.445 10.8157 12.2902 11.1257 11.9807C11.4357 11.6712 11.5907 11.2969 11.5907 10.8579C11.5907 10.4189 11.4357 10.0446 11.1257 9.73507C10.8157 9.42557 10.4404 9.27082 9.99982 9.27082Z" fill="currentColor"/></svg>';
            var eyeBtn = document.createElement("button");
            eyeBtn.type = "button"; eyeBtn.className = "mo-eye";
            eyeBtn.setAttribute("aria-label", "Toggle password visibility");
            eyeBtn.innerHTML = EYE_OFF;
            eyeBtn.addEventListener("click", function () {
                var show = newPasswordInput.type === "password";
                newPasswordInput.type = show ? "text" : "password";
                this.innerHTML = show ? EYE_ON : EYE_OFF;
            });
            if (!wrap.querySelector(".mo-eye")) wrap.appendChild(eyeBtn);
        }

        /* Wrap confirm password in .mo-pw-wrap for eye toggle */
        if (confirmPasswordInput && !confirmPasswordInput.parentNode.classList.contains("mo-pw-wrap")) {
            var wrap = document.createElement("div");
            wrap.className = "mo-pw-wrap";
            confirmPasswordInput.parentNode.insertBefore(wrap, confirmPasswordInput);
            wrap.appendChild(confirmPasswordInput);
            confirmPasswordInput.setAttribute("placeholder", tr("password.field.placeholder"));

            // Append eye toggle
            var EYE_OFF = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.3973 7.18582C12.7359 7.52457 12.9977 7.93617 13.1825 8.42061C13.3674 8.9052 13.4373 9.39159 13.3923 9.87978C13.3923 10.0401 13.3347 10.1758 13.2194 10.2869C13.104 10.398 12.9661 10.4535 12.8059 10.4535C12.6456 10.4535 12.5099 10.398 12.3988 10.2869C12.2877 10.1758 12.2321 10.0401 12.2321 9.87978C12.2856 9.51339 12.2554 9.16617 12.1417 8.83811C12.0279 8.5102 11.853 8.22818 11.6169 7.99207C11.3808 7.75596 11.0961 7.57673 10.7627 7.45436C10.4294 7.332 10.0779 7.3002 9.70815 7.35895C9.54787 7.36436 9.40954 7.31068 9.29315 7.19791C9.17662 7.08527 9.11572 6.94881 9.11044 6.78853C9.10503 6.62825 9.15655 6.48985 9.26503 6.37332C9.3735 6.25693 9.50787 6.1961 9.66815 6.19082C10.1532 6.13527 10.6406 6.19853 11.1304 6.38062C11.6203 6.56284 12.0426 6.83124 12.3973 7.18582ZM9.99982 4.99999C9.70385 4.99999 9.4135 5.01443 9.12878 5.04332C8.84405 5.07207 8.56065 5.11957 8.27857 5.18582C8.10121 5.22221 7.94148 5.19687 7.7994 5.10978C7.65732 5.0227 7.55961 4.89742 7.50628 4.73395C7.4528 4.5652 7.47044 4.40471 7.55919 4.25249C7.6478 4.10027 7.77648 4.00596 7.94523 3.96957C8.28079 3.88943 8.61975 3.83284 8.96211 3.79978C9.30461 3.76659 9.65051 3.74999 9.99982 3.74999C11.7904 3.74999 13.4352 4.21527 14.9342 5.14582C16.4331 6.07638 17.5858 7.33548 18.3923 8.92311C18.4479 9.02881 18.4882 9.13534 18.5134 9.2427C18.5385 9.35006 18.5511 9.4636 18.5511 9.58332C18.5511 9.70305 18.5407 9.81659 18.5198 9.92395C18.499 10.0313 18.4608 10.1378 18.4052 10.2435C18.15 10.7777 17.8396 11.2758 17.4742 11.7379C17.1088 12.2 16.7065 12.6244 16.2673 13.0112C16.1382 13.1267 15.9905 13.1744 15.8244 13.1546C15.6582 13.1349 15.5216 13.0518 15.4148 12.9054C15.308 12.759 15.2637 12.602 15.2819 12.4344C15.3001 12.2666 15.3738 12.125 15.5029 12.0096C15.8791 11.6687 16.222 11.2962 16.5319 10.8919C16.8418 10.4874 17.1088 10.0512 17.3332 9.58332C16.6387 8.18055 15.6352 7.06596 14.3227 6.23957C13.0102 5.41318 11.5693 4.99999 9.99982 4.99999ZM9.99982 15.4167C8.24551 15.4167 6.6376 14.9479 5.17607 14.0104C3.71454 13.0729 2.55273 11.8381 1.69065 10.306C1.62121 10.2003 1.57044 10.0855 1.53836 9.96145C1.50628 9.83756 1.49023 9.71152 1.49023 9.58332C1.49023 9.45513 1.50412 9.33117 1.5319 9.21145C1.55968 9.09187 1.60829 8.97492 1.67773 8.86061C1.9876 8.29436 2.33857 7.75506 2.73065 7.2427C3.12273 6.73048 3.57357 6.27138 4.08315 5.86541L2.20169 3.97103C2.08641 3.84714 2.02954 3.69999 2.03107 3.52957C2.03273 3.35916 2.09391 3.2136 2.21461 3.09291C2.3353 2.97221 2.48169 2.91187 2.65378 2.91187C2.82572 2.91187 2.97204 2.97221 3.09273 3.09291L16.9069 16.9071C17.0223 17.0225 17.0835 17.1653 17.0904 17.3356C17.0974 17.506 17.0362 17.6559 16.9069 17.7852C16.7862 17.9059 16.6398 17.9662 16.4677 17.9662C16.2958 17.9662 16.1495 17.9059 16.0288 17.7852L13.0961 14.8781C12.6045 15.0683 12.0994 15.2055 11.5807 15.29C11.062 15.3744 10.5351 15.4167 9.99982 15.4167ZM4.96148 6.74353C4.47315 7.12075 4.03426 7.54728 3.64482 8.02311C3.25537 8.49909 2.92926 9.01916 2.66648 9.58332C3.36093 10.9861 4.3644 12.1007 5.6769 12.9271C6.9894 13.7535 8.43037 14.1667 9.99982 14.1667C10.3577 14.1667 10.71 14.1426 11.0567 14.0946C11.4034 14.0465 11.7477 13.9723 12.0896 13.8719L11.035 12.7917C10.8663 12.8654 10.6977 12.9153 10.5294 12.9414C10.3612 12.9677 10.1847 12.9808 9.99982 12.9808C9.05426 12.9808 8.25162 12.651 7.5919 11.9912C6.93218 11.3315 6.60232 10.5289 6.60232 9.58332C6.60232 9.39846 6.61676 9.22193 6.64565 9.05374C6.67454 8.88541 6.72315 8.71686 6.79148 8.54811L4.96148 6.74353Z" fill="currentColor"/></svg>';
            var EYE_ON = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.99982 4.99999C11.7904 4.99999 13.4352 5.46527 14.9342 6.39582C16.4331 7.32638 17.5858 8.58548 18.3923 10.1731C18.4479 10.2788 18.4882 10.3853 18.5134 10.4927C18.5385 10.6001 18.5511 10.7136 18.5511 10.8333C18.5511 10.9531 18.5385 11.0666 18.5134 11.174C18.4882 11.2813 18.4479 11.3878 18.3923 11.4935C17.5858 13.0812 16.4331 14.3403 14.9342 15.2708C13.4352 16.2014 11.7904 16.6667 9.99982 16.6667C8.20926 16.6667 6.5644 16.2014 5.06523 15.2708C3.56607 14.3403 2.41343 13.0812 1.60732 11.4935C1.55176 11.3878 1.51149 11.2813 1.48649 11.174C1.4615 11.0666 1.449 10.9531 1.449 10.8333C1.449 10.7136 1.4615 10.6001 1.48649 10.4927C1.51149 10.3853 1.55176 10.2788 1.60732 10.1731C2.41343 8.58548 3.56607 7.32638 5.06523 6.39582C6.5644 5.46527 8.20926 4.99999 9.99982 4.99999ZM9.99982 6.24999C8.43037 6.24999 6.9894 6.66318 5.6769 7.48957C4.3644 8.31596 3.36093 9.43055 2.66648 10.8333C3.36093 12.2361 4.3644 13.3507 5.6769 14.1771C6.9894 15.0035 8.43037 15.4167 9.99982 15.4167C11.5693 15.4167 13.0102 15.0035 14.3227 14.1771C15.6352 13.3507 16.6387 12.2361 17.3332 10.8333C16.6387 9.43055 15.6352 8.31596 14.3227 7.48957C13.0102 6.66318 11.5693 6.24999 9.99982 6.24999ZM9.99982 8.02082C10.7776 8.02082 11.4396 8.29403 11.9857 8.84044C12.5319 9.38684 12.805 10.0488 12.805 10.8264C12.805 11.6041 12.5319 12.2662 11.9857 12.8126C11.4396 13.359 10.7776 13.6322 9.99982 13.6322C9.22204 13.6322 8.55999 13.359 8.01357 12.8126C7.46718 12.2662 7.19398 11.6041 7.19398 10.8264C7.19398 10.0488 7.46718 9.38684 8.01357 8.84044C8.55999 8.29403 9.22204 8.02082 9.99982 8.02082ZM9.99982 9.27082C9.55926 9.27082 9.18398 9.42557 8.87398 9.73507C8.56398 10.0446 8.40898 10.4189 8.40898 10.8579C8.40898 11.2969 8.56398 11.6712 8.87398 11.9807C9.18398 12.2902 9.55926 12.445 9.99982 12.445C10.4404 12.445 10.8157 12.2902 11.1257 11.9807C11.4357 11.6712 11.5907 11.2969 11.5907 10.8579C11.5907 10.4189 11.4357 10.0446 11.1257 9.73507C10.8157 9.42557 10.4404 9.27082 9.99982 9.27082Z" fill="currentColor"/></svg>';
            var eyeBtn = document.createElement("button");
            eyeBtn.type = "button"; eyeBtn.className = "mo-eye";
            eyeBtn.setAttribute("aria-label", "Toggle password visibility");
            eyeBtn.innerHTML = EYE_OFF;
            eyeBtn.addEventListener("click", function () {
                var show = confirmPasswordInput.type === "password";
                confirmPasswordInput.type = show ? "text" : "password";
                this.innerHTML = show ? EYE_ON : EYE_OFF;
            });
            if (!wrap.querySelector(".mo-eye")) wrap.appendChild(eyeBtn);
        }

        /* Helper text and Error message injection */
        var newPasswordWrap = newPasswordInput ? newPasswordInput.closest(".mo-pw-wrap") : null;
        if (newPasswordWrap && !document.getElementById("mo-cp-helper-text")) {
            // Error text container
            var errorText = document.createElement("p");
            errorText.id = "mo-cp-error-text";
            errorText.className = "text-danger pb-2";
            errorText.style.fontSize = "12px";
            errorText.style.fontWeight = "500";
            /* The confirm-field wrap keeps its shared 16px bottom margin (so the
               field↔NEXT-button gap holds when there's no error). When the error
               shows, this -10px top margin tucks it up to sit ~6px under the field
               (16 + -10), and the 16px bottom margin restores the gap to the NEXT
               button below the error. Works in both flex and block parents (the
               sibling gap is marginBottom + marginTop either way). */
            errorText.style.marginTop = "-10px";
            errorText.style.marginBottom = "16px";
            errorText.style.display = "none";

            // Helper text — rendered as a bulleted requirements list
            var helper = document.createElement("ul");
            helper.id = "mo-cp-helper-text";
            helper.style.fontFamily = "'Figtree', sans-serif";
            helper.style.fontSize = "12px";
            helper.style.fontWeight = "400";
            helper.style.color = "#506C7C";
            helper.style.lineHeight = "1.6";
            helper.style.marginTop = "-6px";
            helper.style.marginBottom = "16px";
            helper.style.paddingLeft = "0";
            helper.style.listStyle = "none";
            helper.style.textAlign = "left";
            helper.style.display = "block";
            /* Fixed 5-line list. `check` is the live-validation type used by
               updateMoReqList; "static" rows (consecutive) always show a plain dot
               since first name / last name / username / email aren't available
               client-side. Numbers/symbols/fields come from the parsed server policy. */
            var moReqDefs = [
                { key: "changepw.req.length", check: "length" },
                { key: "changepw.req.uppercase", check: "uppercase" },
                { key: "changepw.req.number", check: "number" },
                { key: "changepw.req.symbol", check: "symbol" }
            ];
            moReqDefs.forEach(function (def) {
                var li = document.createElement("li");
                li.dataset.req = def.check;
                li.style.display = "flex";
                li.style.alignItems = "flex-start";
                li.style.gap = "6px";
                var marker = document.createElement("span");
                marker.className = "mo-req-marker";
                marker.style.flexShrink = "0";
                marker.style.width = "14px";
                marker.style.textAlign = "center";
                marker.style.fontWeight = "700";
                marker.style.lineHeight = "1.6";
                var txt = document.createElement("span");
                /* Fill placeholders with the real parsed policy values. Use function
                   replacements so a "$" in the symbol set isn't treated as a $-pattern. */
                var label = tr(def.key)
                    .replace("{min}", function () { return cpMin; })
                    .replace("{max}", function () { return cpMax; })
                    .replace("{symbols}", function () { return cpSymbols; })
                    .replace("{n}", function () { return cpConsecN; })
                    .replace("{fields}", function () { return cpFieldsStr; });
                txt.textContent = label;
                li.appendChild(marker);
                li.appendChild(txt);
                helper.appendChild(li);
            });

            /* Error text goes BELOW the confirm-password field (near the submit
               button); the requirements checklist stays under the new-password
               field. Falls back to the new-password position if there is no confirm
               field on this variant. */
            var confirmPasswordWrap = confirmPasswordInput ? confirmPasswordInput.closest(".mo-pw-wrap") : null;
            if (confirmPasswordWrap) {
                confirmPasswordWrap.parentNode.insertBefore(errorText, confirmPasswordWrap.nextSibling);
            } else {
                newPasswordWrap.parentNode.insertBefore(errorText, newPasswordWrap.nextSibling);
            }
            newPasswordWrap.parentNode.insertBefore(helper, newPasswordWrap.nextSibling);

            /* Password strength meter (below the policy list).
               Layout: header row with the static label left and the tier word
               ("Poor"/"Fair"/…) right, full-width bar underneath. */
            var strengthBox = document.createElement("div");
            strengthBox.id = "mo-cp-strength";
            strengthBox.style.margin = "4px 0 16px";
            strengthBox.style.display = "none";
            var shead = document.createElement("div");
            shead.style.display = "flex";
            shead.style.justifyContent = "space-between";
            shead.style.alignItems = "center";
            shead.style.marginBottom = "6px";
            var slabel = document.createElement("span");
            slabel.className = "mo-strength-label";
            slabel.style.fontFamily = "'Figtree', sans-serif";
            slabel.style.fontSize = "12px";
            slabel.style.fontWeight = "600";
            slabel.style.color = "#000933";
            slabel.textContent = tr("changepw.strength.label");
            var stier = document.createElement("span");
            stier.className = "mo-strength-tier";
            stier.style.fontFamily = "'Figtree', sans-serif";
            stier.style.fontSize = "12px";
            stier.style.fontWeight = "600";
            shead.appendChild(slabel);
            shead.appendChild(stier);
            var track = document.createElement("div");
            track.style.height = "6px";
            track.style.background = "#e0e7ef";
            track.style.borderRadius = "4px";
            track.style.overflow = "hidden";
            var fill = document.createElement("div");
            fill.className = "mo-strength-fill";
            fill.style.height = "100%";
            fill.style.width = "0";
            fill.style.background = "#ef2f2f";
            fill.style.transition = "width .2s, background .2s";
            track.appendChild(fill);
            strengthBox.appendChild(shead);
            strengthBox.appendChild(track);
            helper.parentNode.insertBefore(strengthBox, helper.nextSibling);
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

        /* Live green-tick / red-cross on our visible requirements list.
           Empty field -> no marker on the live-checkable rules. The consecutive
           rule always shows a plain dot (we don't have the name/email data
           client-side, so it's validated server-side). */
        function updateMoReqList(val) {
            var list = document.getElementById("mo-cp-helper-text");
            if (!list) return;
            var checks = {
                "length": val.length >= cpMin && val.length <= cpMax,
                "number": /[0-9]/.test(val),
                "uppercase": /[A-Z]/.test(val),
                "symbol": cpSymRegex.test(val) && cpAllowedRegex.test(val)
            };
            list.querySelectorAll("li[data-req]").forEach(function (li) {
                var key = li.dataset.req;
                var marker = li.querySelector(".mo-req-marker");
                if (!marker) return;
                var state;
                if (!(key in checks)) state = "dot";      /* name/email -> plain dot */
                else if (!val) state = "empty";           /* empty field -> no marker */
                else state = checks[key] ? "ok" : "bad";
                /* Only touch the DOM when the state actually changes — otherwise the
                   textContent/style writes retrigger the observer and loop. */
                if (marker.dataset.state === state) return;
                marker.dataset.state = state;
                if (state === "dot") { marker.textContent = "•"; marker.style.color = "#506C7C"; li.style.color = ""; }
                else if (state === "empty") { marker.textContent = ""; marker.style.color = ""; li.style.color = ""; }
                else if (state === "ok") { marker.textContent = "✔"; marker.style.color = "#1b8f3a"; li.style.color = "#1b8f3a"; }  /* satisfied -> green text */
                else { marker.textContent = "○"; marker.style.color = "#506C7C"; li.style.color = ""; }  /* not satisfied -> hollow dot */
            });
        }

        /* Password strength score (0-100) — graduated by composition, not just
           "all rules met": rewards length tiers, mixed case, multiple digits and
           multiple special characters. */
        function calcStrength(v) {
            if (!v) return 0;
            var score = 0;
            if (v.length >= 8) score += 30;
            if (v.length >= 12) score += 10;
            if (v.length >= 16) score += 10;
            if (/[a-z]/.test(v)) score += 10;   /* lowercase */
            if (/[A-Z]/.test(v)) score += 15;   /* uppercase */
            if (/[0-9]/.test(v)) score += 15;   /* digit */
            if (/[!@#$.%^&*_-]/.test(v)) score += 20;   /* symbol */
            return Math.min(score, 100);
        }

        function updateStrength(val) {
            var box = document.getElementById("mo-cp-strength");
            if (!box) return;
            var score = calcStrength(val);
            /* "Perfect!" contract: the top tier only shows when ALL client-checkable
               policy rules are met (same checks as the visible requirements list),
               and then the score is forced to 100 so the bar renders FULL. A
               strong-scoring password with an unmet rule is capped just below the
               strong threshold instead. */
            var cpPolicyOk = val.length >= cpMin && val.length <= cpMax &&
                /[A-Z]/.test(val) && /[0-9]/.test(val) && cpSymRegex.test(val) && cpAllowedRegex.test(val);
            if (score >= 75) score = cpPolicyOk ? 100 : 74;
            /* Guard on score so observer ticks with the same value don't rewrite
               style/text (which would retrigger the observer and loop). */
            if (box.dataset.score === String(score)) return;
            box.dataset.score = String(score);
            var fill = box.querySelector(".mo-strength-fill");
            var tierEl = box.querySelector(".mo-strength-tier");
            if (!val) { box.style.display = "none"; return; }
            box.style.display = "block";
            var tier, color;
            if (score < 30) { tier = tr("changepw.strength.weak"); color = "#ef2f2f"; }
            else if (score < 55) { tier = tr("changepw.strength.fair"); color = "#f59e0b"; }
            else if (score < 75) { tier = tr("changepw.strength.good"); color = "#0A55D7"; }
            else { tier = tr("changepw.strength.strong"); color = "#1b8f3a"; }
            if (fill) { fill.style.width = score + "%"; fill.style.background = color; }
            if (tierEl) { tierEl.textContent = tier; tierEl.style.color = color; }
        }

        /* Bind events for dynamic updates */
        if (newPasswordInput && !newPasswordInput.dataset.moListener) {
            newPasswordInput.dataset.moListener = "true";
            newPasswordInput.addEventListener("input", updatePasswordRequirementsAndStrength);
            newPasswordInput.addEventListener("input", clearCpError);
            newPasswordInput.addEventListener("input", function () {
                updateMoReqList(newPasswordInput.value || "");
                updateStrength(newPasswordInput.value || "");
            });
            updatePasswordRequirementsAndStrength();
        }
        /* Initial paint (handles dots + empty-state, runs even if listeners
           were already bound on a previous call) */
        updateMoReqList(newPasswordInput ? (newPasswordInput.value || "") : "");
        updateStrength(newPasswordInput ? (newPasswordInput.value || "") : "");
        if (confirmPasswordInput && !confirmPasswordInput.dataset.moListener) {
            confirmPasswordInput.dataset.moListener = "true";
            confirmPasswordInput.addEventListener("input", clearCpError);
        }

        /* Update button text to NEXT → */
        var saveBtn = document.getElementById("validate") || document.getElementById("submit");
        setBtnArrowLabel(saveBtn, tr("next.button"));

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

            // Show message. Always keep the password policy checklist and the
            // strength meter visible (never hidden), regardless of the error type.
            if (errEl) {
                errEl.textContent = msg;
                errEl.style.display = "block";
            }
            if (helpEl) {
                helpEl.style.display = "block";
            }
        }

        function clearCpError() {
            var errEl = document.getElementById("mo-cp-error-text");
            var helpEl = document.getElementById("mo-cp-helper-text");

            // Remove highlighting
            if (newPasswordInput) newPasswordInput.classList.remove("mo-input-error", "border", "border-danger");
            if (confirmPasswordInput) confirmPasswordInput.classList.remove("mo-input-error", "border", "border-danger");

            // Remove red cross icons
            document.querySelectorAll(".mo-pw-wrap .mo-error-icon").forEach(function (ico) {
                ico.remove();
            });

            // Remove the server-rendered error message and prevent the observer
            // from re-inserting it (set a dismissed flag once the user edits)
            var serverErr = document.getElementById("mo-cp-server-error");
            if (serverErr) serverErr.remove();
            if (fpForm) fpForm.dataset.moServerErrDismissed = "true";

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
                    showCpError(tr("changepw.error.required"));
                    if (newPasswordInput) newPasswordInput.focus();
                    return;
                }

                /* Re-evaluate the VISIBLE requirement list and block only if a shown,
                   client-checkable rule is unmet — keeps the gate in sync with the
                   green/red ticks the user actually sees (PII rules show a dot and are
                   validated server-side, so they never block here). */
                updateMoReqList(val);
                var unmet = false;
                document.querySelectorAll("#mo-cp-helper-text li[data-req] .mo-req-marker").forEach(function (m) {
                    if (m.dataset.state === "bad") unmet = true;
                });
                if (unmet) {
                    e.preventDefault();
                    showCpError(tr("changepw.error.requirements"));
                    if (newPasswordInput) newPasswordInput.focus();
                    return;
                }

                if (val !== confirmVal) {
                    e.preventDefault();
                    showCpError(tr("changepw.error.mismatch"));
                    if (confirmPasswordInput) confirmPasswordInput.focus();
                    return;
                }
            });
        }

        /* ── PASSWORD MATCH CHECK (blur on confirm) ── */
        /* Reuses the single showCpError/clearCpError message element
           (#mo-cp-error-text) so the mismatch message can never be shown twice
           (the submit handler uses the same element). The per-field input
           listeners already bound above call clearCpError on every keystroke, so
           the error clears as soon as the user edits either field. */
        function bindPasswordMatchCheck() {
            if (!newPasswordInput || !confirmPasswordInput) return;
            if (confirmPasswordInput.dataset.moMatchListener) return;
            confirmPasswordInput.dataset.moMatchListener = "true";

            function checkMatch() {
                var newVal = newPasswordInput.value;
                var confirmVal = confirmPasswordInput.value;
                if (confirmVal && newVal !== confirmVal) {
                    showCpError(tr("changepw.error.mismatch"));
                } else {
                    clearCpError();
                }
            }

            $(confirmPasswordInput).on("blur", checkMatch);
        }
        bindPasswordMatchCheck();

        /* Server-rendered error banner -> show below the new password field.
           Guarded by #mo-cp-server-error so it appends ONCE (otherwise the
           observer re-runs this block and stacks duplicate messages). */
        var isPageHasError = errorOnPage();
        if (isPageHasError && !document.getElementById("mo-cp-server-error") && !(fpForm && fpForm.dataset.moServerErrDismissed)) {
            console.log('IN ERROR SECTION ');
            var message = $('#error-alert-message .errorMessage li span').text().trim();
            /* The server returns the full password policy string when the password
               fails the policy (e.g. contains the user's name/email). We validate
               all those rules manually, so collapse this one case into a short msg. */
            if (/should be present|should not be present/i.test(message)) {
                message = "Password requirement not matched";
            }
            var $cpWrap = $('.mo-pw-wrap');
            var cpErrHtml = '<p id="mo-cp-server-error" class="text-danger pb-2" style="font-size:12px;font-weight:500;margin-top:-10px;margin-bottom:8px;">' + message + '</p>';
            if ($cpWrap.length) {
                $cpWrap.eq(0).after(cpErrHtml);
            } else {
                $(newPasswordInput).after(cpErrHtml);
            }
            /* Highlight both fields with red border + cross icon */
            var CP_CROSS = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/></svg>';
            [newPasswordInput, confirmPasswordInput].forEach(function (inp) {
                if (!inp) return;
                $(inp).addClass("border border-danger mo-input-error");
                var w = inp.closest(".mo-pw-wrap");
                if (w && !w.querySelector(".mo-error-icon")) {
                    var icon = document.createElement("span");
                    icon.className = "mo-error-icon";
                    icon.innerHTML = CP_CROSS;
                    w.appendChild(icon);
                }
            });
            $('#error-alert-message').hide();
        }

        var newPwLabel = $("span.d-flex.align-items-left")[0];
        if (newPwLabel && newPwLabel.textContent == 'Nieuw wachtwoord') {
            newPwLabel.textContent = 'Vul een nieuw wachtwoord in';
        }

    }

    /* ── MAIN RUN ── */
    function run() {
        if (checkIsLogout()) { applyLogoutPage(); return; }

        /* getLocale() below already captures ?request_locale from the URL on the
           openidsso page too, and that page renders the normal login form — so we
           let it fall through to the login styling instead of short-circuiting. */
        getLocale();

        var isLogin = checkIsLogin();
        var isRedirectToIdpLogin = checkIsRedirectToIdpLogin();
        var isForgot = checkIsForgot();
        var isOtp = checkIsOtp();
        var isChangePass = checkIsChangePass();
        var isEnduserDashboard = checkIsEnduserDashboard();
        var isPasswordSentMessage = checkIsPasswordSentMessage();

        if (!isLogin && !isRedirectToIdpLogin && !isForgot && !isOtp && !isChangePass && !isEnduserDashboard && !isPasswordSentMessage) return;

        var isPageHasError = errorOnPage();
        if (isPageHasError) { console.log("this page has errir"); }

        injectFontAndCss();

        /* The redirecttoidplogin page also matches checkIsLogin() (it has
           #idploginform), so exclude it here — it has its own handler below.
           Otherwise both flows run and each appends its own error message. */
        if (isLogin && !isRedirectToIdpLogin) {
            applyEmailStep();
            applyPasswordStep();
            handleLoginErrors();
            applyRegisterErrorParam();
            applyCreateAccountHelper();
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

        if (isRedirectToIdpLogin) { applyRedirectToIdpLogin(); }
        if (isForgot) { applyForgotPage(); }
        if (isOtp) { applyOtpPage(); }
        if (isChangePass) { applyChangePasswordPage(); }
        if (isEnduserDashboard) { applyEnduserDashboard(); }
        if (isPasswordSentMessage) { applyPasswordSentMessage(); }
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
        var isRedirectToIdpLogin = checkIsRedirectToIdpLogin();
        var isForgot = checkIsForgot();
        var isOtp = checkIsOtp();
        var isChangePass = checkIsChangePass();

        if (isLogin && !isRedirectToIdpLogin) { forceHide(); applyPasswordStep(); handleLoginErrors(); applyRegisterErrorParam(); applyCreateAccountHelper(); }
        if (isRedirectToIdpLogin) { applyRedirectToIdpLogin(); }
        if (isForgot) { applyForgotPage(); }
        if (isOtp) { applyOtpPage(); }
        if (isChangePass) { applyChangePasswordPage(); }
        if (checkIsEnduserDashboard()) { applyEnduserDashboard(); }
        if (checkIsPasswordSentMessage()) { applyPasswordSentMessage(); }
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class"]
    });

    /* miniOrange can set <html lang> AFTER our timed ticks on a cold load. Since
       the /openidsso 302 stops our JS from ever seeing ?request_locale, that
       attribute is the only locale carrier here — re-resolve and re-render the
       moment it appears/changes so a late "it" corrects the English first paint.
       Watches documentElement (not body), which the observer above never sees. */
    var htmlLangObserver = new MutationObserver(function () { run(); });
    htmlLangObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["lang"]
    });

}());

/* ══════════════════════════════════════════════════════════════════
   GOOGLE TAG MANAGER — loads on EVERY IdP page (no endpoint guard).
   Container id is per-client: change it when adapting for a new tenant.
   ══════════════════════════════════════════════════════════════════ */

/* GTM CONTAINER LOADER */
(function (w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-536S446C');


(function () {
    'use strict';

    var fired = false;

    function pushToDataLayer(payload) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(payload);
    }

    /* Mirrors the main IIFE's page detectors (path first, DOM-marker fallback).
       Most-specific checks first: the login branch's DOM fallback would
       otherwise shadow other pages, so it goes last. */
    function detectPage() {
        var path = window.location.pathname.toLowerCase();
        if (path.indexOf('/moas/logoutpage') !== -1) return 'logout';
        if (path.indexOf('/moas/enduserwelcome') !== -1) return 'dashboard';
        if (path.indexOf('/moas/idp/validatenextfactor') !== -1 || document.getElementById('otpToken')) return 'otp';
        if (path.indexOf('moas/idp/showpasswordsentmessage') !== -1) return 'password_sent';
        if (path.indexOf('moas/idp/changepassword') !== -1 ||
            path.indexOf('moas/idp/changeuserpassword') !== -1 ||
            path.indexOf('moas/idp/updateuserpassword') !== -1 ||
            document.getElementById('passwordform')) return 'change_password';
        if (path.indexOf('moas/idp/forgotpassword') !== -1 ||
            path.indexOf('moas/idp/resetpassword') !== -1 ||
            path.indexOf('moas/idp/resetuserpassword') !== -1) return 'forgot_password';
        var userform = document.getElementById('userform');
        if (userform && /resetuserpassword|resetpassword|forgotpassword/.test((userform.getAttribute('action') || '').toLowerCase())) return 'forgot_password';
        if (path.indexOf('/moas/login') !== -1 || path.indexOf('/moas/idp/userlogin') !== -1 ||
            path.indexOf('/moas/validatepassword') !== -1 || path.indexOf('/moas/redirecttoidplogin') !== -1 ||
            document.getElementById('enduserloginform') || document.getElementById('idploginform')) return 'login';
        return '';
    }

    /* Only one page's mo- error node exists at a time, so a flat lookup is
       safe: login steps, combined login, OTP (reuses mo-userlogin-error),
       forgot/reset, change password — then the server banner as fallback. */
    var ERROR_IDS = ['mo-pw-error', 'mo-userlogin-error', 'mo-redirect-error', 'mo-fp-error', 'mo-cp-error-text'];

    function getErrorMessage() {
        for (var i = 0; i < ERROR_IDS.length; i++) {
            var el = document.getElementById(ERROR_IDS[i]);
            if (el && el.textContent.trim()) {
                return el.textContent.trim();
            }
        }

        var banner = document.getElementById('error-alert-message');
        if (banner) {
            var span = banner.querySelector('.errorMessage li span');
            if (span && span.textContent.trim()) {
                return span.textContent.trim();
            }
        }

        return '';
    }

    /* OTP page: parse the masked recipient email (am****ar@gm***.com) out of
       the "OTP sent" success alert. Asterisk-tolerant — same pattern as the
       password-sent handler in the main IIFE — and locale-independent (only
       the email token is parsed, never the surrounding sentence). Works both
       before and after the main IIFE's nl alert rewrite, which re-inserts the
       parsed email. */
    function getOtpMaskedEmail() {
        var span = document.querySelector('#success-alert-message .actionMessage li span');
        var match = span ? span.textContent.match(/[\w.*+-]+@[\w.*-]+\.[\w.*-]+/) : null;
        /* the domain part greedily grabs the sentence's trailing period */
        return match ? match[0].replace(/\.+$/, '') : '';
    }

    /* Lowercased substrings that mark a locked/blocked/denied account. Derived
       from the auth-server's own message*.properties, covering the whole lock
       family — "not authorized/permitted/allowed to login" (error.authorization,
       msg.user.{first,second}.factor.denied, error.rba.deny), "account has been
       locked/blocked/disabled" (error.user.disabled,
       error.enduser.disabled.with.failed.attempts, error.customer.account.blocked),
       and "not allowed to login with this IP" (error.blocked.ip). Backend serves
       error banners in 10 locales — ar, de, en, es, fr, it, nl, pl, pt, tr —
       matching customjs's own TRANSLATIONS set.
       The backend often phrases lockout as an authorization refusal, not the word
       "locked", so both phrasings are matched. Every substring has been checked
       against each locale's invalid-credentials and OTP-failure strings
       (error.enduser.invalid, error.login*, error.validate.fail) — none collide,
       so a wrong-password or bad-OTP message never reads as account_locked. Add
       new confirmed strings here as backend copy changes. */
    var LOCK_PATTERNS = [
    /* en */ 'not authorized to log', 'not permitted to login', 'not allowed to log', 'locked', 'blocked',
    /* nl */ 'niet bevoegd om in te loggen', 'mag niet inloggen', 'niet toegestaan om in te loggen', 'geblokkeerd',
    /* de */ 'nicht berechtigt', 'nicht erlaubt', 'gesperrt', 'blockiert',
    /* fr */ 'autorisé', 'verrouillé', 'bloqué',
    /* it */ 'autorizzato', 'consentito', 'bloccato',
    /* es + pt */ 'autorizado', 'bloqueada', 'bloqueado', 'desactivada',
    /* pl */ 'upoważniony do logowania', 'nie wolno się logować', 'zablokowan',
    /* tr */ 'yetkiniz yok', 'izin verilmiyor', 'kilitlendi', 'engellendi',
    /* ar */ 'غير مصرح', 'غير مسموح', 'قفل', 'حظر'
    ];

    /* Lowercased substrings for the OTP transaction-limit error
       (error.transaction.limit.exceeded, "The transaction limit has been
       exceeded."). Distinct from a wrong OTP — the user hit the OTP send/verify
       quota — so it maps to its own error_type instead of incorrect_otp. Backend
       defines it in 8 locales; es/pt inherit the en string via resource-bundle
       fallback, so 'transaction limit' covers them. No substring collides with
       the credential/OTP/lock strings (none mention transactions). tr note: "İ"
       lowercases to "i̇" (i + combining dot) in JS, so we match 'limiti aşıldı'
       rather than the leading "İşlem". */
    var TXN_LIMIT_PATTERNS = [
    /* en (+es/pt fallback) */ 'transaction limit',
    /* de */ 'transaktionslimit',
    /* fr */ 'limite de transaction',
    /* it */ 'limite di transazione',
    /* nl */ 'transactielimiet',
    /* pl */ 'limit transakcji',
    /* tr */ 'limiti aşıldı',
    /* ar */ 'حد المعاملة'
    ];

    /* Classify an error into a typed error_type. Primary signal is the PAGE,
       not the message text — locale-independent and robust: an error on the OTP
       page is an OTP error no matter how the backend phrased it in 10 languages
       (so "Validatie mislukt…" needs no Dutch parsing). The one state page
       context can't see is a locked-out account — it surfaces a distinct banner
       on the login/OTP page — so that ONE case is detected by matching known
       lock wording, which overrides the page default. Login folds
       wrong-password and unknown-user into invalid_credentials because the
       backend returns one generic message for both (by design). */
    function classifyError(page, message) {
        var m = (message || '').toLowerCase();
        for (var i = 0; i < LOCK_PATTERNS.length; i++) {
            if (m.indexOf(LOCK_PATTERNS[i]) !== -1) return 'account_locked';
        }
        for (var j = 0; j < TXN_LIMIT_PATTERNS.length; j++) {
            if (m.indexOf(TXN_LIMIT_PATTERNS[j]) !== -1) return 'transaction_limit_exceeded';
        }
        if (page === 'login') return 'invalid_credentials';
        if (page === 'otp') return 'incorrect_otp';
        if (page === 'forgot_password') return 'forgot_password_error';
        if (page === 'change_password') return 'change_password_error';
        return 'unknown';
    }

    function track() {
        if (fired) return;

        var page = detectPage();
        if (!page) return;

        /* Redirect-only and success-only pages have no error state to report. */
        if (page !== 'logout' && page !== 'dashboard' && page !== 'password_sent') {
            var errorMessage = getErrorMessage();
            if (errorMessage) {
                fired = true;
                var eventName = (page === 'otp') ? 'login_error' : page + '_error';
                var errPayload = { event: eventName, page_type: page, error_type: classifyError(page, errorMessage), error_message: errorMessage };
                if (page === 'otp') errPayload.masked_email = getOtpMaskedEmail();
                pushToDataLayer(errPayload);
                return;
            }
        }

        if (page === 'login') {
            /* Wait for the form so the username value is readable; ticks retry. */
            var usernameEl = document.getElementById('username');
            if (!usernameEl) return;
            fired = true;
            pushToDataLayer({ event: 'view_login', page_type: page, username: usernameEl.value || '' });
            return;
        }

        fired = true;
        var payload = { event: 'view_' + page, page_type: page };
        if (page === 'otp') payload.masked_email = getOtpMaskedEmail();
        pushToDataLayer(payload);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', track);
    } else {
        track();
    }

    setTimeout(track, 300);
    setTimeout(track, 800);
    setTimeout(track, 1500);
}());
