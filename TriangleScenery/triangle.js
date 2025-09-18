
let canvas = document.getElementById('myCanvas');

gl = canvas.getContext('webgl');


let verticies = [
    -0.5,0.5,0.0,
    -0.5,-0.5,0.0,
    0.5,-0.5,0.0,
];


firstTriangleColor = [1.0, 0.0, 0.0, 1.0];
secondTriangleColor = [0.0, 0.0, 1.0, 1.0];


rotatedVerticies = rotateTriangle(verticies);
makeTriangle(gl, verticies, firstTriangleColor);

makeTriangle(gl, rotatedVerticies, secondTriangleColor);