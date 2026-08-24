import { useEffect, useRef } from "react";

const source = new Image();
source.src = "/assets/frame-3.png";

export function CroppedImage({ crop, src, label, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !crop || src) return;

    function draw() {
      const [sx, sy, sw, sh] = crop.split(",").map(Number);
      const rect = canvas.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.round(rect.width * ratio));
      canvas.height = Math.max(1, Math.round(rect.height * ratio));
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(source, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    }

    if (source.complete) draw();
    source.addEventListener("load", draw);
    window.addEventListener("resize", draw);
    return () => {
      source.removeEventListener("load", draw);
      window.removeEventListener("resize", draw);
    };
  }, [crop, src]);

  if (src) {
    return <img src={src} alt={label} className={`block h-full w-full object-cover ${className}`} />;
  }

  return <canvas ref={ref} aria-label={label} className={`block h-full w-full ${className}`} />;
}
