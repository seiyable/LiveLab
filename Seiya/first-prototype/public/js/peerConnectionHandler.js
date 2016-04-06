var my_stream = null;
var peer;

// Get User Media
window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
if (navigator.getUserMedia) {
	navigator.getUserMedia({video: true, audio: true}, function(stream) {
				my_stream = stream;
				var videoElement = document.getElementById('studio-1');
				videoElement.src = window.URL.createObjectURL(stream) || stream;
				videoElement.play();

				console.log("video src: " + videoElement.src);


				// We'll use a global variable to hold on to our id from PeerJS
				var peer_id = null;

				// Register for an API Key:	http://peerjs.com/peerserver
				//var peer = new Peer({key: 'YOUR API KEY'});
				// The Peer Cloud Server doesn't seem to be operational, I setup a server on a Digital Ocean instance for our use, you can use that with the following constructor:
				peer = new Peer({host: 'localhost', port: 9000, path: '/'});

				// Registering a callback function that is run once the call is established
				peer.on('open', function(id) {
				  // Get an ID from the PeerJS server
				  console.log('My peer ID is: ' + id);
				  peer_id = id;

				  console.log(peer);
				});	

				// Registering a callback function that is run when you get an incoming call from the other peer
				peer.on('call', function(incoming_call) {
					console.log("Got a call!");
					incoming_call.answer(my_stream); // Answer the call with our stream from getUserMedia
					incoming_call.on('stream', function(remoteStream) {  // we receive a getUserMedia stream from the remote caller
						// And attach it to a video object
						var ovideoElement = document.createElement('video');
						ovideoElement.src = window.URL.createObjectURL(remoteStream) || remoteStream;
						ovideoElement.setAttribute("autoplay", "true");		
						ovideoElement.play();
						document.body.appendChild(ovideoElement);
					});
				});

			}, function(err) {
				console.log('Failed to get local stream' ,err);
	});
}	

// once user press the make call button, run this function
function makeCall(peeridtocall) {
	var call = peer.call(peeridtocall, my_stream);
	call.on('stream', function(remoteStream) {
			console.log("Got remote stream");
			var ovideoElement = document.createElement('video');
			ovideoElement.src = window.URL.createObjectURL(remoteStream) || remoteStream;
			ovideoElement.setAttribute("autoplay", "true");
			ovideoElement.play();
			document.body.appendChild(ovideoElement);
		});

}