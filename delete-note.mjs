import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAKAJN_J4Q_rFsvCGX9FQYY9pq75by11vg",
  authDomain: "casstelle.firebaseapp.com",
  projectId: "casstelle",
  storageBucket: "casstelle.firebasestorage.app",
  messagingSenderId: "982961494689",
  appId: "1:982961494689:web:15828a257c728751c72ee0",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteNote() {
  const q = query(collection(db, "love_notes"), where("title", "==", "A Letter For You"));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    console.log("No test letter found in database.");
    return;
  }
  
  for (const doc of querySnapshot.docs) {
    await deleteDoc(doc.ref);
    console.log("Deleted document " + doc.id);
  }
  console.log("Finished deleting test letters.");
  process.exit(0);
}

deleteNote().catch(console.error);
