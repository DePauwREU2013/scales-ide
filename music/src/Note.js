/* 
** Purpose of Note.js: to abstract away some of the elements of
** Web Audio API, such as setting up an audio context and
** connecting nodes.
*/


/* 
** @params: a library note (todo) or path to any sound
** initializes a new instance of Note by setting up 
** a context (if none exists), and loading the note
*/
function Note(note, volume) {
	if(!context) {
		context = new AudioContext();
	}

	var sound = this;
	setProperties(sound, note, volume);

	var req = new XMLHttpRequest();
	req.open("GET", sound.note, true);
	req.responseType = "arraybuffer";

	req.onload = function() {
		context.decodeAudioData(req.response, function(buffer) {
			sound.buffer = buffer;
			sound.loaded = true;
		});
	}
}

/*
** @params: the note and volume for NoteObj
** sets NoteObj's properties
*/
function setProperties(NoteObj, note, volume) {
	NoteObj.note = note;
	NoteObj.panner = context.createPanner();
	NoteObj.volume = context.createGain();

	NoteObj.note = note;
	NoteObj.buffer = null;
	NoteObj.loaded = false;
	NoteObj.volume.gain.value = (!volume) ? 1 : volume;
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