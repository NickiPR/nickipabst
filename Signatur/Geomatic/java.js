var btn = document.querySelector(".sai");
var getText = document.querySelector(".getText");
var content = document.querySelector(".getcontent");
var editorContent = document.querySelector(".editor");

btn.addEventListener("click", function () {
  var s = editorContent.innerHTML;
  content.style.display = "block";
  var t = `<body dir="auto" style="caret-color: rgb(0, 0, 0); color: rgb(0, 0, 0); letter-spacing: normal; orphans: auto; text-align: start; text-indent: 0px; text-transform: none; white-space: normal; widows: auto; word-spacing: 0px; -webkit-text-size-adjust: auto; -webkit-text-stroke-width: 0px; text-decoration: none; word-wrap: break-word; -webkit-nbsp-mode: space; line-break: after-white-space;">`;
  content.textContent = t + s;
});

getText.addEventListener("click", function () {
  const old = editorContent.textContent;
  content.style.display = "block";
  content.textContent = old;
});


