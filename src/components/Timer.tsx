"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface TimerProps {
  endTime: Date;
  earlyExitTime: Date | null;
}

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "00:00:00";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function Timer({ endTime, earlyExitTime }: TimerProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!now) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="text-[2.5vw] font-medium text-muted-foreground uppercase tracking-widest">
          남은 시간
        </div>
        <div className="text-[8vw] font-bold tabular-nums leading-none">
          --:--:--
        </div>
      </div>
    );
  }

  const remainingMs = endTime.getTime() - now.getTime();
  const isFinished = remainingMs <= 0;
  const isWarning = remainingMs > 0 && remainingMs <= 10 * 60 * 1000;
  const isDanger = remainingMs > 0 && remainingMs <= 5 * 60 * 1000;

  const canEarlyExit = earlyExitTime ? now >= earlyExitTime : false;
  const earlyExitRemainingMs = earlyExitTime
    ? earlyExitTime.getTime() - now.getTime()
    : null;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-[2.5vw] font-medium text-muted-foreground uppercase tracking-widest">
        남은 시간
      </div>
      <div
        className={`text-[8vw] font-bold tabular-nums leading-none ${
          isFinished
            ? "text-muted-foreground"
            : isDanger
            ? "text-red-500 animate-pulse"
            : isWarning
            ? "text-orange-500"
            : "text-blue-600 dark:text-blue-400"
        }`}
      >
        {isFinished ? "시험 종료" : formatTimeRemaining(remainingMs)}
      </div>

      {earlyExitTime && (
        <div className="mt-2">
          {canEarlyExit ? (
            <Badge
              variant="default"
              className="text-[1.5vw] px-[2vw] py-[0.5vw] bg-green-600 hover:bg-green-600"
            >
              중도퇴실 가능
            </Badge>
          ) : earlyExitRemainingMs && earlyExitRemainingMs > 0 ? (
            <Badge
              variant="secondary"
              className="text-[1.5vw] px-[2vw] py-[0.5vw]"
            >
              중도퇴실까지 {formatTimeRemaining(earlyExitRemainingMs)}
            </Badge>
          ) : null}
        </div>
      )}
    </div>
  );
}
