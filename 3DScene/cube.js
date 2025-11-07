"use strict";

var canvas;
var gl;

var numPositions;

var positions = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [0, 0, 0];

var thetaLoc;
var projectionLoc;
var modelViewLoc;
var speed = 2.0;

init("dodecahedron");

function init(picture)
{
    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available");

    // Choose which shape to draw
    var shape = 0;
    
    if (picture == "tetrahedron"){
        shape = drawTetrahedron();
    }
    else if (picture == "cube") {
        shape = drawCube();
    }
    else if (picture == "octahedron") {
        shape = drawOctahedron();
    }
    else if (picture == "dodecahedron") {
        shape = drawDodecahedron();
    }
    else if (picture == "icosahedron") {
        shape = drawIcosahedron();
    }
    else if (picture == "sphere") {
        shape = drawSphere(3);
    }
    
    positions = shape.positions;
    colors = shape.colors;
    numPositions = shape.numVertices;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

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

    thetaLoc = gl.getUniformLocation(program, "uTheta");
    
    // Set up projection matrix (perspective view)
    projectionLoc = gl.getUniformLocation(program, "uProjection");
    var aspect = canvas.width / canvas.height;
    var projection = perspective(45.0, aspect, 0.1, 100.0);
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projection));
    
    // Set up modelview matrix (move camera back)
    modelViewLoc = gl.getUniformLocation(program, "uModelView");
    var modelView = lookAt(vec3(0, 0, 5), vec3(0, 0, 0), vec3(0, 1, 0));
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(modelView));

    //event listeners for buttons

    document.getElementById( "xButton" ).onclick = function () {
        axis = xAxis;
        speed = 2.0;
    };
    document.getElementById( "yButton" ).onclick = function () {
        axis = yAxis;
        speed = 2.0;

    };
    document.getElementById( "zButton" ).onclick = function () {
        axis = zAxis;
        speed = 2.0;

    };

     document.getElementById( "stop" ).onclick = function () {
        axis = zAxis;
        speed = 0.0;

    };

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
    
    var faceColors = [
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(0.0, 1.0, 1.0, 1.0)   // cyan
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
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 1.0, 0.0, 1.0)   // yellow
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
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(0.0, 1.0, 1.0, 1.0),  // cyan
        vec4(1.0, 0.5, 0.0, 1.0),  // orange
        vec4(0.5, 0.0, 0.5, 1.0)   // purple
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
    requestAnimationFrame(render);
}