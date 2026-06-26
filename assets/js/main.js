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
    const amenityCheckboxes = Array.from(form.querySelectorAll('input[name="amenity"]'));
    const amenitiesInput = document.getElementById('amenities-input');

    function updateAmenitiesValue() {
      if (!amenitiesInput) return;
      const selectedAmenities = amenityCheckboxes
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);
      amenitiesInput.value = selectedAmenities.join(', ');
    }

    amenityCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', updateAmenitiesValue);
    });
    updateAmenitiesValue();

    form.addEventListener('submit', (event) => {
      updateAmenitiesValue();

      const firstNameInput = form.querySelector('input[name="firstName"]');
      const lastNameInput = form.querySelector('input[name="lastName"]');
      const emailInput = form.querySelector('input[name="email"]');
      const phoneInput = form.querySelector('input[name="phone"]');
      const emailValue = (emailInput?.value || '').trim();
      const phoneValue = (phoneInput?.value || '').trim();
      const firstNameValue = (firstNameInput?.value || '').trim();
      const lastNameValue = (lastNameInput?.value || '').trim();
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

      if (!firstNameValue || !lastNameValue || !emailValue || !phoneValue || !isValidEmail) {
        event.preventDefault();
        if (statusBox) {
          statusBox.innerHTML = '<p class="text-sm font-medium text-red-700 lang-fr">Veuillez remplir votre prénom, nom, téléphone et une adresse courriel valide.</p><p class="text-sm font-medium text-red-700 lang-en">Please complete your first name, last name, phone number, and a valid email address.</p>';
        }
        return;
      }

      let ccInput = form.querySelector('input[name="_cc"]');
      if (!ccInput) {
        ccInput = document.createElement('input');
        ccInput.type = 'hidden';
        ccInput.name = '_cc';
        form.appendChild(ccInput);
      }
      ccInput.value = emailValue;

      let replyToInput = form.querySelector('input[name="_replyto"]');
      if (!replyToInput) {
        replyToInput = document.createElement('input');
        replyToInput.type = 'hidden';
        replyToInput.name = '_replyto';
        form.appendChild(replyToInput);
      }
      replyToInput.value = emailValue;

      if (statusBox) {
        statusBox.innerHTML = '<p class="text-sm font-medium text-green-700 lang-fr">Votre demande est en cours d’envoi…</p><p class="text-sm font-medium text-green-700 lang-en">Your request is being sent…</p>';
        window.setTimeout(() => {
          if (statusBox.innerHTML.includes('Votre demande est en cours d’envoi') || statusBox.innerHTML.includes('Your request is being sent')) {
            statusBox.innerHTML = '';
          }
        }, 60000);
      }
    });
  }
});
