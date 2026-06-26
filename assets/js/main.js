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
  if (slides.length) {
    setInterval(() => moveSlide(1), 5000);
  }

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
    const messageInput = document.getElementById('form-message');
    const replyToInput = document.getElementById('reply-to');
    const confirmationMessageInput = document.getElementById('confirmation-message');

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function updateAmenitiesValue() {
      if (!amenitiesInput) return;
      const selectedAmenities = amenityCheckboxes
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value);
      amenitiesInput.value = selectedAmenities.join(', ');
    }

    function buildMessageSummary() {
      const formData = new FormData(form);
      const firstName = (formData.get('firstName') || '').toString().trim();
      const lastName = (formData.get('lastName') || '').toString().trim();
      const email = (formData.get('email') || '').toString().trim();
      const phone = (formData.get('phone') || '').toString().trim();
      const requestedDate = (formData.get('requestedDate') || '').toString().trim();
      const startTime = (formData.get('startTime') || '').toString().trim();
      const endTime = (formData.get('endTime') || '').toString().trim();
      const duration = (formData.get('duration') || '').toString().trim();
      const eventType = (formData.get('eventType') || '').toString().trim();
      const description = (formData.get('description') || '').toString().trim();
      const amenitiesMarkup = amenityCheckboxes
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => `✅ ${escapeHtml(checkbox.value)}`)
        .join('<br>');
      const eventTypeLabel = eventType === 'general' ? 'General' : 'Small Seminar';
      const eventPrice = eventType === 'general' ? '$50/hour' : '$35/hour';
      const durationLabel = duration || 'N/A';
      const formattedDate = requestedDate ? new Date(`${requestedDate}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
      const formattedStartTime = startTime ? new Date(`1970-01-01T${startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'N/A';
      const formattedEndTime = endTime ? new Date(`1970-01-01T${endTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'N/A';

      return `
<div style="max-width:700px;margin:auto;background:#f4f6f9;padding:30px;font-family:Arial,Helvetica,sans-serif;">
  <div style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.08);">
    <div style="background:#991b1b;padding:30px;text-align:center;color:white;">
      <h1 style="margin:0;">🏛 New Booking Request</h1>
      <p style="margin:8px 0 0;color:#fde68a;">CIRFA Event Reservation</p>
    </div>
    <div style="padding:35px;">
      <h2 style="color:#991b1b;border-bottom:2px solid #eee;padding-bottom:10px;">Contact Information</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:12px;background:#fafafa;font-weight:bold;width:180px;">First Name</td>
          <td style="padding:12px;">${escapeHtml(firstName || 'N/A')}</td>
        </tr>
        <tr>
          <td style="padding:12px;background:#fafafa;font-weight:bold;">Last Name</td>
          <td style="padding:12px;">${escapeHtml(lastName || 'N/A')}</td>
        </tr>
        <tr>
          <td style="padding:12px;background:#fafafa;font-weight:bold;">Email</td>
          <td style="padding:12px;"><a href="mailto:${escapeHtml(email)}" style="color:#991b1b;">${escapeHtml(email || 'N/A')}</a></td>
        </tr>
        <tr>
          <td style="padding:12px;background:#fafafa;font-weight:bold;">Telephone</td>
          <td style="padding:12px;">${escapeHtml(phone || 'N/A')}</td>
        </tr>
      </table>
      <br>
      <h2 style="color:#991b1b;border-bottom:2px solid #eee;padding-bottom:10px;">Reservation Details</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:12px;background:#fafafa;font-weight:bold;width:180px;">Requested Date</td>
          <td style="padding:12px;">${escapeHtml(formattedDate)}</td>
        </tr>
        <tr>
          <td style="padding:12px;background:#fafafa;font-weight:bold;">Start Time</td>
          <td style="padding:12px;">${escapeHtml(formattedStartTime)}</td>
        </tr>
        <tr>
          <td style="padding:12px;background:#fafafa;font-weight:bold;">End Time</td>
          <td style="padding:12px;">${escapeHtml(formattedEndTime)}</td>
        </tr>
        <tr>
          <td style="padding:12px;background:#fafafa;font-weight:bold;">Duration</td>
          <td style="padding:12px;">${escapeHtml(durationLabel)}</td>
        </tr>
        <tr>
          <td style="padding:12px;background:#fafafa;font-weight:bold;">Event Type</td>
          <td style="padding:12px;">${escapeHtml(`${eventTypeLabel} (${eventPrice})`)}</td>
        </tr>
        <tr>
          <td style="padding:12px;background:#fafafa;font-weight:bold;">Amenities</td>
          <td style="padding:12px;">${amenitiesMarkup || '✅ None'}</td>
        </tr>
      </table>
      <br>
      <h2 style="color:#991b1b;border-bottom:2px solid #eee;padding-bottom:10px;">Description</h2>
      <div style="background:#fafafa;border-left:5px solid #991b1b;padding:20px;border-radius:8px;line-height:1.7;">${escapeHtml(description || 'No description provided.')}</div>
      <div style="text-align:center;margin-top:35px;">
        <a href="mailto:${escapeHtml(email)}" style="display:inline-block;background:#991b1b;color:white;padding:15px 35px;border-radius:8px;text-decoration:none;font-weight:bold;">Reply to Customer</a>
      </div>
    </div>
    <div style="background:#f8f8f8;padding:20px;text-align:center;font-size:13px;color:#777;">
      <strong>CIRFA Booking System</strong><br>
      This email was generated automatically from your website booking form.
    </div>
  </div>
</div>`;
    }

    function updateConfirmationMessage() {
      if (!replyToInput || !confirmationMessageInput) return;
      const formData = new FormData(form);
      const firstName = (formData.get('firstName') || '').toString().trim();
      const email = (formData.get('email') || '').toString().trim();
      const requestedDate = (formData.get('requestedDate') || '').toString().trim();
      const startTime = (formData.get('startTime') || '').toString().trim();
      const endTime = (formData.get('endTime') || '').toString().trim();
      const description = (formData.get('description') || '').toString().trim();
      const eventType = (formData.get('eventType') || '').toString().trim();
      const eventTypeLabel = eventType === 'general' ? 'General' : 'Small Seminar';
      const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : '';
      const calendarDate = requestedDate ? requestedDate.replace(/-/g, '') : '';
      const calendarStart = startTime ? startTime.replace(':', '') : '090000';
      const calendarEnd = endTime ? endTime.replace(':', '') : '120000';
      const calendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Booking%20Request%20-%20${encodeURIComponent(eventTypeLabel)}&dates=${calendarDate}T${calendarStart}/${calendarDate}T${calendarEnd}&details=${encodeURIComponent(description || 'Booking request')}&location=${encodeURIComponent('CIRFA')}`;
      const confirmationMessage = `Hello ${firstName || 'there'},\n\nThank you for your reservation request.\n\nDate: ${requestedDate}\nTime: ${timeRange}\nEvent type: ${eventTypeLabel}\n\nAdd to calendar: ${calendarLink}\n\nBest regards,\nCIRFA`;

      replyToInput.value = email;
      confirmationMessageInput.value = confirmationMessage;
    }

    function refreshFormPayload() {
      updateAmenitiesValue();
      if (messageInput) messageInput.value = buildMessageSummary();
      updateConfirmationMessage();
    }

    amenityCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', refreshFormPayload);
    });

    refreshFormPayload();
    form.addEventListener('input', refreshFormPayload);

    form.addEventListener('submit', (event) => {
      refreshFormPayload();

      const firstNameInput = form.querySelector('input[name="firstName"]');
      const lastNameInput = form.querySelector('input[name="lastName"]');
      const emailInput = form.querySelector('input[name="email"]');
      const phoneInput = form.querySelector('input[name="phone"]');
      const requestedDateInput = form.querySelector('input[name="requestedDate"]');
      const startTimeInput = form.querySelector('input[name="startTime"]');
      const endTimeInput = form.querySelector('input[name="endTime"]');
      const emailValue = (emailInput?.value || '').trim();
      const phoneValue = (phoneInput?.value || '').trim();
      const firstNameValue = (firstNameInput?.value || '').trim();
      const lastNameValue = (lastNameInput?.value || '').trim();
      const requestedDateValue = (requestedDateInput?.value || '').trim();
      const startTimeValue = (startTimeInput?.value || '').trim();
      const endTimeValue = (endTimeInput?.value || '').trim();
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue);

      if (!firstNameValue || !lastNameValue || !emailValue || !phoneValue || !isValidEmail || !requestedDateValue || !startTimeValue || !endTimeValue) {
        event.preventDefault();
        if (statusBox) {
          statusBox.innerHTML = '<p class="text-sm font-medium text-red-700 lang-fr">Veuillez remplir les champs requis et une adresse courriel valide.</p><p class="text-sm font-medium text-red-700 lang-en">Please complete the required fields and a valid email address.</p>';
        }
        return;
      }

      if (statusBox) {
        statusBox.innerHTML = '<p class="text-sm font-medium text-green-700 lang-fr">Votre demande est en cours d’envoi…</p><p class="text-sm font-medium text-green-700 lang-en">Your request is being sent…</p>';
      }

      form.reset();
      refreshFormPayload();
    });
  }
});