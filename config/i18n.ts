export interface PageTranslation {
  title: string;
  message: string;
}

export interface InterfaceTranslations {
  message: string;
}

export interface BlockPageTranslation extends PageTranslation {}
export interface ErrorPageTranslation extends PageTranslation {}
export interface ChallengePageTranslation extends PageTranslation {}

export const blockPageTranslations: Record<string, BlockPageTranslation> = {
  ip: {
    title: "访问被阻止",
    message: "网站所有者已阻止您的 IP 地址访问。",
  },
  waf: {
    title: "请求被 WAF 拦截",
    message: "Cloudflare Web 应用程序防火墙已拦截您的请求。",
  },
  "rate-limit": {
    title: "请求过于频繁 - 429",
    message: "您的请求次数过多，请稍后再试。",
  },
} as const;

export const errorPageTranslations: Record<string, ErrorPageTranslation> = {
  "500s": {
    title: "源站服务器错误",
    message: "网站暂时无法处理请求，请稍后再试。",
  },
  "1000s": {
    title: "DNS 解析错误",
    message: "请求的主机名无法解析，请检查域名或配置。",
  },
} as const;

export const challengePageTranslations: Record<
  string,
  ChallengePageTranslation
> = {
  interactive: {
    title: "交互式质询",
    message: "请完成验证后继续访问。",
  },
  managed: {
    title: "正在遭受攻击模式™",
    message: "请完成验证后继续。这是一项常规安全检查。",
  },
  country: {
    title: "访问验证",
    message: "来自您所在国家/地区的访问需要额外验证。",
  },
  javascript: {
    title: "请稍候…",
    message: "安全系统正在验证您的请求，请稍候。",
  },
} as const;

export const interfaceTranslations: Record<string, InterfaceTranslations> = {
  "error-details": {
    message: "了解更多",
  },
  "connection-tracking": {
    message: "连接状态",
  },
  "network-status-you": {
    message: "您",
  },
  "network-status-cdn": {
    message: "CDN",
  },
  "network-status-origin": {
    message: "源站",
  },
} as const;
