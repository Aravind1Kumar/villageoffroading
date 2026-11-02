# Krishna: The Thar 4x4 Village Mud Challenge 🦚🚙🏺
*(कृष्ण: थार 4x4 ऑफ-रोड ग्राम यात्रा)*

An interactive 3D Indian village off-roading game featuring **Lord Krishna** driving a rugged **Mahindra Thar 4x4** across four rustic Indian villages (**Gokul**, **Barsana**, **Nandgaon**, and **Vrindavan**). Navigate deep mud ruts, slippery clay mounds, and water-filled craters while protecting fragile cargo: **5 Sacred Earthen Butter Pots (Makhan Matkas)**!

![Krishna Thar 4x4 Off-Road](https://img.shields.io/badge/Three.js-3D%20Engine-orange?logo=three.js)
![Web Audio API](https://img.shields.io/badge/Web%20Audio-Procedural%20SFX-blue)
![4x4 Off-Road](https://img.shields.io/badge/Mahindra%20Thar-4WD%20Low%20Crawl-red)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌟 Game Highlights

### 1. 🦚 Prologue & Lord Krishna
- The story begins at Krishna's ancestral courtyard haveli in **Gokul**.
- Lord Krishna is modeled in traditional attire:
  - **Shyam-varna** (radiant sky-blue complexion)
  - **Pitambar** (sacred yellow silk dhoti with golden borders)
  - **Mukut** with an iridescent **Mor Pankh** (peacock feather)
  - Golden **Bansuri** (flute) tucked at waist
- Krishna walks down the haveli veranda stairs to his **Mahindra Thar 4x4**, enters the driver's seat, and cranks the engine to divine Raag flute melodies!

### 2. 🚙 Mahindra Thar 4x4 Simulation
- **Iconic 4x4 Styling**: Signature 7-slot front grille, round projector LED headlamps with working beams, knobby off-road mud terrain tires, front winch bumper, flared fenders, and rear spare wheel.
- **Independent Suspension**: Dynamic 4-wheel spring-damper suspension with wheel articulation across uneven rocks, ruts, and mud banks.
- **3 Transmission Modes (Key `G` / Touch badge)**:
  - **`2WD HIGH`**: High speed for open dirt tracks.
  - **`4WD HIGH`**: Balanced 4-wheel drive across loose dirt.
  - **`4WD LOW (CRAWL MODE)`**: Heavy low-range gear with **maximum climbing torque and mud traction** with high-RPM engine roar to power out of water pits!
- **Procedural Web Audio SFX**: Real-time synthesized diesel engine rumble, mud churn, massive water splash on pit impact, Indian 3-tone musical horn (`H` key), and temple bells.

### 3. 🏺 The Core Challenge — "Don't Drop the Product"
- Loaded in the open rear bed are **5 Sacred Earthen Makhan Pots (Golden Butter Matkas)** tied with jute ropes.
- The pots are physically simulated with spring wobbles that respond to centrifugal cornering forces, jumps, hard landings, and vehicle rollover tilt (>35°).
- **Warning**: Hitting deep water pits at high speed or rolling the chassis will snap the tie-downs, breaking the pots with ceramic crack sounds and flying butter explosions!
- Deliver **at least 1 intact pot** to Vrindavan to win!

### 4. 🚩 The 4 Indian Villages
1. **Gokul (गोकुल)**: Starting courtyard with terracotta havelis, grazing cows, tulsi planters, and neem trees.
2. **Barsana (बरसाना)**: Hill village with welcome arches, stone water well (*kuan*), and bullock carts.
3. **Nandgaon (नंदगांव)**: Marshy terrain with dense ancient banyan trees with hanging aerial roots, goshala cattle sheds, and muddy ruts.
4. **Vrindavan (वृन्दावन)**: Sacred destination with a towering Nagara-style Mandir, golden Kalash, fluttering saffron flags (*dhwaja*), and festive marigold victory arch!

---

## 🕹️ Controls

| Control | Keyboard | Touch / On-Screen |
| :--- | :--- | :--- |
| **Throttle / Accelerate** | `W` or `Up Arrow` | `⬆` (Gas) |
| **Brake / Reverse** | `S` or `Down Arrow` | `🛑` (Brake) |
| **Steer Left / Right** | `A` / `D` or `Left / Right` | `◀` / `▶` |
| **Handbrake** | `Spacebar` | - |
| **Toggle 4WD Mode** | `G` (`2WD` $\to$ `4WD` $\to$ `4WD LOW`) | `4x4` badge |
| **Desi Musical Horn** | `H` | `📯` |
| **Headlights** | `L` | - |
| **Change Camera** | `C` (Chase, Hood, Drone, Top-Down) | `🎥` |
| **Recover / Reset to Checkpoint** | `R` | `🔄` |
| **Mute / Unmute Audio** | `M` | `🔊` |

---

## 🚀 Running the Game

### Option 1: Direct File (Zero Setup)
Simply double-click `index.html` in any web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Safari).

### Option 2: Local HTTP Server
Run the built-in lightweight Node server:
```bash
node server.js
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Repository Structure

```
├── index.html            # Main game container, responsive HUD, modals
├── server.js             # Zero-dependency local static HTTP server
├── css/
│   └── style.css         # Indian village styling, speedometer, mud alerts, minimap
├── js/
│   ├── three.min.js      # Three.js 3D library (bundled offline)
│   ├── audio.js          # Web Audio API engine, horn, mud splashes, temple bells
│   ├── terrain.js        # Procedural countryside, winding dirt roads & 5 water pits
│   ├── villages.js       # Authentic village architecture, havelis, mandir, cows, trees
│   ├── krishna.js        # 3D Lord Krishna character, attire & walking cutscenes
│   ├── thar.js           # 3D Mahindra Thar 4x4 simulation with suspension & 4WD
│   ├── cargo.js          # Sacred Makhan pots wobble physics & shatter particles
│   ├── minimap.js        # 2D live radar GPS tracking villages, player & water hazards
│   └── game.js           # Master game loop, camera modes & checkpoint manager
└── README.md
```

---

## 📜 License
MIT License. Created with devotion and passion for Indian rural culture and 4x4 off-roading.
