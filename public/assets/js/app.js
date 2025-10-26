/**
 * Aplicación de Visualización 3D con Babylon.js
 * Autor: Ariel Justin Amaguaña Toapanta
 * Descripción: Demo interactiva de primitivos 3D con texturas y animaciones
 */

window.addEventListener("DOMContentLoaded", function () {
  // Obtener canvas y crear motor gráfico
  var canvas = document.getElementById("renderCanvas");
  var engine = new BABYLON.Engine(canvas, true);

  // Función para crear la escena 3D
  var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    // Configurar color de fondo con gradiente
    scene.clearColor = new BABYLON.Color3(0.1, 0.15, 0.2);

    // Cámara libre con controles de ratón
    var camera = new BABYLON.FreeCamera(
      "camera1",
      new BABYLON.Vector3(0, 5, -15),
      scene
    );
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    camera.speed = 0.15; // Velocidad de cámara más suave

    // Iluminación hemisférica para iluminar toda la escena
    var light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0, 1, 0),
      scene
    );
    light.intensity = 0.9;

    // Luz adicional para sombras y profundidad
    var pointLight = new BABYLON.PointLight(
      "pointLight",
      new BABYLON.Vector3(5, 10, 5),
      scene
    );
    pointLight.intensity = 0.5;
    pointLight.range = 30;

    // Textura de madera para la caja
    var woodMat = new BABYLON.StandardMaterial("woodMat", scene);
    woodMat.diffuseTexture = new BABYLON.Texture(
      "./assets/textures/madera.jpg",
      scene
    );

    // Crear cubo con textura de madera
    var box = BABYLON.MeshBuilder.CreateBox("box", { size: 2 }, scene);
    box.position = new BABYLON.Vector3(-4, 1, 0);
    box.material = woodMat;

    // Textura de mármol para la esfera
    var marbleMat = new BABYLON.StandardMaterial("marbleMat", scene);
    marbleMat.diffuseTexture = new BABYLON.Texture(
      "./assets/textures/marmol.jpg",
      scene
    );

    // Crear esfera con textura de mármol
    var sphere = BABYLON.MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 2 },
      scene
    );
    sphere.position = new BABYLON.Vector3(-1.5, 1, 0);
    sphere.material = marbleMat;

    // Textura metálica para el cilindro
    var metalMat = new BABYLON.StandardMaterial("metalMat", scene);
    metalMat.diffuseTexture = new BABYLON.Texture(
      "./assets/textures/metal.jpg",
      scene
    );

    // Crear cilindro con textura metálica
    var cylinder = BABYLON.MeshBuilder.CreateCylinder(
      "cylinder",
      { height: 2, diameter: 1.5 },
      scene
    );
    cylinder.position = new BABYLON.Vector3(1.5, 1, 0);
    cylinder.material = metalMat;

    // Textura de ladrillo para el torus
    var brickMat = new BABYLON.StandardMaterial("brickMat", scene);
    brickMat.diffuseTexture = new BABYLON.Texture(
      "./assets/textures/ladrillo.jpg",
      scene
    );

    // Crear torus con textura de ladrillo
    var torus = BABYLON.MeshBuilder.CreateTorus(
      "torus",
      { diameter: 2, thickness: 0.5 },
      scene
    );
    torus.position = new BABYLON.Vector3(4, 1, 0);
    torus.material = brickMat;

    // Textura de césped para el suelo
    var groundMat = new BABYLON.StandardMaterial("groundMat", scene);
    groundMat.diffuseTexture = new BABYLON.Texture(
      "./assets/textures/cesped.jpg",
      scene
    );

    // Crear suelo con textura de césped
    var ground = BABYLON.MeshBuilder.CreateGround(
      "ground",
      { width: 12, height: 12 },
      scene
    );
    ground.material = groundMat;
    ground.position.y = -0.01; // Ajuste de profundidad

    // Cargar modelo 3D del Yeti desde archivo glTF
    BABYLON.SceneLoader.ImportMeshAsync(
      null,
      "./assets/models/",
      "Yeti.gltf",
      scene
    )
      .then((result) => {
        const meshes = result.meshes;
        if (meshes && meshes.length) {
          const yeti = meshes[0];
          yeti.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
          yeti.position.y = 0.5;
          yeti.position.z = 5; // Mover hacia atrás

          console.log("✓ Yeti cargado desde assets/models/Yeti.gltf");
        }
      })
      .catch((err) => {
        console.error(
          "✗ Error al cargar Yeti desde assets/models/Yeti.gltf:",
          err
        );
      });

    return scene;
  };

  // Crear la escena
  var scene = createScene();

  // Bucle de renderizado principal
  engine.runRenderLoop(function () {
    scene.render();
  });

  // Manejar redimensionamiento de ventana
  window.addEventListener("resize", function () {
    engine.resize();
  });

  // Log de inicialización
  console.log("═══════════════════════════════════════════");
  console.log("  Babylon 3D Visualization initialized");
  console.log("  Autor: Ariel Justin Amaguaña Toapanta");
  console.log("═══════════════════════════════════════════");
});
