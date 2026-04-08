// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

// Firebase config
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

let currentRoomId = "";

// LOGOUT
document.getElementById('logout-btn').onclick = () => {
    auth.signOut().then(() => {
        alert("Logged out successfully!");
        location.reload();
    }).catch(err => alert("Logout failed: " + err.message));
};

// APP START
window.onload = () => {

    window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
        'recaptcha-container',
        {
            size: 'normal', // 👈 change from invisible to normal (for testing)
            callback: (response) => {
                console.log("Recaptcha solved");
            }
        }
    );

    // 👇 IMPORTANT: render it
    window.recaptchaVerifier.render();

    auth.onAuthStateChanged(user => {
        if (user) {
            document.getElementById('login-screen').style.display = "none";
            document.getElementById('contact-screen').style.display = "block";
            showContacts();
        } else {
            document.getElementById('login-screen').style.display = "block";
            document.getElementById('contact-screen').style.display = "none";
            document.getElementById('chat-container').style.display = "none";
        }
    });
};

// LOGIN - SEND OTP
document.getElementById('send-otp-btn').onclick = () => {
    alert ("CLICK WORKING");

    console.log("✅ Button clicked"); // STEP 4

    const phone = document.getElementById('phone-number').value;

    if (!phone) return alert("Enter phone number!");

    auth.signInWithPhoneNumber(phone, window.recaptchaVerifier)
    .then(res => {
        console.log("✅ OTP sent"); // STEP 4
        window.confirmationResult = res;
        alert("OTP sent!");
        document.getElementById('otp-section').style.display = "block";
    })
    .catch(err => {
        console.error("❌ ERROR:", err); // STEP 4
        alert("Error: " + err.message);
    });
};

// VERIFY OTP
document.getElementById('verify-otp-btn').onclick = () => {
    const code = document.getElementById('otp-code').value;

    window.confirmationResult.confirm(code)
    .then(() => {
        alert("Login successful!");
    })
    .catch(err => alert("Wrong code: " + err.message));
};

// SHOW CONTACTS
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
                    currentRoomId = [auth.currentUser.phoneNumber, u.phoneNumber]
                        .sort()
                        .join('_');

                    document.getElementById('contact-screen').style.display = "none";
                    document.getElementById('chat-container').style.display = "flex";

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

// SEND MESSAGE
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
