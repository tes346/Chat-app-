
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

// MONITOR LOGIN STATUS
auth.onAuthStateChanged(user => {
    if (user) {
        // Check if user already has a name in the database
        database.ref('users/' + user.uid).once('value', snap => {
            const userData = snap.val();
            if (userData && userData.username) {
                // If they have a name, go to contacts
                showScreen('contact-screen');
                showUsers();
            } else {
                // If no name found, go to profile setup
                showScreen('profile-screen');
            }
        });
    } else {
        showScreen('login-screen');
    }
});

// HELPER TO SWITCH SCREENS
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.style.display = 'none');
    document.getElementById(id).style.display = id === 'chat-container' ? 'flex' : 'block';
}

// LOGIN / SIGNUP
document.getElementById('login-btn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    if(!email || !pass) return alert("Enter email and password");

    auth.signInWithEmailAndPassword(email, pass).catch(() => {
        auth.createUserWithEmailAndPassword(email, pass).catch(err => alert(err.message));
    });
};

// SAVE PROFILE NAME
document.getElementById('save-profile-btn').onclick = () => {
    const name = document.getElementById('display-name').value;
    if(!name) return alert("Please enter a name");

    const user = auth.currentUser;
    database.ref('users/' + user.uid).update({
        username: name,
        email: user.email,
        uid: user.uid
    }).then(() => {
        showScreen('contact-screen');
        showUsers();
    });
};

// SHOW USERS LIST
function showUsers() {
    database.ref('users').on('value', snap => {
        const div = document.getElementById('contact-buttons');
        div.innerHTML = "";
        snap.forEach(child => {
            const u = child.val();
            if (u.uid !== auth.currentUser.uid) {
                const b = document.createElement('button');
                b.innerText = u.username || u.email || "User";
                b.onclick = () => {
                    currentRoomId = [auth.currentUser.uid, u.uid].sort().join('_');
                    showScreen('chat-container');
                    loadMsgs();
                };
                div.appendChild(b);
            }
        });
    });
}

// LOAD MESSAGES
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

// SEND MESSAGE
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

// LOGOUT
document.getElementById('logout-btn').onclick = () => {
    auth.signOut().then(() => location.reload());
};
                     
