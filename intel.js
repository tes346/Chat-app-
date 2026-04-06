const firebaseConfig = {
  apiKey: "AIzaSyCkk8FYqYgwcZTgbhEIG-3q0D5BkBL_Qj4",
  authDomain: "chat-app-72173.firebaseapp.com",
  databaseURL: "https://chat-app-72173-default-rtdb.firebaseio.com",
  projectId: "chat-app-72173",
  storageBucket: "chat-app-72173.firebasestorage.app",
  messagingSenderId: "350285511724",
  appId: "1:350285511724:web:84c0128616b2880313e589",
  measurementId: "G-RHBBRTWLVY"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// invisible recaptcha
window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
  'size': 'invisible'
});

// Login Logic
const sendOtpBtn = document.getElementById('send-otp-btn');
const verifyOtpBtn = document.getElementById('verify-otp-btn');
const phoneNumberInput = document.getElementById('phone-number');
const otpCodeInput = document.getElementById('otp-code');
const otpSection = document.getElementById('otp-section');

sendOtpBtn.addEventListener('click', () => {
    const number = phoneNumberInput.value;
    auth.signInWithPhoneNumber(number, window.recaptchaVerifier)
        .then((confirmationResult) => {
            window.confirmationResult = confirmationResult;
            otpSection.style.display = "block";
            alert("Code sent!");
        }).catch((error) => alert(error.message));
});

verifyOtpBtn.addEventListener('click', () => {
    const code = otpCodeInput.value;
    confirmationResult.confirm(code).then((result) => {
        document.getElementById('login-screen').style.display = "none";
        document.getElementById('chat-container').style.display = "block";
        startChat();
    }).catch((error) => alert("Wrong code!"));
});

// Chat Logic (Inside a function)
function startChat() {
    const messagesRef = database.ref('messages');
    const sendBtn = document.getElementById('send-btn');
    const userInput = document.getElementById('user-input');
    const messagesDiv = document.getElementById('messages');

    sendBtn.onclick = () => {
        const text = userInput.value;
        if (text.trim() !== "") {
            messagesRef.push({
                text: text,
                sender: auth.currentUser.phoneNumber,
                timestamp: Date.now()
            });
            userInput.value = "";
        }
    };

    messagesRef.on('child_added', (snapshot) => {
        const data = snapshot.val();
        const msg = document.createElement('div');
        msg.className = data.sender === auth.currentUser.phoneNumber ? 'message sent' : 'message received';
        msg.textContent = data.text;
        messagesDiv.appendChild(msg);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    });
}
