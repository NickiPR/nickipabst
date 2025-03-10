<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="style.css">
    <title>Email Link Generator</title>
    <style>
        .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin-top: 50px;
        }
        .image-box {
            border: 1px solid #ccc;
            background-color: #f9f9f9;
            padding: 10px;
            margin-bottom: 20px;
        }
        .copy-button {
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            border: none;
            cursor: pointer;
            font-size: 16px;
        }
        .copy-button:hover {
            background-color: #45a049;
        }
        .hidden {
            position: absolute;
            left: -9999px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Your link that you need to put in the email is:</h1>
        <div class="image-box">
            <img id="tracking-pixel" src="http://www.nickipabst.dk/tracker/footer.php?image=footer.gif&id=<?php echo htmlspecialchars($_GET["email"]); ?>" alt="Tracking Pixel">
        </div>
        <button class="copy-button" onclick="copyImageHtml()">Copy Image HTML to Clipboard</button>
        <div id="html-container" class="hidden">
            <img src="http://www.nickipabst.dk/tracker/footer.php?image=footer.gif&id=<?php echo htmlspecialchars($_GET["email"]); ?>" alt="Tracking Pixel">
        </div>
    </div>
    <script>
        function copyImageHtml() {
            const htmlContainer = document.getElementById('html-container');
            const range = document.createRange();
            range.selectNode(htmlContainer);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');
            selection.removeAllRanges();
            alert('Image HTML code copied to clipboard');
        }
    </script>
</body>
</html>
