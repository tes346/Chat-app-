// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCkK8FYqYgwcZTgbhEIG-3q0D5BkBL_Qj4",
  authDomain: "chat-app-72173.firebaseapp.com",
  databaseURL: "https://chat-app-72173-default-rtdb.firebaseio.com",
  projectId: "chat-app-72173",
  storageBucket: "chat-app-72173.firebasestorage.app",
  messagingSenderId: "350285511724",
  appId: "1:350285511724:web:84c0128616b2880313e589",
  measurementId: "G-RHBBRTWLVY"
};
    databaseURL: "https://chat-app-72173-default-rtdb.firebaseio.com"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
let currentRoomId = "";

// 2. PAGE LOAD LOGIC
window.onload = () => {
    const loginScreen = document.getElementById('login-screen');
    const contactScreen = document.getElementById('contact-screen');
    const profileSetup = document.getElementById('profile-setup');

    auth.onAuthStateChanged((user) => {
        if (user) {
            loginScreen.style.display = "none";
            database.ref('users/' + user.uid).once('value', (snapshot) => {
                if (snapshot.exists() && snapshot.val().displayName) {
                    showContactList();
                } else {
                    profileSetup.style.display = "block";
                }
            });
        } else {
            loginScreen.style.display = "block";
            contactScreen.style.display = "none";
        }
    });

    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', { 'size': 'invisible' });
};

// 3. SEND MESSAGE LOGIC (The part that was failing)
document.getElementById('send-msg-btn').onclick = () => {
    const msgInput = document.getElementById('msg-input');
    const text = msgInput.value.trim();
    if (!text || !currentRoomId) return;

    database.ref('chats/' + currentRoomId).push({
        sender: auth.currentUser.phoneNumber,
        text: text,
        timestamp: Date.now()
    }).then(() => {
        msgInput.value = ""; // Clears the box
    });
};

// 4. CONTACTS & LOGIN FUNCTIONS
function showContactList() {
    document.getElementById('contact-screen').style.display = "block";
    const contactButtons = document.getElementById('contact-buttons');
    
    database.ref('users').on('value', (snapshot) => {
        contactButtons.innerHTML = "";
        snapshot.forEach((child) => {
            const friend = child.val();
            if (friend.phoneNumber !== auth.currentUser.phoneNumber) {
                const btn = document.createElement('button');
                btn.className = "contact-btn"; // Make sure this CSS exists or style manually
                btn.innerHTML = `<b>${friend.displayName || friend.phoneNumber}</b>`;
                btn.onclick = () => openPrivateChat(friend.phoneNumber);
                contactButtons.appendChild(btn);
            }
        });
    });
}

function openPrivateChat(friendPhone) {
    const userPhone = auth.currentUser.phoneNumber;
    currentRoomId = [userPhone, friendPhone].sort().join('_');
    document.getElementById('contact-screen').style.display = "none";
    document.getElementById('chat-container').style.display = "flex";
    loadMessages();
}

function loadMessages() {
    const chatBox = document.getElementById('chat-box');
    database.ref('chats/' + currentRoomId).on('value', (snapshot) => {
        chatBox.innerHTML = "";
        snapshot.forEach((child) => {
            const msg = child.val();
            const div = document.createElement('div');
            div.innerText = msg.text;
            div.className = msg.sender === auth.currentUser.phoneNumber ? "sent" : "received";
            chatBox.appendChild(div);
        });
    });
}

// LOGIN BUTTONS
document.getElementById('send-otp-btn').onclick = () => {
    const phone = document.getElementById('phone-number').value;
    auth.signInWithPhoneNumber(phone, window.recaptchaVerifier)
        .then(res => { window.confirmationResult = res; document.getElementById('otp-section').style.display = "block"; });
};

document.getElementById('verify-otp-btn').onclick = () => {
    const code = document.getElementById('otp-code').value;
    window.confirmationResult.confirm(code);
};

document.getElementById('save-profile-btn').onclick = () => {
    const name = document.getElementById('display-name').value;
    database.ref('users/' + auth.currentUser.uid).update({
        displayName: name,
        phoneNumber: auth.currentUser.phoneNumber
    }).then(() => {
        document.getElementById('profile-setup').style.display = "none";
        showContactList();
    });
};
      
