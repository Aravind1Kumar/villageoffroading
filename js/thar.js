// 3D Mahindra Thar 4x4 Off-Roader Vehicle Simulation with Suspension & Mud Dynamics
class TharVehicle {
  constructor(scene, terrain) {
    this.scene = scene;
    this.terrain = terrain;

    // Vehicle Physical State
    this.position = new THREE.Vector3(0, 5, 45);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.rotation = new THREE.Euler(0, 0, 0, 'YXZ');
    this.quaternion = new THREE.Quaternion();
    this.speed = 0; // forward speed in m/s
    this.steerAngle = 0;
    this.pitch = 0;
    this.roll = 0;

    // 4WD Drive Modes: '2WD', '4WD', '4WD_LOW'
    this.driveMode = '4WD'; // Default to 4WD for off-roading
    this.headlightsOn = true;
    this.handbrake = false;

    // Vehicle Tuning Parameters
    this.wheelBase = 2.6; // distance between front & rear axles
    this.trackWidth = 1.8; // distance between left & right wheels
    this.maxSteer = 0.55;  // ~31 degrees
    this.suspensionRestLength = 0.95;
    this.suspensionStiffness = 38.0;
    this.suspensionDamping = 6.5;

    // Drive Specs by Mode
    this.specs = {
      '2WD':     { maxSpeed: 20.0, accel: 14.0, mudTraction: 0.35, label: '2WD HIGH' },
      '4WD':     { maxSpeed: 15.0, accel: 18.0, mudTraction: 0.75, label: '4WD HIGH' },
      '4WD_LOW': { maxSpeed: 8.5,  accel: 28.0, mudTraction: 1.45, label: '4WD LOW (CRAWL)' }
    };

    // Mud & Water immersion metrics
    this.currentMudDepth = 0;
    this.inWater = false;
    this.mudSplatterLevel = 0; // 0 to 1

    // Particle Emitters
    this.mudParticles = [];
    this.exhaustParticles = [];

    // Build 3D Mesh
    this.buildThar();
    this.setupLighting();
    this.setupParticles();

    // Input state
    this.controls = {
      throttle: 0, // -1 (reverse) to 1 (accelerate)
      steer: 0,    // -1 (left) to 1 (right)
      brake: false
    };
  }

  buildThar() {
    this.root = new THREE.Group();
    this.chassis = new THREE.Group();
    this.root.add(this.chassis);

    // Color Materials
    this.matBody = new THREE.MeshStandardMaterial({
      color: 0x9e1b1b, // Iconic Thar Napoli Red / Deep Crimson
      roughness: 0.35,
      metalness: 0.4
    });

    this.matTrim = new THREE.MeshStandardMaterial({
      color: 0x1a1a1c, // Textured matte black plastic bumpers & fender flares
      roughness: 0.85
    });

    this.matChrome = new THREE.MeshStandardMaterial({
      color: 0xd8d8d8,
      metalness: 0.9,
      roughness: 0.2
    });

    this.matGlass = new THREE.MeshStandardMaterial({
      color: 0x223344,
      transparent: true,
      opacity: 0.6,
      roughness: 0.1
    });

    this.matTire = new THREE.MeshStandardMaterial({
      color: 0x141416,
      roughness: 0.95
    });

    this.matRim = new THREE.MeshStandardMaterial({
      color: 0x777777,
      metalness: 0.8,
      roughness: 0.3
    });

    this.matLightGlow = new THREE.MeshBasicMaterial({ color: 0xffffee });
    this.matRedGlow = new THREE.MeshBasicMaterial({ color: 0xff1111 });

    // 1. Main Lower Body Box
    const bodyGeo = new THREE.BoxGeometry(1.85, 0.85, 3.8);
    const body = new THREE.Mesh(bodyGeo, this.matBody);
    body.position.y = 0.85;
    this.chassis.add(body);

    // 2. Bonnet / Hood
    const hoodGeo = new THREE.BoxGeometry(1.65, 0.45, 1.4);
    const hood = new THREE.Mesh(hoodGeo, this.matBody);
    hood.position.set(0, 1.25, 1.1);
    this.chassis.add(hood);

    // 3. Iconic 7-Slot Front Grille
    const grilleBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.55, 0.15), this.matTrim);
    grilleBase.position.set(0, 0.95, 1.88);
    this.chassis.add(grilleBase);

    for (let i = -3; i <= 3; i++) {
      const slot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.38, 0.18), this.matChrome);
      slot.position.set(i * 0.18, 0.95, 1.89);
      this.chassis.add(slot);
    }

    // 4. Round LED Projector Headlights
    for (let sx of [-0.68, 0.68]) {
      const lampHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16), this.matTrim);
      lampHousing.rotateX(Math.PI / 2);
      lampHousing.position.set(sx, 0.95, 1.9);
      this.chassis.add(lampHousing);

      const lampLens = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.12, 16), this.matLightGlow);
      lampLens.rotateX(Math.PI / 2);
      lampLens.position.set(sx, 0.95, 1.92);
      this.chassis.add(lampLens);
    }

    // 5. Heavy-Duty Off-Road Front Bumper with Winch
    const bumperGeo = new THREE.BoxGeometry(2.1, 0.4, 0.4);
    const bumper = new THREE.Mesh(bumperGeo, this.matTrim);
    bumper.position.set(0, 0.48, 1.95);
    this.chassis.add(bumper);

    const winch = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.5, 12), this.matChrome);
    winch.rotateZ(Math.PI / 2);
    winch.position.set(0, 0.55, 2.15);
    this.chassis.add(winch);

    // 6. Flared Wheel Arches / Fenders
    for (let side of [-1, 1]) {
      // Front flare
      const flareF = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 1.0), this.matTrim);
      flareF.position.set(side * 0.98, 0.85, 1.25);
      this.chassis.add(flareF);

      // Rear flare
      const flareR = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 1.1), this.matTrim);
      flareR.position.set(side * 0.98, 0.85, -1.25);
      this.chassis.add(flareR);

      // Side footstep rail
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.08, 1.4), this.matTrim);
      rail.position.set(side * 1.0, 0.42, 0);
      this.chassis.add(rail);
    }

    // 7. Cabin Roof & Safari Roll-Bars
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 0.1), this.matGlass);
    windshield.position.set(0, 1.7, 0.35);
    windshield.rotation.x = -0.32;
    this.chassis.add(windshield);

    // Roll cage tubular frame
    const cageGeo = new THREE.CylinderGeometry(0.06, 0.06, 1.2, 8);
    for (let side of [-0.85, 0.85]) {
      // A-pillar
      const pA = new THREE.Mesh(cageGeo, this.matTrim);
      pA.position.set(side, 1.6, 0.25);
      pA.rotation.x = -0.32;
      this.chassis.add(pA);

      // B-pillar
      const pB = new THREE.Mesh(cageGeo, this.matTrim);
      pB.position.set(side, 1.7, -0.6);
      this.chassis.add(pB);

      // C-pillar
      const pC = new THREE.Mesh(cageGeo, this.matTrim);
      pC.position.set(side, 1.7, -1.6);
      this.chassis.add(pC);

      // Top longitudinal rail
      const railTop = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.0, 8), this.matTrim);
      railTop.rotateX(Math.PI / 2);
      railTop.position.set(side, 2.2, -0.7);
      this.chassis.add(railTop);
    }

    // Roof Top Canopy over front seats
    const roofCanopy = new THREE.Mesh(new THREE.BoxGeometry(1.75, 0.12, 1.2), this.matTrim);
    roofCanopy.position.set(0, 2.22, -0.2);
    this.chassis.add(roofCanopy);

    // Roof LED Light Bar
    const lightBar = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.15, 0.15), this.matLightGlow);
    lightBar.position.set(0, 2.32, 0.3);
    this.chassis.add(lightBar);

    // 8. Open Rear Cargo Bed (Where Makhan Matkas are securely loaded)
    this.cargoBed = new THREE.Group();
    this.cargoBed.position.set(0, 0.95, -1.15); // local position of cargo bed
    this.chassis.add(this.cargoBed);

    // Floor of cargo bed
    const bedFloor = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 1.4), this.matTrim);
    bedFloor.position.y = -0.05;
    this.cargoBed.add(bedFloor);

    // Side walls of bed
    for (let side of [-0.75, 0.75]) {
      const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 1.4), this.matBody);
      sideWall.position.set(side, 0.2, 0);
      this.cargoBed.add(sideWall);
    }

    // Tailgate
    const tailgate = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 0.08), this.matBody);
    tailgate.position.set(0, 0.2, -0.7);
    this.cargoBed.add(tailgate);

    // 9. Rear Mounted Spare Wheel
    const spareWheel = this.createWheelMesh();
    spareWheel.position.set(0, 1.15, -2.05);
    this.chassis.add(spareWheel);

    // Tail lights
    for (let sx of [-0.78, 0.78]) {
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.35, 0.08), this.matRedGlow);
      tail.position.set(sx, 0.85, -1.92);
      this.chassis.add(tail);
    }

    // 10. Dashboard & Steering Wheel
    const dash = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.4, 0.5), this.matTrim);
    dash.position.set(0, 1.25, 0.15);
    this.chassis.add(dash);

    const steering = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 6, 12), this.matTrim);
    steering.position.set(-0.45, 1.35, 0.05);
    steering.rotation.x = 0.5;
    this.chassis.add(steering);
    this.steeringWheelMesh = steering;

    // 11. Four Independent Suspension Wheels
    this.wheels = [];
    const wheelPositions = [
      { id: 'FL', x: -this.trackWidth * 0.5, z:  this.wheelBase * 0.5, isFront: true },
      { id: 'FR', x:  this.trackWidth * 0.5, z:  this.wheelBase * 0.5, isFront: true },
      { id: 'RL', x: -this.trackWidth * 0.5, z: -this.wheelBase * 0.5, isFront: false },
      { id: 'RR', x:  this.trackWidth * 0.5, z: -this.wheelBase * 0.5, isFront: false }
    ];

    wheelPositions.forEach(wp => {
      const wheelHolder = new THREE.Group();
      wheelHolder.position.set(wp.x, 0.45, wp.z);

      const wheelMesh = this.createWheelMesh();
      wheelHolder.add(wheelMesh);
      this.root.add(wheelHolder);

      this.wheels.push({
        id: wp.id,
        holder: wheelHolder,
        mesh: wheelMesh,
        localX: wp.x,
        localZ: wp.z,
        isFront: wp.isFront,
        suspensionLength: this.suspensionRestLength,
        angularVelocity: 0,
        groundContact: false
      });
    });

    this.scene.add(this.root);
  }

  createWheelMesh() {
    const group = new THREE.Group();

    // 32-inch chunky off-road knobby tire
    const tireGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.34, 18);
    tireGeo.rotateZ(Math.PI / 2);
    const tire = new THREE.Mesh(tireGeo, this.matTire);
    group.add(tire);

    // Tread Blocks / Lugs for off-road mud grip
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const lug = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.06, 0.1), this.matTrim);
      lug.position.set(0, Math.cos(angle) * 0.48, Math.sin(angle) * 0.48);
      lug.rotation.x = -angle;
      group.add(lug);
    }

    // Heavy-duty alloy rim
    const rimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.36, 12);
    rimGeo.rotateZ(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeo, this.matRim);
    group.add(rim);

    // Hub center cap
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.38, 8), this.matChrome);
    hub.rotateZ(Math.PI / 2);
    group.add(hub);

    return group;
  }

  setupLighting() {
    // Powerful LED Spotlights for night / twilight village driving
    this.headlightSpotL = new THREE.SpotLight(0xfffaed, 2.5, 45, Math.PI / 6, 0.4, 1.2);
    this.headlightSpotL.position.set(-0.68, 1.0, 2.0);
    this.headlightTargetL = new THREE.Object3D();
    this.headlightTargetL.position.set(-0.68, 0.2, 18.0);
    this.chassis.add(this.headlightSpotL);
    this.chassis.add(this.headlightTargetL);
    this.headlightSpotL.target = this.headlightTargetL;

    this.headlightSpotR = new THREE.SpotLight(0xfffaed, 2.5, 45, Math.PI / 6, 0.4, 1.2);
    this.headlightSpotR.position.set(0.68, 1.0, 2.0);
    this.headlightTargetR = new THREE.Object3D();
    this.headlightTargetR.position.set(0.68, 0.2, 18.0);
    this.chassis.add(this.headlightSpotR);
    this.chassis.add(this.headlightTargetR);
    this.headlightSpotR.target = this.headlightTargetR;
  }

  setupParticles() {
    // Mud and Water Splash Particles
    const maxMud = 60;
    const mudGeo = new THREE.SphereGeometry(0.14, 4, 4);
    const mudMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.9 });
    const waterMat = new THREE.MeshStandardMaterial({ color: 0x7a8a92, transparent: true, opacity: 0.7 });

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

  spawnMudSpray(origin, forwardDir, isWater) {
    for (let p of this.mudParticles) {
      if (!p.mesh.visible) {
        p.mesh.visible = true;
        p.mesh.material = isWater ? p.waterMat : p.mudMat;
        p.mesh.position.copy(origin);
        p.mesh.position.y += 0.2;

        // Fling particles backward and outward
        p.vel.set(
          -forwardDir.x * (4 + Math.random() * 6) + (Math.random() - 0.5) * 4,
          2.5 + Math.random() * 4.5,
          -forwardDir.z * (4 + Math.random() * 6) + (Math.random() - 0.5) * 4
        );
        p.life = 0;
        p.maxLife = 0.5 + Math.random() * 0.4;
        break;
      }
    }
  }

  // Toggle 4WD Modes: 2WD -> 4WD -> 4WD_LOW -> 2WD
  toggleDriveMode() {
    if (this.driveMode === '2WD') this.driveMode = '4WD';
    else if (this.driveMode === '4WD') this.driveMode = '4WD_LOW';
    else this.driveMode = '2WD';
    return this.driveMode;
  }

  toggleHeadlights() {
    this.headlightsOn = !this.headlightsOn;
    this.headlightSpotL.intensity = this.headlightsOn ? 2.5 : 0;
    this.headlightSpotR.intensity = this.headlightsOn ? 2.5 : 0;
    return this.headlightsOn;
  }

  updatePhysics(delta) {
    const currentSpec = this.specs[this.driveMode];

    // 1. Steering dynamics
    const targetSteer = this.controls.steer * this.maxSteer;
    this.steerAngle = THREE.MathUtils.lerp(this.steerAngle, targetSteer, delta * 12);
    if (this.steeringWheelMesh) {
      this.steeringWheelMesh.rotation.z = -this.steerAngle * 2.5;
    }

    // 2. Query terrain and mud under chassis center
    const terrainInfo = this.terrain.sample(this.position.x, this.position.z);
    this.currentMudDepth = terrainInfo.waterDepth || (terrainInfo.isMud ? terrainInfo.mudViscosity * 0.5 : 0);
    this.inWater = terrainInfo.isWater;

    // Check if entered water pit abruptly -> trigger splash sound
    if (this.inWater && Math.abs(this.speed) > 4.0 && !this.wasInWater) {
      window.soundManager.playWaterSplash(Math.abs(this.speed));
    }
    this.wasInWater = this.inWater;

    // 3. Compute acceleration and drag
    const forward = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);

    let driveForce = this.controls.throttle * currentSpec.accel;

    // Mud resistance penalty
    let mudDrag = 1.0;
    if (terrainInfo.isMud) {
      const mudPenalty = (terrainInfo.mudViscosity * 0.8) / currentSpec.mudTraction;
      mudDrag = Math.max(0.2, 1.0 - mudPenalty);
      driveForce *= mudDrag;
    }

    // Handbrake
    if (this.controls.brake) {
      driveForce = 0;
      this.speed *= Math.max(0, 1.0 - delta * 5.0);
    } else {
      this.speed += driveForce * delta;
      // Natural rolling resistance and air drag
      const dragFactor = (terrainInfo.isWater ? 2.2 : 0.8) + (terrainInfo.isMud ? 1.5 : 0.2);
      this.speed -= this.speed * dragFactor * delta;
    }

    // Speed limits
    this.speed = THREE.MathUtils.clamp(this.speed, -currentSpec.maxSpeed * 0.4, currentSpec.maxSpeed);

    // 4. Turning with vehicle speed
    if (Math.abs(this.speed) > 0.05) {
      const turnRate = (this.speed / this.wheelBase) * Math.tan(this.steerAngle);
      this.rotation.y += turnRate * delta;
    }

    // 5. Update position based on forward velocity
    this.position.addScaledVector(forward, this.speed * delta);

    // 6. Wheels Raycast Suspension & Terrain Articulation
    let avgWheelGroundY = 0;
    let frontGroundY = 0;
    let rearGroundY = 0;
    let leftGroundY = 0;
    let rightGroundY = 0;

    this.wheels.forEach(w => {
      // Calculate wheel world position
      const wheelWorldPos = new THREE.Vector3(w.localX, 0, w.localZ)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y)
        .add(this.position);

      const wTerrain = this.terrain.sample(wheelWorldPos.x, wheelWorldPos.z);
      const groundY = wTerrain.height;

      // Wheel suspension compression
      const currentSuspension = (this.position.y - groundY);
      w.suspensionLength = THREE.MathUtils.clamp(currentSuspension, 0.4, this.suspensionRestLength * 1.3);

      // Wheel placement in world
      w.holder.position.set(wheelWorldPos.x, groundY + 0.48, wheelWorldPos.z);
      w.holder.rotation.y = this.rotation.y;

      // Steer front wheels
      if (w.isFront) {
        w.mesh.rotation.y = this.steerAngle;
      }

      // Wheel roll rotation
      const rollSpeed = (this.speed / 0.48) * delta;
      w.mesh.rotation.x += rollSpeed;

      // Mud Spray when spinning in mud/water
      if (wTerrain.isMud && Math.abs(this.speed) > 2.5 && Math.random() < 0.4) {
        this.spawnMudSpray(wheelWorldPos, forward, wTerrain.isWater);
      }

      avgWheelGroundY += groundY;
      if (w.isFront) frontGroundY += groundY * 0.5;
      else rearGroundY += groundY * 0.5;

      if (w.localX < 0) leftGroundY += groundY * 0.5;
      else rightGroundY += groundY * 0.5;
    });

    avgWheelGroundY /= 4;

    // 7. Chassis target height and smooth damping
    const targetChassisY = avgWheelGroundY + this.suspensionRestLength;
    this.position.y = THREE.MathUtils.lerp(this.position.y, targetChassisY, delta * 14);

    // 8. Vehicle Pitch (nose up/down) and Roll (side tilt)
    const targetPitch = Math.atan2(rearGroundY - frontGroundY, this.wheelBase);
    const targetRoll = Math.atan2(leftGroundY - rightGroundY, this.trackWidth);

    // Inertial pitch/roll on acceleration and hard turns
    const accelInertia = -this.controls.throttle * 0.08;
    const turnInertia = (this.speed * this.steerAngle) * 0.04;

    this.pitch = THREE.MathUtils.lerp(this.pitch, targetPitch + accelInertia, delta * 10);
    this.roll = THREE.MathUtils.lerp(this.roll, targetRoll + turnInertia, delta * 10);

    // Apply transforms to chassis
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
        p.vel.y -= 15.0 * delta; // Gravity
        p.mesh.position.addScaledVector(p.vel, delta);
        if (p.life >= p.maxLife || p.mesh.position.y < this.terrain.getElevation(p.mesh.position.x, p.mesh.position.z)) {
          p.mesh.visible = false;
        }
      }
    });
  }

  // Get current world position of the rear cargo bed (for cargo physics)
  getCargoBedWorldPos() {
    const worldPos = new THREE.Vector3();
    this.cargoBed.getWorldPosition(worldPos);
    return worldPos;
  }

  // Reset vehicle to current village road
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
