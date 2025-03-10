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
$DATABASE_PASS = 'L8i8Es6utf7cVAhXp2isQi4T';
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
		<title>Profile Page</title>
		<link href="style.css" rel="stylesheet" type="text/css">
		<link href="stylesheet.css" rel="stylesheet" type="text/css">
		<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.7.1/css/all.css">
	</head>
	<body class="loggedin">


		<aside class="profile_aside animate fadeInUp one">
			<h1>Hej <?=$_SESSION['name']?></h1>


			<div>

				<h2>&nbsp;</h2>
				<div>

					<table>
						<tr>
							<td><h4>Profil info:</h4></td>
						</tr>

						<tr>
							<td class="table">Username:</td>
							<td><?=$_SESSION['name']?></td>
						</tr>
						<tr>
							<td class="table">Password:</td>
							<td><?=$password?></td>
						</tr>
						<tr>
							<td  class="table">Email:</td>
							<td><?=$email?></td>
						</tr>
					</table>
				</div>
			</div>
		</aside>
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
