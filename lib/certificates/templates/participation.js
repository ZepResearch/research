export function renderCertificateHtml({ name, conference, certificateType, certificateNo, verificationCode, issueDate }) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { margin: 0; }
  body {
    margin: 0;
    width: 1122px;
    height: 793px;
    font-family: Georgia, 'Times New Roman', serif;
    background: #ffffff;
    border: 14px solid #0e7490;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  .label { letter-spacing: 4px; text-transform: uppercase; color: #0e7490; font-size: 14px; }
  .name { font-size: 42px; margin: 24px 0 8px; color: #111; }
  .body-text { font-size: 16px; color: #444; max-width: 700px; line-height: 1.6; }
  .footer { margin-top: 48px; font-size: 12px; color: #888; }
</style>
</head>
<body>
  <div class="label">Certificate of ${certificateType}</div>
  <div class="name">${name}</div>
  <div class="body-text">
    This certifies participation in <strong>${conference}</strong>,
    issued on ${issueDate}.
  </div>
  <div class="footer">
    Certificate No. ${certificateNo} &nbsp;·&nbsp; Verify at
    zepresearch.com/verify/${verificationCode}
  </div>
</body>
</html>`;
}
