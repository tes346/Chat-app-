
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

// ===== Sign Up =====
window.signUp = function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const remember = document.getElementById("rememberMe").checked;
  const persistence = remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;

  auth.setPersistence(persistence)
    .then(() => auth.createUserWithEmailAndPassword(email, password))
    .then(() => {
      document.getElementById("message").innerText = "Account created successfully!";
      showProfileDiv();
    })
    .catch(err => document.getElementById("message").innerText = err.message);
};

// ===== Login =====
window.login = function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const remember = document.getElementById("rememberMe").checked;
  const persistence = remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;

  auth.setPersistence(persistence)
    .then(() => auth.signInWithEmailAndPassword(email, password))
    .then(() => {
      document.getElementById("message").innerText = "Login successful!";
      showProfileDiv();
    })
    .catch(err => document.getElementById("message").innerText = err.message);
};

// ===== Logout =====
window.logout = function() {
  auth.signOut().then(() => {
    document.getElementById("message").innerText = "Logged out!";
    document.getElementById("authDiv").style.display = "block";
    document.getElementById("profileDiv").style.display = "none";
    document.getElementById("usersDiv").style.display = "none";
    document.getElementById("chatDiv").style.display = "none";
    chatPartnerUid = null;
  });
};

// ===== Set Profile =====
window.setProfile = function() {
  const user = auth.currentUser;
  const displayName = document.getElementById("displayName").value;
  if (!displayName) return alert("Enter a display name!");

  db.ref("users/" + user.uid).set({ email: user.email, displayName })
    .then(() => {
      document.getElementById("message").innerText = "Profile saved!";
      showUsers();
    });
};

// ===== Show Profile =====
function showProfileDiv() {
  document.getElementById("authDiv").style.display = "none";
  document.getElementById("profileDiv").style.display = "block";

  const user = auth.currentUser;
  document.getElementById("userName").innerText = user.email;

  db.ref("users/" + user.uid).get().then(snap => {
    if (snap.exists()) document.getElementById("displayName").value = snap.val().displayName;
    showUsers();
  });
}

// ===== Show Users =====
function showUsers() {
  document.getElementById("usersDiv").style.display = "block";
  const listDiv = document.getElementById("userList");
  listDiv.innerHTML = "";

  db.ref("users").on("value", snapshot => {
    listDiv.innerHTML = "";
    snapshot.forEach(child => {
      const user = child.val();
      const uid = child.key;
      if (uid !== auth.currentUser.uid) {
        const btn = document.createElement("button");
        btn.innerText = user.displayName || user.email;

        // Correct click listener with closure
        btn.addEventListener("click", () => startChat(uid, user.displayName || user.email));

        listDiv.appendChild(btn);
      }
    });
  });
}

// ===== Start Chat =====
function startChat(uid, displayName) {
  chatPartnerUid = uid;
  document.getElementById("chatWith").innerText = displayName;
  document.getElementById("chatDiv").style.display = "block";
  document.getElementById("messages").innerHTML = "";

  const userUid = auth.currentUser.uid;

  // Remove old listeners if switching chats
  db.ref("chats").child(userUid).child(chatPartnerUid).off();

  // Listen for new messages
  db.ref("chats").child(userUid).child(chatPartnerUid).on("child_added", snapshot => {
    const msg = snapshot.val();
    displayMessage(msg);
  });
}

// ===== Send Message =====
function sendMessage() {
  const msgInput = document.getElementById("messageInput");
  const text = msgInput.value.trim();
  if (!text || !chatPartnerUid) return;

  const userUid = auth.currentUser.uid;
  const timestamp = Date.now();
  const messageData = { sender: userUid, text, timestamp };

  // Save message for both sender and receiver
  db.ref("chats").child(userUid).child(chatPartnerUid).push(messageData);
  db.ref("chats").child(chatPartnerUid).child(userUid).push(messageData);

  msgInput.value = "";
}

// ===== Display Message =====
function displayMessage(msg) {
  const div = document.createElement("div");
  div.style.textAlign = msg.sender === auth.currentUser.uid ? "right" : "left";
  div.innerText = msg.text;
  document.getElementById("messages").appendChild(div);
  document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
}

// ===== Close Chat =====
function closeChat() {
  document.getElementById("chatDiv").style.display = "none";
  chatPartnerUid = null;
}

// ===== Stay Logged In =====
auth.onAuthStateChanged(user => {
  if (user) showProfileDiv();
  else {
    document.getElementById("authDiv").style.display = "block";
    document.getElementById("profileDiv").style.display = "none";
    document.getElementById("usersDiv").style.display = "none";
    document.getElementById("chatDiv").style.display = "none";
    chatPartnerUid = null;
  }
});  
