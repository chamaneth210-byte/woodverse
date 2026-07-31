export function BrandLogo({ className = "", imageClassName = "h-9 w-9", textClassName = "", subtitle, subtitleClassName = "" }) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}>
      <img src="/assets/woodverse-logo.png" alt="WoodVerse logo" className={`shrink-0 object-contain ${imageClassName}`} />
      <span className="min-w-0">
        <span className={`block break-words font-extrabold leading-none ${textClassName}`}>WoodVerse</span>
        {subtitle && <span className={`mt-1 block break-words leading-none ${subtitleClassName}`}>{subtitle}</span>}
      </span>
    </span>
  );
}
