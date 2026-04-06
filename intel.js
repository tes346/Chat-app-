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


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
let currentRoomId = "";

// 2. APP INITIALIZATION
window.onload = () => {
    const loginScreen = document.getElementById('login-screen');
    const contactScreen = document.getElementById('contact-screen');
    const profileSetup = document.getElementById('profile-setup');

    auth.onAuthStateChanged((user) => {
        if (user) {
            loginScreen.style.display = "none";
            // Verify if user has a profile name saved
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

    // Setup Invisible Recaptcha
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', { 
        'size': 'invisible' 
    });
};

// 3. LOGIN & AUTH FUNCTIONS
document.getElementById('send-otp-btn').onclick = () => {
    const phone = document.getElementById('phone-number').value;
    if (!phone) return alert("Enter your phone number!");

    auth.signInWithPhoneNumber(phone, window.recaptchaVerifier)
        .then(confirmationResult => {
            window.confirmationResult = confirmationResult;
            document.getElementById('otp-section').style.display = "block";
        }).catch(err => alert("Error: " + err.message));
};

document.getElementById('verify-otp-btn').onclick = () => {
    const code = document.getElementById('otp-code').value;
    window.confirmationResult.confirm(code).catch(() => alert("Invalid OTP Code"));
};

document.getElementById('save-profile-btn').onclick = () => {
    const name = document.getElementById('display-name').value;
    if (!name) return alert("Please enter a name");
    
    database.ref('users/' + auth.currentUser.uid).set({
        displayName: name,
        phoneNumber: auth.currentUser.phoneNumber
    }).then(() => {
        document.getElementById('profile-setup').style.display = "none";
        showContactList();
    });
};

// 4. CHAT & CONTACTS LOGIC
function showContactList() {
    document.getElementById('contact-screen').style.display = "block";
    const contactButtons = document.getElementById('contact-buttons');
    
    database.ref('users').on('value', (snapshot) => {
        contactButtons.innerHTML = "";
        snapshot.forEach((child) => {
            const friend = child.val();
            // Don't show yourself in the list
            if (friend.phoneNumber !== auth.currentUser.phoneNumber) {
                const btn = document.createElement('button');
                btn.style = "background:white; color:#333; margin-bottom:10px; border:1px solid #ddd; text-align:left; display:flex; align-items:center;";
                btn.innerHTML = `<div style="width:40px; height:40px; background:#075E54; border-radius:50%; margin-right:15px; color:white; display:flex; align-items:center; justify-content:center;">${(friend.displayName || '?').charAt(0)}</div> 
                                 <div><b>${friend.displayName || friend.phoneNumber}</b><br><small style="color:gray;">Click to chat</small></div>`;
                btn.onclick = () => openPrivateChat(friend.phoneNumber, friend.displayName);
                contactButtons.appendChild(btn);
            }
        });
    });
}

function openPrivateChat(friendPhone, friendName) {
    const userPhone = auth.currentUser.phoneNumber;
    currentRoomId = [userPhone, friendPhone].sort().join('_');
    
    document.getElementById('contact-screen').style.display = "none";
    document.getElementById('chat-container').style.display = "flex";
    document.getElementById('chat-with-name').innerText = friendName || friendPhone;
    
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
        chatBox.scrollTop = chatBox.scrollHeight;
    });
}

document.getElementById('send-msg-btn').onclick = () => {
    const msgInput = document.getElementById('msg-input');
    const text = msgInput.value.trim();
    if (!text || !currentRoomId) return;

    database.ref('chats/' + currentRoomId).push({
        sender: auth.currentUser.phoneNumber,
        text: text,
        timestamp: Date.now()
    }).then(() => {
        msgInput.value = "";
    });
};

document.getElementById('logout-btn').onclick = () => {
    auth.signOut().then(() => location.reload());
};
  
