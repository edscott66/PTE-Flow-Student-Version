import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "./firebase";

export async function updateStudentActivity(activity: string) {
  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "classrooms/default/students", user.uid);

  await setDoc(ref, {
    activity,
    activityAt: Date.now()
  }, { merge: true });
}