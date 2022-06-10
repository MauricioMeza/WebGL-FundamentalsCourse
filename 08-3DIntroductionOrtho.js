//-------------------------------------
//----------VertexShader---------------
//-------------------------------------
const glsl = x => x;
const vert_shader = glsl`
    //receive data from Buffer into gl_position (pos of current vertex)
    attribute vec4 a_position;
    attribute vec4 a_color;
    uniform mat4 u_matrix;
    varying vec4 v_color;
 
    void main() {
        v_color = a_color;
        gl_Position = u_matrix * a_position;
    }

`;

//-------------------------------------
//----------FragmentShader-------------
//-------------------------------------
const frag_shader = glsl`

precision mediump float;
     //Turn pixel into the uniform color
    varying vec4 v_color;

    void main() {
        gl_FragColor = v_color; 
    }
`;

//-------------------------------------
//----------WebGL_JS_Code-------------
//-------------------------------------
main();


//Main Function
function main(){
    //Get canvas, context and programs
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);

    //Create info buffer
    var colorAttributeLocation = gl.getAttribLocation(program, "a_color")
    var colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    const cols = create3DFColors();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cols), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0)
    
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    var positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const F = create3DF();  
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(F), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    const matrix = getMatrix3DTransform(0, 0, 0,    -1, 1, 1,   .1, 6, 3.1416);
    var translateUniformLocation = gl.getUniformLocation(program, "u_matrix")
    gl.uniformMatrix4fv(translateUniformLocation, false, matrix);
    
    //Deifine Screen
    gl.enable(gl.CULL_FACE)
    gl.enable(gl.DEPTH_TEST)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0,0,0,0)
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Draw
    gl.drawArrays(gl.TRIANGLES, 0, F.length/3)
}
