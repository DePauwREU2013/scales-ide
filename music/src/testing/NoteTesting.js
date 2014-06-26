var alertMe = function() { 
	var atone = new Note("atone", .7);
	var ding = new Note("ding");
	var louderDing = ding.setVolume(1);
	var cam = new Note("camera").setVolume(.5);

	var butt = document.getElementById("button");
	if(butt.addEventListener) {
		butt.addEventListener("click", play);

		function play(e) {
			atone.play();
			louderDing.play(3);
			ding.play(5);
			ding.play(7);
			cam.play(9);
		}
	}
}
