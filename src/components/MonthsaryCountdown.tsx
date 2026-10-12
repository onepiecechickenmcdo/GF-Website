"use client";

import { useEffect, useState } from "react";
import { Heart, Gift } from "lucide-react";

export default function MonthsaryCountdown() {
  const [timeState, setTimeState] = useState({
    daysRemaining: 0,
    nextDateString: "",
    durationString: "",
    isToday: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const anniversary = new Date(2026, 1, 14); // Feb 14, 2026 (month is 0-indexed)
      const now = new Date();
      
      // Calculate duration since anniversary
      let years = now.getFullYear() - anniversary.getFullYear();
      let months = now.getMonth() - anniversary.getMonth();
      let days = now.getDate() - anniversary.getDate();

      if (days < 0) {
        // Borrow days from previous month
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
        months--;
      }
      if (months < 0) {
        months += 12;
        years--;
      }

      let durationString = "";
      if (years > 0) durationString += `${years} year${years > 1 ? "s" : ""}, `;
      if (months > 0) durationString += `${months} month${months > 1 ? "s" : ""}, `;
      durationString += `${days} day${days !== 1 ? "s" : ""}`;

      // Calculate next monthsary (14th of this or next month)
      let nextMonthsary = new Date(now.getFullYear(), now.getMonth(), 14);
      if (now.getDate() > 14) {
        nextMonthsary.setMonth(nextMonthsary.getMonth() + 1);
      }

      const isToday = now.getDate() === 14;
      const diffTime = nextMonthsary.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" };
      const nextDateString = nextMonthsary.toLocaleDateString("en-US", options);

      setTimeState({ daysRemaining, nextDateString, durationString, isToday });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-primary/20 to-secondary/30 rounded-3xl p-6 border border-primary/20 relative overflow-hidden shadow-sm">
      <div className="absolute right-0 bottom-0 opacity-10 translate-x-2 translate-y-2 pointer-events-none">
        <Heart size={140} className="fill-primary text-primary" />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-primary font-medium text-sm">
          <Heart size={16} className="fill-primary" />
          <span>Monthsary Countdown</span>
        </div>

        {timeState.isToday ? (
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-primary flex items-center gap-2 animate-bounce">
              Happy Monthsary! <Gift size={24} />
            </h3>
            <p className="text-sm text-foreground/80">Today is February 14th relationship check-in day!</p>
          </div>
        ) : (
          <div className="space-y-1">
            <h3 className="text-3xl font-extrabold tracking-tight text-foreground">
              {timeState.daysRemaining} {timeState.daysRemaining === 1 ? "day" : "days"}
            </h3>
            <p className="text-xs text-secondary-foreground font-medium uppercase tracking-wider">
              Until our next monthsary ({timeState.nextDateString})
            </p>
          </div>
        )}

        <div className="pt-3 border-t border-primary/10">
          <p className="text-xs text-secondary-foreground">Together for</p>
          <p className="text-sm font-semibold text-foreground/95">{timeState.durationString}</p>
        </div>
      </div>
    </div>
  );
}
