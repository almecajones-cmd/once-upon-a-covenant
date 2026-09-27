const LOGO_URL = "https://res.cloudinary.com/v78xwhwr/image/upload/v1790540869/Midwest_Marriage_Consortium_Emblem_j36lxr.png";

type BrandMarkProps = {
  compact?: boolean;
  showTitle?: boolean;
};

export default function BrandMark({ compact = false, showTitle = true }: BrandMarkProps) {
  if (compact) {
    return (
      <span className="brandLockup brandLockup--compact">
        <span className="brandLockupTitle">Once Upon a Covenant</span>
      </span>
    );
  }

  return (
    <span className="brandLockup">
      <img
        className="brandEmblem"
        src={LOGO_URL}
        alt="Midwest Marriage Consortium"
        width={52}
        height={52}
        loading="lazy"
      />
      {showTitle && <span className="brandLockupTitle">Once Upon a Covenant</span>}
    </span>
  );
}
