// Language for the legal page: follows the choice made on the main site.
(function () {
  var saved = null;
  try {
    saved = localStorage.getItem("nickipabst_lang");
  } catch (e) {}

  // Old links point at #cookies / #terms; the Danish sections carry a -da suffix.
  function jumpToHash() {
    var id = location.hash.slice(1).replace(/-da$/, "");
    if (!id) return;
    var el = document.getElementById(document.documentElement.lang === "da" ? id + "-da" : id);
    if (el) el.scrollIntoView();
  }

  function apply(lang) {
    document.documentElement.lang = lang;
    document.querySelectorAll(".lang-toggle button").forEach(function (b) {
      b.classList.toggle("active", b.dataset.lang === lang);
    });
    try {
      localStorage.setItem("nickipabst_lang", lang);
    } catch (e) {}
  }

  document.querySelectorAll(".lang-toggle button").forEach(function (b) {
    b.addEventListener("click", function () {
      apply(b.dataset.lang);
      jumpToHash();
    });
  });
  window.addEventListener("hashchange", jumpToHash);

  apply(saved === "da" ? "da" : "en");
  jumpToHash();
})();
