document.addEventListener('DOMContentLoaded', () => {
  emailjs.init('PNA9CgsRPnocR-GMw');
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
    const [hours, minutes] = value.split(':').map(Number);
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

  function updateDuration() {
    if (!startTimeInput || !endTimeInput || !durationValue || !durationInput) return;

    const startMinutes = parseTimeToMinutes(startTimeInput.value);
    const endMinutes = parseTimeToMinutes(endTimeInput.value);

    if (startMinutes === null || endMinutes === null) {
      durationValue.textContent = '--';
      durationInput.value = '';
      return;
    }

    let diff = endMinutes - startMinutes;
    if (diff < 0) {
      diff += 24 * 60;
    }

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    const formatted = `${hours}h ${String(minutes).padStart(2, '0')}m`;
    durationValue.textContent = formatted;
    durationInput.value = formatted;
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
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton ? submitButton.innerHTML : '';
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="lang-fr">Envoi en cours...</span><span class="lang-en">Sending...</span>';
      }

      if (statusBox) {
        statusBox.innerHTML = '<p class="text-sm font-medium text-green-700 lang-fr">Votre demande est en cours d’envoi…</p><p class="text-sm font-medium text-green-700 lang-en">Your request is being sent…</p>';
      }

      const formData = new FormData(form);
      const userEmail = (formData.get('email') || '').toString().trim();
      const firstName = (formData.get('firstName') || '').toString().trim();
      const lastName = (formData.get('lastName') || '').toString().trim();
      const requestedDate = (formData.get('requestedDate') || '').toString().trim();
      const startTime = (formData.get('startTime') || '').toString().trim();
      const endTime = (formData.get('endTime') || '').toString().trim();
      const eventType = (formData.get('eventType') || '').toString().trim();
      const description = (formData.get('description') || '').toString().trim();
      const duration = (formData.get('duration') || '').toString().trim();
      const amenities = formData.getAll('amenity').join(', ');

      const templateParams = {
        to_email: 'mikeraogo@gmail.com',
        from_name: `${firstName} ${lastName}`.trim(),
        from_email: userEmail,
        requested_date: requestedDate,
        start_time: startTime,
        end_time: endTime,
        duration,
        event_type: eventType,
        description,
        amenities,
        message: `New booking request from ${firstName} ${lastName}`
      };

      const confirmationParams = {
        to_email: userEmail,
        from_name: 'CIRFA',
        message: `Hello ${firstName},\n\nThank you for your reservation request. We have received your message and will get back to you shortly.\n\nDetails:\n- Date: ${requestedDate}\n- Time: ${startTime} to ${endTime}\n- Duration: ${duration || 'N/A'}\n- Event type: ${eventType || 'N/A'}\n\nBest regards,\nCIRFA`
      };

      try {
        await emailjs.send('service_yo5avmf', 'booking_request', templateParams);
        if (userEmail) {
          await emailjs.send('service_yo5avmf', 'booking_confirmation', confirmationParams);
        }

        if (statusBox) {
          statusBox.innerHTML = '<p class="text-sm font-medium text-green-700 lang-fr">Votre demande a bien été envoyée. Nous vous répondrons bientôt.</p><p class="text-sm font-medium text-green-700 lang-en">Your request has been sent successfully. We will get back to you soon.</p>';
        }
        form.reset();
        if (durationValue && durationInput) {
          durationValue.textContent = '--';
          durationInput.value = '';
        }
      } catch (error) {
        if (statusBox) {
          statusBox.innerHTML = '<p class="text-sm font-medium text-red-700 lang-fr">Une erreur est survenue. Veuillez réessayer plus tard.</p><p class="text-sm font-medium text-red-700 lang-en">Something went wrong. Please try again later.</p>';
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
