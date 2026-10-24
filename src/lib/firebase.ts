import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

// Server-side Firebase config. NEXT_PUBLIC_* vars are baked into the client bundle,
// so admin-only access is enforced via the ADMIN_KEYS env var (server process only).
const app =
  getApps()[0] ||
  initializeApp({
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  });

export const db = getFirestore(app);

export function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

export async function getAll(table: string): Promise<DocumentData[]> {
  const snap = await getDocs(collection(db, table));
  return snap.docs.map((d) => d.data());
}

export interface Row<T = DocumentData> {
  id: string;
  data: T;
}

export async function getAllWithIds<T = DocumentData>(table: string): Promise<Row<T>[]> {
  const snap = await getDocs(collection(db, table));
  return snap.docs.map((d) => ({ id: d.id, data: d.data() as T }));
}

export async function getOne(table: string, id: string): Promise<DocumentData | null> {
  const snap = await getDoc(doc(db, table, id));
  return snap.exists() ? snap.data() : null;
}

export async function putDoc(table: string, id: string, data: DocumentData): Promise<void> {
  await setDoc(doc(db, table, id), data);
}

export async function patchDoc(table: string, id: string, data: DocumentData): Promise<void> {
  await updateDoc(doc(db, table, id), data);
}

export async function removeDoc(table: string, id: string): Promise<void> {
  await deleteDoc(doc(db, table, id));
}

export type { QueryDocumentSnapshot };
