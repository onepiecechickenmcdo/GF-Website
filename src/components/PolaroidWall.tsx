"use client";

import React, { useState, useEffect, useRef } from "react";
import { Caveat } from "next/font/google";
import { Sparkles, Heart } from "lucide-react";

const caveat = Caveat({ subsets: ["latin"], weight: ["400", "700"] });

interface PolaroidCardData {
  id: string;
  src: string;
  caption: string;
  backText: string;
  rotation: number;
  featured?: boolean;
}

const INITIAL_CARDS: PolaroidCardData[] = [
  {
    id: "card-1",
    src: "/polaroids/photo-1.jpg",
    caption: "10/14",
    backText: "Where our forever began. Every moment with you is my absolute favorite adventure.",
    rotation: -3.5,
    featured: true,
  },
  {
    id: "card-2",
    src: "/polaroids/photo-2.jpg",
    caption: "",
    backText: "A quiet afternoon we will always cherish together.",
    rotation: 3.2,
  },
  {
    id: "card-3",
    src: "/polaroids/photo-3.jpg",
    caption: "",
    backText: "Laughing until our stomachs hurt in the middle of nowhere.",
    rotation: -4.0,
  },
  {
    id: "card-4",
    src: "/polaroids/photo-4.jpg",
    caption: "",
    backText: "My favorite place in the entire world is right beside you.",
    rotation: 3.8,
  },
  {
    id: "card-5",
    src: "/polaroids/photo-5.jpg",
    caption: "",
    backText: "Coffee dates, sweet pastries, and endless conversation.",
    rotation: -3.1,
  },
  {
    id: "card-6",
    src: "/polaroids/photo-6.jpg",
    caption: "",
    backText: "Watching the golden sunset paint the sky just for us.",
    rotation: 4.2,
  },
  {
    id: "card-7",
    src: "/polaroids/photo-7.jpg",
    caption: "",
    backText: "Hand in hand through every single season of life.",
    rotation: -3.6,
  },
  {
    id: "card-8",
    src: "/polaroids/photo-8.jpg",
    caption: "",
    backText: "Making sweet memories and building our dream future.",
    rotation: 3.5,
  },
];

export default function PolaroidWall() {
  const [cards, setCards] = useState<PolaroidCardData[]>(INITIAL_CARDS);
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

  // Intersection Observer for scroll reveal
  useEffect(() => {
    if (reducedMotion) {
      // Make all visible immediately if reduced motion
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
      { threshold: 0.15 }
    );

    Object.values(cardRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [cards, reducedMotion]);

  const toggleFlip = (id: string, e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      // If target was an editable field, don't flip
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }
    }
    setFlippedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCaptionChange = (id: string, newCaption: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, caption: newCaption } : c))
    );
  };

  const handleBackTextChange = (id: string, newBackText: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, backText: newBackText } : c))
    );
  };

  return (
    <section className="polaroid-section my-12 space-y-8">
      {/* SECTION HEADER */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary/15 text-primary text-xs font-bold tracking-wide uppercase shadow-sm">
          <Sparkles size={13} />
          <span>OUR POLAROID WALL</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
          Moments Along Our Path
        </h2>
        <p className="text-sm text-secondary-foreground">
          Hover to bring forward, click to flip, or type custom captions.
        </p>
      </div>

      {/* CASCADING ZIGZAG GRID / STACK */}
      <div className="polaroid-wall-container relative max-w-4xl mx-auto py-6 px-2 sm:px-6">
        <div className="flex flex-col space-y-[-24px] sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-x-12 sm:gap-y-8">
          {cards.map((card, index) => {
            const isFlipped = !!flippedMap[card.id];
            const isHovered = hoveredId === card.id;
            const isVisible = !!visibleIds[card.id];

            // Alternating zigzag alignment on mobile and desktop
            // Odd index -> left, Even index -> right
            const isLeft = index % 2 === 0;
            const alignClass = card.featured
              ? "mx-auto w-[82%]"
              : isLeft
              ? "mr-auto w-[68%] sm:w-[62%] sm:translate-x-[-20px]"
              : "ml-auto w-[68%] sm:w-[62%] sm:translate-x-[20px]";

            const rotationDeg = card.rotation;
            const transformStyle = reducedMotion
              ? "none"
              : isHovered
              ? "rotate(0deg) scale(1.05)"
              : `rotate(${rotationDeg}deg) scale(1)`;

            const zIndexClass = isHovered || isFlipped ? "z-30" : `z-${10 + index}`;

            return (
              <div
                key={card.id}
                ref={(el) => {
                  cardRefs.current[card.id] = el;
                }}
                data-polaroid-id={card.id}
                className={`polaroid-wrapper relative cursor-pointer transition-all duration-500 ease-out ${alignClass} ${zIndexClass} ${
                  !isVisible && !reducedMotion ? "opacity-0 translate-y-6" : "opacity-100 translate-y-0"
                }`}
                style={{
                  transitionDelay: `${index * 60}ms`,
                  marginTop: index === 0 ? "0px" : "-20px",
                }}
                onMouseEnter={() => setHoveredId(card.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => toggleFlip(card.id, e)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleFlip(card.id, e);
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
                  {/* Inner element holding 3D flip */}
                  <div
                    className="polaroid-flip-inner relative w-full transition-transform duration-600 ease-in-out"
                    style={{
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                      willChange: "transform",
                    }}
                  >
                    {/* ================= FRONT FACE ================= */}
                    <div
                      className="polaroid-card-front bg-[#fff6f3] text-[#2e1a20] p-3 pb-4 rounded-[4px] shadow-[0_12px_30px_rgba(0,0,0,0.45),0_0_24px_rgba(232,69,107,0.15)] flex flex-col items-center"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      {/* Photo area */}
                      <div className="w-full aspect-square bg-[#f5e8e4] rounded-[2px] overflow-hidden relative border border-[#e8d5d0]">
                        <img
                          src={card.src}
                          alt={`Memory ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback gradient with heart if image fails to load
                            const target = e.target as HTMLElement;
                            target.style.display = "none";
                          }}
                        />
                        {/* Fallback visual if image missing */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-rose-100/80 to-pink-200/80 text-rose-500 -z-10">
                          <Heart size={32} className="fill-rose-400 text-rose-500 animate-pulse" />
                          <span className="text-[10px] font-sans font-bold mt-1 text-rose-700/70">Memory #{index + 1}</span>
                        </div>
                      </div>

                      {/* Caption strip */}
                      <div className="w-full pt-3 pb-1 px-1 flex items-center justify-center">
                        <textarea
                          value={card.caption}
                          onChange={(e) => handleCaptionChange(card.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Write caption..."
                          rows={1}
                          className={`${caveat.className} w-full text-center text-xl sm:text-2xl font-bold text-[#5a2a35] bg-transparent border-b border-transparent hover:border-rose-300 focus:border-rose-400 focus:outline-none resize-none overflow-hidden`}
                        />
                      </div>
                    </div>

                    {/* ================= BACK FACE ================= */}
                    <div
                      className="polaroid-card-back absolute inset-0 bg-[#fff6f3] text-[#2e1a20] p-6 rounded-[4px] shadow-[0_12px_30px_rgba(0,0,0,0.45),0_0_24px_rgba(232,69,107,0.15)] flex flex-col justify-between"
                      style={{
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                      }}
                    >
                      <div className="text-xs font-sans font-bold text-rose-500 tracking-wider flex items-center justify-between">
                        <span>MEMORIES</span>
                        <span>❤️</span>
                      </div>
                      <div className="my-auto py-2">
                        <textarea
                          value={card.backText}
                          onChange={(e) => handleBackTextChange(card.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Write memory story..."
                          rows={4}
                          className={`${caveat.className} w-full text-center text-xl sm:text-2xl text-[#5a2a35] bg-transparent border border-dashed border-rose-200 hover:border-rose-400 focus:border-rose-500 focus:outline-none rounded-lg p-2 resize-none leading-relaxed`}
                        />
                      </div>
                      <div className="text-center text-[10px] font-sans text-rose-400">
                        Click again to flip back
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
