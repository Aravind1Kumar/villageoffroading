// 3D Procedural Lord Krishna Character with Traditional Attire & Cutscene Animations
class KrishnaCharacter {
  constructor(scene) {
    this.scene = scene;

    // Materials
    this.matSkin = new THREE.MeshStandardMaterial({
      color: 0x4a9be4, // Divine Shyam Varna (radiant sky-blue)
      roughness: 0.6,
      metalness: 0.1
    });

    this.matPitambar = new THREE.MeshStandardMaterial({
      color: 0xf5b800, // Vibrant Pitambar (sacred yellow silk)
      roughness: 0.5,
      metalness: 0.15
    });

    this.matAngavastra = new THREE.MeshStandardMaterial({
      color: 0xe67e22, // Saffron orange silk sash
      roughness: 0.5
    });

    this.matGold = new THREE.MeshStandardMaterial({
      color: 0xffd700, // Gold ornaments (mukut, kundal, flute)
      metalness: 0.85,
      roughness: 0.25
    });

    this.matHair = new THREE.MeshStandardMaterial({
      color: 0x111116,
      roughness: 0.9
    });

    this.matPeacockEye = new THREE.MeshStandardMaterial({
      color: 0x008080, // Teal green peacock eye
      roughness: 0.4,
      metalness: 0.4
    });

    this.matPeacockNavy = new THREE.MeshStandardMaterial({
      color: 0x000080,
      roughness: 0.4
    });

    this.group = new THREE.Group();
    this.buildCharacter();
    this.scene.add(this.group);

    // Animation & State
    this.state = 'IDLE'; // 'IDLE', 'WALKING_TO_CAR', 'IN_CAR', 'CELEBRATING'
    this.animTime = 0;
    this.walkTarget = null;
    this.onEnterCarCallback = null;
  }

  buildCharacter() {
    // 1. Torso
    this.torso = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 1.05, 8), this.matSkin);
    this.torso.position.y = 1.95;
    this.group.add(this.torso);

    // Golden necklace (Haar)
    const necklace = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.05, 6, 12), this.matGold);
    necklace.position.set(0, 2.3, 0.05);
    necklace.rotation.x = Math.PI / 2.3;
    this.group.add(necklace);

    // Saffron sash (Angavastra) across shoulder
    const sash = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.07, 6, 12), this.matAngavastra);
    sash.position.set(0, 1.95, 0);
    sash.rotation.set(0.3, 0.2, 0.8);
    this.group.add(sash);

    // 2. Head & Divine Face
    this.head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 12), this.matSkin);
    this.head.position.y = 2.75;
    this.group.add(this.head);

    // Hair bun / curls
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.36, 10, 10), this.matHair);
    hair.position.set(0, 2.85, -0.06);
    this.group.add(hair);

    // Ornate Golden Crown (Mukut)
    this.mukut = new THREE.Group();
    this.mukut.position.set(0, 3.02, 0);

    const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.35, 0.3, 10), this.matGold);
    this.mukut.add(crownBase);

    const crownSpire = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.6, 8), this.matGold);
    crownSpire.position.y = 0.42;
    this.mukut.add(crownSpire);

    // Mor Pankh (Peacock Feather)
    const featherGroup = new THREE.Group();
    featherGroup.position.set(0.12, 0.6, -0.05);
    featherGroup.rotation.z = -0.35;
    featherGroup.rotation.x = -0.15;

    // Stem
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.8, 6), this.matGold);
    stem.position.y = 0.35;
    featherGroup.add(stem);

    // Outer green feather plume
    const outerPlume = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), this.matPeacockEye);
    outerPlume.scale.set(0.7, 1.4, 0.2);
    outerPlume.position.y = 0.75;
    featherGroup.add(outerPlume);

    // Inner navy peacock eye
    const innerEye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), this.matPeacockNavy);
    innerEye.scale.set(0.7, 1.2, 0.25);
    innerEye.position.set(0, 0.75, 0.05);
    featherGroup.add(innerEye);

    // Center gold bead
    const goldBead = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), this.matGold);
    goldBead.position.set(0, 0.75, 0.08);
    featherGroup.add(goldBead);

    this.mukut.add(featherGroup);
    this.group.add(this.mukut);

    // 3. Yellow Dhoti (Pitambar) Lower Body
    this.dhoti = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.46, 0.85, 10), this.matPitambar);
    this.dhoti.position.y = 1.15;
    this.group.add(this.dhoti);

    // Golden Flute (Bansuri) at waist
    this.flute = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.1, 8), this.matGold);
    this.flute.position.set(0.25, 1.5, 0.3);
    this.flute.rotation.set(0.2, 0.3, 1.2);
    this.group.add(this.flute);

    // 4. Arms
    this.leftArm = this.createArm(-0.48);
    this.rightArm = this.createArm(0.48);
    this.group.add(this.leftArm.group);
    this.group.add(this.rightArm.group);

    // 5. Legs
    this.leftLeg = this.createLeg(-0.2);
    this.rightLeg = this.createLeg(0.2);
    this.group.add(this.leftLeg.group);
    this.group.add(this.rightLeg.group);

    // Scale character appropriately (total height ~2.0m)
    this.group.scale.set(0.9, 0.9, 0.9);
  }

  createArm(offsetX) {
    const group = new THREE.Group();
    group.position.set(offsetX, 2.35, 0);

    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.95, 8), this.matSkin);
    arm.position.y = -0.45;
    group.add(arm);

    // Golden Baju-band (armlet)
    const armlet = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.03, 6, 10), this.matGold);
    armlet.position.y = -0.22;
    armlet.rotation.x = Math.PI / 2;
    group.add(armlet);

    // Hand
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), this.matSkin);
    hand.position.y = -0.95;
    group.add(hand);

    return { group, arm };
  }

  createLeg(offsetX) {
    const group = new THREE.Group();
    group.position.set(offsetX, 0.85, 0);

    // Dhoti wrap over leg
    const upperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.13, 0.75, 8), this.matPitambar);
    upperLeg.position.y = -0.32;
    group.add(upperLeg);

    // Lower calf & foot
    const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.6, 8), this.matSkin);
    calf.position.y = -0.75;
    group.add(calf);

    // Golden Payal (Anklet)
    const anklet = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 6, 10), this.matGold);
    anklet.position.y = -0.92;
    anklet.rotation.x = Math.PI / 2;
    group.add(anklet);

    // Lotus foot
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.32), this.matSkin);
    foot.position.set(0, -0.98, 0.08);
    group.add(foot);

    return { group };
  }

  // Position Krishna at a specific world coordinate
  setPosition(x, y, z, rotY = 0) {
    this.group.position.set(x, y, z);
    this.group.rotation.y = rotY;
  }

  // Trigger Krishna walking from house veranda to the Thar driver's door
  startWalkToCar(carTargetPos, onComplete) {
    this.state = 'WALKING_TO_CAR';
    this.walkTarget = carTargetPos.clone();
    this.onEnterCarCallback = onComplete;
  }

  update(delta) {
    this.animTime += delta;

    if (this.state === 'WALKING_TO_CAR' && this.walkTarget) {
      const curPos = this.group.position;
      const dir = new THREE.Vector3().subVectors(this.walkTarget, curPos);
      dir.y = 0;
      const dist = dir.length();

      if (dist > 0.4) {
        dir.normalize();
        const walkSpeed = 3.2; // m/s
        curPos.addScaledVector(dir, walkSpeed * delta);

        // Face walk direction
        const targetAngle = Math.atan2(dir.x, dir.z);
        this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, targetAngle, 0.2);

        // Walking leg swing & arm swing animation
        const swing = Math.sin(this.animTime * 8) * 0.55;
        this.leftLeg.group.rotation.x = swing;
        this.rightLeg.group.rotation.x = -swing;
        this.leftArm.group.rotation.x = -swing * 0.7;
        this.rightArm.group.rotation.x = swing * 0.7;
      } else {
        // Reached the Thar! Transition into vehicle
        this.state = 'IN_CAR';
        this.leftLeg.group.rotation.x = 0;
        this.rightLeg.group.rotation.x = 0;
        this.leftArm.group.rotation.x = 0;
        this.rightArm.group.rotation.x = 0;

        if (this.onEnterCarCallback) {
          this.onEnterCarCallback();
        }
      }
    } else if (this.state === 'IN_CAR') {
      // Krishna sits comfortably in driver's seat holding steering wheel
      this.leftArm.group.rotation.x = -0.7;
      this.rightArm.group.rotation.x = -0.7;
      this.leftArm.group.rotation.z = 0.25;
      this.rightArm.group.rotation.z = -0.25;
    } else if (this.state === 'CELEBRATING') {
      // Victory dance / flute playing animation
      const sway = Math.sin(this.animTime * 4) * 0.2;
      this.group.rotation.y += delta * 0.8;
      this.leftArm.group.rotation.x = -1.2 + sway;
      this.rightArm.group.rotation.x = -1.2 - sway;
    }
  }

  // Mount Krishna inside the Thar cockpit
  mountInVehicle(vehicleCabinGroup) {
    this.scene.remove(this.group);
    // Position on right-hand drive (Indian driver side)
    this.group.position.set(-0.45, 0.25, -0.15);
    this.group.rotation.set(0, 0, 0);
    this.group.scale.set(0.68, 0.68, 0.68);
    vehicleCabinGroup.add(this.group);
    this.state = 'IN_CAR';
  }
}

window.KrishnaCharacter = KrishnaCharacter;
