const PDFDocument = require("pdfkit");

exports.generateCertificate = (req, res) => {
  const { name, quizTitle, score } = req.body;

  // Create PDF document with A4 size and margins
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  });

  const fileName = `Certificate_${name.replace(/ /g, "_")}.pdf`;

  // Set response headers for file download
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
  res.setHeader("Content-Type", "application/pdf");

  doc.pipe(res);

  // Draw a decorative frame
  doc
    .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
    .lineWidth(4)
    .strokeColor("#003366")
    .stroke();

  // Company Name
  doc
    .fontSize(16)
    .fillColor("#444444")
    .font("Helvetica-Bold")
    .text("TechWorld Learning Pvt. Ltd.", { align: "center" });

  // Fake CIN Number
  doc
    .moveDown(0.2)
    .fontSize(10)
    .fillColor("#666666")
    .font("Helvetica")
    .text("CIN: U12345MH2023PTC456789", { align: "center" });

  doc.moveDown(2);

  // Certificate Title
  doc
    .fontSize(28)
    .fillColor("#003366")
    .font("Helvetica-Bold")
    .text("Certificate of Completion", { align: "center" });

  doc.moveDown(2);

  // Introductory Statement
  doc
    .fontSize(14)
    .fillColor("#000000")
    .font("Helvetica")
    .text("This is to certify that", { align: "center" });

  doc.moveDown(1);

  // Recipient's Name - underlined and styled
  doc
    .fontSize(22)
    .fillColor("#0066CC")
    .font("Helvetica-Bold")
    .text(name, {
      align: "center",
      underline: true,
    });

  doc.moveDown(1);

  // Achievement Text
  doc
    .fontSize(14)
    .fillColor("#000000")
    .font("Helvetica")
    .text("has successfully completed the quiz titled", { align: "center" });

  doc.moveDown(0.5);

  // Quiz Title in Italics
  doc
    .fontSize(14)
    .fillColor("#000000")
    .font("Helvetica-Oblique")
    .text(`"${quizTitle}"`, { align: "center" });

  doc.moveDown(1);

  // Score Details
  doc
    .fontSize(12)
    .fillColor("#444444")
    .font("Helvetica")
    .text(`With a score of: ${score}`, { align: "center" });

  doc.moveDown(3);

  // Certificate ID at bottom right
  doc
    .fontSize(10)
    .fillColor("#888888")
    .font("Helvetica")
    .text(`Certificate ID: CERT-${Math.floor(100000 + Math.random() * 900000)}`, {
      align: "right",
    });

  doc.moveDown(5);

  // Signature line and authorized signatory
  doc
    .fontSize(12)
    .fillColor("#000000")
    .text("_________________________", 100, 650);

  doc
    .fontSize(12)
    .fillColor("#000000")
    .text("Authorized Signatory", 120, 670);

  // Issue Date at bottom right
  const issueDate = new Date().toLocaleDateString();
  doc
    .fontSize(10)
    .fillColor("#555555")
    .text(`Date of Issue: ${issueDate}`, 400, 670);

  // Finalize PDF file
  doc.end();
};
