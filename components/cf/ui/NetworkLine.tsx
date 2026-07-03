import { clsx } from "clsx";

type NetworkStatus = "success" | "error" | "challenging";

interface NetworkLineProps {
  status: NetworkStatus;
}

export const NetworkLine = ({ status }: NetworkLineProps) => {
  const styles = {
    success: {
      base: "bg-green-100/50 dark:bg-green-900/30",
      gradient:
        "bg-gradient-to-r from-transparent via-green-500/60 to-transparent dark:via-green-400/80",
    },
    error: {
      base: "bg-red-100/50 dark:bg-red-900/30",
      gradient:
        "bg-gradient-to-r from-transparent via-red-500/60 to-transparent dark:via-red-400/80",
    },
    challenging: {
      base: "bg-orange-100/50 dark:bg-orange-900/30",
      gradient:
        "bg-gradient-to-r from-transparent via-orange-500/60 to-transparent dark:via-orange-400/80",
    },
  }[status];

  return (
    <div className="flex-1 min-w-[18px] sm:min-w-[40px] flex items-center px-1 sm:px-3">
      <div
        className={clsx(
          "h-0.5 w-full relative transition-all duration-500 overflow-hidden rounded-full",
          styles.base,
        )}
      >
        <div
          className={clsx(
            "cf-network-line-anim absolute inset-0 w-full h-full",
            styles.gradient,
          )}
        />
      </div>
    </div>
  );
};
