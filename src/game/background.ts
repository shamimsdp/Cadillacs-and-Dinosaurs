/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Stage 1: City in the Sea Parallax Background Renderer
export class BackgroundRenderer {
  public draw(
    ctx: CanvasRenderingContext2D,
    cameraX: number,
    viewportW: number,
    viewportH: number
  ) {
    // 1. Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 260);
    skyGrad.addColorStop(0, '#60A5FA'); // Vivid arcade blue sky
    skyGrad.addColorStop(0.65, '#93C5FD');
    skyGrad.addColorStop(1, '#BFDBFE');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, viewportW, 260);

    // Fluffy 90s arcade clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    for (let c = 0; c < 6; c++) {
      const cx = ((c * 260 - cameraX * 0.05) % (viewportW + 300)) - 100;
      ctx.beginPath();
      ctx.arc(cx, 60 + (c % 3) * 15, 36, 0, Math.PI * 2);
      ctx.arc(cx + 25, 52 + (c % 3) * 15, 44, 0, Math.PI * 2);
      ctx.arc(cx + 60, 62 + (c % 3) * 15, 32, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Distant Prehistoric Mountain Peaks & Skyline Silhouettes (Parallax 0.12x)
    const distOffset = (cameraX * 0.12) % 600;
    ctx.fillStyle = '#64748B';
    ctx.beginPath();
    ctx.moveTo(0, 240);
    for (let m = -600; m < viewportW + 600; m += 200) {
      const mx = m - distOffset;
      ctx.lineTo(mx + 60, 140);
      ctx.lineTo(mx + 110, 175);
      ctx.lineTo(mx + 160, 125);
      ctx.lineTo(mx + 200, 220);
    }
    ctx.lineTo(viewportW, 240);
    ctx.lineTo(0, 240);
    ctx.closePath();
    ctx.fill();

    // 3. Middleground Overgrown Skyscraper Towers (Parallax 0.35x)
    const midOffset = (cameraX * 0.35) % 800;
    ctx.fillStyle = '#94A3B8';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;

    for (let b = -800; b < viewportW + 800; b += 220) {
      const bx = b - midOffset;
      const bH = 130 + ((b * 13) % 40);

      // Gothic / Deco Skyscraper silhouette
      ctx.fillRect(bx, 240 - bH, 70, bH);
      ctx.strokeRect(bx, 240 - bH, 70, bH);

      // Tower Spire
      ctx.beginPath();
      ctx.moveTo(bx + 15, 240 - bH);
      ctx.lineTo(bx + 35, 240 - bH - 35);
      ctx.lineTo(bx + 55, 240 - bH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Ruined Windows with green vines
      ctx.fillStyle = '#1E293B';
      for (let wy = 240 - bH + 20; wy < 230; wy += 22) {
        ctx.fillRect(bx + 12, wy, 12, 10);
        ctx.fillRect(bx + 46, wy, 12, 10);
      }

      // Overgrown jungle vines hanging off the towers
      ctx.fillStyle = '#15803D';
      ctx.fillRect(bx - 4, 240 - bH + 30, 8, bH - 30);
      ctx.fillRect(bx + 66, 240 - bH + 15, 6, bH - 40);

      ctx.fillStyle = '#94A3B8'; // Reset for next tower
    }

    // 4. Broken Dinosaur Enclosure Wire Netting (Screenshot 2 & 3 feature!)
    const netOffset = (cameraX * 0.5) % 900;
    ctx.save();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.2;
    for (let n = -900; n < viewportW + 900; n += 450) {
      const nx = n - netOffset;
      // Steel support poles
      ctx.fillStyle = '#475569';
      ctx.fillRect(nx + 180, 70, 8, 190);

      // Tattered, torn dinosaur containment net
      ctx.beginPath();
      for (let netY = 80; netY <= 250; netY += 14) {
        ctx.moveTo(nx + 60, netY);
        ctx.lineTo(nx + 280, netY);
      }
      for (let netX = 60; netX <= 280; netX += 16) {
        ctx.moveTo(nx + netX, 80);
        ctx.lineTo(nx + netX, 250);
      }
      ctx.stroke();

      // Giant jagged rip/hole in the net where dinosaurs escaped
      ctx.fillStyle = 'rgba(219, 234, 254, 0.4)';
      ctx.beginPath();
      ctx.ellipse(nx + 170, 160, 45, 65, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 5. Ancient Brick Rampart / Wall separating background from street
    const wallOffset = cameraX % 400;
    const wallY = 250;
    ctx.fillStyle = '#78716C'; // Ancient stone/brick wall
    ctx.fillRect(0, wallY - 30, viewportW, 30);

    // Wall Battlements & cracks
    ctx.fillStyle = '#57534E';
    for (let w = -400; w < viewportW + 400; w += 40) {
      const wx = w - wallOffset;
      ctx.fillRect(wx, wallY - 38, 20, 8); // Crenellations
      // Mortar lines
      ctx.strokeStyle = '#44403C';
      ctx.lineWidth = 1;
      ctx.strokeRect(wx, wallY - 26, 38, 12);
      ctx.strokeRect(wx + 18, wallY - 14, 38, 12);
    }

    // Jungle trees & moss along the wall
    ctx.fillStyle = '#166534';
    for (let t = -400; t < viewportW + 400; t += 180) {
      const tx = t - wallOffset;
      ctx.beginPath();
      ctx.arc(tx + 40, wallY - 42, 28, 0, Math.PI * 2);
      ctx.arc(tx + 65, wallY - 55, 34, 0, Math.PI * 2);
      ctx.arc(tx + 95, wallY - 40, 26, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Ground Plane (2.5D Playfield: Z = 250 to viewportH)
    // Perspective gradient simulating depth into the screen
    const groundGrad = ctx.createLinearGradient(0, wallY, 0, viewportH);
    groundGrad.addColorStop(0, '#71717A'); // Distant stone street
    groundGrad.addColorStop(0.3, '#A1A1AA');
    groundGrad.addColorStop(0.7, '#D4D4D8'); // Near cobblestones
    groundGrad.addColorStop(1, '#A1A1AA');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, wallY, viewportW, viewportH - wallY);

    // Pavement Flagstones & Isometric grid lines
    ctx.strokeStyle = '#52525B';
    ctx.lineWidth = 1.2;

    // Horizontal depth lines
    for (let z = wallY; z < viewportH; z += 24) {
      ctx.beginPath();
      ctx.moveTo(0, z);
      ctx.lineTo(viewportW, z);
      ctx.stroke();
    }

    // Perspective diagonal slab joints
    const slabSpacing = 80;
    const groundOffset = cameraX % slabSpacing;
    for (let s = -groundOffset - 160; s < viewportW + 200; s += slabSpacing) {
      ctx.beginPath();
      ctx.moveTo(s, wallY);
      ctx.lineTo(s - 80, viewportH);
      ctx.stroke();
    }

    // Street vegetation / prehistoric ferns bursting through cracks
    ctx.fillStyle = '#15803D';
    for (let p = -groundOffset; p < viewportW + 200; p += 140) {
      const px = p + 20;
      ctx.beginPath();
      ctx.ellipse(px, wallY + 15, 12, 6, 0.4, 0, Math.PI * 2);
      ctx.ellipse(px + 8, wallY + 22, 10, 5, -0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export const backgroundRenderer = new BackgroundRenderer();
