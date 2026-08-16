import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { scoreService } from "./scoreService";

/**
 * Listens for teacher broadcasts in the student's class.
 * Calls onBroadcast(broadcast) whenever the teacher sends or clears a broadcast.
 */
export async function listenToTeacherBroadcast(onBroadcast: (broadcast: any | null) => void) {
  const classId = await scoreService.getGroupId();
  if (!classId) {
    console.warn("[Broadcast] No classId found — student is not in a class.");
    return () => {};
  }

  const ref = doc(db, "classes", classId);

  console.log(`[Broadcast] Listening for broadcasts in class: ${classId}`);

  const unsubscribe = onSnapshot(ref, (snap) => {
    if (!snap.exists()) {
      onBroadcast(null);
      return;
    }

    const data = snap.data();
    const broadcast = data.broadcast;

    if (!broadcast || broadcast.active === false) {
      onBroadcast(null);
      return;
    }

    onBroadcast(broadcast);
  });

  return unsubscribe;
}