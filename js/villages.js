// Indian Villages and Countryside Props Generator: Gokul, Barsana, Nandgaon, Vrindavan
class IndianVillages {
  constructor(scene, terrain) {
    this.scene = scene;
    this.terrain = terrain;

    // Define the 4 villages with checkpoints and bounding areas
    this.villages = [
      { id: 'gokul', name: 'Gokul (गोकुल)', startZ: 0, centerZ: 100, endZ: 260, title: 'Birthplace of Leelas - Starting Village' },
      { id: 'barsana', name: 'Barsana (बरसाना)', startZ: 480, centerZ: 620, endZ: 750, title: 'Radha Rani Nagar - 2nd Village' },
      { id: 'nandgaon', name: 'Nandgaon (नंदगांव)', startZ: 960, centerZ: 1100, endZ: 1260, title: 'Land of Nanda Baba - 3rd Village' },
      { id: 'vrindavan', name: 'Vrindavan (वृन्दावन)', startZ: 1500, centerZ: 1680, endZ: 1850, title: 'The Holy Abode & Destination' }
    ];

    // Shared reusable materials
    this.matMudWall = new THREE.MeshStandardMaterial({ color: 0xd9b382, roughness: 0.95 }); // Ochre/clay mud
    this.matTerracotta = new THREE.MeshStandardMaterial({ color: 0xb33a20, roughness: 0.85 }); // Baked red clay tiles
    this.matThatch = new THREE.MeshStandardMaterial({ color: 0x9a8047, roughness: 0.98 }); // Dry straw thatch
    this.matDarkWood = new THREE.MeshStandardMaterial({ color: 0x3d2714, roughness: 0.88 }); // Neem/Teak wood
    this.matFoliage = new THREE.MeshStandardMaterial({ color: 0x2e5c1e, roughness: 0.8 }); // Neem/Banyan leaves
    this.matFoliageGolden = new THREE.MeshStandardMaterial({ color: 0x4a6e26, roughness: 0.85 });
    this.matTrunk = new THREE.MeshStandardMaterial({ color: 0x4a3728, roughness: 0.9 });
    this.matStone = new THREE.MeshStandardMaterial({ color: 0xa89f91, roughness: 0.9 });
    this.matGold = new THREE.MeshStandardMaterial({ color: 0xf5b027, metalness: 0.8, roughness: 0.25 });
    this.matSaffronFlag = new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.6, side: THREE.DoubleSide });
    this.matCowWhite = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.85 });
    this.matCowBrown = new THREE.MeshStandardMaterial({ color: 0x8a4b2d, roughness: 0.85 });

    this.flags = [];
    this.cows = [];

    this.buildAllVillages();
    this.buildRoadsideScenery();
  }

  buildAllVillages() {
    this.buildGokul();
    this.buildBarsana();
    this.buildNandgaon();
    this.buildVrindavan();
  }

  // --- VILLAGE 1: GOKUL (Starting Home of Krishna) ---
  buildGokul() {
    const roadX = this.terrain.getRoadCenter(40);

    // 1. Krishna's Ancestral Courtyard Haveli (Home)
    const homeX = roadX - 22;
    const homeZ = 45;
    const homeY = this.terrain.getElevation(homeX, homeZ);

    this.krishnaHomePos = new THREE.Vector3(homeX, homeY, homeZ);
    this.krishnaCarSpawnPos = new THREE.Vector3(homeX + 11, homeY + 0.6, homeZ + 6);

    // Haveli Main Structure
    const haveliGroup = new THREE.Group();
    haveliGroup.position.set(homeX, homeY, homeZ);

    // Base platform
    const platformGeo = new THREE.BoxGeometry(18, 0.8, 14);
    const platform = new THREE.Mesh(platformGeo, this.matStone);
    platform.position.y = 0.4;
    haveliGroup.add(platform);

    // Walls
    const wallGeo = new THREE.BoxGeometry(16, 5.5, 12);
    const walls = new THREE.Mesh(wallGeo, this.matMudWall);
    walls.position.y = 3.3;
    haveliGroup.add(walls);

    // Terracotta sloped Roof
    const roofGeo = new THREE.ConeGeometry(13, 4.5, 4);
    roofGeo.rotateY(Math.PI / 4);
    const roof = new THREE.Mesh(roofGeo, this.matTerracotta);
    roof.position.y = 8.0;
    haveliGroup.add(roof);

    // Front Veranda / Porch with pillars
    for (let px of [-6, -2, 2, 6]) {
      const pillarGeo = new THREE.CylinderGeometry(0.3, 0.35, 4.5, 8);
      const pillar = new THREE.Mesh(pillarGeo, this.matDarkWood);
      pillar.position.set(px, 2.5, 7.5);
      haveliGroup.add(pillar);
    }
    const porchRoofGeo = new THREE.BoxGeometry(15, 0.4, 4);
    const porchRoof = new THREE.Mesh(porchRoofGeo, this.matTerracotta);
    porchRoof.position.set(0, 4.8, 7.5);
    porchRoof.rotation.x = 0.15;
    haveliGroup.add(porchRoof);

    // Wooden Carved Door
    const doorGeo = new THREE.BoxGeometry(2.4, 4, 0.3);
    const door = new THREE.Mesh(doorGeo, this.matDarkWood);
    door.position.set(0, 2.4, 6.1);
    haveliGroup.add(door);

    this.scene.add(haveliGroup);

    // 2. Tulsi Vrindavan Planter in the front courtyard
    const tulsiBase = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 1.6), this.matStone);
    tulsiBase.position.set(homeX + 4.5, homeY + 0.9, homeZ + 11);
    this.scene.add(tulsiBase);

    const tulsiPlant = new THREE.Mesh(new THREE.SphereGeometry(0.7, 8, 8), this.matFoliage);
    tulsiPlant.position.set(homeX + 4.5, homeY + 2.1, homeZ + 11);
    this.scene.add(tulsiPlant);

    // Shading Neem Tree above Thar parking spot
    this.createNeemTree(homeX + 16, homeZ + 8, 1.2);

    // Gokul surrounding village huts
    this.createVillageHut(roadX + 22, 50, -Math.PI / 3, 'terracotta');
    this.createVillageHut(roadX + 25, 95, -Math.PI / 2, 'thatch');
    this.createVillageHut(roadX - 24, 130, Math.PI / 2.5, 'terracotta');
    this.createVillageHut(roadX + 20, 160, -Math.PI / 2.2, 'thatch');

    // Holy cows resting
    this.createCow(homeX + 8, homeZ + 16, Math.PI / 4, false);
    this.createCow(roadX + 16, 80, -Math.PI / 3, true);

    // Haystack
    this.createHaystack(roadX + 18, 120);

    // Village Gateway / Banner
    this.createVillageArch('gokul', 210, "GOKUL DHAM (गोकुल धाम)");
  }

  // --- VILLAGE 2: BARSANA (Radha Rani's Hill Village) ---
  buildBarsana() {
    const centerZ = 620;
    const roadX = this.terrain.getRoadCenter(centerZ);

    this.createVillageArch('barsana', 510, "WELCOME TO BARSANA (बरसाना)");

    // Clustered houses alongside the road
    for (let i = -3; i <= 3; i++) {
      const z = centerZ + i * 32;
      const rx = this.terrain.getRoadCenter(z);
      const side = (i % 2 === 0) ? 1 : -1;
      const hx = rx + side * (19 + Math.abs(i) * 3);
      this.createVillageHut(hx, z, side > 0 ? -Math.PI / 2 : Math.PI / 2, i % 2 === 0 ? 'terracotta' : 'thatch');

      if (i === 1) {
        // Village stone water well (Kuan)
        this.createWell(rx - 18, z);
      }
      if (i === -1) {
        // Wooden bullock cart
        this.createBullockCart(rx + 16, z + 5, 0.4);
      }
    }

    // Neem and Peepal trees
    this.createNeemTree(roadX - 22, centerZ - 50, 1.1);
    this.createBanyanTree(roadX + 26, centerZ + 40, 1.0);
    this.createCow(roadX - 16, centerZ + 60, 0.8, true);
  }

  // --- VILLAGE 3: NANDGAON (Nanda Baba's Village with Banyan Groves) ---
  buildNandgaon() {
    const centerZ = 1100;
    const roadX = this.terrain.getRoadCenter(centerZ);

    this.createVillageArch('nandgaon', 990, "NANDGAON (नंदगांव)");

    // Dense Banyan trees along the muddy canal
    this.createBanyanTree(roadX - 26, centerZ - 60, 1.4);
    this.createBanyanTree(roadX + 28, centerZ - 10, 1.3);
    this.createBanyanTree(roadX - 27, centerZ + 50, 1.5);

    // Traditional Cattle Shed (Goshala)
    this.createGoshala(roadX + 24, centerZ + 20);

    // Village Huts
    this.createVillageHut(roadX - 25, centerZ - 30, Math.PI / 2.3, 'thatch');
    this.createVillageHut(roadX - 24, centerZ + 20, Math.PI / 2.1, 'terracotta');
    this.createVillageHut(roadX + 26, centerZ + 80, -Math.PI / 2.5, 'terracotta');

    this.createHaystack(roadX - 19, centerZ - 15);
    this.createCow(roadX + 16, centerZ - 40, -0.6, false);
    this.createCow(roadX + 18, centerZ - 35, 1.2, true);
  }

  // --- VILLAGE 4: VRINDAVAN (Sacred Temple & Destination) ---
  buildVrindavan() {
    const centerZ = 1680;
    const roadX = this.terrain.getRoadCenter(centerZ);

    // Grand Entrance Arch
    this.createVillageArch('vrindavan', 1530, "SACRED VRINDAVAN (पवित्र वृन्दावन)");

    // 1. The Grand Nagara-Style Mandir (Temple)
    const templeZ = centerZ + 50;
    const templeX = roadX;
    const groundY = this.terrain.getElevation(templeX, templeZ);

    const templeGroup = new THREE.Group();
    templeGroup.position.set(templeX, groundY, templeZ);

    // High plinth / Jagati (Stone base)
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(32, 2.5, 36), this.matStone);
    plinth.position.y = 1.25;
    templeGroup.add(plinth);

    // Mandapa (Pillared Hall)
    const mandapaWalls = new THREE.Mesh(new THREE.BoxGeometry(22, 8, 18), this.matStone);
    mandapaWalls.position.set(0, 5.5, -4);
    templeGroup.add(mandapaWalls);

    // Garbhagriha (Sanctum) Base
    const sanctumBase = new THREE.Mesh(new THREE.BoxGeometry(16, 10, 16), this.matStone);
    sanctumBase.position.set(0, 6.5, 10);
    templeGroup.add(sanctumBase);

    // Towering Shikhara (Curvilinear spire)
    const numTiers = 7;
    for (let t = 0; t < numTiers; t++) {
      const frac = t / numTiers;
      const w = 15 * (1.0 - frac * 0.75);
      const tierH = 2.4;
      const tierGeo = new THREE.BoxGeometry(w, tierH, w);
      const tier = new THREE.Mesh(tierGeo, this.matStone);
      tier.position.set(0, 11.5 + t * 2.2, 10);
      templeGroup.add(tier);
    }

    // Amalaka (Ribbed crown disc)
    const amalaka = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.2, 1.2, 16), this.matStone);
    amalaka.position.set(0, 27.5, 10);
    templeGroup.add(amalaka);

    // Golden Kalash (Spire Finial)
    const kalash = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3.5, 12), this.matGold);
    kalash.position.set(0, 29.8, 10);
    templeGroup.add(kalash);

    // Sacred Saffron Temple Flag (Dhwaja)
    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 5.5, 6), this.matGold);
    flagPole.position.set(0.8, 32.5, 10);
    templeGroup.add(flagPole);

    const flagMesh = new THREE.Mesh(new THREE.BufferGeometry(), this.matSaffronFlag);
    // Triangular flag
    const flagVertices = new Float32Array([
      0, 0, 0,
      3.2, -0.6, 0,
      0, -1.8, 0
    ]);
    flagMesh.geometry.setAttribute('position', new THREE.BufferAttribute(flagVertices, 3));
    flagMesh.geometry.computeVertexNormals();
    flagMesh.position.set(0.8, 34.8, 10);
    templeGroup.add(flagMesh);
    this.flags.push({ mesh: flagMesh, baseAngle: 0 });

    // Front Flight of Stairs
    const stairs = new THREE.Mesh(new THREE.BoxGeometry(12, 1.8, 8), this.matStone);
    stairs.position.set(0, 0.9, -18);
    templeGroup.add(stairs);

    // Brass Temple Bells hung on ornate entrance
    for (let bx of [-3.5, 3.5]) {
      const bell = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.8, 8), this.matGold);
      bell.position.set(bx, 6.2, -13);
      templeGroup.add(bell);
    }

    this.scene.add(templeGroup);

    // Finish Line Arch & Sacred Delivery Spot
    const finishArchZ = centerZ - 18;
    this.finishLineZ = finishArchZ;
    this.createFinishLine(roadX, finishArchZ);

    // Surrounding celebratory huts and marigold flower stands
    this.createVillageHut(roadX - 22, centerZ - 10, Math.PI / 2.5, 'terracotta');
    this.createVillageHut(roadX + 22, centerZ - 10, -Math.PI / 2.5, 'terracotta');
  }

  // --- PROPS CREATION HELPERS ---

  createVillageHut(x, z, rotY, roofType = 'terracotta') {
    const y = this.terrain.getElevation(x, z);
    const hut = new THREE.Group();
    hut.position.set(x, y, z);
    hut.rotation.y = rotY;

    // Mud Walls
    const wallGeo = new THREE.BoxGeometry(7.5, 3.4, 6);
    const walls = new THREE.Mesh(wallGeo, this.matMudWall);
    walls.position.y = 1.7;
    hut.add(walls);

    // Roof
    let roof;
    if (roofType === 'terracotta') {
      const roofGeo = new THREE.ConeGeometry(6.2, 2.5, 4);
      roofGeo.rotateY(Math.PI / 4);
      roof = new THREE.Mesh(roofGeo, this.matTerracotta);
      roof.position.y = 4.2;
    } else {
      const roofGeo = new THREE.ConeGeometry(5.8, 2.8, 4);
      roofGeo.rotateY(Math.PI / 4);
      roof = new THREE.Mesh(roofGeo, this.matThatch);
      roof.position.y = 4.3;
    }
    hut.add(roof);

    // Doorway
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 0.2), this.matDarkWood);
    door.position.set(0, 1.2, 3.05);
    hut.add(door);

    this.scene.add(hut);
  }

  createNeemTree(x, z, scale = 1.0) {
    const y = this.terrain.getElevation(x, z);
    const tree = new THREE.Group();
    tree.position.set(x, y, z);
    tree.scale.set(scale, scale, scale);

    // Trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.65, 5, 8), this.matTrunk);
    trunk.position.y = 2.5;
    tree.add(trunk);

    // Foliage Clusters
    const foliageMat = Math.random() > 0.5 ? this.matFoliage : this.matFoliageGolden;
    for (let i = 0; i < 4; i++) {
      const r = 2.2 + Math.random() * 0.8;
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 7), foliageMat);
      sphere.position.set(
        (Math.random() - 0.5) * 2,
        4.5 + Math.random() * 2,
        (Math.random() - 0.5) * 2
      );
      tree.add(sphere);
    }
    this.scene.add(tree);
  }

  createBanyanTree(x, z, scale = 1.2) {
    const y = this.terrain.getElevation(x, z);
    const tree = new THREE.Group();
    tree.position.set(x, y, z);
    tree.scale.set(scale, scale, scale);

    // Huge central trunk
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 6, 10), this.matTrunk);
    trunk.position.y = 3;
    tree.add(trunk);

    // Dangling aerial prop roots
    for (let a = 0; a < 6; a++) {
      const angle = (a / 6) * Math.PI * 2;
      const root = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 5.5, 6), this.matTrunk);
      root.position.set(Math.cos(angle) * 3.8, 2.75, Math.sin(angle) * 3.8);
      tree.add(root);
    }

    // Wide spreading canopy
    const canopy = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 7.5, 3.2, 10), this.matFoliage);
    canopy.position.y = 6.2;
    tree.add(canopy);

    const topDome = new THREE.Mesh(new THREE.SphereGeometry(5.5, 8, 8), this.matFoliage);
    topDome.position.y = 7.5;
    tree.add(topDome);

    this.scene.add(tree);
  }

  createCow(x, z, rotY, isSitting = false) {
    const y = this.terrain.getElevation(x, z);
    const cow = new THREE.Group();
    cow.position.set(x, y, z);
    cow.rotation.y = rotY;

    const cowMat = Math.random() > 0.4 ? this.matCowWhite : this.matCowBrown;

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 2.4), cowMat);
    body.position.y = isSitting ? 0.7 : 1.4;
    cow.add(body);

    // Distinct Indian Zebu Hump
    const hump = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), cowMat);
    hump.position.set(0, isSitting ? 1.4 : 2.1, 0.6);
    hump.scale.set(0.9, 1.2, 1.0);
    cow.add(hump);

    // Neck & Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.8, 1.1), cowMat);
    head.position.set(0, isSitting ? 1.4 : 2.0, 1.5);
    cow.add(head);

    // Curved Horns
    for (let s of [-0.35, 0.35]) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.6, 6), this.matDarkWood);
      horn.position.set(s, isSitting ? 1.85 : 2.45, 1.5);
      horn.rotation.x = -0.3;
      horn.rotation.z = s > 0 ? -0.4 : 0.4;
      cow.add(horn);
    }

    if (!isSitting) {
      // 4 Legs
      for (let lx of [-0.45, 0.45]) {
        for (let lz of [-0.7, 0.7]) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 1.0, 6), cowMat);
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

    // Round Stone Wall
    const stoneRing = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.5, 1.6, 16, 1, true), this.matStone);
    stoneRing.position.y = 0.8;
    well.add(stoneRing);

    // Water inside
    const water = new THREE.Mesh(new THREE.CircleGeometry(2.2, 16), new THREE.MeshStandardMaterial({ color: 0x1a3340, roughness: 0.1 }));
    water.rotateX(-Math.PI / 2);
    water.position.y = 0.3;
    well.add(water);

    // Wooden crossbeam with pulley
    for (let px of [-2.0, 2.0]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.2, 6), this.matDarkWood);
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

    // Wooden bed
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.3, 4.2), this.matDarkWood);
    bed.position.y = 1.2;
    cart.add(bed);

    // Big spoked wooden wheels
    const wheelGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.2, 14);
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
    const hay = new THREE.Mesh(new THREE.ConeGeometry(2.8, 3.6, 8), this.matThatch);
    hay.position.set(x, y + 1.8, z);
    this.scene.add(hay);
  }

  createGoshala(x, z) {
    const y = this.terrain.getElevation(x, z);
    const goshala = new THREE.Group();
    goshala.position.set(x, y, z);

    // Wooden posts
    for (let px of [-5, 5]) {
      for (let pz of [-4, 0, 4]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.5, 6), this.matDarkWood);
        post.position.set(px, 1.75, pz);
        goshala.add(post);
      }
    }
    // Thatched sloping roof
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

    // Two tall decorated stone pillars
    const pillarGeo = new THREE.BoxGeometry(1.6, 7.5, 1.6);
    const p1 = new THREE.Mesh(pillarGeo, this.matStone);
    p1.position.set(-8.5, 3.75, 0);
    arch.add(p1);

    const p2 = new THREE.Mesh(pillarGeo, this.matStone);
    p2.position.set(8.5, 3.75, 0);
    arch.add(p2);

    // Cross arch beam
    const beam = new THREE.Mesh(new THREE.BoxGeometry(19, 1.8, 1.8), this.matStone);
    beam.position.set(0, 7.2, 0);
    arch.add(beam);

    // Decorative Kalash on pillars
    for (let kx of [-8.5, 8.5]) {
      const kalash = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.4, 8), this.matGold);
      kalash.position.set(kx, 8.2, 0);
      arch.add(kalash);
    }

    // Saffron triangular flags
    for (let fx of [-6, 0, 6]) {
      const flag = new THREE.Mesh(new THREE.BufferGeometry(), this.matSaffronFlag);
      const v = new Float32Array([0, 0, 0, 1.5, -0.3, 0, 0, -0.8, 0]);
      flag.geometry.setAttribute('position', new THREE.BufferAttribute(v, 3));
      flag.position.set(fx, 8.1, 0);
      arch.add(flag);
      this.flags.push({ mesh: flag, baseAngle: 0 });
    }

    this.scene.add(arch);
  }

  createFinishLine(roadX, z) {
    const y = this.terrain.getElevation(roadX, z);
    const arch = new THREE.Group();
    arch.position.set(roadX, y, z);

    // Festive Marigold floral victory arch
    const archMat = new THREE.MeshStandardMaterial({ color: 0xffa500, roughness: 0.7 }); // Marigold orange
    const frame = new THREE.Mesh(new THREE.TorusGeometry(8.5, 0.6, 8, 24, Math.PI), archMat);
    frame.position.y = 0.5;
    arch.add(frame);

    // Banner board
    const board = new THREE.Mesh(new THREE.BoxGeometry(12, 1.4, 0.4), this.matGold);
    board.position.y = 8.5;
    arch.add(board);

    this.scene.add(arch);
  }

  buildRoadsideScenery() {
    // Distribute native trees and bushes along the entire 1800m route
    for (let z = 60; z < 1750; z += 35) {
      const rx = this.terrain.getRoadCenter(z);
      // Place trees alternating on sides away from road centerline
      const side = Math.sin(z) > 0 ? 1 : -1;
      const dist = 16 + Math.random() * 18;
      const tx = rx + side * dist;

      const r = Math.random();
      if (r < 0.6) {
        this.createNeemTree(tx, z, 0.85 + Math.random() * 0.4);
      } else if (r < 0.85) {
        this.createBanyanTree(tx, z, 0.9 + Math.random() * 0.3);
      } else {
        this.createHaystack(tx, z);
      }
    }
  }

  update(time) {
    // Flutter temple & arch flags
    this.flags.forEach((f, idx) => {
      const flutter = Math.sin(time * 6 + idx * 1.5) * 0.35;
      f.mesh.rotation.y = flutter;
    });
  }
}

window.IndianVillages = IndianVillages;
