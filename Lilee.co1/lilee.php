<?php
$to = "vudduccong2241@gmail.com";
$subject = "New Bouquet Order";

$fullname = $_POST['fullname'];
$contactNumber = $_POST['contactNumber'];
$igHandle = $_POST['igHandle'];
$description = $_POST['description'];
$deliveryDate = $_POST['deliveryDate'];

$message = "Fullname: $fullname\n";
$message .= "Contact Number: $contactNumber\n";
$message .= "IG Handle: $igHandle\n";
$message .= "Description: $description\n";
$message .= "Delivery Date: $deliveryDate\n";

mail($to, $subject, $message);

// You can redirect the user back to the previous page or show a confirmation message
header("Location: ".$_SERVER['HTTP_REFERER']."#success");
exit();
?>
