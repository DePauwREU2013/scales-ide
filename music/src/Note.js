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


/*
** @params: plays note after delay,
** or immediately if no argument
*/
Note.prototype.start(delay) {
	if(this.loaded) {
		var soundSource = context.createBufferSouce();
		soundSource.buffer = this.buffer;
		soundSource.connect(this.panner);
		this.panner.connect(this.volume);
		this.volume.connect(context.destination);
		
		// older systems may not support start()
		try {
			if(!delay) 
				soundSource.start(0);
			else
				soundSource.start(delay);
		}
		catch(err) {
			if(!delay)
				soundSource.noteOn(0);
			else
				soundSource.noteOn(delay);
		}
	}
}

/*
** @params: sets gain for Note
** @return: a new instance of the Note with set volume
*/
Note.prototype.setVolume(vol) {
	var newNote = this;
	newNote.volume.gain.value = vol;
	return newNote;
}

// sets position of AudioListener and panner node
Note.prototype.setListenerEnvironment() {

}