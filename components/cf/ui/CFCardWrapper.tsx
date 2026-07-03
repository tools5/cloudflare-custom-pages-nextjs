import type { ReactNode } from "react";

interface CFCardWrapProps {
  children: ReactNode;
  className?: string;
}

export const CFCardWrap = ({ children, className }: CFCardWrapProps) => {
  return (
    <div className={`flex items-center justify-center p-1 sm:p-3 ${className || ""}`}>
      {children}
    </div>
  );
};
