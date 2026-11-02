// Realistic Indian Countryside Architecture and Native Flora
class IndianVillages {
  constructor(scene, terrain) {
    this.scene = scene;
    this.terrain = terrain;

    this.villages = [
      { id: 'gokul', name: 'Gokul (गोकुल)', startZ: 0, centerZ: 100, endZ: 260, title: 'Birthplace of Leelas - Starting Village' },
      { id: 'barsana', name: 'Barsana (बरसाना)', startZ: 480, centerZ: 620, endZ: 750, title: 'Radha Rani Nagar - 2nd Village' },
      { id: 'nandgaon', name: 'Nandgaon (नंदगांव)', startZ: 960, centerZ: 1100, endZ: 1260, title: 'Land of Nanda Baba - 3rd Village' },
      { id: 'vrindavan', name: 'Vrindavan (वृन्दावन)', startZ: 1500, centerZ: 1680, endZ: 1850, title: 'The Holy Abode & Destination' }
    ];

    // High quality procedural materials
    const roofTex = window.ProceduralTextures ? ProceduralTextures.createTerracottaRoofTexture() : null;
    const barkTex = window.ProceduralTextures ? ProceduralTextures.createBarkTexture() : null;

    this.matMudWall = new THREE.MeshStandardMaterial({
      color: 0xc49a6c, // Sun-baked adobe clay plaster
      roughness: 0.95,
      metalness: 0.05
    });

    this.matTerracotta = new THREE.MeshStandardMaterial({
      color: 0xa8381e,
      map: roofTex,
      roughness: 0.82,
      metalness: 0.08
    });

    this.matThatch = new THREE.MeshStandardMaterial({
      color: 0x8a723e,
      roughness: 0.98
    });

    this.matDarkWood = new THREE.MeshStandardMaterial({
      color: 0x362314,
      map: barkTex,
      roughness: 0.85
    });

    this.matFoliage1 = new THREE.MeshStandardMaterial({
      color: 0x2d521e, // Deep Neem green
      roughness: 0.75,
      flatShading: false
    });

    this.matFoliage2 = new THREE.MeshStandardMaterial({
      color: 0x3f6b28, // Fresh Banyan leaf green
      roughness: 0.78
    });

    this.matTrunk = new THREE.MeshStandardMaterial({
      color: 0x422f20,
      map: barkTex,
      roughness: 0.92
    });

    this.matStone = new THREE.MeshStandardMaterial({
      color: 0x9e9484,
      roughness: 0.88
    });

    this.matGold = new THREE.MeshStandardMaterial({
      color: 0xf5b027,
      metalness: 0.88,
      roughness: 0.22
    });

    this.matSaffronFlag = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      roughness: 0.55,
      side: THREE.DoubleSide
    });

    this.matCowWhite = new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.85 });
    this.matCowBrown = new THREE.MeshStandardMaterial({ color: 0x7c4224, roughness: 0.85 });

    this.flags = [];
    this.buildAllVillages();
    this.buildRoadsideScenery();
  }

  buildAllVillages() {
    this.buildGokul();
    this.buildBarsana();
    this.buildNandgaon();
    this.buildVrindavan();
  }

  // --- VILLAGE 1: GOKUL (Krishna's Home) ---
  buildGokul() {
    const roadX = this.terrain.getRoadCenter(40);
    const homeX = roadX - 22;
    const homeZ = 45;
    const homeY = this.terrain.getElevation(homeX, homeZ);

    this.krishnaHomePos = new THREE.Vector3(homeX, homeY, homeZ);
    this.krishnaCarSpawnPos = new THREE.Vector3(homeX + 11, homeY + 0.6, homeZ + 6);

    // Haveli Structure
    const haveli = new THREE.Group();
    haveli.position.set(homeX, homeY, homeZ);

    // Stone plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(19, 0.8, 15), this.matStone);
    plinth.position.y = 0.4;
    haveli.add(plinth);

    // Adobe Clay Walls with whitewashed border
    const walls = new THREE.Mesh(new THREE.BoxGeometry(16.5, 5.6, 12.5), this.matMudWall);
    walls.position.y = 3.2;
    haveli.add(walls);

    // Sloped Terracotta Roof with overhang eaves
    const roof = new THREE.Mesh(new THREE.ConeGeometry(14, 4.6, 4), this.matTerracotta);
    roof.rotateY(Math.PI / 4);
    roof.position.y = 8.2;
    haveli.add(roof);

    // Wooden Veranda with Pillars
    for (let px of [-6.5, -2.2, 2.2, 6.5]) {
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 4.6, 12), this.matDarkWood);
      pillar.position.set(px, 2.5, 7.6);
      haveli.add(pillar);
    }
    const porchRoof = new THREE.Mesh(new THREE.BoxGeometry(15.5, 0.35, 4.2), this.matTerracotta);
    porchRoof.position.set(0, 4.9, 7.6);
    porchRoof.rotation.x = 0.16;
    haveli.add(porchRoof);

    // Carved Teak Wooden Door
    const door = new THREE.Mesh(new THREE.BoxGeometry(2.4, 4.2, 0.25), this.matDarkWood);
    door.position.set(0, 2.4, 6.3);
    haveli.add(door);

    this.scene.add(haveli);

    // Tulsi Vrindavan Planter in courtyard
    const tulsiBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 1.6), this.matStone);
    tulsiBase.position.set(homeX + 4.5, homeY + 0.9, homeZ + 11);
    this.scene.add(tulsiBase);

    const tulsiPlant = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 10), this.matFoliage1);
    tulsiPlant.position.set(homeX + 4.5, homeY + 2.1, homeZ + 11);
    this.scene.add(tulsiPlant);

    // Neem Tree shading Thar parking
    this.createRealisticNeemTree(homeX + 16, homeZ + 8, 1.3);

    // Gokul village huts
    this.createVillageHut(roadX + 24, 52, -Math.PI / 3, 'terracotta');
    this.createVillageHut(roadX + 26, 95, -Math.PI / 2, 'thatch');
    this.createVillageHut(roadX - 25, 130, Math.PI / 2.4, 'terracotta');
    this.createVillageHut(roadX + 22, 160, -Math.PI / 2.2, 'thatch');

    this.createCow(homeX + 8, homeZ + 16, Math.PI / 4, false);
    this.createCow(roadX + 16, 80, -Math.PI / 3, true);
    this.createHaystack(roadX + 18, 120);
    this.createVillageArch('gokul', 210, "GOKUL DHAM (गोकुल धाम)");
  }

  // --- VILLAGE 2: BARSANA ---
  buildBarsana() {
    const centerZ = 620;
    const roadX = this.terrain.getRoadCenter(centerZ);
    this.createVillageArch('barsana', 510, "WELCOME TO BARSANA (बरसाना)");

    for (let i = -3; i <= 3; i++) {
      const z = centerZ + i * 32;
      const rx = this.terrain.getRoadCenter(z);
      const side = (i % 2 === 0) ? 1 : -1;
      const hx = rx + side * (20 + Math.abs(i) * 3);
      this.createVillageHut(hx, z, side > 0 ? -Math.PI / 2 : Math.PI / 2, i % 2 === 0 ? 'terracotta' : 'thatch');

      if (i === 1) this.createWell(rx - 19, z);
      if (i === -1) this.createBullockCart(rx + 17, z + 5, 0.4);
    }

    this.createRealisticNeemTree(roadX - 22, centerZ - 50, 1.2);
    this.createRealisticBanyanTree(roadX + 26, centerZ + 40, 1.2);
    this.createCow(roadX - 16, centerZ + 60, 0.8, true);
  }

  // --- VILLAGE 3: NANDGAON ---
  buildNandgaon() {
    const centerZ = 1100;
    const roadX = this.terrain.getRoadCenter(centerZ);
    this.createVillageArch('nandgaon', 990, "NANDGAON (नंदगांव)");

    this.createRealisticBanyanTree(roadX - 26, centerZ - 60, 1.5);
    this.createRealisticBanyanTree(roadX + 28, centerZ - 10, 1.4);
    this.createRealisticBanyanTree(roadX - 27, centerZ + 50, 1.5);

    this.createGoshala(roadX + 24, centerZ + 20);
    this.createVillageHut(roadX - 25, centerZ - 30, Math.PI / 2.3, 'thatch');
    this.createVillageHut(roadX - 24, centerZ + 20, Math.PI / 2.1, 'terracotta');
    this.createVillageHut(roadX + 26, centerZ + 80, -Math.PI / 2.5, 'terracotta');

    this.createHaystack(roadX - 19, centerZ - 15);
    this.createCow(roadX + 16, centerZ - 40, -0.6, false);
  }

  // --- VILLAGE 4: VRINDAVAN ---
  buildVrindavan() {
    const centerZ = 1680;
    const roadX = this.terrain.getRoadCenter(centerZ);
    this.createVillageArch('vrindavan', 1530, "SACRED VRINDAVAN (पवित्र वृन्दावन)");

    // Grand Nagara Mandir
    const templeZ = centerZ + 50;
    const templeX = roadX;
    const groundY = this.terrain.getElevation(templeX, templeZ);

    const temple = new THREE.Group();
    temple.position.set(templeX, groundY, templeZ);

    // Stone base
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(32, 2.5, 36), this.matStone);
    plinth.position.y = 1.25;
    temple.add(plinth);

    // Mandapa
    const mandapa = new THREE.Mesh(new THREE.BoxGeometry(22, 8, 18), this.matStone);
    mandapa.position.set(0, 5.5, -4);
    temple.add(mandapa);

    // Sanctum
    const sanctum = new THREE.Mesh(new THREE.BoxGeometry(16, 10, 16), this.matStone);
    sanctum.position.set(0, 6.5, 10);
    temple.add(sanctum);

    // Towering Shikhara
    for (let t = 0; t < 7; t++) {
      const frac = t / 7;
      const w = 15 * (1.0 - frac * 0.75);
      const tier = new THREE.Mesh(new THREE.BoxGeometry(w, 2.4, w), this.matStone);
      tier.position.set(0, 11.5 + t * 2.2, 10);
      temple.add(tier);
    }

    // Amalaka & Golden Kalash
    const amalaka = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.2, 1.2, 18), this.matStone);
    amalaka.position.set(0, 27.5, 10);
    temple.add(amalaka);

    const kalash = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3.5, 16), this.matGold);
    kalash.position.set(0, 29.8, 10);
    temple.add(kalash);

    // Saffron Dhwaja (Temple Flag)
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 5.5, 8), this.matGold);
    pole.position.set(0.8, 32.5, 10);
    temple.add(pole);

    const flagMesh = new THREE.Mesh(new THREE.BufferGeometry(), this.matSaffronFlag);
    const flagV = new Float32Array([0, 0, 0, 3.4, -0.6, 0, 0, -1.8, 0]);
    flagMesh.geometry.setAttribute('position', new THREE.BufferAttribute(flagV, 3));
    flagMesh.geometry.computeVertexNormals();
    flagMesh.position.set(0.8, 34.8, 10);
    temple.add(flagMesh);
    this.flags.push(flagMesh);

    // Stairs & Bells
    const stairs = new THREE.Mesh(new THREE.BoxGeometry(12, 1.8, 8), this.matStone);
    stairs.position.set(0, 0.9, -18);
    temple.add(stairs);

    this.scene.add(temple);

    // Finish Line Arch
    const finishArchZ = centerZ - 18;
    this.finishLineZ = finishArchZ;
    this.createFinishLine(roadX, finishArchZ);
  }

  // Realistic Neem Tree with multi-branching boughs
  createRealisticNeemTree(x, z, scale = 1.0) {
    const y = this.terrain.getElevation(x, z);
    const tree = new THREE.Group();
    tree.position.set(x, y, z);
    tree.scale.set(scale, scale, scale);

    // Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.75, 5.5, 10), this.matTrunk);
    trunk.position.y = 2.75;
    tree.add(trunk);

    // Branching limbs
    const branchConfigs = [
      { rx: 0.4, rz: 0.3, y: 4.2, h: 3.2, s: 2.4 },
      { rx: -0.4, rz: -0.3, y: 4.5, h: 3.0, s: 2.2 },
      { rx: 0.1, rz: -0.5, y: 4.8, h: 3.4, s: 2.5 },
      { rx: -0.3, rz: 0.4, y: 4.6, h: 3.1, s: 2.3 }
    ];

    branchConfigs.forEach(b => {
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, b.h, 6), this.matTrunk);
      branch.position.set(b.rx * 2, b.y, b.rz * 2);
      branch.rotation.set(b.rx, 0, b.rz);
      tree.add(branch);

      // Natural leaf cluster with subtle variation
      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(b.s, 1), Math.random() > 0.5 ? this.matFoliage1 : this.matFoliage2);
      foliage.position.set(b.rx * 3.5, b.y + b.h * 0.7, b.rz * 3.5);
      tree.add(foliage);
    });

    // Crown foliage dome
    const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(2.8, 1), this.matFoliage1);
    crown.position.y = 7.2;
    tree.add(crown);

    this.scene.add(tree);
  }

  // Realistic Sacred Banyan Tree with Hanging Prop Roots
  createRealisticBanyanTree(x, z, scale = 1.3) {
    const y = this.terrain.getElevation(x, z);
    const tree = new THREE.Group();
    tree.position.set(x, y, z);
    tree.scale.set(scale, scale, scale);

    // Massive gnarly central trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.1, 6.5, 12), this.matTrunk);
    trunk.position.y = 3.25;
    tree.add(trunk);

    // 8 Dangling prop roots touching ground
    for (let a = 0; a < 8; a++) {
      const angle = (a / 8) * Math.PI * 2;
      const dist = 3.6 + (a % 2) * 1.2;
      const root = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 6.2, 6), this.matTrunk);
      root.position.set(Math.cos(angle) * dist, 3.1, Math.sin(angle) * dist);
      tree.add(root);
    }

    // Wide horizontal sprawling canopy
    const canopyBoughs = [
      { x: -3.0, z: -2.0, r: 4.2 },
      { x: 3.2, z: -1.5, r: 4.5 },
      { x: -2.0, z: 3.5, r: 4.3 },
      { x: 2.8, z: 3.0, r: 4.6 },
      { x: 0, z: 0, r: 5.5 }
    ];

    canopyBoughs.forEach(b => {
      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(b.r, 1), this.matFoliage2);
      foliage.position.set(b.x, 7.2, b.z);
      tree.add(foliage);
    });

    this.scene.add(tree);
  }

  createVillageHut(x, z, rotY, roofType = 'terracotta') {
    const y = this.terrain.getElevation(x, z);
    const hut = new THREE.Group();
    hut.position.set(x, y, z);
    hut.rotation.y = rotY;

    // Adobe Clay Walls
    const walls = new THREE.Mesh(new THREE.BoxGeometry(7.8, 3.6, 6.2), this.matMudWall);
    walls.position.y = 1.8;
    hut.add(walls);

    // Roof with authentic overhang
    const roofMat = roofType === 'terracotta' ? this.matTerracotta : this.matThatch;
    const roofGeo = new THREE.ConeGeometry(6.6, 2.7, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = 4.4;
    hut.add(roof);

    // Carved wooden door
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.5, 0.2), this.matDarkWood);
    door.position.set(0, 1.25, 3.15);
    hut.add(door);

    this.scene.add(hut);
  }

  createCow(x, z, rotY, isSitting = false) {
    const y = this.terrain.getElevation(x, z);
    const cow = new THREE.Group();
    cow.position.set(x, y, z);
    cow.rotation.y = rotY;

    const cowMat = Math.random() > 0.4 ? this.matCowWhite : this.matCowBrown;

    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 2.4), cowMat);
    body.position.y = isSitting ? 0.7 : 1.4;
    cow.add(body);

    const hump = new THREE.Mesh(new THREE.SphereGeometry(0.48, 10, 10), cowMat);
    hump.position.set(0, isSitting ? 1.4 : 2.1, 0.6);
    hump.scale.set(0.9, 1.2, 1.0);
    cow.add(hump);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 1.1), cowMat);
    head.position.set(0, isSitting ? 1.4 : 2.0, 1.5);
    cow.add(head);

    for (let s of [-0.35, 0.35]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.65, 8), this.matDarkWood);
      horn.position.set(s, isSitting ? 1.85 : 2.45, 1.5);
      horn.rotation.x = -0.3;
      horn.rotation.z = s > 0 ? -0.4 : 0.4;
      cow.add(horn);
    }

    if (!isSitting) {
      for (let lx of [-0.45, 0.45]) {
        for (let lz of [-0.7, 0.7]) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 1.0, 8), cowMat);
          leg.position.set(lx, 0.5, lz);
          cow.add(leg);
        }
      }
    }

    this.scene.add(cow);
  }

  createWell(x, z) {
    const y = this.terrain.getElevation(x, z);
    const well = new THREE.Group();
    well.position.set(x, y, z);

    const ring = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.5, 1.6, 20, 1, true), this.matStone);
    ring.position.y = 0.8;
    well.add(ring);

    for (let px of [-2.0, 2.0]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.2, 8), this.matDarkWood);
      post.position.set(px, 1.6, 0);
      well.add(post);
    }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.2, 0.2), this.matDarkWood);
    beam.position.set(0, 3.1, 0);
    well.add(beam);

    this.scene.add(well);
  }

  createBullockCart(x, z, rotY) {
    const y = this.terrain.getElevation(x, z);
    const cart = new THREE.Group();
    cart.position.set(x, y, z);
    cart.rotation.y = rotY;

    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 4.2), this.matDarkWood);
    bed.position.y = 1.2;
    cart.add(bed);

    const wheelGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.2, 16);
    wheelGeo.rotateZ(Math.PI / 2);
    for (let wx of [-1.4, 1.4]) {
      const wheel = new THREE.Mesh(wheelGeo, this.matDarkWood);
      wheel.position.set(wx, 1.1, 0);
      cart.add(wheel);
    }
    this.scene.add(cart);
  }

  createHaystack(x, z) {
    const y = this.terrain.getElevation(x, z);
    const hay = new THREE.Mesh(new THREE.ConeGeometry(2.8, 3.6, 12), this.matThatch);
    hay.position.set(x, y + 1.8, z);
    this.scene.add(hay);
  }

  createGoshala(x, z) {
    const y = this.terrain.getElevation(x, z);
    const goshala = new THREE.Group();
    goshala.position.set(x, y, z);

    for (let px of [-5, 5]) {
      for (let pz of [-4, 0, 4]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.5, 8), this.matDarkWood);
        post.position.set(px, 1.75, pz);
        goshala.add(post);
      }
    }
    const roof = new THREE.Mesh(new THREE.BoxGeometry(11.5, 0.4, 9.5), this.matThatch);
    roof.position.y = 3.6;
    goshala.add(roof);

    this.scene.add(goshala);
  }

  createVillageArch(villageId, z, text) {
    const roadX = this.terrain.getRoadCenter(z);
    const y = this.terrain.getElevation(roadX, z);
    const arch = new THREE.Group();
    arch.position.set(roadX, y, z);

    const pillarGeo = new THREE.BoxGeometry(1.6, 7.5, 1.6);
    const p1 = new THREE.Mesh(pillarGeo, this.matStone);
    p1.position.set(-8.5, 3.75, 0);
    arch.add(p1);

    const p2 = new THREE.Mesh(pillarGeo, this.matStone);
    p2.position.set(8.5, 3.75, 0);
    arch.add(p2);

    const beam = new THREE.Mesh(new THREE.BoxGeometry(19, 1.8, 1.8), this.matStone);
    beam.position.set(0, 7.2, 0);
    arch.add(beam);

    for (let kx of [-8.5, 8.5]) {
      const kalash = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.4, 10), this.matGold);
      kalash.position.set(kx, 8.2, 0);
      arch.add(kalash);
    }

    for (let fx of [-6, 0, 6]) {
      const flag = new THREE.Mesh(new THREE.BufferGeometry(), this.matSaffronFlag);
      const v = new Float32Array([0, 0, 0, 1.5, -0.3, 0, 0, -0.8, 0]);
      flag.geometry.setAttribute('position', new THREE.BufferAttribute(v, 3));
      flag.position.set(fx, 8.1, 0);
      arch.add(flag);
      this.flags.push(flag);
    }

    this.scene.add(arch);
  }

  createFinishLine(roadX, z) {
    const y = this.terrain.getElevation(roadX, z);
    const arch = new THREE.Group();
    arch.position.set(roadX, y, z);

    const archMat = new THREE.MeshStandardMaterial({ color: 0xffa500, roughness: 0.65 });
    const frame = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.6, 10, 32, Math.PI), archMat);
    frame.position.y = 0.5;
    arch.add(frame);

    const board = new THREE.Mesh(new THREE.BoxGeometry(12, 1.4, 0.4), this.matGold);
    board.position.y = 8.5;
    arch.add(board);

    this.scene.add(arch);
  }

  buildRoadsideScenery() {
    for (let z = 60; z < 1750; z += 32) {
      const rx = this.terrain.getRoadCenter(z);
      const side = Math.sin(z) > 0 ? 1 : -1;
      const dist = 16 + Math.random() * 20;
      const tx = rx + side * dist;

      const r = Math.random();
      if (r < 0.6) {
        this.createRealisticNeemTree(tx, z, 0.9 + Math.random() * 0.4);
      } else if (r < 0.85) {
        this.createRealisticBanyanTree(tx, z, 0.95 + Math.random() * 0.35);
      } else {
        this.createHaystack(tx, z);
      }
    }
  }

  update(time) {
    this.flags.forEach((f, idx) => {
      f.rotation.y = Math.sin(time * 6 + idx * 1.5) * 0.35;
    });
  }
}

window.IndianVillages = IndianVillages;
