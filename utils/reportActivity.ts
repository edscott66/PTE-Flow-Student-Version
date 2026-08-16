import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase"; // adjust path to your firebase init
import { auth } from "../services/firebase"; // adjust if you store auth differently

export const reportActivity = async (
  event: string,
  data: any = {}
) => {
  try {
    const studentId = auth.currentUser?.uid;
    if (!studentId) return;

    await addDoc(
      collection(db, "students", studentId, "activity"),
      {
        event,
        data,
        timestamp: serverTimestamp()
      }
    );
  } catch (e) {
    console.log("Failed to report activity:", e);
  }
};