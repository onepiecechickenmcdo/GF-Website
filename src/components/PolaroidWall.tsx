"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { Caveat } from "next/font/google";
import { Sparkles, Heart } from "lucide-react";
import { INITIAL_POLAROID_CARDS } from "../lib/config";

const caveat = Caveat({ subsets: ["latin"], weight: ["400", "700"] });

export interface PolaroidCardData {
  id: string;
  src: string;
  caption: string;
  backText: string;
  rotation: number;
  featured?: boolean;
}

interface PolaroidCardBackProps {
  backText: string;
}

function useFitText(text: string) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  const adjust = () => {
    const container = containerRef.current;
    const el = textRef.current;
    if (!container || !el) return;

    let low = 13;
    let high = 28;
    let best = 13;

    const availableHeight = container.clientHeight - 4;
    const availableWidth = container.clientWidth;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      el.style.fontSize = `${mid}px`;

      if (
        el.offsetHeight <= availableHeight &&
        el.offsetWidth <= availableWidth
      ) {
        best = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    el.style.fontSize = `${best}px`;
    setIsScrollable(el.offsetHeight > availableHeight);
  };

  useLayoutEffect(() => {
    adjust();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(adjust);
    }
  }, [text]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      adjust();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [text]);

  return { containerRef, textRef, isScrollable };
}

function PolaroidCardBack({ backText }: PolaroidCardBackProps) {
  const { containerRef, textRef, isScrollable } = useFitText(backText);

  return (
    <div
      className="polaroid-card-back absolute inset-0 bg-[#fff6f3] text-[#2e1a20] rounded-[4px] shadow-[0_12px_30px_rgba(0,0,0,0.45),0_0_24px_rgba(232,69,107,0.15)] flex flex-col overflow-hidden"
      style={{
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
        boxSizing: "border-box",
        padding: "5% 6%",
      }}
    >
      {/* Header row */}
      <div className="flex-none text-[11px] font-sans font-bold text-rose-500 tracking-wider flex items-center justify-between px-0.5 pt-0.5">
        <span>MEMORIES</span>
        <span>❤️</span>
      </div>

      {/* Message container (.polaroid-back-body) */}
      <div
        ref={containerRef}
        className="polaroid-back-body flex-1 min-h-0 flex flex-col my-1 px-1 overflow-hidden"
        style={{
          ...(isScrollable
            ? {
                overflowY: "auto",
                overscrollBehavior: "contain",
                maskImage: "linear-gradient(to bottom, black 85%, transparent)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 85%, transparent)",
              }
            : {}),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Inner text element (.polaroid-back-text) with margin: auto */}
        <div
          ref={textRef}
          className={`${caveat.className} polaroid-back-text my-auto w-full text-center text-[#5a2a35] select-text`}
          style={{ lineHeight: 1.25 }}
        >
          {backText}
        </div>
      </div>

      {/* Footer hint */}
      <div className="flex-none text-center text-[10px] font-sans text-rose-400 pt-1">
        Click again to flip back
      </div>
    </div>
  );
}

interface PolaroidWallProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
  cards?: PolaroidCardData[];
}

export default function PolaroidWall({
  scrollContainerRef,
  cards: propCards,
}: PolaroidWallProps) {
  const cards = propCards || INITIAL_POLAROID_CARDS;
  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [visibleIds, setVisibleIds] = useState<Record<string, boolean>>({});

  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Intersection Observer for scroll reveal using letter card's scroll container as root
  useEffect(() => {
    if (reducedMotion) {
      const all: Record<string, boolean> = {};
      cards.forEach((c) => (all[c.id] = true));
      setVisibleIds(all);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-polaroid-id");
            if (id) {
              setVisibleIds((prev) => ({ ...prev, [id]: true }));
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        root: scrollContainerRef?.current || null,
        threshold: 0.1,
      },
    );

    Object.values(cardRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [cards, reducedMotion, scrollContainerRef]);

  const toggleFlip = (id: string) => {
    setFlippedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="polaroid-wall-section my-6 space-y-6">
      {/* SECTION HEADER */}
      <div className="space-y-2 text-center sm:text-left px-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold tracking-wide uppercase shadow-sm">
          <Sparkles size={13} />
          <span>POLAROID WALL</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground">
          Casstelle through time
        </h2>
        <p className="text-xs sm:text-sm text-secondary-foreground">
          Hover to bring forward, click to flip.
        </p>
      </div>

      {/* CASCADING ZIGZAG GRID / STACK */}
      <div className="polaroid-wall-container relative max-w-lg mx-auto py-4 px-2">
        <div className="flex flex-col space-y-[-18px] sm:space-y-[-22px]">
          {cards.map((card, index) => {
            const isFlipped = !!flippedMap[card.id];
            const isHovered = hoveredId === card.id;
            const isVisible = !!visibleIds[card.id];

            // Alternating zigzag alignment
            const isLeft = index % 2 === 0;
            const alignClass = card.featured
              ? "mx-auto w-[78%]"
              : isLeft
                ? "mr-auto w-[62%] translate-x-[-12px] sm:translate-x-[-24px]"
                : "ml-auto w-[62%] translate-x-[12px] sm:translate-x-[24px]";

            const rotationDeg = card.rotation;
            const transformStyle = reducedMotion
              ? "none"
              : isHovered
                ? "rotate(0deg) scale(1.05)"
                : `rotate(${rotationDeg}deg) scale(1)`;

            const zIndexClass =
              isHovered || isFlipped ? "z-30" : `z-${10 + index}`;

            return (
              <div
                key={card.id}
                ref={(el) => {
                  cardRefs.current[card.id] = el;
                }}
                data-polaroid-id={card.id}
                className={`polaroid-wrapper relative cursor-pointer transition-all duration-500 ease-out ${alignClass} ${zIndexClass} ${
                  !isVisible && !reducedMotion
                    ? "opacity-0 translate-y-6"
                    : "opacity-100 translate-y-0"
                }`}
                style={{
                  transitionDelay: `${index * 60}ms`,
                }}
                onMouseEnter={() => setHoveredId(card.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => toggleFlip(card.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleFlip(card.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={isFlipped}
                aria-label={`Polaroid memory ${index + 1}`}
              >
                {/* Wrapper holding position + tilt + hover scale */}
                <div
                  className="polaroid-tilt-container transition-transform duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-primary/60 rounded-[6px]"
                  style={{
                    transform: transformStyle,
                    willChange: isHovered ? "transform" : "auto",
                  }}
                >
                  {/* Inner element holding 3D flip (NO overflow hidden here!) */}
                  <div
                    className="polaroid-flip-inner relative w-full transition-transform duration-600 ease-in-out"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped
                        ? "rotateY(180deg)"
                        : "rotateY(0deg)",
                      willChange: "transform",
                    }}
                  >
                    {/* ================= FRONT FACE ================= */}
                    <div
                      className="polaroid-card-front bg-[#fff6f3] text-[#2e1a20] p-2.5 pb-3.5 rounded-[4px] shadow-[0_12px_30px_rgba(0,0,0,0.45),0_0_24px_rgba(232,69,107,0.15)] flex flex-col items-center"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      {/* Photo area */}
                      <div className="w-full aspect-square bg-[#f5e8e4] rounded-[2px] overflow-hidden relative border border-[#e8d5d0]">
                        <img
                          src={card.src}
                          alt={`Memory ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLElement;
                            target.style.display = "none";
                          }}
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-rose-100/80 to-pink-200/80 text-rose-500 -z-10">
                          <Heart
                            size={28}
                            className="fill-rose-400 text-rose-500 animate-pulse"
                          />
                          <span className="text-[10px] font-sans font-bold mt-1 text-rose-700/70">
                            Memory #{index + 1}
                          </span>
                        </div>
                      </div>

                      {/* Caption strip */}
                      <div className="w-full pt-2.5 pb-1 px-1 flex items-center justify-center">
                        <span
                          className={`${caveat.className} w-full text-center text-xl sm:text-2xl font-bold text-[#5a2a35]`}
                        >
                          {card.caption}
                        </span>
                      </div>
                    </div>

                    {/* ================= BACK FACE ================= */}
                    <PolaroidCardBack backText={card.backText} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
