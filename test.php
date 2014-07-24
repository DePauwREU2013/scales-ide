<?php
	/* This is just a simple script that responds to a post with 
	 * a short message and then echos the text that was posted. */

	$file = 'worker.js';
	$fp = fopen($file, "w");
	$output = 	 "var c = document.querySelector('canvas');".PHP_EOL
				."var ctx = c.getContext('2d');".PHP_EOL
				."ctx.fillStyle = '#FF0000';".PHP_EOL
				."ctx.fillRect(0,0,50,50);";
	fwrite($fp, $output);
	fclose($fp);

	echo "worker.js";
?>