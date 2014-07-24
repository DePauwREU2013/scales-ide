<?php
	$postdata = file_get_contents("php://input");
	echo "Hello! I'm an imaginary scala-js compile server...\r\n";
	echo "This is what you posted to me. I would be extracting and \r\n";
	echo "compiling the source code I'd be trying to compile if I was \r\n";
	echo "real:\r\n\r\n";
	echo $postdata;
?>