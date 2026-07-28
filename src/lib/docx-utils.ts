import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, WidthType } from "docx";
import type { BusinessDocumentWithRelations } from "@/types/erp";

export async function generateProposalDocx(docData: BusinessDocumentWithRelations): Promise<Blob> {
  const sections = docData.sections || [];

  // Build the docx child elements
  const children: any[] = [];

  // Title page / Header
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({
          text: docData.title.toUpperCase(),
          bold: true,
          size: 40,
          color: "0F172A",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "PROLX DIGITAL AGENCY",
          bold: true,
          size: 24,
          color: "0D9488",
        }),
      ],
      spacing: { before: 200, after: 800 },
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: `Document Reference: ${docData.id}`,
          size: 20,
          color: "64748B",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: `Prepared For: ${docData.client?.full_name || "Valued Client"}`,
          size: 20,
          color: "64748B",
        }),
      ],
      spacing: { after: 1200 },
    })
  );

  // Content Sections
  sections.forEach((sec) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: sec.title,
            bold: true,
            size: 28,
            color: "0D9488",
          }),
        ],
        spacing: { before: 400, after: 200 },
      })
    );

    const bodyText = sec.content || "";
    // Clean raw HTML tags for docx export
    const cleanText = bodyText
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>|<\/li>|<\/h[1-6]>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, " ")
      .replace(/->|--&gt;|&gt;|>--/g, "→");

    cleanText.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const isArrowFlow = trimmed.includes("→");
      const isVisionQuote = trimmed.toLowerCase().includes("vision") || trimmed.startsWith('"') || trimmed.startsWith('“');

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmed,
              size: isVisionQuote ? 22 : 21,
              bold: isArrowFlow || isVisionQuote,
              italics: isVisionQuote,
              color: isArrowFlow ? "0D9488" : isVisionQuote ? "0F172A" : "334155",
            }),
          ],
          spacing: { after: 150 },
        })
      );
    });
  });

  // Table row headers if pricing exists
  if (docData.line_items && docData.line_items.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: "Detailed Pricing & Cost Breakdown",
            bold: true,
            size: 28,
            color: "0D9488",
          }),
        ],
        spacing: { before: 400, after: 200 },
      })
    );

    const tableRows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Category", bold: true, color: "FFFFFF" })] })], shading: { fill: "0D9488" } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Description", bold: true, color: "FFFFFF" })] })], shading: { fill: "0D9488" } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Qty", bold: true, color: "FFFFFF" })] })], shading: { fill: "0D9488" } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Price", bold: true, color: "FFFFFF" })] })], shading: { fill: "0D9488" } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Total", bold: true, color: "FFFFFF" })] })], shading: { fill: "0D9488" } }),
        ],
      }),
    ];

    docData.line_items.forEach((item) => {
      tableRows.push(
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.category })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: item.description })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: String(item.quantity) })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: Number(item.unit_price).toLocaleString() })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: Number(item.total).toLocaleString() })] })] }),
          ],
        })
      );
    });

    const pricingTable = new Table({
      rows: tableRows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
    });

    children.push(pricingTable);

    // Add totals block
    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: `TAX: ${docData.tax_rate}% | DISCOUNT: ${docData.currency} ${Number(docData.discount).toLocaleString()}\n`,
            size: 20,
            color: "64748B",
          }),
          new TextRun({
            text: `GRAND TOTAL: ${docData.currency} ${Number(docData.total).toLocaleString()}`,
            bold: true,
            size: 24,
            color: "0D9488",
          }),
        ],
        spacing: { before: 200, after: 400 },
      })
    );
  }

  const wordDoc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return Packer.toBlob(wordDoc);
}

// DOCX Generator for official Company Letters
import type { LetterType } from "@/types/erp";

export async function generateLetterDOCX(params: {
  letterId: string;
  letterType: LetterType;
  recipientName: string;
  subject: string;
  content: Record<string, string>;
  date: string;
}): Promise<Blob> {
  const children: any[] = [];

  // Header Banner title
  children.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: "PROLX DIGITAL AGENCY",
          bold: true,
          size: 28,
          color: "0D9488",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: `Official Document Ref: ${params.letterId}`,
          size: 18,
          color: "64748B",
        }),
      ],
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Date: ${params.date}`,
          size: 20,
          color: "334155",
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Recipient: ${params.recipientName}`,
          bold: true,
          size: 22,
          color: "0F172A",
        }),
      ],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Subject: ${params.subject}`,
          bold: true,
          size: 24,
          color: "0F172A",
        }),
      ],
      spacing: { after: 400 },
    })
  );

  // Content Paragraphs
  const bodyText = `Dear ${params.recipientName},\n\n` + (params.content.body || "Please refer to standard letter templates.");
  bodyText.split("\n").forEach((paragraphText) => {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: paragraphText,
            size: 22,
            color: "334155",
          }),
        ],
        spacing: { after: 150 },
      })
    );
  });

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Authorized Signatory",
          bold: true,
          size: 22,
          color: "0F172A",
        }),
      ],
      spacing: { before: 800 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Prolx Digital Agency",
          size: 18,
          color: "64748B",
        }),
      ],
    })
  );

  const wordDoc = new Document({
    sections: [
      {
        children,
      },
    ],
  });

  return Packer.toBlob(wordDoc);
}
