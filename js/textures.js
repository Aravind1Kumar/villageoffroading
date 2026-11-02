// Procedural Photorealistic PBR Texture Generator for Three.js
// Creates high-resolution canvas textures with color, bump, normal, and roughness maps
class ProceduralTextures {
  static createDirtRoadTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Base rich Indian red-brown loam soil
    ctx.fillStyle = '#855132';
    ctx.fillRect(0, 0, 1024, 1024);

    // Multi-octave dirt noise
    const imgData = ctx.getImageData(0, 0, 1024, 1024);
    const data = imgData.data;

    for (let y = 0; y < 1024; y++) {
      for (let x = 0; x < 1024; x++) {
        const idx = (y * 1024 + x) * 4;

        // Tire ruts along vertical road direction
        const rutDist1 = Math.abs(x - 340);
        const rutDist2 = Math.abs(x - 684);
        let rutDarken = 0;
        if (rutDist1 < 80) rutDarken = (1 - rutDist1 / 80) * 45;
        if (rutDist2 < 80) rutDarken = Math.max(rutDarken, (1 - rutDist2 / 80) * 45);

        // High frequency soil grain
        const n1 = (Math.random() - 0.5) * 35;
        // Low frequency dirt clumps
        const n2 = Math.sin(x * 0.02) * Math.cos(y * 0.02) * 20;

        data[idx] = Math.min(255, Math.max(0, 138 - rutDarken + n1 + n2));     // R
        data[idx + 1] = Math.min(255, Math.max(0, 88 - rutDarken * 0.8 + n1 * 0.8 + n2 * 0.8)); // G
        data[idx + 2] = Math.min(255, Math.max(0, 56 - rutDarken * 0.6 + n1 * 0.6 + n2 * 0.6)); // B
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Scatter pebbles and gravel
    ctx.fillStyle = '#bfa181';
    for (let i = 0; i < 400; i++) {
      const px = Math.random() * 1024;
      const py = Math.random() * 1024;
      const pr = 1 + Math.random() * 3.5;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Wet mud puddle patches
    ctx.fillStyle = 'rgba(50, 30, 18, 0.45)';
    for (let i = 0; i < 12; i++) {
      const px = 200 + Math.random() * 624;
      const py = Math.random() * 1024;
      const rx = 30 + Math.random() * 60;
      const ry = 40 + Math.random() * 90;
      ctx.beginPath();
      ctx.ellipse(px, py, rx, ry, Math.random() * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 28);
    return tex;
  }

  static createSoilNormalMap() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const imgData = ctx.createImageData(512, 512);
    const data = imgData.data;

    for (let y = 0; y < 512; y++) {
      for (let x = 0; x < 512; x++) {
        const idx = (y * 512 + x) * 4;
        // Bump normal calculation
        const dx = (Math.random() - 0.5) * 60;
        const dy = (Math.random() - 0.5) * 60;

        data[idx] = Math.min(255, Math.max(0, 128 + dx)); // Normal X
        data[idx + 1] = Math.min(255, Math.max(0, 128 + dy)); // Normal Y
        data[idx + 2] = 235; // Normal Z pointing up
        data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(6, 40);
    return tex;
  }

  static createGrassTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Natural Indian rural green & golden sun-baked grass
    ctx.fillStyle = '#5c7338';
    ctx.fillRect(0, 0, 512, 512);

    const imgData = ctx.getImageData(0, 0, 512, 512);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * 45;
      data[i] = Math.min(255, Math.max(0, 92 + n * 1.2));     // R (golden tint)
      data[i + 1] = Math.min(255, Math.max(0, 115 + n));       // G
      data[i + 2] = Math.min(255, Math.max(0, 56 + n * 0.7));  // B
    }
    ctx.putImageData(imgData, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(16, 80);
    return tex;
  }

  static createTerracottaRoofTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Baked clay tiles (Khaprail)
    ctx.fillStyle = '#b03d24';
    ctx.fillRect(0, 0, 512, 512);

    // Ribbed overlapping tile lines
    const numRows = 16;
    const rowH = 512 / numRows;

    for (let r = 0; r < numRows; r++) {
      const y = r * rowH;
      // Shadow under overlap
      ctx.fillStyle = '#591c0e';
      ctx.fillRect(0, y, 512, 4);

      // Highlight on edge of tile
      ctx.fillStyle = '#d95a3b';
      ctx.fillRect(0, y + 4, 512, 3);

      // Vertical tile scallops
      for (let x = 0; x < 512; x += 32) {
        ctx.fillStyle = '#7a2815';
        ctx.fillRect(x, y, 2, rowH);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    return tex;
  }

  static createBarkTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#3e2c1c';
    ctx.fillRect(0, 0, 256, 512);

    // Vertical gnarled tree bark grooves
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * 256;
      ctx.fillStyle = Math.random() > 0.5 ? '#24170d' : '#543d29';
      ctx.fillRect(x, 0, 2 + Math.random() * 4, 512);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 3);
    return tex;
  }

  static createTireTreadTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');

    // Tough black rubber
    ctx.fillStyle = '#18181a';
    ctx.fillRect(0, 0, 512, 128);

    // Massive aggressive off-road knobby mud lugs
    ctx.fillStyle = '#262629';
    for (let x = 0; x < 512; x += 32) {
      // V-shaped mud chevron lugs
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x + 16, 64);
      ctx.lineTo(x, 108);
      ctx.lineTo(x + 10, 108);
      ctx.lineTo(x + 26, 64);
      ctx.lineTo(x + 10, 20);
      ctx.closePath();
      ctx.fill();

      // Outer side biters
      ctx.fillRect(x + 2, 4, 18, 12);
      ctx.fillRect(x + 2, 112, 18, 12);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }

  static createWaterNormalTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const img = ctx.createImageData(256, 256);
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 256; x++) {
        const idx = (y * 256 + x) * 4;
        const wave1 = Math.sin(x * 0.1) * Math.cos(y * 0.1);
        const wave2 = Math.sin((x + y) * 0.08);
        const nx = 128 + (wave1 * 35);
        const ny = 128 + (wave2 * 35);

        img.data[idx] = nx;
        img.data[idx + 1] = ny;
        img.data[idx + 2] = 230;
        img.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }
}

window.ProceduralTextures = ProceduralTextures;
