"use strict";

var canvas, gl, program;

// Data Buffers
var pointsArray = [];
var normalsArray = [];

// Attribute & Uniform Locations
var modelViewLoc, projectionLoc, normalMatrixLoc;
var ambientLoc, diffuseLoc, specularLoc, shininessLoc;
var lightPosLoc;

// Camera
var eye = vec3(5, 2, 5);
var at = vec3(0.0, 1.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var yaw = 0.0;
var pitch = 0.0;

// Movement
var speed = 0.15;
var turnSpeed = 2.0;
var keys = {};

// Animation
var globalTime = 0;
var isAnimating = true;

// Object offsets
var cubeStart, cubeCount;
var sphereStart, sphereCount;

// Light properties
var lightPosition = vec4(0.0, 5.0, 0.0, 1.0);
var lightAmbient = vec3(0.2, 0.2, 0.2);
var lightDiffuse = vec3(1.0, 0.9, 0.8);
var lightSpecular = vec3(1.0, 1.0, 1.0);

// Materials
var materialStone = { ambient: vec3(0.1, 0.1, 0.15), diffuse: vec3(0.4, 0.4, 0.45), specular: vec3(0.1, 0.1, 0.1), shininess: 10.0 };
var materialWood = { ambient: vec3(0.2, 0.1, 0.05), diffuse: vec3(0.5, 0.3, 0.1), specular: vec3(0.1, 0.1, 0.1), shininess: 5.0 };
var materialGem = { ambient: vec3(0.1, 0.0, 0.2), diffuse: vec3(0.8, 0.1, 0.9), specular: vec3(0.9, 0.9, 0.9), shininess: 50.0 };
var materialFloor = { ambient: vec3(0.1, 0.1, 0.1), diffuse: vec3(0.3, 0.3, 0.3), specular: vec3(0.1, 0.1, 0.1), shininess: 2.0 };
var materialFire = { ambient: vec3(0.3, 0.0, 0.3), diffuse: vec3(1.0, 0.0, 1.0), specular: vec3(1.0, 0.5, 1.0), shininess: 80.0 };

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.05, 0.05, 0.05, 1.0);
    gl.enable(gl.DEPTH_TEST);

    generateCube();
    generateSphere(4);

    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Buffers
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);
    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewLoc = gl.getUniformLocation(program, "uModelView");
    projectionLoc = gl.getUniformLocation(program, "uProjection");
    normalMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");
    ambientLoc = gl.getUniformLocation(program, "uAmbientProduct");
    diffuseLoc = gl.getUniformLocation(program, "uDiffuseProduct");
    specularLoc = gl.getUniformLocation(program, "uSpecularProduct");
    shininessLoc = gl.getUniformLocation(program, "uShininess");
    lightPosLoc = gl.getUniformLocation(program, "uLightPosition");

    var aspect = canvas.width / canvas.height;
    var projectionMatrix = perspective(60.0, aspect, 0.1, 200.0);
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projectionMatrix));

    window.addEventListener("keydown", function(e) { keys[e.code] = true; });
    window.addEventListener("keyup", function(e) { keys[e.code] = false; });
    document.getElementById("toggleAnim").onclick = function() { isAnimating = !isAnimating; };

    render();
}

function generateCube() {
    cubeStart = pointsArray.length;
    var vertices = [
        vec4(-0.5, -0.5, 0.5, 1.0), vec4(-0.5, 0.5, 0.5, 1.0), vec4(0.5, 0.5, 0.5, 1.0), vec4(0.5, -0.5, 0.5, 1.0),
        vec4(-0.5, -0.5, -0.5, 1.0), vec4(-0.5, 0.5, -0.5, 1.0), vec4(0.5, 0.5, -0.5, 1.0), vec4(0.5, -0.5, -0.5, 1.0)
    ];
    function quad(a, b, c, d) {
        var t1 = subtract(vertices[b], vertices[a]);
        var t2 = subtract(vertices[c], vertices[b]);
        var normal = normalize(vec3(cross(t1, t2)));
        pointsArray.push(vertices[a]); normalsArray.push(normal);
        pointsArray.push(vertices[b]); normalsArray.push(normal);
        pointsArray.push(vertices[c]); normalsArray.push(normal);
        pointsArray.push(vertices[a]); normalsArray.push(normal);
        pointsArray.push(vertices[c]); normalsArray.push(normal);
        pointsArray.push(vertices[d]); normalsArray.push(normal);
    }
    quad(1, 0, 3, 2); quad(2, 3, 7, 6); quad(3, 0, 4, 7);
    quad(6, 5, 1, 2); quad(4, 5, 6, 7); quad(5, 4, 0, 1);
    cubeCount = pointsArray.length - cubeStart;
}

function generateSphere(n) {
    sphereStart = pointsArray.length;
    var va = vec4(0.0, 0.0, -1.0, 1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333, 1);
    function triangle(a, b, c) {
        pointsArray.push(a); normalsArray.push(vec3(a[0], a[1], a[2]));
        pointsArray.push(b); normalsArray.push(vec3(b[0], b[1], b[2]));
        pointsArray.push(c); normalsArray.push(vec3(c[0], c[1], c[2]));
    }
    function divideTriangle(a, b, c, count) {
        if (count > 0) {
            var ab = normalize(mix(a, b, 0.5), true);
            var ac = normalize(mix(a, c, 0.5), true);
            var bc = normalize(mix(b, c, 0.5), true);
            divideTriangle(a, ab, ac, count - 1);
            divideTriangle(ab, b, bc, count - 1);
            divideTriangle(bc, c, ac, count - 1);
            divideTriangle(ab, bc, ac, count - 1);
        } else {
            triangle(a, b, c);
        }
    }
    divideTriangle(va, vb, vc, n); divideTriangle(vd, vc, vb, n);
    divideTriangle(va, vd, vb, n); divideTriangle(va, vc, vd, n);
    sphereCount = pointsArray.length - sphereStart;
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (isAnimating) globalTime += 0.02;

    // Camera Update
    var forward = normalize(vec3(
        Math.cos(radians(pitch)) * Math.cos(radians(yaw)),
        Math.sin(radians(pitch)),
        Math.cos(radians(pitch)) * Math.sin(radians(yaw))
    ));
    var right = normalize(cross(forward, up));

    if (keys["KeyW"]) eye = add(eye, scale(speed, forward));
    if (keys["KeyS"]) eye = subtract(eye, scale(speed, forward));
    if (keys["KeyA"]) eye = subtract(eye, scale(speed, right));
    if (keys["KeyD"]) eye = add(eye, scale(speed, right));

    if (keys["ArrowLeft"]) yaw -= turnSpeed;
    if (keys["ArrowRight"]) yaw += turnSpeed;
    if (keys["ArrowUp"]) pitch += turnSpeed;
    if (keys["ArrowDown"]) pitch -= turnSpeed;
    if (pitch > 89.0) pitch = 89.0;
    else if (pitch < -89.0) pitch = -89.0;

    var viewMatrix = lookAt(eye, add(eye, forward), up);
    var lightPosEye = mult(viewMatrix, vec4(eye[0], eye[1] + 1.0, eye[2], 1.0));
    gl.uniform4fv(lightPosLoc, flatten(lightPosEye));

    // Helper function to draw objects
    function drawObject(start, count, model, material) {
        var mv = mult(viewMatrix, model);
        gl.uniformMatrix4fv(modelViewLoc, false, flatten(mv));
        gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix(mv, true)));
        gl.uniform3fv(ambientLoc, flatten(mult(lightAmbient, material.ambient)));
        gl.uniform3fv(diffuseLoc, flatten(mult(lightDiffuse, material.diffuse)));
        gl.uniform3fv(specularLoc, flatten(mult(lightSpecular, material.specular)));
        gl.uniform1f(shininessLoc, material.shininess);
        gl.drawArrays(gl.TRIANGLES, start, count);
    }

    // Helper to draw a wall
    function drawWall(x, y, z, sx, sy, sz) {
        var model = mult(translate(x, y, z), scale(sx, sy, sz));
        drawObject(cubeStart, cubeCount, model, materialStone);
    }

    // FLOOR (120x120 maze)
    drawObject(cubeStart, cubeCount, mult(translate(60, -0.5, 60), scale(120, 1, 120)), materialFloor);

    // CEILING
    drawObject(cubeStart, cubeCount, mult(translate(60, 8.5, 60), scale(120, 1, 120)), materialStone);

    // OUTER WALLS
    drawWall(60, 4, 0, 120, 8, 1);      // North wall
    drawWall(60, 4, 120, 120, 8, 1);    // South wall
    drawWall(0, 4, 60, 1, 8, 120);      // West wall
    drawWall(120, 4, 60, 1, 8, 120);    // East wall

    // Horizontal walls
    drawWall(30, 4, 15, 50, 8, 1);
    drawWall(80, 4, 15, 30, 8, 1);
    drawWall(15, 4, 25, 20, 8, 1);
    drawWall(60, 4, 25, 40, 8, 1);
    drawWall(100, 4, 25, 30, 8, 1);
    drawWall(25, 4, 35, 35, 8, 1);
    drawWall(75, 4, 35, 40, 8, 1);
    drawWall(15, 4, 45, 25, 8, 1);
    drawWall(50, 4, 45, 30, 8, 1);
    drawWall(95, 4, 45, 35, 8, 1);
    drawWall(30, 4, 55, 45, 8, 1);
    drawWall(85, 4, 55, 30, 8, 1);
    drawWall(20, 4, 65, 30, 8, 1);
    drawWall(60, 4, 65, 35, 8, 1);
    drawWall(100, 4, 65, 25, 8, 1);
    drawWall(35, 4, 75, 40, 8, 1);
    drawWall(85, 4, 75, 35, 8, 1);
    drawWall(15, 4, 85, 20, 8, 1);
    drawWall(50, 4, 85, 40, 8, 1);
    drawWall(95, 4, 85, 30, 8, 1);
    drawWall(30, 4, 95, 35, 8, 1);
    drawWall(75, 4, 95, 40, 8, 1);
    drawWall(20, 4, 105, 30, 8, 1);
    drawWall(65, 4, 105, 35, 8, 1);
    drawWall(105, 4, 105, 20, 8, 1);

    // Vertical walls
    drawWall(10, 4, 30, 1, 8, 50);
    drawWall(20, 4, 60, 1, 8, 40);
    drawWall(30, 4, 20, 1, 8, 30);
    drawWall(30, 4, 80, 1, 8, 35);
    drawWall(40, 4, 45, 1, 8, 40);
    drawWall(50, 4, 70, 1, 8, 30);
    drawWall(60, 4, 35, 1, 8, 45);
    drawWall(60, 4, 90, 1, 8, 25);
    drawWall(70, 4, 15, 1, 8, 35);
    drawWall(70, 4, 60, 1, 8, 40);
    drawWall(80, 4, 40, 1, 8, 35);
    drawWall(80, 4, 85, 1, 8, 30);
    drawWall(90, 4, 20, 1, 8, 30);
    drawWall(90, 4, 70, 1, 8, 40);
    drawWall(100, 4, 50, 1, 8, 35);
    drawWall(110, 4, 30, 1, 8, 45);
    drawWall(110, 4, 90, 1, 8, 30);

    drawWall(45, 4, 30, 1, 8, 15);
    drawWall(55, 4, 50, 1, 8, 20);
    drawWall(65, 4, 70, 1, 8, 15);
    drawWall(75, 4, 90, 1, 8, 18);
    drawWall(85, 4, 35, 1, 8, 12);
    drawWall(95, 4, 60, 1, 8, 20);
    drawWall(35, 4, 100, 1, 8, 15);
    drawWall(105, 4, 75, 1, 8, 18);

    // Purple fire in far corner (110, 110)
    var bob = Math.sin(globalTime * 3.0) * 1.5;
    var flicker = 1.0 + Math.sin(globalTime * 5.0) * 0.3;
    
    // Main purple flame sphere
    var gemModel = mult(translate(110, 4 + bob, 110), scale(2 * flicker, 5 * flicker, 2 * flicker));
    gemModel = mult(gemModel, rotateY(globalTime * 40.0));
    drawObject(sphereStart, sphereCount, gemModel, materialFire);

    requestAnimationFrame(render);
}