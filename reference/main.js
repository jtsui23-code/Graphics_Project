let transforms = [];

let mat4 = glMatrix.mat4;
let vec3 = glMatrix.vec3;
let vec4 = glMatrix.vec4;
var yaw = 0;
var pitch = 0;

// var camera = {
//     dir: vec3.fromValues([0, 0, 0]), // yaw, pitch, roll
//     up: vec3.fromValues([0, 1, 0]),
//     eye: vec3.fromValues([0, 0, 1]), 
// };

var camera = {
    pitch: -Math.PI/2,  // yaw, pitch, roll
    up: [0, 1, 0],
    eye: [0, 0, 1], 
};

function generateTransforms() {
    materialKeys = Object.keys(materials);
    for (let i = 0; i < 50; i++) {
        scale = .3 * getDelta(0.1, 3);
        
        scales = [scale, scale, scale];

        angles = [
            getDelta(0, 360) * (Math.PI / 180), 
            getDelta(0, 360) * (Math.PI / 180), 
            getDelta(0, 360) * (Math.PI / 180)
        ];

        translations = [
            getDelta(-20, 20),
            getDelta(-20, 20),
            getDelta(-1, -50), 
        ];

        transforms.push(
            {
                'scales': scales, 
                'angles': angles, 
                'translations': translations, 
                'material': materialKeys[Math.floor(Math.random() * Object.keys(materials).length)]

            }
        )
    }
}

// var eye = []; 
// var at = [];
// var up = []

function forward() {
    
    dir = [Math.cos(camera.pitch), 0, Math.sin(camera.pitch)];
    // console.log(dir);
    vec3.scaleAndAdd(camera.eye, camera.eye, dir, 0.5);

    // console.log(camera.eye);
    render();
}

function backward() {
    dir = [Math.cos(camera.pitch), 0, Math.sin(camera.pitch)];
    // console.log(dir);
    vec3.scaleAndAdd(camera.eye, camera.eye, dir, -0.5);

    // console.log(camera.eye);
    render();
}

function lookLeft() {
    console.log(camera.pitch);
    camera.pitch += Math.PI/500;
    render();
}

function lookRight() {
    console.log(Math.PI);
    console.log(camera.pitch);
    camera.pitch -= Math.PI/500;
    console.log(camera.pitch);
    render();
}

// function sideleft() {
//     vec3.add(view.dir, view.dir, vec3.fromValues(0, -Math.PI * 0.01, 0));
// }

// function sideRight() {
//     vec3.add(view.dir, view.dir, vec3.fromValues(0, Math.PI * 0.01, 0));
// }


// function getViewMatrix() {
//     at = vec3.create();
//     viewMatrix = mat4.create();
//     vec3.add(at, view.dir, view.eye);
//     gl.lookAt(viewMatrix, view.eye, at, view.up);

//     return viewMatrix;
// }
// Get WebGL context
const canvas = document.getElementById('webglCanvas');
const gl = canvas.getContext('webgl');



// var lightPosition = vec4(1.0, 1.0, 1.0, 0.0);
// var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
// var lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
// var lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

// var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
// var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
// var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
// var materialShininess = 100.0;

// Vertex Shader Code
const vsSource = `
    precision mediump float;
    vec4 lp = vec4(10.0, 0.0, 1.0, 1.0); 
    vec4 ld = vec4(1.0, 1.0, 1.0, 1.0); 
    vec4 ls = vec4(1.0, 1.0, 1.0, 1.0);
    vec4 la = vec4(0.5, 0.5, 0.5, 1.0);

    uniform vec4 kd, ks, ka;
    uniform float shininess;
    
    attribute vec4 a_position;
    attribute vec4 a_normal;

    varying vec4 color;
    uniform mat4 model, view, proj;
    
    
    void main() {
        vec4 position = view * model * a_position;
        vec4 L = normalize(lp - position);
        vec4 V = normalize(vec4(0, 0, 0, 1) - position);
        vec4 N = normalize(view * model * vec4(a_normal.xyz, 0));
        vec4 H = normalize(L + V);

        
        vec4 diffusedComponent = kd * ld * max(dot(L, N), 0.0);
        vec4 specularComponent = ks * ls * pow(max(dot(H, N), 0.0), shininess);
        vec4 ambiantComponent  = ka * la;

        color = diffusedComponent + specularComponent + ambiantComponent;
        gl_Position = proj * position;
    }
`;

// Fragment Shader Code
const fsSource = `
    precision mediump float;
    varying vec4 color;
    void main() {
        gl_FragColor = vec4(color.xyz, 1.0);
        //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red color
    }
`;

CubeWithMaterial();

const program = createProgram(vsSource, fsSource);

setBuffer(program, positions, "a_position");
setBuffer(program, normals, "a_normal");

// Get uniform location for mat3 and send it to the shader

const kd = gl.getUniformLocation(program, "kd");
const ks = gl.getUniformLocation(program, "ks");
const ka = gl.getUniformLocation(program, "kd");
const shininess = gl.getUniformLocation(program, "shininess");



// Get uniform location for mat3 and send it to the shader
const modelMatrix = gl.getUniformLocation(program, "model");
const viewMatrix = gl.getUniformLocation(program, "view");
const projMatrix = gl.getUniformLocation(program, "proj");

function init() {
    // initial rendering
    generateTransforms();
    console.log(transforms);
}

// our focus for today
function render() {
    // Clear the canvas and draw the rotated square
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);


    
    // Create a new 4x4 matrix from the translation vector.
    // var model = mat4.create();
    // console.log("init model", model);


    for (let i = 0; i < transforms.length; i++) {
        var model = mat4.create();

        mat4.translate(model, model, transforms[i]['translations']);
        
        mat4.rotateZ(model, model, transforms[i]['angles'][0]);
        mat4.rotateY(model, model, transforms[i]['angles'][1]);
        mat4.rotateX(model, model, transforms[i]['angles'][2]);
        // console.log('done rotation');

        mat4.scale(model, model, transforms[i]['scales']);
        // console.log('done scaling');

        gl.uniform4f(ka, false, ...materials[transforms[i]['material']].Ambient);
        gl.uniform4f(ks, false, ...materials[transforms[i]['material']].Specular);
        gl.uniform4f(kd, false, ...materials[transforms[i]['material']].Diffuse);
        gl.uniform1f(shininess, materials[transforms[i]['material']].Shininess);

        // console.log(materials[transforms[i]['material']]);


        // var materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
        // var materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
        // var materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
        // var materialShininess = 100.0;

        // gl.uniform4f(ka, false, 1.0, 0.0, 1.0, 1.0);
        // gl.uniform4f(ks, false, 1.0, 0.8, 0.0, 1.0);
        // gl.uniform4f(kd, false, 1.0, 0.8, 0.0, 1.0);
        // gl.uniform1f(shininess, 100);



        

        viewM = mat4.create();
        lookAt = vec3.create();
        dir = vec3.fromValues(Math.cos(camera.pitch), 0, Math.sin(camera.pitch));
        mat4.lookAt(viewM, camera.eye, vec3.add(lookAt, camera.eye, dir), camera.up);
   
    
        
        var proj = mat4.create();
        mat4.perspective(proj, Math.PI/2, 1, .01, 100);
        // mat4.ortho(proj, -25, 25, -25, 25, .01, 100);
        // console.log(proj)

        // update the transformation matrix
        // Send the updated rotation matrix to the shader
        gl.uniformMatrix4fv(modelMatrix, false, model);
        gl.uniformMatrix4fv(viewMatrix, false, viewM);
        gl.uniformMatrix4fv(projMatrix, false, proj);
        gl.drawArrays(gl.TRIANGLES, 0, numPositions); // Draw square (2 triangles)

    }

}


document.getElementById("btnInit").addEventListener("click", init);
document.getElementById("btnRender").addEventListener("click", render);
document.getElementById("btnForward").addEventListener("click", forward);
document.getElementById("btnBackward").addEventListener("click", backward);
document.getElementById("btnLookLeft").addEventListener("click", lookLeft);
document.getElementById("btnLookRight").addEventListener("click", lookRight);

