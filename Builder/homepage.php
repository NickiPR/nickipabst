<?php
// We need to use sessions, so you should always start sessions using the below code.
session_start();
// If the user is not logged in redirect to the login page...
if (!isset($_SESSION['loggedin'])) {
	header('Location: index.html');
	exit();
}
?>


<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Home Page</title>
		<link href="style.css" rel="stylesheet" type="text/css">
		<link href="stylesheet.css" rel="stylesheet" type="text/css">
		<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css">
	</head>
	<body class="loggedin">

		<aside class="animate fadeInUp one">
		  <h1>Email Builder</h1>
		  <h3>by Nicki Pabst</h3>
		</aside>

<div style="position:absolute; top: 600px; width:100%;">
<div style="margin: auto;">

	<a href="Grapes"><img src="https://grapesjs.com/img/grapesjs-front-page-m.jpg" alt="" style="width: 100%; max-width: 600px; display: block; margin-left: auto; margin-right: auto;" /></a>
</div>
</div>

	<div><img class="nickipbg" src="https://nickipabst.dk/img/team/Sidenicki.png" alt="nickipabst" style="width: 100%; max-width: 500px; height:auto;"></div>
		<input type="checkbox" id="menu-toggle"/>
		  <label id="trigger" for="menu-toggle"></label>
		  <label id="burger" for="menu-toggle"></label>
			<ul id="menu">
				<li><a href="homepage.php">Hjem</a></li>
				<li><a href="contact.php">Kontakt</a></li>
				<li><a href="profile.php">Profil</a></li>
				<li><a href="logout.php">Log ud</a></li>
			</ul>


	</body>
</html>
