
<?php

// Contact subject
$subject ="$subject";

// Details
$message="$detail";


// Mail of sender
$mail_from="$customer_mail";

// From
$header="from: $name <$mail_from>";


// Enter your email address
$to ='kontakt@nickipabst.dk';

$send_contact=mail($to,$subject,$message,$header);


// Check, if message sent to your email
// display message "We've recived your information"
if($send_contact){
echo "Jeg vender tilbage hurtigst muligt";
}
else {
echo "Vær venlig at udfylde alt";
}
?>
