
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

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// 🔹 Sign Up with Email Verification
function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const remember = document.getElementById("rememberMe").checked;

  const persistence = remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;

  auth.setPersistence(persistence)
    .then(() => auth.createUserWithEmailAndPassword(email, password))
    .then(userCredential => {
      const user = userCredential.user;
      user.sendEmailVerification()
        .then(() => {
          document.getElementById("message").innerText = 
            "Account created! Verification email sent. Please verify before logging in.";
          document.getElementById("authDiv").style.display = "block";
        });
    })
    .catch(error => document.getElementById("message").innerText = error.message);
}

// 🔹 Login with Email Verification
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const remember = document.getElementById("rememberMe").checked;

  const persistence = remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;

  auth.setPersistence(persistence)
    .then(() => auth.signInWithEmailAndPassword(email, password))
    .then(userCredential => {
      const user = userCredential.user;
      if (!user.emailVerified) {
        auth.signOut();
        document.getElementById("message").innerText = 
          "Email not verified! Please check your inbox.";
      } else {
        document.getElementById("message").innerText = "Login successful!";
        showProfileDiv();
      }
    })
    .catch(error => document.getElementById("message").innerText = error.message);
}

// 🔹 Logout
function logout() {
  auth.signOut().then(() => {
    document.getElementById("message").innerText = "Logged out!";
    document.getElementById("authDiv").style.display = "block";
    document.getElementById("profileDiv").style.display = "none";
    document.getElementById("usersDiv").style.display = "none";
  });
}

// 🔹 Set Profile (Display Name)
function setProfile() {
  const user = auth.currentUser;
  const displayName = document.getElementById("displayName").value;

  if (!displayName) {
    alert("Enter a display name!");
    return;
  }

  db.ref("users/" + user.uid).set({
    email: user.email,
    displayName: displayName
  }).then(() => {
    document.getElementById("message").
