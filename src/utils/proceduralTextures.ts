import * as THREE from "three";

/**
 * Procedurally generates an earthy lush grass texture for the endless terrain.
 */
export function createGrassTexture(): THREE.CanvasTexture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Base lush forest green gradient
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, "#3e5f35");
    grad.addColorStop(0.5, "#486e3f");
    grad.addColorStop(1, "#36552f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Multi-tone organic noise and grass flecks
    const colors = ["#2f4a28", "#537c46", "#34552b", "#5e8a4f", "#283f21", "#689456"];
    for (let i = 0; i < 7000; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 2.8 + 0.8;
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 1.8, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle dark earthy patches
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = Math.random() * 30 + 10;
      const pGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
      pGrad.addColorStop(0, "rgba(28, 43, 22, 0.45)");
      pGrad.addColorStop(1, "rgba(28, 43, 22, 0)");
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(30, 60);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Procedurally generates an ancient mossy stone slab / flagstone road texture.
 */
export function createRoadTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Base aged stone color with green moss undertone
    ctx.fillStyle = "#515e4a";
    ctx.fillRect(0, 0, width, height);

    // Stone flagstone grid with slight irregularity
    const rows = 16;
    const cols = 6;
    const cellW = width / cols;
    const cellH = height / rows;

    for (let r = 0; r < rows; r++) {
      const yOffset = (r % 2 === 0 ? 0 : cellW * 0.45);
      for (let c = -1; c <= cols; c++) {
        const x = c * cellW + yOffset;
        const y = r * cellH;
        const w = cellW - 6;
        const h = cellH - 6;

        // Individual stone color variation
        const tone = Math.floor(Math.sin(r * 13 + c * 37) * 18);
        const stoneColor = `rgb(${88 + tone}, ${100 + tone}, ${82 + tone})`;
        ctx.fillStyle = stoneColor;
        ctx.fillRect(x + 3, y + 3, w, h);

        // Stone inner bevel / highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.fillRect(x + 3, y + 3, w, 3);
        ctx.fillRect(x + 3, y + 3, 3, h);

        // Stone inner shadow
        ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
        ctx.fillRect(x + 3, y + h, w, 3);
        ctx.fillRect(x + w, y + 3, 3, h);

        // Moss specks on stones
        for (let m = 0; m < 25; m++) {
          const mx = x + 4 + Math.random() * (w - 8);
          const my = y + 4 + Math.random() * (h - 8);
          ctx.fillStyle = Math.random() > 0.4 ? "#3d5733" : "#2f4227";
          ctx.beginPath();
          ctx.arc(mx, my, Math.random() * 2.2 + 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Mortar lines / crevices with dense green moss
    ctx.fillStyle = "#22321e";
    for (let r = 0; r <= rows; r++) {
      ctx.fillRect(0, r * cellH - 2, width, 5);
    }
    // Road border curbs
    ctx.fillStyle = "#3a4734";
    ctx.fillRect(0, 0, 14, height);
    ctx.fillRect(width - 14, 0, 14, height);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 10);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
