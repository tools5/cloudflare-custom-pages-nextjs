import * as fs from "node:fs";
import * as path from "node:path";
import * as cheerio from "cheerio";
import {
  blockPageTranslations,
  challengePageTranslations,
  errorPageTranslations,
} from "../config/i18n";

function getAllHtmlFiles(dirPath: string): string[] {
  const files: string[] = [];

  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllHtmlFiles(fullPath));
    } else if (path.extname(fullPath) === ".html") {
      files.push(fullPath);
    }
  }

  return files;
}

function processHtmlFile(filePath: string): void {
  try {
    const html = fs.readFileSync(filePath, "utf-8");
    const $ = cheerio.load(html);

    $('link[rel="preload"]').each((_, element) => {
      const $element = $(element);
      const as = $element.attr("as");

      if (as === "style") {
        $element.attr("rel", "stylesheet");
        $element.removeAttr("as");
      } else if (as === "font") {
        $element.remove();
      }
    });

    updateTDK($, filePath);

    // Add Cloudflare meta tags to every generated custom page.
    if (filePath.includes(path.join("out", "cf"))) {
      addCloudflareMetaTags($);
      forceDarkClass($);
    }

    // Challenge 页面不能保留 Next.js/React 客户端脚本。
    // Cloudflare 会把 ::CAPTCHA_BOX:: 替换为真实交互框；如果 Next.js 再水合，
    // 会重写 DOM，导致 Turnstile 报 insertBefore null，交互无法拉起。
    // Challenge pages must not keep Next.js/React client scripts.
    // Cloudflare injects the real challenge widget at request time; hydration can
    // rewrite the DOM and break Turnstile.
    stripNextScriptsFromChallengePages($, filePath);

    // Move build-time scripts first, then inject the tiny theme bootstrap into head.
    // The bootstrap must stay in head so system/light/dark mode is applied before paint.
    moveScriptsToBodyBottom($);

    if (isCloudflarePage) {
      injectCloudflareThemeRuntime($);
    }

    fs.writeFileSync(filePath, $.html());
    console.log(`Processed: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

function updateTDK($: cheerio.CheerioAPI, filePath: string): void {
  const pathParts = filePath.split(path.sep);
  const cfIndex = pathParts.findIndex((part) => part === "cf");

  if (cfIndex === -1 || cfIndex + 2 >= pathParts.length) {
    return;
  }

  const directory = pathParts[cfIndex + 1];
  const type = pathParts[cfIndex + 2];

  let pageTitle = "";
  let pageDescription = "";

  if (directory === "block" && type in blockPageTranslations) {
    pageTitle = blockPageTranslations[type].title;
    pageDescription = blockPageTranslations[type].message;
  } else if (directory === "error" && type in errorPageTranslations) {
    pageTitle = errorPageTranslations[type].title;
    pageDescription = errorPageTranslations[type].message;
  } else if (directory === "challenge" && type in challengePageTranslations) {
    pageTitle = challengePageTranslations[type].title;
    pageDescription = challengePageTranslations[type].message;
  }

  if (pageTitle) {
    $("title").text(`${pageTitle} - Cloudflare`);
  }

  if (pageDescription) {
    const descriptionMeta = $('meta[name="description"]');
    if (descriptionMeta.length > 0) {
      descriptionMeta.attr("content", pageDescription);
    } else {
      $("head").append(
        `<meta name="description" content="${pageDescription}">`,
      );
    }
  }

  const keywordsMeta = $('meta[name="keywords"]');
  if (keywordsMeta.length === 0) {
    $("head").append(
      '<meta name="keywords" content="Cloudflare, security, WAF, protection">',
    );
  }
}

/**
 * Add Cloudflare-specific meta tags to the top of head section in HTML files
 * - client-ip: ::CLIENT_IP::
 * - ray-id: ::RAY_ID::
 * - location-code: ::GEO::
 * - build-date: Current build timestamp
 * - version: Package version from package.json
 */
function addCloudflareMetaTags($: cheerio.CheerioAPI): void {
  const packagePath = path.join(__dirname, "../package.json");
  let version = "unknown";

  try {
    const packageContent = fs.readFileSync(packagePath, "utf-8");
    const packageJson = JSON.parse(packageContent);
    version = packageJson.version || "unknown";
  } catch (error) {
    console.warn("Failed to read package.json version:", error);
  }

  const buildDate = new Date().toISOString();

  $("head").prepend(`
    <meta name="client-ip" content="::CLIENT_IP::">
    <meta name="ray-id" content="::RAY_ID::">
    <meta name="location-code" content="::GEO::">
    <meta name="build-date" content="${buildDate}">
    <meta name="version" content="${version}">
  `);
}

/**
 * Move all script tags from head to the bottom of body
 *
 * Cloudflare will embed all style and script files in one HTML in the
 * final error page. However, this will break Next.js's script defer behavior.
 *
 * By putting all script tags to the bottom, we create a similar behavior to
 * defer with Cloudflare created inline scripts.
 */
function moveScriptsToBodyBottom($: cheerio.CheerioAPI): void {
  // Find all script tags in the head
  const headScripts = $("head script");

  if (headScripts.length === 0) {
    return;
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const scriptElements: any[] = [];

  headScripts.each((_, element) => {
    scriptElements.push(element);
  });

  // Remove scripts from head
  headScripts.remove();

  // Append all scripts to the bottom of body (before the closing body tag)
  for (const script of scriptElements) {
    $("body").append(script);
  }
}

function normalizeCloudflareHtml($: cheerio.CheerioAPI): void {
  const html = $("html");
  html.attr("lang", "zh-CN");
  html.attr("data-cf-theme-mode", "system");
}

function injectCloudflareThemeRuntime($: cheerio.CheerioAPI): void {
  const bootstrap = `
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

  const runtime = `
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
      var text = mode === "system" ? "跟随系统主题" : mode === "dark" ? "深色模式" : "浅色模式";
      buttons[i].setAttribute("title", text + "，点击切换");
      buttons[i].setAttribute("aria-label", text + "，点击切换");
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

  $("head").prepend(`<script data-cf-theme-bootstrap>${bootstrap}</script>`);
  $("body").append(`<script data-cf-theme-runtime>${runtime}</script>`);
}

function isChallengePage(filePath: string): boolean {
  const parts = filePath.split(path.sep);
  const cfIndex = parts.findIndex((part) => part === "cf");

  if (cfIndex === -1) {
    return false;
  }

  return parts[cfIndex + 1] === "challenge";
}

function stripNextScriptsFromChallengePages(
  $: cheerio.CheerioAPI,
  filePath: string,
): void {
  if (!isChallengePage(filePath)) {
    return;
  }

  // 移除所有构建时产生的脚本：__NEXT_DATA__、webpack chunk、next-themes inline script 等。
  // Cloudflare 真正的 challenge 脚本是在请求自定义页面时后注入的，不会存在于 out 构建产物里。
  // Remove build-time scripts: __NEXT_DATA__, webpack chunks, next-themes inline script, etc.
  // Cloudflare injects the real challenge script at request time, so it is not in out/.
  $("script").remove();

  // 同时移除 Next.js 脚本预加载，避免浏览器继续预加载无用 chunk。
  // Also remove Next.js script preloads so the browser does not preload unused chunks.
  $('link[rel="preload"][as="script"]').remove();
  $('link[rel="modulepreload"]').remove();
  $('link[href*="/_next/static/"][as="script"]').remove();
  $('link[href*="/_next/static/chunks/"]').remove();

  console.log(`Stripped Next.js scripts from challenge page: ${filePath}`);
}
function main() {
  const outDir = "./out";

  try {
    if (!fs.existsSync(outDir)) {
      console.error("Directory ./out does not exist");
      return;
    }

    const htmlFiles = getAllHtmlFiles(outDir);

    for (const file of htmlFiles) {
      processHtmlFile(file);
    }

    console.log("All files processed successfully!");
  } catch (error) {
    console.error("Error:", error);
  }
}

main();

