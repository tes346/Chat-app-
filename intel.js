// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
    databaseURL: "https://chat-app-72173-default-rtdb.firebaseio.com"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
let currentRoomId = "";

// 1. LOGOUT LOGIC (Moved to top so it always works)
document.getElementById('logout-btn').onclick = () => {
    auth.signOut().then(() => {
        alert("Logged out successfully!");
        location.reload(); // This forces the screen back to the number step
    }).catch(err => alert("Logout failed: " + err.message));
};
// 2. APP STARTUP
window.onload = () => {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', { 'size': 'invisible' }
    auth.onAuthStateChanged(user => {
        if (user) {
            // If logged in, hide login and show contacts
            document.getElementById('login-screen').style.display = "none";
            document.getElementById('contact-screen').style.display = "block";
            showContacts();
        } else {
            // If NOT logged in, show the number step
            document.getElementById('login-screen').style.display = "block";
            document.getElementById('contact-screen').style.display = "none";
            document.getElementById('chat-container').style.display = "none";
        }
    });
};
// 3. LOGIN LOGIC
document.getElementById('send-otp-btn').onclick = () => {
    const phone = document.getElementById('phone-number').value; 
    if(!phone) return alert("Enter phone number!");

    auth.signInWithPhoneNumber(phone, window.recaptchaVerifier).then(res => {
        window.confirmationResult = res;
        document.getElementById('otp-section').style.display = "block";
    }).catch(err => alert("Error: " + err.message));
};
document.getElementById('verify-otp-btn').onclick = () => {
    const code = document.getElementById('otp-code').value;
    window.confirmationResult.confirm(code).catch(err => alert("Wrong code: " + err.message));
};
// 4. CONTACTS & MESSAGING
function showContacts() {
    database.ref('users').on('value', snap => {
        const div = document.getElementById('contact-buttons');
        div.innerHTML = "";
        snap.forEach(child => {
            const u = child.val();
            if (u.phoneNumber !== auth.currentUser.phoneNumber) {
                const b = document.createElement('button');
                b.style = "width:100%; padding:15px; margin-bottom:5px; background:white; border:1px solid #ddd; border-radius:8px;";
                b.innerText = u.displayName || u.phoneNumber;
                b.onclick = () => {
                    currentRoomId = [auth.currentUser.phoneNumber, u.phoneNumber].sort().join('_');
                    document.getElementById('contact-screen').style.display = "none";
                    document.getElementById('chat-container').style.display = "flex";
                    loadMsgs();
                };
                div.appendChild(b);
            }
        });
}

function loadMsgs() {
    database.ref('chats/' + currentRoomId).on('value', snap => {
        const box = document.getElementById('chat-box');
        box.innerHTML = "";
        snap.forEach(c => {
            const m = c.val();
            const d = document.createElement('div');
            d.innerText = m.text;
            d.className = m.sender === auth.currentUser.phoneNumber ? "sent" : "received";
            box.appendChild(d);
        });
    });
}
document.getElementById('send-msg-btn').onclick = () => {
    const inp = document.getElementById('msg-input');
    if (!inp.value || !currentRoomId) return;
    database.ref('chats/' + currentRoomId).push({
        sender: auth.currentUser.phoneNumber,
        text: inp.value,
        timestamp: Date.now()
    });
    inp.value = "";
};
      
  
