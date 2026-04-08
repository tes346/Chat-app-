
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
const db = firebase.database();

// 🔹 Attach functions to window so buttons work
window.signUp = function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const remember = document.getElementById("rememberMe").checked;
  const persistence = remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;

  auth.setPersistence(persistence)
    .then(() => auth.createUserWithEmailAndPassword(email, password))
    .then(userCredential => {
      const user = userCredential.user;
      });
    })
    .catch(err => document.getElementById("message").innerText = err.message);
};

window.login = function() {
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
      } else {
        document.getElementById("message").innerText = "Login successful!";
        showProfileDiv();
      }
    })
    .catch(err => document.getElementById("message").innerText = err.message);
};

window.logout = function() {
  auth.signOut().then(() => {
    document.getElementById("message").innerText = "Logged out!";
    document.getElementById("authDiv").style.display = "block";
    document.getElementById("profileDiv").style.display = "none";
    document.getElementById("usersDiv").style.display = "none";
  });
};

window.setProfile = function() {
  const user = auth.currentUser;
  const displayName = document.getElementById("displayName").value;
  if (!displayName) return alert("Enter display name!");

  db.ref("users/" + user.uid).set({ email: user.email, displayName })
    .then(() => {
      document.getElementById("message").innerText = "Profile saved!";
      showUsers();
    });
};

// 🔹 Helper functions
function showProfileDiv() {
  document.getElementById("authDiv").style.display = "none";
  document.getElementById("profileDiv").style.display = "block";
  const user = auth.currentUser;
  document.getElementById("userName").innerText = user.email;

  db.ref("users/" + user.uid).get().then(snap => {
    if (snap.exists()) document.getElementById("displayName").value = snap.val().displayName;
    showUsers();
  });
}

function showUsers() {
  document.getElementById("usersDiv").style.display = "block";
  const listDiv = document.getElementById("userList");
  listDiv.innerHTML = "";
  db.ref("users").on("value", snapshot => {
    listDiv.innerHTML = "";
    snapshot.forEach(child => {
      const user = child.val();
      const uid = child.key;
      if (uid !== auth.currentUser.uid) {
        const btn = document.createElement("button");
        btn.innerText = user.displayName || user.email;
        btn.onclick = () => alert("Start chat with: " + (user.displayName || user.email));
        listDiv.appendChild(btn);
      }
    });
  });
}

// Stay logged in & email verification
auth.onAuthStateChanged(user => {
  if (user && user.emailVerified) showProfileDiv();
  else if (user && !user.emailVerified) auth.signOut();
  else {
    document.getElementById("authDiv").style.display = "block";
    document.getElementById("profileDiv").style.display = "none";
    document.getElementById("usersDiv").style.display = "none";
  }
});
