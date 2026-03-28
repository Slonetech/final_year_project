import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportToPDF(
  elementId: string,
  filename: string,
  options?: {
    orientation?: "portrait" | "landscape";
    format?: string;
  }
) {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Temporarily show print-hidden elements
    const printHidden = element.querySelectorAll(".print\\:hidden");
    printHidden.forEach((el) => {
      (el as HTMLElement).style.display = "none";
    });

    // Show print-only elements
    const printOnly = element.querySelectorAll(".print\\:block, .hidden.print\\:block");
    printOnly.forEach((el) => {
      (el as HTMLElement).style.display = "block";
    });

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    // Restore visibility
    printHidden.forEach((el) => {
      (el as HTMLElement).style.display = "";
    });
    printOnly.forEach((el) => {
      (el as HTMLElement).style.display = "";
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: options?.orientation || "portrait",
      unit: "mm",
      format: options?.format || "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10; // Top margin

    pdf.addImage(
      imgData,
      "PNG",
      imgX,
      imgY,
      imgWidth * ratio,
      imgHeight * ratio
    );

    pdf.save(filename);
  } catch (error) {
    console.error("Error exporting to PDF:", error);
    throw error;
  }
}
