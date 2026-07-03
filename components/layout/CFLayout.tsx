import type { ReactNode } from "react";
import Footer from "../cf/Footer";
import { BaseLayout } from "./BaseLayout";

interface CFLayoutProps {
  children: ReactNode;
}

export const CFLayout = ({ children }: CFLayoutProps) => {
  return (
    <BaseLayout>
      <div className="cf-page-shell flex min-h-svh w-full flex-col justify-center px-1 py-1 sm:px-4 sm:py-4 lg:px-6">
        <div className="w-full max-w-[calc(100vw-0.5rem)] sm:max-w-[480px] md:max-w-[720px] lg:max-w-3xl mx-auto">
          {children}
        </div>

        <div className="cf-footer-wrap mt-1 sm:mt-3 flex justify-center w-full">
          <Footer />
        </div>
      </div>
    </BaseLayout>
  );
};

export default CFLayout;
