
// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCkK8FYqYgwcZTgbhEIG-3q0D5BkBL_Qj4",
  authDomain: "chat-app-72173.firebaseapp.com",
  databaseURL: "https://chat-app-72173-default-rtdb.firebaseio.com",
  projectId: "chat-app-72173",
  storageBucket: "chat-app-72173.firebasestorage.app",
  messagingSenderId: "350285511724",
  appId: "1:350285511724:web:84c0128616b2880313e589",
  measurementId: "G-RHBBRTWLVY",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

let chatPartnerUid = null;

// --- NAVIGATION ENGINE ---
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// --- AUTH ACTIONS ---
window.signUp = function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => showScreen('profileScreen'))
        .catch(err => alert(err.message));
};

window.login = function() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    auth.signInWithEmailAndPassword(email, password)
        .then(() => { /* logic handled by onAuthStateChanged */ })
        .catch(err => alert(err.message));
};

window.logout = function() {
    auth.signOut().then(() => showScreen('authScreen'));
};

// --- PROFILE & USERS ---
window.saveProfile = function() {
    const user = auth.currentUser;
    const displayName = document.getElementById("displayName").value;
    if (!displayName) return alert("Enter a name!");

    db.ref("users/" + user.uid).set({ email: user.email, displayName })
      .then(() => showScreen('usersScreen'));
};

function showUsers() {
    const listDiv = document.getElementById("userList");
    db.ref("users").on("value", snapshot => {
        listDiv.innerHTML = "";
        snapshot.forEach(child => {
            if (child.key !== auth.currentUser.uid) {
                const btn = document.createElement("button");
                btn.className = "btn-secondary";
                btn.style.width = "100%";
                btn.style.marginBottom = "5px";
                btn.innerText = child.val().displayName;
                btn.onclick = () => startChat(child.key, child.val().displayName);
                listDiv.appendChild(btn);
            }
        });
    });
}

// --- CHAT LOGIC ---
function startChat(uid, name) {
    chatPartnerUid = uid;
    document.getElementById("chatWith").innerText = name;
    document.getElementById("messages").innerHTML = "";
    showScreen('chatScreen');
    
    const userUid = auth.currentUser.uid;
    db.ref("chats").child(userUid).child(chatPartnerUid).on("child_added", snap => {
        const msg = snap.val();
        const div = document.createElement("div");
        div.style.alignSelf = msg.sender === userUid ? "flex-end" : "flex-start";
        div.style.background = msg.sender === userUid ? "#dcf8c6" : "white";
        div.style.padding = "8px";
        div.style.borderRadius = "8px";
        div.innerText = msg.text;
        document.getElementById("messages").appendChild(div);
    });
}

window.sendMessage = function() {
    const input = document.getElementById("messageInput");
    const text = input.value;
    if(!text) return;
    
    const msgData = { sender: auth.currentUser.uid, text: text, time: Date.now() };
    db.ref("chats").child(auth.currentUser.uid).child(chatPartnerUid).push(msgData);
    db.ref("chats").child(chatPartnerUid).child(auth.currentUser.uid).push(msgData);
    input.value = "";
};

window.backToUsers = function() { showScreen('usersScreen'); };

// --- OBSERVER (The Brain) ---
auth.onAuthStateChanged(user => {
    if (user) {
        db.ref("users/" + user.uid).get().then(snap => {
            if (snap.exists()) {
                showScreen('usersScreen');
                showUsers();
            } else {
                showScreen('profileScreen');
            }
        });
    } else {
        showScreen('authScreen');
    }
});
