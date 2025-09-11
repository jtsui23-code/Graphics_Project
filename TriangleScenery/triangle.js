
function makeSquare(gl, x, y, width, color, height=width){
    x2 = x;
    y2 = y - height;

    x3 = x + width;
    y3 = y - height;
    

    tempVerticies = [
        x, y, 0.0,
        x2, y2, 0.0,
        x3, y3, 0.0
    ]

    console.log("These are the points I am trying to invert:", tempVerticies)

    rotatedVerticies = rotateTriangle(tempVerticies);

    verticies = [... tempVerticies, ...rotatedVerticies]

    // console.log(verticies)

    makeTriangle(gl, verticies, color, indices=[0,1,2,3,4, 5]);

    console.log("Rotated Points:", rotatedVerticies)


    // makeTriangle(gl, tempVerticies, color);

    // makeTriangle(gl, rotatedVerticies, color);
}
    
function makeRectangle(gl, x, y, width, color, height=0){

    squareWidth = width / 2;

    if (height == 0){
        height = squareWidth;
    }
    makeSquare(gl, x, y, squareWidth, color, height);
    makeSquare(gl, x + squareWidth, y, squareWidth, color, height)
}

function moveTriangle(gl, verticies, x, y, color){

    let movedTriangle = [...verticies];

    movedTriangle[0] += x;
    movedTriangle[3] += x;
    movedTriangle[6] += x;

    movedTriangle[1] += y;
    movedTriangle[4] += y;
    movedTriangle[7] += y;

    console.log(`Moved triangle by ${x}`)

    gl.clearColor(0.5, 0.5, 0.5, 0.9);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT);

    makeTriangle(gl, movedTriangle, color);
}


function rotateTriangle(verticies){

    let rotatedTriangle = [...verticies];

    rotatedTriangle[3] = rotatedTriangle[6];
    rotatedTriangle[4] = rotatedTriangle[1];
    

    return rotatedTriangle;

}


function makeTriangle(gl, verticies, color, indices = [0, 1, 2]) {

    function createBuffer() {

    }

    // Buffer to store the verticies of the triangle to be used in the GPU
    let vertexBuffer = gl.createBuffer();

    // Tell GPU gl.ARRAY_BUFFER is vertexBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Filling the buffer with the verticies which needs to be converted to a number to be used in the 
    // GPU. gl.STATIC_DRAW tells webgl that the verticies data won't change much.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verticies), gl.STATIC_DRAW);


    // Unbind ARRAY_BUFFER from vertexBuffer so another variable can be used with it instead.
    gl.bindBuffer(gl.ARRAY_BUFFER, null);


    let indexBuffer = gl.createBuffer(indices);


    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Converting the indices to unsigned Type Array for the GPU to process the indicies 
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);


    // ------------------- Shaders -------------------

    // let vertexCode = 
    //     'attribute vec3 coordinates;' + 
    //     // Imagine this is like main function in c++  and gl can compile this string 
    //     'void main(void) {' + 
    //     'updated_coordinates = vec4(coordinates.x + 1, coordinates.y + 1, coordinates.z, 1.0);'
    //     'gl_Position = updated_coordinates; //vec4(coordinates, 1.0);' + 

    //     '}';

    let vertexCode =
    // vec3 is like a class that is an array of 3 size

    'attribute vec3 coordinates;' +
	// Imagine this is like main function in c++  and gl can compile this string 

   'void main(void) {' +
      ' gl_Position = vec4(coordinates, 1.0);' +
   '}';

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);

    gl.shaderSource(vertexShader, vertexCode);

    gl.compileShader(vertexShader);


    let fragmentCode = 
    // RGBA but normalized so range of 0.0 - 1.0
    `void main(void) {  
        gl_FragColor = vec4(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]}); }`;

    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(fragmentShader, fragmentCode);

    gl.compileShader(fragmentShader);


    // Shader Program stores both of the shader code
    let shaderProgram = gl.createProgram();

    gl.attachShader(shaderProgram, vertexShader);

    gl.attachShader(shaderProgram, fragmentShader);

    gl.linkProgram(shaderProgram);

    gl.useProgram(shaderProgram);


    // Applying shaders to buffer objects

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Get the location of the shader 

    let coordinates = gl.getAttribLocation(shaderProgram, "coordinates");

    gl.vertexAttribPointer(coordinates, 3, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(coordinates);





    gl.viewport(0,0, canvas.width, canvas.height);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0)
}