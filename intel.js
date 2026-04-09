
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
const database = firebase.database();
let currentRoomId = "";

// 1. NAVIGATION LOGIC
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    const target = document.getElementById(screenId);
    if(screenId === 'chat-container') target.style.display = 'flex';
    else target.style.display = 'block';
}

// 2. AUTH OBSERVER
auth.onAuthStateChanged(user => {
    if (user) {
        // Check if user has a username in the database
        database.ref('users/' + user.uid).once('value', snap => {
            const val = snap.val();
            if (val && val.username) {
                showScreen('contact-screen');
                loadContacts();
            } else {
                showScreen('profile-screen');
            }
        });
    } else {
        showScreen('login-screen');
    }
});

// 3. LOGIN / SIGNUP
document.getElementById('login-btn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    if(!email || !pass) return alert("Fill all fields");

    auth.signInWithEmailAndPassword(email, pass).catch(() => {
        auth.createUserWithEmailAndPassword(email, pass).catch(err => alert(err.message));
    });
};

// 4. SAVE PROFILE
document.getElementById('save-profile-btn').onclick = () => {
    const name = document.getElementById('username-input').value;
    if(!name) return alert("Please enter a name");

    database.ref('users/' + auth.currentUser.uid).set({
        username: name,
        email: auth.currentUser.email,
        uid: auth.currentUser.uid
    }).then(() => {
        showScreen('contact-screen');
        loadContacts();
    });
};

// 5. LOAD CONTACTS
function loadContacts() {
    database.ref('users').on('value', snap => {
        const div = document.getElementById('contact-buttons');
        div.innerHTML = "";
        snap.forEach(child => {
            const u = child.val();
            if (u.uid !== auth.currentUser.uid) {
                const b = document.createElement('button');
                b.innerText = u.username || u.email;
                b.onclick = () => {
                    currentRoomId = [auth.currentUser.uid, u.uid].sort().join('_');
                    document.getElementById('chat-header-name').innerText = u.username;
                    showScreen('chat-container');
                    loadMsgs();
                };
                div.appendChild(b);
            }
        });
    });
}

// 6. MESSAGING
function loadMsgs() {
    database.ref('chats/' + currentRoomId).on('value', snap => {
        const box = document.getElementById('messages');
        box.innerHTML = "";
        snap.forEach(c => {
            const m = c.val();
            const d = document.createElement('div');
            d.innerText = m.text;
            d.className = m.sender === auth.currentUser.uid ? "sent" : "received";
            box.appendChild(d);
        });
        box.scrollTop = box.scrollHeight;
    });
}

document.getElementById('send-btn').onclick = () => {
    const inp = document.getElementById('user-input');
    if (!inp.value || !currentRoomId) return;
    database.ref('chats/' + currentRoomId).push({
        sender: auth.currentUser.uid,
        text: inp.value,
        timestamp: Date.now()
    });
    inp.value = "";
};

// 7. LOGOUT
document.getElementById('logout-btn').onclick = () => {
    auth.signOut().then(() => location.reload());
};
          
