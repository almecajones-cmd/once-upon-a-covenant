import Image from "next/image";

const LOGO_URL = "https://res.cloudinary.com/v78xwhwr/image/upload/v1790540869/Midwest_Marriage_Consortium_Emblem_j36lxr.png";

type BrandMarkProps = {
  compact?: boolean;
  showTitle?: boolean;
};

export default function BrandMark({ compact = false, showTitle = true }: BrandMarkProps) {
  const size = compact ? 38 : 52;

  return (
    <span className={compact ? "brandLockup brandLockup--compact" : "brandLockup"}>
      <Image
        className="brandEmblem"
        src={LOGO_URL}
        alt="Midwest Marriage Consortium"
        width={size}
        height={size}
        quality={100}
        sizes={compact ? "38px" : "52px"}
      />
      {showTitle && <span className="brandLockupTitle">Once Upon a Covenant</span>}
    </span>
  );
}
