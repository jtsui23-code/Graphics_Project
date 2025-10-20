let mat4 = glMatrix.mat4;
// Get WebGL context
const canvas = document.getElementById('webglCanvas');
const gl = canvas.getContext('webgl');

function getDelta(min, max) {
  return Math.random() * (max - min) + min;
}

// Vertex Shader Code
const vsSource = `
    attribute vec4 a_position;
    uniform mat4 u_matrix;
    
    void main() {
        gl_Position = u_matrix * a_position;
    }
`;

// Fragment Shader Code

const fsSource = `
    void main() {
        gl_FragColor = vec4(0.10196078, 0.2235294, 0.65882352, 1.0); // Red color
    }
`;



const program = createProgram(vsSource, fsSource);

// Set up buffers for a simple square (2 triangles)
// const vertices = new Float32Array([
//     -0.01, -0.01, 0.0, 1.0,  // Bottom-left
//      0.01, -0.01, 0.0, 1.0,  // Bottom-right
//     -0.01,  0.01, 0.0, 1.0,  // Top-left
//      0.01,  0.01, 0.0, 1.0  // Top-right
// ]);

// Set up buffers for a simple square (2 triangles)

const vertices = new Float32Array([
    -0.5,  0.5, 0.0, 1.0,  // Top-left
    -0.5, -0.5, 0.0, 1.0,  // Bottom-left
     0.5, -0.5, 0.0, 1.0,  // Bottom-right
    
    -0.5,  0.5, 0.0, 1.0,  // Top-left
     0.5,  0.5, 0.0, 1.0,  // Top-right
     0.5, -0.5, 0.0, 1.0,  // Bottom-right
]);




// configure communication with GPU
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

// Get attribute location and enable it
const positionAttribLocation = gl.getAttribLocation(program, "a_position");
gl.vertexAttribPointer(positionAttribLocation, 4, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionAttribLocation);


// Get uniform location for mat3 and send it to the shader
const matrixUniformLocation = gl.getUniformLocation(program, "u_matrix");



let rainDrop = 100;
let translateX = [];
let posY = [];
let speed = [];
let scale = [];
let angle = []
let angleSpeed = []

for (let i = 0; i < rainDrop; i++) {
    translateX[i] = getDelta(-1, 1);     // random X position
    posY[i] = getDelta(0.5, 1.0);        // start between middle and top
    speed[i] = getDelta(0.005, 0.02);    // random fall speed
    scale[i] = getDelta(0.01, 0.03);     // random size

    angle[i] = getDelta(0, 360) * (Math.PI/180);
    angleSpeed[i] = getDelta(0, 0.10);
}


y = 1;



// our focus for today
function render() {
    // Clear the canvas and draw the rotated square
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


   

    for (let i = 0; i < rainDrop; i ++)
    {
        
    
        // Create a new 4x4 matrix from the translation vector.
        var model = mat4.create();
        console.log(model);

        // gl.uniformMatrix4fv(matrixUniformLocation, false, model);
        // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6); // Draw square (2 triangles)

        translationVector = [getDelta(0, 0), getDelta(0, -.5), getDelta(0, 0)]
        


         if (posY[i] < -1.2) {
            posY[i] = 1.0;
            translateX[i] = getDelta(-1, 1);
            speed[i] = getDelta(0.005, 0.02);
        }

        mat4.translate(model, model, [translateX[i], posY[i], 0]);

        posY[i] -= speed[i];


        mat4.scale(model, model, [scale[i], scale[i], 1]);
        
        
        mat4.rotateZ(model, model, angle[i]);

        angle[i] += angleSpeed[i];


        // update the transformation matrix
        // Send the updated rotation matrix to the shader
        gl.uniformMatrix4fv(matrixUniformLocation, false, model);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6); // Draw square (2 triangles)


    }

    setTimeout(() => {
        render();
        }, 100);
}


document.getElementById("renderBtn").addEventListener("click", render);