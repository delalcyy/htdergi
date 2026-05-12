"use client";

import { useState, useRef, useEffect } from "react";

const GALLERY = [
  "/kapak.png",
  "/ornekkapak4.png",
  "/ornekkapak5.png",
  "/ornekkapak6.png",
  "/ornekkapak7.png",
  "/ornekkapak8.png",
  "/ornekkapak9.png",
  "/ornekkapak10.png",
  "/ornekkapak11.png",
];

export default function GaleriSlider() {
  const [idx, setIdx] = useState(0);
  const vpRef = useRef<HTMLDivElement>(null);

  function slideW() {
    const slide = vpRef.current?.querySelector<HTMLElement>(".hp-slider-slide");
    return slide ? slide.offsetWidth + 16 : 0;
  }

  function goTo(i: number) {
    vpRef.current?.scrollTo({ left: i * slideW(), behavior: "smooth" });
    setIdx(i);
  }

  useEffect(() => {
    const vp = vpRef.current;
    if (!vp) return;
    const onScroll = () => {
      const w = slideW();
      if (w) setIdx(Math.round(vp.scrollLeft / w));
    };
    vp.addEventListener("scroll", onScroll, { passive: true });
    return () => vp.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((prev) => {
        const next = prev >= GALLERY.length - 1 ? 0 : prev + 1;
        vpRef.current?.scrollTo({ left: next * slideW(), behavior: "smooth" });
        return next;
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="hp-slider-wrap">
      <button
        className="hp-slider-arr hp-slider-arr--prev"
        onClick={() => goTo(Math.max(0, idx - 1))}
        disabled={idx === 0}
      >‹</button>

      <div className="hp-slider-viewport" ref={vpRef}>
        <div className="hp-slider-track">
          {GALLERY.map((label, i) => (
            <div key={i} className="hp-slider-slide">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={label} alt={`Örnek Kapak ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>

      <button
        className="hp-slider-arr hp-slider-arr--next"
        onClick={() => goTo(Math.min(GALLERY.length - 1, idx + 1))}
        disabled={idx >= GALLERY.length - 1}
      >›</button>

      <div className="hp-slider-dots">
        {GALLERY.map((_, i) => (
          <button
            key={i}
            className={`hp-slider-dot ${i === idx ? "hp-slider-dot--active" : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
