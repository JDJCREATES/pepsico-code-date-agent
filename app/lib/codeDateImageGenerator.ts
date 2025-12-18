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
export function generateRandomCodeDate(bagNumber: number = 0): CodeDateConfig {
  const now = new Date();
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  
  // Random date within last 84 days of 2026
  const daysAgo = Math.floor(Math.random() * 84);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = 2026;
  
  // Calculate Julian day (day of year, 001-365/366)
  const startOfYear = new Date(2026, 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  const julian = String(dayOfYear).padStart(3, '0');
  
  // Code line: Day/Plant/Shift/Julian/Line - all smashed together
  // This is Line 3, Plant 87, PMO 37
  const dayOfWeek = '3'; // Fixed day
  const plantCode = '87'; // Plant 87
  const shift = Math.floor(Math.random() * 3) + 1;
  const line = '3'; // Fixed line number
  
  // Time - use current real time for realistic production stamps
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  
  // Quality issues - 10% chance of problems (realistic production rate)
  const qualityRoll = Math.random();
  let quality: 'good' | 'faded' | 'unreadable' = 'good';
  if (qualityRoll < 0.02) quality = 'unreadable'; // 2%
  else if (qualityRoll < 0.10) quality = 'faded'; // 8%
  
  // Position issues - 8% chance of problems (realistic production rate)
  const positionRoll = Math.random();
  let position: 'correct' | 'off_bellmark' | 'on_bellmark' = 'correct';
  if (positionRoll < 0.02) position = 'on_bellmark'; // 2% - Critical!
  else if (positionRoll < 0.08) position = 'off_bellmark'; // 6% - Moderate
  
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
  baseImageDataUrl: string,
  config: CodeDateConfig,
  cameraVariation?: { vertical: number; horizontal: number }
): Promise<GeneratedImage> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      console.log('[IMG-GEN] Canvas size:', canvas.width, 'x', canvas.height);
      
      // Apply camera variation (simulates slight camera movement/vibration)
      const cameraShiftX = cameraVariation?.horizontal || 0;
      const cameraShiftY = cameraVariation?.vertical || 0;
      
      // Calculate pixel shifts for the image
      const imgShiftX = canvas.width * cameraShiftX;
      const imgShiftY = canvas.height * cameraShiftY;
      
      console.log('[IMG-GEN] Camera shift:', { horizontal: cameraShiftX, vertical: cameraShiftY, pixelsX: imgShiftX, pixelsY: imgShiftY });
      
      // Draw base image with camera shift
      ctx.drawImage(img, imgShiftX, imgShiftY);
      
      // Calculate position based on config
      // Bellmark is the quality seal at top
      // Code date should be BELOW "GUARANTEED FRESH UNTIL PRINTED DATE" text
      let x = canvas.width * (0.62 + cameraShiftX); // Center-right of bag
      let y = canvas.height * (0.55 + cameraShiftY); // Much lower, in middle-lower area
      
      // Add subtle random variation to code date position (±1-2% for good bags)
      const codeDateVariationX = config.position === 'correct' 
        ? (Math.random() - 0.5) * 0.02 // ±1% horizontal for good bags
        : 0;
      const codeDateVariationY = config.position === 'correct'
        ? (Math.random() - 0.5) * 0.02 // ±1% vertical for good bags  
        : 0;
      
      x += canvas.width * codeDateVariationX;
      y += canvas.height * codeDateVariationY;
      
      if (config.position === 'on_bellmark') {
        // Code date overlaps the bellmark (CRITICAL violation)
        x = canvas.width * (0.58 + cameraShiftX);
        y = canvas.height * (0.35 + cameraShiftY);
      } else if (config.position === 'off_bellmark') {
        // Too far from bellmark (moderate violation)
        x = canvas.width * (0.75 + cameraShiftX);
        y = canvas.height * (0.65 + cameraShiftY);
      }
      
      // Apply quality effects
      let opacity = 1.0;
      let fontSize = Math.floor(canvas.width * 0.06); // Scaled up from 0.05 to 0.06
      
      if (config.quality === 'faded') {
        opacity = 0.40; // More faded - was 0.55
      } else if (config.quality === 'unreadable') {
        opacity = 0.20; // Much more faded - was 0.3
        fontSize = Math.floor(fontSize * 0.75); // Smaller too
      }
      
      // Draw code date text - BLACK text on the orange/red bag
      ctx.fillStyle = '#000000';
      ctx.font = `bold ${fontSize}px "Courier New", monospace`;
      ctx.textAlign = 'center'; // Center the text
      
      const lineHeight = fontSize + 6;
      
      console.log('[IMG-GEN] Drawing code date at:', x, y, 'fontSize:', fontSize, 'opacity:', opacity);
      console.log('[IMG-GEN] Date:', config.date, 'Code:', config.codeLine, 'Time:', config.time);
      
      // For faded text, randomly fade individual characters more
      if (config.quality === 'faded' || config.quality === 'unreadable') {
        const lines = [config.date, config.codeLine, `37 ${config.time}`];
        lines.forEach((line, lineIndex) => {
          const chars = line.split('');
          let currentX = x - (ctx.measureText(line).width / 2);
          
          chars.forEach((char) => {
            // Random opacity variation for each character in faded text
            const charOpacity = config.quality === 'unreadable' 
              ? opacity * (0.3 + Math.random() * 0.4) // 30-70% of base opacity
              : opacity * (0.7 + Math.random() * 0.3); // 70-100% of base opacity
            
            ctx.globalAlpha = charOpacity;
            ctx.fillText(char, currentX, y + (lineHeight * lineIndex));
            currentX += ctx.measureText(char).width;
          });
        });
      } else {
        // Normal quality - draw solid
        ctx.globalAlpha = opacity;
        ctx.fillText(config.date, x, y);
        ctx.fillText(config.codeLine, x, y + lineHeight);
        ctx.fillText(`37 ${config.time}`, x, y + lineHeight * 2);
      }
      
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
      console.error('[IMG-GEN] Failed to load image:', error);
      reject(new Error('Failed to load base image'));
    };
    
    console.log('[IMG-GEN] Loading base image from data URL');
    img.src = baseImageDataUrl;
  });
}

// Generate a batch of images for testing
export async function generateImageBatch(count: number = 10): Promise<GeneratedImage[]> {
  console.log(`[IMG-GEN] Starting batch generation of ${count} images...`);
  
  // Generate base chip bag images dynamically
  const { generateBaseImages } = await import('./chipBagImageGenerator');
  const baseImages = await generateBaseImages();
  
  // Use miscalibrated images sparingly - only 1-2 times each in the batch
  const leftIndexes = new Set([Math.floor(Math.random() * count)]);
  const rightIndexes = new Set([Math.floor(Math.random() * count)]);
  // Add vertical miscalibration (camera too high/low) - 1-2 times
  const verticalHighIndexes = new Set([Math.floor(Math.random() * count)]);
  const verticalLowIndexes = new Set([Math.floor(Math.random() * count)]);
  
  // Possibly add a second occurrence for each
  if (Math.random() > 0.5) leftIndexes.add(Math.floor(Math.random() * count));
  if (Math.random() > 0.5) rightIndexes.add(Math.floor(Math.random() * count));
  if (Math.random() > 0.5) verticalHighIndexes.add(Math.floor(Math.random() * count));
  if (Math.random() > 0.5) verticalLowIndexes.add(Math.floor(Math.random() * count));
  
  const results: GeneratedImage[] = [];
  
  for (let i = 0; i < count; i++) {
    const config = generateRandomCodeDate(i);
    
    // Select base image - mostly normal, with occasional miscalibration
    let baseImage = baseImages.normal;
    let cameraVariation = { vertical: 0, horizontal: 0 };
    
    // Horizontal miscalibration (left/right images)
    if (leftIndexes.has(i)) {
      baseImage = baseImages.left;
      cameraVariation.horizontal = -0.08; // Shifted left
    } else if (rightIndexes.has(i)) {
      baseImage = baseImages.right;
      cameraVariation.horizontal = 0.08; // Shifted right
    }
    
    // Vertical miscalibration (camera too high/low)
    if (verticalHighIndexes.has(i)) {
      cameraVariation.vertical = -0.06; // Camera too high, code date appears lower
    } else if (verticalLowIndexes.has(i)) {
      cameraVariation.vertical = 0.06; // Camera too low, code date appears higher
    }
    
    // Add subtle variation to all images (realistic vibration/movement)
    if (cameraVariation.horizontal === 0 && cameraVariation.vertical === 0) {
      cameraVariation.horizontal = (Math.random() - 0.5) * 0.02; // ±1% horizontal
      cameraVariation.vertical = (Math.random() - 0.5) * 0.02; // ±1% vertical
    }
    
    console.log(`[IMG-GEN] Generating image ${i + 1}/${count}:`, {
      baseImageType: leftIndexes.has(i) ? 'left' : rightIndexes.has(i) ? 'right' : 'normal',
      position: config.position,
      quality: config.quality,
      cameraVariation,
    });
    
    try {
      const generated = await generateCodeDateOverlay(baseImage, config, cameraVariation);
      results.push(generated);
      console.log(`[IMG-GEN] ✓ Image ${i + 1} generated successfully`);
    } catch (error) {
      console.error(`[IMG-GEN] ✗ Failed to generate image ${i + 1}:`, error);
    }
  }
  
  console.log(`[IMG-GEN] Batch complete: ${results.length}/${count} images generated`);
  return results;
}
