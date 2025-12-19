import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { ExamInfo, Announcement } from "@/types/exam";

// Document IDs
const EXAM_DOC_ID = "current";
const EXAM_COLLECTION = "exams";
const ANNOUNCEMENTS_COLLECTION = "announcements";
const PRESETS_COLLECTION = "presets";

// Types for Firestore
export interface ExamDoc {
  name: string;
  subject: string;
  startTime: Timestamp;
  endTime: Timestamp;
  earlyExitTime: Timestamp | null;
  updatedAt: Timestamp;
}

export interface AnnouncementDoc {
  type: "info" | "warning" | "correction";
  title: string;
  content: string;
  questionNumber?: number;
  timestamp: Timestamp;
}

export interface PresetAnnouncement {
  type: "info" | "warning" | "correction";
  title: string;
  content: string;
  questionNumber?: number;
}

export interface PresetDoc {
  name: string;
  examName: string;
  subject: string;
  durationMinutes: number;
  earlyExitMinutes: number | null;
  announcements?: PresetAnnouncement[];
}

// ============ EXAM ============

export async function saveExamToFirestore(exam: {
  name: string;
  subject: string;
  startTime: string;
  endTime: string;
  earlyExitTime: string | null;
}): Promise<void> {
  const docRef = doc(db, EXAM_COLLECTION, EXAM_DOC_ID);
  await setDoc(docRef, {
    name: exam.name,
    subject: exam.subject,
    startTime: Timestamp.fromDate(new Date(exam.startTime)),
    endTime: Timestamp.fromDate(new Date(exam.endTime)),
    earlyExitTime: exam.earlyExitTime
      ? Timestamp.fromDate(new Date(exam.earlyExitTime))
      : null,
    updatedAt: Timestamp.now(),
  });
}

export async function loadExamFromFirestore(): Promise<ExamInfo | null> {
  const docRef = doc(db, EXAM_COLLECTION, EXAM_DOC_ID);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data() as ExamDoc;
  return {
    name: data.name,
    subject: data.subject,
    location: "",
    startTime: data.startTime.toDate(),
    endTime: data.endTime.toDate(),
    earlyExitTime: data.earlyExitTime?.toDate() || null,
  };
}

export function subscribeToExam(
  callback: (exam: ExamInfo | null) => void
): () => void {
  const docRef = doc(db, EXAM_COLLECTION, EXAM_DOC_ID);
  return onSnapshot(docRef, (docSnap) => {
    if (!docSnap.exists()) {
      callback(null);
      return;
    }
    const data = docSnap.data() as ExamDoc;
    callback({
      name: data.name,
      subject: data.subject,
      location: "",
      startTime: data.startTime.toDate(),
      endTime: data.endTime.toDate(),
      earlyExitTime: data.earlyExitTime?.toDate() || null,
    });
  });
}

// ============ ANNOUNCEMENTS ============

export async function addAnnouncementToFirestore(announcement: {
  type: "info" | "warning" | "correction";
  title: string;
  content: string;
  questionNumber?: number;
}): Promise<string> {
  const colRef = collection(db, ANNOUNCEMENTS_COLLECTION);

  // Firestore doesn't allow undefined values
  const data: Record<string, unknown> = {
    type: announcement.type,
    title: announcement.title,
    content: announcement.content,
    timestamp: Timestamp.now(),
  };

  if (announcement.questionNumber !== undefined) {
    data.questionNumber = announcement.questionNumber;
  }

  const docRef = await addDoc(colRef, data);
  return docRef.id;
}

export async function deleteAnnouncementFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, ANNOUNCEMENTS_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function loadAnnouncementsFromFirestore(): Promise<Announcement[]> {
  const colRef = collection(db, ANNOUNCEMENTS_COLLECTION);
  const q = query(colRef, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as AnnouncementDoc;
    return {
      id: doc.id,
      type: data.type,
      title: data.title,
      content: data.content,
      questionNumber: data.questionNumber,
      timestamp: data.timestamp.toDate(),
    };
  });
}

export function subscribeToAnnouncements(
  callback: (announcements: Announcement[]) => void
): () => void {
  const colRef = collection(db, ANNOUNCEMENTS_COLLECTION);
  const q = query(colRef, orderBy("timestamp", "desc"));

  return onSnapshot(q, (snapshot) => {
    const announcements = snapshot.docs.map((doc) => {
      const data = doc.data() as AnnouncementDoc;
      return {
        id: doc.id,
        type: data.type,
        title: data.title,
        content: data.content,
        questionNumber: data.questionNumber,
        timestamp: data.timestamp.toDate(),
      };
    });
    callback(announcements);
  });
}

// ============ PRESETS ============

export interface Preset {
  id: string;
  name: string;
  examName: string;
  subject: string;
  durationMinutes: number;
  earlyExitMinutes: number | null;
  announcements: PresetAnnouncement[];
}

export async function savePresetToFirestore(preset: Omit<Preset, "id">): Promise<string> {
  const colRef = collection(db, PRESETS_COLLECTION);
  const docRef = await addDoc(colRef, preset);
  return docRef.id;
}

export async function deletePresetFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, PRESETS_COLLECTION, id);
  await deleteDoc(docRef);
}

export async function loadPresetsFromFirestore(): Promise<Preset[]> {
  const colRef = collection(db, PRESETS_COLLECTION);
  const snapshot = await getDocs(colRef);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as PresetDoc;
    return {
      id: doc.id,
      name: data.name,
      examName: data.examName,
      subject: data.subject,
      durationMinutes: data.durationMinutes,
      earlyExitMinutes: data.earlyExitMinutes,
      announcements: data.announcements || [],
    };
  });
}
