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
  type Firestore,
} from "firebase/firestore";

/**
 * Firebase config is optional: the Firestore data provider is only active
 * when NEXT_PUBLIC_FIREBASE_* env vars are present. Everything in this
 * module is guarded so importing it without config never throws.
 */
function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

export { isFirebaseConfigured };

let db: Firestore | null = null;
function getDb(): Firestore {
  if (!db) {
    const app =
      getApps()[0] ||
      initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      });
    db = getFirestore(app);
  }
  return db;
}

export async function getAll(table: string): Promise<DocumentData[]> {
  const snap = await getDocs(collection(getDb(), table));
  return snap.docs.map((d) => d.data());
}

export interface Row<T = DocumentData> {
  id: string;
  data: T;
}

export async function getAllWithIds<T = DocumentData>(table: string): Promise<Row<T>[]> {
  const snap = await getDocs(collection(getDb(), table));
  return snap.docs.map((d) => ({ id: d.id, data: d.data() as T }));
}

export async function getOne(table: string, id: string): Promise<DocumentData | null> {
  const snap = await getDoc(doc(getDb(), table, id));
  return snap.exists() ? snap.data() : null;
}

export async function putDoc(table: string, id: string, data: DocumentData): Promise<void> {
  await setDoc(doc(getDb(), table, id), data);
}

export async function patchDoc(table: string, id: string, data: DocumentData): Promise<void> {
  await updateDoc(doc(getDb(), table, id), data);
}

export async function removeDoc(table: string, id: string): Promise<void> {
  await deleteDoc(doc(getDb(), table, id));
}
