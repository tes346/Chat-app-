const firebaseConfig = {
    apiKey: "AIzaSyCkk8FYqYgwcZTgbhEIG-3q0D5BkbL_Qj4",
    authDomain: "chat-app-72173.firebaseapp.com",
    projectId: "chat-app-72173",
    storageBucket: "chat-app-72173.firebasestorage.app",
    messagingSenderId: "350285511724",
    appId: "1:350285511724:web:a61643a04b5d2d2113e589",
    measurementId: "G-BTN960VVZ1",
    databaseURL: "https://chat-app-72173-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
let currentRoomId = "";

window.onload = () => {
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', { 
        'size': 'invisible' 
    });
    
    auth.onAuthStateChanged(user => {
        if (user) {
            document.getElementById('login-screen').style.display = "none";
            showContacts();
        }
    });
};

document.getElementById('send-otp-btn').onclick = () => {
    // FIX: Added .value to get the actual number
    const phone = document.getElementById('phone-number').value; 
    
    if(!phone) return alert("Please enter a phone number");

    auth.signInWithPhoneNumber(phone, window.recaptchaVerifier)
        .then(res => {
            window.confirmationResult = res;
            document.getElementById('otp-section').style.display = "block";
        }).catch(err => alert(err.message));
};

document.getElementById('verify-otp-btn').onclick = () => {
    const code = document.getElementById('otp-code').value;
    window.confirmationResult.confirm(code).catch(err => alert(err.message));
};

function showContacts() {
    document.getElementById('contact-screen').style.display = "block";
    database.ref('users').on('value', snap => {
        const div = document.getElementById('contact-buttons');
        div.innerHTML = "";
        snap.forEach(child => {
            const u = child.val();
            if (u.phoneNumber !== auth.currentUser.phoneNumber) {
                const b = document.createElement('button');
                b.style = "width:100%; padding:10px; margin-bottom:5px;";
                b.innerText = u.displayName || u.phoneNumber;
                b.onclick = () => {
                    currentRoomId = [auth.currentUser.phoneNumber, u.phoneNumber].sort().join('_');
                    document.getElementById('contact-screen').style.display = "none";
                    document.getElementById('chat-container').style.display = "block";
                    loadMsgs();
                };
                div.appendChild(b);
            }
        });
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
            d.style = m.sender === auth.currentUser.phoneNumber ? "text-align:right; color:green;" : "text-align:left; color:black;";
            box.appendChild(d);
        });
    });
}

document.getElementById('send-msg-btn').onclick = () => {
    const inp = document.getElementById('msg-input');
    if (!inp.value || !currentRoomId) return;
    database.ref('chats/' + currentRoomId).push({
        sender: auth.currentUser.phoneNumber,
        text: inp.value
    });
    inp.value = "";
};
  
