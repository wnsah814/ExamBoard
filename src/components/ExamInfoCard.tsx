"use client";

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
  return (
    <Card className="h-full bg-card/50 backdrop-blur overflow-hidden">
      <CardContent className="h-full flex flex-col justify-center p-[2vw] gap-[3vh]">
        {/* 시험 시간 */}
        <div className="text-center">
          <div
            className="text-muted-foreground mb-[1vh]"
            style={{ fontSize: `${2 * fontScale}vw` }}
          >
            시험 시간
          </div>
          <div
            className="font-bold tabular-nums"
            style={{ fontSize: `${5 * fontScale}vw` }}
          >
            {formatTime(exam.startTime)} ~ {formatTime(exam.endTime)}
          </div>
        </div>

        {/* 중도퇴실 */}
        {exam.earlyExitTime && (
          <div className="text-center">
            <div
              className="text-muted-foreground mb-[1vh]"
              style={{ fontSize: `${2 * fontScale}vw` }}
            >
              중도퇴실 가능
            </div>
            <div
              className="font-semibold tabular-nums text-muted-foreground"
              style={{ fontSize: `${4 * fontScale}vw` }}
            >
              {formatTime(exam.earlyExitTime)} 이후
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
