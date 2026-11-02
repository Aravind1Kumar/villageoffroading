// 2D Live HUD Minimap and Progress Tracker
class MiniMap {
  constructor(canvasId, terrain, thar, villages) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.terrain = terrain;
    this.thar = thar;
    this.villages = villages;

    this.width = this.canvas.width;
    this.height = this.canvas.height;
  }

  update() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Clear background
    ctx.fillStyle = 'rgba(28, 22, 16, 0.88)';
    ctx.fillRect(0, 0, w, h);

    // Border
    ctx.strokeStyle = '#d4af37'; // Antique gold
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);

    const totalZ = 1800;
    // World coordinates to canvas mapping (Z goes top to bottom, X is centered)
    const worldToMap = (wx, wz) => {
      const my = 20 + (wz / totalZ) * (h - 40);
      const mx = (w / 2) + (wx / 70) * (w * 0.4);
      return { x: mx, y: my };
    };

    // 1. Draw Winding Mud Road
    ctx.beginPath();
    ctx.strokeStyle = '#8b5a2b'; // Mud road color
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let z = 0; z <= totalZ; z += 20) {
      const rx = this.terrain.getRoadCenter(z);
      const pt = worldToMap(rx, z);
      if (z === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    // Inner road line
    ctx.beginPath();
    ctx.strokeStyle = '#5a3d28';
    ctx.lineWidth = 4;
    for (let z = 0; z <= totalZ; z += 20) {
      const rx = this.terrain.getRoadCenter(z);
      const pt = worldToMap(rx, z);
      if (z === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    }
    ctx.stroke();

    // 2. Draw Dangerous Water Pits
    this.terrain.waterPits.forEach(p => {
      const pt = worldToMap(p.x, p.z);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 6.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(40, 120, 180, 0.85)'; // Water pit blue
      ctx.fill();
      ctx.strokeStyle = '#e74c3c'; // Danger red outline
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // 3. Draw Village Nodes and Labels
    this.villages.villages.forEach((v, idx) => {
      const rx = this.terrain.getRoadCenter(v.centerZ);
      const pt = worldToMap(rx, v.centerZ);

      // Village dot
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = (idx === 3) ? '#f39c12' : '#2ecc71';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Village Label
      ctx.font = '9px sans-serif';
      ctx.fillStyle = '#ffffff';
      const labelSide = (idx % 2 === 0) ? -1 : 1;
      ctx.textAlign = (labelSide < 0) ? 'right' : 'left';
      ctx.fillText(v.name.split(' ')[0], pt.x + labelSide * 8, pt.y + 3);
    });

    // 4. Draw Player Thar Position & Direction Arrow
    const carPos = this.thar.position;
    const playerPt = worldToMap(carPos.x, carPos.z);

    ctx.save();
    ctx.translate(playerPt.x, playerPt.y);
    ctx.rotate(this.thar.rotation.y);

    // Thar Arrow Icon
    ctx.beginPath();
    ctx.moveTo(0, 7);
    ctx.lineTo(-4.5, -6);
    ctx.lineTo(0, -3.5);
    ctx.lineTo(4.5, -6);
    ctx.closePath();
    ctx.fillStyle = '#ff2222'; // Red Thar indicator
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }
}

window.MiniMap = MiniMap;
