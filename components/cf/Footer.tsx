import { Card, CardBody } from "@heroui/card";
import { memo } from "react";
import { CFCardWrap } from "./ui/CFCardWrapper";

interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem = memo(({ label, value }: InfoItemProps) => (
  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
    <span>{label}:</span>
    <span>{value}</span>
  </span>
));

InfoItem.displayName = "InfoItem";

const Separator = memo(() => (
  <span className="text-xs text-gray-400 dark:text-gray-600">{"\u2022"}</span>
));
Separator.displayName = "Separator";

export const FooterContent = memo(() => {
  return (
    <CFCardWrap>
      <Card className="w-full border-0 shadow-none bg-transparent">
        <CardBody className="p-2 sm:p-3">
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
            <InfoItem label="位置" value="::GEO::" />
            <Separator />
            <InfoItem label="IP" value="::CLIENT_IP::" />
            <Separator />
            <InfoItem label="Ray ID" value="::RAY_ID::" />
          </div>
        </CardBody>
      </Card>
    </CFCardWrap>
  );
});
FooterContent.displayName = "FooterContent";

export const Footer = memo(() => <FooterContent />);

Footer.displayName = "Footer";
export default Footer;
