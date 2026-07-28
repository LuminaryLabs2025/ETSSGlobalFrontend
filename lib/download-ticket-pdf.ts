import { domToPng } from "modern-screenshot";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load ticket image"));
    img.src = src;
  });
}

export async function downloadTicketPdf(source: HTMLElement, filename: string) {
  const jspdfModule = await import("jspdf");
  const JsPDF = jspdfModule.jsPDF ?? (jspdfModule as { default?: typeof jspdfModule.jsPDF }).default;
  if (!JsPDF) {
    throw new Error("jsPDF failed to load");
  }

  // modern-screenshot renders via SVG foreignObject (native browser paint),
  // so Tailwind v4 oklab/oklch colors work unlike html2canvas.
  const dataUrl = await domToPng(source, {
    scale: 2,
    backgroundColor: "#ffffff",
  });

  const img = await loadImage(dataUrl);
  const pdf = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const maxWidth = pageWidth - margin * 2;
  const maxHeight = pageHeight - margin * 2;

  let imgWidth = maxWidth;
  let imgHeight = (img.height * imgWidth) / img.width;

  if (imgHeight > maxHeight) {
    imgHeight = maxHeight;
    imgWidth = (img.width * imgHeight) / img.height;
  }

  const x = (pageWidth - imgWidth) / 2;
  pdf.addImage(dataUrl, "PNG", x, margin, imgWidth, imgHeight);
  pdf.save(filename);
}
