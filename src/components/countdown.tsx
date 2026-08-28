"use client";
import { useEffect, useState } from "react";
function remaining(target: string, serverNow: number) {
  const distance = Math.max(0, new Date(target).getTime() - serverNow);
  return {
    days: Math.floor(distance / 86400000),
    hours: Math.floor((distance / 3600000) % 24),
    minutes: Math.floor((distance / 60000) % 60),
  };
}
export function Countdown({
  target,
  serverNow,
}: {
  target: string;
  serverNow: number;
}) {
  const [now, setNow] = useState(serverNow);
  useEffect(() => {
    const start = Date.now();
    const timer = window.setInterval(
      () => setNow(serverNow + Date.now() - start),
      30000,
    );
    return () => clearInterval(timer);
  }, [serverNow]);
  const value = remaining(target, now);
  return (
    <div
      className="flex gap-2"
      aria-label={`${value.days} gün ${value.hours} saat ${value.minutes} dakika kaldı`}
    >
      {[
        [value.days, "gün"],
        [value.hours, "saat"],
        [value.minutes, "dk"],
      ].map(([number, label]) => (
        <div
          className="min-w-16 rounded-xl bg-zinc-950 p-3 text-center text-white dark:bg-white dark:text-black"
          key={label}
        >
          <strong className="block text-xl">{number}</strong>
          <span className="text-xs opacity-70">{label}</span>
        </div>
      ))}
    </div>
  );
}
