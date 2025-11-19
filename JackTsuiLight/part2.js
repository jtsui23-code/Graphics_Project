"use strict";

var canvas;
var gl;

var numPositions;

var positions = [];
var colors = [];
var normals = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [0, 0, 0];

var thetaLoc;
var projectionLoc;
var modelViewLoc;
var speed = 2.0; // Initial speed is still 2.0
var animFrameId = null;
var handlersAdded = false;

// Material properties for Brass (k_a, k_d, k_s, alpha)
var brassMaterial = {
    ambient: vec3(0.33, 0.22, 0.03),
    diffuse: vec3(0.78, 0.57, 0.11),
    specular: vec3(0.99, 0.94, 0.81),
    shininess: 27.8
};

// Initial shape for Part I is the cube
init("cube");

function init(picture)
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    // Choose which shape to draw
    var shape = { positions: [], colors: [], numVertices: 0 };
    
    if (picture == "tetrahedron"){
        shape = drawTetrahedron();
    }
    else if (picture == "cube") {
        shape = drawCube();
    }
    else if (picture == "octahedron") {
        shape = drawOctahedron();
    }
    else if (picture == "icosahedron") {
        shape = drawIcosahedron();
    }
    else if (picture == "dodecahedron") {
        shape = drawDodecahedron();
    }
    else if (picture == "sphere") {
        shape = drawSphere(3);
    }
    
    positions = shape.positions;
    colors = shape.colors;
    numPositions = shape.numVertices;

    // Compute per-triangle normals (flat shading)
    function subtractVec(a, b) {
        return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
    }
    function crossVec(a, b) {
        return [a[1]*b[2] - a[2]*b[1], a[2]*b[0] - a[0]*b[2], a[0]*b[1] - a[1]*b[0]];
    }
    function normalizeVec(v) {
        var len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
        if (len === 0) return [0,0,0];
        return [v[0]/len, v[1]/len, v[2]/len];
    }

    normals = [];
    for (var i = 0; i < positions.length; i += 3) {
        var p1 = positions[i];
        var p2 = positions[i+1];
        var p3 = positions[i+2];
        var v1 = subtractVec(p2, p1);
        var v2 = subtractVec(p3, p1);
        var n = normalizeVec(crossVec(v1, v2));
        // push same normal for the three vertices of the triangle
        normals.push(vec3(n[0], n[1], n[2]));
        normals.push(vec3(n[0], n[1], n[2]));
        normals.push(vec3(n[0], n[1], n[2]));
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Color buffer (kept for compatibility, but the shader uses material properties)
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
    
    // Normal Buffer (New)
    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);
    
    // Get uniform locations (New/Updated)
    thetaLoc = gl.getUniformLocation(program, "uTheta");
    modelViewLoc = gl.getUniformLocation(program, "uModelView");
    projectionLoc = gl.getUniformLocation(program, "uProjection");
    
    // Set up projection and modelView matrices (Assuming common setup)
    var modelView = lookAt(vec3(0, 0, 3.0), vec3(0, 0, 0), vec3(0, 1, 0));
    var projection = perspective(45, canvas.width/canvas.height, 0.1, 10.0);
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(modelView));
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projection));
    
    // Set up lighting uniforms (New)
    gl.uniform3fv(gl.getUniformLocation(program, "uLightPosition"), vec3(0.0, 1.0, 2.0));
    gl.uniform3fv(gl.getUniformLocation(program, "uAmbient"), vec3(0.2, 0.2, 0.2));
    gl.uniform3fv(gl.getUniformLocation(program, "uDiffuse"), vec3(1.0, 1.0, 1.0));
    gl.uniform3fv(gl.getUniformLocation(program, "uSpecular"), vec3(1.0, 1.0, 1.0));
    
    // Set material uniforms (New)
    gl.uniform3fv(gl.getUniformLocation(program, "uMaterialAmbient"), brassMaterial.ambient);
    gl.uniform3fv(gl.getUniformLocation(program, "uMaterialDiffuse"), brassMaterial.diffuse);
    gl.uniform3fv(gl.getUniformLocation(program, "uMaterialSpecular"), brassMaterial.specular);
    gl.uniform1f(gl.getUniformLocation(program, "uMaterialShininess"), brassMaterial.shininess);


    // --- Event Listeners (add only once) ---
    if (!handlersAdded) {
        // Buttons for Rotation
        document.getElementById( "xButton" ).onclick = function () {
            axis = xAxis;
            // Removed: speed = 2.0; -> Retains current speed
        };
        document.getElementById( "yButton" ).onclick = function () {
            axis = yAxis;
            // Removed: speed = 2.0; -> Retains current speed
        };
        document.getElementById( "zButton" ).onclick = function () {
            axis = zAxis;
            // Removed: speed = 2.0; -> Retains current speed
        };

        document.getElementById( "stop" ).onclick = function () {
            speed = 0.0;
        };

        // Keyboard for Shape Selection (Part III)
        // Use modern key handling and log events for debugging
        document.addEventListener('keydown', function(event) {
            console.log('keydown event:', event.key, event.keyCode);
            var key = event.key; // '1', '2', '3', '4' expected
            switch(key) {
                case '1':
                    console.log('Switching to tetrahedron');
                    init("tetrahedron");
                    break;
                case '2':
                    console.log('Switching to cube');
                    init("cube");
                    break;
                case '3':
                    console.log('Switching to octahedron');
                    init("octahedron");
                    break;
                case '4':
                    console.log('Switching to icosahedron');
                    init("icosahedron"); 
                    break;
                case '5':
                    console.log('Switching to dodecahedron');
                    init("dodecahedron");
                    break;
                case '6':
                    console.log('Switching to sphere');
                    init("sphere");
                    break;
                case '0':
                    console.log('Switching to all shapes');
                    init("all");
                    break;
            }
        });

        handlersAdded = true;
    }

    // Start the render loop, but cancel any previous animation to avoid duplicates
    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
    render();
}

// DrawCube - Creates a cube centered at origin
function drawCube() {
    var positions = [];
    var colors = [];
    
    var vertices = [
        vec4(-0.5, -0.5,  0.5, 1.0),  // 0
        vec4(-0.5,  0.5,  0.5, 1.0),  // 1
        vec4( 0.5,  0.5,  0.5, 1.0),  // 2
        vec4( 0.5, -0.5,  0.5, 1.0),  // 3
        vec4(-0.5, -0.5, -0.5, 1.0),  // 4
        vec4(-0.5,  0.5, -0.5, 1.0),  // 5
        vec4( 0.5,  0.5, -0.5, 1.0),  // 6
        vec4( 0.5, -0.5, -0.5, 1.0)   // 7
    ];
    
    // Face colors are not used for Phong shading but kept for buffer creation
    var faceColors = [
        vec4(1.0, 0.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0),
        vec4(1.0, 1.0, 0.0, 1.0), vec4(1.0, 0.0, 1.0, 1.0), vec4(0.0, 1.0, 1.0, 1.0)
    ];
    
    function addQuad(a, b, c, d, colorIndex) {
        var indices = [a, b, c, a, c, d];
        for (var i = 0; i < indices.length; i++) {
            positions.push(vertices[indices[i]]);
            colors.push(faceColors[colorIndex]);
        }
    }
    
    addQuad(1, 0, 3, 2, 0);  // front
    addQuad(2, 3, 7, 6, 1);  // right
    addQuad(3, 0, 4, 7, 2);  // bottom
    addQuad(6, 5, 1, 2, 3);  // top
    addQuad(4, 5, 6, 7, 4);  // back
    addQuad(5, 4, 0, 1, 5);  // left
    
    return { positions: positions, colors: colors, numVertices: positions.length };
}

// DrawTetrahedron - Creates a regular tetrahedron centered at origin
function drawTetrahedron() {
    var positions = [];
    var colors = [];
    
    var a = 1.0 / Math.sqrt(3);
    
    var vertices = [
        vec4( a,  a,  a, 1.0),
        vec4(-a, -a,  a, 1.0),
        vec4(-a,  a, -a, 1.0),
        vec4( a, -a, -a, 1.0)
    ];
    
    var faceColors = [
        vec4(1.0, 0.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0), 
        vec4(0.0, 0.0, 1.0, 1.0), vec4(1.0, 1.0, 0.0, 1.0)
    ];
    
    function addTriangle(a, b, c, colorIndex) {
        positions.push(vertices[a]);
        positions.push(vertices[b]);
        positions.push(vertices[c]);
        colors.push(faceColors[colorIndex]);
        colors.push(faceColors[colorIndex]);
        colors.push(faceColors[colorIndex]);
    }
    
    addTriangle(0, 2, 1, 0);
    addTriangle(0, 3, 2, 1);
    addTriangle(0, 1, 3, 2);
    addTriangle(1, 2, 3, 3);
    
    return { positions: positions, colors: colors, numVertices: positions.length };
}

// DrawOctahedron - Creates a regular octahedron (8 faces)
function drawOctahedron() {
    var positions = [];
    var colors = [];
    
    var vertices = [
        vec4( 0.0,  1.0,  0.0, 1.0),  // 0: top
        vec4( 0.0, -1.0,  0.0, 1.0),  // 1: bottom
        vec4( 1.0,  0.0,  0.0, 1.0),  // 2: right
        vec4( 0.0,  0.0,  1.0, 1.0),  // 3: front
        vec4(-1.0,  0.0,  0.0, 1.0),  // 4: left
        vec4( 0.0,  0.0, -1.0, 1.0)   // 5: back
    ];
    
    var faceColors = [
        vec4(1.0, 0.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0),
        vec4(1.0, 1.0, 0.0, 1.0), vec4(1.0, 0.0, 1.0, 1.0), vec4(0.0, 1.0, 1.0, 1.0),
        vec4(1.0, 0.5, 0.0, 1.0), vec4(0.5, 0.0, 0.5, 1.0)
    ];
    
    function addTriangle(a, b, c, colorIndex) {
        positions.push(vertices[a]);
        positions.push(vertices[b]);
        positions.push(vertices[c]);
        colors.push(faceColors[colorIndex]);
        colors.push(faceColors[colorIndex]);
        colors.push(faceColors[colorIndex]);
    }
    
    // Top 4 faces
    addTriangle(0, 3, 2, 0);
    addTriangle(0, 2, 5, 1);
    addTriangle(0, 5, 4, 2);
    addTriangle(0, 4, 3, 3);
    
    // Bottom 4 faces
    addTriangle(1, 2, 3, 4);
    addTriangle(1, 5, 2, 5);
    addTriangle(1, 4, 5, 6);
    addTriangle(1, 3, 4, 7);
    
    return { positions: positions, colors: colors, numVertices: positions.length };
}

// DrawDodecahedron - Creates a regular dodecahedron (12 pentagonal faces)
function drawDodecahedron() {
    var positions = [];
    var colors = [];
    
    var phi = (1.0 + Math.sqrt(5.0)) / 2.0;  // Golden ratio ≈ 1.618
    var a = 1.0;
    var b = 1.0 / phi;  // ≈ 0.618
    
    // Standard dodecahedron vertices (20 vertices)
    var vertices = [
        // 8 vertices at cube corners (±1, ±1, ±1)
        vec4( a,  a,  a, 1.0),   // 0
        vec4( a,  a, -a, 1.0),   // 1
        vec4( a, -a,  a, 1.0),   // 2
        vec4( a, -a, -a, 1.0),   // 3
        vec4(-a,  a,  a, 1.0),   // 4
        vec4(-a,  a, -a, 1.0),   // 5
        vec4(-a, -a,  a, 1.0),   // 6
        vec4(-a, -a, -a, 1.0),   // 7
        
        // 12 vertices at (0, ±1/φ, ±φ) and cyclic permutations
        vec4( 0,  b,  phi, 1.0), // 8
        vec4( 0,  b, -phi, 1.0), // 9
        vec4( 0, -b,  phi, 1.0), // 10
        vec4( 0, -b, -phi, 1.0), // 11
        
        vec4( b,  phi,  0, 1.0), // 12
        vec4( b, -phi,  0, 1.0), // 13
        vec4(-b,  phi,  0, 1.0), // 14
        vec4(-b, -phi,  0, 1.0), // 15
        
        vec4( phi,  0,  b, 1.0), // 16
        vec4( phi,  0, -b, 1.0), // 17
        vec4(-phi,  0,  b, 1.0), // 18
        vec4(-phi,  0, -b, 1.0)  // 19
    ];
    
    var faceColors = [
        vec4(1.0, 0.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0),
        vec4(1.0, 1.0, 0.0, 1.0), vec4(1.0, 0.0, 1.0, 1.0), vec4(0.0, 1.0, 1.0, 1.0),
        vec4(1.0, 0.5, 0.0, 1.0), vec4(0.5, 0.0, 0.5, 1.0), vec4(0.0, 0.5, 0.5, 1.0),
        vec4(0.5, 0.5, 0.0, 1.0), vec4(0.5, 0.5, 0.5, 1.0), vec4(0.2, 0.8, 0.2, 1.0)
    ];
    
    function addPentagon(a, b, c, d, e, colorIndex) {
        // Triangulate pentagon into 3 triangles from vertex a
        positions.push(vertices[a]); positions.push(vertices[b]); positions.push(vertices[c]);
        positions.push(vertices[a]); positions.push(vertices[c]); positions.push(vertices[d]);
        positions.push(vertices[a]); positions.push(vertices[d]); positions.push(vertices[e]);
        
        for (var i = 0; i < 9; i++) colors.push(faceColors[colorIndex]);
    }
    
    // 12 pentagonal faces with correct vertex ordering
    addPentagon(0, 16, 2, 10, 8, 0);    // Face 1
    addPentagon(0, 8, 4, 14, 12, 1);    // Face 2
    addPentagon(0, 12, 1, 17, 16, 2);   // Face 3
    addPentagon(8, 10, 6, 18, 4, 3);    // Face 4
    addPentagon(12, 14, 5, 9, 1, 4);    // Face 5
    addPentagon(16, 17, 3, 13, 2, 5);   // Face 6
    addPentagon(6, 10, 2, 13, 15, 6);   // Face 7
    addPentagon(4, 18, 19, 5, 14, 7);   // Face 8
    addPentagon(1, 9, 11, 3, 17, 8);    // Face 9
    addPentagon(7, 15, 13, 3, 11, 9);   // Face 10
    addPentagon(7, 11, 9, 5, 19, 10);   // Face 11
    addPentagon(15, 7, 19, 18, 6, 11);  // Face 12
    
    return { positions: positions, colors: colors, numVertices: positions.length };
}


// DrawIcosahedron - Creates a regular icosahedron (20 triangular faces)
function drawIcosahedron() {
    var positions = [];
    var colors = [];
    
    var phi = (1.0 + Math.sqrt(5.0)) / 2.0;
    var a = 1.0;
    var b = 1.0 / phi;
    
    var vertices = [
        vec4( 0,  b, -a, 1.0), vec4( b,  a,  0, 1.0), vec4(-b,  a,  0, 1.0),
        vec4( 0,  b,  a, 1.0), vec4( 0, -b,  a, 1.0), vec4(-a,  0,  b, 1.0),
        vec4( 0, -b, -a, 1.0), vec4( a,  0, -b, 1.0), vec4( a,  0,  b, 1.0),
        vec4(-a,  0, -b, 1.0), vec4( b, -a,  0, 1.0), vec4(-b, -a,  0, 1.0)
    ];
    
    var faceColors = [
        vec4(1.0, 0.0, 0.0, 1.0), vec4(0.0, 1.0, 0.0, 1.0), vec4(0.0, 0.0, 1.0, 1.0),
        vec4(1.0, 1.0, 0.0, 1.0), vec4(1.0, 0.0, 1.0, 1.0), vec4(0.0, 1.0, 1.0, 1.0),
        vec4(1.0, 0.5, 0.0, 1.0), vec4(0.5, 0.0, 0.5, 1.0), vec4(0.0, 0.5, 0.5, 1.0),
        vec4(0.5, 0.5, 0.0, 1.0), vec4(0.5, 0.5, 0.5, 1.0), vec4(0.8, 0.2, 0.2, 1.0),
        vec4(0.2, 0.8, 0.2, 1.0), vec4(0.2, 0.2, 0.8, 1.0), vec4(0.8, 0.8, 0.2, 1.0),
        vec4(0.8, 0.2, 0.8, 1.0), vec4(0.2, 0.8, 0.8, 1.0), vec4(0.6, 0.4, 0.2, 1.0),
        vec4(0.4, 0.2, 0.6, 1.0), vec4(0.2, 0.6, 0.4, 1.0)
    ];
    
    function addTriangle(a, b, c, colorIndex) {
        positions.push(vertices[a]);
        positions.push(vertices[b]);
        positions.push(vertices[c]);
        colors.push(faceColors[colorIndex]);
        colors.push(faceColors[colorIndex]);
        colors.push(faceColors[colorIndex]);
    }
    
    // 20 faces - corrected winding order
    addTriangle(0, 1, 2, 0);   addTriangle(3, 2, 1, 1);   addTriangle(3, 4, 5, 2);
    addTriangle(3, 8, 4, 3);   addTriangle(0, 6, 7, 4);   addTriangle(0, 9, 6, 5);
    addTriangle(4, 10, 11, 6); addTriangle(6, 11, 10, 7); addTriangle(2, 5, 9, 8);
    addTriangle(11, 9, 5, 9);  addTriangle(1, 7, 8, 10);  addTriangle(10, 8, 7, 11);
    addTriangle(3, 5, 2, 12);  addTriangle(3, 1, 8, 13);  addTriangle(0, 2, 9, 14);
    addTriangle(0, 7, 1, 15);  addTriangle(6, 9, 11, 16); addTriangle(6, 10, 7, 17);
    addTriangle(4, 11, 5, 18); addTriangle(4, 8, 10, 19);
    
    return { positions: positions, colors: colors, numVertices: positions.length };
}

// DrawSphere - Creates a sphere by subdividing an icosahedron
function drawSphere(subdivisions) {
    var positions = [];
    var colors = [];
    
    var phi = (1.0 + Math.sqrt(5.0)) / 2.0;
    var a = 1.0;
    var b = 1.0 / phi;
    
    var icoVertices = [
        [0, b, -a], [b, a, 0], [-b, a, 0],
        [0, b, a], [0, -b, a], [-a, 0, b],
        [0, -b, -a], [a, 0, -b], [a, 0, b],
        [-a, 0, -b], [b, -a, 0], [-b, -a, 0]
    ];
    
    // Normalize initial vertices to unit sphere
    for (var i = 0; i < icoVertices.length; i++) {
        var v = icoVertices[i];
        var len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
        icoVertices[i] = [v[0]/len, v[1]/len, v[2]/len];
    }
    
    var icoIndices = [
        0,1,2, 3,2,1, 3,4,5, 3,8,4, 0,6,7, 0,9,6, 4,10,11, 6,11,10,
        2,5,9, 11,9,5, 1,7,8, 10,8,7, 3,5,2, 3,1,8, 0,2,9, 0,7,1,
        6,9,11, 6,10,7, 4,11,5, 4,8,10
    ];
    
    var baseColor = vec4(0.3, 0.6, 1.0, 1.0);
    
    function normalize(v) {
        var len = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
        return [v[0]/len, v[1]/len, v[2]/len];
    }
    
    function midpoint(v1, v2) {
        return normalize([
            (v1[0] + v2[0]) / 2.0,
            (v1[1] + v2[1]) / 2.0,
            (v1[2] + v2[2]) / 2.0
        ]);
    }
    
    function subdivideTriangle(a, b, c, count) {
        if (count > 0) {
            var ab = midpoint(a, b);
            var bc = midpoint(b, c);
            var ca = midpoint(c, a);
            subdivideTriangle(a, ab, ca, count - 1);
            subdivideTriangle(ab, b, bc, count - 1);
            subdivideTriangle(ca, bc, c, count - 1);
            subdivideTriangle(ab, bc, ca, count - 1);
        } else {
            positions.push(vec4(a[0], a[1], a[2], 1.0));
            positions.push(vec4(b[0], b[1], b[2], 1.0));
            positions.push(vec4(c[0], c[1], c[2], 1.0));
            colors.push(baseColor);
            colors.push(baseColor);
            colors.push(baseColor);
        }
    }
    
    for (var i = 0; i < icoIndices.length; i += 3) {
        subdivideTriangle(
            icoVertices[icoIndices[i]],
            icoVertices[icoIndices[i+1]],
            icoVertices[icoIndices[i+2]],
            subdivisions
        );
    }
    
    return { positions: positions, colors: colors, numVertices: positions.length };
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    theta[axis] += speed;
    gl.uniform3fv(thetaLoc, theta);

    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    animFrameId = requestAnimationFrame(render);
}