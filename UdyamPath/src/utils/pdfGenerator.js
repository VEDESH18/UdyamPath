import { jsPDF } from 'jspdf';

export const generatePDFReport = (state, reportData) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = [255, 107, 53]; // Saffron
    const darkColor = [26, 26, 46]; // Navy
    
    let yPos = 20;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    const addFooter = (pageNum) => {
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`UdyamPath \u2014 Built for Bharat | Page ${pageNum}`, pageWidth / 2, pageHeight - 15, { align: 'center' });
    };

    const addTitle = (text, size = 18, yOffset = 10) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(size);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
      doc.text(lines, margin, yPos);
      yPos += (lines.length * (size * 0.4)) + yOffset;
    };

    const addText = (text, size = 12, style = 'normal', yOffset = 8) => {
      if (!text) return;
      doc.setFont('helvetica', style);
      doc.setFontSize(size);
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
      doc.text(lines, margin, yPos);
      yPos += (lines.length * (size * 0.4)) + yOffset;
    };

    const checkPageBreak = (neededSpace = 30) => {
      if (yPos + neededSpace > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
        return true;
      }
      return false;
    };

    // PAGE 1: COVER
    doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(40);
    doc.text("UdyamPath", pageWidth / 2, 80, { align: 'center' });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("Founder Case Study Report", pageWidth / 2, 95, { align: 'center' });

    doc.setFontSize(14);
    doc.text(`Founder: ${state.user?.name || 'Entrepreneur'}`, pageWidth / 2, 130, { align: 'center' });
    doc.text(`Module: ${state.currentModule?.name || 'Strategy'}`, pageWidth / 2, 140, { align: 'center' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 150, { align: 'center' });

    doc.setFontSize(24);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(`Score: ${reportData.score}/6`, pageWidth / 2, 180, { align: 'center' });

    addFooter(1);

    // PAGE 2: AI INSIGHTS & ACTION
    doc.addPage();
    yPos = 30;
    doc.setTextColor(0, 0, 0);

    // Hero box
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, yPos, pageWidth - margin * 2, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    const heroLines = doc.splitTextToSize("Golden Rule: " + reportData.insights.oneLineSolution, pageWidth - margin * 2 - 10);
    doc.text(heroLines, margin + 5, yPos + 15);
    yPos += 50;

    addTitle("Your AI Evaluation");
    addText("STRENGTH:", 12, 'bold', 2);
    addText(reportData.insights.strength);
    
    addText("BLIND SPOT:", 12, 'bold', 2);
    addText(reportData.insights.blindSpot);

    addTitle("How Real Founders Handled This", 16, 8);
    addText(reportData.insights.howRealFounderSolvedIt);

    addTitle("Analogy for your idea", 16, 8);
    addText(reportData.insights.analogyForTheirIdea);

    yPos += 10;
    addTitle("YOUR NEXT STEP THIS WEEK", 18, 10);
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos - 5, pageWidth - margin * 2, 25, 'F');
    addText(reportData.insights.nextStepAction, 14, 'bold');
    
    addFooter(2);

    // PAGE 3+: ANSWER REVIEW
    doc.addPage();
    yPos = 30;
    addTitle("Detailed Question Review", 22, 15);

    state.currentAnswers?.forEach((ans, i) => {
      checkPageBreak(50);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      const qLines = doc.splitTextToSize(`Q${i+1}: ${ans.question}`, pageWidth - margin * 2);
      doc.text(qLines, margin, yPos);
      yPos += (qLines.length * 6) + 5;

      // Result mark
      if (ans.isCorrect) {
        doc.setTextColor(15, 155, 88); // Success green
        doc.text("Result: Correct", margin, yPos);
      } else {
        doc.setTextColor(233, 69, 96); // Accent red
        doc.text("Result: Incorrect", margin, yPos);
      }
      yPos += 8;

      doc.setTextColor(80, 80, 80);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      const expLines = doc.splitTextToSize(`Review: ${ans.explanation}`, pageWidth - margin * 2);
      doc.text(expLines, margin, yPos);
      yPos += (expLines.length * 5) + 5;

      if (ans.analogy) {
         doc.setFont('helvetica', 'italic');
         const analLines = doc.splitTextToSize(`Analogy: ${ans.analogy}`, pageWidth - margin * 2);
         doc.text(analLines, margin, yPos);
         yPos += (analLines.length * 5) + 10;
      } else {
         yPos += 5;
      }
      
      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;
      
    });

    addFooter(3);

    // Download the PDF
    const filename = `UdyamPath-${state.user?.name?.split(' ')[0] || 'Report'}-${state.currentModule?.name?.replace(/\\s+/g, '')}-${new Date().getTime()}.pdf`;
    doc.save(filename);
    
    return true;

  } catch (err) {
    console.error("PDF Generation failed:", err);
    return false;
  }
};
