"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  saveExamToFirestore,
  loadExamFromFirestore,
  addAnnouncementToFirestore,
  deleteAnnouncementFromFirestore,
  loadAnnouncementsFromFirestore,
  savePresetToFirestore,
  deletePresetFromFirestore,
  loadPresetsFromFirestore,
  type Preset,
} from "@/lib/firestore";
import type { Announcement } from "@/types/exam";
import { Trash2, Plus, Eye, Clock, Bell, Save, FolderOpen, Loader2 } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Exam form state
  const [exam, setExam] = useState({
    name: "",
    subject: "",
    startTime: "",
    endTime: "",
    earlyExitTime: "",
  });

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Presets state
  const [presets, setPresets] = useState<Preset[]>([]);
  const [newPresetName, setNewPresetName] = useState("");

  // New announcement form
  const [newAnnouncement, setNewAnnouncement] = useState({
    type: "info" as "info" | "warning" | "correction",
    title: "",
    content: "",
    questionNumber: "",
  });

  function formatDateTimeLocal(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  // Load saved data on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [savedExam, savedAnnouncements, savedPresets] = await Promise.all([
          loadExamFromFirestore(),
          loadAnnouncementsFromFirestore(),
          loadPresetsFromFirestore(),
        ]);

        if (savedExam) {
          setExam({
            name: savedExam.name,
            subject: savedExam.subject,
            startTime: formatDateTimeLocal(savedExam.startTime),
            endTime: formatDateTimeLocal(savedExam.endTime),
            earlyExitTime: savedExam.earlyExitTime
              ? formatDateTimeLocal(savedExam.earlyExitTime)
              : "",
          });
        } else {
          // Set default times
          const now = new Date();
          const start = new Date(now);
          start.setMinutes(0, 0, 0);
          const end = new Date(start);
          end.setHours(end.getHours() + 2);
          const earlyExit = new Date(start);
          earlyExit.setHours(earlyExit.getHours() + 1);

          setExam({
            name: "",
            subject: "",
            startTime: formatDateTimeLocal(start),
            endTime: formatDateTimeLocal(end),
            earlyExitTime: formatDateTimeLocal(earlyExit),
          });
        }

        setAnnouncements(savedAnnouncements);
        setPresets(savedPresets);
      } catch (error) {
        console.error("Error loading data:", error);
        alert("데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  function handleExamChange(field: string, value: string) {
    setExam((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveExam() {
    setIsSaving(true);
    try {
      await saveExamToFirestore({
        ...exam,
        earlyExitTime: exam.earlyExitTime || null,
      });
      alert("시험 정보가 저장되었습니다.");
    } catch (error) {
      console.error("Error saving exam:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  }

  // Preset functions
  async function handleSavePreset() {
    if (!newPresetName.trim()) {
      alert("프리셋 이름을 입력해주세요.");
      return;
    }

    if (!exam.startTime || !exam.endTime) {
      alert("시험 시간을 먼저 설정해주세요.");
      return;
    }

    const startDate = new Date(exam.startTime);
    const endDate = new Date(exam.endTime);
    const durationMinutes = Math.round(
      (endDate.getTime() - startDate.getTime()) / 60000
    );

    let earlyExitMinutes: number | null = null;
    if (exam.earlyExitTime) {
      const earlyExitDate = new Date(exam.earlyExitTime);
      earlyExitMinutes = Math.round(
        (earlyExitDate.getTime() - startDate.getTime()) / 60000
      );
    }

    // 현재 공지사항을 프리셋에 포함 (timestamp 제외)
    const presetAnnouncements = announcements.map((a) => ({
      type: a.type,
      title: a.title,
      content: a.content,
      ...(a.questionNumber !== undefined && { questionNumber: a.questionNumber }),
    }));

    try {
      const id = await savePresetToFirestore({
        name: newPresetName.trim(),
        examName: exam.name,
        subject: exam.subject,
        durationMinutes,
        earlyExitMinutes,
        announcements: presetAnnouncements,
      });

      setPresets((prev) => [
        ...prev,
        {
          id,
          name: newPresetName.trim(),
          examName: exam.name,
          subject: exam.subject,
          durationMinutes,
          earlyExitMinutes,
          announcements: presetAnnouncements,
        },
      ]);
      setNewPresetName("");
      alert(`프리셋이 저장되었습니다. (공지사항 ${presetAnnouncements.length}개 포함)`);
    } catch (error) {
      console.error("Error saving preset:", error);
      alert("프리셋 저장 중 오류가 발생했습니다.");
    }
  }

  async function handleLoadPreset(preset: Preset) {
    // 현재 입력된 시작 시간을 기준으로 계산 (없으면 현재 시간)
    const start = exam.startTime ? new Date(exam.startTime) : new Date();
    start.setSeconds(0, 0);

    const end = new Date(start.getTime() + preset.durationMinutes * 60000);

    let earlyExitTime = "";
    if (preset.earlyExitMinutes !== null) {
      const earlyExit = new Date(
        start.getTime() + preset.earlyExitMinutes * 60000
      );
      earlyExitTime = formatDateTimeLocal(earlyExit);
    }

    setExam({
      name: preset.examName,
      subject: preset.subject,
      startTime: formatDateTimeLocal(start),
      endTime: formatDateTimeLocal(end),
      earlyExitTime,
    });

    // 프리셋에 공지사항이 있으면 불러오기
    if (preset.announcements && preset.announcements.length > 0) {
      const loadAnnouncements = confirm(
        `프리셋에 저장된 공지사항 ${preset.announcements.length}개를 불러올까요?\n(기존 공지사항은 유지됩니다)`
      );

      if (loadAnnouncements) {
        for (const a of preset.announcements) {
          try {
            const id = await addAnnouncementToFirestore({
              type: a.type,
              title: a.title,
              content: a.content,
              questionNumber: a.questionNumber,
            });
            setAnnouncements((prev) => [
              {
                id,
                type: a.type,
                title: a.title,
                content: a.content,
                questionNumber: a.questionNumber,
                timestamp: new Date(),
              },
              ...prev,
            ]);
          } catch (error) {
            console.error("Error adding announcement:", error);
          }
        }
      }
    }
  }

  async function handleDeletePreset(id: string) {
    try {
      await deletePresetFromFirestore(id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
    } catch (error) {
      console.error("Error deleting preset:", error);
      alert("프리셋 삭제 중 오류가 발생했습니다.");
    }
  }

  async function handleAddAnnouncement() {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    try {
      const id = await addAnnouncementToFirestore({
        type: newAnnouncement.type,
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        questionNumber: newAnnouncement.questionNumber
          ? parseInt(newAnnouncement.questionNumber)
          : undefined,
      });

      setAnnouncements((prev) => [
        {
          id,
          type: newAnnouncement.type,
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          questionNumber: newAnnouncement.questionNumber
            ? parseInt(newAnnouncement.questionNumber)
            : undefined,
          timestamp: new Date(),
        },
        ...prev,
      ]);

      setNewAnnouncement({
        type: "info",
        title: "",
        content: "",
        questionNumber: "",
      });
    } catch (error) {
      console.error("Error adding announcement:", error);
      alert("공지사항 추가 중 오류가 발생했습니다.");
    }
  }

  async function handleDeleteAnnouncement(id: string) {
    try {
      await deleteAnnouncementFromFirestore(id);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    } catch (error) {
      console.error("Error deleting announcement:", error);
      alert("공지사항 삭제 중 오류가 발생했습니다.");
    }
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case "correction":
        return { label: "정정", color: "bg-orange-500" };
      case "warning":
        return { label: "주의", color: "bg-red-500" };
      default:
        return { label: "안내", color: "bg-blue-500" };
    }
  }

  function formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}시간 ${m}분`;
    if (h > 0) return `${h}시간`;
    return `${m}분`;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">시험 관리</h1>
          <Button onClick={() => router.push("/")} variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            화면 보기
          </Button>
        </div>

        {/* Presets Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              프리셋
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {presets.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center gap-1 p-2 border rounded-lg bg-muted/30"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto py-1 px-2"
                      onClick={() => handleLoadPreset(preset)}
                    >
                      <span className="font-medium">{preset.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formatDuration(preset.durationMinutes)}
                        {preset.announcements?.length > 0 && (
                          <> · 공지 {preset.announcements.length}개</>
                        )}
                      </span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleDeletePreset(preset.id)}
                    >
                      <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {presets.length === 0 && (
              <p className="text-sm text-muted-foreground">
                저장된 프리셋이 없습니다.
              </p>
            )}

            <Separator />

            <div className="flex gap-2">
              <Input
                placeholder="새 프리셋 이름 (예: 기말고사 2시간)"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSavePreset()}
              />
              <Button onClick={handleSavePreset} variant="secondary">
                <Save className="w-4 h-4 mr-2" />
                현재 설정 저장
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exam Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              시험 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">시험명</Label>
                <Input
                  id="name"
                  placeholder="2024학년도 2학기 기말고사"
                  value={exam.name}
                  onChange={(e) => handleExamChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">과목</Label>
                <Input
                  id="subject"
                  placeholder="자료구조"
                  value={exam.subject}
                  onChange={(e) => handleExamChange("subject", e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">시작 시간</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={exam.startTime}
                  onChange={(e) => handleExamChange("startTime", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">종료 시간</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={exam.endTime}
                  onChange={(e) => handleExamChange("endTime", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="earlyExitTime">중도퇴실 가능 시간</Label>
                <Input
                  id="earlyExitTime"
                  type="datetime-local"
                  value={exam.earlyExitTime}
                  onChange={(e) => handleExamChange("earlyExitTime", e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveExam} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                저장
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Announcements Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              공지사항
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>유형</Label>
                  <Select
                    value={newAnnouncement.type}
                    onValueChange={(v) =>
                      setNewAnnouncement((prev) => ({
                        ...prev,
                        type: v as "info" | "warning" | "correction",
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">안내</SelectItem>
                      <SelectItem value="warning">주의</SelectItem>
                      <SelectItem value="correction">문제 정정</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>제목</Label>
                  <Input
                    placeholder="공지 제목"
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                  />
                </div>
                {newAnnouncement.type === "correction" && (
                  <div className="space-y-2">
                    <Label>문제 번호</Label>
                    <Input
                      type="number"
                      placeholder="5"
                      value={newAnnouncement.questionNumber}
                      onChange={(e) =>
                        setNewAnnouncement((prev) => ({
                          ...prev,
                          questionNumber: e.target.value,
                        }))
                      }
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>내용</Label>
                <Textarea
                  placeholder="공지 내용을 입력하세요"
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddAnnouncement}>
                  <Plus className="w-4 h-4 mr-2" />
                  추가
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              {announcements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  등록된 공지사항이 없습니다
                </div>
              ) : (
                announcements.map((a) => {
                  const typeInfo = getTypeLabel(a.type);
                  return (
                    <div
                      key={a.id}
                      className="flex items-start justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                          <span className="font-medium">{a.title}</span>
                          {a.questionNumber && (
                            <Badge variant="outline">{a.questionNumber}번</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {a.timestamp.toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {a.content}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAnnouncement(a.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
