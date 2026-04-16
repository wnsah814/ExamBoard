"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { ExamInfo } from "@/types/exam";

interface ExamInfoCardProps {
  exam: ExamInfo;
  fontScale?: number;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function ExamInfoCard({ exam, fontScale = 1.0 }: ExamInfoCardProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const canEarlyExit = exam.earlyExitTime && now ? now >= exam.earlyExitTime : false;

  return (
    <Card className="h-full bg-card/50 backdrop-blur overflow-hidden">
      <CardContent
        className="h-full flex flex-col justify-center"
        style={{ padding: `${2 * fontScale}vw`, gap: `${3 * fontScale}vh` }}
      >
        {/* 시험 시간 */}
        <div className="text-center">
          <div
            className="uppercase tracking-widest text-muted-foreground font-medium"
            style={{ fontSize: `${1.3 * fontScale}vw`, marginBottom: `${0.8 * fontScale}vh` }}
          >
            시험 시간
          </div>
          <div
            className="font-bold tabular-nums"
            style={{ fontSize: `${3.5 * fontScale}vw` }}
          >
            {formatTime(exam.startTime)} ~ {formatTime(exam.endTime)}
          </div>
        </div>

        {/* 중도 퇴실 */}
        {exam.earlyExitTime && (
          <div className="text-center">
            <div
              className="uppercase tracking-widest text-muted-foreground font-medium"
              style={{ fontSize: `${1.3 * fontScale}vw`, marginBottom: `${0.8 * fontScale}vh` }}
            >
              중도 퇴실
            </div>
            {canEarlyExit ? (
              <div
                className="font-semibold text-green-600 dark:text-green-400"
                style={{ fontSize: `${2.5 * fontScale}vw` }}
              >
                퇴실 가능
              </div>
            ) : (
              <div
                className="font-bold tabular-nums"
                style={{ fontSize: `${3 * fontScale}vw` }}
              >
                {formatTime(exam.earlyExitTime)} 이후
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
