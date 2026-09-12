import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInAnonymously, type Auth, type User } from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes, type FirebaseStorage } from 'firebase/storage';

export type CloudJob = {
  id?: string;
  customerName: string;
  phone: string;
  address: string;
  type: string;
  date: string;
  worker: string;
  memo: string;
  checklist: Record<string, boolean>;
  beforePhotos: string[];
  afterPhotos: string[];
  signer: string;
  signature: string;
  signedAt: string;
  summary: string;
  status: '진행 중'|'완료';
  createdAt?: unknown;
  updatedAt?: unknown;
  ownerUid?: string;
};

const env = import.meta.env;
export const firebaseConfigured = Boolean(
  env.VITE_FIREBASE_API_KEY &&
  env.VITE_FIREBASE_AUTH_DOMAIN &&
  env.VITE_FIREBASE_PROJECT_ID &&
  env.VITE_FIREBASE_STORAGE_BUCKET &&
  env.VITE_FIREBASE_APP_ID
);

let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (firebaseConfigured) {
  const app = getApps()[0] ?? initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
  });
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export async function ensureUser(): Promise<User | null> {
  if (!auth) return null;
  if (auth.currentUser) return auth.currentUser;
  const credential = await signInAnonymously(auth);
  return credential.user;
}

export async function createCloudJob(data: Omit<CloudJob,'id'|'createdAt'|'updatedAt'|'ownerUid'>) {
  if (!db) return null;
  const user = await ensureUser();
  const r = await addDoc(collection(db,'jobs'), {
    ...data,
    ownerUid: user?.uid ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return r.id;
}

export async function saveCloudJob(id: string, data: Omit<CloudJob,'id'|'createdAt'|'updatedAt'|'ownerUid'>) {
  if (!db) return;
  const user = await ensureUser();
  await setDoc(doc(db,'jobs',id), {
    ...data,
    ownerUid: user?.uid ?? null,
    updatedAt: serverTimestamp(),
  }, {merge:true});
}

export async function listCloudJobs(): Promise<CloudJob[]> {
  if (!db) return [];
  await ensureUser();
  const q = query(collection(db,'jobs'), orderBy('updatedAt','desc'), limit(20));
  const snap = await getDocs(q);
  return snap.docs.map(d=>({id:d.id, ...(d.data() as CloudJob)}));
}

export async function uploadJobPhoto(jobId: string, phase: 'before'|'after', file: File) {
  if (!storage) throw new Error('Firebase Storage가 구성되지 않았습니다.');
  await ensureUser();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
  const fileRef = ref(storage, `jobs/${jobId}/${phase}/${Date.now()}-${safeName}`);

  const timeout = new Promise<never>((_, reject) =>
    window.setTimeout(() => reject(new Error('Firebase Storage 응답 시간이 초과되었습니다.')), 12000)
  );

  await Promise.race([
    uploadBytes(fileRef,file,{contentType:file.type || 'image/jpeg'}),
    timeout,
  ]);
  return getDownloadURL(fileRef);
}

export const cloudAvailable = () => firebaseConfigured;
