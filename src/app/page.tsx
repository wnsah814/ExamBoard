"use client";

import { useEffect, useState } from "react";
import { Clock } from "@/components/Clock";
import { ExamInfoCard } from "@/components/ExamInfoCard";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import type { ExamInfo, Announcement } from "@/types/exam";
import { subscribeToExam, subscribeToAnnouncements, subscribeToAppSettings, type AppSettings } from "@/lib/firestore";
import { loadLocalClockSize, saveLocalClockSize, clearLocalClockSize } from "@/lib/storage";
import { Loader2, Settings, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [defaultClockSize, setDefaultClockSize] = useState(16); // From Firestore
  const [localClockSize, setLocalClockSize] = useState<number | null>(null); // From localStorage
  const [isLoading, setIsLoading] = useState(true);
  const [showSizeControl, setShowSizeControl] = useState(false);

  // Actual clock size: local override or default
  const clockSize = localClockSize ?? defaultClockSize;

  useEffect(() => {
    // Load local clock size
    const savedLocal = loadLocalClockSize();
    if (savedLocal !== null) {
      setLocalClockSize(savedLocal);
    }

    // Subscribe to real-time updates
    const unsubExam = subscribeToExam((examData) => {
      setExam(examData);
      setIsLoading(false);
    });

    const unsubAnnouncements = subscribeToAnnouncements((announcementsData) => {
      setAnnouncements(announcementsData);
    });

    const unsubSettings = subscribeToAppSettings((settingsData) => {
      setDefaultClockSize(settingsData.clockSize);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubExam();
      unsubAnnouncements();
      unsubSettings();
    };
  }, []);

  const handleClockSizeChange = (size: number) => {
    setLocalClockSize(size);
    saveLocalClockSize(size);
  };

  const handleResetClockSize = () => {
    setLocalClockSize(null);
    clearLocalClockSize();
  };

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
        <div>
          <Clock size={clockSize * 0.5} />
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

        {/* Clock size control */}
        <div className="fixed bottom-4 right-4">
          {showSizeControl ? (
            <Card className="w-80">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>시계 크기: {clockSize}vw</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSizeControl(false)}
                  >
                    닫기
                  </Button>
                </div>
                <input
                  type="range"
                  min="8"
                  max="24"
                  step="1"
                  value={clockSize}
                  onChange={(e) => handleClockSizeChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {localClockSize !== null ? `로컬: ${localClockSize}vw` : `기본값: ${defaultClockSize}vw`}
                  </span>
                  {localClockSize !== null && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetClockSize}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      기본값으로
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSizeControl(true)}
              className="h-10 w-10"
            >
              <Settings className="w-5 h-5" />
            </Button>
          )}
        </div>
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
          <Clock size={clockSize} />
        </section>

        {/* 하단 정보 영역 */}
        <section className="flex-1 grid grid-cols-2 gap-[2vw] min-h-0 pb-[2vh]">
          <ExamInfoCard exam={exam} />
          <AnnouncementCard announcements={announcements} />
        </section>
      </main>

      {/* Clock size control */}
      <div className="fixed bottom-4 right-4 z-50">
        {showSizeControl ? (
          <Card className="w-80">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label>시계 크기: {clockSize}vw</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSizeControl(false)}
                >
                  닫기
                </Button>
              </div>
              <input
                type="range"
                min="8"
                max="24"
                step="1"
                value={clockSize}
                onChange={(e) => handleClockSizeChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {localClockSize !== null ? `로컬: ${localClockSize}vw` : `기본값: ${defaultClockSize}vw`}
                </span>
                {localClockSize !== null && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetClockSize}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    기본값으로
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSizeControl(true)}
            className="h-10 w-10"
          >
            <Settings className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
