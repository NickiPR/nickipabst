<?php
// We need to use sessions, so you should always start sessions using the below code.
session_start();
// If the user is not logged in redirect to the login page...
if (!isset($_SESSION['loggedin'])) {
	header('Location: index.html');
	exit();
}
$DATABASE_HOST = 'nickipabst.dk.mysql';
$DATABASE_USER = 'nickipabst_dk';
$DATABASE_PASS = '';
$DATABASE_NAME = 'nickipabst_dk';
$con = mysqli_connect($DATABASE_HOST, $DATABASE_USER, $DATABASE_PASS, $DATABASE_NAME);
if (mysqli_connect_errno()) {
	die ('Failed to connect to MySQL: ' . mysqli_connect_error());
}
// We don't have the password or email info stored in sessions so instead we can get the results from the database.
$stmt = $con->prepare('SELECT password, email FROM accounts WHERE id = ?');
// In this case we can use the account ID to get the account info.
$stmt->bind_param('s', $_SESSION['id']);
$stmt->execute();
$stmt->bind_result($password, $email);
$stmt->fetch();
$stmt->close();
?>

<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title>Home Page</title>
		<link href="style.css" rel="stylesheet" type="text/css">
		<link href="stylesheet.css" rel="stylesheet" type="text/css">
<link href="contactform.css" rel="stylesheet" type="text/css">
		<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css">
	</head>
	<body class="loggedin">

		<aside class="animate fadeInUp one">
		  <h1>Kontakt</h1>

			<div>



			<div class="form">
				<div class="form-group">
					<form name="form1" method="post" action="send_contact.php">
					<input name="name" type="text" id="name" placeholder="Navn" class="form-control"  />
					<label class="input-field-icon icon-user" for="login-name"></label>
				</div>

				<div class="form-group">
					<input type="email" class="form-control" value="" placeholder="Email" id="customer_mail" name="customer_mail" />
					<label class="input-field-icon icon-email" for="login-email"></label>
				</div>

				<div class="form-group">
					<textarea name="detail" class="form-control" value="" placeholder="Message" id="detail" rows="1"></textarea>
				</div>

				<button id="contact-send" type="submit" name="Submit" value="Submit" class="btn btn-primary btn-lg btn-block">Send</button>
			</form>
			</div>



</div>

		</aside>
			<img class="nickipbg" src="https://nickipabst.dk/img/team/Sidenicki.png" alt="nickipabst" style="width: 100%; max-width: 500px; height:auto;">
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
