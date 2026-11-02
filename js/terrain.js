// Realistic Indian Countryside Terrain with PBR Dirt, Wet Mud, and Murky Water Pits
class VillageTerrain {
  constructor(scene) {
    this.scene = scene;
    this.width = 420;
    this.length = 1950;
    this.segX = 160;
    this.segZ = 450;

    // 5 Challenging Water-filled Mud Pits
    this.waterPits = [
      { id: 1, x: 0, z: 340, radius: 18, depth: 1.8, name: "Gokul Outskirts Puddle" },
      { id: 2, x: 0, z: 780, radius: 22, depth: 2.4, name: "Barsana Clay Crater" },
      { id: 3, x: 0, z: 920, radius: 24, depth: 2.8, name: "Nandgaon Marsh Trench" },
      { id: 4, x: 0, z: 1160, radius: 28, depth: 3.4, name: "Yamuna Mud Quagmire" },
      { id: 5, x: 0, z: 1420, radius: 25, depth: 2.6, name: "Vrindavan Approach Slough" }
    ];

    this.waterPits.forEach(p => {
      p.x = this.getRoadCenter(p.z) + (Math.sin(p.z) * 1.5);
    });

    this.waterPlanes = [];
    this.buildTerrain();
    this.buildWaterPitsVisuals();
  }

  getRoadCenter(z) {
    return 32 * Math.sin(z * 0.0032) + 16 * Math.sin(z * 0.0085) + 6 * Math.cos(z * 0.017);
  }

  getElevation(x, z) {
    if (z < 120 && Math.abs(x) < 40) return 0.5;
    if (z > 1650) return 3.0 + Math.sin(x * 0.04) * 0.8;

    const roadX = this.getRoadCenter(z);
    const distToRoad = Math.abs(x - roadX);

    let baseH = Math.sin(z * 0.007) * 3.5 + Math.cos(x * 0.02) * 2.5;

    // Road ruts & depression
    if (distToRoad < 9.5) {
      baseH -= (1.0 - (distToRoad / 9.5)) * 0.9;
      // Twin tire ruts
      const rutOffset = Math.abs(distToRoad - 3.2);
      if (rutOffset < 1.3) {
        baseH -= (1.3 - rutOffset) * 0.4;
      }
    }

    // Water pit depressions
    for (let p of this.waterPits) {
      const dx = x - p.x;
      const dz = z - p.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < p.radius) {
        const falloff = Math.cos((dist / p.radius) * Math.PI * 0.5);
        baseH -= falloff * p.depth * 1.45;
      }
    }

    return baseH;
  }

  buildTerrain() {
    const geo = new THREE.PlaneGeometry(this.width, this.length, this.segX, this.segZ);
    geo.rotateX(-Math.PI / 2);
    geo.translate(0, 0, this.length / 2);

    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    // Color tones for realistic soil blending
    const colDryEarth = new THREE.Color(0xa67c52);
    const colWetMud = new THREE.Color(0x382212);
    const colDeepPit = new THREE.Color(0x1e1208);
    const colGrass = new THREE.Color(0x6b823e);
    const colDryGrass = new THREE.Color(0x8a7d4a);

    for (let i = 0; i < pos.count; i++) {
      const vx = pos.getX(i);
      const vz = pos.getZ(i);
      const vy = this.getElevation(vx, vz);
      pos.setY(i, vy);

      const roadX = this.getRoadCenter(vz);
      const distToRoad = Math.abs(vx - roadX);

      let inPitFactor = 0;
      for (let p of this.waterPits) {
        const dist = Math.sqrt((vx - p.x) ** 2 + (vz - p.z) ** 2);
        if (dist < p.radius) {
          inPitFactor = Math.max(inPitFactor, 1 - (dist / p.radius));
        }
      }

      let vertexCol;
      if (inPitFactor > 0.3) {
        vertexCol = colDeepPit.clone().lerp(colWetMud, 1 - inPitFactor);
      } else if (distToRoad < 6.5) {
        const rutNoise = Math.sin(vx * 1.2) * Math.cos(vz * 0.9);
        vertexCol = colWetMud.clone().lerp(colDryEarth, 0.3 + rutNoise * 0.2);
      } else if (distToRoad < 12.0) {
        const t = (distToRoad - 6.5) / 5.5;
        vertexCol = colDryEarth.clone().lerp(colDryGrass, t);
      } else {
        const grassNoise = Math.sin(vx * 0.05) * Math.sin(vz * 0.05);
        vertexCol = colDryGrass.clone().lerp(colGrass, Math.max(0, grassNoise * 0.5 + 0.5));
      }

      colors[i * 3] = vertexCol.r;
      colors[i * 3 + 1] = vertexCol.g;
      colors[i * 3 + 2] = vertexCol.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    // Procedural PBR Soil & Road Textures
    const dirtTex = window.ProceduralTextures ? ProceduralTextures.createDirtRoadTexture() : null;
    const normalMap = window.ProceduralTextures ? ProceduralTextures.createSoilNormalMap() : null;

    const mat = new THREE.MeshStandardMaterial({
      map: dirtTex,
      normalMap: normalMap,
      normalScale: new THREE.Vector2(1.5, 1.5),
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.08,
      flatShading: false
    });

    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);
  }

  buildWaterPitsVisuals() {
    const waterGeo = new THREE.CircleGeometry(1, 36);
    waterGeo.rotateX(-Math.PI / 2);

    const waterNormal = window.ProceduralTextures ? ProceduralTextures.createWaterNormalTexture() : null;

    this.waterPits.forEach(p => {
      const groundH = this.getElevation(p.x + p.radius * 0.95, p.z);
      const waterH = groundH - 0.42;
      p.waterLevel = waterH;

      // Realistic murky brown muddy water material with specular shine
      const waterMat = new THREE.MeshStandardMaterial({
        color: 0x3a3022,
        normalMap: waterNormal,
        normalScale: new THREE.Vector2(1.2, 1.2),
        roughness: 0.12,
        metalness: 0.9,
        transparent: true,
        opacity: 0.88,
        depthWrite: false
      });

      const waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.scale.set(p.radius * 0.94, 1, p.radius * 0.94);
      waterMesh.position.set(p.x, waterH, p.z);
      this.scene.add(waterMesh);

      // Warning stakes / hazard markers
      this.createPitMarkers(p);

      this.waterPlanes.push({
        mesh: waterMesh,
        baseY: waterH,
        timeOffset: Math.random() * 10
      });
    });
  }

  createPitMarkers(pit) {
    const numStakes = 7;
    const stakeGeo = new THREE.CylinderGeometry(0.12, 0.15, 2.6, 8);
    const stakeMat = new THREE.MeshStandardMaterial({ color: 0x5a3d24, roughness: 0.9 });
    const redClothMat = new THREE.MeshStandardMaterial({ color: 0xd62828, roughness: 0.7 });
    const redFlagGeo = new THREE.BoxGeometry(0.55, 0.38, 0.05);

    for (let i = 0; i < numStakes; i++) {
      const angle = (i / numStakes) * Math.PI * 2;
      const sx = pit.x + Math.cos(angle) * (pit.radius * 0.98);
      const sz = pit.z + Math.sin(angle) * (pit.radius * 0.98);
      const sy = this.getElevation(sx, sz);

      const stake = new THREE.Mesh(stakeGeo, stakeMat);
      stake.position.set(sx, sy + 1.15, sz);
      stake.rotation.z = (Math.random() - 0.5) * 0.15;
      this.scene.add(stake);

      if (i % 2 === 0) {
        const flag = new THREE.Mesh(redFlagGeo, redClothMat);
        flag.position.set(sx + 0.22, sy + 2.2, sz);
        this.scene.add(flag);
      }
    }
  }

  update(time) {
    this.waterPlanes.forEach(wp => {
      wp.mesh.position.y = wp.baseY + Math.sin(time * 2.5 + wp.timeOffset) * 0.05;
      if (wp.mesh.material.normalMap) {
        wp.mesh.material.normalMap.offset.x = (time * 0.08) % 1;
        wp.mesh.material.normalMap.offset.y = (time * 0.06) % 1;
      }
    });
  }

  sample(x, z) {
    const h = this.getElevation(x, z);
    const roadX = this.getRoadCenter(z);
    const distToRoad = Math.abs(x - roadX);

    const eps = 0.5;
    const hL = this.getElevation(x - eps, z);
    const hR = this.getElevation(x + eps, z);
    const hD = this.getElevation(x, z - eps);
    const hU = this.getElevation(x, z + eps);
    const normal = new THREE.Vector3(hL - hR, 2 * eps, hD - hU).normalize();

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

    let isMud = false;
    let mudViscosity = 0;

    if (isWater) {
      isMud = true;
      mudViscosity = Math.min(1.0, 0.45 + (waterDepth * 0.35));
    } else if (distToRoad < 7.5) {
      isMud = true;
      mudViscosity = 0.25 + (1.0 - (distToRoad / 7.5)) * 0.4;
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
