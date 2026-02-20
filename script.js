// ========== Use of Audio ==========

function clickSound() {
  var sound = document.getElementById("audio");
  const isValid = form.checkValidity(); // Checks if the form is valid
  if (isValid) {
    sound.play();
  }
}

//  ========== Image slider ==========

const slides = document.querySelectorAll(".slides img");
let slideIndex = 0;
let intervalId = null;

document.addEventListener("DOMContentLoaded", initializeSlider);

function initializeSlider(){
    if(slides.length > 0){
        slides[slideIndex].classList.add("displaySlide");
        intervalId = setInterval(nextSlide, 5000); // Image will change every 5 seconds
    }
}

function showSlide(index){
    if(index >= slides.length){
        slideIndex = 0;
    }
    else if(index < 0){
        slideIndex = slides.length - 1;
    }

    slides.forEach(slide => {
        slide.classList.remove("displaySlide");
    });
    slides[slideIndex].classList.add("displaySlide");
}

function prevSlide(){
    clearInterval(intervalId);
    slideIndex--;
    showSlide(slideIndex);
}

function nextSlide(){
    slideIndex++;
    showSlide(slideIndex);
}

// ========== Form ==========

const form = document.getElementById("bookingForm");
const message = document.getElementById("formMessage");
const progressBar = document.getElementById("progressBar");

// Update progress bar as fields are filled
form.addEventListener("input", () => {
  const fields = form.querySelectorAll("input, select");
  let filled = 0;
  fields.forEach(f => {
    if (f.type === "radio" || f.type === "checkbox") {
      if (f.checked) filled++;
    } else if (f.value) {
      filled++;
    }
  });
  progressBar.value = (filled / fields.length) * 100;
});

// Submit event handling
form.addEventListener("submit", (event) => {
  event.preventDefault();

  // HTML5 validation using Form API
  if (!form.checkValidity()) {
    message.style.color = "red";
    message.textContent = "❌ Please complete all required fields.";
    return;
  }

  // Collect form data
  const bookingData = {
    name: document.getElementById("fullname").value,
    email: document.getElementById("email").value,
    checkin: document.getElementById("checkin").value,
    checkout: document.getElementById("checkout").value,
    roomType: document.getElementById("roomType").value,
    guests: document.getElementById("guests").value,
    bed: form.querySelector('input[name="bed"]:checked')?.value || "N/A",
    services: Array.from(form.querySelectorAll('input[name="services"]:checked'))
                    .map(a => a.value).join(", "),
    rating: document.getElementById("rating").value,
    country: document.getElementById("country").value,
    timestamp: new Date().toLocaleString() // current date and time
  };

  // Opens a popup window
  const popup = window.open("", "BookingPopup", "width=600,height=500,resizable=yes");

  if (!popup) {
    alert("Please allow pop-ups for this website to display your booking details.");
    return;
  }

  // HTML shell in the popup with message listener inside
  popup.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Booking Details</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; background:#f7f9fc; color:#333; padding:20px; }
        h1 { text-align:center; color:#5c7cfa; }
        table { width:100%; border-collapse:collapse; background:white; margin-top:15px; }
        th, td { border:1px solid #ccc; padding:10px; text-align:left; }
        th { background:#5c7cfa; color:white; }
        p { text-align:center; margin-top:20px; }
      </style>
    </head>
    <body>
      <h1>🛎️ Booking Confirmation</h1>
      <h3 style="text-align:center;">Loading Booking Details...</h3>
      <script>
        window.addEventListener('message', function(event) {
          const data = event.data;
          if (!data || !data.name) return;
          document.body.innerHTML = \`
            <h1>🛎️ Booking Confirmation</h1>
            <table>
              <tr><th>Full Name</th><td>\${data.name}</td></tr>
              <tr><th>Email</th><td>\${data.email}</td></tr>
              <tr><th>Check-in Date</th><td>\${data.checkin}</td></tr>
              <tr><th>Check-out Date</th><td>\${data.checkout}</td></tr>
              <tr><th>Room Type</th><td>\${data.roomType}</td></tr>
              <tr><th>Guests</th><td>\${data.guests}</td></tr>
              <tr><th>Bed Preference</th><td>\${data.bed}</td></tr>
              <tr><th>Services</th><td>\${data.services || "None"}</td></tr>
              <tr><th>Rating</th><td>\${data.rating}/10</td></tr>
              <tr><th>Country</th><td>\${data.country}</td></tr>
              <tr><th>Booking Time</th><td>\${data.timestamp}</td></tr>
            </table>
            <p>Enjoy your stay with <strong>Aurelia Hotel</strong> &trade;</p>
          \`;
        });
      <\/script>
    </body>
    </html>
  `);

  setTimeout(() => {
    popup.postMessage(bookingData, "*");
  }, 500);

  sendBookingViaXHR(bookingData);

  message.style.color = "green";
  message.textContent = "Booking successfull!";
});

// XMLHttpRequest
function sendBookingViaXHR(data) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/online-booking-website/Bookings/bookings.php", true); // Using POST method to send data
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const resp = JSON.parse(xhr.responseText || "{}");
          console.log("Booking saved:", resp);
        } catch (e) {
          console.log("Booking saved (non-JSON reply):", xhr.responseText);
        }
      } else {
        console.error("Booking POST failed:", xhr.status, xhr.responseText);
      }
    };

    xhr.onerror = function () {
      console.error("Network error while sending booking");
    };

    xhr.send(JSON.stringify(data));
}