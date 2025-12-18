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
  saveExam,
  loadExam,
  saveAnnouncements,
  loadAnnouncements,
  generateId,
  type ExamData,
  type AnnouncementData,
} from "@/lib/storage";
import { Trash2, Plus, Eye, Clock, Bell } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();

  // Exam form state
  const [exam, setExam] = useState<ExamData>({
    name: "",
    subject: "",
    startTime: "",
    endTime: "",
    earlyExitTime: "",
  });

  // Announcements state
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);

  // New announcement form
  const [newAnnouncement, setNewAnnouncement] = useState({
    type: "info" as "info" | "warning" | "correction",
    title: "",
    content: "",
    questionNumber: "",
  });

  // Load saved data on mount
  useEffect(() => {
    const savedExam = loadExam();
    if (savedExam) {
      setExam(savedExam);
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

    const savedAnnouncements = loadAnnouncements();
    setAnnouncements(savedAnnouncements);
  }, []);

  function formatDateTimeLocal(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function handleExamChange(field: keyof ExamData, value: string) {
    setExam((prev) => ({ ...prev, [field]: value }));
  }

  function handleSaveExam() {
    saveExam({
      ...exam,
      earlyExitTime: exam.earlyExitTime || null,
    });
    alert("시험 정보가 저장되었습니다.");
  }

  function handleAddAnnouncement() {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    const announcement: AnnouncementData = {
      id: generateId(),
      type: newAnnouncement.type,
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      questionNumber: newAnnouncement.questionNumber
        ? parseInt(newAnnouncement.questionNumber)
        : undefined,
      timestamp: new Date().toISOString(),
    };

    const updated = [announcement, ...announcements];
    setAnnouncements(updated);
    saveAnnouncements(updated);

    // Reset form
    setNewAnnouncement({
      type: "info",
      title: "",
      content: "",
      questionNumber: "",
    });
  }

  function handleDeleteAnnouncement(id: string) {
    const updated = announcements.filter((a) => a.id !== id);
    setAnnouncements(updated);
    saveAnnouncements(updated);
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
                  onChange={(e) =>
                    handleExamChange("startTime", e.target.value)
                  }
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
                  value={exam.earlyExitTime || ""}
                  onChange={(e) =>
                    handleExamChange("earlyExitTime", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveExam}>저장</Button>
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
            {/* Add new announcement */}
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

            {/* Announcement list */}
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
                            <Badge variant="outline">
                              {a.questionNumber}번
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(a.timestamp).toLocaleTimeString("ko-KR", {
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
