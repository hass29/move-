import html2pdf from 'html2pdf.js';

export const downloadPDF = (request) => {
  // Check if request has status property and if it's approved
  if (!request.status || request.status !== 'approved') {
    alert('Only approved requests can generate PDF.');
    return;
  }

  const nowStr = new Date().toLocaleString();
  
  const signatureHTML = `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #d4b48c; display: flex; justify-content: space-between; font-family: 'Segoe UI', sans-serif;">
      <div style="text-align: center; width: 45%;">
        <div style="font-weight: bold; margin-bottom: 25px;">Authorized by</div>
        <div style="border-bottom: 1px solid #000; width: 80%; margin: 0 auto 5px auto; padding-top: 8px;"></div>
        <div style="font-size: 0.85rem; color: #333;">________________</div>
        <div style="font-size: 0.7rem; margin-top: 5px;">Coordinator Signature</div>
      </div>
      <div style="text-align: center; width: 45%;">
        <div style="font-weight: bold; margin-bottom: 25px;">Receiver / Transporter</div>
        <div style="border-bottom: 1px solid #000; width: 80%; margin: 0 auto 5px auto; padding-top: 8px;"></div>
        <div style="font-size: 0.85rem; color: #333;">________________</div>
        <div style="font-size: 0.7rem; margin-top: 5px;">Receiver Signature</div>
      </div>
    </div>
    <div style="margin-top: 20px; text-align: right; font-size: 0.7rem; color: #777; border-top: 1px dashed #e0cbb6; padding-top: 12px;">
      Digitally generated on ${nowStr}
    </div>
  `;

  const pdfHtml = `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Movement_${request._id}</title>
    <style>
      body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 30px; background: #fffaf3; }
      .pdf-card { max-width: 1000px; margin: auto; background: white; box-shadow: 0 20px 30px rgba(0,0,0,0.1); }
      .header-bar { background: #7b4a2a; color: white; padding: 30px; text-align: center; }
      .content { padding: 35px; }
      h3 { color: #c27e3a; margin: 20px 0 10px 0; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      td, th { padding: 10px; text-align: left; border-bottom: 1px solid #f0e2d2; }
      .section { margin-bottom: 20px; }
    </style>
  </head>
  <body>
    <div class="pdf-card">
      <div class="header-bar">
        <h1><i class="fas fa-paw"></i> Animal Movement Document</h1>
        <p>Authorized Transfer Document with Signature</p>
      </div>
      <div class="content">
        <div><strong>Request ID:</strong> AM-${request._id.toString().slice(-5)} &nbsp;|&nbsp; <strong>Issue Date:</strong> ${nowStr}</div>
        <div class="section">
          <h3>📋 Requester Information</h3>
          <table>
            <tr><th>Name</th><td>${escapeHtml(request.applicant)}</td>
            <tr><th>Contact</th><td>${escapeHtml(request.phone)}</td>
          </table>
        </div>
        <div class="section">
          <h3>🐾 Movement Details</h3>
          <table>
            <tr><th>Animal</th><td>${escapeHtml(request.animalName)}</td>
            <tr><th>Quantity</th><td>${request.quantity}</td>
            <tr><th>Direction</th><td>${request.direction === 'inward' ? '⬇️ INWARD (Receiving)' : '⬆️ OUTWARD (Sending)'}</td>
            <tr><th>Gate</th><td>${escapeHtml(request.gate)}</td>
            <tr><th>Scheduled Date</th><td>${request.datetime ? new Date(request.datetime).toLocaleString() : 'Not specified'}</td>
            <tr><th>Special Notes</th><td>${escapeHtml(request.purpose || '—')}</td>
          </table>
        </div>
        ${signatureHTML}
      </div>
    </div>
  </body>
  </html>`;

  const element = document.createElement('div');
  element.innerHTML = pdfHtml;
  document.body.appendChild(element);
  
  html2pdf().set({ margin: 0.2, filename: `AnimalMovement_${request._id}.pdf` }).from(element).save()
    .then(() => {
      document.body.removeChild(element);
    })
    .catch((error) => {
      console.error('PDF generation error:', error);
      document.body.removeChild(element);
      alert('Error generating PDF. Please try again.');
    });
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}