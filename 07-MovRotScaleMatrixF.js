//-------------------------------------
//----------VertexShader---------------
//-------------------------------------
vert_shader = glsl`
    //receive data from Buffer into gl_position (pos of current vertex)
    attribute vec2 a_position;
    uniform mat3 u_matrix;
 
    void main() {
        vec3 position = u_matrix * vec3(a_position, 1.0);
        gl_Position = vec4(position.xy, 0.0, 1.0);
    }

`;

//-------------------------------------
//----------FragmentShader-------------
//-------------------------------------
frag_shader = glsl`

precision mediump float;
     //Turn pixel into the uniform color
    uniform vec4 u_color; 

    void main() {
    gl_FragColor = u_color; 
    }
`;

//-------------------------------------
//----------WebGL_JS_Code-------------
//-------------------------------------
main();



//Main Function
function main(){
    //Get canvas, context and programs
    var canvas = document.getElementById("canvas_07");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);

    //Create info buffer
    var colorUniformLocation = gl.getUniformLocation(program, "u_color")
    gl.uniform4f(colorUniformLocation, 1, 0, 0.5, 1);

    const matrix = getMatrix2D(0.1, -0.1, -2, 2, Math.PI*0.3);
    var translateUniformLocation = gl.getUniformLocation(program, "u_matrix")
    gl.uniformMatrix3fv(translateUniformLocation, false, matrix);

    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    var positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const f = createF(0, 0, 0.3, 0.5, 0.08);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(f), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
    //Deifine Screen
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1,1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Draw
    gl.drawArrays(gl.TRIANGLES, 0, f.length/2)
}
