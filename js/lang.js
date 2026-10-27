// EN / DA are separate pages (/ and /da/). The toggle remembers the choice and
// keeps you on the same section.
document.querySelectorAll(".lang-toggle a").forEach(function (a) {
  a.addEventListener("click", function (e) {
    e.preventDefault();
    try {
      localStorage.setItem("nickipabst_lang", a.dataset.lang);
    } catch (err) {}
    location.href = a.getAttribute("href") + location.hash;
  });
});

// Remember that this visitor reads Danish (the legal page follows it).
if (document.documentElement.lang === "da") {
  try {
    localStorage.setItem("nickipabst_lang", "da");
  } catch (err) {}
}
