/**
 * Reusable PDF Generation Module
 * 
 * Provides an isolated and production-ready implementation for exporting
 * highly styled resume layouts as A4 PDF documents. Designed specifically to work
 * gracefully in sandbox or iframe-restricted browser environments.
 * 
 * Automatically applies the CSS color utility module to convertmodern OKLCH colors
 * to standard RGB fallbacks before passing the HTML & stylesheets to the rendering engine.
 */

import { sanitizeOklchColors } from './css-color-parser';

interface PDFExportConfig {
  currentDraft: any;
  targetScope: 'resume_only' | 'cover_only' | 'full_suite';
  activeTemplate: any;
  pagesToExport?: string[];
  buildFullExportHtml: (
    draft: any, 
    scope: 'resume_only' | 'cover_only' | 'full_suite', 
    activeTemplate: any, 
    onlyPageNumber?: number, 
    selectedPageIds?: string[]
  ) => string;
}

/**
 * Generates an optimized, high-fidelity PDF Blob by rendering the HTML
 * builder content inside a pristine, hidden iframe to avoid CSS leakage or script collisions.
 */
export async function generatePdfBlob({
  currentDraft,
  targetScope,
  activeTemplate,
  pagesToExport,
  buildFullExportHtml
}: PDFExportConfig): Promise<Blob> {
  if (!currentDraft) {
    throw new Error("No active draft to export PDF");
  }

  // Dynamically load client-only library html2pdf.js
  // @ts-ignore
  const html2pdf = (await import('html2pdf.js')).default;
  const fullName = currentDraft.fullName || 'Siraj Ahmed';

  // Create an isolated iframe for clean, style-isolated PDF rendering
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-10000px';
  iframe.style.top = '-10000px';
  iframe.style.width = '210mm';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    if (iframe.parentNode) {
      document.body.removeChild(iframe);
    }
    throw new Error("Could not construct isolated PDF document container");
  }

  // 1. Compile layout marking markup safely, filtering oklch inline styles in elements.
  const htmlContent = sanitizeOklchColors(
    buildFullExportHtml(currentDraft, targetScope, activeTemplate, undefined, pagesToExport)
  );

  // 2. Scan and aggregate stylesheets from parent document, stripping OKLCH to protect html2canvas CSS parsing engine.
  let aggregatedCss = '';
  
  // Read all styles inside <style> elements.
  const localStyles = document.querySelectorAll('style');
  localStyles.forEach((style) => {
    if (style.textContent) {
      aggregatedCss += style.textContent + '\n';
    }
  });

  // Read all stylesheet rules from active sheets securely.
  for (let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i];
    try {
      // Don't duplicate styles from style nodes we just extracted directly above.
      if (sheet.ownerNode && (sheet.ownerNode as Element).tagName === 'STYLE') {
        continue;
      }
      
      const rules = sheet.cssRules || sheet.rules;
      if (rules) {
        let sheetText = '';
        for (let j = 0; j < rules.length; j++) {
          sheetText += rules[j].cssText + '\n';
        }
        aggregatedCss += sheetText + '\n';
      }
    } catch (err) {
      // Fallback: If stylesheet rules are inaccessible due to CORS (e.g. cross-origin Google fonts),
      // we don't crash, we just let the link nodes handle font injection.
    }
  }

  // Process and sanitize aggregated CSS to convert OKLCH declarations to standard RGB colors.
  const sanitizedCssCombined = sanitizeOklchColors(aggregatedCss);

  // 3. Collate original third-party stylesheet/font link nodes to preserve Google Fonts correctly.
  let headLinksMarkup = '';
  const originalLinks = document.querySelectorAll('link[rel="stylesheet"], link[href*="fonts.googleapis.com"], link[href*="fonts.gstatic.com"]');
  originalLinks.forEach((link) => {
    try {
      const href = link.getAttribute('href') || '';
      // We do NOT want to copy standard local Next.js/Tailwind CSS files directly because they contain un-sanitized oklch() colors;
      // their styles have already been fully aggregated, translated to RGB, and sanitized into sanitizedCssCombined above.
      // We keep Google Fonts or specific external font styling.
      const isGoogleFont = href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com') || href.includes('fonts.gstatic');
      const isLocalStylesheet = 
        href.startsWith('/') || 
        href.includes('_next/') || 
        href.includes('localhost') || 
        (typeof window !== 'undefined' && (href.includes(window.location.host) || href.includes(window.location.hostname)));
      
      if (isGoogleFont || !isLocalStylesheet) {
        headLinksMarkup += link.outerHTML + '\n';
      }
    } catch (err) {
      console.warn("Could not copy original stylesheet reference node:", err);
    }
  });

  // 4. Safely open the document, write the layout markup, the links, and the cleaned stylesheets all as a single unit.
  // This prevents iframeDoc.open() from wiping out dynamically appended styles.
  iframeDoc.open();
  iframeDoc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Export PDF Content Frame</title>
        ${headLinksMarkup}
        <style>
          body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: system-ui, -apple-system, sans-serif !important;
          }
          img {
            max-width: 100% !important;
            height: auto !important;
          }
        </style>
        <style>
          ${sanitizedCssCombined}
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `);
  iframeDoc.close();

  // Async await for all inline image assets to pull in and resolve fully (e.g., profile avatars)
  try {
    const images = Array.from(iframeDoc.getElementsByTagName('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        });
      })
    );
  } catch (err) {
    console.warn("Error preloading images inside isolated PDF layout frame:", err);
  }

  // Small delay to ensure browser paint and reflow processes complete
  await new Promise<void>((resolve) => setTimeout(resolve, 600));

  const fNameStr = fullName.replace(/\s+/g, '_');
  const filename = `${fNameStr}_Resume.pdf`;

  // Standard high resolution and quality scaling options for crisp vector print representation
  const opt = {
    margin: 0,
    filename: filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
      scrollX: 0,
      scrollY: 0,
      window: iframe.contentWindow || window
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    pagebreak: { mode: ['css', 'legacy'] }
  };

  // Temporarily patch getComputedStyle to intercept oklch() color reads by html2canvas
  const originalGetComputedStyle = typeof window !== 'undefined' ? window.getComputedStyle : null;
  const iframeOriginalGetComputedStyle = iframe.contentWindow ? iframe.contentWindow.getComputedStyle : null;

  const proxyStyle = (style: CSSStyleDeclaration) => {
    try {
      return new Proxy(style, {
        get(target, prop) {
          if (prop === 'getPropertyValue') {
            return function(propertyName: string) {
              const val = target.getPropertyValue(propertyName);
              if (typeof val === 'string' && val.toLowerCase().includes('oklch(')) {
                return sanitizeOklchColors(val);
              }
              return val;
            };
          }
          const val = (target as any)[prop];
          if (typeof val === 'string' && val.toLowerCase().includes('oklch(')) {
            return sanitizeOklchColors(val);
          }
          if (typeof val === 'function') {
            return val.bind(target);
          }
          return val;
        }
      });
    } catch (e) {
      return style;
    }
  };

  if (originalGetComputedStyle) {
    window.getComputedStyle = function(elt: Element, pseudoElt?: string | null) {
      const style = originalGetComputedStyle.call(this, elt, pseudoElt);
      return proxyStyle(style) as any;
    };
  }

  if (iframe.contentWindow && iframeOriginalGetComputedStyle) {
    iframe.contentWindow.getComputedStyle = function(elt: Element, pseudoElt?: string | null) {
      const style = iframeOriginalGetComputedStyle.call(this, elt, pseudoElt);
      return proxyStyle(style) as any;
    };
  }

  try {
    const blob = await html2pdf().from(iframeDoc.body).set(opt).output('blob') as Blob;
    return blob;
  } finally {
    // Restore original getComputedStyle methods safely
    if (originalGetComputedStyle && typeof window !== 'undefined') {
      window.getComputedStyle = originalGetComputedStyle;
    }
    if (iframe.contentWindow && iframeOriginalGetComputedStyle) {
      iframe.contentWindow.getComputedStyle = iframeOriginalGetComputedStyle;
    }
    if (iframe.parentNode) {
      document.body.removeChild(iframe);
    }
  }
}
