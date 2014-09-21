var camera, scene, renderer, light, container;
var geometry, material, mesh;
var controls;

var objects = [];

var raycaster;

//oimos stuffs
var meshs = [];
var grounds = [];
var isMobile = false;
var antialias = true;

var geos = {};
var mats = {};

//oimo var
var world = null;
var bodys = [];

var fps = [0,0,0,0];
var ToRad = Math.PI / 180;
var type=1;
var infos;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

Physijs.scripts.worker = 'js/vendor/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';


var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

if ( havePointerLock ) {

	var element = document.body;

	var pointerlockchange = function ( event ) {

		if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {

			controls.enabled = true;

			blocker.style.display = 'none';

		} else {

			controls.enabled = false;

			blocker.style.display = '-webkit-box';
			blocker.style.display = '-moz-box';
			blocker.style.display = 'box';

			instructions.style.display = '';

		}

	}

	var pointerlockerror = function ( event ) {

		instructions.style.display = '';

	}

	// Hook pointer lock state change events
	document.addEventListener( 'pointerlockchange', pointerlockchange, false );
	document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
	document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

	document.addEventListener( 'pointerlockerror', pointerlockerror, false );
	document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
	document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

	instructions.addEventListener( 'click', function ( event ) {

		instructions.style.display = 'none';

		// Ask the browser to lock the pointer
		element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

		if ( /Firefox/i.test( navigator.userAgent ) ) {

			var fullscreenchange = function ( event ) {

				if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {

					document.removeEventListener( 'fullscreenchange', fullscreenchange );
					document.removeEventListener( 'mozfullscreenchange', fullscreenchange );

					element.requestPointerLock();
				}

			}

			document.addEventListener( 'fullscreenchange', fullscreenchange, false );
			document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

			element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

			element.requestFullscreen();

		} else {

			element.requestPointerLock();

		}

	}, false );

} else {

	instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

}

init();
animate();

function init() {
	scene = new Physijs.Scene;
    scene.setGravity(
        new THREE.Vector3(0,0,0)
    );
	//scene.fog = new THREE.Fog( 0x00ccff, 0, 750 );

    pl = new Physijs.CapsuleMesh(
		new THREE.CylinderGeometry(0.8, 0.8, 2.0),
		new THREE.MeshBasicMaterial({ color: 0xff00ff }),
		100
	);
	pl.visible = false;
	pl.geometry.dynamic = false;
    p1.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );

    controls = new THREE.PointerLockControls( p1.camera );
	scene.add( controls.getObject() );

	raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

	// floor

	geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	var sphere = new THREE.SphereGeometry( 1, 16, 8 );

	light1 = new THREE.PointLight( 0x00ccff, 1, 0);
	light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x00ccff } ) ) );
	light1.position.y += 5;

	scene.add( light1 );

	//oimo stuff
	// geometrys
        geos['sphere'] = new THREE.BufferGeometry();
        geos['sphere'].fromGeometry( new THREE.SphereGeometry(1,16,10));
        geos['box'] = new THREE.BufferGeometry();
        geos['box'].fromGeometry( new THREE.BoxGeometry(1,1,1));

    // materials
        mats['sph'] = new THREE.MeshPhongMaterial( { map: basicTexture(0), name:'sph' } );
        mats['box'] = new THREE.MeshPhongMaterial( { map: basicTexture(2), name:'box' } );
        mats['ssph'] = new THREE.MeshLambertMaterial( { map: basicTexture(1), name:'ssph' } );
        mats['sbox'] = new THREE.MeshLambertMaterial( { map: basicTexture(3), name:'sbox' } );
        mats['ground'] = new THREE.MeshLambertMaterial( { color: 0x3D4143 } );
    //END oimo stuff

	material = new THREE.MeshPhongMaterial( { color: 0x000000, transparent: true, opacity: .1, specular: 0xffffff, shininess: 50, shading: THREE.SmoothShading, ambient: 0x555555} );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

    // Walls
    var material = new THREE.MeshPhongMaterial( {color: 0x111111, transparent: true, opacity: .5, specular: 0xffffff, shininess: 1, shading: THREE.SmoothShading, ambient: 0x555555} );

    var geometry = new THREE.BoxGeometry( 81, 36, .01);
    var cube = new THREE.Mesh( geometry, material );
    cube.position.z -= 40.5;
    cube.position.y += 18;
    objects.push(cube);
    //scene.add( cube );

    var geometry = new THREE.BoxGeometry( 81, 36, .01);
    var cube = new THREE.Mesh( geometry, material );
    cube.position.z += 40.5;
    cube.position.y += 18;
    objects.push(cube);
    //scene.add( cube );

    cube = new Physijs.BoxMesh( 
        new THREE.BoxGeometry( .01, 36, 81),
        Physijs.createMaterial( material, 1, 1)
    );
    cube.position.y += 18;
    cube.position.x += 40.5;
    cube.addEventListener('collision', function(object) {
        console.log("Object " + this.id + " collided with " + object.id);
    });
    objects.push(cube);
    //scene.add( cube );

    var geometry = new THREE.BoxGeometry( 81, .01, 81);
    var cube = new THREE.Mesh( geometry, material );
    cube.position.y += 36;
    objects.push(cube);
    //scene.add( cube );
    scene.add(objects);

    for (var i = 0; i < objects.length; i++)
    {
        scene.add(objects[i]);
    }

    // Skybox
        group = new THREE.Object3D();
	scene.add( group );

    var loader = new THREE.TextureLoader();
	loader.load( 'img/milky_way.jpg', function ( texture ) {

		var geometry = new THREE.SphereGeometry( 2000, 200, 200);

		var material = new THREE.MeshBasicMaterial( { map: texture, overdraw: 0.5, side: THREE.DoubleSide } );
		var mesh = new THREE.Mesh( geometry, material );
		group.add( mesh );

	} );

	renderer = new THREE.WebGLRenderer({precision: "mediump", antialias:antialias});
	renderer.setClearColor( 0xffffff );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.autoClear = false;

	document.body.appendChild( renderer.domElement );

	//
	initOimoPhysics();

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	p1.camera.aspect = window.innerWidth / window.innerHeight;
	p1.camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );
	scene.simulate();

	controls.isOnObject( false );

	raycaster.ray.origin.copy( controls.getObject().position );
	raycaster.ray.origin.y -= 10;

	var intersections = raycaster.intersectObjects( objects );

	if ( intersections.length > 0 ) {

		controls.isOnObject( true );

	}

	controls.update();

	renderer.render( scene, p1.camera );

}

function addStaticBox(size, position, rotation) {
    var mesh = new THREE.Mesh( geos.box, mats.ground );
    mesh.scale.set( size[0], size[1], size[2] );
    mesh.position.set( position[0], position[1], position[2] );
    mesh.rotation.set( rotation[0]*ToRad, rotation[1]*ToRad, rotation[2]*ToRad );
    scene.add( mesh );
    grounds.push(mesh);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
}

function clearMesh(){
    var i=meshs.length;
    while (i--) scene.remove(meshs[ i ]);
    i = grounds.length;
    while (i--) scene.remove(grounds[ i ]);
    grounds = [];
    meshs = [];
}

//----------------------------------
//  OIMO PHYSICS
//----------------------------------

function initOimoPhysics(){

    // world setting:( TimeStep, BroadPhaseType, Iterations )
    // BroadPhaseType can be 
    // 1 : BruteForce
    // 2 : Sweep and prune , the default 
    // 3 : dynamic bounding volume tree

    world = new OIMO.World(1/60, 2, 8);
    populate(1);
    setInterval(updateOimoPhysics, 1000/60);

}

function populate(n) {

    var max = 100;

    if(n===1) type = 1
    else if(n===2) type = 2;
    else if(n===3) type = 3;

    // reset old
    clearMesh();
    world.clear();
    bodys=[];

    //add ground
    var ground = new OIMO.Body({size:[100, 40, 390], pos:[0,-20,0], world:world});
    var ground2 = new OIMO.Body({size:[400, 40, 400], pos:[0,-60,0], world:world});

    addStaticBox([100, 40, 390], [0,-20,0], [0,0,0]);
    addStaticBox([400, 40, 400], [0,-60,0], [0,0,0]);

    //add object
    var x, y, z, w, h, d;
    var i = max;

    while (i--){
        if(type===3) t = Math.floor(Math.random()*2)+1;
        else t = type;
        x = -100 + Math.random()*200;
        z = -100 + Math.random()*200;
        y = 100 + Math.random()*1000;
        w = 10 + Math.random()*10;
        h = 10 + Math.random()*10;
        d = 10 + Math.random()*10;

        if(t===1){
            bodys[i] = new OIMO.Body({type:'sphere', size:[w*0.5], pos:[x,y,z], move:true, world:world});
            meshs[i] = new THREE.Mesh( geos.sphere, mats.sph );
            meshs[i].scale.set( w*0.5, w*0.5, w*0.5 );
        } else if(t===2){
            bodys[i] = new OIMO.Body({type:'box', size:[w,h,d], pos:[x,y,z], move:true, world:world});
            meshs[i] = new THREE.Mesh( geos.box, mats.box );
            meshs[i].scale.set( w, h, d );
        }

        meshs[i].castShadow = true;
        meshs[i].receiveShadow = true;

        scene.add( meshs[i] );
    }
}

function updateOimoPhysics() {
    world.step();

    var x, y, z;
    var i = bodys.length;
    var mesh;
    var body; 

    while (i--){
        body = bodys[i].body;
        mesh = meshs[i];

        if(!body.sleeping){

            mesh.position.copy(body.getPosition());
            mesh.quaternion.copy(body.getQuaternion());

            // change material
            if(mesh.material.name === 'sbox') mesh.material = mats.box;
            if(mesh.material.name === 'ssph') mesh.material = mats.sph; 

            // reset position
            if(mesh.position.y<-100){
                x = -100 + Math.random()*200;
                z = -100 + Math.random()*200;
                y = 100 + Math.random()*1000;
                body.resetPosition(x,y,z);
            }
        } else {
            if(mesh.material.name === 'box') mesh.material = mats.sbox;
            if(mesh.material.name === 'sph') mesh.material = mats.ssph;
        }
    }

    infos.innerHTML = world.performance.show();
}

function gravity(g){
    nG = -10;
    world.gravity = new OIMO.Vec3(0, nG, 0);
}

//----------------------------------
//  TEXTURES
//----------------------------------

function gradTexture(color) {
    var c = document.createElement("canvas");
    var ct = c.getContext("2d");
    c.width = 16; c.height = 128;
    var gradient = ct.createLinearGradient(0,0,0,128);
    var i = color[0].length;
    while(i--){ gradient.addColorStop(color[0][i],color[1][i]); }
    ct.fillStyle = gradient;
    ct.fillRect(0,0,16,128);
    var texture = new THREE.Texture(c);
    texture.needsUpdate = true;
    return texture;
}

function basicTexture(n){
    var canvas = document.createElement( 'canvas' );
    canvas.width = canvas.height = 64;
    var ctx = canvas.getContext( '2d' );
    var color;
    if(n===0) color = "#3884AA";// sphere58AA80
    if(n===1) color = "#61686B";// sphere sleep
    if(n===2) color = "#AA6538";// box
    if(n===3) color = "#61686B";// box sleep
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = "rgba(0,0,0,0.2);";//colors[1];
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillRect(32, 32, 32, 32);
    var tx = new THREE.Texture(canvas);
    tx.needsUpdate = true;
    return tx;
}