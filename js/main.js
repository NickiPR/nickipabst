const cookieContainer = document.querySelector(".cookie-container");
const cookieButton = document.querySelector(".cookie-btn");

cookieButton.addEventListener("click", () => {
  cookieContainer.classList.remove("active");
  localStorage.setItem("cookieBannerDisplayed", "true");
});

setTimeout(() => {
  if (!localStorage.getItem("cookieBannerDisplayed")) {
    cookieContainer.classList.add("active");
  }
}, 2000);

// Spam bot protection for the Sendy contact/newsletter forms.
// The "hp" honeypot field was already in the markup but nothing ever checked it —
// bots fill in every field including hidden ones, real visitors never see it.
// Combined with a minimum fill time (bots submit near-instantly), this blocks
// most automated submissions without adding a captcha or any external service.
const pageLoadTime = Date.now();
const MIN_FORM_FILL_MS = 2500;

document.querySelectorAll('form[action*="mailify.dk"]').forEach((form) => {
  form.addEventListener("submit", (event) => {
    const honeypot = form.querySelector('input[name="hp"]');
    const submittedTooFast = Date.now() - pageLoadTime < MIN_FORM_FILL_MS;

    if ((honeypot && honeypot.value) || submittedTooFast) {
      event.preventDefault();
      // No error shown — a real bot doesn't need to know it was caught.
    }
  });
});

// Spam bot protection for the Sendy contact/newsletter forms.
// The "hp" honeypot field was already in the markup but nothing ever checked it —
// bots fill in every field including hidden ones, real visitors never see it.
// Combined with a minimum fill time (bots submit near-instantly), this blocks
// most automated submissions without adding a captcha or any external service.
const pageLoadTime = Date.now();
const MIN_FORM_FILL_MS = 2500;

document.querySelectorAll('form[action*="mailify.dk"]').forEach((form) => {
  form.addEventListener("submit", (event) => {
    const honeypot = form.querySelector('input[name="hp"]');
    const submittedTooFast = Date.now() - pageLoadTime < MIN_FORM_FILL_MS;

    if ((honeypot && honeypot.value) || submittedTooFast) {
      event.preventDefault();
      // No error shown — a real bot doesn't need to know it was caught.
    }
  });
});


// Spam bot protection for the Sendy contact/newsletter forms.
// The "hp" honeypot field was already in the markup but nothing ever checked it —
// bots fill in every field including hidden ones, real visitors never see it.
// Combined with a minimum fill time (bots submit near-instantly), this blocks
// most automated submissions without adding a captcha or any external service.
const pageLoadTime = Date.now();
const MIN_FORM_FILL_MS = 2500;

document.querySelectorAll('form[action*="mailify.dk"]').forEach((form) => {
  form.addEventListener("submit", (event) => {
    const honeypot = form.querySelector('input[name="hp"]');
    const submittedTooFast = Date.now() - pageLoadTime < MIN_FORM_FILL_MS;

    if ((honeypot && honeypot.value) || submittedTooFast) {
      event.preventDefault();
      // No error shown — a real bot doesn't need to know it was caught.
    }
  });
});
