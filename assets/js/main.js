document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  let currentSlide = 0;

  function moveSlide(direction) {
    if (!slides.length) return;
    slides[currentSlide].style.opacity = '0';
    currentSlide = (currentSlide + direction + slides.length) % slides.length;
    slides[currentSlide].style.opacity = '1';
  }

  window.moveSlide = moveSlide;
  setInterval(() => moveSlide(1), 5000);

  function setLanguage(lang) {
    document.body.classList.remove('is-fr', 'is-en');
    document.body.classList.add('is-' + lang);

    const btnFr = document.getElementById('btn-fr');
    const btnEn = document.getElementById('btn-en');
    const activeClass = 'px-3 py-1 text-sm font-semibold rounded-md bg-white shadow-sm text-gray-900 transition-all';
    const inactiveClass = 'px-3 py-1 text-sm font-semibold rounded-md text-gray-500 hover:text-gray-900 transition-all';

    if (lang === 'fr') {
      btnFr.className = activeClass;
      btnEn.className = inactiveClass;
    } else {
      btnEn.className = activeClass;
      btnFr.className = inactiveClass;
    }
  }

  window.setLanguage = setLanguage;
  setLanguage('fr');

  const startTimeInput = document.getElementById('start-time');
  const endTimeInput = document.getElementById('end-time');
  const requestedDateInput = document.getElementById('requested-date');
  const durationValue = document.getElementById('duration-value');
  const durationInput = document.getElementById('duration-input');

  function parseTimeToMinutes(value) {
    if (!value) return null;
    const parts = value.split(':');
    if (parts.length < 2) return null;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return hours * 60 + minutes;
  }

  function getSelectedDate() {
    if (!requestedDateInput || !requestedDateInput.value) return null;
    return new Date(`${requestedDateInput.value}T00:00:00`);
  }

  function updateTimeConstraints() {
    if (!startTimeInput || !endTimeInput) return;

    const selectedDate = getSelectedDate();
    const today = new Date();
    const isToday = selectedDate && selectedDate.toDateString() === today.toDateString();

    const nowHours = today.getHours();
    const nowMinutes = today.getMinutes();
    const nowTotalMinutes = nowHours * 60 + nowMinutes;

    const minTimeValue = isToday ? `${String(Math.floor(nowTotalMinutes / 60)).padStart(2, '0')}:${String(nowTotalMinutes % 60).padStart(2, '0')}` : '';

    [startTimeInput, endTimeInput].forEach((input) => {
      if (input) {
        input.min = minTimeValue;
      }
    });

    if (isToday) {
      const currentValue = startTimeInput.value;
      if (currentValue && parseTimeToMinutes(currentValue) < nowTotalMinutes) {
        startTimeInput.value = '';
      }
      const endValue = endTimeInput.value;
      if (endValue && parseTimeToMinutes(endValue) < nowTotalMinutes) {
        endTimeInput.value = '';
      }
    }
  }

  // FIXED DURATION LOGIC
  function updateDuration() {
    if (!startTimeInput || !endTimeInput || !durationValue || !durationInput) return;

    const startMinutes = parseTimeToMinutes(startTimeInput.value);
    const endMinutes = parseTimeToMinutes(endTimeInput.value);

    // Ensure both inputs exist
    if (startMinutes === null || endMinutes === null) {
      durationValue.textContent = '--';
      durationInput.value = '';
      return;
    }

    let diff = endMinutes - startMinutes;

    // Prevent negative duration / check if end time is before start time
    if (diff <= 0) {
      durationValue.innerHTML = '<span class="text-red-600">Erreur / Invalid time</span>';
      durationInput.value = '';
      return;
    }

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    let formatted = `${hours}h`;
    if (minutes > 0) {
      formatted += ` ${String(minutes).padStart(2, '0')}m`;
    }

    durationValue.textContent = formatted;
    durationInput.value = formatted; // Value mapped to Formbold hidden input
  }

  [startTimeInput, endTimeInput].forEach((input) => {
    if (input) {
      input.addEventListener('input', () => {
        updateDuration();
        updateTimeConstraints();
      });
    }
  });

  if (requestedDateInput) {
    requestedDateInput.addEventListener('change', () => {
      updateTimeConstraints();
      updateDuration();
    });
  }

  if (requestedDateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    requestedDateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  updateTimeConstraints();
  updateDuration();

  const form = document.getElementById('booking-form');
  const statusBox = document.getElementById('form-status');

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault(); // Stop standard browser redirect

      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton ? submitButton.innerHTML : '';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="lang-fr">Envoi en cours...</span><span class="lang-en">Sending...</span>';
      }

      if (statusBox) {
        statusBox.innerHTML = '<p class="text-sm font-medium text-blue-700 lang-fr">Votre demande est en cours d’envoi…</p><p class="text-sm font-medium text-blue-700 lang-en">Your request is being sent…</p>';
      }

      // Prepare data for Formbold via FormData
      const formData = new FormData(form);

      try {
        const response = await fetch('https://formbold.com/s/3OObe', {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json' // Forces Formbold to return JSON instead of a redirect HTML page
          }
        });

        if (response.ok) {
          if (statusBox) {
            statusBox.innerHTML = '<p class="text-sm font-medium text-green-700 p-3 bg-green-50 rounded-lg border border-green-200 mt-4 lang-fr">✅ Votre demande a bien été envoyée. Nous vous répondrons bientôt.</p><p class="text-sm font-medium text-green-700 p-3 bg-green-50 rounded-lg border border-green-200 mt-4 lang-en">✅ Your request has been sent successfully. We will get back to you soon.</p>';
          }
          form.reset();
          if (durationValue && durationInput) {
            durationValue.textContent = '--';
            durationInput.value = '';
          }
        } else {
            throw new Error('Form submission failed');
        }
      } catch (error) {
        if (statusBox) {
          statusBox.innerHTML = '<p class="text-sm font-medium text-red-700 p-3 bg-red-50 rounded-lg border border-red-200 mt-4 lang-fr">❌ Une erreur est survenue. Veuillez réessayer plus tard.</p><p class="text-sm font-medium text-red-700 p-3 bg-red-50 rounded-lg border border-red-200 mt-4 lang-en">❌ Something went wrong. Please try again later.</p>';
        }
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalText;
        }
      }
    });
  }
});