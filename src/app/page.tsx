"use client";

import { Clock } from "@/components/Clock";
import { ExamInfoCard } from "@/components/ExamInfoCard";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import type { ExamInfo, Announcement } from "@/types/exam";

// 데모 데이터 - 실제로는 서버에서 가져오거나 관리자가 설정
const demoExam: ExamInfo = {
  name: "2024학년도 2학기 기말고사",
  subject: "자료구조",
  location: "공학관 101호",
  startTime: new Date(new Date().setHours(10, 0, 0, 0)),
  endTime: new Date(new Date().setHours(12, 0, 0, 0)),
  earlyExitTime: new Date(new Date().setHours(11, 0, 0, 0)),
};

const demoAnnouncements: Announcement[] = [
  {
    id: "1",
    type: "correction",
    title: "문제 정정",
    content: '"이진 탐색 트리"를 "AVL 트리"로 정정합니다.',
    questionNumber: 5,
    timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 15)),
  },
  {
    id: "2",
    type: "info",
    title: "안내",
    content: "답안지 작성 시 연필 또는 검정 볼펜만 사용하세요.",
    timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 30)),
  },
  {
    id: "3",
    type: "warning",
    title: "주의",
    content: "휴대폰은 반드시 전원을 끄고 가방에 보관하세요.",
    timestamp: new Date(new Date().setMinutes(new Date().getMinutes() - 45)),
  },
];

export default function Home() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col">
      {/* 헤더 - 시험명 (간결하게) */}
      <header className="flex-shrink-0 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-[2vw] py-[0.8vh]">
        <div className="flex items-center justify-center gap-[1vw]">
          <h1 className="text-[2vw] font-bold">{demoExam.name}</h1>
          <span className="text-[1.5vw] text-muted-foreground">|</span>
          <span className="text-[1.8vw] text-muted-foreground">
            {demoExam.subject}
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
          <ExamInfoCard exam={demoExam} />
          <AnnouncementCard announcements={demoAnnouncements} />
        </section>
      </main>

    </div>
  );
}
