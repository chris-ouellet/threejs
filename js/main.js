// scene object variables
var renderer, scene, camera, pointLight, spotLight, controls;

// field variables
var fieldWidth = 9, fieldHeight = 9;

function setup()
{
	// set up all the 3D objects in the scene	
	createScene();

	// and let's get cracking!
	draw();
}

function createScene()
{
    // set the scene size
	var WIDTH = window.innerWidth,
	  HEIGHT = window.innerHeight;

	// set some camera attributes
	var VIEW_ANGLE = 45,
	  ASPECT = WIDTH / HEIGHT,
	  NEAR = 0.1,
	  FAR = 10000;

	var c = document.body;

	// create a WebGL renderer, camera
	// and a scene
	renderer = new THREE.WebGLRenderer();
	camera =
	  new THREE.PerspectiveCamera(
		VIEW_ANGLE,
		ASPECT,
		NEAR,
		FAR);

	scene = new THREE.Scene();

    // Mouse Controls
    controls = new THREE.OrbitControls( camera, renderer.domElement );
    move_controls = new THREE.FirstPersonControls( camera );
    move_controls.movementSpeed = 13;
	move_controls.lookSpeed = 0.01;

	// add the camera to the scene
	scene.add(camera);

	// set a default position for the camera
	// not doing this somehow messes up shadow rendering
	camera.position.z = 10;

	// start the renderer
	renderer.setSize(WIDTH, HEIGHT);

	// attach the render-supplied DOM element
	c.appendChild(renderer.domElement);

    // create grid
    var line_material = new THREE.LineBasicMaterial( { color: 0xaaaaaa, opacity: 0.8 } ),
		geometry = new THREE.Geometry(),
		floor = -1, step = 1, size = 66;
	
	for ( var i = 0; i <= size / step * 2; i ++ )
	{
		geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( - size, floor, i * step - size ) ) );
		geometry.vertices.push( new THREE.Vertex( new THREE.Vector3(   size, floor, i * step - size ) ) );
	
		geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( i * step - size, floor, -size ) ) );
		geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( i * step - size, floor,  size ) ) );
	}
	
	var grid = new THREE.Line( geometry, line_material, THREE.LinePieces );

	

    // create the ground
    var ground = new THREE.Mesh( new THREE.PlaneGeometry( 9,
        9 ),
        new THREE.MeshBasicMaterial(
        { color: this.textureGround ? 0xffffff : 0x0000ff, ambient: 0xffffff}
        )
    );
    ground.rotation.x = -Math.PI/2;

	// set up the playing surface plane 
	var planeWidth = fieldWidth,
		planeHeight = fieldHeight,
		planeQuality = 10;

	// create the wall's material
	var wallMaterial =
	  new THREE.MeshLambertMaterial(
		{
		  color: 0x00CC00
		});

	// finally we finish by adding a wall plane
	// to show off pretty shadows
	var wall = new THREE.Mesh(

	  new THREE.CubeGeometry( 
	  planeWidth, 
	  planeHeight, 
	  1, 
	  1, 
	  1,
	  1 ),

	  wallMaterial);
    // set ground to arbitrary z position to best show off shadowing
	wall.position.z -= 5;
	wall.position.y += 4.5;
	wall.receiveShadow = true;
	scene.add(grid);	
	scene.add(wall);
    scene.add(ground);		



	// // create a point light
	pointLight =
	  new THREE.PointLight(0xF8D898);

	// set its position
	pointLight.position.x = -1000;
	pointLight.position.y = 0;
	pointLight.position.z = 1000;
	pointLight.intensity = 5;
	pointLight.distance = 10000;
	// add to the scene
	scene.add(pointLight);

	// add a spot light
	// this is important for casting shadows
    spotLight = new THREE.SpotLight(0xF8D898);
    spotLight.position.set(0, 0, 460);
    spotLight.intensity = 1.5;
    spotLight.castShadow = true;
    scene.add(spotLight);

	// MAGIC SHADOW CREATOR DELUXE EDITION with Lights PackTM DLC
	renderer.shadowMapEnabled = true;
}

function draw()
{
    // draw THREE.JS scene
	renderer.render(scene, camera);
	// loop draw function call
	requestAnimationFrame(draw);
}