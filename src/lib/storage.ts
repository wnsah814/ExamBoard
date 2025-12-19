import type { ExamInfo, Announcement } from "@/types/exam";

const EXAM_KEY = "examboard-exam";
const ANNOUNCEMENTS_KEY = "examboard-announcements";
const PRESETS_KEY = "examboard-presets";

export interface ExamData {
  name: string;
  subject: string;
  startTime: string; // ISO string
  endTime: string;
  earlyExitTime: string | null;
}

export interface AnnouncementData {
  id: string;
  type: "info" | "warning" | "correction";
  title: string;
  content: string;
  questionNumber?: number;
  timestamp: string; // ISO string
}

export function saveExam(exam: ExamData): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(EXAM_KEY, JSON.stringify(exam));
  }
}

export function loadExam(): ExamData | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(EXAM_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function saveAnnouncements(announcements: AnnouncementData[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
  }
}

export function loadAnnouncements(): AnnouncementData[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(ANNOUNCEMENTS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Convert storage data to app types
export function toExamInfo(data: ExamData): ExamInfo {
  return {
    name: data.name,
    subject: data.subject,
    location: "", // not used anymore
    startTime: new Date(data.startTime),
    endTime: new Date(data.endTime),
    earlyExitTime: data.earlyExitTime ? new Date(data.earlyExitTime) : null,
  };
}

export function toAnnouncements(data: AnnouncementData[]): Announcement[] {
  return data.map((a) => ({
    ...a,
    timestamp: new Date(a.timestamp),
  }));
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Presets
export interface PresetData {
  id: string;
  name: string;
  examName: string;
  subject: string;
  durationMinutes: number; // 시험 시간 (분)
  earlyExitMinutes: number | null; // 시작 후 몇 분 뒤 중도퇴실 가능
}

export function savePresets(presets: PresetData[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  }
}

export function loadPresets(): PresetData[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(PRESETS_KEY);
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}
