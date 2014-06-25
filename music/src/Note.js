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
function Note(source, level) {
	if(!window.context) {
		context = new AudioContext();
	}

	var note = this;
	settings(note, source, level);

	var req = new XMLHttpRequest();
	req.open("GET", note.source, true);
	req.responseType = "arraybuffer";

	req.onload = function() {
		context.decodeAudioData(req.response, function(buffer) {
			note.buffer = buffer;
			note.loaded = true;
		});
	}
	req.send();
}

/*
** @params: the note and volume for NoteObj
** sets NoteObj's properties
*/
function settings(note, source, level) {
	note.source = source;
	note.panner = context.createPanner();
	note.volume = context.createGain();

	note.buffer = null;
	note.loaded = false;
	note.volume.gain.value = (!level) ? 1 : level;
}


/*
** @params: plays note after delay,
** or immediately if no argument
*/
Note.prototype.play = function(delay) {
	if(this.loaded === true) {
		var soundSource = context.createBufferSource();
		soundSource.buffer = this.buffer;
		soundSource.connect(this.panner);
		this.panner.connect(this.volume);
		this.volume.connect(context.destination);
         
        // older systems (i.e IE) may not support start()
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
Note.prototype.setVolume = function(level) {
	var newNote = this;
	newNote.volume.gain.value = level;
	return newNote;
}

// sets position of AudioListener and panner node
Note.prototype.setListenerEnvironment() {

}