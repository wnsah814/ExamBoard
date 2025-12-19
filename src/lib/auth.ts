import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { auth, googleProvider, db } from "./firebase";

const ADMINS_COLLECTION = "admins";
const SETTINGS_DOC = "settings";
const SETTINGS_COLLECTION = "app";

// ============ AUTH ============

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ============ ADMIN MANAGEMENT ============

export interface Admin {
  email: string;
  name: string;
  addedAt: Date;
  addedBy: string;
}

export async function isAdmin(email: string): Promise<boolean> {
  const docRef = doc(db, ADMINS_COLLECTION, email);
  const docSnap = await getDoc(docRef);
  return docSnap.exists();
}

export async function getAdmins(): Promise<Admin[]> {
  const colRef = collection(db, ADMINS_COLLECTION);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => ({
    email: doc.id,
    ...doc.data(),
    addedAt: doc.data().addedAt?.toDate() || new Date(),
  })) as Admin[];
}

export async function addAdmin(email: string, name: string, addedBy: string): Promise<void> {
  const docRef = doc(db, ADMINS_COLLECTION, email);
  await setDoc(docRef, {
    name,
    addedAt: new Date(),
    addedBy,
  });
}

export async function removeAdmin(email: string): Promise<void> {
  const docRef = doc(db, ADMINS_COLLECTION, email);
  await deleteDoc(docRef);
}

export async function getAdminCount(): Promise<number> {
  const colRef = collection(db, ADMINS_COLLECTION);
  const snapshot = await getDocs(colRef);
  return snapshot.size;
}

// ============ ADMIN PASSWORD ============

export async function getAdminPassword(): Promise<string | null> {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docSnap.data().adminPassword || null;
}

export async function setAdminPassword(password: string): Promise<void> {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC);
  await setDoc(docRef, { adminPassword: password }, { merge: true });
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const storedPassword = await getAdminPassword();
  if (!storedPassword) return false;
  return storedPassword === password;
}

// ============ FIRST TIME SETUP ============

export async function isFirstTimeSetup(): Promise<boolean> {
  const count = await getAdminCount();
  return count === 0;
}

export async function setupFirstAdmin(user: User): Promise<void> {
  if (!user.email) throw new Error("User email is required");
  await addAdmin(user.email, user.displayName || "Admin", user.email);
}
