// 1. YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCkK8FYqYgwcZTgbhEIG-3qOD5BkBL_Qj4",
  authDomain: "chat-app-72173.firebaseapp.com",
  projectId: "chat-app-72173",
  storageBucket: "chat-app-72173.firebasestorage.app",
  messagingSenderId: "350285511724",
  appId: "1:350285511724:web:84c0128616b2880313e589",
  measurementId: "G-RHBBRTWLVY",
  databaseURL: "https://chat-app-72173-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

let currentRoomId = "";

// --- WAIT FOR PAGE TO LOAD ---
window.onload = () => {
    const loginScreen = document.getElementById('login-screen');
    const contactScreen = document.getElementById('contact-screen');
    const chatContainer = document.getElementById('chat-container');

    // --- THE "REMEMBER ME" PROCESS ---
    auth.onAuthStateChanged((user) => {
        if (user) {
            loginScreen.style.display = "none";
            showContactList(); 
        } else {
            loginScreen.style.display = "block";
            contactScreen.style.display = "none";
            chatContainer.style.display = "none";
        }
    });

    // Setup Recaptcha
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible'
    });
};

// --- LOGIN FUNCTIONS ---
document.getElementById('send-otp-btn').onclick = () => {
    const phoneNumber = document.getElementById('phone-number').value;
    if(!phoneNumber) return alert("Enter a number!");

    auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
        .then((confirmationResult) => {
            window.confirmationResult = confirmationResult;
            document.getElementById('otp-section').style.display = "block";
            alert("Code sent!");
        }).catch((error) => alert("Error: " + error.message));
};

document.getElementById('verify-otp-btn').onclick = () => {
    const code = document.getElementById('otp-code').value;
    confirmationResult.confirm(code).then((result) => {
        database.ref('users/' + result.user.uid).set({
            phoneNumber: result.user.phoneNumber,
            lastSeen: Date.now()
        });
    }).catch(() => alert("Invalid Code"));
};

// --- CONTACT LIST ---
function showContactList() {
    document.getElementById('contact-screen').style.display = "block";
    document.getElementById('chat-container').style.display = "none";
    
    const contactButtons = document.getElementById('contact-buttons');
    contactButtons.innerHTML = "Loading users..."; 

    database.ref('users').on('value', (snapshot) => {
        contactButtons.innerHTML = ""; 
        snapshot.forEach((childSnapshot) => {
            const friend = childSnapshot.val();
            if (friend.phoneNumber !== auth.currentUser.phoneNumber) {
                const btn = document.createElement('button');
                btn.style = "width:100%; padding:15px; margin-bottom:10px; border-radius:10px; border:1px solid #ddd; background:white; cursor:pointer;";
                btn.innerHTML = "👤 " + friend.phoneNumber;
                btn.onclick = () => openPrivateChat(friend.phoneNumber);
                contactButtons.appendChild(btn);
            }
        });
    });

    document.getElementById('logout-btn').onclick = () => {
        auth.signOut().then(() => location.reload());
    };
}

// --- PRIVATE CHAT ROOMS ---
function openPrivateChat(friendNumber) {
    const myNumber = auth.currentUser.phoneNumber;
    const ids = [myNumber, friendNumber].sort();
    currentRoomId = ids[0].replace(/\D/g, '') + "_" + ids[1].replace(/\D/g, '');

    document.getElementById('contact-screen').style.display = "none";
    document.getElementById('chat-container').style.display = "flex";
    
    loadMessages();
}

function loadMessages() {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = ""; 

    database.ref('chats/' + currentRoomId).off();
    database.ref('chats/' + currentRoomId).on('child_added', (snapshot) => {
        const data = snapshot.val();
        const msg = document.createElement('div');
        msg.style = data.sender === auth.currentUser.phoneNumber ? 
            "text-align:right; color:#075E54; margin:10px; padding:8px; background:#dcf8c6; border-radius:10px;" : 
            "text-align:left; color:#000; margin:10px; padding:8px; background:#fff; border-radius:10px; border:1px solid #ddd;";
        msg.textContent = data.text;
        messagesDiv.appendChild(msg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}

// --- SENDING ---
document.getElementById('send-btn').onclick = () => {
    const input = document.getElementById('user-input');
    if (input.value.trim() !== "") {
        database.ref('chats/' + currentRoomId).push({
            text: input.value,
            sender: auth.currentUser.phoneNumber,
            timestamp: Date.now()
        });
        input.value = "";
    }
};
