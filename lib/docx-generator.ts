import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  PageBreak,
  ExternalHyperlink,
  ImageRun
} from 'docx';

// Helper to fetch or parse imageUrl as Uint8Array for docx ImageRun
async function fetchImageAsUint8Array(imageUrl: string): Promise<Uint8Array | null> {
  try {
    if (imageUrl.startsWith('data:image/')) {
      const base64Data = imageUrl.split(';base64,')[1];
      if (!base64Data) return null;
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    } else {
      // It's a standard URL, fetch it
      const response = await fetch(imageUrl);
      if (!response.ok) return null;
      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    }
  } catch (error) {
    console.error("Failed to parse/fetch image for docx:", error);
    return null;
  }
}

// Clean hex colors because `docx` library expects 6-char hex codes without '#'
const cleanHex = (hex: string | undefined, fallback: string = '475569'): string => {
  if (!hex) return fallback;
  const match = hex.match(/#([0-9a-fA-F]{6})/);
  if (match && match[1]) {
    return match[1];
  }
  return hex.replace('#', '').trim().substring(0, 6) || fallback;
};

export async function generateDocxBlob(
  draft: any,
  template: any,
  scope: 'resume_only' | 'cover_only' | 'full_suite' = 'full_suite'
): Promise<Blob> {
  const deletedFields = draft.deletedFields || [];
  const accentColor = cleanHex(template?.accentHex, '2563eb');
  const primaryColor = cleanHex(template?.primaryColor?.match(/#([0-9a-fA-F]{6})/)?.[0], '0f172a');
  
  const isDarkTheme = template?.name?.toLowerCase()?.includes('black') || 
                      template?.name?.toLowerCase()?.includes('luxury') || 
                      template?.name?.toLowerCase()?.includes('dark') || 
                      template?.name?.toLowerCase()?.includes('midnight') || 
                      template?.name?.toLowerCase()?.includes('cosmic');

  const textColor = isDarkTheme ? '1e293b' : '0f172a'; // MS Word templates look better with dark text for readability
  const mutedColor = '475569';
  const lightBgHex = 'f8fafc';
  
  const experiences = draft.experiences || [];
  const education = draft.education || [];
  const skills = draft.skills || [];
  const projects = draft.projects || [];
  const certifications = draft.certifications || [];
  const trainings = draft.trainings || [];
  const languages = draft.languages || [];
  const references = draft.references || [];
  const socialLinks = draft.socialLinks || [];

  const children: any[] = [];

  // 1. Cover Letter Section (If selected or active cover letter view)
  const hasCoverLetter = (scope === 'cover_only' || scope === 'full_suite') && !deletedFields.includes('coverLetter') && (draft.coverLetter || draft.clBody);
  if (hasCoverLetter) {
    const clBody = draft.clBody || draft.coverLetter || '';
    const clSenderName = draft.clSenderName || draft.fullName || '';
    const clSenderAddress = draft.clSenderAddress || draft.address || '';
    const clRecipientName = draft.clRecipientName || 'Hiring Team';
    const clCompanyName = draft.clCompanyName || 'Target Company';
    const clPositionTitle = draft.clPositionTitle || draft.professionalTitle || 'Open Position';
    const clSubject = draft.clSubject || `APPLICATION: ${clPositionTitle}`;
    const clGreeting = draft.clGreeting || 'Dear hiring team';
    const clClosing = draft.clClosing || 'Sincerely';
    const clSignature = draft.clSignature || clSenderName;
    const clDate = draft.clDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Header
    children.push(
      new Paragraph({
        text: draft.fullName?.toUpperCase() || 'RESUME SENDER',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: draft.professionalTitle || '', bold: true, color: accentColor }),
        ]
      }),
      new Paragraph({ text: '', spacing: { after: 200 } })
    );

    // Sender Block
    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({ text: `${clSenderName}\n`, bold: true, color: accentColor }),
          new TextRun({ text: `${clSenderAddress}\n`, size: 18, color: mutedColor }),
          new TextRun({ text: `${draft.email || ''} | ${draft.phone || ''}`, size: 18, color: mutedColor }),
        ]
      }),
      new Paragraph({ text: '', spacing: { after: 200 } })
    );

    // Date and Recipient
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${clDate}\n\n`, italics: true, color: mutedColor }),
          new TextRun({ text: `${clRecipientName}\n`, bold: true }),
          new TextRun({ text: `${clPositionTitle}\n`, italics: true }),
          new TextRun({ text: `${clCompanyName}\n`, bold: true, color: accentColor }),
        ]
      }),
      new Paragraph({ text: '', spacing: { after: 200 } })
    );

    // Subject
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Subject: ${clSubject}`, bold: true, color: '000000' }),
        ],
        spacing: { after: 200 }
      })
    );

    // Salutation
    children.push(
      new Paragraph({
        text: `${clGreeting},`,
        spacing: { after: 150 }
      })
    );

    // Cover Letter Body - Splitting into paragraphs
    const bodyParagraphs = clBody.split('\n');
    bodyParagraphs.forEach((paraText: string) => {
      if (paraText.trim()) {
        children.push(
          new Paragraph({
            text: paraText.trim(),
            spacing: { after: 150 },
            alignment: AlignmentType.JUSTIFIED
          })
        );
      }
    });

    // Signature Block
    children.push(
      new Paragraph({ text: '', spacing: { after: 100 } }),
      new Paragraph({ text: `${clClosing},`, spacing: { after: 300 } }),
      new Paragraph({
        children: [
          new TextRun({ text: clSignature, bold: true, color: accentColor })
        ]
      })
    );

    if (scope === 'full_suite') {
      children.push(new Paragraph({ children: [new PageBreak()] })); // Force Resume to start on the next page
    }
  }

  // 2. RESUME DOCUMENT
  if (scope === 'resume_only' || scope === 'full_suite') {
    // Collect photo bytes if photo exists and is not excluded
    const photoBytes = !deletedFields.includes('profilePhoto') && draft.profilePhoto 
      ? await fetchImageAsUint8Array(draft.profilePhoto) 
      : null;

    // Contact details compilation
    const contactDetails: string[] = [];
    if (!deletedFields.includes('email') && draft.email) contactDetails.push(`📧 ${draft.email}`);
    if (!deletedFields.includes('phone') && draft.phone) contactDetails.push(`📞 ${draft.phone}`);
    if (!deletedFields.includes('address') && draft.address) contactDetails.push(`📍 ${draft.address}`);

    const personalMeta: string[] = [];
    if (!deletedFields.includes('nationality') && draft.nationality) personalMeta.push(`🗺️ ${draft.nationality}`);
    if (!deletedFields.includes('dateOfBirth') && draft.dateOfBirth) personalMeta.push(`📅 ${draft.dateOfBirth}`);
    if (!deletedFields.includes('gender') && draft.gender) personalMeta.push(`👤 ${draft.gender}`);
    if (!deletedFields.includes('maritalStatus') && draft.maritalStatus) personalMeta.push(`❤️ ${draft.maritalStatus}`);

    const headerParagraphs: any[] = [
      new Paragraph({
        text: draft.fullName?.toUpperCase() || 'SIRAJ AHMED',
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.LEFT,
      }),
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({ text: draft.professionalTitle?.toUpperCase() || '', bold: true, color: accentColor, size: 22 }),
        ],
        spacing: { after: 150 }
      })
    ];

    if (contactDetails.length > 0) {
      headerParagraphs.push(
        new Paragraph({
          text: contactDetails.join('   |   '),
          spacing: { after: 60 },
          alignment: AlignmentType.LEFT
        })
      );
    }

    if (personalMeta.length > 0) {
      headerParagraphs.push(
        new Paragraph({
          text: personalMeta.join('   •   '),
          spacing: { after: 100 },
          alignment: AlignmentType.LEFT
        })
      );
    }

    if (photoBytes) {
      try {
        const photoRun = new ImageRun({
          data: photoBytes,
          transformation: {
            width: 80,
            height: 80,
          },
        } as any);
        
        const photoParagraph = new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [photoRun],
        });

        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 75, type: WidthType.PERCENTAGE },
                    children: headerParagraphs,
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    }
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [photoParagraph],
                    borders: {
                      top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                      right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                    }
                  }),
                ]
              })
            ]
          })
        );
      } catch (err) {
        console.error("Failed to construct ImageRun inside Table for MS Word:", err);
        children.push(...headerParagraphs);
      }
    } else {
      children.push(...headerParagraphs);
    }

    // Line Divider
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ spacing: { before: 0, after: 0 } })],
                borders: {
                  top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  bottom: { style: BorderStyle.SINGLE, size: 16, color: accentColor },
                  left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                  right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
                }
              })
            ]
          })
        ]
      }),
      new Paragraph({ text: '', spacing: { after: 200 } })
    );

  // Profile Summary Section
  if (draft.summary && !deletedFields.includes('summary')) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({ text: 'PROFILE SUMMARY', bold: true, color: accentColor, size: 24 }),
        ],
        spacing: { after: 100 }
      }),
      new Paragraph({
        text: draft.summary,
        spacing: { after: 250 },
        alignment: AlignmentType.JUSTIFIED
      })
    );
  }

  // Helper Section Title builder with border bottom
  const addSectionTitle = (title: string) => {
    children.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({ text: title.toUpperCase(), bold: true, color: accentColor, size: 24 }),
        ],
        spacing: { before: 200, after: 100 },
        keepNext: true
      })
    );
  };

  // Work History Section
  if (experiences.length > 0 && !deletedFields.includes('experiences')) {
    addSectionTitle('Professional Work History');
    
    experiences.forEach((exp: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.position || 'Position', bold: true, color: textColor }),
            new TextRun({ text: ` — ${exp.company || 'Company'} `, bold: true, color: accentColor }),
            new TextRun({ text: ` |  ${exp.duration || ''}`, italics: true, color: mutedColor })
          ],
          spacing: { after: 80 },
          keepNext: true
        }),
        new Paragraph({
          text: exp.details || '',
          spacing: { after: 200 },
          alignment: AlignmentType.JUSTIFIED
        })
      );
    });
  }

  // Core Skills
  if (skills.length > 0 && !deletedFields.includes('skills')) {
    addSectionTitle('Core Strategic Skills');
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: skills.map((s: string) => `⚡ ${s}`).join('   •   '), bold: true, color: textColor })
        ],
        spacing: { after: 250 },
        keepNext: true
      })
    );
  }

  // Projects & Initiatives
  if (projects.length > 0 && !deletedFields.includes('projects')) {
    addSectionTitle('Key Projects & Initiatives');
    projects.forEach((proj: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.title || 'Project Name', bold: true, color: textColor }),
            new TextRun({ text: ` (${proj.role || 'Role'})`, italics: true }),
            new TextRun({ text: `  ${proj.duration || ''}`, italics: true, color: mutedColor })
          ],
          spacing: { after: 80 },
          keepNext: true
        }),
        new Paragraph({
          text: proj.details || '',
          spacing: { after: 200 },
          alignment: AlignmentType.JUSTIFIED
        })
      );
    });
  }

  // Academic Background
  if (education.length > 0 && !deletedFields.includes('education')) {
    addSectionTitle('Academic Background');
    education.forEach((edu: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.degree || 'Degree', bold: true, color: textColor }),
            new TextRun({ text: `  ${edu.duration || ''}`, italics: true, color: mutedColor })
          ],
          spacing: { after: 60 },
          keepNext: true
        }),
        new Paragraph({
          text: edu.school || 'School/University',
          spacing: { after: 150 },
          alignment: AlignmentType.LEFT
        })
      );
    });
  }

  // Certifications
  if (certifications.length > 0 && !deletedFields.includes('certifications')) {
    addSectionTitle('Certifications & Licenses');
    certifications.forEach((cert: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: cert.title || 'Certification', bold: true, color: textColor }),
            new TextRun({ text: `  ${cert.date || ''}`, italics: true, color: mutedColor })
          ],
          spacing: { after: 40 },
          keepNext: true
        }),
        new Paragraph({
          text: `Issuer: ${cert.issuer || ''}`,
          spacing: { after: 150 }
        })
      );
    });
  }

  // Specializations & Trainings
  if (trainings.length > 0 && !deletedFields.includes('trainings')) {
    addSectionTitle('Specializations & Professional Trainings');
    trainings.forEach((trn: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: trn.title || 'Training', bold: true, color: textColor }),
            new TextRun({ text: `  ${trn.date || ''}`, italics: true, color: mutedColor })
          ],
          spacing: { after: 60 },
          keepNext: true
        }),
        new Paragraph({
          text: `Provider: ${trn.provider || ''}`,
          spacing: { after: 100 },
          keepNext: true
        })
      );
      if (trn.details) {
        children.push(
          new Paragraph({
            text: trn.details,
            spacing: { after: 150 },
            alignment: AlignmentType.LEFT
          })
        );
      }
    });
  }

  // Languages
  if (languages.length > 0 && !deletedFields.includes('languages')) {
    addSectionTitle('Languages');
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: languages.map((l: any) => `${l.name} (🗣️ ${l.proficiency})`).join('   •   '), bold: true })
        ],
        spacing: { after: 200 }
      })
    );
  }

  // Custom Fields
  const customFields = draft.customFields || [];
  if (customFields.length > 0) {
    addSectionTitle('Key Core Attributes');
    customFields.forEach((field: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${field.label}: `, bold: true, color: accentColor }),
            new TextRun({ text: field.value || '' })
          ],
          spacing: { after: 100 }
        })
      );
    });
  }

  // References
  if (references.length > 0 && !deletedFields.includes('references')) {
    addSectionTitle('References');
    references.forEach((ref: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: ref.name || 'Reference', bold: true, color: textColor }),
            new TextRun({ text: `  —  ${ref.organization || ''}`, italics: true, color: mutedColor }),
          ],
          spacing: { after: 40 }
        }),
        new Paragraph({
          text: `Contact: 📞 ${ref.contact}`,
          spacing: { after: 150 }
        })
      );
    });
  }

  // Social Links
  if (socialLinks.length > 0) {
    addSectionTitle('Contact Networks & Links');
    socialLinks.forEach((link: any) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${link.platform?.toUpperCase()}: `, bold: true, color: accentColor }),
            new TextRun({ text: `${link.url || ''}` })
          ],
          spacing: { after: 80 }
        })
      );
    });
  }
  }

  // Build Document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}
