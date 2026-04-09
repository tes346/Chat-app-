
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

window.onload = () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            document.getElementById('login-screen').style.display = "none";
            document.getElementById('contact-screen').style.display = "block";
            // Save user to database if they don't exist
            database.ref('users/' + user.uid).set({
                email: user.email,
                uid: user.uid
            });
            showContacts();
        } else {
            document.getElementById('login-screen').style.display = "block";
            document.getElementById('contact-screen').style.display = "none";
            document.getElementById('chat-container').style.display = "none";
        }
    });
};

// LOGIN / SIGNUP LOGIC
document.getElementById('login-btn').onclick = () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;

    if(!email || !pass) return alert("Fill all fields!");

    // Try to login, if user doesn't exist, it creates a new account
    auth.signInWithEmailAndPassword(email, pass).catch(() => {
        auth.createUserWithEmailAndPassword(email, pass).catch(err => alert(err.message));
    });
};

// LOGOUT LOGIC
document.getElementById('logout-btn').onclick = () => {
    auth.signOut().then(() => location.reload());
};

function showContacts() {
    database.ref('users').on('value', snap => {
        const div = document.getElementById('contact-buttons');
        div.innerHTML = "";
        snap.forEach(child => {
            const u = child.val();
            if (u.uid !== auth.currentUser.uid) {
                const b = document.createElement('button');
                b.style = "width:100%; padding:15px; margin-bottom:5px; background:white; border:1px solid #ddd;";
                b.innerText = u.email;
                b.onclick = () => {
                    currentRoomId = [auth.currentUser.uid, u.uid].sort().join('_');
                    document.getElementById('contact-screen').style.display = "none";
                    document.getElementById('chat-container').style.display = "flex";
                    loadMsgs();
                };
                div.appendChild(b);
            }
        });
    });
}

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

              
