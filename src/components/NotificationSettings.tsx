"use client";

import { useState, useEffect } from "react";
import { Bell, Mail, Save } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function NotificationSettings() {
  const { role } = useAuth();
  const [remindCheckIn, setRemindCheckIn] = useState(true);
  const [notifyPartnerSubmission, setNotifyPartnerSubmission] = useState(true);
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const partnerName = role === "kei" ? "Cass" : "Kei";

  useEffect(() => {
    if (!role) return;
    const loadSettings = async () => {
      const snap = await getDoc(doc(db, "notificationSettings", role));
      if (snap.exists()) {
        const data = snap.data();
        setRemindCheckIn(data.remindCheckIn ?? data.wantsNotifications ?? true);
        setNotifyPartnerSubmission(data.notifyPartnerSubmission ?? true);
        setEmail(data.email || (role === "kei" ? "elediakei@gmail.com" : ""));
      } else {
        setEmail(role === "kei" ? "elediakei@gmail.com" : "");
      }
    };
    loadSettings();
  }, [role]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await setDoc(doc(db, "notificationSettings", role!), {
      remindCheckIn,
      notifyPartnerSubmission,
      wantsNotifications: remindCheckIn || notifyPartnerSubmission,
      email,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sendTestEmail = async () => {
    if (!email) return;
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, type: "test" }),
      });
      const data = await res.json();
      if (data.simulated) {
        setTestResult("Simulated! Add RESEND_API_KEY to send real email.");
      } else if (data.error) {
        setTestResult(`Error: ${data.error}`);
      } else {
        setTestResult("Verification email sent!");
      }
    } catch (err) {
      setTestResult("Failed to send verification request.");
    }
    setSendingTest(false);
  };

  const hasAnyNotification = remindCheckIn || notifyPartnerSubmission;

  return (
    <div className="bg-card rounded-3xl p-6 shadow-sm border border-secondary space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-secondary">
        <Bell className="text-primary" size={18} />
        <h3 className="font-semibold text-sm text-foreground">Notification Preferences</h3>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              Remind me to complete weekly check-ins
            </span>
            <button
              type="button"
              onClick={() => setRemindCheckIn(!remindCheckIn)}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all ${
                remindCheckIn ? "bg-primary justify-end" : "bg-secondary justify-start"
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-sm" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              Notify me when {partnerName} submits a check-in
            </span>
            <button
              type="button"
              onClick={() => setNotifyPartnerSubmission(!notifyPartnerSubmission)}
              className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all ${
                notifyPartnerSubmission ? "bg-primary justify-end" : "bg-secondary justify-start"
              }`}
            >
              <div className="bg-white w-4 h-4 rounded-full shadow-sm" />
            </button>
          </div>
        </div>

        {hasAnyNotification && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200 pt-2 border-t border-secondary">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-secondary-foreground uppercase tracking-wider flex items-center gap-1">
                <Mail size={10} /> Email Address
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="enter-email@domain.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSaved(false); }}
                  required={hasAnyNotification}
                  className="flex-1 px-4 py-2 rounded-xl border border-secondary bg-background/50 focus:outline-none focus:border-primary text-xs transition-all"
                />
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-3 rounded-xl hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center text-xs gap-1 font-semibold"
                >
                  <Save size={12} /> Save
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={sendTestEmail}
                disabled={sendingTest || !email}
                className="w-full bg-secondary/80 text-foreground py-2 rounded-xl text-xs font-semibold hover:bg-secondary transition-all active:scale-95 disabled:opacity-50"
              >
                {sendingTest ? "Sending..." : "Verify Email"}
              </button>
              {testResult && (
                <p className="text-[10px] text-center font-medium text-secondary-foreground">
                  {testResult}
                </p>
              )}
            </div>
          </div>
        )}

        {saved && (
          <p className="text-[10px] text-emerald-500 font-semibold text-center animate-pulse">
            Preferences saved successfully!
          </p>
        )}
      </form>
    </div>
  );
}
