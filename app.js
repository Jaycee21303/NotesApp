import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAafPQT_OGr-2vfuIr13DOOZLjrsTQCO6o",
  authDomain: "mynotesapp-54198.firebaseapp.com",
  projectId: "mynotesapp-54198",
  storageBucket: "mynotesapp-54198.firebasestorage.app",
  messagingSenderId: "875633436310",
  appId: "1:875633436310:web:2c95965b2ffcabc29a84b7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentTopicId = null;

async function loadTopics() {
  const list = document.getElementById("topics");
  list.innerHTML = "";
  const snap = await getDocs(collection(db, "topics"));
  snap.forEach(docu => {
    const li = document.createElement("li");
    li.textContent = docu.data().name;
    li.onclick = () => selectTopic(docu.id, docu.data().name);
    if (docu.id === currentTopicId) li.classList.add("active");
    list.appendChild(li);
  });
}

async function selectTopic(id, name) {
  currentTopicId = id;
  document.getElementById("topicTitle").textContent = name;
  document.getElementById("addNoteBtn").classList.remove("hidden");
  loadNotes();
  loadTopics();
}

async function loadNotes() {
  const container = document.getElementById("notes");
  container.innerHTML = "";
  if (!currentTopicId) return;
  const snap = await getDocs(collection(db, "topics", currentTopicId, "notes"));
  snap.forEach(docu => {
    const n = document.createElement("div");
    n.className = "note";
    n.textContent = docu.data().text;
    container.appendChild(n);
  });
}

document.getElementById("addTopicBtn").onclick = async () => {
  const name = prompt("Topic name:");
  if (!name) return;
  await addDoc(collection(db, "topics"), { name });
  loadTopics();
};

document.getElementById("addNoteBtn").onclick = async () => {
  const text = prompt("Note text:");
  if (!text) return;
  await addDoc(collection(db, "topics", currentTopicId, "notes"), { text });
  loadNotes();
};

loadTopics();
