// Firebase setup
const firebaseConfig = {
  apiKey: "AIzaSyBZL2br6mlJQt-w7nW_yQqbjFMYQI9mlEM",
  authDomain: "weo-chat.firebaseapp.com",
  projectId: "weo-chat",
  storageBucket: "weo-chat.firebasestorage.app",
  messagingSenderId: "394235063858",
  appId: "1:394235063858:web:12b8f0d9934dce41bf562b",
  measurementId: "G-1LQHF7XC90"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const myVideo = document.getElementById('myVideo');
const peerVideo = document.getElementById('peerVideo');
const chatBox = document.getElementById('chatBox');
const chatInput = document.getElementById('chatInput');
const status = document.getElementById('status');
const peerName = document.getElementById('peerName');

const names = ["Fox", "Cat", "Bear", "Otter", "Frog"];
const countries = ["🇯🇵", "🇺🇸", "🇮🇳", "🇰🇷", "🇫🇷", "🇧🇷"];
const myName = names[Math.floor(Math.random() * names.length)];
const myCountry = countries[Math.floor(Math.random() * countries.length)];

let myPeer = new Peer();
let localStream, call, conn;
let matched = false;

myPeer.on('open', id => {
  console.log("Peer ID:", id);
  db.ref("queue").once("value", async (snapshot) => {
    const val = snapshot.val();
    if (val) {
      const otherID = Object.keys(val)[0];
      db.ref("queue/" + otherID).remove();
      startChat(otherID);
    } else {
      db.ref("queue/" + id).set(true);
    }
  });
});

async function startChat(peerId) {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  myVideo.srcObject = localStream;

  call = myPeer.call(peerId, localStream);
  call.on("stream", (remoteStream) => {
    peerVideo.srcObject = remoteStream;
    matched = true;
    status.textContent = "🟢 Connected!";
    peerName.textContent = "Stranger " + countries[Math.floor(Math.random() * countries.length)];
  });

  conn = myPeer.connect(peerId);
  conn.on("data", data => {
    chatBox.innerHTML += `<div><b>Stranger:</b> ${data}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  });
}

myPeer.on("call", async incomingCall => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  myVideo.srcObject = localStream;
  incomingCall.answer(localStream);
  call = incomingCall;
  incomingCall.on("stream", remoteStream => {
    peerVideo.srcObject = remoteStream;
    matched = true;
    status.textContent = "🟢 Connected!";
    peerName.textContent = "Stranger " + countries[Math.floor(Math.random() * countries.length)];
  });
});

myPeer.on("connection", connection => {
  conn = connection;
  conn.on("data", data => {
    chatBox.innerHTML += `<div><b>Stranger:</b> ${data}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  });
});

chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && conn) {
    const msg = chatInput.value;
    chatInput.value = "";
    chatBox.innerHTML += `<div class="text-right"><b>You:</b> ${msg}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
    conn.send(msg);
  }
});

document.getElementById("stopBtn").onclick = () => {
  if (call) call.close();
  if (conn) conn.close();
  if (localStream) localStream.getTracks().forEach(t => t.stop());
  myVideo.srcObject = null;
  peerVideo.srcObject = null;
  chatBox.innerHTML = "";
  status.textContent = "🔴 Chat stopped.";
};

document.getElementById("startBtn").onclick = () => {
  location.reload(); // easy way to reinitiate
};
          
