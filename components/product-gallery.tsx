"use client";
import { useEffect, useRef, useState, type TouchEvent } from "react";

type Props = { images: string[]; alt: string; sample: boolean; save: number };

export function ProductGallery({ images, alt, sample, save }: Props) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const main = images[active] ?? images[0];
  const many = images.length > 1;
  const move = (d: number) => setActive((i) => (i + d + images.length) % images.length);

  // Phone swipe: the click that follows a swipe must not also step or close.
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const touchStart = (e: TouchEvent) => {
    swipeStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    swiped.current = false;
  };
  const touchEnd = (e: TouchEvent) => {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || !many) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    swiped.current = true;
    move(dx < 0 ? 1 : -1);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowRight") setActive((i) => (i + 1) % images.length);
      else if (e.key === "ArrowLeft") setActive((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, images.length]);

  return (
    <div>
      <div className="pdp-media">
        <button type="button" className="pdp-media-open" aria-label="View larger photo" aria-haspopup="dialog" onClick={() => setOpen(true)}>
          <img src={main} alt={alt} width={900} height={900} fetchPriority="high" />
        </button>
        {sample && <span className="tag-sample">Sample item</span>}
        {save > 0 && <span className="tag-save">−{save}%</span>}
        {sample && <span className="pdp-img-note">Representative image — exact model may differ</span>}
      </div>
      {many && (
        <div className="pdp-thumbs" role="group" aria-label="Product photos">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              className={i === active ? "is-active" : undefined}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}
      {open && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Product photos"
          onClick={() => {
            if (swiped.current) { swiped.current = false; return; }
            setOpen(false);
          }}
          onTouchStart={touchStart}
          onTouchEnd={touchEnd}
        >
          <button type="button" className="lightbox-close" aria-label="Close photos" autoFocus onClick={() => setOpen(false)}>×</button>
          <img
            className={`lightbox-img${many ? " is-step" : ""}`}
            src={images[active] ?? images[0]}
            alt={alt}
            onClick={(e) => {
              e.stopPropagation();
              if (swiped.current) { swiped.current = false; return; }
              if (many) move(1);
            }}
          />
          {many && (
            <>
              <button type="button" className="lightbox-prev" aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); move(-1); }}>‹</button>
              <button type="button" className="lightbox-next" aria-label="Next photo" onClick={(e) => { e.stopPropagation(); move(1); }}>›</button>
              <span className="lightbox-count">{active + 1} / {images.length}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
