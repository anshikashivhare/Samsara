import { useEffect, useState } from "react";
import shipBackground from "../assets/ship.jpg";

export function BackgroundLayers() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onerror = () => setFailed(true);
    img.src = shipBackground;
  }, []);

  if (failed) {
    return <div className="background-fallback" aria-hidden="true" />;
  }

  return (
    <>
      <div className="background-image" aria-hidden="true">
        <img
          src={shipBackground}
          alt=""
          loading="eager"
          decoding="async"
          // @ts-expect-error — non-standard but supported by all modern browsers
          fetchpriority="low"
        />
      </div>
      <div className="background-overlay" aria-hidden="true" />
      <div className="background-vignette" aria-hidden="true" />
    </>
  );
}
