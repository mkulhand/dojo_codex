<?php

$tbData = $_POST['data'];

// file_put_contents('.data/data.json', $tbData);

$tbData = json_decode($tbData, true);

foreach ($tbData as $key => $tbRessource) {
	file_put_contents('./data/'.$key.'.json', json_encode($tbRessource));
}

?>