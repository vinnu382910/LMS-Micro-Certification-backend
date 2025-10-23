const Result = require("../models/Result");
const PDFDocument = require("pdfkit");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

exports.generateCertificateByResultId = async (req, res) => {
  try {
    const { resultId } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(resultId)) {
      return res.status(400).json({ message: "Invalid result ID format." });
    }

    const result = await Result.findOne({ _id: resultId, userId });
    if (!result) return res.status(404).json({ message: "Result not found." });
    if (!result.pass)
      return res.status(403).json({ message: "You must pass to download the certificate." });

    // ✅ Create Landscape A4 PDF
    const doc = new PDFDocument({
      size: "A4",
      layout: "landscape",
      margin: 40,
    });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=certificate_${resultId}.pdf`,
      });
      res.end(pdfData);
    });

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    // 🎨 Background + Gold Border (Frame)
    doc.rect(0, 0, pageWidth, pageHeight).fill("#fffdf7");
    doc.lineWidth(12)
      .strokeColor("#ffc400ff")
      .rect(30, 30, pageWidth - 60, pageHeight - 60)
      .stroke();

    // 🏢 Center Logo + Company Name
    const logoPath = path.join(__dirname, "./assets/talentquiz_logo.png");
    const companyName = "TalentQuiz Labs";
    const logoWidth = 70;
    const fontSize = 42;

    const textWidth = doc.widthOfString(companyName, { font: "Helvetica-Bold", size: fontSize });
    const totalWidth = logoWidth + 20 + textWidth;
    const startX = (pageWidth - 250 - totalWidth) / 2;
    const yLogo = 70;

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, startX, yLogo, { width: logoWidth, height: 70 });
    }

    doc.font("Helvetica-Bold")
      .fontSize(fontSize)
      .fillColor("#B8860B")
      .text(companyName, startX + logoWidth + 20, yLogo + 20);

    // 🏆 Title
    doc.font("Times-BoldItalic")
      .fontSize(38)
      .fillColor("#000")
      .text("CERTIFICATE OF ACHIEVEMENT", 0, 165, { align: "center" });

    // 🎉 Subtitle
    doc.font("Helvetica")
      .fontSize(18)
      .fillColor("#333")
      .text("This certificate is proudly presented to", 0, 220, { align: "center" });

    // 👤 Student Name
    doc.font("Times-Bold")
      .fontSize(32)
      .fillColor("#000")
      .text(result.userName || "Student Name", 0, 260, { align: "center" });

    // Line Separator
    doc.strokeColor("#B8860B")
      .lineWidth(2)
      .moveTo(120, 292)
      .lineTo(pageWidth - 120, 292)
      .stroke();

    // 📘 Quiz Info
    doc.font("Helvetica")
      .fontSize(16)
      .fillColor("#444")
      .text("For successfully completing the quiz:", 0, 315, { align: "center" });

    doc.font("Times-BoldItalic")
      .fontSize(20)
      .fillColor("#1D4ED8")
      .text(result.quizTitle || "Full Stack Web Development", 0, 340, { align: "center" });

    // 🎓 Program Designed By Section
    const alumniY = 370;
    const alumniHeight = 70;

    doc.save();
    doc.rect(80, alumniY, pageWidth - 160, alumniHeight)
      .fillAndStroke("#FFF8DC", "#D4AF37");
    doc.restore();

    doc.font("Helvetica-Bold")
      .fontSize(13)
      .fillColor("#333")
      .text("Program designed by top alumni from", 0, alumniY + 10, { align: "center" });

    const logos = [
      { name: "Google", file: "google_logo.png" },
      { name: "Microsoft", file: "microsoft_logo.png" },
      { name: "IIT Bombay", file: "iitb_logo.png" },
      { name: "Infosys", file: "infosys_logo.png" },
    ];

    const logoSmallWidth = 35;
    const spacing = 70;
    const totalLogoWidth = logos.length * logoSmallWidth + (logos.length - 1) * spacing;
    const startXlogos = (pageWidth - totalLogoWidth) / 2;
    const yPos = alumniY + 30;

    logos.forEach((logo, i) => {
      const logoFile = path.join(__dirname, "./assets", logo.file);
      if (fs.existsSync(logoFile)) {
        const x = startXlogos + i * (logoSmallWidth + spacing);
        doc.image(logoFile, x, yPos, { width: logoSmallWidth, height: 25 });
      }
    });

    // 💻 Technologies Covered Section (below alumni)
    const technologies = result.technologies?.length
      ? result.technologies
      : ["HTML", "CSS", "JavaScript", "React", "Node.js"];

    const techY = alumniY + alumniHeight + 15;

    doc.font("Helvetica-Bold")
      .fontSize(14)
      .fillColor("#000")
      .text("Technologies Covered:", 0, techY, { align: "center" });

    const techList = technologies.join("   •   ");
    doc.font("Helvetica")
      .fontSize(12)
      .fillColor("#444")
      .text(techList, 60, techY + 20, { align: "center", width: pageWidth - 120 });

    // 📅 Issue Date (Left) + Signature (Right)
    const issueDate = result.completedAt
      ? new Date(result.completedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "October 23, 2025";

    const bottomY = pageHeight - 60;
    const ceoName = "K. Vinay";
    const ceoTitle = "CEO, TalentQuiz Labs";

    // Left: Issue Date
    doc.font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#000")
      .text(`Issued on: ${issueDate}`, 80, bottomY, { align: "left" });

    // Right: Signature and Title
    const ceoTextWidth = Math.max(
      doc.widthOfString(ceoName),
      doc.widthOfString(ceoTitle)
    );
    const ceoX = pageWidth - ceoTextWidth - 80;

    doc.font("Times-BoldItalic")
      .fontSize(13)
      .fillColor("#000")
      .text(ceoName, ceoX, bottomY - 15);

    doc.font("Helvetica")
      .fontSize(11)
      .fillColor("#333")
      .text(ceoTitle, ceoX, bottomY);

    doc.end();
  } catch (err) {
    console.error("Error generating certificate:", err);
    res.status(500).json({ message: "Server error generating certificate." });
  }
};
