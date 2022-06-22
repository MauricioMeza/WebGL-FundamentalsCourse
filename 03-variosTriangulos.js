//-------------------------------------
//----------VertexShader---------------
//-------------------------------------
vert_shader = glsl`
    attribute vec4 a_position;
 
    void main() {
        gl_Position = a_position;
    }

`;

//-------------------------------------
//----------FragmentShader-------------
//-------------------------------------
frag_shader = glsl`
    precision mediump float;
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
    var canvas = document.getElementById("canvas_02");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);

    //Declarar los Buffers y Uniformes
    var colorUniformLocation = gl.getUniformLocation(program, "u_color")
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")

    //Definir propiedades de la pantalla
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1,1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT);

    for(var i=0; i<50; i++){
        //Cargar Dinamicamente datos aleatorios de Uniformes (Color)
        gl.uniform4fv(colorUniformLocation, [Math.random(), Math.random(), Math.random(), 1]);

        //Cargar Dinamicamente datos aleatorios de Buffers (Coordenadas)
        var positionBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        var positions = [
            random(), random(),
            random(), random(),
            random(), random()
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
    
        //Un llamado de dibujo por cada triangulo
        gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
}