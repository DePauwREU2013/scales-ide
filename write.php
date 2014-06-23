<?php
	$r = file_put_contents("/home/ben/Documents/projects/foo.txt", $_POST["contents"]) or die("can't open file");
?>