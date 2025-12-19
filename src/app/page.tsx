"use client";

import { useEffect, useState } from "react";
import { Clock } from "@/components/Clock";
import { ExamInfoCard } from "@/components/ExamInfoCard";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import type { ExamInfo, Announcement } from "@/types/exam";
import { subscribeToExam, subscribeToAnnouncements } from "@/lib/firestore";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubExam = subscribeToExam((examData) => {
      setExam(examData);
      setIsLoading(false);
    });

    const unsubAnnouncements = subscribeToAnnouncements((announcementsData) => {
      setAnnouncements(announcementsData);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubExam();
      unsubAnnouncements();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <Loader2 className="w-12 h-12 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-[8vw] font-bold">
          <Clock />
        </div>
        <div className="text-[2vw] text-muted-foreground">
          시험 정보가 설정되지 않았습니다
        </div>
        <a
          href="/admin"
          className="text-[1.5vw] text-blue-500 hover:underline"
        >
          관리자 페이지에서 설정하기
        </a>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col">
      {/* 헤더 - 시험명 (간결하게) */}
      <header className="flex-shrink-0 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-[2vw] py-[0.8vh]">
        <div className="flex items-center justify-center gap-[1vw]">
          <h1 className="text-[2vw] font-bold">{exam.name}</h1>
          <span className="text-[1.5vw] text-muted-foreground">|</span>
          <span className="text-[1.8vw] text-muted-foreground">
            {exam.subject}
          </span>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col px-[2vw] py-[2vh] gap-[2vh] min-h-0">
        {/* 시계 영역 */}
        <section className="flex items-center justify-center py-[4vh]">
          <Clock />
        </section>

        {/* 하단 정보 영역 */}
        <section className="flex-1 grid grid-cols-2 gap-[2vw] min-h-0 pb-[2vh]">
          <ExamInfoCard exam={exam} />
          <AnnouncementCard announcements={announcements} />
        </section>
      </main>
    </div>
  );
}
