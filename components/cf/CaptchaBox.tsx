"use client";

import { Icon } from "@/components/ui/icon";
import { challengePageTranslations } from "@/config/i18n";
import type { ChallengePageConfig } from "@/config/routes";
import { CFCard } from "./ui/CFCard";
import { CFCardWrap } from "./ui/CFCardWrapper";
import { NetworkStatusBox } from "./ui/NetworkStatusBox";
import { NetworkStatusWrapper } from "./ui/NetworkStatusWrapper";

export const CaptchaBox = ({
  type,
  box,
  icon,
  networkStatus,
}: ChallengePageConfig) => {
  const translation = challengePageTranslations[type];
  return (
    <CFCardWrap>
      <CFCard
        title={translation.title}
        message=""
        subtitle="安全检查"
        icon={<Icon name={icon} className="h-6 w-6 text-white" />}
        headerClassName="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/10"
        scheme="primary"
      >
        <div className="space-y-3 sm:space-y-5">
          {translation.message && (
            <div className="flex items-start gap-2 -mt-3 sm:-mt-4 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-900/30">
              <Icon
                name="info"
                className="w-4 h-4 mt-0.5 text-blue-500 dark:text-blue-400 flex-shrink-0"
              />
              <p className="text-sm leading-6 text-blue-700 dark:text-blue-300">
                {translation.message}
              </p>
            </div>
          )}

          <div className="cf-challenge-viewport mx-auto w-full bg-gray-50 dark:bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors hover:border-blue-200 dark:hover:border-blue-700">
            {box ? (
              <div
                className="cf-challenge-box text-gray-600 dark:text-gray-300 flex items-center justify-center"
                dangerouslySetInnerHTML={{
                  __html: `<div class="cf-challenge-inner">::${box}::</div>`,
                }}
                aria-live="polite"
              />
            ) : (
              <p className="text-gray-400 dark:text-gray-500 font-medium">
                正在加载验证…
              </p>
            )}
          </div>

          <NetworkStatusWrapper>
            <NetworkStatusBox {...networkStatus} />
          </NetworkStatusWrapper>
        </div>
      </CFCard>
    </CFCardWrap>
  );
};

export default CaptchaBox;
