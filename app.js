import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
    const data = docu.data();

    const li = document.createElement("li");
    li.className = "topic-item";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = data.name;
    nameSpan.onclick = () => selectTopic(docu.id, data.name);

    const editBtn = document.createElement("span");
    editBtn.innerHTML = "✏️";
    editBtn.onclick = async () => {
      const newName = prompt("Rename topic:", data.name);
      if (newName) {
        await updateDoc(doc(db, "topics", docu.id), { name: newName });
        if (currentTopicId === docu.id) {
          document.getElementById("topicTitle").textContent = newName;
        }
        loadTopics();
      }
    };

    const deleteBtn = document.createElement("span");
    deleteBtn.innerHTML = "❌";
    deleteBtn.style.color = "#888";
    deleteBtn.onclick = async () => {
      if (confirm("Delete entire topic and notes?")) {
        const notesSnap = await getDocs(collection(db, "topics", docu.id, "notes"));
        for (let n of notesSnap.docs) {
          await deleteDoc(doc(db, "topics", docu.id, "notes", n.id));
        }
        await deleteDoc(doc(db, "topics", docu.id));

        if (currentTopicId === docu.id) {
          currentTopicId = null;
          document.getElementById("topicTitle").textContent = "Select a topic";
          document.getElementById("notes").innerHTML = "";
          document.getElementById("addNoteBtn").classList.add("hidden");
        }
        loadTopics();
      }
    };

    li.appendChild(nameSpan);
    li.appendChild(editBtn);
    li.appendChild(deleteBtn);

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
    const data = docu.data();

    const noteDiv = document.createElement("div");
    noteDiv.className = "note";

    const text = document.createElement("div");
    text.textContent = data.text;

    const editBtn = document.createElement("span");
    editBtn.innerHTML = "✏️";
    editBtn.style.marginRight = "10px";
    editBtn.onclick = async () => {
      const newText = prompt("Edit note:", data.text);
      if (newText) {
        await updateDoc(doc(db, "topics", currentTopicId, "notes", docu.id), { text: newText });
        loadNotes();
      }
    };

    const deleteBtn = document.createElement("span");
    deleteBtn.innerHTML = "❌";
    deleteBtn.style.color = "#888";
    deleteBtn.onclick = async () => {
      if (confirm("Delete this note?")) {
        await deleteDoc(doc(db, "topics", currentTopicId, "notes", docu.id));
        loadNotes();
      }
    };

    noteDiv.appendChild(text);
    noteDiv.appendChild(editBtn);
    noteDiv.appendChild(deleteBtn);
    container.appendChild(noteDiv);
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
