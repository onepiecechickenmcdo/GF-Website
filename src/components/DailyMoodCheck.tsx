"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Smile, Laugh, Meh, Frown, Angry } from "lucide-react";
import { db } from "../lib/firebase";
import { collection, doc, setDoc, onSnapshot, query, orderBy } from "firebase/firestore";

type MoodType = "Happy" | "Good" | "Okay" | "Sad" | "Upset";

const moodsConfig: { type: MoodType; label: string; icon: any; color: string; bg: string }[] = [
  { type: "Happy", label: "Happy", icon: Laugh, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-950/40" },
  { type: "Good", label: "Good", icon: Smile, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-950/40" },
  { type: "Okay", label: "Okay", icon: Meh, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-950/40" },
  { type: "Sad", label: "Sad", icon: Frown, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-950/40" },
  { type: "Upset", label: "Upset", icon: Angry, color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-950/40" },
];

export default function DailyMoodCheck() {
  const { role } = useAuth();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [myMoodHistory, setMyMoodHistory] = useState<{ date: string; mood: MoodType }[]>([]);
  const [partnerMoodHistory, setPartnerMoodHistory] = useState<{ date: string; mood: MoodType }[]>([]);

  const userDisplayName = role === "kei" ? "Kei" : "Cass";
  const partnerName = role === "kei" ? "Cass" : "Kei";
  const partnerRole = role === "kei" ? "cass" : "kei";

  useEffect(() => {
    if (!role) return;
    const todayStr = new Date().toISOString().split("T")[0];
    const q = query(collection(db, "mood_history"), orderBy("createdAt", "desc"));

    const processSnapshot = (snapshot: any) => {
      const myItems: { date: string; mood: MoodType }[] = [];
      const partnerItems: { date: string; mood: MoodType }[] = [];

      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        if (data.date && data.mood) {
          const item = { date: data.date, mood: data.mood as MoodType };
          // Check author field or fallback to doc ID prefix
          const author = data.author || (docSnap.id.startsWith("cass") ? "cass" : docSnap.id.startsWith("kei") ? "kei" : "cass");
          if (author === role) {
            myItems.push(item);
          } else {
            partnerItems.push(item);
          }
        }
      });

      myItems.sort((a, b) => b.date.localeCompare(a.date));
      partnerItems.sort((a, b) => b.date.localeCompare(a.date));

      setMyMoodHistory(myItems);
      setPartnerMoodHistory(partnerItems);

      const todaysMyEntry = myItems.find((item) => item.date === todayStr);
      if (todaysMyEntry) {
        setSelectedMood(todaysMyEntry.mood);
      }
    };

    const unsubscribe = onSnapshot(
      q,
      processSnapshot,
      (error) => {
        console.error("Firestore mood_history query error, using fallback:", error);
        onSnapshot(collection(db, "mood_history"), processSnapshot);
      }
    );

    return () => unsubscribe();
  }, [role]);

  const handleMoodSelect = async (mood: MoodType) => {
    if (!role) return;

    const todayStr = new Date().toISOString().split("T")[0];
    setSelectedMood(mood);

    const docId = `${role}_${todayStr}`;
    await setDoc(doc(db, "mood_history", docId), {
      author: role,
      date: todayStr,
      mood,
      createdAt: new Date().toISOString(),
    });
  };

  const getMoodIcon = (moodType: MoodType) => {
    const config = moodsConfig.find((m) => m.type === moodType);
    if (!config) return null;
    const Icon = config.icon;
    return <Icon className={config.color} size={22} />;
  };

  const isPartnerCass = partnerRole === "cass";
  const partnerBadge = isPartnerCass ? "Cass 💙" : "Kei 💖";
  const partnerBadgeClass = isPartnerCass
    ? "bg-blue-500 text-white"
    : "bg-rose-500 text-white";
  const partnerCardBg = isPartnerCass
    ? "bg-blue-50/70 dark:bg-blue-950/40 border-l-blue-500 border-blue-200 dark:border-blue-800"
    : "bg-rose-50/70 dark:bg-rose-950/40 border-l-rose-400 border-rose-200 dark:border-rose-800";

  return (
    <div className="bg-card rounded-3xl p-6 shadow-sm border border-secondary space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-foreground">Daily Mood Check</h3>
        <span className={`text-xs ${partnerBadgeClass} px-3 py-1 rounded-full font-bold flex items-center gap-1 shadow-sm`}>
          {partnerBadge}
        </span>
      </div>

      {/* Current User Mood Selector */}
      <div className="space-y-3 pb-4 border-b border-secondary">
        <p className="text-xs font-semibold text-secondary-foreground">
          How are you feeling today, {userDisplayName}?
        </p>
        <div className="grid grid-cols-5 gap-2">
          {moodsConfig.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedMood === item.type;
            return (
              <button
                key={item.type}
                onClick={() => handleMoodSelect(item.type)}
                className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all active:scale-95 ${
                  isSelected
                    ? `${item.bg} border-2 border-primary/40 shadow-sm`
                    : "hover:bg-secondary/40 border border-transparent"
                }`}
              >
                <Icon className={`${item.color} ${isSelected ? "scale-110" : ""}`} size={24} />
                <span className="text-[11px] font-medium text-foreground">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Partner's Mood Section */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-secondary-foreground uppercase tracking-wider">
          {partnerName}'s Recent Moods
        </h4>
        {partnerMoodHistory.length === 0 ? (
          <p className="text-xs text-secondary-foreground text-center py-3">
            {partnerName} hasn't recorded a mood today yet.
          </p>
        ) : (
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {partnerMoodHistory.slice(0, 5).map((item, idx) => {
              const dateObj = new Date(item.date);
              const isToday = item.date === new Date().toISOString().split("T")[0];
              const dateStr = isToday
                ? "Today"
                : dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3 rounded-2xl border-l-4 border ${partnerCardBg} shadow-xs`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{dateStr}</span>
                    {isToday && (
                      <span className={`text-[9px] ${partnerBadgeClass} font-bold px-1.5 py-0.5 rounded-full`}>
                        Latest
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-secondary-foreground font-medium">{item.mood}</span>
                    {getMoodIcon(item.mood)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
