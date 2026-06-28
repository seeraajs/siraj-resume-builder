/**
 * CSS Color Parser and Converter Utility
 * 
 * Highly robust implementation for parsing OKLCH (Oklch) CSS color declarations 
 * and converting them to standard rgb() or rgba() equivalents. This is critical for 
 * rendering engines like html2canvas, which do not natively support modern OKLCH color spaces 
 * and fail with parsing exceptions.
 */

/**
 * Converts an OKLCH color string into standard RGB/RGBA representation.
 * Handles space-separated values, slash-separated alpha, percentages, and degree values.
 * 
 * Format examples:
 * - oklch(0.6 0.15 120)
 * - oklch(60% 0.15 120deg)
 * - oklch(0.6 0.25 240 / 0.5)
 * - oklch(0.6 0.25 240 / 50%)
 */
export function oklchToRgb(oklchStr: string): string {
  // Normalize the input string by stripping oklch( and the closing parenthesis
  let cleanStr = oklchStr.trim().replace(/^oklch\(/i, '').replace(/\)$/, '').trim();
  
  // Format could use slashes for alpha: e.g. "0.6 0.15 120 / 0.5" or "0.6 0.15 120 / 50%"
  let mainParts = cleanStr;
  let alphaPart: string | null = null;
  
  if (cleanStr.includes('/')) {
    const splitParts = cleanStr.split('/');
    mainParts = splitParts[0].trim();
    if (splitParts[1]) {
      alphaPart = splitParts[1].trim();
    }
  }

  // Extract all numeric tokens (optionally with %, deg, or rad)
  // Matching floats, integers, negative values, decimals, percents, and units
  const regex = /[-+]?[\d.]+(?:%|deg|rad)?/g;
  const matches = mainParts.match(regex);
  if (!matches || matches.length < 3) {
    return 'rgb(37, 99, 235)'; // Fallback to safe blue instead of returning raw oklch which crashes html2canvas!
  }

  // Parse L (Lightness), C (Chroma), H (Hue)
  let L = parseFloat(matches[0]);
  if (matches[0].includes('%')) {
    L = L / 100;
  }

  let C = parseFloat(matches[1]);
  if (matches[1].includes('%')) {
    C = C / 100;
  }

  // Hue can have deg, rad, or be a raw number
  let H = parseFloat(matches[2]);
  if (matches[2].includes('deg')) {
    H = parseFloat(matches[2].replace('deg', ''));
  } else if (matches[2].includes('rad')) {
    const rad = parseFloat(matches[2].replace('rad', ''));
    H = (rad * 180) / Math.PI;
  } else if (matches[2].includes('%')) {
    H = (parseFloat(matches[2].replace('%', '')) / 100) * 360;
  }

  // Parse Alpha if present
  let alpha: number | undefined = undefined;
  if (alphaPart) {
    let aVal = parseFloat(alphaPart);
    if (alphaPart.includes('%')) {
      aVal = aVal / 100;
    }
    alpha = aVal;
  } else if (matches.length >= 4) {
    // If alpha is in the matches (non-standard space separation instead of slash)
    let aVal = parseFloat(matches[3]);
    if (matches[3].includes('%')) {
      aVal = aVal / 100;
    }
    alpha = aVal;
  }

  // Clamp L, C, H, Alpha to safe rendering ranges
  L = Math.max(0, Math.min(1, L));
  C = Math.max(0, Math.min(0.4, C));
  H = ((H % 360) + 360) % 360;
  if (alpha !== undefined) {
    alpha = Math.max(0, Math.min(1, alpha));
  }

  // Transform OKLCH -> OKLAB coordinates
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  // Transform OKLAB -> LMS cone space
  const l_ = L + 0.3963377774 * a + 0.2158017574 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = Math.max(0, l_ * l_ * l_);
  const m = Math.max(0, m_ * m_ * m_);
  const s = Math.max(0, s_ * s_ * s_);

  // LMS -> sRGB Linear coordinates
  const r_linear = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g_linear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b_linear = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  // sRGB Linear -> Standard sRGB with gamma-correction
  const transferFunction = (val: number) => {
    if (val <= 0.0031308) return 12.92 * val;
    return 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
  };

  const r = Math.round(Math.max(0, Math.min(1, transferFunction(r_linear))) * 255);
  const g = Math.round(Math.max(0, Math.min(1, transferFunction(g_linear))) * 255);
  const bVal = Math.round(Math.max(0, Math.min(1, transferFunction(b_linear))) * 255);

  if (alpha !== undefined) {
    return `rgba(${r}, ${g}, ${bVal}, ${alpha})`;
  }
  return `rgb(${r}, ${g}, ${bVal})`;
}

/**
 * Searches a stylesheet rule set or HTML markup text and recursively maps all oklch() colors 
 * with their absolute RGB or RGBA equivalent string.
 */
export function sanitizeOklchColors(stylesOrHtml: string | null | undefined): string {
  if (!stylesOrHtml || typeof stylesOrHtml !== 'string') return stylesOrHtml || '';
  if (!stylesOrHtml.toLowerCase().includes('oklch(')) return stylesOrHtml;

  // Regular expression matching any oklch(something) block safely
  // Catches characters inside parentheses, handling nested functions or multiple lines
  const oklchPattern = /oklch\(\s*[^)]+\s*\)/gi;
  
  return stylesOrHtml.replace(oklchPattern, (match) => {
    try {
      return oklchToRgb(match);
    } catch (e) {
      console.warn("Failed converting matched OKLCH color segment:", match, e);
      return 'rgb(37, 99, 235)'; // Fallback to safe blue instead of original oklch which crashes html2canvas!
    }
  });
}
