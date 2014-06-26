/* 
** Purpose of Note.js: to abstract away some of the elements of
** Web Audio API, such as setting up an audio context and
** connecting nodes.
*/

/* 
** @params: a library note or url path to any sound
** initializes a new instance of Note by setting up 
** a context (if none exists), and loading the note
*/
function Note(source, level) {
	if(!window.context) {
		context = new AudioContext();
	}

	try {
 	var that = this;
 		settings(that, source, level);

        var req = new XMLHttpRequest();
		req.open("GET", that.source, true);
		req.responseType = "arraybuffer";

		req.onload = function() {
			context.decodeAudioData(req.response, function(buffer) {
				that.buffer = buffer;
				that.isLoaded = true;
			});
		}
		req.send();    
	} catch(err) {
		s = "Whoopsie daisy: " + source;
		alert(s);    
	} 
}


/*
** @params: the note and volume for NoteObj
** sets NoteObj's properties
*/
function settings(that, source, level) {
	var s = findNote(source);
	that.source = s;
	that.buffer = null;
	that.isLoaded = false;
	that.panner = context.createPanner();
	that.volume = context.createGain();
	that.volume.gain.value = (!level) ? 1 : level;
}

/*
** @params: key for note's source path 
** if source path not found, returns params
*/
function findNote(url) {
	switch(url) {
		case 'camera':
			return "../../audio/standard/camera.wav";
			break;
		case 'ding':
			return "../../audio/standard/air-plane-ding.mp3";
			break;
		case 'atone':
			return "../../audio/standard/a-tone.mp3";
			break;
		default:
			return url;
	}
}

/*
** @params: plays note after delay (seconds)
** or immediately if no argument
*/
Note.prototype.play = function(delay) {
	if(this.isLoaded === true) {
		var player = context.createBufferSource();
		player.buffer = this.buffer;
		player.connect(this.panner);
		this.panner.connect(this.volume);
		this.volume.connect(context.destination);

		if(!delay) {
        	player.start(0);
        } else player.start(delay);
    }
}

/*
** @params: stops source after delay (seconds) 
** or immediately if no arguments
*/
Note.prototype.stop = function(delay) {
	//TODO
}

/*
** @params: repeats sound given times, or once if invalid params
*/
Note.prototype.repeat = function(times) {
	//TODO
}

/*
** @params: sets gain (volume) for Note at time
** @return: a new instance of the Note with set volume
*/
Note.prototype.setVolume = function(level) {
	var newNote = this;
	newNote.volume.gain.value = level;
	return newNote;
    
    //TODO: fix this so that it can set volume properly!
//    var newNote = new Note(this.source);
//    newNote.setVolume(level);
//    return newNote;
}

/*
** TODO: look into this some more
*/
Note.prototype.oscillate = function() {
	//TODO
}

/*
** TODO
** @params: changes note by delta 
*/
Note.prototype.changeOctave = function(delta) {
	//TODO
}

Note.prototype.setPan = function(xValue) {
	this.panner.setPosition(xValue, 0, 0);
}