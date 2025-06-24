const myVideo = document.getElementById('myVideo');
const peerVideo = document.getElementById('peerVideo');
const status = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

let localStream;
let call;
const peer = new Peer(undefined, {
  host: 'peerjs.com',
  port: 443,
  secure: true
});

peer.on('open', id => {
  console.log('Your peer ID:', id);
  status.textContent = "✅ Connected to Weo Network";
});

peer.on('call', incomingCall => {
  incomingCall.answer(localStream);
  incomingCall.on('stream', remoteStream => {
    peerVideo.srcObject = remoteStream;
    status.textContent = "🟢 You are now chatting!";
    call = incomingCall;
  });
});

startBtn.onclick = async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    myVideo.srcObject = localStream;

    status.textContent = "🔍 Searching for a partner...";
    
    // Wait 3 seconds before searching for a random peer
    setTimeout(() => {
      // Simulated random peer
      // Replace this with a real match system
      const randomPeerId = prompt("Enter your friend's Peer ID to connect (for demo)");

      if (randomPeerId && randomPeerId !== peer.id) {
        const outgoingCall = peer.call(randomPeerId, localStream);
        outgoingCall.on('stream', remoteStream => {
          peerVideo.srcObject = remoteStream;
          status.textContent = "🟢 You are now chatting!";
          call = outgoingCall;
        });
      } else {
        status.textContent = "⚠️ Could not connect (same ID or canceled)";
      }
    }, 3000);

  } catch (err) {
    console.error("Permission denied or error:", err);
    status.textContent = "❌ Permission denied or not supported!";
  }
};

stopBtn.onclick = () => {
  if (call) call.close();
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    myVideo.srcObject = null;
    peerVideo.srcObject = null;
    status.textContent = "🔴 Chat stopped.";
  }
};
                                    
