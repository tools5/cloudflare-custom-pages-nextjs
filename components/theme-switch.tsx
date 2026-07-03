import { Icon } from "@/components/ui/icon";
import type { FC } from "react";

export interface ThemeSwitchProps {
  className?: string;
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className }) => {
  return (
    <button
      type="button"
      data-cf-theme-toggle="true"
      className={`cf-theme-toggle inline-flex h-8 min-w-8 items-center justify-center gap-1 rounded-full bg-white/50 px-2 text-gray-600 shadow-sm ring-1 ring-black/5 backdrop-blur transition hover:bg-white/80 dark:bg-gray-950/40 dark:text-gray-200 dark:hover:bg-gray-900/70 ${className || ""}`}
      aria-label="切换主题"
      title="跟随系统 / 浅色 / 深色"
    >
      <span className="cf-theme-icon cf-theme-icon-light" aria-hidden="true">
        <Icon name="sun" className="h-5 w-5" />
      </span>
      <span className="cf-theme-icon cf-theme-icon-dark" aria-hidden="true">
        <Icon name="moon" className="h-5 w-5" />
      </span>
      <span className="cf-theme-icon cf-theme-icon-system" aria-hidden="true">
        跟
      </span>
    </button>
  );
};
