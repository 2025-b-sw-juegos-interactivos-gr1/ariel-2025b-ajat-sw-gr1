let engine;
let scene;
let camera;
let jugador;
let cartas = [];
let buzones = [];
let cartasRecogidas = 0;
let cartaEnMano = null;

globalThis.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("renderCanvas");
  engine = new BABYLON.Engine(canvas, true);
  createScene(canvas).then((s) => {
    scene = s;
    document.getElementById("loadingIndicator").style.display = "none";
    console.log("🎮 Cartero del Vecindario - Babylon.js cargado correctamente");
    console.log(
      "🎯 Instrucciones: WASD para mover, Mouse para mirar, ESPACIO para recoger/entregar"
    );
    engine.runRenderLoop(() => scene.render());
    globalThis.addEventListener("resize", () => engine.resize());
  });
});

async function createScene(canvas) {
  const s = new BABYLON.Scene(engine);
  s.collisionsEnabled = true;
  s.gravity = new BABYLON.Vector3(0, -0.4, 0);
  s.clearColor = new BABYLON.Color3(0.05, 0.05, 0.15);

  crearCamara(s, canvas);
  crearLuces(s);
  crearSuelo(s);
  crearZonasPasto(s);
  await crearEntorno(s);
  crearOficinaYCarta(s);
  crearJugador(s);
  crearSkybox(s);
  configurarControles(s, canvas);
  configurarLogicaJuego(s);

  return s;
}

function crearCamara(s, canvas) {
  camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 1.7, 0), s);
  camera.speed = 0.18;
  camera.angularSensibility = 2000;
  camera.checkCollisions = true;
  camera.ellipsoid = new BABYLON.Vector3(0.5, 0.8, 0.5);
  camera.keysUp = [87];
  camera.keysDown = [83];
  camera.keysLeft = [65];
  camera.keysRight = [68];
  s.activeCamera = camera;
  camera.attachControl(canvas, true);

  s.onPointerDown = () => {
    if (document.pointerLockElement !== canvas) {
      try {
        canvas.requestPointerLock();
      } catch {}
    }
  };
}

function crearLuces(s) {
  const hemi = new BABYLON.HemisphericLight(
    "hemi",
    new BABYLON.Vector3(0, 1, 0),
    s
  );
  hemi.intensity = 0.2;
  hemi.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.5);

  const dir = new BABYLON.DirectionalLight(
    "dir",
    new BABYLON.Vector3(-0.6, -1, -0.3),
    s
  );
  dir.position = new BABYLON.Vector3(40, 40, 20);
  dir.intensity = 0.3;
  dir.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.7);

  const shadowGenerator = new BABYLON.ShadowGenerator(2048, dir);
  shadowGenerator.useExponentialShadowMap = true;
  shadowGenerator.darkness = 0.35;
  s.shadowGenerator = shadowGenerator;
}

function crearSuelo(s) {
  const ground = BABYLON.MeshBuilder.CreateGround(
    "ground",
    { width: 150, height: 150 },
    s
  );
  const mat = new BABYLON.StandardMaterial("groundMat", s);
  const tex = new BABYLON.Texture("assets/texturas/pasto.jpg", s);
  tex.uScale = 30;
  tex.vScale = 30;
  mat.diffuseTexture = tex;
  ground.material = mat;
  ground.checkCollisions = true;
  ground.receiveShadows = true;

  // Calles de asfalto horizontal
  const calleH1 = BABYLON.MeshBuilder.CreateGround(
    "calleH1",
    { width: 150, height: 12 },
    s
  );
  calleH1.position = new BABYLON.Vector3(0, 0.02, 0);
  const matCalleH1 = new BABYLON.StandardMaterial("matCalleH1", s);
  const texCalleH1 = new BABYLON.Texture(
    "assets/texturas/suelo_asfalto.jpg",
    s
  );
  texCalleH1.uScale = 15;
  texCalleH1.vScale = 1.5;
  matCalleH1.diffuseTexture = texCalleH1;
  calleH1.material = matCalleH1;
  calleH1.receiveShadows = true;

  const calleH2 = BABYLON.MeshBuilder.CreateGround(
    "calleH2",
    { width: 150, height: 12 },
    s
  );
  calleH2.position = new BABYLON.Vector3(0, 0.02, 35);
  calleH2.material = matCalleH1;
  calleH2.receiveShadows = true;

  const calleH3 = BABYLON.MeshBuilder.CreateGround(
    "calleH3",
    { width: 150, height: 12 },
    s
  );
  calleH3.position = new BABYLON.Vector3(0, 0.02, -35);
  calleH3.material = matCalleH1;
  calleH3.receiveShadows = true;

  // Calles de asfalto vertical
  const calleV1 = BABYLON.MeshBuilder.CreateGround(
    "calleV1",
    { width: 12, height: 150 },
    s
  );
  calleV1.position = new BABYLON.Vector3(35, 0.02, 0);
  const matCalleV1 = new BABYLON.StandardMaterial("matCalleV1", s);
  const texCalleV1 = new BABYLON.Texture(
    "assets/texturas/suelo_asfalto.jpg",
    s
  );
  texCalleV1.uScale = 1.5;
  texCalleV1.vScale = 15;
  matCalleV1.diffuseTexture = texCalleV1;
  calleV1.material = matCalleV1;
  calleV1.receiveShadows = true;

  const calleV2 = BABYLON.MeshBuilder.CreateGround(
    "calleV2",
    { width: 12, height: 150 },
    s
  );
  calleV2.position = new BABYLON.Vector3(-35, 0.02, 0);
  calleV2.material = matCalleV1;
  calleV2.receiveShadows = true;
}

function crearZonasPasto(s) {
  // Ya no se necesitan zonas de pasto adicionales
}

async function crearEntorno(s) {
  await crearCasas(s);
  await crearArboles(s);
  await crearBuzones(s);
  crearFarolas(s);
  crearBancos(s);
}

async function crearCasas(s) {
  const casaRoot = await cargarModelo(
    s,
    "assets/modelos/",
    "casa.glb",
    new BABYLON.Vector3(50, 0, 50),
    new BABYLON.Vector3(1.8, 1.8, 1.8)
  );
  addShadowFromRoot(s, casaRoot);

  const posicionesCasas = [
    new BABYLON.Vector3(-50, 0, 50),
    new BABYLON.Vector3(50, 0, -50),
    new BABYLON.Vector3(-50, 0, -50),
    new BABYLON.Vector3(50, 0, 18),
    new BABYLON.Vector3(-50, 0, 18),
    new BABYLON.Vector3(50, 0, -18),
    new BABYLON.Vector3(-50, 0, -18),
    new BABYLON.Vector3(18, 0, 50),
    new BABYLON.Vector3(-18, 0, 50),
    new BABYLON.Vector3(18, 0, -50),
    new BABYLON.Vector3(-18, 0, -50),
  ];

  for (let i = 0; i < posicionesCasas.length; i++) {
    const casa = casaRoot?.clone("casa_" + (i + 2));
    if (casa) casa.position = posicionesCasas[i];
  }
}

async function crearArboles(s) {
  const arbolRoot = await cargarModelo(
    s,
    "assets/modelos/",
    "arbol.glb",
    new BABYLON.Vector3(10, 0, 25),
    new BABYLON.Vector3(1.5, 1.5, 1.5)
  );
  if (arbolRoot) {
    arbolRoot.rotation = new BABYLON.Vector3(-Math.PI / 2, 0, 0);
    desactivarColisiones(arbolRoot);
  }
  addShadowFromRoot(s, arbolRoot);

  const posicionesArboles = obtenerPosicionesArboles();
  for (let i = 0; i < posicionesArboles.length; i++) {
    const clone = arbolRoot?.clone("arbol_" + i);
    if (clone) {
      clone.position = posicionesArboles[i];
      desactivarColisiones(clone);
    }
  }
}

function obtenerPosicionesArboles() {
  return [
    new BABYLON.Vector3(-10, 0, 25),
    new BABYLON.Vector3(25, 0, 10),
    new BABYLON.Vector3(-25, 0, -10),
    new BABYLON.Vector3(60, 0, 30),
    new BABYLON.Vector3(-60, 0, 30),
    new BABYLON.Vector3(60, 0, -30),
    new BABYLON.Vector3(-60, 0, -30),
    new BABYLON.Vector3(0, 0, 60),
    new BABYLON.Vector3(0, 0, -60),
    new BABYLON.Vector3(45, 0, 0),
    new BABYLON.Vector3(-45, 0, 0),
    new BABYLON.Vector3(0, 0, 45),
    new BABYLON.Vector3(0, 0, -45),
    new BABYLON.Vector3(30, 0, 45),
    new BABYLON.Vector3(-30, 0, 45),
    new BABYLON.Vector3(30, 0, -45),
    new BABYLON.Vector3(-30, 0, -45),
    new BABYLON.Vector3(55, 0, 15),
    new BABYLON.Vector3(-55, 0, 15),
    new BABYLON.Vector3(55, 0, -15),
    new BABYLON.Vector3(-55, 0, -15),
    new BABYLON.Vector3(65, 0, 0),
    new BABYLON.Vector3(-65, 0, 0),
    new BABYLON.Vector3(65, 0, 20),
    new BABYLON.Vector3(-65, 0, 20),
    new BABYLON.Vector3(65, 0, -20),
    new BABYLON.Vector3(-65, 0, -20),
    new BABYLON.Vector3(65, 0, 40),
    new BABYLON.Vector3(-65, 0, 40),
    new BABYLON.Vector3(65, 0, -40),
    new BABYLON.Vector3(-65, 0, -40),
    new BABYLON.Vector3(65, 0, 60),
    new BABYLON.Vector3(-65, 0, 60),
    new BABYLON.Vector3(65, 0, -60),
    new BABYLON.Vector3(-65, 0, -60),
    new BABYLON.Vector3(0, 0, 70),
    new BABYLON.Vector3(20, 0, 70),
    new BABYLON.Vector3(-20, 0, 70),
    new BABYLON.Vector3(40, 0, 70),
    new BABYLON.Vector3(-40, 0, 70),
    new BABYLON.Vector3(0, 0, -70),
    new BABYLON.Vector3(20, 0, -70),
    new BABYLON.Vector3(-20, 0, -70),
    new BABYLON.Vector3(40, 0, -70),
    new BABYLON.Vector3(-40, 0, -70),
    new BABYLON.Vector3(70, 0, 70),
    new BABYLON.Vector3(-70, 0, 70),
    new BABYLON.Vector3(70, 0, -70),
    new BABYLON.Vector3(-70, 0, -70),
    new BABYLON.Vector3(68, 0, 50),
    new BABYLON.Vector3(-68, 0, 50),
    new BABYLON.Vector3(68, 0, -50),
    new BABYLON.Vector3(-68, 0, -50),
    new BABYLON.Vector3(50, 0, 68),
    new BABYLON.Vector3(-50, 0, 68),
    new BABYLON.Vector3(50, 0, -68),
    new BABYLON.Vector3(-50, 0, -68),
    new BABYLON.Vector3(15, 0, 60),
    new BABYLON.Vector3(-15, 0, 60),
    new BABYLON.Vector3(15, 0, -60),
    new BABYLON.Vector3(-15, 0, -60),
    new BABYLON.Vector3(60, 0, 15),
    new BABYLON.Vector3(-60, 0, 15),
    new BABYLON.Vector3(60, 0, -15),
    new BABYLON.Vector3(-60, 0, -15),
  ];
}

function desactivarColisiones(objeto) {
  const meshes = objeto.getChildMeshes ? objeto.getChildMeshes() : [objeto];
  for (const mesh of meshes) {
    mesh.checkCollisions = false;
  }
}

async function crearBuzones(s) {
  const buzonRoot = await cargarModelo(
    s,
    "assets/modelos/",
    "buzon.glb",
    new BABYLON.Vector3(50, 0, 50),
    new BABYLON.Vector3(1, 1, 1)
  );

  const posicionesBuzones = obtenerPosicionesBuzones();

  for (let i = 0; i < posicionesBuzones.length; i++) {
    const buzonInstance = crearInstanciaBuzon(
      s,
      buzonRoot,
      i,
      posicionesBuzones[i]
    );
    if (buzonInstance) {
      desactivarColisiones(buzonInstance);
      buzones.push(buzonInstance);
      addShadowFromRoot(s, buzonInstance);
    }
  }
}

function obtenerPosicionesBuzones() {
  return [
    new BABYLON.Vector3(45, 0, 45),
    new BABYLON.Vector3(-45, 0, 45),
    new BABYLON.Vector3(45, 0, -45),
    new BABYLON.Vector3(-45, 0, -45),
    new BABYLON.Vector3(45, 0, 13),
    new BABYLON.Vector3(-45, 0, 13),
    new BABYLON.Vector3(45, 0, -13),
    new BABYLON.Vector3(-45, 0, -13),
    new BABYLON.Vector3(13, 0, 45),
    new BABYLON.Vector3(-13, 0, 45),
    new BABYLON.Vector3(13, 0, -45),
    new BABYLON.Vector3(-13, 0, -45),
  ];
}

function crearInstanciaBuzon(s, buzonRoot, index, posicion) {
  if (index === 0 && buzonRoot) {
    buzonRoot.position = posicion;
    return buzonRoot;
  }
  if (buzonRoot) {
    const clone = buzonRoot.clone("buzon_" + index);
    if (clone) clone.position = posicion;
    return clone;
  }
  return crearBuzonFallback(s, index, posicion);
}

function crearBuzonFallback(s, index, posicion) {
  const buzon = BABYLON.MeshBuilder.CreateBox(
    "buzon_" + index,
    { width: 1, height: 1.5, depth: 1 },
    s
  );
  buzon.position = new BABYLON.Vector3(posicion.x, 0.75, posicion.z);
  const mat = new BABYLON.StandardMaterial("buzonMat_" + index, s);
  mat.diffuseColor = new BABYLON.Color3(0.8, 0.1, 0.1);
  buzon.material = mat;
  if (s.shadowGenerator) s.shadowGenerator.addShadowCaster(buzon);
  return buzon;
}

function crearFarolas(s) {
  const posicionesFarolas = [
    new BABYLON.Vector3(25, 0, 12),
    new BABYLON.Vector3(-25, 0, 12),
    new BABYLON.Vector3(25, 0, -12),
    new BABYLON.Vector3(-25, 0, -12),
    new BABYLON.Vector3(12, 0, 25),
    new BABYLON.Vector3(-12, 0, 25),
    new BABYLON.Vector3(12, 0, -25),
    new BABYLON.Vector3(-12, 0, -25),
    new BABYLON.Vector3(48, 0, 35),
    new BABYLON.Vector3(-48, 0, 35),
    new BABYLON.Vector3(48, 0, -35),
    new BABYLON.Vector3(-48, 0, -35),
    new BABYLON.Vector3(60, 0, 0),
    new BABYLON.Vector3(-60, 0, 0),
    new BABYLON.Vector3(0, 0, 55),
    new BABYLON.Vector3(0, 0, -55),
  ];

  for (let i = 0; i < posicionesFarolas.length; i++) {
    const poste = BABYLON.MeshBuilder.CreateCylinder(
      "poste_" + i,
      { height: 4, diameter: 0.2 },
      s
    );
    poste.position = new BABYLON.Vector3(
      posicionesFarolas[i].x,
      2,
      posicionesFarolas[i].z
    );
    const matPoste = new BABYLON.StandardMaterial("matPoste_" + i, s);
    matPoste.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
    poste.material = matPoste;
    poste.checkCollisions = false;
    if (s.shadowGenerator) s.shadowGenerator.addShadowCaster(poste);

    const lampara = BABYLON.MeshBuilder.CreateSphere(
      "lampara_" + i,
      { diameter: 0.6 },
      s
    );
    lampara.position = new BABYLON.Vector3(
      posicionesFarolas[i].x,
      4.2,
      posicionesFarolas[i].z
    );
    const matLampara = new BABYLON.StandardMaterial("matLampara_" + i, s);
    matLampara.emissiveColor = new BABYLON.Color3(1, 0.8, 0.4);
    matLampara.diffuseColor = new BABYLON.Color3(1, 0.8, 0.4);
    lampara.material = matLampara;
    lampara.checkCollisions = false;

    // Agregar luz puntual a cada farola para iluminar el área
    const luzFarola = new BABYLON.PointLight(
      "luzFarola_" + i,
      new BABYLON.Vector3(posicionesFarolas[i].x, 4, posicionesFarolas[i].z),
      s
    );
    luzFarola.intensity = 0.5;
    luzFarola.range = 15;
    luzFarola.diffuse = new BABYLON.Color3(1, 0.8, 0.4);
  }
}

function crearBancos(s) {
  const posicionesBancos = [
    new BABYLON.Vector3(12, 0, 18),
    new BABYLON.Vector3(-12, 0, 18),
    new BABYLON.Vector3(12, 0, -18),
    new BABYLON.Vector3(-12, 0, -18),
  ];

  for (let i = 0; i < posicionesBancos.length; i++) {
    const banco = BABYLON.MeshBuilder.CreateBox(
      "banco_" + i,
      { width: 2, height: 0.8, depth: 0.5 },
      s
    );
    banco.position = new BABYLON.Vector3(
      posicionesBancos[i].x,
      0.4,
      posicionesBancos[i].z
    );
    const matBanco = new BABYLON.StandardMaterial("matBanco_" + i, s);
    matBanco.diffuseColor = new BABYLON.Color3(0.4, 0.25, 0.15);
    banco.material = matBanco;
    banco.checkCollisions = false;
    if (s.shadowGenerator) s.shadowGenerator.addShadowCaster(banco);
  }
}

function cargarModelo(s, rootUrl, fileName, position, scaling) {
  return new Promise((resolve) => {
    BABYLON.SceneLoader.ImportMesh(
      "",
      rootUrl,
      fileName,
      s,
      (meshes) => {
        if (!meshes || meshes.length === 0) {
          resolve(null);
          return;
        }
        const root = new BABYLON.TransformNode(fileName + "_root", s);
        for (const m of meshes) {
          m.parent = root;
          m.checkCollisions = true;
          m.receiveShadows = true;
        }
        root.position = position.clone();
        root.scaling = scaling.clone();
        resolve(root);
      },
      null,
      () => resolve(null)
    );
  });
}

function addShadowFromRoot(s, root) {
  if (!root || !s.shadowGenerator) return;
  const meshes = root.getChildMeshes ? root.getChildMeshes() : [root];
  for (const m of meshes) {
    if (m?.getBoundingInfo) s.shadowGenerator.addShadowCaster(m);
  }
}

function crearOficinaYCarta(s) {
  // Crear múltiples mesas con cartas cerca del punto de inicio
  const posicionesMesas = [
    new BABYLON.Vector3(3, 0, 8),
    new BABYLON.Vector3(-3, 0, 8),
    new BABYLON.Vector3(6, 0, 8),
    new BABYLON.Vector3(-6, 0, 8),
    new BABYLON.Vector3(0, 0, 10),
    new BABYLON.Vector3(0, 0, 12),
    new BABYLON.Vector3(9, 0, 8),
    new BABYLON.Vector3(-9, 0, 8),
    new BABYLON.Vector3(3, 0, 5),
    new BABYLON.Vector3(-3, 0, 5),
    new BABYLON.Vector3(6, 0, 5),
    new BABYLON.Vector3(-6, 0, 5),
  ];

  for (let i = 0; i < posicionesMesas.length; i++) {
    const mesa = BABYLON.MeshBuilder.CreateBox(
      "mesa_" + i,
      { width: 2, height: 0.4, depth: 1 },
      s
    );
    mesa.position = new BABYLON.Vector3(
      posicionesMesas[i].x,
      0.7,
      posicionesMesas[i].z
    );
    const matMesa = new BABYLON.StandardMaterial("mesaMat_" + i, s);
    matMesa.diffuseColor = new BABYLON.Color3(0.4, 0.25, 0.15);
    mesa.material = matMesa;
    mesa.checkCollisions = false;
    if (s.shadowGenerator) s.shadowGenerator.addShadowCaster(mesa);

    const cartaItem = BABYLON.MeshBuilder.CreateBox(
      "carta_" + i,
      { width: 0.8, height: 0.05, depth: 0.6 },
      s
    );
    cartaItem.position = new BABYLON.Vector3(
      posicionesMesas[i].x,
      0.95,
      posicionesMesas[i].z
    );
    const matCarta = new BABYLON.StandardMaterial("cartaMat_" + i, s);
    const texCarta = new BABYLON.Texture("assets/texturas/carta.jpg", s);
    matCarta.diffuseTexture = texCarta;
    cartaItem.material = matCarta;
    cartaItem.estaDisponible = true;
    if (s.shadowGenerator) s.shadowGenerator.addShadowCaster(cartaItem);

    cartas.push(cartaItem);
  }
}

function crearJugador(s) {
  jugador = BABYLON.MeshBuilder.CreateCapsule(
    "jugador",
    { height: 2, radius: 0.5 },
    s
  );
  jugador.position = new BABYLON.Vector3(0, 1, 0);
  jugador.isVisible = false;
  jugador.checkCollisions = false;
  if (s.shadowGenerator) s.shadowGenerator.addShadowCaster(jugador);
}

function crearSkybox(s) {
  const skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 400 }, s);
  const mat = new BABYLON.StandardMaterial("skyBoxMat", s);
  mat.backFaceCulling = false;
  mat.diffuseColor = new BABYLON.Color3(0, 0, 0);
  mat.specularColor = new BABYLON.Color3(0, 0, 0);
  mat.emissiveColor = new BABYLON.Color3(0.05, 0.05, 0.15);
  mat.disableLighting = true;
  skybox.material = mat;
  skybox.isPickable = false;

  // Agregar estrellas en el cielo nocturno
  for (let i = 0; i < 100; i++) {
    const estrella = BABYLON.MeshBuilder.CreateSphere(
      "estrella_" + i,
      { diameter: 0.3 },
      s
    );
    // Posiciones aleatorias en el cielo
    const x = Math.random() * 300 - 150;
    const y = Math.random() * 50 + 30;
    const z = Math.random() * 300 - 150;
    estrella.position = new BABYLON.Vector3(x, y, z);

    const matEstrella = new BABYLON.StandardMaterial("matEstrella_" + i, s);
    matEstrella.emissiveColor = new BABYLON.Color3(1, 1, 0.9);
    matEstrella.disableLighting = true;
    estrella.material = matEstrella;
    estrella.checkCollisions = false;
    estrella.isPickable = false;
  }

  // Agregar luna
  const luna = BABYLON.MeshBuilder.CreateSphere("luna", { diameter: 8 }, s);
  luna.position = new BABYLON.Vector3(-60, 50, -60);
  const matLuna = new BABYLON.StandardMaterial("matLuna", s);
  matLuna.emissiveColor = new BABYLON.Color3(0.9, 0.9, 0.7);
  matLuna.disableLighting = true;
  luna.material = matLuna;
  luna.checkCollisions = false;
  luna.isPickable = false;
}

function configurarControles(s, canvas) {
  s.onKeyboardObservable.add((kbInfo) => {
    if (kbInfo.type === BABYLON.KeyboardEventTypes.KEYDOWN) {
      if (kbInfo.event.key === " ") {
        manejarEspacio();
      }
    }
  });
}

function configurarLogicaJuego(s) {
  s.onBeforeRenderObservable.add(() => {
    if (!jugador || !camera) return;
    // Limitar altura de cámara pero permitir movimiento
    if (camera.position.y < 1.5) camera.position.y = 1.7;
    if (camera.position.y > 2) camera.position.y = 1.7;
    jugador.position.x = camera.position.x;
    jugador.position.z = camera.position.z;
    jugador.position.y = 1;
    actualizarUI();
  });
}

function manejarEspacio() {
  if (!jugador) return;

  if (cartaEnMano) {
    intentarEntregarCarta();
  } else {
    intentarRecogerCarta();
  }
}

function intentarRecogerCarta() {
  const rango = 3;
  for (let i = 0; i < cartas.length; i++) {
    const carta = cartas[i];
    if (
      carta.estaDisponible &&
      estaCerca(jugador.position, carta.position, rango)
    ) {
      recogerCarta(carta, i);
      return;
    }
  }
}

function intentarEntregarCarta() {
  const rango = 3;
  for (let i = 0; i < buzones.length; i++) {
    const buzon = buzones[i];
    if (estaCerca(jugador.position, buzon.position, rango)) {
      entregarCarta(buzon, i);
      return;
    }
  }
}

function estaCerca(pos1, pos2, rango) {
  return BABYLON.Vector3.Distance(pos1, pos2) < rango;
}

function recogerCarta(carta, index) {
  carta.parent = jugador;
  carta.position = new BABYLON.Vector3(0.3, 1.2, 1);
  carta.estaDisponible = false;
  cartaEnMano = carta;
  console.log("Carta recogida " + (index + 1));
}

function entregarCarta(buzon, index) {
  cartaEnMano.parent = null;
  cartaEnMano.position = buzon.position.clone();
  cartaEnMano.position.y += 1;
  cartaEnMano = null;
  cartasRecogidas++;
  console.log("Carta entregada en buzón " + (index + 1));

  if (cartasRecogidas === cartas.length) {
    mostrarMensajeVictoria();
  }
}

function mostrarMensajeVictoria() {
  setTimeout(() => {
    alert("🎉 ¡Felicidades! Has entregado todas las cartas del vecindario!");
  }, 300);
}

function actualizarUI() {
  const cartaStatus = document.getElementById("cartaStatus");
  if (!cartaStatus) return;

  if (cartaEnMano) {
    cartaStatus.textContent =
      "🚚 Lleva la carta a un buzón rojo (frente a cada casa) - ESPACIO";
    cartaStatus.style.color = "#ffff00";
  } else {
    cartaStatus.textContent = `📭 Busca cartas en las mesas (${cartasRecogidas}/${cartas.length} entregadas)`;
    cartaStatus.style.color = "white";
  }
}

globalThis.addEventListener("beforeunload", () => {
  if (engine) engine.dispose();
});
