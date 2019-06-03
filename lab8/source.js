

var canvas, renderer, scene, camera; // Standard three.js requirements.

var controls;  // An OrbitControls object that is used to implement
               // rotation of the scene using the mouse.  (It actually rotates
               // the camera around the scene.)

var animating = false;  // Set to true when an animation is in progress.
var frameNumber = 0;  // Frame number is advanced by 1 for each frame while animating.

var tempObject;  // A temporary animated object.  DELETE IT.
let horses = [];
let cylinders = [];
var loader;
var cone;
var sphere;

/**
 * 
 *  The render function draws the scene.
 */
function render() {
    renderer.render(scene, camera);
}

function SetUpCylindersPosition(){
        cylinders[0].position.set(8,2,0);
        cylinders[1].position.set(-8,2,0);
        cylinders[2].position.set(0,2,8);
        cylinders[3].position.set(0,2,-8);

        cylinders.forEach(element => {
            rotateAboutPoint(element, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), THREE.Math.degToRad(45));
        });

        cylinders[4].position.set(8,2,0);
        cylinders[5].position.set(-8,2,0);
        cylinders[6].position.set(0,2,8);
        cylinders[7].position.set(0,2,-8);
        cylinders.forEach( el => {
            scene.add(el);
        })
}

function createCylinders(){
    for (let i = 0; i < 8; i++) {
        cylinders.push( new THREE.Mesh( 
            new THREE.CylinderGeometry(0.2,0.2,5,15,15),
            new THREE.MeshPhongMaterial({
                            color: 0x654321,
                            specular: 0x222222,
                            shininess: 16,
                            shading: THREE.FlatShading
                        })
                ))
        }
    SetUpCylindersPosition();
}

function createHorses(){
    var loader = new THREE.LegacyJSONLoader();
    loader.load('resources/horse.js', 
                ( geometry ) => {
                var bufferGeometry = new THREE.BufferGeometry().fromGeometry( geometry );
                var material1 = new THREE.MeshPhongMaterial({
                    color: 0x1F2F3F,
                    specular: 0x222222,
                    shininess: 16,
                    shading: THREE.FlatShading
                });
        
                for (let i = 0; i < 8; i++) {
                        horses.push(new THREE.Mesh( bufferGeometry,
                         new THREE.MeshPhongMaterial({
                        color: Math.random()*0xFFFFFF<<0,
                        specular: 0x222222,
                        shininess: 16,
                        shading: THREE.FlatShading
                            }) 
                        ))   
                }
                
                let angle = 0;
                horses.forEach( obj => {
                    obj.scale.set(0.02, 0.02, 0.02);
                    obj.geometry.translate(50, 1, 1)
                    obj.rotation.y += angle;
                    scene.add(obj);
                    angle += THREE.Math.degToRad(45);
                })
        });
}

function createCarousel(){
    cone = new THREE.Mesh( 
        new THREE.ConeGeometry( 10, 2, 32 ),
        new THREE.MeshPhongMaterial( 
            {   color: 0x9400D3,
                specular: 0x222222,
                shininess: 16,
                shading: THREE.FlatShading
            }));

    cone.position.set(0, 5.5, 0);
    scene.add( cone );

    tempObject =  new THREE.Mesh( 
        new THREE.CylinderGeometry(10,10,0.2,20,1),
        new THREE.MeshPhongMaterial({
            color: 0x9400D3,
            specular: 0x222222,
            shininess: 16,
            shading: THREE.FlatShading
        })
    );    
    tempObject.position.set(0, -0.5, 0)
    scene.add(tempObject);
}

function createEarth(){
    var texture = new THREE.TextureLoader().load( "resources/earth.jpg" );
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 1, 1 );

        var geometry = new THREE.SphereGeometry( 5, 32, 32 );
        var material = new THREE.MeshBasicMaterial( { map: texture } );
        sphere = new THREE.Mesh( geometry, material );
        sphere.scale.set(0.5, 0.5, 0.5);
        sphere.position.set(0.0, 2.0, 0.0);
        scene.add( sphere );   
}
/**
 * This function is called by the init() method to create the world. 
 */
function createWorld() {
    
    renderer.setClearColor("black"); // Background color for scene.
    scene = new THREE.Scene();
    
    // ------------------- Make a camera with viewpoint light ----------------------
    
    camera = new THREE.PerspectiveCamera(30, canvas.width/canvas.height, 0.3, 500);
    camera.position.z = 35;
    var light;  // A light shining from the direction of the camera; moves with the camera.
    light = new THREE.DirectionalLight();
    light.position.set(0,0,1);
    camera.add(light);
    scene.add(camera);


        createHorses();
        createEarth();
        createCarousel();
        createCylinders();
} // end function createWorld()


/**
 *  This function is called once for each frame of the animation, before
 *  the render() function is called for that frame.  It updates any
 *  animated properties.  The value of the global variable frameNumber
 *  is incrementd 1 before this function is called.
 */
function updateForFrame() {
    tempObject.rotation.y -= 0.01;
    horses.forEach(element => {
        element.rotation.y -= 0.01;
    });

    cylinders.forEach(element => {
        rotateAboutPoint(element, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), -0.01);
    });
    cone.rotation.y -= 0.01;

    sphere.rotation.y -= 0.01;
}

function rotateAboutPoint(obj, point, axis, theta, pointIsWorld){
	pointIsWorld = (pointIsWorld === undefined)? false : pointIsWorld;
  
	if(pointIsWorld){
		obj.parent.localToWorld(obj.position); // compensate for world coordinate
	}
  
	obj.position.sub(point); // remove the offset
	obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
	obj.position.add(point); // re-add the offset
  
	if(pointIsWorld){
		obj.parent.worldToLocal(obj.position); // undo world coordinates compensation
	}
  
	obj.rotateOnAxis(axis, theta); // rotate the OBJECT
}

/* ---------------------------- MOUSE AND ANIMATION SUPPORT ------------------

/**
 *  This page uses THREE.OrbitControls to let the user use the mouse to rotate
 *  the view.  OrbitControls are designed to be used during an animation, where
 *  the rotation is updated as part of preparing for the next frame.  The scene
 *  is not automatically updated just because the user drags the mouse.  To get
 *  the rotation to work without animation, I add another mouse listener to the
 *  canvas, just to call the render() function when the user drags the mouse.
 *  The same thing holds for touch events -- I call render for any mouse move
 *  event with one touch.
 */
function installOrbitControls() {
    controls = new THREE.OrbitControls(camera,canvas);
    controls.noPan = true; 
    controls.noZoom = true;
    controls.staticMoving = true;
    function move() {
        controls.update();
        if (! animating) {
            render();
        }
    }
    function down() {
        document.addEventListener("mousemove", move, false);
    }
    function up() {
        document.removeEventListener("mousemove", move, false);
    }
    function touch(event) {
        if (event.touches.length == 1) {
            move();
        }
    }
    canvas.addEventListener("mousedown", down, false);
    canvas.addEventListener("touchmove", touch, false);
}

/*  Called when user changes setting of the Animate checkbox. */
function doAnimateCheckbox() {
   var run = document.getElementById("animateCheckbox").checked;
   if (run != animating) {
       animating = run;
       if (animating) {
           requestAnimationFrame(doFrame);
       }
   }
}

/*  Drives the animation, called by system through requestAnimationFrame() */
function doFrame() {
    if (animating) {
        frameNumber++;
        updateForFrame();
        render();
        requestAnimationFrame(doFrame);
    }
}

/*----------------------------- INITIALIZATION ----------------------------------------

/**
 *  This function is called by the onload event so it will run after the
 *  page has loaded.  It creates the renderer, canvas, and scene objects,
 *  calls createWorld() to add objects to the scene, and renders the
 *  initial view of the scene.  If an error occurs, it is reported.
 */
function init() {
    try {
        canvas = document.getElementById("glcanvas");
        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: false
        });
    }
    catch (e) {
        document.getElementById("message").innerHTML="<b>Sorry, an error occurred:<br>" +
                e + "</b>";
        return;
    }
    document.getElementById("animateCheckbox").checked = false;
    document.getElementById("animateCheckbox").onchange = doAnimateCheckbox;
    createWorld();
    installOrbitControls();
    render();
}
