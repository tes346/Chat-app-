
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

// --- THE CORE NAVIGATION ---
function showScreen(screenId) {
    // 1. Find every element with class 'screen' and hide it
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(s => s.classList.remove('active'));

    // 2. Show the specific screen
    const target = document.getElementById(screenId);
    if(target) {
        target.classList.add('active');
    }
}

// --- AUTH OBSERVER ---
auth.onAuthStateChanged(user => {
    if (user) {
        db.ref("users/" + user.uid).get().then(snap => {
            if (snap.exists() && snap.val().displayName) {
                showScreen('usersScreen');
                loadUserList();
            } else {
                showScreen('profileScreen');
            }
        });
    } else {
        showScreen('authScreen');
    }
});

// Update your existing functions to use showScreen()
window.login = function() {
    const email = document.getElementById("email").value;
    const pass = document.getElementById("password").value;
    auth.signInWithEmailAndPassword(email, pass).catch(e => alert(e.message));
};

window.saveProfile = function() {
    const name = document.getElementById("displayName").value;
    const user = auth.currentUser;
    if(!name) return;
    db.ref("users/" + user.uid).set({ email: user.email, displayName: name })
      .then(() => showScreen('usersScreen'));
};

function loadUserList() {
    const list = document.getElementById("userList");
    db.ref("users").on("value", snap => {
        list.innerHTML = "";
        snap.forEach(child => {
            if(child.key !== auth.currentUser.uid) {
                const b = document.createElement("button");
                b.innerText = child.val().displayName;
                b.style.width = "100%";
                b.style.marginTop = "5px";
                b.onclick = () => startChat(child.key, child.val().displayName);
                list.appendChild(b);
            }
        });
    });
}

function startChat(uid, name) {
    chatPartnerUid = uid;
    document.getElementById("chatWith").innerText = name;
    showScreen('chatScreen');
    // ... add your existing message listener here ...
}

window.backToUsers = () => showScreen('usersScreen');

window.logout = () => auth.signOut();
