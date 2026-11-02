// Master Game Engine: Krishna Thar 4x4 Off-Road Village Mud Challenge
class GameEngine {
  constructor() {
    this.container = document.getElementById('game-container');
    this.state = 'PROLOGUE'; // 'PROLOGUE', 'WALKING', 'DRIVING', 'GAMEOVER', 'VICTORY'

    // Scene & Renderer
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xd6a872); // Warm Indian rural golden sky
    this.scene.fog = new THREE.FogExp2(0xd6a872, 0.0035);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 2000);
    this.cameraMode = 0; // 0: Follow, 1: Hood, 2: Cinematic Drone, 3: Top-Down

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // Setup Lighting & Environment
    this.setupSunlight();

    // Instantiate Subsystems
    this.terrain = new VillageTerrain(this.scene);
    this.villages = new IndianVillages(this.scene, this.terrain);
    this.thar = new TharVehicle(this.scene, this.terrain);
    this.krishna = new KrishnaCharacter(this.scene);
    this.cargo = new CargoSystem(this.scene, this.thar);
    this.minimap = new MiniMap('minimap-canvas', this.terrain, this.thar, this.villages);

    // Setup Initial Positions in Gokul
    this.setupProloguePositions();

    // Clock
    this.clock = new THREE.Clock();

    // Checkpoints & Progress
    this.currentVillageIndex = 0;
    this.lastCheckpointZ = 45;

    // Setup Event Listeners & UI
    this.setupInputHandlers();
    this.setupUI();

    // Resize handler
    window.addEventListener('resize', () => this.onWindowResize());

    // Start render loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  setupSunlight() {
    // Ambient Warm Light
    const ambient = new THREE.AmbientLight(0xffeedd, 0.7);
    this.scene.add(ambient);

    // Directional Sun
    this.sun = new THREE.DirectionalLight(0xfffaed, 1.4);
    this.sun.position.set(100, 150, 100);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.width = 2048;
    this.sun.shadow.mapSize.height = 2048;
    this.sun.shadow.camera.near = 10;
    this.sun.shadow.camera.far = 400;
    const d = 120;
    this.sun.shadow.camera.left = -d;
    this.sun.shadow.camera.right = d;
    this.sun.shadow.camera.top = d;
    this.sun.shadow.camera.bottom = -d;
    this.scene.add(this.sun);

    // Hemisphere light for natural sky/ground contrast
    const hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x5a3e1b, 0.45);
    this.scene.add(hemiLight);
  }

  setupProloguePositions() {
    // Position Thar parked under neem tree near Krishna's haveli
    const carSpawn = this.villages.krishnaCarSpawnPos;
    this.thar.position.copy(carSpawn);
    this.thar.rotation.y = 0.05; // Facing road towards Gokul arch
    this.thar.resetToRoad(carSpawn.z);

    // Position Krishna on the veranda of his home
    const homePos = this.villages.krishnaHomePos;
    this.krishna.setPosition(homePos.x, homePos.y + 1.2, homePos.z + 7.5, Math.PI); // Facing courtyard

    // Position Camera for opening cinematic shot of Haveli & Krishna
    this.camera.position.set(homePos.x - 8, homePos.y + 4.5, homePos.z + 18);
    this.camera.lookAt(homePos.x, homePos.y + 2.5, homePos.z + 7.5);
  }

  startKrishnaWalkSequence() {
    if (this.state !== 'PROLOGUE') return;
    this.state = 'WALKING';

    window.soundManager.init();
    window.soundManager.playFluteTune();

    const banner = document.getElementById('village-banner');
    if (banner) {
      banner.innerHTML = `<h2>✨ GOKUL (गोकुल) ✨</h2><p>Lord Krishna sets out on his Thar 4x4 with Sacred Makhan!</p>`;
      banner.classList.add('show');
      setTimeout(() => banner.classList.remove('show'), 4000);
    }

    // Driver side door position in world space
    const carPos = this.thar.position.clone();
    const doorTarget = carPos.clone().add(new THREE.Vector3(-1.4, 0, -0.2));

    this.krishna.startWalkToCar(doorTarget, () => {
      // Krishna reached the Thar! Step into driver seat
      this.krishna.mountInVehicle(this.thar.chassis);
      this.state = 'DRIVING';

      // Start engine sound
      window.soundManager.updateEngine(0.1, false, false, 0);

      const hint = document.getElementById('instruction-hint');
      if (hint) {
        hint.innerHTML = `🚗 Krishna is behind the wheel! Use <b>W / A / S / D</b> to drive, <b>G</b> for 4WD Low Mud Mode!`;
        setTimeout(() => hint.style.opacity = '0', 6000);
      }
    });
  }

  setupInputHandlers() {
    this.keys = {};

    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      window.soundManager.init();

      if (this.state === 'PROLOGUE' && (e.code === 'Enter' || e.code === 'Space' || e.code === 'KeyW')) {
        this.startKrishnaWalkSequence();
        return;
      }

      if (e.code === 'KeyG') {
        const newMode = this.thar.toggleDriveMode();
        this.updateModeUI(newMode);
      } else if (e.code === 'KeyH') {
        window.soundManager.startHorn();
      } else if (e.code === 'KeyL') {
        this.thar.toggleHeadlights();
      } else if (e.code === 'KeyC') {
        this.cameraMode = (this.cameraMode + 1) % 4;
      } else if (e.code === 'KeyR') {
        this.recoverVehicle();
      } else if (e.code === 'KeyM') {
        const isMuted = window.soundManager.toggleMute();
        const muteBtn = document.getElementById('mute-btn');
        if (muteBtn) muteBtn.innerText = isMuted ? '🔇' : '🔊';
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
      if (e.code === 'KeyH') {
        window.soundManager.stopHorn();
      }
    });

    // Touch controls for mobile / tablet
    const bindTouchBtn = (id, onDown, onUp) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(); });
      el.addEventListener('touchend', (e) => { e.preventDefault(); onUp(); });
      el.addEventListener('mousedown', (e) => { e.preventDefault(); onDown(); });
      el.addEventListener('mouseup', (e) => { e.preventDefault(); onUp(); });
    };

    bindTouchBtn('btn-gas', () => { this.keys['KeyW'] = true; }, () => { this.keys['KeyW'] = false; });
    bindTouchBtn('btn-brake', () => { this.keys['KeyS'] = true; }, () => { this.keys['KeyS'] = false; });
    bindTouchBtn('btn-left', () => { this.keys['KeyA'] = true; }, () => { this.keys['KeyA'] = false; });
    bindTouchBtn('btn-right', () => { this.keys['KeyD'] = true; }, () => { this.keys['KeyD'] = false; });
    bindTouchBtn('btn-4wd', () => { const m = this.thar.toggleDriveMode(); this.updateModeUI(m); }, () => {});
    bindTouchBtn('btn-horn', () => { window.soundManager.startHorn(); }, () => { window.soundManager.stopHorn(); });
  }

  setupUI() {
    // Pot broken event handler
    window.onPotBroken = (remaining, total) => {
      this.updateCargoUI(remaining, total);

      // Warning flash
      const warningEl = document.getElementById('damage-flash');
      if (warningEl) {
        warningEl.classList.add('flash');
        setTimeout(() => warningEl.classList.remove('flash'), 500);
      }

      // Check if all pots broken
      if (remaining <= 0) {
        this.triggerGameOver();
      }
    };

    // Start Cutscene Button
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        document.getElementById('intro-modal').style.display = 'none';
        this.startKrishnaWalkSequence();
      });
    }

    // Top Header Buttons
    const camBtn = document.getElementById('cam-btn');
    if (camBtn) {
      camBtn.addEventListener('click', () => {
        this.cameraMode = (this.cameraMode + 1) % 4;
      });
    }

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.recoverVehicle();
      });
    }

    const muteBtn = document.getElementById('mute-btn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = window.soundManager.toggleMute();
        muteBtn.innerText = isMuted ? '🔇' : '🔊';
      });
    }

    const modeIndicator = document.getElementById('mode-indicator');
    if (modeIndicator) {
      modeIndicator.style.cursor = 'pointer';
      modeIndicator.addEventListener('click', () => {
        const newMode = this.thar.toggleDriveMode();
        this.updateModeUI(newMode);
      });
    }

    // Restart Button
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.restartGame());
    }

    const winRestartBtn = document.getElementById('win-restart-btn');
    if (winRestartBtn) {
      winRestartBtn.addEventListener('click', () => this.restartGame());
    }
  }

  updateModeUI(mode) {
    const el = document.getElementById('mode-indicator');
    if (el) {
      el.innerText = this.thar.specs[mode].label;
      if (mode === '4WD_LOW') {
        el.className = 'hud-badge mode-crawl';
      } else if (mode === '4WD') {
        el.className = 'hud-badge mode-4wd';
      } else {
        el.className = 'hud-badge mode-2wd';
      }
    }
  }

  updateCargoUI(remaining, total) {
    const countEl = document.getElementById('pot-count-text');
    if (countEl) countEl.innerText = `${remaining} / ${total} Pots Safe`;

    // Update visual pot icons
    for (let i = 1; i <= 5; i++) {
      const icon = document.getElementById(`pot-icon-${i}`);
      if (icon) {
        if (i <= remaining) {
          icon.className = 'pot-icon intact';
        } else {
          icon.className = 'pot-icon broken';
        }
      }
    }
  }

  recoverVehicle() {
    // Reset vehicle to current safe checkpoint
    this.thar.resetToRoad(this.lastCheckpointZ);
  }

  triggerGameOver() {
    this.state = 'GAMEOVER';
    const modal = document.getElementById('gameover-modal');
    if (modal) modal.style.display = 'flex';
  }

  triggerVictory() {
    this.state = 'VICTORY';
    window.soundManager.playTempleBell();
    window.soundManager.playFluteTune();

    const saved = this.cargo.getRemainingPots();
    const modal = document.getElementById('victory-modal');
    const scoreText = document.getElementById('victory-score-text');
    if (scoreText) {
      scoreText.innerHTML = `You safely delivered <b>${saved} of 5</b> Sacred Makhan Pots to the Vrindavan Mandir!`;
    }
    if (modal) modal.style.display = 'flex';
  }

  restartGame() {
    document.getElementById('gameover-modal').style.display = 'none';
    document.getElementById('victory-modal').style.display = 'none';

    this.cargo.reset();
    this.updateCargoUI(5, 5);
    this.lastCheckpointZ = 45;
    this.currentVillageIndex = 0;
    this.thar.resetToRoad(45);
    this.state = 'DRIVING';
  }

  checkVillageCheckpoints() {
    const playerZ = this.thar.position.z;

    this.villages.villages.forEach((v, idx) => {
      if (playerZ >= v.startZ && playerZ < v.endZ && this.currentVillageIndex !== idx) {
        this.currentVillageIndex = idx;
        this.lastCheckpointZ = v.centerZ;

        // Play temple bell and show celebratory banner
        window.soundManager.playTempleBell();

        const banner = document.getElementById('village-banner');
        if (banner) {
          banner.innerHTML = `<h2>🚩 ENTERING ${v.name} 🚩</h2><p>${v.title}</p>`;
          banner.classList.add('show');
          setTimeout(() => banner.classList.remove('show'), 3500);
        }
      }
    });

    // Check Victory Finish Line at Vrindavan
    if (playerZ >= this.villages.finishLineZ && this.state === 'DRIVING') {
      this.triggerVictory();
    }
  }

  updateControls() {
    if (this.state !== 'DRIVING') {
      this.thar.controls.throttle = 0;
      this.thar.controls.steer = 0;
      this.thar.controls.brake = false;
      return;
    }

    let throttle = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) throttle += 1.0;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) throttle -= 0.8;

    let steer = 0;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) steer += 1.0;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) steer -= 1.0;

    const brake = !!(this.keys['Space']);

    this.thar.controls.throttle = throttle;
    this.thar.controls.steer = steer;
    this.thar.controls.brake = brake;
  }

  updateCamera(delta) {
    const carPos = this.thar.position;
    const carRotY = this.thar.rotation.y;

    if (this.state === 'PROLOGUE') {
      // Cinematic slow sweep looking at Krishna and his Haveli
      const time = this.clock.getElapsedTime();
      this.camera.position.x = this.villages.krishnaHomePos.x - 8 + Math.sin(time * 0.3) * 3;
      this.camera.position.z = this.villages.krishnaHomePos.z + 18 + Math.cos(time * 0.3) * 2;
      this.camera.lookAt(this.krishna.group.position.x, this.krishna.group.position.y + 1.8, this.krishna.group.position.z);
    } else if (this.state === 'WALKING') {
      // Follow Krishna smoothly as he walks to the Thar
      const kp = this.krishna.group.position;
      const targetCamPos = kp.clone().add(new THREE.Vector3(-4.5, 2.8, -4.5));
      this.camera.position.lerp(targetCamPos, delta * 4.0);
      this.camera.lookAt(kp.x, kp.y + 1.6, kp.z);
    } else {
      // Driving Cameras
      if (this.cameraMode === 0) {
        // Mode 0: Third-Person Dynamic Chase Cam
        const offset = new THREE.Vector3(0, 3.2, -7.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), carRotY);
        const targetCamPos = carPos.clone().add(offset);
        this.camera.position.lerp(targetCamPos, delta * 8.0);

        const lookTarget = carPos.clone().add(new THREE.Vector3(0, 1.4, 3.0).applyAxisAngle(new THREE.Vector3(0, 1, 0), carRotY));
        this.camera.lookAt(lookTarget);
      } else if (this.cameraMode === 1) {
        // Mode 1: Bonnet / Hood View (Immersive Mud Splatter Perspective)
        const hoodOffset = new THREE.Vector3(0, 1.6, 1.2).applyAxisAngle(new THREE.Vector3(0, 1, 0), carRotY);
        this.camera.position.copy(carPos).add(hoodOffset);

        const lookTarget = carPos.clone().add(new THREE.Vector3(0, 1.2, 12.0).applyAxisAngle(new THREE.Vector3(0, 1, 0), carRotY));
        this.camera.lookAt(lookTarget);
      } else if (this.cameraMode === 2) {
        // Mode 2: Cinematic Drone Cam
        const time = this.clock.getElapsedTime();
        const droneOffset = new THREE.Vector3(Math.sin(time * 0.5) * 12, 6.5, Math.cos(time * 0.5) * 12);
        this.camera.position.lerp(carPos.clone().add(droneOffset), delta * 4.0);
        this.camera.lookAt(carPos.x, carPos.y + 1.2, carPos.z);
      } else {
        // Mode 3: Top-Down Helicopter Cam
        const topCamPos = carPos.clone().add(new THREE.Vector3(0, 28, 0));
        this.camera.position.lerp(topCamPos, delta * 6.0);
        this.camera.lookAt(carPos);
      }
    }
  }

  updateHUD() {
    // Speedometer
    const speedKmh = Math.round(Math.abs(this.thar.speed) * 3.6);
    const speedEl = document.getElementById('speed-value');
    if (speedEl) speedEl.innerText = speedKmh;

    // Mud Depth Warning
    const mudEl = document.getElementById('mud-depth-indicator');
    if (mudEl) {
      if (this.thar.inWater) {
        mudEl.innerHTML = `🌊 <b>DEEP WATER PIT!</b> (Depth: ${(this.thar.currentMudDepth).toFixed(1)}m)`;
        mudEl.className = 'hud-badge mud-warning water-alert';
      } else if (this.thar.currentMudDepth > 0.1) {
        mudEl.innerHTML = `⚠️ <b>HEAVY MUD SLUDGE</b> (Use 4WD-LOW)`;
        mudEl.className = 'hud-badge mud-warning mud-alert';
      } else {
        mudEl.innerHTML = `🌱 <b>FIRM DIRT TRAIL</b>`;
        mudEl.className = 'hud-badge mud-ok';
      }
    }

    // Distance progress
    const progressPct = Math.min(100, Math.max(0, Math.round((this.thar.position.z / 1700) * 100)));
    const progressEl = document.getElementById('progress-bar-fill');
    if (progressEl) progressEl.style.width = `${progressPct}%`;
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const totalTime = this.clock.getElapsedTime();

    // 1. Process Player Inputs
    this.updateControls();

    // 2. Physics & Logic Updates
    this.thar.updatePhysics(delta);
    this.krishna.update(delta);
    this.cargo.update(delta);
    this.terrain.update(totalTime);
    this.villages.update(totalTime);
    this.checkVillageCheckpoints();

    // 3. Camera & Lighting Tracking
    this.updateCamera(delta);
    this.sun.position.set(this.thar.position.x + 80, 120, this.thar.position.z + 60);
    this.sun.target.position.copy(this.thar.position);
    this.sun.target.updateMatrixWorld();

    // 4. Update HUD & Minimap
    this.updateHUD();
    this.minimap.update();

    // 5. Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameEngine();
});
