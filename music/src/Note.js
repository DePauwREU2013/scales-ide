/* Purpose of Note.js: to abstract away some of the elements of
** Web Audio API, such as setting up an audio context and
** connecting nodes.
*/


// @params: a library note (todo) or path to any sound
// initializes by setting up audio context and loads sound into memory
function Note(note) {
	var context = new AudioContext();
	var sound = this;

	var soundReq = new XMLHttpRequest();
	soundReq.open("GET", note, true);
	soundReq.responseType = "arraybuffer";

	soundReq.onload = function(){
		context.decodeAudioData(soundReq.response, function(buffer)){
			sound.buffer = buffer;
		});
	}
	soundReq.send();
}

// sets attributes for note, such as oscillation, pan, etc.
// possibly break up into smaller functions
Note.prototype.setAttributes() {

}

// plays the note immediately, or after delay@params
Note.prototype.play() {

}

// immediately stops sound
Note.prototype.stop() {

}

// sets position of AudioListener and panner node
Note.prototype.setListenerEnvironment() {

}