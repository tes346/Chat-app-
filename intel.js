// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkk8FYqYgwcZTgbhEIG-3q0D5BkBL_Qj4",
  authDomain: "chat-app-72173.firebaseapp.com",
  databaseURL: "https://chat-app-72173-default-rtdb.firebaseio.com",
  projectId: "chat-app-72173",
  storageBucket: "chat-app-72173.firebasestorage.app",
  messagingSenderId: "350285511724",
  appId: "1:350285511724:web:84c0128616b2880313e589",
  measurementId: "G-RHBBRTWLVY"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const messagesRef = database.ref('messages');

const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const messagesDiv = document.getElementById('messages');

// Sending message to Firebase
sendBtn.addEventListener('click', () => {
    const text = userInput.value;
    if (text.trim() !== "") {
        messagesRef.push({
            text: text,
            timestamp: Date.now(),
            sender: "User1" 
        });
        userInput.value = "";
    }
});

// Send message on Enter key
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});

// Receiving messages from Firebase
messagesRef.on('child_added', (snapshot) => {
    const data = snapshot.val();
    const msg = document.createElement('div');
    
    // Bubble styling
    msg.className = data.sender === "User1" ? 'message sent' : 'message received';
    msg.textContent = data.text;
    
    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});
