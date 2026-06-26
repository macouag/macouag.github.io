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
      
      // Formatted comma-separated string instead of a vertical block
      const amenities = amenityCheckboxes
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value)
        .join(', ');
        
      const eventTypeLabel = eventType === 'general' ? 'General' : 'Small Seminar';
      const eventPrice = eventType === 'general' ? '$50/hour' : '$35/hour';
      const durationLabel = duration ? duration : 'N/A';
      const formattedDate = requestedDate ? new Date(`${requestedDate}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';
      const formattedStartTime = startTime ? new Date(`1970-01-01T${startTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'N/A';
      const formattedEndTime = endTime ? new Date(`1970-01-01T${endTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'N/A';

      return `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
  <h2 style="color: #991b1b; border-bottom: 2px solid #991b1b; padding-bottom: 10px;">🏛 New Booking Request - CIRFA</h2>
  
  <h3 style="color: #991b1b; margin-bottom: 5px;">Contact Information</h3>
  <p style="margin-top: 0;">
    <strong>Name:</strong> ${firstName || 'N/A'} ${lastName || ''}<br>
    <strong>Email:</strong> <a href="mailto:${email}" style="color: #991b1b;">${email || 'N/A'}</a><br>
    <strong>Phone:</strong> ${phone || 'N/A'}
  </p>

  <h3 style="color: #991b1b; margin-bottom: 5px;">Reservation Details</h3>
  <p style="margin-top: 0;">
    <strong>Date:</strong> ${formattedDate}<br>
    <strong>Time:</strong> ${formattedStartTime} - ${formattedEndTime} (${durationLabel})<br>
    <strong>Event Type:</strong> ${eventTypeLabel} (${eventPrice})<br>
    <strong>Amenities:</strong> ${amenities || 'None'}
  </p>

  <h3 style="color: #991b1b; margin-bottom: 5px;">Description</h3>
  <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #991b1b; border-radius: 4px; margin-top: 5px;">
    ${description || 'No description provided.'}
  </div>

  <div style="text-align: center; margin-top: 30px;">
    <a href="mailto:${email}" style="background: #991b1b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reply to Customer</a>
  </div>
  
  <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
  <p style="font-size: 12px; color: #777; text-align: center;">
    <strong>CIRFA Booking System</strong><br>
    This email was generated automatically from your website booking form.
  </p>
</div>`;
    }