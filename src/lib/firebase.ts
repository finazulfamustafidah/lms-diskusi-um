import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { DiscussionSession, DiscussionPost } from "../types";
import { initialSessions, initialPosts } from "../data/initialData";

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Target Firestore Database ID
const databaseId = (firebaseConfig as any).firestoreDatabaseId || "(default)";
export const db = getFirestore(app, databaseId);

// Collection References
export const SESSIONS_COLLECTION = "sessions";
export const POSTS_COLLECTION = "posts";

/**
 * Deep sanitization to remove any `undefined` values, which Firestore rejects.
 */
function sanitizeForFirestore<T>(data: T): T {
  const sanitize = (obj: any): any => {
    if (obj === undefined) {
      return null;
    }
    if (obj === null) {
      return null;
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (typeof obj === "object") {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = sanitize(value);
        }
      }
      return cleaned;
    }
    return obj;
  };
  return sanitize(data);
}

/**
 * Seed default initial sessions if Firestore collections are empty.
 * Postings are NOT seeded automatically so students can create their own posts from scratch.
 */
export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    const sessionsSnapshot = await getDocs(collection(db, SESSIONS_COLLECTION));
    if (sessionsSnapshot.empty) {
      console.log("Seeding initial sessions to Firestore...");
      const batch = writeBatch(db);
      for (const session of initialSessions) {
        const sessionRef = doc(db, SESSIONS_COLLECTION, session.id);
        batch.set(sessionRef, session);
      }
      await batch.commit();
    }

    // Clean up any legacy default mock posts (post-1, post-2, post-3, post-4) if they exist
    const mockIds = ["post-1", "post-2", "post-3", "post-4"];
    for (const mockId of mockIds) {
      try {
        const postRef = doc(db, POSTS_COLLECTION, mockId);
        await deleteDoc(postRef);
      } catch {
        // ignore if not present
      }
    }
  } catch (err) {
    console.error("Error initializing data in Firestore:", err);
  }
}

/**
 * Delete all posts from Firestore (for clean reset)
 */
export async function clearAllPostsFromFirestore(): Promise<void> {
  const postsSnapshot = await getDocs(collection(db, POSTS_COLLECTION));
  if (!postsSnapshot.empty) {
    const batch = writeBatch(db);
    postsSnapshot.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  }
}

/**
 * Real-time listener for Sessions
 */
export function subscribeToSessions(callback: (sessions: DiscussionSession[]) => void) {
  const q = query(collection(db, SESSIONS_COLLECTION));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback(initialSessions);
        return;
      }
      const list: DiscussionSession[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as DiscussionSession);
      });
      // Sort sessions by ID or predefined order
      list.sort((a, b) => a.id.localeCompare(b.id));
      callback(list);
    },
    (err) => {
      console.error("Firestore sessions snapshot error:", err);
    }
  );
}

/**
 * Real-time listener for Posts
 */
export function subscribeToPosts(callback: (posts: DiscussionPost[]) => void) {
  const q = query(collection(db, POSTS_COLLECTION));
  return onSnapshot(
    q,
    (snapshot) => {
      if (snapshot.empty) {
        callback([]);
        return;
      }
      const list: DiscussionPost[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as DiscussionPost);
      });
      callback(list);
    },
    (err) => {
      console.error("Firestore posts snapshot error:", err);
    }
  );
}

/**
 * Add or Save a Post to Firestore
 */
export async function savePostToFirestore(post: DiscussionPost): Promise<void> {
  const cleaned = sanitizeForFirestore(post);
  const postRef = doc(db, POSTS_COLLECTION, post.id);
  await setDoc(postRef, cleaned);
}

/**
 * Update an existing Post in Firestore
 */
export async function updatePostInFirestore(postId: string, data: Partial<DiscussionPost>): Promise<void> {
  const cleaned = sanitizeForFirestore(data);
  const postRef = doc(db, POSTS_COLLECTION, postId);
  await updateDoc(postRef, cleaned);
}

/**
 * Delete a Post from Firestore
 */
export async function deletePostFromFirestore(postId: string): Promise<void> {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  await deleteDoc(postRef);
}

/**
 * Add a Session to Firestore
 */
export async function saveSessionToFirestore(session: DiscussionSession): Promise<void> {
  const cleaned = sanitizeForFirestore(session);
  const sessionRef = doc(db, SESSIONS_COLLECTION, session.id);
  await setDoc(sessionRef, cleaned);
}

/**
 * Update a Session status or data in Firestore
 */
export async function updateSessionInFirestore(
  sessionId: string,
  data: Partial<DiscussionSession>
): Promise<void> {
  const cleaned = sanitizeForFirestore(data);
  const sessionRef = doc(db, SESSIONS_COLLECTION, sessionId);
  await updateDoc(sessionRef, cleaned);
}
