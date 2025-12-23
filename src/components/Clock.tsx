"use client";

import { useEffect, useState } from "react";

interface ClockProps {
  size?: number; // size in vw units (default: 16)
}

export function Clock({ size = 16 }: ClockProps) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <div className="text-center">
        <div
          className="font-bold tabular-nums tracking-tight text-foreground leading-none"
          style={{ fontSize: `${size}vw` }}
        >
          --:--:--
        </div>
      </div>
    );
  }

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");
  const seconds = time.getSeconds().toString().padStart(2, "0");

  return (
    <div className="text-center">
      <div
        className="font-bold tabular-nums tracking-tight text-foreground leading-none"
        style={{ fontSize: `${size}vw` }}
      >
        {hours}
        <span className="opacity-80">:</span>
        {minutes}
        <span className="opacity-50">:</span>
        <span className="opacity-70">{seconds}</span>
      </div>
    </div>
  );
}
