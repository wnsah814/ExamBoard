export interface ExamInfo {
  name: string;
  subject: string;
  location: string;
  startTime: Date;
  endTime: Date;
  earlyExitTime: Date | null;
}

export interface Announcement {
  id: string;
  type: "info" | "warning" | "correction";
  title: string;
  content: string;
  questionNumber?: string;
  timestamp: Date;
  order: number;
}
