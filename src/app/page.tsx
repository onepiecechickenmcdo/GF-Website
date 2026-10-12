"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Login from "../components/Login";
import MonthsaryCountdown from "../components/MonthsaryCountdown";
import DailyMoodCheck from "../components/DailyMoodCheck";
import NotificationSettings from "../components/NotificationSettings";
import Interactions from "../components/Interactions";
import LoveNotes from "../components/LoveNotes";
import SharedBucketList from "../components/SharedBucketList";
import WeeklyCheckInForm from "../components/WeeklyCheckInForm";
import ApologyLetter from "../components/ApologyLetter";
import { Heart, Star, Calendar, MessageSquare, ShieldAlert } from "lucide-react";

import { db } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

interface CheckIn {
  rating: number;
  summary: string;
  appreciation: string;
  badMoves: string;
  memoryImage?: string;
  memoryCaption?: string;
  journal: string;
  submittedAt?: string;
  author?: string;
  authorName?: string;
}

export default function Home() {
  const { role, loading, switchProfile } = useAuth();
  const [partnerCheckIn, setPartnerCheckIn] = useState<CheckIn | null>(null);
  const [myCheckIn, setMyCheckIn] = useState<CheckIn | null>(null);
  const [activeTab, setActiveTab] = useState<"partner" | "write">("partner");

  const partnerRole = role === "kei" ? "cass" : "kei";
  const partnerName = role === "kei" ? "Cass" : "Kei";

  useEffect(() => {
    if (!role) return;

    // Listen to Firestore checkins collection
    const q = query(collection(db, "checkins"), orderBy("createdAt", "desc"));

    const processSnapshot = (snapshot: any) => {
      if (!snapshot.empty) {
        type ExtendedCheckIn = CheckIn & { createdAt?: string; author?: string };
        const docs = snapshot.docs.map((docSnap: any) => docSnap.data() as ExtendedCheckIn);
        docs.sort((a: ExtendedCheckIn, b: ExtendedCheckIn) => (b.createdAt || "").localeCompare(a.createdAt || ""));

        // Partner's latest check-in
        const partnerDoc = docs.find((item: ExtendedCheckIn) => item.author === partnerRole || (!item.author && partnerRole === "cass"));
        setPartnerCheckIn(partnerDoc || null);

        // My latest check-in
        const myDoc = docs.find((item: ExtendedCheckIn) => item.author === role);
        setMyCheckIn(myDoc || null);
      } else {
        setPartnerCheckIn(null);
        setMyCheckIn(null);
      }
    };

    const unsubscribe = onSnapshot(
      q,
      processSnapshot,
      (error) => {
        console.error("Firestore checkins error, using unordered fallback:", error);
        onSnapshot(collection(db, "checkins"), processSnapshot);
      }
    );

    return () => unsubscribe();
  }, [role, partnerRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-secondary-foreground font-semibold">Loading our space...</p>
        </div>
      </div>
    );
  }

  if (!role) {
    return <Login />;
  }

  const isPartnerCass = partnerRole === "cass";
  const themeBorder = isPartnerCass ? "border-blue-500/80 shadow-blue-500/15" : "border-rose-400/80 shadow-rose-400/15";
  const themeBg = isPartnerCass ? "bg-blue-50/70 dark:bg-blue-950/40 border-l-blue-500 border-blue-200 dark:border-blue-800/60" : "bg-rose-50/70 dark:bg-rose-950/40 border-l-rose-400 border-rose-200 dark:border-rose-800/60";
  const themeBadge = isPartnerCass ? "bg-blue-500 text-white" : "bg-rose-500 text-white";
  const themeText = isPartnerCass ? "text-blue-500" : "text-rose-500";
  const partnerBadge = isPartnerCass ? "Cass 💙" : "Kei 💖";

  return (
    <div className="min-h-screen pb-16 bg-background text-foreground transition-colors duration-300">
      {role === "cass" && <ApologyLetter />}
      {/* Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-secondary/35 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/40 shadow-sm">
            <img src={`/images/${role}_profile.jpg`} alt={role} className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-base font-bold flex items-center gap-1.5 capitalize">
              Hi, {role} <Heart size={14} className="fill-primary text-primary" />
            </h1>
            <p className="text-[10px] text-secondary-foreground">Our private journal</p>
          </div>
        </div>
        <button
          onClick={switchProfile}
          className="text-[10px] bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-95"
        >
          Switch Profile
        </button>
      </header>

      {/* Main Responsive Grid Layout */}
      <main className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Monthsary & Actions */}
        <div className="space-y-6">
          <MonthsaryCountdown />
          <Interactions />
          <DailyMoodCheck />
          <NotificationSettings />
        </div>

        {/* MIDDLE COLUMN: Shared Weekly Check-In Dashboard & Bucket List */}
        <div className="space-y-6 md:col-span-2">
          
          {/* Check-In Header Tabs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-card p-2 rounded-2xl border border-secondary shadow-xs">
              <span className="text-sm font-bold text-foreground flex items-center gap-2 pl-2">
                <span>📖</span> Weekly Check-Ins
              </span>
              <div className="flex gap-1.5 bg-secondary/40 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("partner")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                    activeTab === "partner"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-secondary-foreground hover:text-foreground"
                  }`}
                >
                  <span>{partnerName}'s Report</span>
                  {partnerCheckIn && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                </button>
                <button
                  onClick={() => setActiveTab("write")}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === "write"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-secondary-foreground hover:text-foreground"
                  }`}
                >
                  Submit My Check-In
                </button>
              </div>
            </div>

            {/* TAB CONTENT: Partner's Report */}
            {activeTab === "partner" ? (
              <div className={`bg-card rounded-3xl p-6 shadow-md transition-all space-y-6 ${
                partnerCheckIn ? `border-2 ${themeBorder}` : "border border-secondary"
              }`}>
                <div className="flex items-center justify-between pb-3 border-b border-secondary">
                  <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
                    <span>📖</span> {partnerName}'s Weekly Reflection
                  </h3>
                  {partnerCheckIn ? (
                    <span className={`text-xs ${themeBadge} px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm`}>
                      Submitted by {partnerBadge} ({partnerCheckIn.submittedAt})
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full font-semibold animate-pulse">
                      Awaiting {partnerName}
                    </span>
                  )}
                </div>

                {!partnerCheckIn ? (
                  <div className="text-center py-12 space-y-4">
                    <span className="text-4xl block">⏳</span>
                    <h4 className="font-bold text-foreground">Nothing here yet</h4>
                    <p className="text-sm text-secondary-foreground max-w-xs mx-auto">
                      {partnerName} hasn't submitted a check-in for this week yet. It will appear here as soon as {partnerName} submits it!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Rating display */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-secondary/30 rounded-2xl border border-primary/20 shadow-sm">
                      <div className="space-y-0.5">
                        <span className={`text-xs ${themeText} font-bold flex items-center gap-1`}>
                          Rating From {partnerBadge}
                        </span>
                        <p className="text-sm font-medium text-foreground">Rating of your presence, affection & efforts</p>
                      </div>
                      <div className="flex items-center gap-1 bg-primary text-primary-foreground font-extrabold text-2xl px-4 py-2 rounded-2xl shadow-md">
                        <span>{partnerCheckIn.rating}</span>
                        <Star size={16} className="fill-primary-foreground" />
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <MessageSquare size={15} className={themeText} />
                        Our Week in {partnerName}'s Words
                      </h4>
                      <p className={`text-sm text-foreground/90 p-4 rounded-2xl border-l-4 ${themeBg} leading-relaxed shadow-xs`}>
                        {partnerCheckIn.summary}
                      </p>
                    </div>

                    {/* Appreciation */}
                    {partnerCheckIn.appreciation && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                          <Heart size={15} className={`fill-current ${themeText}`} />
                          What You Did to Make {partnerName} Feel Appreciated
                        </h4>
                        <p className={`text-sm text-foreground/90 p-4 rounded-2xl border-l-4 ${themeBg} leading-relaxed shadow-xs`}>
                          {partnerCheckIn.appreciation}
                        </p>
                      </div>
                    )}

                    {/* Bad Moves */}
                    {partnerCheckIn.badMoves && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                          <ShieldAlert size={15} className={themeText} />
                          What You Did That Hurt {partnerName} (Bad Moves)
                        </h4>
                        <p className={`text-sm text-foreground/90 p-4 rounded-2xl border-l-4 ${themeBg} leading-relaxed shadow-xs`}>
                          {partnerCheckIn.badMoves}
                        </p>
                      </div>
                    )}

                    {/* Memory of the Week */}
                    {partnerCheckIn.memoryImage && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                          <span>📷</span> Memory Chosen by {partnerName}
                        </h4>
                        <div className="rounded-2xl overflow-hidden border border-secondary shadow-md">
                          <img src={partnerCheckIn.memoryImage} alt="Memory" className="w-full max-h-72 object-cover" />
                          {partnerCheckIn.memoryCaption && (
                            <div className="p-3 bg-secondary/30 border-t border-secondary text-xs text-foreground/95 italic">
                              "{partnerCheckIn.memoryCaption}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Journal / Notes */}
                    {partnerCheckIn.journal && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                          <span>📝</span> {partnerName}'s Personal Journal / Notes
                        </h4>
                        <p className={`text-sm text-foreground/90 p-4 rounded-2xl border-l-4 ${themeBg} whitespace-pre-line italic leading-relaxed font-serif shadow-xs`}>
                          "{partnerCheckIn.journal}"
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* TAB CONTENT: Write Check-In */
              <WeeklyCheckInForm />
            )}
          </div>

          <SharedBucketList />
          <LoveNotes />
        </div>

      </main>
    </div>
  );
}
