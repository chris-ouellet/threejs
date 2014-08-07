var camera, scene, renderer;
var geometry, material, mesh;
var controls;

var objects = [];

var raycaster, raycasterX, raycasterNX, raycasterZ, raycasterNZ;

var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

Physijs.scripts.worker = 'js/vendor/physijs_worker.js';
Physijs.scripts.ammo = '/js/vendor/ammo.js';


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

    player_avatar = new Physijs.BoxMesh(
		new THREE.BoxGeometry(0.8, 0.8, 2.0),
		Physijs.createMaterial( new THREE.MeshLambertMaterial({ color: 0xff00ff }), 1, 1),
		100
	);
	player_avatar.visible = false;
	player_avatar.geometry.dynamic = false;
    player_avatar.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );

    controls = new THREE.PointerLockControls( player_avatar.camera );
    player_avatar.addEventListener('collision', function(object) {
        console.log("Object " + this.id + " collided with " + object.id);
    });
	scene.add( controls.getObject() );

	raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 5 );
	raycasterX = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 1, 0, 0 ), 0, 5 );
	raycasterNX = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( -1, 0, 0 ), 0, 5 );
	raycasterZ = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, 0, 1 ), 0, 5 );
	raycasterNZ = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, 0, -1 ), 0, 5 );
	// floor

	geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
	geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

	var sphere = new THREE.SphereGeometry( 1, 16, 8 );

	light1 = new THREE.PointLight( 0x00ccff, 1, 0);
	light1.add( new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color: 0x00ccff } ) ) );
	light1.position.y += 5;

	scene.add( light1 );

	//for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

	//	var vertex = geometry.vertices[ i ];
	//	vertex.x += Math.random() * 20 - 10;
	//	vertex.y += Math.random() * 2;
	//	vertex.z += Math.random() * 20 - 10;

	//}

	//for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

	//	var face = geometry.faces[ i ];
	//	face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
	//	face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
	//	face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

	//}

	material = new THREE.MeshPhongMaterial( { color: 0x000000, transparent: true, opacity: .1, specular: 0xffffff, shininess: 50, shading: THREE.SmoothShading, ambient: 0x555555} );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

    // Walls
    var material = new THREE.MeshPhongMaterial( {color: 0x111111, transparent: true, opacity: .5, specular: 0xffffff, shininess: 1, shading: THREE.SmoothShading, ambient: 0x555555} );

    // var geometry = new THREE.BoxGeometry( 81, 36, .01);
    // var cube = new THREE.Mesh( geometry, material );
    // cube.position.z -= 40.5;
    // cube.position.y += 18;
    // objects.push(cube);
    
    var geometry = new THREE.BoxGeometry( 81, 36, .01);
    var cube = new THREE.Mesh( geometry, material );
    cube.position.z -= 40.5;
    cube.position.y += 18;
    objects.push(cube);

    var geometry = new THREE.BoxGeometry( 81, 36, .01);
    var cube = new THREE.Mesh( geometry, material );
    cube.position.z += 40.5;
    cube.position.y += 18;
    objects.push(cube);
    //scene.add( cube );

    cube = new Physijs.BoxMesh( 
        new THREE.BoxGeometry( .01, 36, 81),
        Physijs.createMaterial( material, 1, 1),
        1
    );
    cube.position.y += 18;
    cube.position.x += 40.5;
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

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0xffffff );
	renderer.setSize( window.innerWidth, window.innerHeight );

	document.body.appendChild( renderer.domElement );

	//

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	player_avatar.camera.aspect = window.innerWidth / window.innerHeight;
	player_avatar.camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );
	scene.simulate();

	controls.isOnObject( false );

	raycaster.ray.origin.copy( controls.getObject().position );
	raycaster.ray.origin.y -= 10;

	raycasterX.ray.origin.copy( controls.getObject().position );
	var xintersections = raycasterX.intersectObjects( objects );
	if ( xintersections.length > 0 )
	{
		console.log("x positive intersection");
		controls.collisionX(0);
	}
	else
	{
		controls.collisionX(1);
	}

	raycasterNX.ray.origin.copy( controls.getObject().position );
	var nxintersections = raycasterNX.intersectObjects( objects );
	if ( nxintersections.length > 0 )
	{
		console.log("x negative intersection");
	}

	raycasterZ.ray.origin.copy( controls.getObject().position );
	var zintersections = raycasterZ.intersectObjects( objects );
	if ( zintersections.length > 0 )
		console.log("z positive intersection");

	raycasterNZ.ray.origin.copy( controls.getObject().position );
	var nzintersections = raycasterNZ.intersectObjects( objects );
	if ( nzintersections.length > 0 )
		console.log("z negative intersection");

	var intersections = raycaster.intersectObjects( objects );

	if ( intersections.length > 0 ) {
		console.log(intersections);
		controls.isOnObject( true );
	}

	controls.update();

	renderer.render( scene, player_avatar.camera );

}