let myPeer = new Peer();
let conn;
let localStream;
let call;

const myVideo = document.getElementById('myVideo');
const peerVideo = document.getElementById('peerVideo');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

myPeer.on('open', id => {
  console.log('My peer ID is: ' + id);
});

startBtn.onclick = async () => {
  localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  myVideo.srcObject = localStream;

  myPeer.on('call', incomingCall => {
    incomingCall.answer(localStream);
    incomingCall.on('stream', stream => {
      peerVideo.srcObject = stream;
    });
    call = incomingCall;
  });

  fetch('https://0peer.herokuapp.com/getRandomPeer') // Replace this with your signaling logic
    .then(res => res.json())
    .then(data => {
      if (data.peerId && data.peerId !== myPeer.id) {
        const outgoingCall = myPeer.call(data.peerId, localStream);
        outgoingCall.on('stream', stream => {
          peerVideo.srcObject = stream;
        });
        call = outgoingCall;
      }
    });
};

stopBtn.onclick = () => {
  if (call) call.close();
  if (localStream) {
    localStream.getTracks().forEach(t => t.stop());
    myVideo.srcObject = null;
    peerVideo.srcObject = null;
  }
};
