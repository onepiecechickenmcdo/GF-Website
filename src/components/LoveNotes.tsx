"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Send, Star, Calendar } from "lucide-react";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import LetterOverlay from "./LetterOverlay";

interface LoveNote {
  id: string;
  title?: string;
  content: string;
  sentAt: string;
  isSaved: boolean;
  sender?: string;
  senderName?: string;
  isSpecialLetter?: boolean;
}

export default function LoveNotes() {
  const { role } = useAuth();
  const [notes, setNotes] = useState<LoveNote[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [activeNote, setActiveNote] = useState<LoveNote | null>(null);
  const [activeTab, setActiveTab] = useState<"write" | "mailbox">("mailbox");
  const [showSpecialLetter, setShowSpecialLetter] = useState(false);
  const [isArchived, setIsArchived] = useState(false);

  // Fetch server-side archive status
  useEffect(() => {
    fetch("/api/letter-status", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setIsArchived(!!data.isArchived);
      })
      .catch((err) => {
        console.error("Failed to fetch letter status in LoveNotes", err);
      });
  }, []);

  useEffect(() => {
    // Order by createdAt descending — if this fails with index error, fall back to unordered
    const q = query(collection(db, "love_notes"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: LoveNote[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          title: data.title,
          content: data.content,
          sentAt: data.sentAt,
          isSaved: data.isSaved || false,
          sender: data.sender || "kei",
          senderName: data.senderName || (data.sender === "cass" ? "Cass" : "Kei"),
        });
      });
      setNotes(items);
    }, (error) => {
      console.error("Firestore love_notes error:", error);
      // Fallback: listen without ordering if index doesn't exist yet
      const fallbackQ = collection(db, "love_notes");
      onSnapshot(fallbackQ, (snapshot) => {
        const items: LoveNote[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            id: docSnap.id,
            title: data.title,
            content: data.content,
            sentAt: data.sentAt,
            isSaved: data.isSaved || false,
            sender: data.sender || "kei",
            senderName: data.senderName || (data.sender === "cass" ? "Cass" : "Kei"),
          });
        });
        setNotes(items);
      });
    });

    return () => unsubscribe();
  }, []);

  const sendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !role) return;

    const senderName = role === "kei" ? "Kei" : "Cass";
    const recipientRole = role === "kei" ? "cass" : "kei";
    const fallbackEmail = recipientRole === "kei" ? "elediakei@gmail.com" : "";

    const now = new Date();
    const sentAt = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    await addDoc(collection(db, "love_notes"), {
      title: title.trim() || null,
      content: content.trim(),
      sentAt,
      isSaved: false,
      sender: role,
      senderName,
      recipientRole,
      createdAt: now.toISOString(),
    });

    setTitle("");
    setContent("");
    setActiveTab("mailbox");

    try {
      const settingsSnap = await getDoc(doc(db, "notificationSettings", recipientRole));
      const targetEmail = (settingsSnap.exists() && settingsSnap.data().email) ? settingsSnap.data().email : fallbackEmail;

      if (targetEmail) {
        await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: targetEmail,
            role: recipientRole,
            sender: senderName,
            type: "love_note",
            noteTitle: title.trim() || null,
            noteContent: content.trim(),
          }),
        });
      }
    } catch (e) {
      console.error("Failed to send love note email notification", e);
    }
  };

  const toggleSave = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    await updateDoc(doc(db, "love_notes", id), { isSaved: !note.isSaved });
    if (activeNote?.id === id) {
      setActiveNote({ ...activeNote, isSaved: !activeNote.isSaved });
    }
  };

  const partnerName = role === "kei" ? "Cass" : "Kei";

  // Special Monthsary Letter entry for the mailbox (appears for Cass only when isArchived is true)
  const showSpecialEntry = role === "cass" && isArchived;
  const specialLetterNote: LoveNote | null = showSpecialEntry
    ? {
        id: "special-monthsary-letter",
        title: "💌 Our Monthsary Letter & Polaroid Wall",
        content: "Happy monthsary mahal! Click to open our special archived letter and cascading Polaroid wall through time...",
        sentAt: "Oct 14, 2026",
        isSaved: true,
        sender: "kei",
        senderName: "Kei",
        isSpecialLetter: true,
      }
    : null;

  const allNotes = specialLetterNote ? [specialLetterNote, ...notes] : notes;

  return (
    <div className="bg-card rounded-3xl p-6 shadow-sm border border-secondary space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
          <span>💌</span> Love Notes & Mailbox
        </h3>
        <div className="flex bg-secondary/40 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab("write")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "write"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-secondary-foreground hover:text-foreground"
            }`}
          >
            Write Note
          </button>
          <button
            onClick={() => setActiveTab("mailbox")}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === "mailbox"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-secondary-foreground hover:text-foreground"
            }`}
          >
            Mailbox ({allNotes.length})
          </button>
        </div>
      </div>

      {activeTab === "write" ? (
        <form onSubmit={sendNote} className="space-y-4 animate-in fade-in duration-200">
          <input
            type="text"
            placeholder={`Title for ${partnerName} (Optional)`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-secondary bg-background/50 focus:outline-none focus:border-primary text-sm transition-all"
          />
          <textarea
            placeholder={`Write a sweet note for ${partnerName}...`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-secondary bg-background/50 focus:outline-none focus:border-primary text-sm resize-none transition-all"
          />
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-xl font-medium shadow-md shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 text-sm active:scale-95"
          >
            Send Note to {partnerName} <Send size={14} />
          </button>
        </form>
      ) : (
        <div className="space-y-4 animate-in fade-in duration-200">
          {allNotes.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-3xl">📬</p>
              <p className="text-sm text-secondary-foreground">
                No love notes in your mailbox yet. Write one for {partnerName}!
              </p>
              <button
                onClick={() => setActiveTab("write")}
                className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-full font-semibold transition-all"
              >
                Write First Note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {allNotes.map((note) => {
                const isFromCass = note.sender === "cass" || note.senderName?.toLowerCase() === "cass";
                return (
                  <button
                    key={note.id}
                    onClick={() => {
                      if (note.isSpecialLetter) {
                        setShowSpecialLetter(true);
                      } else {
                        setActiveNote(note);
                      }
                    }}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all active:scale-95 shadow-sm relative ${
                      note.isSpecialLetter
                        ? "bg-rose-100/90 dark:bg-rose-950/60 border-2 border-rose-400 shadow-md shadow-rose-500/20 hover:border-rose-500 col-span-2"
                        : isFromCass
                        ? "bg-blue-50/90 dark:bg-blue-950/40 border-2 border-blue-400 dark:border-blue-500 shadow-md shadow-blue-500/15 hover:border-blue-500"
                        : note.isSaved
                        ? "bg-amber-50/40 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900"
                        : "bg-secondary/20 border-secondary/20 hover:bg-secondary/30"
                    }`}
                  >
                    <div className="space-y-1 w-full">
                      <div className="flex justify-between items-start">
                        <span className="text-lg">{note.isSpecialLetter ? "💖" : isFromCass ? "💙" : "✉️"}</span>
                        {note.isSaved && <Star size={12} className="fill-amber-400 text-amber-400" />}
                      </div>
                      <h5 className="font-semibold text-xs text-foreground truncate w-full flex items-center gap-1">
                        {note.title || `Note from ${note.senderName || "Love"}`}
                      </h5>
                      <p className="text-[11px] text-foreground/80 line-clamp-2 leading-tight font-serif italic">
                        "{note.content}"
                      </p>
                    </div>
                    <div className="flex justify-between items-center w-full text-[9px] text-secondary-foreground pt-1 border-t border-secondary/15">
                      <span className="flex items-center gap-1">
                        <Calendar size={8} /> {note.sentAt.split(",")[0]}
                      </span>
                      <span className={`font-semibold px-1.5 py-0.5 rounded text-[8px] uppercase flex items-center gap-1 ${
                        note.isSpecialLetter
                          ? "bg-rose-500 text-white font-bold tracking-wide shadow-xs"
                          : isFromCass
                          ? "bg-blue-500 text-white font-bold tracking-wide shadow-xs"
                          : "bg-background/50 text-secondary-foreground"
                      }`}>
                        {note.isSpecialLetter ? "Monthsary Letter ✨" : `From ${note.senderName || "Kei"}`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Special Letter Overlay in Archive Mode */}
      {showSpecialLetter && (
        <LetterOverlay
          mode="archive"
          profile={role || "kei"}
          onClose={() => setShowSpecialLetter(false)}
        />
      )}

      {activeNote && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          {(() => {
            const isFromCass = activeNote.sender === "cass" || activeNote.senderName?.toLowerCase() === "cass";
            return (
              <div className={`w-full max-w-sm rounded-3xl p-8 border-2 shadow-2xl relative space-y-6 animate-in fade-in zoom-in-95 duration-200 ${
                isFromCass
                  ? "bg-blue-50/95 dark:bg-[#0f172a] text-[#1e293b] dark:text-[#f1f5f9] border-blue-400 dark:border-blue-500 shadow-blue-500/20"
                  : "bg-[#fffdf6] dark:bg-[#1c1618] text-[#5c4033] dark:text-[#f3e5db] border-[#f5ebe0] dark:border-[#2e2428]"
              }`}>
                <button
                  onClick={() => setActiveNote(null)}
                  className="absolute top-4 right-4 text-xs font-semibold uppercase tracking-wider text-secondary-foreground hover:text-foreground"
                >
                  Close
                </button>
                <div className="space-y-4 font-serif text-center pt-2">
                  <span className="text-3xl block">{isFromCass ? "💙" : "💌"}</span>
                  <h4 className="text-xl font-bold tracking-tight border-b border-primary/20 pb-2 flex items-center justify-center gap-1.5">
                    {activeNote.title || `A Note from ${activeNote.senderName || "Love"}`}
                    {isFromCass && <span className="text-xs bg-blue-500 text-white font-sans font-bold px-2 py-0.5 rounded-full">Cass 💙</span>}
                  </h4>
                  <div className="text-base leading-relaxed whitespace-pre-line text-left font-medium min-h-24 max-h-60 overflow-y-auto pr-1">
                    {activeNote.content}
                    {activeNote.title === "A Letter For You" && (
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
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-secondary-foreground pt-4 border-t border-primary/10">
                  <span className="flex items-center gap-1 font-sans">
                    <Calendar size={12} /> {activeNote.sentAt} • From {activeNote.senderName || "Kei"}
                  </span>
                  <button
                    onClick={(e) => toggleSave(activeNote.id, e)}
                    className="flex items-center gap-1 bg-secondary px-3 py-1.5 rounded-full font-sans font-semibold text-[10px] text-foreground hover:bg-secondary/80"
                  >
                    <Star size={10} className={activeNote.isSaved ? "fill-amber-400 text-amber-400" : ""} />
                    {activeNote.isSaved ? "Saved" : "Save Note"}
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
