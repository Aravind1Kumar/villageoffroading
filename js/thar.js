// High-Fidelity 3D Mahindra Thar 4x4 Simulation with Accurate Proportions & Fixed Wheel Suspension
class TharVehicle {
  constructor(scene, terrain) {
    this.scene = scene;
    this.terrain = terrain;

    // Vehicle Physical State
    this.position = new THREE.Vector3(0, 5, 45);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.speed = 0; // forward speed in m/s
    this.steerAngle = 0;
    this.pitch = 0;
    this.roll = 0;

    // 4WD Drive Modes: '2WD', '4WD', '4WD_LOW'
    this.driveMode = '4WD';
    this.headlightsOn = true;
    this.handbrake = false;

    // Realistic Thar Dimensions & Geometry (Wheelbase: 2.45m, Track: 1.82m)
    this.wheelBase = 2.55;
    this.trackWidth = 1.84;
    this.wheelRadius = 0.46; // 32" off-road knobby tire
    this.maxSteer = 0.52;    // ~30 degrees
    this.suspensionRestY = -0.42;
    this.suspensionStiffness = 45.0;

    // Drive Specs by Mode
    this.specs = {
      '2WD':     { maxSpeed: 22.0, accel: 15.0, mudTraction: 0.35, label: '2WD HIGH' },
      '4WD':     { maxSpeed: 16.5, accel: 20.0, mudTraction: 0.85, label: '4WD HIGH' },
      '4WD_LOW': { maxSpeed: 9.0,  accel: 32.0, mudTraction: 1.60, label: '4WD LOW (CRAWL)' }
    };

    // Mud & Water immersion metrics
    this.currentMudDepth = 0;
    this.inWater = false;
    this.wasInWater = false;

    // Build 3D Mesh
    this.buildThar();
    this.setupLighting();
    this.setupParticles();

    // Input state
    this.controls = {
      throttle: 0,
      steer: 0,
      brake: false
    };
  }

  buildThar() {
    this.root = new THREE.Group();
    this.chassis = new THREE.Group();
    this.root.add(this.chassis);

    // Realistic PBR Automotive Materials
    this.matBody = new THREE.MeshStandardMaterial({
      color: 0x9b1c1c, // Iconic Mahindra Thar Napoli Red
      roughness: 0.28,
      metalness: 0.65,
      envMapIntensity: 1.2
    });

    this.matBlackCladding = new THREE.MeshStandardMaterial({
      color: 0x18181a, // Textured matte black fiber wheel arches & bumpers
      roughness: 0.82,
      metalness: 0.1
    });

    this.matDarkTrim = new THREE.MeshStandardMaterial({
      color: 0x111113,
      roughness: 0.9
    });

    this.matChrome = new THREE.MeshStandardMaterial({
      color: 0xe8e8e8,
      metalness: 0.95,
      roughness: 0.15
    });

    this.matAlloyRim = new THREE.MeshStandardMaterial({
      color: 0x222225, // Black/Machined Silver 18" Thar Alloy
      metalness: 0.85,
      roughness: 0.25
    });

    this.matBrakeDisc = new THREE.MeshStandardMaterial({
      color: 0xb0b0b0,
      metalness: 0.9,
      roughness: 0.2
    });

    this.matBrakeCaliper = new THREE.MeshStandardMaterial({
      color: 0xd62828, // Red brake caliper
      metalness: 0.5,
      roughness: 0.4
    });

    this.matGlass = new THREE.MeshStandardMaterial({
      color: 0x1a2b3c,
      transparent: true,
      opacity: 0.45,
      roughness: 0.05,
      metalness: 0.9
    });

    const tireTex = window.ProceduralTextures ? ProceduralTextures.createTireTreadTexture() : null;
    this.matTire = new THREE.MeshStandardMaterial({
      color: 0x151517,
      map: tireTex,
      roughness: 0.92,
      metalness: 0.05
    });

    this.matLightGlow = new THREE.MeshBasicMaterial({ color: 0xfffaed });
    this.matRedGlow = new THREE.MeshBasicMaterial({ color: 0xe60000 });
    this.matAmberGlow = new THREE.MeshBasicMaterial({ color: 0xff9900 });

    // ==========================================
    // 1. MAIN BODY TUB & SCULPTED PANELS
    // ==========================================
    // Lower body tub
    const tubGeo = new THREE.BoxGeometry(1.82, 0.65, 3.75);
    const tub = new THREE.Mesh(tubGeo, this.matBody);
    tub.position.y = 0.52;
    this.chassis.add(tub);

    // Sculpted Hood / Bonnet with center power bulge
    const hoodGeo = new THREE.BoxGeometry(1.68, 0.38, 1.38);
    const hood = new THREE.Mesh(hoodGeo, this.matBody);
    hood.position.set(0, 0.88, 1.14);
    this.chassis.add(hood);

    // Hood cowl bulge
    const cowl = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 1.1), this.matBody);
    cowl.position.set(0, 1.08, 1.08);
    this.chassis.add(cowl);

    // Hood side latches (signature Thar detail)
    for (let lx of [-0.85, 0.85]) {
      const latch = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.1), this.matBlackCladding);
      latch.position.set(lx, 0.86, 1.25);
      this.chassis.add(latch);
    }

    // ==========================================
    // 2. ICONIC 7-SLOT THAR FRONT GRILLE & FASCIA
    // ==========================================
    const grilleSurround = new THREE.Mesh(new THREE.BoxGeometry(1.64, 0.58, 0.15), this.matBlackCladding);
    grilleSurround.position.set(0, 0.68, 1.84);
    this.chassis.add(grilleSurround);

    // Honeycomb mesh background
    const meshBg = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.44, 0.08), this.matDarkTrim);
    meshBg.position.set(0, 0.68, 1.88);
    this.chassis.add(meshBg);

    // 7 Vertical Slotted bars
    for (let i = -3; i <= 3; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.36, 0.1), this.matBody);
      bar.position.set(i * 0.18, 0.68, 1.91);
      this.chassis.add(bar);
    }

    // Round Projector Headlamps with DRL Ring
    for (let sx of [-0.64, 0.64]) {
      // Black bucket
      const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.12, 24), this.matBlackCladding);
      bucket.rotateX(Math.PI / 2);
      bucket.position.set(sx, 0.68, 1.87);
      this.chassis.add(bucket);

      // Chrome reflector bowl
      const reflector = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.11, 0.1, 24), this.matChrome);
      reflector.rotateX(Math.PI / 2);
      reflector.position.set(sx, 0.68, 1.91);
      this.chassis.add(reflector);

      // Lens
      const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 24), this.matLightGlow);
      lens.rotateX(Math.PI / 2);
      lens.position.set(sx, 0.68, 1.94);
      this.chassis.add(lens);

      // Fender indicator lights
      const indicator = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.05), this.matAmberGlow);
      indicator.position.set(sx > 0 ? 0.92 : -0.92, 0.72, 1.5);
      this.chassis.add(indicator);
    }

    // ==========================================
    // 3. AGGRESSIVE OFF-ROAD FRONT BUMPER
    // ==========================================
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.32, 0.42), this.matBlackCladding);
    bumper.position.set(0, 0.35, 1.96);
    this.chassis.add(bumper);

    // Silver bash plate / skid plate
    const skidPlate = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.22, 0.45), this.matChrome);
    skidPlate.position.set(0, 0.22, 1.98);
    skidPlate.rotation.x = 0.35;
    this.chassis.add(skidPlate);

    // Red D-Ring Recovery Shackles
    for (let rx of [-0.45, 0.45]) {
      const hook = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.025, 8, 12), this.matBrakeCaliper);
      hook.position.set(rx, 0.32, 2.18);
      this.chassis.add(hook);
    }

    // Bumper fog lamps
    for (let fx of [-0.75, 0.75]) {
      const fog = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16), this.matLightGlow);
      fog.rotateX(Math.PI / 2);
      fog.position.set(fx, 0.35, 2.16);
      this.chassis.add(fog);
    }

    // ==========================================
    // 4. TRAPEZOIDAL FLARED WHEEL ARCHES
    // ==========================================
    for (let side of [-1, 1]) {
      // Front flared arch
      const fArch = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 1.18), this.matBlackCladding);
      fArch.position.set(side * 0.98, 0.58, 1.25);
      this.chassis.add(fArch);

      // Rear flared arch
      const rArch = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.38, 1.22), this.matBlackCladding);
      rArch.position.set(side * 0.98, 0.58, -1.25);
      this.chassis.add(rArch);

      // Heavy-duty tubular rock slider footboard
      const slider = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8), this.matBlackCladding);
      slider.rotateX(Math.PI / 2);
      slider.position.set(side * 0.98, 0.22, 0);
      this.chassis.add(slider);

      // Rugged Side View Mirrors
      const mirrorArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.05, 0.05), this.matBlackCladding);
      mirrorArm.position.set(side * 1.0, 1.15, 0.42);
      this.chassis.add(mirrorArm);

      const mirrorHousing = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.24, 0.16), this.matBlackCladding);
      mirrorHousing.position.set(side * 1.1, 1.18, 0.42);
      this.chassis.add(mirrorHousing);

      const mirrorGlass = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.2, 0.14), this.matChrome);
      mirrorGlass.position.set(side * 1.06, 1.18, 0.42);
      this.chassis.add(mirrorGlass);
    }

    // Off-Road Snorkel on passenger side A-Pillar (classic hardcore 4x4 look)
    const snorkelPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.2, 8), this.matBlackCladding);
    snorkelPipe.position.set(0.96, 1.22, 0.6);
    snorkelPipe.rotation.x = -0.3;
    this.chassis.add(snorkelPipe);

    const snorkelTop = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.2), this.matBlackCladding);
    snorkelTop.position.set(0.96, 1.82, 0.38);
    this.chassis.add(snorkelTop);

    // ==========================================
    // 5. CABIN, HARDTOP ROOF & SAFARI GLASS
    // ==========================================
    // Raked Front Windshield
    const windshieldFrame = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.72, 0.1), this.matBlackCladding);
    windshieldFrame.position.set(0, 1.32, 0.42);
    windshieldFrame.rotation.x = -0.36;
    this.chassis.add(windshieldFrame);

    const windshieldGlass = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.58, 0.08), this.matGlass);
    windshieldGlass.position.set(0, 1.32, 0.44);
    windshieldGlass.rotation.x = -0.36;
    this.chassis.add(windshieldGlass);

    // Side Door Windows
    for (let s of [-0.86, 0.86]) {
      const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.48, 0.85), this.matGlass);
      sideGlass.position.set(s, 1.34, -0.15);
      this.chassis.add(sideGlass);
    }

    // Hardtop Ribbed Roof Canopy
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.1, 1.45), this.matBlackCladding);
    roof.position.set(0, 1.76, -0.22);
    this.chassis.add(roof);

    // Heavy-Duty Roof Cargo Carrier with Off-Road Light Bar
    const roofRack = new THREE.Mesh(new THREE.BoxGeometry(1.58, 0.08, 1.35), this.matDarkTrim);
    roofRack.position.set(0, 1.85, -0.22);
    this.chassis.add(roofRack);

    // High-Power LED Floodlight Bar
    const ledBar = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.12, 0.14), this.matLightGlow);
    ledBar.position.set(0, 1.88, 0.38);
    this.chassis.add(ledBar);

    // ==========================================
    // 6. REAR TAILGATE & 18" SPARE WHEEL
    // ==========================================
    // Rear Cargo Bed where sacred Makhan pots sit
    this.cargoBed = new THREE.Group();
    this.cargoBed.position.set(0, 0.65, -1.15);
    this.chassis.add(this.cargoBed);

    // Bed walls
    const bedFloor = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.08, 1.38), this.matBlackCladding);
    this.cargoBed.add(bedFloor);

    for (let side of [-0.78, 0.78]) {
      const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 1.38), this.matBody);
      sideWall.position.set(side, 0.22, 0);
      this.cargoBed.add(sideWall);
    }

    // Rear Tailgate
    const tailgate = new THREE.Mesh(new THREE.BoxGeometry(1.52, 0.58, 0.1), this.matBody);
    tailgate.position.set(0, 0.65, -1.86);
    this.chassis.add(tailgate);

    // Rear full-size 18" Spare Wheel with "THAR" center cover
    const spareWheel = this.createDetailedWheel();
    spareWheel.position.set(0, 0.85, -2.06);
    this.chassis.add(spareWheel);

    // Vertical LED Tail Lamps
    for (let sx of [-0.78, 0.78]) {
      const tailHousing = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.36, 0.08), this.matBlackCladding);
      tailHousing.position.set(sx, 0.68, -1.88);
      this.chassis.add(tailHousing);

      const tailLight = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.28, 0.06), this.matRedGlow);
      tailLight.position.set(sx, 0.68, -1.9);
      this.chassis.add(tailLight);
    }

    // Rear Bumper with Dual Exhaust Pipes
    const rBumper = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.28, 0.35), this.matBlackCladding);
    rBumper.position.set(0, 0.32, -1.9);
    this.chassis.add(rBumper);

    for (let ex of [-0.55, 0.55]) {
      const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 12), this.matChrome);
      exhaust.rotateX(Math.PI / 2);
      exhaust.position.set(ex, 0.22, -1.98);
      this.chassis.add(exhaust);
    }

    // Dashboard & Steering
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.35, 0.4), this.matDarkTrim);
    dash.position.set(0, 1.05, 0.2);
    this.chassis.add(dash);

    const steering = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.03, 8, 16), this.matDarkTrim);
    steering.position.set(-0.46, 1.15, 0.05);
    steering.rotation.x = 0.55;
    this.chassis.add(steering);
    this.steeringWheelMesh = steering;

    // ==========================================
    // 7. FOUR AUTHENTIC 18" OFF-ROAD WHEELS
    // ==========================================
    // Wheels are attached DIRECTLY TO CHASSIS in local space!
    // This permanently eliminates the detached wheel bug!
    this.wheels = [];
    const wheelConfigs = [
      { id: 'FL', x: -this.trackWidth * 0.5, z:  this.wheelBase * 0.5, isFront: true },
      { id: 'FR', x:  this.trackWidth * 0.5, z:  this.wheelBase * 0.5, isFront: true },
      { id: 'RL', x: -this.trackWidth * 0.5, z: -this.wheelBase * 0.5, isFront: false },
      { id: 'RR', x:  this.trackWidth * 0.5, z: -this.wheelBase * 0.5, isFront: false }
    ];

    wheelConfigs.forEach(wc => {
      const holder = new THREE.Group();
      holder.position.set(wc.x, this.suspensionRestY, wc.z);

      const wheelMesh = this.createDetailedWheel();
      holder.add(wheelMesh);
      this.chassis.add(holder);

      this.wheels.push({
        id: wc.id,
        holder: holder,
        mesh: wheelMesh,
        localX: wc.x,
        localZ: wc.z,
        isFront: wc.isFront,
        suspensionLength: 0.46,
        targetY: this.suspensionRestY
      });
    });

    this.scene.add(this.root);
  }

  createDetailedWheel() {
    const group = new THREE.Group();

    // 1. Chunky 32" Off-Road Knobby Tire
    const tireGeo = new THREE.CylinderGeometry(this.wheelRadius, this.wheelRadius, 0.34, 24);
    tireGeo.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, this.matTire);
    group.add(tire);

    // 2. Aggressive 3D Mud-Terrain Tread Lugs
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const lug = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.07, 0.1), this.matBlackCladding);
      lug.position.set(0, Math.cos(angle) * (this.wheelRadius + 0.01), Math.sin(angle) * (this.wheelRadius + 0.01));
      lug.rotation.x = -angle;
      group.add(lug);
    }

    // 3. 18-inch Deep-Dish 5-Spoke Thar Alloy Rim
    const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.35, 18);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, this.matAlloyRim);
    group.add(rim);

    // 5 Bold Sculpted Alloy Spokes
    for (let s = 0; s < 5; s++) {
      const spokeAngle = (s / 5) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.08), this.matChrome);
      spoke.position.set(0.18, Math.cos(spokeAngle) * 0.14, Math.sin(spokeAngle) * 0.14);
      spoke.rotation.x = -spokeAngle;
      group.add(spoke);
    }

    // Center Hubcap with Chrome Lip
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.37, 12), this.matChrome);
    hub.rotateZ(Math.PI / 2);
    group.add(hub);

    // 4. Slotted Brake Disc & Red Performance Caliper inside the wheel
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 16), this.matBrakeDisc);
    disc.rotateZ(Math.PI / 2);
    disc.position.x = -0.05;
    group.add(disc);

    const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.14), this.matBrakeCaliper);
    caliper.position.set(-0.05, 0.14, 0);
    group.add(caliper);

    return group;
  }

  setupLighting() {
    // Powerful LED Driving Spotlights
    this.headlightSpotL = new THREE.SpotLight(0xfffaed, 3.2, 55, Math.PI / 5.5, 0.3, 1.1);
    this.headlightSpotL.position.set(-0.64, 0.8, 2.1);
    this.headlightTargetL = new THREE.Object3D();
    this.headlightTargetL.position.set(-0.64, 0.2, 22.0);
    this.chassis.add(this.headlightSpotL);
    this.chassis.add(this.headlightTargetL);
    this.headlightSpotL.target = this.headlightTargetL;

    this.headlightSpotR = new THREE.SpotLight(0xfffaed, 3.2, 55, Math.PI / 5.5, 0.3, 1.1);
    this.headlightSpotR.position.set(0.64, 0.8, 2.1);
    this.headlightTargetR = new THREE.Object3D();
    this.headlightTargetR.position.set(0.64, 0.2, 22.0);
    this.chassis.add(this.headlightSpotR);
    this.chassis.add(this.headlightTargetR);
    this.headlightSpotR.target = this.headlightTargetR;
  }

  setupParticles() {
    const maxMud = 70;
    const mudGeo = new THREE.SphereGeometry(0.16, 5, 5);
    const mudMat = new THREE.MeshStandardMaterial({ color: 0x3d2514, roughness: 0.95 });
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x5a707a, transparent: true, opacity: 0.75 });

    this.mudParticles = [];
    for (let i = 0; i < maxMud; i++) {
      const p = new THREE.Mesh(mudGeo, mudMat);
      p.visible = false;
      this.scene.add(p);
      this.mudParticles.push({
        mesh: p,
        vel: new THREE.Vector3(),
        life: 0,
        maxLife: 1.0,
        mudMat: mudMat,
        waterMat: waterMat
      });
    }
  }

  spawnMudSpray(worldOrigin, forwardDir, isWater) {
    for (let p of this.mudParticles) {
      if (!p.mesh.visible) {
        p.mesh.visible = true;
        p.mesh.material = isWater ? p.waterMat : p.mudMat;
        p.mesh.position.copy(worldOrigin);
        p.mesh.position.y += 0.25;

        p.vel.set(
          -forwardDir.x * (5 + Math.random() * 7) + (Math.random() - 0.5) * 5,
          3.0 + Math.random() * 5.0,
          -forwardDir.z * (5 + Math.random() * 7) + (Math.random() - 0.5) * 5
        );
        p.life = 0;
        p.maxLife = 0.6 + Math.random() * 0.4;
        break;
      }
    }
  }

  toggleDriveMode() {
    if (this.driveMode === '2WD') this.driveMode = '4WD';
    else if (this.driveMode === '4WD') this.driveMode = '4WD_LOW';
    else this.driveMode = '2WD';
    return this.driveMode;
  }

  toggleHeadlights() {
    this.headlightsOn = !this.headlightsOn;
    this.headlightSpotL.intensity = this.headlightsOn ? 3.2 : 0;
    this.headlightSpotR.intensity = this.headlightsOn ? 3.2 : 0;
    return this.headlightsOn;
  }

  updatePhysics(delta) {
    const currentSpec = this.specs[this.driveMode];

    // 1. Steering dynamics
    const targetSteer = this.controls.steer * this.maxSteer;
    this.steerAngle = THREE.MathUtils.lerp(this.steerAngle, targetSteer, delta * 12);
    if (this.steeringWheelMesh) {
      this.steeringWheelMesh.rotation.z = -this.steerAngle * 2.8;
    }

    // 2. Query terrain and mud under chassis center
    const terrainInfo = this.terrain.sample(this.position.x, this.position.z);
    this.currentMudDepth = terrainInfo.waterDepth || (terrainInfo.isMud ? terrainInfo.mudViscosity * 0.6 : 0);
    this.inWater = terrainInfo.isWater;

    if (this.inWater && Math.abs(this.speed) > 4.0 && !this.wasInWater) {
      window.soundManager.playWaterSplash(Math.abs(this.speed));
    }
    this.wasInWater = this.inWater;

    // 3. Compute acceleration and drag
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);

    let driveForce = this.controls.throttle * currentSpec.accel;

    if (terrainInfo.isMud) {
      const mudPenalty = (terrainInfo.mudViscosity * 0.75) / currentSpec.mudTraction;
      const mudDrag = Math.max(0.25, 1.0 - mudPenalty);
      driveForce *= mudDrag;
    }

    if (this.controls.brake) {
      driveForce = 0;
      this.speed *= Math.max(0, 1.0 - delta * 5.5);
    } else {
      this.speed += driveForce * delta;
      const dragFactor = (terrainInfo.isWater ? 2.4 : 0.8) + (terrainInfo.isMud ? 1.4 : 0.2);
      this.speed -= this.speed * dragFactor * delta;
    }

    this.speed = THREE.MathUtils.clamp(this.speed, -currentSpec.maxSpeed * 0.45, currentSpec.maxSpeed);

    // 4. Turning
    if (Math.abs(this.speed) > 0.05) {
      const turnRate = (this.speed / this.wheelBase) * Math.tan(this.steerAngle);
      this.rotation.y += turnRate * delta;
    }

    // 5. Forward position update
    this.position.addScaledVector(forward, this.speed * delta);

    // 6. Realistic Wheel Suspension & Contact (DIRECT LOCAL TRANSFORM)
    let avgWheelGroundY = 0;
    let frontGroundY = 0;
    let rearGroundY = 0;
    let leftGroundY = 0;
    let rightGroundY = 0;

    this.wheels.forEach(w => {
      // Calculate wheel contact world coordinate
      const wheelWorldPos = new THREE.Vector3(w.localX, 0, w.localZ)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y)
        .add(this.position);

      const wTerrain = this.terrain.sample(wheelWorldPos.x, wheelWorldPos.z);
      const groundH = wTerrain.height;

      // Wheel suspension compression relative to chassis
      // Rest height is this.suspensionRestY (-0.42)
      const targetLocalY = THREE.MathUtils.clamp((groundH + this.wheelRadius) - this.position.y, -0.65, -0.22);
      w.holder.position.y = THREE.MathUtils.lerp(w.holder.position.y, targetLocalY, delta * 18);

      // Steer front wheels
      if (w.isFront) {
        w.holder.rotation.y = this.steerAngle;
      }

      // Roll wheels with speed
      const rollSpeed = (this.speed / this.wheelRadius) * delta;
      w.mesh.rotation.x += rollSpeed;

      // Mud Spray
      if (wTerrain.isMud && Math.abs(this.speed) > 2.5 && Math.random() < 0.35) {
        this.spawnMudSpray(wheelWorldPos, forward, wTerrain.isWater);
      }

      avgWheelGroundY += groundH;
      if (w.isFront) frontGroundY += groundH * 0.5;
      else rearGroundY += groundH * 0.5;

      if (w.localX < 0) leftGroundY += groundH * 0.5;
      else rightGroundY += groundH * 0.5;
    });

    avgWheelGroundY /= 4;

    // 7. Chassis target height
    const targetChassisY = avgWheelGroundY + this.wheelRadius - this.suspensionRestY;
    this.position.y = THREE.MathUtils.lerp(this.position.y, targetChassisY, delta * 15);

    // 8. Vehicle Pitch and Roll
    const targetPitch = Math.atan2(rearGroundY - frontGroundY, this.wheelBase);
    const targetRoll = Math.atan2(leftGroundY - rightGroundY, this.trackWidth);

    const accelInertia = -this.controls.throttle * 0.08;
    const turnInertia = (this.speed * this.steerAngle) * 0.04;

    this.pitch = THREE.MathUtils.lerp(this.pitch, targetPitch + accelInertia, delta * 10);
    this.roll = THREE.MathUtils.lerp(this.roll, targetRoll + turnInertia, delta * 10);

    // Apply transforms
    this.chassis.rotation.set(this.pitch, 0, this.roll, 'XYZ');
    this.root.position.copy(this.position);
    this.root.rotation.y = this.rotation.y;

    // 9. Update Particles
    this.updateParticles(delta);

    // 10. Update Engine Audio
    const speedRatio = Math.abs(this.speed) / currentSpec.maxSpeed;
    const isThrottling = Math.abs(this.controls.throttle) > 0.1;
    const isLowRange = this.driveMode === '4WD_LOW';
    window.soundManager.updateEngine(speedRatio, isThrottling, isLowRange, this.currentMudDepth);
  }

  updateParticles(delta) {
    this.mudParticles.forEach(p => {
      if (p.mesh.visible) {
        p.life += delta;
        p.vel.y -= 15.0 * delta;
        p.mesh.position.addScaledVector(p.vel, delta);
        if (p.life >= p.maxLife) {
          p.mesh.visible = false;
        }
      }
    });
  }

  resetToRoad(checkpointZ = null) {
    const z = checkpointZ !== null ? checkpointZ : Math.max(45, this.position.z - 20);
    const x = this.terrain.getRoadCenter(z);
    const y = this.terrain.getElevation(x, z) + 1.2;

    this.position.set(x, y, z);
    this.velocity.set(0, 0, 0);
    this.speed = 0;
    this.pitch = 0;
    this.roll = 0;
    this.rotation.set(0, 0, 0);
    this.chassis.rotation.set(0, 0, 0);
  }
}

window.TharVehicle = TharVehicle;
