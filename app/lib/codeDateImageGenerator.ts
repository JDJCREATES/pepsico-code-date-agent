/**
 * Programmatically generates code date overlays on base chip bag images
 */

export interface CodeDateConfig {
  date: string; // "22FEB2022"
  codeLine: string; // "1 92 1 319 13"
  time: string; // "13:08"
  position: 'correct' | 'off_bellmark' | 'on_bellmark';
  quality: 'good' | 'faded' | 'unreadable';
}

export interface GeneratedImage {
  dataUrl: string;
  config: CodeDateConfig;
  violations: string[];
}

// Generate random code date
export function generateRandomCodeDate(): CodeDateConfig {
  const now = new Date();
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  // Random date within last 60 days
  const daysAgo = Math.floor(Math.random() * 60);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  // Code line: Day/Plant/Shift/Julian/Line - all smashed together
  // This is Line 3, Plant 37
  const dayOfWeek = Math.floor(Math.random() * 7) + 1;
  const plantCode = '37'; // Fixed plant code
  const shift = Math.floor(Math.random() * 3) + 1;
  const julian = Math.floor(Math.random() * 365) + 1;
  const line = '3'; // Fixed line number
  
  // Time
  const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
  const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
  
  // Quality issues - 15% chance of problems (reduced from 20%)
  const qualityRoll = Math.random();
  let quality: 'good' | 'faded' | 'unreadable' = 'good';
  if (qualityRoll < 0.03) quality = 'unreadable';
  else if (qualityRoll < 0.15) quality = 'faded';
  
  // Position issues - 10% chance of problems (reduced from 15%)
  const positionRoll = Math.random();
  let position: 'correct' | 'off_bellmark' | 'on_bellmark' = 'correct';
  if (positionRoll < 0.03) position = 'on_bellmark'; // Critical!
  else if (positionRoll < 0.10) position = 'off_bellmark';
  
  return {
    date: `${day}${month}${year}`,
    codeLine: `${dayOfWeek}${plantCode}${shift}${julian}${line}`, // All smashed together
    time: `${hour}:${minute}`,
    position,
    quality,
  };
}

// Generate code date image overlay
export async function generateCodeDateOverlay(
  baseImagePath: string,
  config: CodeDateConfig
): Promise<GeneratedImage> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      console.log('[IMG-GEN] Canvas size:', canvas.width, 'x', canvas.height);
      
      // Draw base image
      ctx.drawImage(img, 0, 0);
      
      // Calculate position based on config
      // Bellmark is the quality seal at top
      // Code date should be BELOW "GUARANTEED FRESH UNTIL PRINTED DATE" text
      let x = canvas.width * 0.62; // Center-right of bag
      let y = canvas.height * 0.55; // Much lower, in middle-lower area
      
      if (config.position === 'on_bellmark') {
        // Code date overlaps the bellmark (CRITICAL violation)
        x = canvas.width * 0.58;
        y = canvas.height * 0.35;
      } else if (config.position === 'off_bellmark') {
        // Too far from bellmark (moderate violation)
        x = canvas.width * 0.75;
        y = canvas.height * 0.65;
      }
      
      // Apply quality effects
      let opacity = 1.0;
      let fontSize = Math.floor(canvas.width * 0.05); // Scaled up from 0.04 to 0.05
      
      if (config.quality === 'faded') {
        opacity = 0.55;
      } else if (config.quality === 'unreadable') {
        opacity = 0.3;
        fontSize = Math.floor(fontSize * 0.8);
      }
      
      // Draw code date text - BLACK text on the orange/red bag
      ctx.globalAlpha = opacity;
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${fontSize}px "Courier New", monospace`;
      ctx.textAlign = 'center'; // Center the text
      
      const lineHeight = fontSize + 6;
      
      console.log('[IMG-GEN] Drawing code date at:', x, y, 'fontSize:', fontSize, 'opacity:', opacity);
      console.log('[IMG-GEN] Date:', config.date, 'Code:', config.codeLine, 'Time:', config.time);
      
      // Line 1: Date (22FEB2022)
      ctx.fillText(config.date, x, y);
      
      // Line 2: Code line (137133193) - all smashed together
      ctx.fillText(config.codeLine, x, y + lineHeight);
      
      // Line 3: PMO 37 + Time (37 13:08)
      ctx.fillText(`37 ${config.time}`, x, y + lineHeight * 2);
      
      // Determine violations
      const violations: string[] = [];
      if (config.position === 'on_bellmark') violations.push('code_date_on_bellmark');
      else if (config.position === 'off_bellmark') violations.push('code_date_off_bellmark');
      
      if (config.quality === 'faded') violations.push('faded_print');
      else if (config.quality === 'unreadable') violations.push('faded_print');
      
      console.log('[IMG-GEN] Generated image with violations:', violations);
      
      const result = {
        dataUrl: canvas.toDataURL('image/jpeg', 0.92),
        config,
        violations: violations.length > 0 ? violations : ['none'],
      };
      
      resolve(result);
    };
    
    img.onerror = (error) => {
      console.error('[IMG-GEN] Failed to load image:', baseImagePath, error);
      reject(new Error(`Failed to load base image: ${baseImagePath}`));
    };
    
    console.log('[IMG-GEN] Loading base image:', baseImagePath);
    img.src = baseImagePath;
  });
}

// Generate a batch of images for testing
export async function generateImageBatch(count: number = 10): Promise<GeneratedImage[]> {
  console.log(`[IMG-GEN] Starting batch generation of ${count} images...`);
  
  const baseImages = [
    '/code-date-images/base_cheeto_film.jpg',
    '/code-date-images/base_cheeto_film_miscalibrated_left.jpg',
    '/code-date-images/base_cheeto_film_miscalibrated_right.jpg',
  ];
  
  const results: GeneratedImage[] = [];
  
  for (let i = 0; i < count; i++) {
    const baseImage = baseImages[i % baseImages.length];
    const config = generateRandomCodeDate();
    
    console.log(`[IMG-GEN] Generating image ${i + 1}/${count}:`, {
      baseImage,
      position: config.position,
      quality: config.quality,
    });
    
    try {
      const generated = await generateCodeDateOverlay(baseImage, config);
      results.push(generated);
      console.log(`[IMG-GEN] ✓ Image ${i + 1} generated successfully`);
    } catch (error) {
      console.error(`[IMG-GEN] ✗ Failed to generate image ${i + 1}:`, error);
    }
  }
  
  console.log(`[IMG-GEN] Batch complete: ${results.length}/${count} images generated`);
  return results;
}
