/* ================================================================
   hogwarts-3d.js — Cinematic 3D castle background for the hero
   ================================================================
   This file draws a live, moving Hogwarts-style castle scene onto
   the <canvas id="hogwarts3d"> sitting inside <section id="home">
   in index.html. It is completely separate from script.js on
   purpose: if anything in here fails (old browser, WebGL turned
   off, whatever), the whole file just quietly gives up and the
   original flat video background (still untouched in the HTML)
   keeps showing instead. Nothing else on the page is affected.

   Everything is built with basic shapes (boxes, cylinders, cones,
   an irregular rock) rather than an imported 3D model file, so
   there's nothing extra to download and the whole scene is a
   generic, original fantasy castle — not a copy of any specific
   copyrighted building.

   TABLE OF CONTENTS (search these numbers to jump around):
   1. Setup guard — bail out early if WebGL isn't usable
   2. Scene / camera / renderer
   3. Lighting — moonlight, ambient fill
   4. The moon + its glow halo
   5. Star field (twinkling, via a small custom shader)
   6. The cliff the castle stands on
   7. The castle itself — keep, towers, roofs, crenellations
   8. Glowing, flickering windows
   9. The lake (gently rippling water)
   10. Drifting ground mist
   11. Rising magic sparkle particles
   12. Camera: slow orbit + scroll-controlled zoom
   13. The render loop
   14. Resize handling
   15. Boot everything
   ================================================================ */

// Three.js is loaded straight from a CDN as an ES module — no build
// step, no bundler, just a normal <script type="module"> in the
// HTML pointing at this file. r0.160 is a recent, stable release.
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";


/* ================================================================
   1. SETUP GUARD
   ----------------------------------------------------------------
   Everything below runs inside one big function so a single early
   `return` can cancel the whole feature cleanly if something isn't
   supported, without leaving half-built objects lying around.
================================================================ */
function initHogwartsScene() {
  const canvas = document.getElementById('hogwarts3d');
  const heroSection = document.getElementById('home');

  // If the canvas or hero section is missing, there's nothing to
  // attach a scene to — stop here instead of throwing errors.
  if (!canvas || !heroSection) return;

  // A cheap manual check for WebGL support, done BEFORE we spend any
  // time building geometry that we'd just have to throw away.
  function browserSupportsWebGL() {
    try {
      const testCanvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'))
      );
    } catch (err) {
      return false;
    }
  }

  if (!browserSupportsWebGL()) return; // video fallback stays visible

  // Two settings that change how much work the scene does:
  //   prefersReducedMotion → respects the OS-level "reduce motion"
  //     accessibility setting. We keep small idle shimmer (stars,
  //     water) but turn off the big moving pieces (camera orbit,
  //     drifting particles/mist).
  //   isSmallScreen → phones get fewer stars/particles, since they
  //     also tend to have weaker GPUs and smaller batteries.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isSmallScreen = window.innerWidth < 760;


  /* ================================================================
     2. SCENE / CAMERA / RENDERER
  ================================================================ */
  const scene = new THREE.Scene();

  // A deep midnight-blue is used for BOTH the empty background and
  // the fog colour. Matching the two means distant shapes fade into
  // the sky smoothly instead of being cut off by a visible fog wall.
  const NIGHT_SKY_COLOR = 0x05070d;
  scene.background = new THREE.Color(NIGHT_SKY_COLOR);
  scene.fog = new THREE.FogExp2(NIGHT_SKY_COLOR, 0.016);

  const camera = new THREE.PerspectiveCamera(
    42,                                                          // field of view, in degrees
    heroSection.clientWidth / heroSection.clientHeight,         // aspect ratio
    0.1,                                                         // near clip plane
    400                                                          // far clip plane
  );

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
  } catch (err) {
    return; // renderer creation failed — leave the video fallback alone
  }

  // Cap the pixel ratio at 2 even on very high-DPI screens — beyond
  // that the visual gain is tiny but the GPU cost keeps climbing.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(heroSection.clientWidth, heroSection.clientHeight, false);

  // Only NOW that we know the canvas is actually rendering do we tell
  // the CSS to retire the flat video/SVG layers in favour of this.
  document.body.classList.add('has-3d-hero');


  /* ================================================================
     3. LIGHTING
     ----------------------------------------------------------------
     A night scene lit almost entirely by "moonlight": one directional
     light standing in for the moon, a very dim blue ambient light so
     shadowed faces aren't pure black, and a hemisphere light that
     fakes a faint warm bounce up off the lake.
  ================================================================ */
  const ambientLight = new THREE.AmbientLight(0x3a4a72, 0.5);
  scene.add(ambientLight);

  const MOON_POSITION = new THREE.Vector3(-30, 32, -60);

  const moonLight = new THREE.DirectionalLight(0xd7deff, 1.1);
  moonLight.position.copy(MOON_POSITION);
  scene.add(moonLight);

  const bounceLight = new THREE.HemisphereLight(0x1c2740, 0x0a0703, 0.35);
  scene.add(bounceLight);


  /* ================================================================
     4. THE MOON + ITS GLOW HALO
     ----------------------------------------------------------------
     Two pieces: a plain unlit sphere for the moon's disc, and a
     transparent "sprite" (a flat image that always faces the camera)
     behind it carrying a soft radial-gradient glow, so the moon reads
     as luminous instead of a flat grey circle.
  ================================================================ */

  // Small reusable helper: paints a soft radial gradient onto an
  // offscreen 2D canvas and hands it back as a texture Three.js can
  // use. This is how we get a glow/halo look without needing to
  // download an actual image file.
  function makeRadialGlowTexture(innerColor, outerColor) {
    const size = 128;
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = size;
    glowCanvas.height = size;

    const ctx = glowCanvas.getContext('2d');
    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, innerColor);
    gradient.addColorStop(0.4, outerColor);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.CanvasTexture(glowCanvas);
    texture.needsUpdate = true;
    return texture;
  }

  const moonMesh = new THREE.Mesh(
    new THREE.SphereGeometry(3.6, 24, 24),
    new THREE.MeshBasicMaterial({ color: 0xf6ecd1 }) // unlit — the moon lights itself
  );
  moonMesh.position.copy(MOON_POSITION);
  scene.add(moonMesh);

  const moonHalo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: makeRadialGlowTexture('rgba(246,236,209,0.85)', 'rgba(214,180,90,0.22)'),
      transparent: true,
      depthWrite: false,             // don't let the halo hide stars behind it
      blending: THREE.AdditiveBlending,
    })
  );
  moonHalo.scale.set(40, 40, 1);
  moonHalo.position.copy(MOON_POSITION);
  scene.add(moonHalo);


  /* ================================================================
     5. STAR FIELD
     ----------------------------------------------------------------
     A cloud of points scattered across a big dome of sky. Instead of
     animating hundreds of individual objects in JavaScript, we hand
     each point a random "phase" value and let a tiny custom shader
     work out its twinkle brightness on the GPU every frame — much
     cheaper than updating them one by one on the CPU.
  ================================================================ */
  function buildStarField(starCount) {
    const positions = new Float32Array(starCount * 3);
    const phases = new Float32Array(starCount);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      // Spherical-ish scatter, biased toward the upper half of the
      // sky (phi capped below 90°) so no stars end up underground.
      const radius = 120 + Math.random() * 90;
      const theta = Math.random() * Math.PI * 2;      // angle around the horizon
      const phi = Math.random() * Math.PI * 0.55;      // angle down from straight up

      positions[i * 3 + 0] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi) * 0.6 + 22;
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      phases[i] = Math.random() * Math.PI * 2;
      sizes[i] = 1 + Math.random() * 1.8;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      vertexShader: `
        attribute float aPhase;
        attribute float aSize;
        uniform float uTime;
        varying float vTwinkle;
        void main() {
          // Brightness oscillates between ~0 and 1, offset by each
          // star's own random phase so they don't blink in unison.
          vTwinkle = 0.5 + 0.5 * sin(uTime * 1.3 + aPhase);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          // Points shrink with distance, same as everything else in
          // a perspective camera — this keeps far stars looking small.
          gl_PointSize = aSize * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vTwinkle;
        void main() {
          // gl_PointCoord is the position within the little square
          // each point is drawn as (0,0 to 1,1). Measuring distance
          // from its centre lets us fade it into a soft circle
          // instead of a hard-edged square dot.
          float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
          float alpha = smoothstep(0.5, 0.0, distanceFromCenter) * vTwinkle;
          gl_FragColor = vec4(1.0, 0.98, 0.9, alpha);
        }
      `,
    });

    return new THREE.Points(geometry, material);
  }

  const starField = buildStarField(isSmallScreen ? 260 : 480);
  scene.add(starField);


  /* ================================================================
     6. THE CLIFF
     ----------------------------------------------------------------
     A big irregular rock the castle sits on top of. We start from a
     smooth icosahedron (a ball made of triangles) and then nudge
     every vertex outward or inward by a small sine-based "bump"
     amount, which turns a perfectly round ball into something that
     reads as jagged rock. Squashing it vertically afterwards turns
     the ball shape into a cliff/mound rather than a boulder.
  ================================================================ */
  function buildCliff() {
    const geometry = new THREE.IcosahedronGeometry(14, 2);
    const positionAttribute = geometry.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i);

      // A wobble built from two overlapping sine waves reads as
      // "irregular rock face" without needing a real noise library.
      const bumpAmount = (Math.sin(vertex.x * 0.6) + Math.cos(vertex.z * 0.5)) * 0.8;
      vertex.multiplyScalar(1 + bumpAmount * 0.05);

      // Flatten the underside so the rock has a believable base
      // instead of curving all the way round like a full sphere.
      if (vertex.y < -2) {
        vertex.y = -2 - Math.random() * 0.4;
      }

      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    geometry.computeVertexNormals(); // recalculate lighting normals after moving vertices
    geometry.scale(1, 0.6, 1);        // squash the ball into a cliff silhouette

    const material = new THREE.MeshStandardMaterial({
      color: 0x2b241c,
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true, // gives the rock hard, faceted edges instead of a smooth blend
    });

    return new THREE.Mesh(geometry, material);
  }

  const cliffMesh = buildCliff();
  cliffMesh.position.set(0, 1.4, -2);
  scene.add(cliffMesh);


  /* ================================================================
     7. THE CASTLE
     ----------------------------------------------------------------
     Built entirely from primitive shapes: a big box for the central
     keep, cylinders topped with cones for the towers, and small boxes
     lined up along the roofline for crenellations (the notched top
     edge of a castle wall). Fixed coordinates (rather than random
     ones) keep the silhouette the same every time the page loads.
  ================================================================ */

  // Collected here so the window-flicker animation loop (Section 8)
  // can find every window mesh without walking the whole scene graph.
  const glowingWindows = [];

  function addWindowsToTower(towerGroup, towerRadius, towerHeight, windowCount) {
    const windowGeometry = new THREE.PlaneGeometry(0.34, 0.55);

    for (let i = 0; i < windowCount; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: 0xf6dc83,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
      });

      const windowMesh = new THREE.Mesh(windowGeometry, material);

      // Scatter windows around the tower's circumference and up its
      // height, just inset from the surface so they sit flush.
      const angle = (i / windowCount) * Math.PI * 2 + Math.random() * 0.6;
      const heightOnTower = 1.4 + Math.random() * (towerHeight - 2.6);

      windowMesh.position.set(
        Math.cos(angle) * (towerRadius + 0.02),
        heightOnTower,
        Math.sin(angle) * (towerRadius + 0.02)
      );
      windowMesh.rotation.y = -angle + Math.PI / 2; // face outward from the tower's centre

      // Each window flickers on its own random cycle — stored on the
      // object itself so Section 8's animation loop can read it back.
      windowMesh.userData.flickerPhase = Math.random() * Math.PI * 2;
      windowMesh.userData.flickerSpeed = 0.5 + Math.random() * 0.7;

      towerGroup.add(windowMesh);
      glowingWindows.push(windowMesh);
    }
  }

  function buildTower(radius, height, roofHeight, stoneMaterial, roofMaterial, windowCount) {
    const towerGroup = new THREE.Group();

    const bodyMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius * 1.08, height, 10),
      stoneMaterial
    );
    bodyMesh.position.y = height / 2;
    towerGroup.add(bodyMesh);

    const roofMesh = new THREE.Mesh(
      new THREE.ConeGeometry(radius * 1.2, roofHeight, 10),
      roofMaterial
    );
    roofMesh.position.y = height + roofHeight / 2;
    towerGroup.add(roofMesh);

    if (windowCount > 0) {
      addWindowsToTower(towerGroup, radius, height, windowCount);
    }

    return towerGroup;
  }

  // A row of small boxes along a wall's top edge, drawn as one
  // InstancedMesh (one draw call for the whole row) rather than as
  // separate meshes — cheap even with many merlons.
  function addCrenellationRow(parentGroup, startX, endX, y, z, material) {
    const merlonCount = 9;
    const merlonGeometry = new THREE.BoxGeometry(0.55, 0.55, 0.55);
    const instancedMerlons = new THREE.InstancedMesh(merlonGeometry, material, merlonCount);
    const dummy = new THREE.Object3D();

    for (let i = 0; i < merlonCount; i++) {
      const x = startX + ((endX - startX) / (merlonCount - 1)) * i;
      dummy.position.set(x, y, z);
      dummy.updateMatrix();
      instancedMerlons.setMatrixAt(i, dummy.matrix);
    }

    parentGroup.add(instancedMerlons);
  }

  function buildCastle() {
    const castleGroup = new THREE.Group();

    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a4236,
      roughness: 0.88,
      metalness: 0.04,
      flatShading: true,
    });
    const roofMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e1a2c,
      roughness: 0.65,
      metalness: 0.12,
      flatShading: true,
    });

    // ---- Central keep: the big rectangular hall the towers gather around ----
    const keepMesh = new THREE.Mesh(new THREE.BoxGeometry(13, 7, 9), stoneMaterial);
    keepMesh.position.set(0, 3.5, -1);
    castleGroup.add(keepMesh);
    addCrenellationRow(castleGroup, -6, 6, 7.3, -5.4, stoneMaterial);

    // ---- Towers: [x offset, z offset, radius, wall height, roof height, window count] ----
    // Fixed values (not random) so the skyline composes the same
    // way — a tall central spire flanked by shorter towers — on
    // every single page load.
    const TOWER_LAYOUT = [
      { x: -6.5, z: -2.5, radius: 1.6, height: 9.5, roof: 4.4, windows: 4 },
      { x: -1.5, z: -5.5, radius: 2.5, height: 14,  roof: 6.5, windows: 5 }, // tallest, central spire
      { x: 3.5,  z: -3.5, radius: 1.9, height: 10.5, roof: 4.8, windows: 4 },
      { x: 7.5,  z: -1,   radius: 1.3, height: 7.5,  roof: 3.4, windows: 3 },
      { x: -9,   z: 1.5,  radius: 1.1, height: 6.5,  roof: 3.0, windows: 2 },
      { x: 5.5,  z: 3,    radius: 1.5, height: 8.5,  roof: 3.8, windows: 3 },
    ];

    TOWER_LAYOUT.forEach((towerSpec) => {
      const towerGroup = buildTower(
        towerSpec.radius,
        towerSpec.height,
        towerSpec.roof,
        stoneMaterial,
        roofMaterial,
        towerSpec.windows
      );
      towerGroup.position.set(towerSpec.x, 0, towerSpec.z);
      castleGroup.add(towerGroup);
    });

    return castleGroup;
  }

  const castleGroup = buildCastle();
  castleGroup.position.set(0, 8.6, -2);
  scene.add(castleGroup);


  /* ================================================================
     9. THE LAKE
     ----------------------------------------------------------------
     A large flat plane with a custom shader: the vertex shader pushes
     each point up and down slightly using two overlapping sine waves
     (a cheap stand-in for a real water simulation), and the fragment
     shader shades wave crests a lighter blue and adds a soft pale
     streak down the middle to suggest moonlight reflecting off it.
  ================================================================ */
  function buildLake() {
    const geometry = new THREE.PlaneGeometry(220, 220, 60, 60);
    geometry.rotateX(-Math.PI / 2); // lay it flat, facing upward

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uDeepColor: { value: new THREE.Color(0x03060d) },
        uShallowColor: { value: new THREE.Color(0x1c3550) },
        uMoonColor: { value: new THREE.Color(0xf6ecd1) },
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying float vWaveHeight;
        void main() {
          vUv = uv;
          vec3 displacedPosition = position;
          float wave = sin(displacedPosition.x * 0.18 + uTime * 0.6) * 0.16
                     + sin(displacedPosition.z * 0.24 - uTime * 0.4) * 0.12;
          displacedPosition.y += wave;
          vWaveHeight = wave;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uDeepColor;
        uniform vec3 uShallowColor;
        uniform vec3 uMoonColor;
        varying vec2 vUv;
        varying float vWaveHeight;
        void main() {
          // Wave crests (positive vWaveHeight) read slightly lighter,
          // as if catching a little more ambient light than troughs.
          vec3 waterColor = mix(uDeepColor, uShallowColor, smoothstep(-0.16, 0.16, vWaveHeight));
          // A soft pale band running down the centre of the lake,
          // like a long moonlight reflection on still water.
          float reflectionStreak = smoothstep(0.6, 0.0, abs(vUv.x - 0.5)) * 0.3;
          waterColor += uMoonColor * reflectionStreak * 0.4;
          gl_FragColor = vec4(waterColor, 1.0);
        }
      `,
    });

    return new THREE.Mesh(geometry, material);
  }

  const lakeMesh = buildLake();
  lakeMesh.position.set(0, -1.8, 8);
  scene.add(lakeMesh);


  /* ================================================================
     10. DRIFTING GROUND MIST
     ----------------------------------------------------------------
     A handful of soft, semi-transparent glow sprites hovering near
     the base of the cliff, each slowly drifting sideways and wrapping
     back around once it drifts too far — a cheap "rolling fog" effect
     that doesn't need any particle simulation.
  ================================================================ */
  function buildGroundMist() {
    const mistGroup = new THREE.Group();
    const mistTexture = makeRadialGlowTexture('rgba(220,225,235,0.4)', 'rgba(220,225,235,0.06)');

    const mistPatchPositions = [
      { x: -11, y: -0.4, z: 5 },
      { x: 6,   y: -0.2, z: 9 },
      { x: -3,  y: -0.6, z: 12 },
      { x: 11,  y: -0.3, z: 4 },
    ];

    mistPatchPositions.forEach((patchPosition) => {
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
        map: mistTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0.45,
      }));
      sprite.position.set(patchPosition.x, patchPosition.y, patchPosition.z);
      sprite.scale.set(24, 6.5, 1);
      // Stored on the sprite itself so the animation loop can read
      // each patch's own drift speed back out.
      sprite.userData.driftSpeed = 0.15 + Math.random() * 0.15;
      mistGroup.add(sprite);
    });

    return mistGroup;
  }

  const groundMist = buildGroundMist();
  scene.add(groundMist);

  function animateGroundMist(delta) {
    groundMist.children.forEach((sprite) => {
      sprite.position.x += sprite.userData.driftSpeed * delta;
      if (sprite.position.x > 22) sprite.position.x = -22; // wrap back around
    });
  }


  /* ================================================================
     11. RISING MAGIC SPARKLE PARTICLES
     ----------------------------------------------------------------
     A small cloud of golden points that slowly rise past the castle
     and loop back to the bottom once they drift too high — the 3D
     cousin of the gold "magic dust" already drifting over the flat
     part of the page (see script.js Section 8).
  ================================================================ */
  function buildMagicParticles(particleCount) {
    const positions = new Float32Array(particleCount * 3);
    const risingSpeeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 42;
      positions[i * 3 + 1] = Math.random() * 15;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 32 - 4;
      risingSpeeds[i] = 0.4 + Math.random() * 0.6;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xf0cf6e,
      size: 0.18,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending, // makes overlapping sparkles glow brighter, not darker
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    points.userData.risingSpeeds = risingSpeeds;
    return points;
  }

  const magicParticles = buildMagicParticles(isSmallScreen ? 60 : 130);
  scene.add(magicParticles);

  function animateMagicParticles(delta) {
    const positionAttribute = magicParticles.geometry.attributes.position;
    const risingSpeeds = magicParticles.userData.risingSpeeds;

    for (let i = 0; i < positionAttribute.count; i++) {
      let newY = positionAttribute.getY(i) + risingSpeeds[i] * delta;
      if (newY > 17) newY = 0; // loop back down once it drifts too high
      positionAttribute.setY(i, newY);
    }
    positionAttribute.needsUpdate = true; // tell Three.js the buffer changed
  }


  /* ================================================================
     12. CAMERA: SLOW ORBIT + SCROLL-CONTROLLED ZOOM
     ----------------------------------------------------------------
     The camera travels in a slow circle around the castle (a "360°
     orbit") purely as a function of time, and separately eases its
     distance in toward the castle as the visitor scrolls down past
     the hero section — two independent movements combined every
     frame into one camera position.
  ================================================================ */
  const CASTLE_LOOK_TARGET = new THREE.Vector3(0, 8, -1);

  const ORBIT_RADIUS_FAR = 46;   // camera distance at the top of the page
  const ORBIT_RADIUS_NEAR = 25;  // camera distance once scrolled past the hero
  const ORBIT_HEIGHT_FAR = 17;
  const ORBIT_HEIGHT_NEAR = 10;

  // Radians per second — a full 360° revolution takes roughly
  // (2 * PI) / 0.026 ≈ 240 seconds, i.e. a slow, cinematic drift
  // rather than a spinning-postcard effect. Reduced-motion visitors
  // get a still camera instead (the scroll zoom below still works,
  // since that's a direct response to something they did).
  const ORBIT_ANGULAR_SPEED = prefersReducedMotion ? 0 : 0.026;

  let orbitAngle = 0.35; // starting angle, so the first frame isn't dead-on symmetrical
  let currentOrbitRadius = ORBIT_RADIUS_FAR;
  let currentOrbitHeight = ORBIT_HEIGHT_FAR;

  function getHeroScrollProgress() {
    const heroHeight = heroSection.offsetHeight || window.innerHeight;
    const rawProgress = window.scrollY / (heroHeight * 0.85);
    return Math.min(Math.max(rawProgress, 0), 1); // clamp to the 0–1 range
  }

  function updateCamera(delta) {
    orbitAngle += ORBIT_ANGULAR_SPEED * delta;

    const scrollProgress = getHeroScrollProgress();
    const targetRadius = THREE.MathUtils.lerp(ORBIT_RADIUS_FAR, ORBIT_RADIUS_NEAR, scrollProgress);
    const targetHeight = THREE.MathUtils.lerp(ORBIT_HEIGHT_FAR, ORBIT_HEIGHT_NEAR, scrollProgress);

    // Ease toward the scroll-driven target instead of snapping to it
    // instantly — this is what makes the zoom feel like a smooth
    // camera dolly rather than a jump cut on every scroll event.
    currentOrbitRadius += (targetRadius - currentOrbitRadius) * 0.045;
    currentOrbitHeight += (targetHeight - currentOrbitHeight) * 0.045;

    camera.position.x = CASTLE_LOOK_TARGET.x + Math.sin(orbitAngle) * currentOrbitRadius;
    camera.position.z = CASTLE_LOOK_TARGET.z + Math.cos(orbitAngle) * currentOrbitRadius;
    camera.position.y = currentOrbitHeight;
    camera.lookAt(CASTLE_LOOK_TARGET);
  }


  /* ================================================================
     8b. WINDOW FLICKER ANIMATION
     ----------------------------------------------------------------
     (Numbered 8b because the window MESHES are built back in Section
     7/8 alongside the towers — this is just the per-frame update.)
     Each window's opacity rides its own sine wave, offset by the
     random phase it was given when created, so windows don't all
     brighten and dim in unison.
  ================================================================ */
  function animateWindowFlicker(elapsedTime) {
    glowingWindows.forEach((windowMesh) => {
      const { flickerPhase, flickerSpeed } = windowMesh.userData;
      windowMesh.material.opacity = 0.55 + 0.4 * Math.sin(elapsedTime * flickerSpeed + flickerPhase);
    });
  }

  // Reduced-motion visitors get steadily-lit windows instead of a
  // flickering animation loop.
  if (prefersReducedMotion) {
    glowingWindows.forEach((windowMesh) => { windowMesh.material.opacity = 0.82; });
  }


  /* ================================================================
     13. THE RENDER LOOP
     ----------------------------------------------------------------
     Runs once per frame via requestAnimationFrame. An
     IntersectionObserver tracks whether the hero section is actually
     on screen — once a visitor scrolls far enough past it, the loop
     stops doing any real work (still gets called, just returns
     immediately), so the GPU isn't rendering an invisible scene.
  ================================================================ */
  const clock = new THREE.Clock();
  let isHeroSectionVisible = true;

  const heroVisibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { isHeroSectionVisible = entry.isIntersecting; });
  }, { threshold: 0 });
  heroVisibilityObserver.observe(heroSection);

  function animate() {
    requestAnimationFrame(animate);
    if (!isHeroSectionVisible) return; // nothing on screen to update — skip the frame's work

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    updateCamera(delta);

    // The subtle ambient shimmer (starlight, water) keeps running
    // even under reduced motion since it's very gentle; the larger,
    // more noticeable movements (rising particles, drifting mist,
    // flicker) are skipped so the scene reads as calmer overall.
    starField.material.uniforms.uTime.value = elapsedTime;
    lakeMesh.material.uniforms.uTime.value = elapsedTime;

    if (!prefersReducedMotion) {
      animateMagicParticles(delta);
      animateGroundMist(delta);
      animateWindowFlicker(elapsedTime);
    }

    renderer.render(scene, camera);
  }

  animate();


  /* ================================================================
     14. RESIZE HANDLING
     ----------------------------------------------------------------
     Keeps the canvas, camera aspect ratio, and renderer resolution in
     sync with the hero section's actual size — e.g. when the browser
     window is resized or a phone is rotated.
  ================================================================ */
  function handleResize() {
    const width = heroSection.clientWidth;
    const height = heroSection.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  window.addEventListener('resize', handleResize);
}


/* ================================================================
   15. BOOT
   ----------------------------------------------------------------
   Because this script is loaded with type="module", it's already
   deferred until after the HTML has been parsed — so #hogwarts3d
   is guaranteed to exist by the time this line runs.
================================================================ */
initHogwartsScene();