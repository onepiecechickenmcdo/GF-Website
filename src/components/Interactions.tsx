"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Flame, Sparkles } from "lucide-react";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  getDoc,
  doc,
} from "firebase/firestore";

interface InteractionEvent {
  id: string;
  type: "hug" | "kiss";
  timestamp: string;
  sender: string;
}

export default function Interactions() {
  const { role } = useAuth();
  const [hugCount, setHugCount] = useState(0);
  const [kissCount, setKissCount] = useState(0);
  const [recentInteractions, setRecentInteractions] = useState<InteractionEvent[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const q = query(
      collection(db, "interactions"),
      orderBy("createdAt", "desc"),
      limit(10)
    );

    const processSnapshot = (snapshot: any) => {
      const items: InteractionEvent[] = [];
      let hugs = 0;
      let kisses = 0;

      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        if (data.type === "hug") hugs++;
        else kisses++;
        items.push({
          id: docSnap.id,
          type: data.type,
          timestamp: data.timestamp,
          sender: data.sender || "Kei",
        });
      });

      setHugCount(hugs);
      setKissCount(kisses);
      setRecentInteractions(items);

      if (role && items.length > 0) {
        const latest = items[0];
        const currentName = role === "kei" ? "Kei" : "Cass";
        if (latest.sender !== currentName) {
          setSeenIds((prev) => {
            if (!prev.has(latest.id)) {
              setNotification(
                latest.type === "hug"
                  ? `🤗 ${latest.sender} sent you a hug!`
                  : `😘 ${latest.sender} sent you a kiss!`
              );
              setTimeout(() => setNotification(null), 5000);
              return new Set([...prev, latest.id]);
            }
            return prev;
          });
        }
      }
    };

    const unsubscribe = onSnapshot(q, processSnapshot, (error) => {
      console.error("Firestore interactions error:", error);
      // Fallback without ordering
      onSnapshot(collection(db, "interactions"), processSnapshot);
    });

    return () => unsubscribe();
  }, [role]);

  const sendInteraction = async (type: "hug" | "kiss") => {
    if (!role) return;

    const senderName = role === "kei" ? "Kei" : "Cass";
    const recipientRole = role === "kei" ? "cass" : "kei";
    const fallbackEmail = recipientRole === "kei" ? "elediakei@gmail.com" : "";

    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    await addDoc(collection(db, "interactions"), {
      type,
      timestamp,
      sender: senderName,
      createdAt: now.toISOString(),
    });

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
            type,
          }),
        });
      }
    } catch (e) {
      console.error("Failed to send email notification", e);
    }
  };

  const partnerName = role === "kei" ? "Cass" : "Kei";

  return (
    <div className="bg-card rounded-3xl p-6 shadow-sm border border-secondary space-y-6 relative overflow-hidden">
      {notification && (
        <div className="absolute top-4 left-4 right-4 bg-blue-600 text-white p-3.5 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 animate-bounce z-10 text-sm font-semibold border border-blue-300">
          <Sparkles size={16} />
          {notification}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-foreground">Virtual Affection</h3>
        <span className="flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
          <Flame size={12} className="fill-primary text-primary" />
          {hugCount + kissCount} Shared
        </span>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-secondary-foreground">
          Send {partnerName} a little reminder of your love.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => sendInteraction("hug")}
            className="flex items-center justify-center gap-2 bg-secondary/60 hover:bg-secondary text-foreground p-4 rounded-2xl font-medium active:scale-95 transition-all text-base border border-secondary"
          >
            <span className="text-xl">🤗</span> Send Hug
          </button>
          <button
            onClick={() => sendInteraction("kiss")}
            className="flex items-center justify-center gap-2 bg-secondary/60 hover:bg-secondary text-foreground p-4 rounded-2xl font-medium active:scale-95 transition-all text-base border border-secondary"
          >
            <span className="text-xl">😘</span> Send Kiss
          </button>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-semibold text-secondary-foreground uppercase tracking-wider">
          Recent Affection
        </h4>
        {recentInteractions.length === 0 ? (
          <p className="text-sm text-secondary-foreground text-center py-4">
            No affection recorded yet. Send one above!
          </p>
        ) : (
          <div className="space-y-2">
            {recentInteractions.slice(0, 4).map((item) => {
              const isFromCass = item.sender.toLowerCase() === "cass";
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isFromCass
                      ? "bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-l-blue-500 border-blue-200 dark:border-blue-800 shadow-xs"
                      : "bg-secondary/30 border-secondary/20"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <span>{item.type === "hug" ? "🤗" : "😘"}</span>
                    <span>
                      {item.sender === (role === "kei" ? "Kei" : "Cass")
                        ? `You sent ${partnerName} a ${item.type}.`
                        : `${item.sender} sent you a ${item.type}.`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isFromCass && (
                      <span className="text-[9px] bg-blue-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                        Cass 💙
                      </span>
                    )}
                    <span className="text-[10px] text-secondary-foreground">{item.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-secondary">
        <div className="text-center p-3 bg-secondary/20 rounded-2xl border border-secondary/10">
          <p className="text-2xl">🤗</p>
          <p className="text-lg font-bold mt-1 text-foreground">{hugCount}</p>
          <p className="text-xs text-secondary-foreground font-medium">Hugs Shared</p>
        </div>
        <div className="text-center p-3 bg-secondary/20 rounded-2xl border border-secondary/10">
          <p className="text-2xl">😘</p>
          <p className="text-lg font-bold mt-1 text-foreground">{kissCount}</p>
          <p className="text-xs text-secondary-foreground font-medium">Kisses Shared</p>
        </div>
      </div>
    </div>
  );
}
