// Indian Countryside Procedural Terrain with Winding Dirt Roads and Water-Filled Mud Pits
class VillageTerrain {
  constructor(scene) {
    this.scene = scene;
    this.width = 380;       // East-West bounds
    this.length = 1950;     // North-South total length (spanning 4 villages)
    this.segX = 140;
    this.segZ = 400;

    // Water-filled mud pits coordinates along the journey
    this.waterPits = [
      { id: 1, x: 0, z: 340, radius: 18, depth: 1.8, name: "Gokul Outskirts Puddle" },
      { id: 2, x: 0, z: 780, radius: 22, depth: 2.4, name: "Barsana Clay Crater" },
      { id: 3, x: 0, z: 920, radius: 24, depth: 2.8, name: "Nandgaon Marsh Trench" },
      { id: 4, x: 0, z: 1160, radius: 28, depth: 3.4, name: "Yamuna Mud Quagmire" },
      { id: 5, x: 0, z: 1420, radius: 25, depth: 2.6, name: "Vrindavan Approach Slough" }
    ];

    // Compute exact X positions of pits based on road centerline
    this.waterPits.forEach(p => {
      p.x = this.getRoadCenter(p.z) + (Math.sin(p.z) * 1.5);
    });

    this.waterPlanes = [];
    this.buildTerrain();
    this.buildWaterPitsVisuals();
  }

  // Winding spline for rural dirt road
  getRoadCenter(z) {
    return 32 * Math.sin(z * 0.0032) + 16 * Math.sin(z * 0.0085) + 6 * Math.cos(z * 0.017);
  }

  // Natural rolling hills elevation
  getElevation(x, z) {
    // Starting courtyard at Gokul is flat
    if (z < 120 && Math.abs(x) < 40) return 0.5;

    // Vrindavan temple grounds at the end are gently elevated
    if (z > 1650) return 3.0 + Math.sin(x * 0.04) * 0.8;

    // Rural countryside rolling mounds and roadside embankments
    const roadX = this.getRoadCenter(z);
    const distToRoad = Math.abs(x - roadX);

    let baseH = Math.sin(z * 0.007) * 3.5 + Math.cos(x * 0.02) * 2.5;

    // Road depression (rutted dirt track worn into the soil)
    if (distToRoad < 9.0) {
      baseH -= (1.0 - (distToRoad / 9.0)) * 0.8;
      // Add tire ruts
      const rutOffset = Math.abs(distToRoad - 3.2);
      if (rutOffset < 1.2) {
        baseH -= (1.2 - rutOffset) * 0.35;
      }
    }

    // Water pit depressions
    for (let p of this.waterPits) {
      const dx = x - p.x;
      const dz = z - p.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < p.radius) {
        const falloff = Math.cos((dist / p.radius) * Math.PI * 0.5);
        baseH -= falloff * p.depth * 1.4;
      }
    }

    return baseH;
  }

  buildTerrain() {
    const geo = new THREE.PlaneGeometry(this.width, this.length, this.segX, this.segZ);
    geo.rotateX(-Math.PI / 2);
    // Align Z from 0 to this.length
    geo.translate(0, 0, this.length / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    // Color palettes for Indian countryside
    const colDryGrass = new THREE.Color(0x948052);  // Indian dry savanna golden/yellowish-green
    const colGreenGrass = new THREE.Color(0x567d46); // Monsoon lush green
    const colDirtRoad = new THREE.Color(0x8a5d3b);   // Reddish brown village dirt
    const colWetMud = new THREE.Color(0x3d2716);     // Dark slick sticky mud
    const colPitBed = new THREE.Color(0x24150b);     // Deep water-logged silt

    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const vy = this.getElevation(vx, vz);
      pos.setY(i, vy);

      // Determine road and mud coloring
      const roadX = this.getRoadCenter(vz);
      const distToRoad = Math.abs(vx - roadX);

      // Check if inside any water pit
      let inPitFactor = 0;
      for (let p of this.waterPits) {
        const dist = Math.sqrt((vx - p.x) ** 2 + (vz - p.z) ** 2);
        if (dist < p.radius) {
          inPitFactor = Math.max(inPitFactor, 1 - (dist / p.radius));
        }
      }

      let vertexCol;
      if (inPitFactor > 0.4) {
        vertexCol = colPitBed.clone().lerp(colWetMud, 1 - inPitFactor);
      } else if (distToRoad < 6.5) {
        // Deep mud ruts along road
        const mudNoise = Math.sin(vx * 1.5) * Math.cos(vz * 0.8);
        vertexCol = colWetMud.clone().lerp(colDirtRoad, 0.35 + mudNoise * 0.2);
      } else if (distToRoad < 12.0) {
        // Road edge blend into dry/green earth
        const t = (distToRoad - 6.5) / 5.5;
        vertexCol = colDirtRoad.clone().lerp(colDryGrass, t);
      } else {
        // Countryside grass with natural noise variation
        const grassNoise = Math.sin(vx * 0.08) * Math.sin(vz * 0.08);
        vertexCol = colDryGrass.clone().lerp(colGreenGrass, Math.max(0, grassNoise * 0.5 + 0.3));
      }

      colors[i * 3] = vertexCol.r;
      colors[i * 3 + 1] = vertexCol.g;
      colors[i * 3 + 2] = vertexCol.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.92,
      metalness: 0.05,
      flatShading: false
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
  }

  buildWaterPitsVisuals() {
    // Create murky water discs for each pit with reflective surface and ripple animation
    const waterGeo = new THREE.CircleGeometry(1, 32);
    waterGeo.rotateX(-Math.PI / 2);

    this.waterPits.forEach(p => {
      // Water level is slightly below the surrounding rim
      const groundH = this.getElevation(p.x + p.radius * 0.95, p.z);
      const waterH = groundH - 0.45;
      p.waterLevel = waterH;

      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x423828,        // Murky brown muddy water
        roughness: 0.15,
        metalness: 0.85,
        transparent: true,
        opacity: 0.85,
        depthWrite: false
      });

      const waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.scale.set(p.radius * 0.92, 1, p.radius * 0.92);
      waterMesh.position.set(p.x, waterH, p.z);
      this.scene.add(waterMesh);

      // Warning bamboo stakes / hazard markers around the deep water pits
      this.createPitMarkers(p);

      this.waterPlanes.push({
        mesh: waterMesh,
        baseY: waterH,
        timeOffset: Math.random() * 10
      });
    });
  }

  createPitMarkers(pit) {
    // Rural painted bamboo poles to mark deep water hazards
    const numStakes = 6;
    const stakeGeo = new THREE.CylinderGeometry(0.12, 0.15, 2.5, 6);
    const stakeMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.9 });
    const redClothMat = new THREE.MeshStandardMaterial({ color: 0xc42020, roughness: 0.7 });
    const redFlagGeo = new THREE.BoxGeometry(0.5, 0.35, 0.05);

    for (let i = 0; i < numStakes; i++) {
      const angle = (i / numStakes) * Math.PI * 2;
      const sx = pit.x + Math.cos(angle) * (pit.radius * 0.98);
      const sz = pit.z + Math.sin(angle) * (pit.radius * 0.98);
      const sy = this.getElevation(sx, sz);

      const stake = new THREE.Mesh(stakeGeo, stakeMat);
      stake.position.set(sx, sy + 1.1, sz);
      stake.rotation.z = (Math.random() - 0.5) * 0.15;
      this.scene.add(stake);

      if (i % 2 === 0) {
        const flag = new THREE.Mesh(redFlagGeo, redClothMat);
        flag.position.set(sx + 0.2, sy + 2.1, sz);
        this.scene.add(flag);
      }
    }
  }

  // Update dynamic water ripples
  update(time) {
    this.waterPlanes.forEach(wp => {
      // Gentle wavy motion
      wp.mesh.position.y = wp.baseY + Math.sin(time * 2.5 + wp.timeOffset) * 0.05;
    });
  }

  // Sample terrain and mud state at any (x, z) coordinate
  sample(x, z) {
    const h = this.getElevation(x, z);
    const roadX = this.getRoadCenter(z);
    const distToRoad = Math.abs(x - roadX);

    // Compute surface normal via finite difference
    const eps = 0.5;
    const hL = this.getElevation(x - eps, z);
    const hR = this.getElevation(x + eps, z);
    const hD = this.getElevation(x, z - eps);
    const hU = this.getElevation(x, z + eps);
    const normal = new THREE.Vector3(hL - hR, 2 * eps, hD - hU).normalize();

    // Check water pit immersion
    let isWater = false;
    let waterDepth = 0;
    let pitRef = null;

    for (let p of this.waterPits) {
      const dist = Math.sqrt((x - p.x) ** 2 + (z - p.z) ** 2);
      if (dist < p.radius) {
        const groundH = h;
        if (p.waterLevel && p.waterLevel > groundH) {
          isWater = true;
          waterDepth = p.waterLevel - groundH;
          pitRef = p;
          break;
        }
      }
    }

    // Mud viscosity factor
    let isMud = false;
    let mudViscosity = 0; // 0 = dry/hard, 1 = deep bog/sludge

    if (isWater) {
      isMud = true;
      mudViscosity = Math.min(1.0, 0.45 + (waterDepth * 0.35));
    } else if (distToRoad < 7.0) {
      isMud = true;
      // Center ruts have higher mud drag
      mudViscosity = 0.25 + (1.0 - (distToRoad / 7.0)) * 0.35;
    }

    return {
      height: h,
      normal: normal,
      isWater: isWater,
      waterDepth: waterDepth,
      isMud: isMud,
      mudViscosity: mudViscosity,
      pitRef: pitRef
    };
  }
}

window.VillageTerrain = VillageTerrain;
