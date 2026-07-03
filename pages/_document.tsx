import { siteConfig } from "@/config/site";
import { Head, Html, Main } from "next/document";

const themeBootstrapScript = `
(function(){
  try {
    var key = "cf-theme-mode";
    var root = document.documentElement;
    var stored = localStorage.getItem(key);
    var mode = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var dark = mode === "dark" || (mode === "system" && prefersDark);
    root.classList.toggle("dark", dark);
    root.classList.toggle("light", !dark);
    root.setAttribute("data-cf-theme-mode", mode);
  } catch (e) {}
})();`;

const themeRuntimeScript = `
(function(){
  var key = "cf-theme-mode";
  var modes = ["system", "light", "dark"];
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var root = document.documentElement;

  function readMode() {
    try {
      var stored = localStorage.getItem(key);
      return modes.indexOf(stored) >= 0 ? stored : "system";
    } catch (e) {
      return "system";
    }
  }

  function apply(mode) {
    var dark = mode === "dark" || (mode === "system" && mq && mq.matches);
    root.classList.toggle("dark", !!dark);
    root.classList.toggle("light", !dark);
    root.setAttribute("data-cf-theme-mode", mode);
    var buttons = document.querySelectorAll("[data-cf-theme-toggle]");
    for (var i = 0; i < buttons.length; i++) {
      var text = mode === "system" ? "\u8ddf\u968f\u7cfb\u7edf\u4e3b\u9898" : mode === "dark" ? "\u6df1\u8272\u6a21\u5f0f" : "\u6d45\u8272\u6a21\u5f0f";
      buttons[i].setAttribute("title", text + "\uff0c\u70b9\u51fb\u5207\u6362");
      buttons[i].setAttribute("aria-label", text + "\uff0c\u70b9\u51fb\u5207\u6362");
    }
  }

  function setMode(mode) {
    try { localStorage.setItem(key, mode); } catch (e) {}
    apply(mode);
  }

  function nextMode() {
    var mode = readMode();
    setMode(modes[(modes.indexOf(mode) + 1) % modes.length]);
  }

  document.addEventListener("click", function(event) {
    var target = event.target;
    var button = target && target.closest ? target.closest("[data-cf-theme-toggle]") : null;
    if (!button) return;
    event.preventDefault();
    nextMode();
  });

  if (mq) {
    var listener = function(){ if (readMode() === "system") apply("system"); };
    if (mq.addEventListener) mq.addEventListener("change", listener);
    else if (mq.addListener) mq.addListener(listener);
  }

  apply(readMode());
})();`;

export default function Document() {
  return (
    <Html lang="zh-CN" data-cf-theme-mode="system">
      <Head>
        {/* <!-- Cloudflare Pages Custom Error Pages --> */}
        <meta name="description" content={siteConfig.description} />
        <meta name="robots" content="index, nofollow" />
        <script
          data-cf-theme-bootstrap
          dangerouslySetInnerHTML={{ __html: themeBootstrapScript }}
        />
      </Head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Main />
        <script
          data-cf-theme-runtime
          dangerouslySetInnerHTML={{ __html: themeRuntimeScript }}
        />
      </body>
    </Html>
  );
}
