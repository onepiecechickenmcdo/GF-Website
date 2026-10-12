"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Star, Image, FileText, Heart, CheckCircle2 } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, limit, getDoc, doc } from "firebase/firestore";

interface CheckIn {
  rating: number;
  summary: string;
  appreciation: string;
  badMoves: string;
  memoryImage?: string;
  memoryCaption?: string;
  journal: string;
  submittedAt?: string;
}

export default function WeeklyCheckInForm() {
  const { role } = useAuth();
  const [rating, setRating] = useState(10);
  const [summary, setSummary] = useState("");
  const [appreciation, setAppreciation] = useState("");
  const [badMoves, setBadMoves] = useState("");
  const [journal, setJournal] = useState("");
  const [memoryImage, setMemoryImage] = useState<string | null>(null);
  const [memoryCaption, setMemoryCaption] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const partnerName = role === "kei" ? "Cass" : "Kei";
  const userDisplayName = role === "kei" ? "Kei" : "Cass";

  // Check if already submitted this week (from Firestore for current role)
  useEffect(() => {
    if (!role) return;
    const q = query(collection(db, "checkins"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userDoc = snapshot.docs.find((d) => d.data().author === role);
      if (userDoc) {
        const data = userDoc.data();
        const submittedAt = new Date(data.createdAt);
        const now = new Date();
        const daysDiff = (now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff < 7) {
          setIsSubmitted(true);
        }
      }
    });
    return () => unsubscribe();
  }, [role]);

  // Load draft from localStorage for in-progress forms
  useEffect(() => {
    if (!role) return;
    const draftKey = `checkin_draft_${role}`;
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      const parsed = JSON.parse(draft) as CheckIn;
      setRating(parsed.rating ?? 10);
      setSummary(parsed.summary || "");
      setAppreciation(parsed.appreciation || "");
      setBadMoves(parsed.badMoves || "");
      setJournal(parsed.journal || "");
      setMemoryImage(parsed.memoryImage || null);
      setMemoryCaption(parsed.memoryCaption || "");
    }
  }, [role]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setMemoryImage(reader.result as string);
        saveDraft({ memoryImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveDraft = (updatedFields: Partial<CheckIn>) => {
    if (!role) return;
    const currentDraft: CheckIn = {
      rating, summary, appreciation, badMoves, journal,
      memoryImage: memoryImage || undefined,
      memoryCaption,
      ...updatedFields,
    };
    localStorage.setItem(`checkin_draft_${role}`, JSON.stringify(currentDraft));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    const recipientRole = role === "kei" ? "cass" : "kei";
    const fallbackEmail = recipientRole === "kei" ? "elediakei@gmail.com" : "";

    const now = new Date();
    const checkInData = {
      author: role,
      authorName: userDisplayName,
      targetRole: recipientRole,
      rating,
      summary,
      appreciation,
      badMoves,
      journal,
      memoryImage: memoryImage || null,
      memoryCaption,
      submittedAt: now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      createdAt: now.toISOString(),
    };

    await addDoc(collection(db, "checkins"), checkInData);
    localStorage.removeItem(`checkin_draft_${role}`);
    setIsSubmitted(true);

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
            sender: userDisplayName,
            type: "checkin_submitted",
          }),
        });
      }
    } catch (e) {
      console.error("Failed to send checkin notification", e);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-card rounded-3xl p-8 shadow-sm border border-secondary text-center space-y-4">
        <div className="flex justify-center text-emerald-500">
          <CheckCircle2 size={56} className="animate-bounce" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Check-In Submitted!</h3>
        <p className="text-sm text-secondary-foreground">
          Thank you, {userDisplayName}! {partnerName} can now view your ratings and thoughts for this week on their dashboard.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="text-xs text-primary font-semibold hover:underline"
        >
          Create New Check-In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-6 shadow-sm border border-secondary space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-secondary">
        <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
          <span>📝</span> Weekly Check-In
        </h3>
        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
          Drafting
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Star size={16} className="fill-amber-400 text-amber-400" />
          How did {partnerName} do this week?
        </label>
        <p className="text-xs text-secondary-foreground">Rate {partnerName}'s presence, affection, and efforts (1-10).</p>
        <div className="flex justify-between items-center gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              type="button"
              key={num}
              onClick={() => { setRating(num); saveDraft({ rating: num }); }}
              className={`w-8 h-8 rounded-full text-xs font-bold transition-all active:scale-95 ${
                rating === num
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-110"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <FileText size={16} className="text-primary" />
          Our Week in Your Words
        </label>
        <textarea
          placeholder="Summarize our relationship and general vibe this week..."
          value={summary}
          onChange={(e) => { setSummary(e.target.value); saveDraft({ summary: e.target.value }); }}
          rows={3}
          required
          className="w-full px-4 py-2.5 rounded-xl border border-secondary bg-background/50 focus:outline-none focus:border-primary text-sm resize-none transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Heart size={16} className="fill-rose-400 text-rose-400" />
          What did {partnerName} do to make you feel appreciated?
        </label>
        <textarea
          placeholder={`Any sweet gestures, helpful acts, or words from ${partnerName} that made you smile...`}
          value={appreciation}
          onChange={(e) => { setAppreciation(e.target.value); saveDraft({ appreciation: e.target.value }); }}
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-secondary bg-background/50 focus:outline-none focus:border-primary text-sm resize-none transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <span>💭</span> What did {partnerName} do that hurt you? (Bad moves)
        </label>
        <textarea
          placeholder={`Anything ${partnerName} said or did that made you feel sad, neglected, or upset...`}
          value={badMoves}
          onChange={(e) => { setBadMoves(e.target.value); saveDraft({ badMoves: e.target.value }); }}
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl border border-secondary bg-background/50 focus:outline-none focus:border-primary text-sm resize-none transition-all"
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <Image size={16} className="text-primary" />
          Memory of the Week (Optional)
        </label>
        <div className="flex items-center gap-4">
          <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-secondary hover:border-primary rounded-2xl cursor-pointer bg-secondary/10 transition-all">
            <span className="text-2xl mb-1">📷</span>
            <span className="text-xs text-secondary-foreground font-semibold">Upload Photo</span>
            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
          </label>
          {memoryImage ? (
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-secondary shadow-sm relative group">
              <img src={memoryImage} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => { setMemoryImage(null); saveDraft({ memoryImage: undefined }); }}
                className="absolute inset-0 bg-black/50 text-white font-bold opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-xs"
              >
                Delete
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl bg-secondary/20 border border-secondary/15 flex items-center justify-center text-[10px] text-secondary-foreground text-center p-1">
              No photo selected
            </div>
          )}
        </div>
        <input
          type="text"
          placeholder="Optional Caption for the memory"
          value={memoryCaption}
          onChange={(e) => { setMemoryCaption(e.target.value); saveDraft({ memoryCaption: e.target.value }); }}
          className="w-full px-4 py-2 rounded-xl border border-secondary bg-background/50 focus:outline-none focus:border-primary text-sm transition-all"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
          <FileText size={16} className="text-primary" />
          Journal Entry / Personal Notes
        </label>
        <textarea
          placeholder="Write down any extra thoughts, diary entries, or private letters..."
          value={journal}
          onChange={(e) => { setJournal(e.target.value); saveDraft({ journal: e.target.value }); }}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border border-secondary bg-background/50 focus:outline-none focus:border-primary text-sm resize-none transition-all"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold shadow-md shadow-primary/30 hover:bg-primary/95 transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        Submit Weekly Check-In <Heart size={18} className="fill-primary-foreground" />
      </button>
    </form>
  );
}
