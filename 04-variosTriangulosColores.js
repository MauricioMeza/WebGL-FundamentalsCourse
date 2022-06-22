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
    var canvas = document.getElementById("canvas_04");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);

    //Crear Buffer con informacion aleatoria de coordenadas de cada los triangulos
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var positions = [];
    for(var i=0; i<50; i++){
        for(var j=0; j<3; j++){
            positions.push(rand());
            positions.push(rand());
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    //Crear Buffer con informacion aleatoria de color de cada los triangulos
    var colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var colors = [];
    for(var i=0; i<(50*3); i++){
        colors.push(Math.random());
        colors.push(Math.random());
        colors.push(Math.random());
        colors.push(1);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);

    //Definir Propiedades de la Pantalla
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1,1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Una sola Llamada de Dibujo para todos los triangulos
    gl.drawArrays(gl.TRIANGLES, 0, positions.length/2)
}

function rand(){
    return (Math.random() * 2) -1;
}