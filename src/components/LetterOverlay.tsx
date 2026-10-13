"use client";

import React, { useState, useEffect, useRef } from "react";
import PolaroidWall, { PolaroidCardData } from "./PolaroidWall";
import { LETTER_CONTENT, INITIAL_POLAROID_CARDS } from "../lib/config";

export type Profile = "cass" | "kei";

interface LetterOverlayProps {
  profile?: Profile;
  mode?: "popup" | "archive";
  title?: string;
  letterContent?: {
    greeting: string;
    paragraphs: string[];
    signoff: string;
  };
  cards?: PolaroidCardData[];
  onClose?: () => void;
}

export default function LetterOverlay({
  profile,
  mode = "popup",
  title = LETTER_CONTENT.title,
  letterContent = LETTER_CONTENT,
  cards = INITIAL_POLAROID_CARDS,
  onClose,
}: LetterOverlayProps) {
  const [shouldShow, setShouldShow] = useState<boolean>(mode === "archive");
  const [loadingStatus, setLoadingStatus] = useState<boolean>(mode === "popup");

  // Fetch server-side status flags on mount
  useEffect(() => {
    if (mode === "archive") {
      setShouldShow(true);
      setLoadingStatus(false);
      return;
    }

    fetch("/api/letter-status", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setShouldShow(!!data.isActive);
        setLoadingStatus(false);
      })
      .catch((err) => {
        console.error("Failed to fetch letter status", err);
        setShouldShow(false);
        setLoadingStatus(false);
      });
  }, [mode]);

  const [animationState, setAnimationState] = useState<
    "idle" | "opening" | "fading" | "letter" | "closing"
  >("idle");
  const [isVisible, setIsVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  // Lock body scroll when overlay is active and clean up on unmount
  useEffect(() => {
    if (isVisible && shouldShow) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isVisible, shouldShow]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isVisible]);

  const handleOpenEnvelope = () => {
    if (animationState !== "idle") return;
    if (reducedMotion) {
      setAnimationState("letter");
      return;
    }

    setAnimationState("opening");
  };

  const handleKeyDownEnvelope = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      handleOpenEnvelope();
    }
  };

  const handleClose = () => {
    setAnimationState("closing");
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 400); // match backdrop fade-out duration
  };

  if (loadingStatus || !isVisible || !shouldShow) return null;

  const showEnvelope =
    animationState === "idle" ||
    animationState === "opening" ||
    animationState === "fading";
  const showLetter =
    animationState === "letter" || animationState === "closing";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Love letter overlay"
      className={`letter-overlay-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-[rgba(28,20,22,0.85)] transition-opacity duration-400 ${
        animationState === "closing" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* ENVELOPE VIEW */}
      {showEnvelope && (
        <div
          className={`letter-wrapper flex flex-col items-center overflow-visible pt-16 pb-8 ${
            animationState === "opening"
              ? "letter-envelope-anim-active"
              : animationState === "fading"
                ? "letter-envelope-fade-out"
                : ""
          }`}
          onAnimationEnd={(e) => {
            if (e.animationName.includes("envelopeFadeOut")) {
              setAnimationState("letter");
            }
          }}
        >
          {/* Outer container with radial glow */}
          <div
            className={`letter-envelope-box relative cursor-pointer group select-none focus:outline-none focus:ring-2 focus:ring-[#e8456b]/50 rounded-[16px] ${
              animationState === "idle" ? "letter-float" : ""
            }`}
            style={{
              width: "320px",
              height: "230px",
              background: "transparent",
              overflow: "visible",
              willChange: "transform, opacity",
            }}
          >
            {/* Radial soft rose glow behind envelope */}
            <div
              className="absolute pointer-events-none"
              style={{
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "420px",
                height: "320px",
                background:
                  "radial-gradient(circle, rgba(232, 69, 107, 0.22) 0%, rgba(232, 69, 107, 0) 70%)",
                borderRadius: "50%",
                zIndex: 0,
              }}
            />

            {/* Perspective container for 3D flap */}
            <div
              className="absolute inset-0 rounded-[16px]"
              style={{
                perspective: "900px",
                overflow: "visible",
                background: "transparent",
                border: "none",
                outline: "none",
                boxShadow: "none",
              }}
            >
              {/* 1. BACK PANEL */}
              <div
                className="absolute inset-0 rounded-[16px] bg-[#3a1f27]"
                style={{ zIndex: 1, willChange: "opacity" }}
              />

              {/* 2. SIDE FLAPS */}
              {/* Left Side Flap */}
              <div
                className="absolute inset-y-0 left-0 bg-[#4a2631] rounded-l-[16px]"
                style={{
                  zIndex: 3,
                  width: "50%",
                  clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                }}
              />
              {/* Right Side Flap */}
              <div
                className="absolute inset-y-0 right-0 bg-[#4a2631] rounded-r-[16px]"
                style={{
                  zIndex: 3,
                  width: "50%",
                  clipPath: "polygon(100% 0, 0 50%, 100% 100%)",
                }}
              />

              {/* 3. BOTTOM FLAP */}
              <div
                className="absolute inset-x-0 bottom-0 bg-[#6a3342] rounded-b-[16px]"
                style={{
                  zIndex: 4,
                  height: "60%",
                  clipPath: "polygon(0 100%, 50% 25%, 100% 100%)",
                }}
              />

              {/* 4. TOP FLAP WRAPPER */}
              <div
                className={`letter-flap absolute inset-x-0 top-0 rounded-t-[16px] ${
                  animationState === "opening" || animationState === "fading"
                    ? "letter-flap-open"
                    : ""
                }`}
                style={{
                  zIndex: 5,
                  height: "70%",
                  transformOrigin: "top center",
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                  background: "transparent",
                  pointerEvents: "none",
                }}
                onAnimationEnd={() => {
                  if (animationState === "opening") {
                    setAnimationState("fading");
                  }
                }}
              >
                {/* Soft shadow duplicate triangle behind front face */}
                <div
                  className={`absolute inset-0 bg-[rgba(0,0,0,0.35)] transition-opacity duration-300 ${
                    animationState === "opening" || animationState === "fading"
                      ? "opacity-0"
                      : "opacity-100"
                  }`}
                  style={{
                    top: "3px",
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    backfaceVisibility: "hidden",
                    pointerEvents: "none",
                  }}
                />

                {/* Front Face */}
                <div
                  className="letter-flap-front absolute inset-0 bg-[#5a2a38] rounded-t-[16px]"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    backfaceVisibility: "hidden",
                    pointerEvents: "auto",
                  }}
                  onClick={handleOpenEnvelope}
                  role="button"
                  tabIndex={0}
                  aria-label="Open envelope"
                  onKeyDown={handleKeyDownEnvelope}
                />

                {/* Inside Face (rotateY 180deg) */}
                <div
                  className="letter-flap-inside absolute inset-0 bg-[#48212c] rounded-t-[16px]"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    pointerEvents: "auto",
                  }}
                  onClick={handleOpenEnvelope}
                  role="button"
                  tabIndex={0}
                  aria-label="Open envelope"
                  onKeyDown={handleKeyDownEnvelope}
                />
              </div>
            </div>
          </div>

          {/* Tap Hint */}
          <div
            className={`letter-hint mt-8 text-[#fff5f5]/80 font-sans text-sm tracking-wide bg-[#2e1a20]/90 px-5 py-2 rounded-full border border-[rgba(232,69,107,0.25)] shadow-lg transition-opacity duration-200 ${
              animationState !== "idle"
                ? "opacity-0 pointer-events-none"
                : "animate-pulse"
            }`}
          >
            Tap envelope to open ✨
          </div>
        </div>
      )}

      {/* LETTER CARD VIEW */}
      {showLetter && (
        <div
          className={`letter-card-wrapper relative w-full max-w-2xl max-h-[85vh] bg-[#2e1a20] border border-[rgba(232,69,107,0.25)] rounded-[24px] shadow-2xl shadow-[rgba(232,69,107,0.15)] flex flex-col overflow-hidden ${
            animationState === "letter"
              ? "letter-card-enter"
              : animationState === "closing"
                ? "opacity-0 scale-95 transition-all duration-300"
                : ""
          }`}
          style={{ willChange: "transform, opacity" }}
        >
          {/* Top Bar with Close '×' */}
          <div className="letter-header flex items-center justify-between px-6 pt-4 pb-2 border-b border-[rgba(232,69,107,0.1)]">
            <span className="text-xs font-sans font-bold text-[#e8456b] tracking-wider uppercase">
              {title}
            </span>
            <button
              onClick={handleClose}
              className="letter-close-btn w-9 h-9 rounded-full bg-[#362028] text-[#fff5f5]/80 hover:text-white hover:bg-[rgba(232,69,107,0.2)] flex items-center justify-center transition-colors text-xl font-sans"
              aria-label="Close letter"
            >
              ×
            </button>
          </div>

          {/* Scrollable Letter Content */}
          <div
            ref={scrollContainerRef}
            className="letter-body flex-1 overflow-y-auto px-6 sm:px-10 py-6 text-[#fff5f5] font-serif space-y-6 leading-relaxed text-base sm:text-lg"
          >
            {/* ================= POLAROID WALL INTEGRATION ================= */}
            <PolaroidWall scrollContainerRef={scrollContainerRef} cards={cards} />
            {/* ============================================================= */}

            {/* ================= LETTER CONTENT ================= */}
            <div className="letter-content space-y-4">
              <p>{letterContent.greeting}</p>

              {letterContent.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}

              <p className="pt-4 whitespace-pre-line">
                {letterContent.signoff}
              </p>
            </div>
            {/* ======================================================= */}

            {/* Bottom Heart Icon */}
            <div className="flex justify-center pt-4 pb-2">
              <span className="text-[#e8456b] text-xl animate-pulse">
                𓆝𓆟༝˚｡⋆𓆉︎⋆｡˚༝𓆞𓆝
              </span>
            </div>
          </div>

          {/* Footer with Rose-Pink Pill Button */}
          <div className="letter-footer px-6 py-4 bg-[#362028]/60 border-t border-[rgba(232,69,107,0.15)] flex justify-center">
            <button
              onClick={handleClose}
              className="letter-back-btn bg-[#e8456b] hover:bg-[#d6385d] text-white font-sans font-medium px-8 py-3 rounded-full shadow-lg shadow-[rgba(232,69,107,0.3)] transition-all transform hover:scale-105 active:scale-95"
            >
              Back to main page
            </button>
          </div>
        </div>
      )}

      {/* CSS Keyframes and Performance Rules */}
      <style jsx>{`
        .letter-float {
          animation: letterFloat 3.5s ease-in-out infinite;
        }
        @keyframes letterFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        .letter-envelope-anim-active {
          animation: envelopeRiseAndFade 750ms cubic-bezier(0.45, 0, 0.2, 1)
            forwards;
        }

        @keyframes envelopeRiseAndFade {
          0% {
            transform: translateY(0px) scale(1);
          }
          30% {
            transform: translateY(4px) scale(0.98);
          }
          100% {
            transform: translateY(-8px) scale(0.98);
          }
        }

        .letter-envelope-fade-out {
          animation: envelopeFadeOut 450ms cubic-bezier(0.22, 1, 0.36, 1)
            forwards;
        }

        @keyframes envelopeFadeOut {
          0% {
            opacity: 1;
            transform: translateY(-8px) scale(0.98);
          }
          100% {
            opacity: 0;
            transform: translateY(-16px) scale(0.95);
          }
        }

        .letter-flap-open {
          animation: flapOpen 750ms cubic-bezier(0.45, 0, 0.2, 1) forwards;
        }

        @keyframes flapOpen {
          0% {
            transform: rotateX(0deg);
          }
          100% {
            transform: rotateX(-180deg);
          }
        }

        .letter-card-enter {
          animation: cardEnter 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes cardEnter {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
