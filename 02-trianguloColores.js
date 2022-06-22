//-------------------------------------
//----------VertexShader---------------
//-------------------------------------
vert_shader = glsl`
    attribute vec4 a_position;
    attribute vec4 a_color;
    varying vec4 v_color;
 
    void main() {
        gl_Position = a_position;
        v_color = a_color;
    }

`;

//-------------------------------------
//----------FragmentShader-------------
//-------------------------------------
frag_shader = glsl`
    precision mediump float;
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
    //Cargar el canvas y los shaders
    var canvas = document.getElementById("canvas_03");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);

    //Definir Buffer de Coordenadas
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    var positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var positions = [
        0, 0,
        0, 0.5,
        0.7, 0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    //Definir Buffer de Color
    var colorAttributeLocation = gl.getAttribLocation(program, "a_color")
    var colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var positions = [
        0, 0, 1,
        0, 1, 0,
        1, 0, 0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    //Definir propiedades de la pantalla
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1,1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Llamado de Dibujo
    gl.drawArrays(gl.TRIANGLES, 0, 3)
}