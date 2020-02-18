<?php

$tbData = $_POST['data'];

file_put_contents('./data.json', $tbData);

?>