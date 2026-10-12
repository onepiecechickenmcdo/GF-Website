"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock, Heart } from "lucide-react";

export default function Login() {
  const { loginWithPasscode, selectProfile, isAuthenticated } = useAuth();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginWithPasscode(passcode)) {
      setError("Incorrect passcode. Try our anniversary.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-card shadow-lg rounded-3xl p-8 max-w-sm w-full text-center space-y-6">
          <div className="flex justify-center text-primary">
            <Lock size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Casstelle Check-In</h1>
          <p className="text-secondary-foreground text-sm">Please enter the passcode to access our private space.</p>
          
          <form onSubmit={handlePasscodeSubmit} className="space-y-4">
            <input
              type="password"
              value={passcode}
              onChange={(e) => { setPasscode(e.target.value); setError(""); }}
              className="w-full px-4 py-3 rounded-xl border border-secondary bg-background text-center text-xl tracking-widest focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••"
              maxLength={6}
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-medium shadow-md shadow-primary/30 hover:bg-primary/90 transition-all flex justify-center items-center gap-2"
            >
              Enter <Heart size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="bg-card shadow-lg rounded-3xl p-8 max-w-md w-full text-center space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-foreground">Who is this?</h2>
          <p className="text-secondary-foreground text-sm">Select your profile to continue.</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => selectProfile("kei")}
            className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-all hover:bg-secondary/50 active:scale-95"
          >
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-md">
              <img src="/images/kei_profile.jpg" alt="Kei" className="w-full h-full object-cover" />
            </div>
            <span className="font-medium text-lg">Kei</span>
          </button>

          <button
            onClick={() => selectProfile("cass")}
            className="flex flex-col items-center gap-3 p-4 rounded-2xl transition-all hover:bg-secondary/50 active:scale-95"
          >
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-background shadow-md">
              <img src="/images/cass_profile.jpg" alt="Cass" className="w-full h-full object-cover" />
            </div>
            <span className="font-medium text-lg">Cass</span>
          </button>
        </div>
      </div>
    </div>
  );
}
