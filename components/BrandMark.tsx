const LOGO_URL = "https://res.cloudinary.com/v78xwhwr/image/upload/v1790540869/Midwest_Marriage_Consortium_Emblem_j36lxr.png";

type BrandMarkProps = {
  compact?: boolean;
  showTitle?: boolean;
};

export default function BrandMark({ compact = false, showTitle = true }: BrandMarkProps) {
  return (
    <span className={compact ? "brandLockup brandLockup--compact" : "brandLockup"}>
      <img
        className="brandEmblem"
        src={LOGO_URL}
        alt="Midwest Marriage Consortium"
        width={compact ? 38 : 52}
        height={compact ? 38 : 52}
        loading="eager"
      />
      {showTitle && <span className="brandLockupTitle">Once Upon a Covenant</span>}
    </span>
  );
}
