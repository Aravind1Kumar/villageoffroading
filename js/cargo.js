// Physics-Driven Sacred Cargo System: Golden Makhan Pots (Butter Matkas)
class CargoSystem {
  constructor(scene, thar) {
    this.scene = scene;
    this.thar = thar;
    this.totalPots = 5;
    this.pots = [];
    this.brokenCount = 0;

    // Materials
    this.matPotClay = new THREE.MeshStandardMaterial({
      color: 0xc86432, // Terracotta baked clay
      roughness: 0.8
    });

    this.matPotGold = new THREE.MeshStandardMaterial({
      color: 0xf5b800, // Golden sacred decorative band
      metalness: 0.8,
      roughness: 0.3
    });

    this.matButterWhite = new THREE.MeshStandardMaterial({
      color: 0xfffff0, // Fresh churned Makhan
      roughness: 0.2
    });

    this.matJuteRope = new THREE.MeshStandardMaterial({
      color: 0x8a7455, // Natural jute rope tie-down
      roughness: 0.95
    });

    this.buildCargoPots();
    this.setupShatterParticles();

    // Previous frame vehicle metrics for impulse shock detection
    this.prevSpeed = 0;
    this.prevPitch = 0;
    this.prevRoll = 0;
  }

  buildCargoPots() {
    // 5 pot layout in the 1.4m x 1.4m rear bed
    const potOffsets = [
      { x: -0.35, z:  0.30 }, // Front Left
      { x:  0.35, z:  0.30 }, // Front Right
      { x: -0.35, z: -0.30 }, // Rear Left
      { x:  0.35, z: -0.30 }, // Rear Right
      { x:  0.00, z:  0.00 }  // Center Master Pot
    ];

    potOffsets.forEach((pos, idx) => {
      const potGroup = new THREE.Group();
      potGroup.position.set(pos.x, 0.15, pos.z);

      // Bulbous earthen Matka body
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 12), this.matPotClay);
      body.scale.set(1.0, 0.9, 1.0);
      potGroup.add(body);

      // Golden ceremonial band around neck
      const neckBand = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.04, 6, 12), this.matPotGold);
      neckBand.position.y = 0.16;
      neckBand.rotation.x = Math.PI / 2;
      potGroup.add(neckBand);

      // Pot rim / mouth
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.12, 12), this.matPotClay);
      rim.position.y = 0.24;
      potGroup.add(rim);

      // Overflowing fresh white butter (Makhan)
      const butter = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), this.matButterWhite);
      butter.position.y = 0.26;
      potGroup.add(butter);

      // Jute ropes securing the pot to the bed
      const rope1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.6, 4), this.matJuteRope);
      rope1.rotation.z = 0.45;
      rope1.position.set(0.1, 0.1, 0);
      potGroup.add(rope1);

      const rope2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.6, 4), this.matJuteRope);
      rope2.rotation.z = -0.45;
      rope2.position.set(-0.1, 0.1, 0);
      potGroup.add(rope2);

      this.thar.cargoBed.add(potGroup);

      this.pots.push({
        id: idx + 1,
        group: potGroup,
        basePos: new THREE.Vector3(pos.x, 0.15, pos.z),
        currentOffset: new THREE.Vector3(0, 0, 0),
        wobbleVel: new THREE.Vector3(0, 0, 0),
        tiltAngle: 0,
        health: 100,
        isBroken: false,
        stress: 0
      });
    });
  }

  setupShatterParticles() {
    this.shards = [];
    const shardGeo = new THREE.TetrahedronGeometry(0.12);

    for (let i = 0; i < 40; i++) {
      const mesh = new THREE.Mesh(shardGeo, i % 2 === 0 ? this.matPotClay : this.matButterWhite);
      mesh.visible = false;
      this.scene.add(mesh);
      this.shards.push({
        mesh: mesh,
        vel: new THREE.Vector3(),
        rotVel: new THREE.Vector3(),
        life: 0,
        maxLife: 1.5
      });
    }
  }

  shatterPot(pot) {
    if (pot.isBroken) return;
    pot.isBroken = true;
    this.brokenCount++;
    pot.group.visible = false;

    // Trigger shatter sound
    window.soundManager.playPotShatter();

    // Spawn explosion of clay shards and butter splatters in world space
    const worldPos = new THREE.Vector3();
    pot.group.getWorldPosition(worldPos);

    let spawned = 0;
    for (let s of this.shards) {
      if (!s.mesh.visible && spawned < 8) {
        s.mesh.visible = true;
        s.mesh.position.copy(worldPos);
        s.vel.set(
          (Math.random() - 0.5) * 8.0,
          3.5 + Math.random() * 5.0,
          (Math.random() - 0.5) * 8.0
        );
        s.rotVel.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
        s.life = 0;
        s.maxLife = 1.0 + Math.random() * 0.6;
        spawned++;
      }
    }

    // Trigger UI notification event
    if (window.onPotBroken) {
      window.onPotBroken(this.getRemainingPots(), this.totalPots);
    }
  }

  update(delta) {
    // 1. Calculate vehicle dynamic forces & shocks
    const speedChange = (this.thar.speed - this.prevSpeed) / Math.max(delta, 0.001); // m/s^2 longitudinal
    const pitchChange = (this.thar.pitch - this.prevPitch) / Math.max(delta, 0.001);
    const rollChange = (this.thar.roll - this.prevRoll) / Math.max(delta, 0.001);

    // Lateral centrifugal force
    const turnG = (this.thar.speed * this.thar.steerAngle) * 3.5;
    // Violent bump impulse (from deep pits or sharp bumps)
    const shockG = Math.abs(speedChange) * 0.2 + Math.abs(pitchChange) * 4.0 + Math.abs(rollChange) * 4.5;

    // Check extreme tilt (chassis tipping over in mud ditch)
    const tiltMag = Math.sqrt(this.thar.pitch * this.thar.pitch + this.thar.roll * this.thar.roll);
    const isExtremeTilt = tiltMag > 0.55; // > ~32 degrees

    // 2. Simulate each pot's spring wobble and tension
    this.pots.forEach(pot => {
      if (pot.isBroken) return;

      // Spring-damper physics for pot wobble
      const targetWobbleX = -turnG * 0.04 - this.thar.roll * 0.3;
      const targetWobbleZ = speedChange * 0.015 + this.thar.pitch * 0.3;

      // Spring pull towards bed
      const springK = 35.0;
      const dampK = 5.0;

      const fX = (targetWobbleX - pot.currentOffset.x) * springK - pot.wobbleVel.x * dampK;
      const fZ = (targetWobbleZ - pot.currentOffset.z) * springK - pot.wobbleVel.z * dampK;

      pot.wobbleVel.x += fX * delta;
      pot.wobbleVel.z += fZ * delta;

      pot.currentOffset.x += pot.wobbleVel.x * delta;
      pot.currentOffset.z += pot.wobbleVel.z * delta;

      // Apply displacement & tilt to 3D mesh
      pot.group.position.x = pot.basePos.x + pot.currentOffset.x;
      pot.group.position.z = pot.basePos.z + pot.currentOffset.z;
      pot.group.rotation.z = -pot.currentOffset.x * 2.2;
      pot.group.rotation.x = pot.currentOffset.z * 2.2;

      // Vertical bounce on hard shocks
      if (shockG > 12.0) {
        pot.group.position.y = pot.basePos.y + Math.min(0.35, shockG * 0.01);
      } else {
        pot.group.position.y = pot.basePos.y;
      }

      // Compute stress damage
      let frameStress = 0;
      if (shockG > 18.0) frameStress += (shockG - 18.0) * 1.8;
      if (Math.abs(turnG) > 8.0) frameStress += (Math.abs(turnG) - 8.0) * 1.5;
      if (isExtremeTilt) frameStress += (tiltMag - 0.55) * 60.0;

      // Plunging violently into deep water
      if (this.thar.inWater && Math.abs(this.thar.speed) > 7.0) {
        frameStress += 25.0;
      }

      if (frameStress > 0) {
        pot.health -= frameStress * delta * 8.0;
        pot.stress = Math.min(100, pot.stress + frameStress);

        if (pot.health <= 0 || Math.abs(pot.currentOffset.x) > 0.55 || Math.abs(pot.currentOffset.z) > 0.65) {
          this.shatterPot(pot);
        }
      }
    });

    // 3. Update Shards
    this.shards.forEach(s => {
      if (s.mesh.visible) {
        s.life += delta;
        s.vel.y -= 14.0 * delta;
        s.mesh.position.addScaledVector(s.vel, delta);
        s.mesh.rotation.x += s.rotVel.x * delta;
        s.mesh.rotation.y += s.rotVel.y * delta;

        if (s.life >= s.maxLife || s.mesh.position.y < this.scene.position.y) {
          s.mesh.visible = false;
        }
      }
    });

    this.prevSpeed = this.thar.speed;
    this.prevPitch = this.thar.pitch;
    this.prevRoll = this.thar.roll;
  }

  getRemainingPots() {
    return this.totalPots - this.brokenCount;
  }

  isAllBroken() {
    return this.brokenCount >= this.totalPots;
  }

  reset() {
    this.brokenCount = 0;
    this.pots.forEach(p => {
      p.isBroken = false;
      p.health = 100;
      p.stress = 0;
      p.group.visible = true;
      p.currentOffset.set(0, 0, 0);
      p.wobbleVel.set(0, 0, 0);
      p.group.position.copy(p.basePos);
      p.group.rotation.set(0, 0, 0);
    });
  }
}

window.CargoSystem = CargoSystem;
