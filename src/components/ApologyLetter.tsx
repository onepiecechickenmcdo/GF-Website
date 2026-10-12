"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

export default function ApologyLetter() {
  const [step, setStep] = useState<"notification" | "open" | "closed" | "loading">("loading");
  const [isClient, setIsClient] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const q = query(
          collection(db, "love_notes"),
          where("title", "==", "A Letter For You")
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setStep("closed");
          setIsSaved(true);
        } else {
          setStep("notification");
        }
      } catch (e) {
        console.error("Failed to check if letter was already read:", e);
        setStep("notification");
      } finally {
        setIsClient(true);
      }
    };
    
    checkStatus();
  }, []);

  const handleClose = async () => {
    setStep("closed");
    if (isSaved) return;

    try {
      // Check if it's already saved to prevent duplicates on page refresh
      const q = query(
        collection(db, "love_notes"),
        where("title", "==", "A Letter For You")
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        const now = new Date();
        const sentAt = now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        await addDoc(collection(db, "love_notes"), {
          title: "A Letter For You",
          content: "dear cass,\n\ni'm sorry. these past few days, mahal, i feel like i haven't been showing up for you. i'm going to be honest, mahal, i have been dealing with problems with myself lately. it's something very deeply rooted within me; hindi naman malala yung nangyari, pero malala yung effect sa akin. it's been eating so much of me, hence why hindi kita nakakamusta and nakakausap nang maayos, and why it also took me a long time to do something for you.\n\ngloomy ikaw, mahal, and you're pulling away; nag-start ito nung galing tayo smb the other day. ngayon pa lang, i'm so sorry, baby, for being so clueless about what happened. it happened so fast sa akin na hindi ko namalayan kung anong nangyari and what led you to pull away. with all my heart, baby, i'm so sorry for whatever it is that i did or did not do, and i also apologize for the hurt it caused you.\n\nsa tuwing ganito, mahal, solusyon ko lang talaga ay to show up for you hanggang sa magkaroon tayo ng space to talk about it. pero that's exactly what i've been unable to do—i haven't been showing up for you. hindi ko nagagampanan ang pagiging girlfriend ko sa'yo nang maayos, at natatakot ako na baka nilalagay ulit kita sa sitwasyong pinaramdam ko sa'yo na buhat mo lahat.\n\npero nandito na ako, mahal, showing up for you again. it took me a long time, but im here now baby. may this letter be an evidence of my commitment to changing and being a better partner for you. i hope it won't be too much for you to accept the flowers and my apology.\n\nmahal na mahal kita, cassandra.",
          sentAt,
          isSaved: true,
          sender: "kei",
          senderName: "Kei",
          recipientRole: "cass",
          createdAt: now.toISOString(),
        });
      }
      setIsSaved(true);
    } catch (e) {
      console.error("Failed to save letter to love notes:", e);
    }
  };

  if (!isClient) return null;

  return (
    <>
      {/* 1. INITIAL NOTIFICATION POPUP */}
      {step === "notification" && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-3xl p-8 bg-card border border-secondary shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center justify-center space-y-6 text-center">

            <div className="relative cursor-pointer group" onClick={() => setStep("open")}>
              {/* Mail Icon */}
              <div className="bg-primary/10 text-primary p-6 rounded-full group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-105">
                <svg className="w-16 h-16 fill-current" viewBox="0 0 24 24">
                  <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" />
                </svg>
              </div>
              {/* Red Dot Unread Indicator */}
              <div className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full border-4 border-card shadow-sm animate-bounce" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">You received a mail!</h2>
            </div>

            <button
              onClick={() => setStep("open")}
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-md"
            >
              Open Mail
            </button>
          </div>
        </div>
      )}

      {/* 2. THE LOVE NOTE MODAL */}
      {step === "open" && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-3xl p-8 border-2 shadow-2xl relative space-y-6 animate-in fade-in zoom-in-95 duration-200 bg-[#fffdf6] dark:bg-[#1c1618] text-[#5c4033] dark:text-[#f3e5db] border-[#f5ebe0] dark:border-[#2e2428] max-h-[90vh] flex flex-col">

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-xs font-semibold uppercase tracking-wider text-secondary-foreground hover:text-foreground"
            >
              Close
            </button>

            <div className="space-y-4 font-serif text-center pt-2 flex-1 overflow-y-auto pr-2 custom-scrollbar">

              {/* No top image */}

              <h4 className="text-xl font-bold tracking-tight border-b border-primary/20 pb-4 flex items-center justify-center gap-1.5">
                A Letter For You
              </h4>

              <div className="text-base leading-relaxed text-left font-medium pb-4">
                <p className="mb-4">dear cass,</p>

                <p className="mb-4">i'm sorry. these past few days, mahal, i feel like i haven't been showing up for you. i'm going to be honest, mahal, i have been dealing with problems with myself lately. it's something very deeply rooted within me; hindi naman malala yung nangyari, pero malala yung effect sa akin. it's been eating so much of me, hence why hindi kita nakakamusta and nakakausap nang maayos, and why it also took me a long time to do something for you.</p>

                <p className="mb-4">gloomy ikaw, mahal, and you're pulling away; nag-start ito nung galing tayo smb the other day. ngayon pa lang, i'm so sorry, baby, for being so clueless about what happened. it happened so fast sa akin na hindi ko namalayan kung anong nangyari and what led you to pull away. with all my heart, baby, i'm so sorry for whatever it is that i did or did not do, and i also apologize for the hurt it caused you.</p>

                <p className="mb-4">sa tuwing ganito, mahal, solusyon ko lang talaga ay to show up for you hanggang sa magkaroon tayo ng space to talk about it. pero that's exactly what i've been unable to do—i haven't been showing up for you. hindi ko nagagampanan ang pagiging girlfriend ko sa'yo nang maayos, at natatakot ako na baka nilalagay ulit kita sa sitwasyong pinaramdam ko sa'yo na buhat mo lahat.</p>

                <p className="mb-4">pero nandito na ako, mahal, showing up for you again. it took me a long time, but im here now baby. may this letter be an evidence of my commitment to changing and being a better partner for you. i hope it won't be too much for you to accept the flowers and my apology.</p>

                <p className="mt-8 italic font-semibold">mahal na mahal kita, cassandra.</p>

                <div className="flex justify-center mt-6 mb-2">
                  <img
                    src="/images/new_sticker.png"
                    alt="Sticker"
                    className="w-64 h-64 object-contain hover:scale-105 transition-transform"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/images/new_sticker.jpg";
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-secondary-foreground pt-4 border-t border-primary/10 shrink-0">
              <span className="flex items-center gap-1 font-sans">
                <Calendar size={12} /> Just now • From Kei
              </span>
            </div>

          </div>
        </div>
      )}

      {/* Floating envelope removed as it is now saved to Love Notes */}

      {/* Simple inline style to hide scrollbar but allow scrolling in the letter */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(92, 64, 51, 0.2);
          border-radius: 4px;
        }
      `}} />
    </>
  );
}
