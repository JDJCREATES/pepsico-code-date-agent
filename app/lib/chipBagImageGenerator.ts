/**
 * Generate generic chip bag images with canvas
 * Creates light blue/white bags with quality seal (bellmark)
 */

export interface BagImageConfig {
  type: 'normal' | 'miscalibrated_left' | 'miscalibrated_right';
  width?: number;
  height?: number;
}

/**
 * Generate a generic chip bag image
 */
export function generateChipBagImage(config: BagImageConfig): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  const width = config.width || 800;
  const height = config.height || 1200;
  canvas.width = width;
  canvas.height = height;

  // Camera shift for miscalibration
  let shiftX = 0;
  if (config.type === 'miscalibrated_left') shiftX = -60;
  if (config.type === 'miscalibrated_right') shiftX = 60;

  ctx.save();
  ctx.translate(shiftX, 0);

  // Background gradient (light blue to white)
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#e0f2ff'); // Light blue top
  gradient.addColorStop(0.4, '#ffffff'); // White middle-upper
  gradient.addColorStop(1, '#f0f9ff'); // Very light blue bottom
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add subtle texture
  ctx.fillStyle = 'rgba(0, 0, 0, 0.01)';
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 3;
    ctx.fillRect(x, y, size, size);
  }

  // Draw bag edges/seams (darker blue lines)
  ctx.strokeStyle = '#93c5fd';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(width * 0.15, 0);
  ctx.lineTo(width * 0.15, height);
  ctx.moveTo(width * 0.85, 0);
  ctx.lineTo(width * 0.85, height);
  ctx.stroke();

  // Add vertical seal line (center)
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width * 0.5, height * 0.1);
  ctx.lineTo(width * 0.5, height * 0.9);
  ctx.stroke();

  // Draw quality seal / bellmark area (circular seal at top-center)
  const sealCenterX = width * 0.58;
  const sealCenterY = height * 0.25;
  const sealRadius = width * 0.12;

  // Outer circle (gold/yellow border)
  ctx.beginPath();
  ctx.arc(sealCenterX, sealCenterY, sealRadius, 0, Math.PI * 2);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 6;
  ctx.stroke();

  // Inner circle (white background)
  ctx.beginPath();
  ctx.arc(sealCenterX, sealCenterY, sealRadius - 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // "QUALITY" text in seal
  ctx.fillStyle = '#1e40af';
  ctx.font = `bold ${width * 0.025}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('QUALITY', sealCenterX, sealCenterY - 10);
  ctx.fillText('SEAL', sealCenterX, sealCenterY + 15);

  // Add star in seal
  drawStar(ctx, sealCenterX, sealCenterY - 35, 8, 15, 5, '#fbbf24');

  // "GUARANTEED FRESH UNTIL PRINTED DATE" text (below seal)
  ctx.fillStyle = '#374151';
  ctx.font = `${width * 0.018}px Arial`;
  ctx.textAlign = 'center';
  ctx.fillText('GUARANTEED FRESH UNTIL', width * 0.58, height * 0.42);
  ctx.fillText('PRINTED DATE', width * 0.58, height * 0.45);

  // Decorative elements
  ctx.strokeStyle = '#93c5fd';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width * 0.25, height * 0.48);
  ctx.lineTo(width * 0.91, height * 0.48);
  ctx.stroke();

  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Draw a star shape
 */
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  color: string
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }

  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * Generate and cache all three base images
 */
export async function generateBaseImages(): Promise<{
  normal: string;
  left: string;
  right: string;
}> {
  console.log('[BAG-GEN] Generating base chip bag images...');
  
  const normal = generateChipBagImage({ type: 'normal' });
  const left = generateChipBagImage({ type: 'miscalibrated_left' });
  const right = generateChipBagImage({ type: 'miscalibrated_right' });

  console.log('[BAG-GEN] ✓ All base images generated');

  return { normal, left, right };
}
