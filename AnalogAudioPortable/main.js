var arrayOfLines = $('#textArea').val().split('\n');
var currLine=0;
var context = new AudioContext()
var o;
var isPlaying = false;
function loadFile(f) {
	let file = f.files[0];
	let reader = new FileReader();
	
	var r;
	reader.onload = function() {
		console.log("Read file.");
		r = reader.result;
		r = new Uint16Array(r);
		console.log(r);
		$('#textArea').val("");
		$('#base').val(r[0]);
		$('#multi').val(r[1]);
		for (var i = 2; i < r.length; i++) {
			console.log("Adding " + r[i].toString() + " to string");
			$('#textArea').val($('#textArea').val() + r[i].toString());
			if (i!=r.length-1) {
				$('#textArea').val($('#textArea').val() + '\n');
			}
		}
	}
	
	reader.onerror = function() {
		console.log(reader.error);
	}
	
	reader.readAsArrayBuffer(file);
	
}
function getFreqToPlay() {
	if (arrayOfLines[currLine-(currLine%2)]==0) {
		console.log("Playing frequency 0");
		return 0;
	} else {
		console.log("Playing frequency " + (parseInt(arrayOfLines[currLine]*$('#multi').val())+parseInt($('#base').val())));
		return parseInt(arrayOfLines[currLine-(currLine%2)]*$('#multi').val())+parseInt($('#base').val());
	}
}
function changeFreq() {
	o.frequency.value = arrayOfLines[currLine]!=undefined ? getFreqToPlay() : closeOcillator();
	doNext();
	currLine+=2;
}
var ga;
function doNext() {
	if (arrayOfLines[currLine+1]!=undefined) {
		var a = window.setTimeout(function(event) {
			changeFreq();
			clearTimeout(a);
		},arrayOfLines[currLine+1]);
		ga = a;
	} else {
		currLine = -2;
	}
}
$('#play').on("click", function(event) {
	if (isPlaying) {
		closeOcillator();
		clearTimeout(ga);
		currLine = 0;
	}
	arrayOfLines = $('#textArea').val().split('\n');
	for(var i=0; i<arrayOfLines.length; i++) {
		arrayOfLines[i] = parseInt(arrayOfLines[i]);
	}
	o = context.createOscillator()
	o.connect(context.destination)
	o.type = $('#wavetype').val();
	o.frequency.value = arrayOfLines[currLine]!=undefined ? getFreqToPlay() : closeOcillator();
	o.start();
	isPlaying = true;
	doNext();
	$("#output").html("{"+genArray()+"}")
});
$('#stop').on("click", function(event) {
	closeOcillator();
	clearTimeout(ga);
	currLine = 0;
});
function genArray() {
	var s = arrayOfLines[0].toString();
	for (var i = 1; i < arrayOfLines.length; i++) {
		s = s.concat(", ");
		s = s.concat(arrayOfLines[i].toString());
	}
	return s;
}
function closeOcillator() {
	console.log("Closing oscillator")
	o.stop();
	isPlaying = false;
	return 0;
}
function downloadBlob() {
	arrayOfLines = $('#textArea').val().split('\n');
	arrayOfLines.unshift($('#multi'));
	arrayOfLines.unshift($('#base'));
	var u16array = new Uint16Array(arrayOfLines);
	var blob = new Blob([u16array],{type: "octet/stream"});
	var bloburl = URL.createObjectURL(blob);
	var link = document.createElement("a");
	link.href = bloburl;
	link.download = "download.aap";
	link.click();
}
var midi;
var file;
function loadMIDI(f) {
	file = f;
	changeTrack();
}
function changeTrack() {
	var reader = new FileReader()
	reader.onload = function(){
		midi = new Midi(reader.result)
		console.log(midi);
		var t = $('#textArea');
		t.val("");
		t.appendval = function(e) {
			t.val(t.val() + e);
		}
		var lastTime = 0;
		var track = midi.tracks[$('#track').val()];
		$('#instrument').html(track.name);
		for (var i = 0; i < track.notes.length; i++) {
			var currentNote = track.notes[i];
			t.appendval('0\n');
			t.appendval(Math.max(Math.round((currentNote.time-lastTime)*1000),0) + '\n');
			t.appendval(parseInt(Math.pow(2,(currentNote.midi-69)/12)*440) + '\n');
			t.appendval(Math.round((currentNote.duration*1000)).toString());
			if (i!=track.notes.length-1) {
				t.appendval('\n');
			}
			lastTime = currentNote.time+currentNote.duration;
		}
		$('#base').val(0);
		$('#multi').val(1);
	}
	reader.readAsArrayBuffer(file.files[0])
}/projects/js-creations/js-window-manager/
