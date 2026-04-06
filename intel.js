// 1. YOUR FIREBASE CONFIG
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
    const profileSetup = document.getElementById('profile-setup');

    auth.onAuthStateChanged((user) => {
        if (user) {
            loginScreen.style.display = "none";
            // Check if user has a name in the database
            database.ref('users/' + user.uid).once('value', (snapshot) => {
                if (snapshot.exists() && snapshot.val().displayName) {
                    profileSetup.style.display = "none";
                    showContactList();
                } else {
                    // Show setup screen if no name exists
                    profileSetup.style.display = "block";
                    contactScreen.style.display = "none";
                }
            });
        } else {
            loginScreen.style.display = "block";
            contactScreen.style.display = "none";
            profileSetup.style.display = "none";
            chatContainer.style.display = "none";
        }
    });

    // Setup Recaptcha
    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
        'size': 'invisible'
    });
};

// --- PROFILE ACTIONS ---
document.getElementById('save-profile-btn').onclick = () => {
    const name = document.getElementById('display-name').value;
    if (!name) return alert("Please enter a username!");

    database.ref('users/' + auth.currentUser.uid).update({
        displayName: name,
        phoneNumber: auth.currentUser.phoneNumber,
        photoURL: "" 
    }).then(() => {
        document.getElementById('profile-setup').style.display = "none";
        showContactList();
    });
};

// --- LOGIN FUNCTIONS ---
document.getElementById('send-otp-btn').onclick = () => {
    const phoneNumber = document.getElementById('phone-number').value;
    if (!phoneNumber) return alert("Enter a number!");

    auth.signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
        .then((confirmationResult) => {
            window.confirmationResult = confirmationResult;
            document.getElementById('otp-section').style.display = "block";
        }).catch((error) => alert(error.message));
};

document.getElementById('verify-otp-btn').onclick = () => {
    const code = document.getElementById('otp-code').value;
    window.confirmationResult.confirm(code)
        .catch(() => alert("Invalid Code"));
};

// --- CONTACT LIST ---
function showContactList() {
    document.getElementById('contact-screen').style.display = "block";
    const contactButtons = document.getElementById('contact-buttons');
    contactButtons.innerHTML = "Loading users...";

    database.ref('users').on('value', (snapshot) => {
        contactButtons.innerHTML = ""; 
        snapshot.forEach((childSnapshot) => {
            const friend = childSnapshot.val();
            if (friend.phoneNumber !== auth.currentUser.phoneNumber) {
                const btn = document.createElement('button');
                btn.style = "width:100%; padding:12px; margin-bottom:10px; border-radius:12px; border:1px solid #ddd; background:white; display:flex; align-items:center; cursor:pointer;";
                
                const nameToDisplay = friend.displayName ? friend.displayName : friend.phoneNumber;
                const firstLetter = nameToDisplay.charAt(0).toUpperCase();

                btn.innerHTML = `
                    <div style="width:45px; height:45px; background:#075E54; color:white; border-radius:50%; margin-right:15px; display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:bold; overflow:hidden;">
                        ${friend.photoURL ? `<img src="${friend.photoURL}" style="width:100%; height:100%; object-fit:cover;">` : firstLetter}
                    </div>
                    <div style="text-align:left;">
                        <div style="font-weight:bold; color:#333;">${nameToDisplay}</div>
                        <div style="font-size:12px; color:gray;">${friend.phoneNumber}</div>
                    </div>
                `;
                
                btn.onclick = () => openPrivateChat(friend.phoneNumber);
                contactButtons.appendChild(btn);
            }
        });
    });
}

document.getElementById('logout-btn').onclick = () => {
    auth.signOut().then(() => location.reload());
};

// --- PRIVATE CHAT ROOMS ---
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
            div.style = msg.sender === auth.currentUser.phoneNumber ? 
                "align-self:flex-end; background:#dcf8c6; padding:8px; margin:5px; border-radius:10px;" : 
                "align-self:flex-start; background:white; padding:8px; margin:5px; border-radius:10px; border:1px solid #ddd;";
            chatBox.appendChild(div);
        });
    });
}

document.getElementById('send-msg-btn').onclick = () => {
    const text = document.getElementById('msg-input').value;
    if (!text) return;

    database.ref('chats/' + currentRoomId).push({
        sender: auth.currentUser.phoneNumber,
        text: text,
        timestamp: Date.now()
    });
    document.getElementById('msg-input').value = "";
};
