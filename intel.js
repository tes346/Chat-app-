ort Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 PASTE YOUR CONFIG HERE (replace this one)
const firebaseConfig = {
  apiKey: "AIzaSyCkK8FYqYgwcZTgbhEIG-3q0D5BkBL_Qj4",
  authDomain: "chat-app-72173.firebaseapp.com",
  projectId: "chat-app-72173",
  storageBucket: "chat-app-72173.firebasestorage.app",
  messagingSenderId: "350285511724",
  appId: "1:350285511724:web:84c0128616b2880313e589",
  measurementId: "G-RHBBRTWLVY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Simple chat ID (we improve later)
const chatId = "test_chat";

// Send message
async function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value;

  if (!text) return;

  await addDoc(collection(db, "chats", chatId, "messages"), {
    text: text,
    timestamp: new Date()
  });

  input.value = "";
}

// Make function global (important!)
window.sendMessage = sendMessage;

// Receive messages (real-time)
const q = query(
  collection(db, "chats", chatId, "messages"),
  orderBy("timestamp")
);

onSnapshot(q, (snapshot) => {
  const list = document.getElementById("messages");
  list.innerHTML = "";

  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = doc.data().text;
    list.appendChild(li);
  });
});