import { useEffect, useRef, useState } from "react";

// Every cropped view is a rectangle out of this one sprite sheet, so the sheet is
// loaded once and shared. A fresh Image per component would re-download and re-decode
// it for every card on the page.
const SPRITE_SRC = "/assets/frame-3.webp";
let sprite;
function getSprite() {
  if (!sprite) sprite = new Image();
  if (!sprite.src.endsWith(SPRITE_SRC)) sprite.src = SPRITE_SRC;
  return sprite;
}

export function CroppedImage({ crop, src, label, className = "" }) {
  const ref = useRef(null);
  const [spriteReady, setSpriteReady] = useState(() => Boolean(getSprite().complete && getSprite().naturalWidth));

  useEffect(() => {
    if (src || !crop) return undefined;

    const image = getSprite();

    function draw() {
      const canvas = ref.current;
      if (!canvas || !image.complete || !image.naturalWidth) return;
      const [sx, sy, sw, sh] = crop.split(",").map(Number);
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // A rectangle past the edge of the sheet makes drawImage throw, which would blank
      // the whole card rather than just this image.
      if (sx + sw > image.naturalWidth || sy + sh > image.naturalHeight) return;
      ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    }

    // draw() reads naturalWidth, so a cached but still decoding image is not enough.
    if (image.complete && image.naturalWidth) {
      setSpriteReady(true);
      draw();
    } else {
      image.addEventListener("load", draw, { once: true });
    }
    window.addEventListener("resize", draw);
    return () => {
      image.removeEventListener("load", draw);
      window.removeEventListener("resize", draw);
    };
  }, [crop, src]);

  if (src) {
    return <img src={src} alt={label} className={`block h-full w-full object-cover ${className}`} />;
  }

  return <canvas ref={ref} aria-label={label} className={`block h-full w-full ${className} ${spriteReady ? "" : "opacity-0"}`} />;
}
