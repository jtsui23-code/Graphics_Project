

let canvas = document.getElementById('myCanvas');

gl = canvas.getContext('webgl');

let verticies = [
    -0.5,0.5,0.0,
    -0.5,-0.5,0.0,
    0.5,-0.5,0.0,
];

let roof = [
   -1.0, 0.0, 0.0,
    
    // Vertex 2 (right base corner)
     1.0, 0.0, 0.0,
    
    // Vertex 3 (top peak)
     0.0,  0.15, 0.0
]

let skyColor = [0.396, 0.6901, 1.0 ,1.0]
let brickColor = [1.0, 0.91372, 0.65882, 1.0];
let doorColor = [0.0, 0.0, 0.0, 1.0]

let brickColor2 = [1.0, 0.435294, 0.38039, 1.0];
let roofColor = [1.0, 0.51764, 0.5529411, 0.72];


let color = [0.6431, 0.6431, 0.6431, 1.0];

let brickSize = 0.15;
let doorSize = 0.4;


// let color2 = [0.2, 0.0, 0.75, 1.0]

// console.log(rotateTriangle(verticies));
// let triangle2 = rotateTriangle(verticies);


gl.clearColor(0.5, 0.5, 0.5, 0.9);
gl.enable(gl.DEPTH_TEST);
gl.clear(gl.COLOR_BUFFER_BIT);


// Doors -----------------------------------



makeRectangle(gl, 0.1, -0.6, doorSize/2, doorColor, doorSize);

makeRectangle(gl, 0.65, -0.6, doorSize/2, doorColor, doorSize);

makeRectangle(gl, -0.45, -0.6, doorSize/2, doorColor, doorSize);

// ------------------------------------------


// Brick ----------------------------------------
let offset = 0;

for (let i = 0; i < 10; i++){

    let color = brickColor;

    if (i % 3 == 0){
        color = brickColor2
    }
    makeRectangle(gl, -0.99, -0.93 + offset, brickSize, color);
    offset += 0.1

}


offset = 0;
for (let i = 0; i < 10; i++){
    let color = brickColor;

    if (i % 2 == 0){
        color = brickColor2
    }
    makeRectangle(gl, -0.8, -0.93 + offset, brickSize, color);
    offset += 0.1

}

offset = 0;
for (let i = 0; i < 10; i++){

    let color = brickColor;

    if (i % 5 == 0){
        color = brickColor2
    }

    makeRectangle(gl, -0.6, -0.93 + offset, brickSize/2, color, brickSize/2);
    offset += 0.1

}

offset = 0;
for (let i = 0; i < 5; i++){
    let color = brickColor;

    if (i % 2 == 0){
        color = brickColor2
    }
    makeRectangle(gl, -0.5, -0.029 - offset, brickSize, color);
    offset += 0.1

}

offset = 0;
for (let i = 0; i < 5; i++){

    let color = brickColor;

    if (i % 3 == 0){
        color = brickColor2
    }

    makeRectangle(gl, -0.33, -0.029 - offset, brickSize/2 - 0.02, color, brickSize/2);
    offset += 0.1

}

offset = 0;
for (let i = 0; i < 10; i++){

    let color = brickColor;

    if (i % 3 == 0){
        color = brickColor2
    }

    makeRectangle(gl, -0.18, -0.93 + offset, brickSize, color);
    offset += 0.1

}


offset = 0;
for (let i = 0; i < 10; i++){

    let color = brickColor;

    if ((i + 1) % 2 == 0){
        color = brickColor2
    }

    makeRectangle(gl, -0.017, -0.029 - offset, brickSize/2 - 0.02, color, brickSize/2);
    offset += 0.1

}


offset = 0;
for (let i = 0; i < 5; i++){

    let color = brickColor;

    if (i % 3 == 0){
        color = brickColor2
    }

    makeRectangle(gl, 0.07, -0.029 - offset, brickSize, color);
    offset += 0.1

}

offset = 0;
for (let i = 0; i < 5; i++){

    let color = brickColor;

    if (i % 2 == 0){
        color = brickColor2
    }

    makeRectangle(gl, 0.25, -0.029 - offset, brickSize/2 - 0.04, color, brickSize/2);
    offset += 0.1

}


offset = 0;
for (let i = 0; i < 10; i++){

    let color = brickColor;

    if ((i+1) % 3 == 0){
        color = brickColor2
    }

    makeRectangle(gl, 0.38, -0.029 - offset, brickSize/2 + 0.02, color, brickSize/2);
    offset += 0.1

}

offset = 0;
for (let i = 0; i < 10; i++){

    let color = brickColor;

    if (i % 3 == 0){
        color = brickColor2
    }

    makeRectangle(gl, 0.5, -0.029 - offset, brickSize/2, color, brickSize/2);
    offset += 0.1

}

offset = 0;
for (let i = 0; i < 5; i++){

    let color = brickColor;

    if (i % 2 == 0){
        color = brickColor2
    }

    makeRectangle(gl, 0.67, -0.029 - offset, brickSize/2, color, brickSize/2);
    offset += 0.1

}

offset = 0;
for (let i = 0; i < 5; i++){

    let color = brickColor;

    if (i % 3 == 0){
        color = brickColor2
    }

    makeRectangle(gl, 0.77, -0.029 - offset, brickSize/2 + 0.04, color, brickSize/2);
    offset += 0.1

}


offset = 0;
for (let i = 0; i < 10; i++){

    let color = brickColor;

    if ((i + 1) % 2 == 0){
        color = brickColor2
    }

    makeRectangle(gl, 0.91, -0.029 - offset, brickSize/2, color, brickSize/2);
    offset += 0.1

}


// ----------------------------------------------

// Gray broder -----------------------
makeSquare(gl, -1.0, -0.5, 0.5, color);
makeSquare(gl, -1.0, 0.0, 0.5, color);

makeSquare(gl, -0.75, 0.0, 0.5, color);
makeSquare(gl, -0.8, 0.0, 0.5, color);

makeSquare(gl, -0.2, -0.0, 0.5, color);

makeSquare(gl, -0.2, -0.5, 0.25, color);
makeSquare(gl, -0.2, -0.75, 0.25, color);

makeSquare(gl, 0.35, -0.75, 0.25, color);
makeSquare(gl, 0.35, -0.5, 0.25, color);

makeSquare(gl, 0.35, -0.25, 0.25, color);
makeSquare(gl, 0.35, 0.0, 0.25, color);

makeSquare(gl, 0.65, 0.0, 0.5, color);

makeSquare(gl, 0.9, -0.5, 0.5, color);

// -----------------------------------------

// Roof -----------------------------------------
makeTriangle(gl, roof, roofColor)

// ----------------------------------------------


// Sky -------------------------------------

makeSquare(gl, -1.0, 2.0, 2.0, skyColor);


// -----------------------------------------







