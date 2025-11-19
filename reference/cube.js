var numPositions  = 36;

var positions = [];
var normals = [];

// var colors = [];

// kd, ks, ka, beta_coefficient 
function CubeWithMaterial()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);

    // quad(0, 1, 2, 3);
    // quad(2, 3, 7, 6);
    // quad(3, 0, 4, 7);
    // quad(6, 5, 1, 2);
    // quad(4, 5, 6, 7);
    // quad(5, 4, 0, 1);

    // I need to add material information
    // it is how the cube will interact with different compoents of light



}


function colorCube()
{
    quad(0, 1, 2, 3);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

function quad(a, b, c, d)
{
    var vertices = [
        [-0.5, -0.5,  -0.5, 1.0],
        [-0.5,  0.5,  -0.5, 1.0],
        [ 0.5,  0.5,  -0.5, 1.0],
        [ 0.5, -0.5,  -0.5, 1.0],
        [-0.5, -0.5,   0.5, 1.0],
        [-0.5,  0.5,   0.5, 1.0],
        [ 0.5,  0.5,   0.5, 1.0],
        [ 0.5, -0.5,   0.5, 1.0],
    ];

    var vertexColors = [
        [0.0, 0.0, 0.0, 1.0],  // black
        [1.0, 0.0, 0.0, 1.0],  // red
        [1.0, 1.0, 0.0, 1.0],  // yellow
        [0.0, 1.0, 0.0, 1.0],  // green
        [0.0, 0.0, 1.0, 1.0],  // blue
        [1.0, 0.0, 1.0, 1.0],  // magenta
        [0.0, 1.0, 1.0, 1.0],  // cyan
        [1.0, 1.0, 1.0, 1.0]   // white
    ];

    let t1 = vec4.create(); 
    vec4.sub(t1, vertices[b], vertices[a]);
   
    let t2 = vec4.create();
    vec4.sub(t2, vertices[c], vertices[b]);
    
    let cross_result = vec4.create(); 
    // vec3.cross(cross_result, t1.slice(0, 3), t2.slice(0, 3));
    vec3.cross(cross_result,  t2.slice(0, 3), t1.slice(0, 3));
    
    // normal = vec3(normal);

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [a, b, c, a, c, d];

    for ( var i = 0; i < indices.length; ++i ) {
        positions.push(...vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );
        normals.push(...cross_result);
        // for solid colored faces use
        // colors.push(...vertexColors[a]);
    }
}
