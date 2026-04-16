"use client";

import { useEffect, useState } from "react";
import { Clock } from "@/components/Clock";
import { ExamInfoCard } from "@/components/ExamInfoCard";
import { AnnouncementCard } from "@/components/AnnouncementCard";
import type { ExamInfo, Announcement } from "@/types/exam";
import { subscribeToExam, subscribeToAnnouncements, subscribeToAppSettings, type AppSettings } from "@/lib/firestore";
import { loadLocalClockSize, saveLocalClockSize, clearLocalClockSize, loadLocalFontScale, saveLocalFontScale, clearLocalFontScale, loadLayoutMode, saveLayoutMode, type LayoutMode } from "@/lib/storage";
import { Loader2, Settings, RotateCcw, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [defaultClockSize, setDefaultClockSize] = useState(16); // From Firestore
  const [localClockSize, setLocalClockSize] = useState<number | null>(null); // From localStorage
  const [defaultFontScale, setDefaultFontScale] = useState(1.0); // From Firestore
  const [localFontScale, setLocalFontScale] = useState<number | null>(null); // From localStorage
  const [isLoading, setIsLoading] = useState(true);
  const [showSizeControl, setShowSizeControl] = useState(false);
  const [layout, setLayout] = useState<LayoutMode>("default");

  // Actual sizes: local override or default
  const clockSize = localClockSize ?? defaultClockSize;
  const fontScale = localFontScale ?? defaultFontScale;

  useEffect(() => {
    // Load local settings
    const savedClockSize = loadLocalClockSize();
    if (savedClockSize !== null) {
      setLocalClockSize(savedClockSize);
    }

    const savedFontScale = loadLocalFontScale();
    if (savedFontScale !== null) {
      setLocalFontScale(savedFontScale);
    }

    setLayout(loadLayoutMode());

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
      setDefaultFontScale(settingsData.fontScale);
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

  const handleFontScaleChange = (scale: number) => {
    setLocalFontScale(scale);
    saveLocalFontScale(scale);
  };

  const handleResetFontScale = () => {
    setLocalFontScale(null);
    clearLocalFontScale();
  };

  const handleLayoutChange = (mode: LayoutMode) => {
    setLayout(mode);
    saveLayoutMode(mode);
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

        {/* Size control */}
        <div className="fixed bottom-4 right-4">
          {showSizeControl ? (
            <Card className="w-80">
              <CardContent className="pt-3 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-bold">화면 설정</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSizeControl(false)}
                  >
                    닫기
                  </Button>
                </div>

                {/* Clock Size */}
                <div className="space-y-2">
                  <Label className="text-sm">시계 크기: {clockSize}vw</Label>
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
                        초기화
                      </Button>
                    )}
                  </div>
                </div>

                {/* Font Scale */}
                <div className="space-y-2">
                  <Label className="text-sm">글자 크기: {fontScale.toFixed(1)}x</Label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={fontScale}
                    onChange={(e) => handleFontScaleChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {localFontScale !== null ? `로컬: ${localFontScale.toFixed(1)}x` : `기본값: ${defaultFontScale.toFixed(1)}x`}
                    </span>
                    {localFontScale !== null && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetFontScale}
                      >
                        <RotateCcw className="w-3 h-3 mr-1" />
                        초기화
                      </Button>
                    )}
                  </div>
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
      {/* 헤더 */}
      <header
        className="flex-shrink-0 border-b border-border/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm"
        style={{ padding: `${0.6 * fontScale}vh ${2 * fontScale}vw` }}
      >
        <div className="flex items-center justify-center" style={{ gap: `${0.8 * fontScale}vw` }}>
          <span className="font-semibold" style={{ fontSize: `${1.6 * fontScale}vw` }}>{exam.name}</span>
          <span className="text-muted-foreground/50" style={{ fontSize: `${1.2 * fontScale}vw` }}>|</span>
          <span className="text-muted-foreground" style={{ fontSize: `${1.4 * fontScale}vw` }}>{exam.subject}</span>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      {layout === "default" ? (
        <main
          className="flex-1 flex flex-col min-h-0"
          style={{ padding: `${1.5 * fontScale}vh ${2 * fontScale}vw`, gap: `${1.5 * fontScale}vh` }}
        >
          {/* 시계 영역 */}
          <section className="flex items-center justify-center" style={{ padding: `${2 * fontScale}vh 0` }}>
            <Clock size={clockSize} />
          </section>

          {/* 하단 정보 영역 */}
          <section className="flex-1 grid min-h-0" style={{ gridTemplateColumns: "1fr 2fr", gap: `${1.5 * fontScale}vw`, paddingBottom: `${1 * fontScale}vh` }}>
            <ExamInfoCard exam={exam} fontScale={fontScale} />
            <AnnouncementCard announcements={announcements} fontScale={fontScale} />
          </section>
        </main>
      ) : (
        <main
          className="flex-1 grid min-h-0"
          style={{ gridTemplateColumns: "1fr 1fr", padding: `${1.5 * fontScale}vh ${2 * fontScale}vw`, gap: `${1.5 * fontScale}vw` }}
        >
          {/* 왼쪽: 시계 + 시험 정보 */}
          <section className="flex flex-col items-center justify-center min-h-0" style={{ gap: `${2 * fontScale}vh`, padding: `0 ${1.5 * fontScale}vw` }}>
            <Clock size={clockSize} />
            <div className="w-full">
              <ExamInfoCard exam={exam} fontScale={fontScale} compact />
            </div>
          </section>

          {/* 오른쪽: 공지사항 */}
          <section className="min-h-0">
            <AnnouncementCard announcements={announcements} fontScale={fontScale} />
          </section>
        </main>
      )}

      {/* Size control */}
      <div className="fixed bottom-4 right-4 z-50">
        {showSizeControl ? (
          <Card className="w-80">
            <CardContent className="pt-3 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="font-bold">화면 설정</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSizeControl(false)}
                >
                  닫기
                </Button>
              </div>

              {/* Clock Size */}
              <div className="space-y-2">
                <Label className="text-sm">시계 크기: {clockSize}vw</Label>
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
                      초기화
                    </Button>
                  )}
                </div>
              </div>

              {/* Font Scale */}
              <div className="space-y-2">
                <Label className="text-sm">글자 크기: {fontScale.toFixed(1)}x</Label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={fontScale}
                  onChange={(e) => handleFontScaleChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {localFontScale !== null ? `로컬: ${localFontScale.toFixed(1)}x` : `기본값: ${defaultFontScale.toFixed(1)}x`}
                  </span>
                  {localFontScale !== null && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResetFontScale}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      초기화
                    </Button>
                  )}
                </div>
              </div>

              {/* Layout */}
              <div className="space-y-2">
                <Label className="text-sm">레이아웃</Label>
                <div className="flex gap-2">
                  <Button
                    variant={layout === "default" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleLayoutChange("default")}
                  >
                    기본
                  </Button>
                  <Button
                    variant={layout === "split" ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleLayoutChange("split")}
                  >
                    좌우 분할
                  </Button>
                </div>
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
