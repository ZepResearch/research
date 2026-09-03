import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateCertificatePdfBuffer({
  name,
  conference,
  certificateType = 'participation',
  certificateNo,
  verificationCode,
  issueDate,
}) {
  const pdfDoc = await PDFDocument.create();
  // A4 Landscape: 841.89 x 595.28 points
  const page = pdfDoc.addPage([841.89, 595.28]);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const { width, height } = page.getSize();

  // Primary color: Cyan / Teal (#0e7490) -> rgb(14/255, 116/255, 144/255)
  const primaryColor = rgb(14 / 255, 116 / 255, 144 / 255);
  const darkTextColor = rgb(30 / 255, 41 / 255, 59 / 255);
  const mutedTextColor = rgb(100 / 255, 116 / 255, 139 / 255);

  // Outer Border
  page.drawRectangle({
    x: 24,
    y: 24,
    width: width - 48,
    height: height - 48,
    borderColor: primaryColor,
    borderWidth: 5,
  });

  // Inner Border
  page.drawRectangle({
    x: 32,
    y: 32,
    width: width - 64,
    height: height - 64,
    borderColor: rgb(226 / 255, 232 / 255, 240 / 255),
    borderWidth: 1.5,
  });

  // Top Header - Organization Name
  const orgText = "ZEP RESEARCH";
  const orgWidth = fontBold.widthOfTextAtSize(orgText, 26);
  page.drawText(orgText, {
    x: (width - orgWidth) / 2,
    y: height - 90,
    size: 26,
    font: fontBold,
    color: primaryColor,
  });

  // Tagline
  const taglineText = "Pioneering Innovation, Shaping the Future";
  const taglineWidth = fontOblique.widthOfTextAtSize(taglineText, 11);
  page.drawText(taglineText, {
    x: (width - taglineWidth) / 2,
    y: height - 110,
    size: 11,
    font: fontOblique,
    color: mutedTextColor,
  });

  // Divider Line
  page.drawLine({
    start: { x: (width - 200) / 2, y: height - 128 },
    end: { x: (width + 200) / 2, y: height - 128 },
    thickness: 1,
    color: primaryColor,
  });

  // Certificate Label
  const certTypeTitle = certificateType.toUpperCase();
  const labelText = `CERTIFICATE OF ${certTypeTitle}`;
  const labelWidth = fontBold.widthOfTextAtSize(labelText, 18);
  page.drawText(labelText, {
    x: (width - labelWidth) / 2,
    y: height - 175,
    size: 18,
    font: fontBold,
    color: darkTextColor,
  });

  // Subtitle
  const subText = "This certificate is proudly awarded to";
  const subWidth = fontRegular.widthOfTextAtSize(subText, 13);
  page.drawText(subText, {
    x: (width - subWidth) / 2,
    y: height - 215,
    size: 13,
    font: fontRegular,
    color: mutedTextColor,
  });

  // Recipient Name
  const recipientName = name || "Participant";
  const nameSize = recipientName.length > 25 ? 26 : 32;
  const nameWidth = fontBold.widthOfTextAtSize(recipientName, nameSize);
  page.drawText(recipientName, {
    x: (width - nameWidth) / 2,
    y: height - 265,
    size: nameSize,
    font: fontBold,
    color: primaryColor,
  });

  // Underline for name
  const nameLineLength = Math.max(nameWidth + 40, 300);
  page.drawLine({
    start: { x: (width - nameLineLength) / 2, y: height - 275 },
    end: { x: (width + nameLineLength) / 2, y: height - 275 },
    thickness: 1,
    color: rgb(203 / 255, 213 / 255, 225 / 255),
  });

  // Participation Description
  const descText = "in recognition of valuable contribution and participation in";
  const descWidth = fontRegular.widthOfTextAtSize(descText, 13);
  page.drawText(descText, {
    x: (width - descWidth) / 2,
    y: height - 320,
    size: 13,
    font: fontRegular,
    color: darkTextColor,
  });

  // Conference Name
  const confTitle = conference || "International Academic Research Conference";
  const confSize = confTitle.length > 50 ? 14 : 16;
  const confWidth = fontBold.widthOfTextAtSize(confTitle, confSize);
  page.drawText(confTitle, {
    x: (width - confWidth) / 2,
    y: height - 355,
    size: confSize,
    font: fontBold,
    color: darkTextColor,
  });

  // Issue Date
  const dateFormatted = issueDate || new Date().toISOString().slice(0, 10);
  const dateText = `Issued on: ${dateFormatted}`;
  const dateWidth = fontRegular.widthOfTextAtSize(dateText, 12);
  page.drawText(dateText, {
    x: (width - dateWidth) / 2,
    y: height - 400,
    size: 12,
    font: fontRegular,
    color: mutedTextColor,
  });

  // Footer - Left side: Certificate No.
  const certNoText = `Certificate No: ${certificateNo || "ZEP-CERT"}`;
  page.drawText(certNoText, {
    x: 50,
    y: 55,
    size: 11,
    font: fontRegular,
    color: mutedTextColor,
  });

  // Footer - Right side: Verification Code
  const verifyText = `Verification Code: ${verificationCode || "VERIFY"}`;
  const verifyWidth = fontRegular.widthOfTextAtSize(verifyText, 11);
  page.drawText(verifyText, {
    x: width - 50 - verifyWidth,
    y: 55,
    size: 11,
    font: fontRegular,
    color: mutedTextColor,
  });

  // Save PDF bytes
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
