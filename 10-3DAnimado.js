//-------------------------------------
//----------VertexShader---------------
//-------------------------------------
vert_shader = glsl`
    attribute vec4 a_position;
    attribute vec4 a_color;
    uniform mat4 u_matrix_perspective;
    uniform mat4 u_matrix_view;
    uniform mat4 u_matrix_transform;
    varying vec4 v_color;

    void main() {
        v_color = a_color;
        gl_Position = u_matrix_perspective * u_matrix_view * u_matrix_transform * a_position;
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
    var canvas = document.getElementById("canvas_11");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);

    //Crear Buffer de Color con Colores definidos para cada cara de la geometria
    var colorAttributeLocation = gl.getAttribLocation(program, "a_color")
    var colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    const cols = create3DFColors();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cols), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0)
    
    //Crear Buffer de Geometria con coordenadas definidas en 3D
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    var positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const F = create3DF();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(F), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    //Crear Uniforme con Matriz de Perspectiva (Near, Far, FOV)
    const perspectiveMatrix = getMatrix3DPerspective(0.01, 100, 0.85);
    var perspectiveUniformLocation = gl.getUniformLocation(program, "u_matrix_perspective")
    gl.uniformMatrix4fv(perspectiveUniformLocation, false, perspectiveMatrix);

    //Definir Propiedades de la Pantalla y Modo de Renderizacion
    gl.enable(gl.DEPTH_TEST) 
    gl.enable(gl.CULL_FACE)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1,1,1,1)
    
    //Declarar Funcion que cambia el Objeto y la Escena cada frame y lo dibuja en pantalla
    var Ry = 0;
    requestAnimationFrame(animate);
    function animate(){
        Ry += 0.01;
        gl.clear(gl.COLOR_BUFFER_BIT);   
        
        //Crear Uniforme con Matriz de Vista cambiante (Tx,Ty,Tz,  Rx,Ry  Zoom)
        const transformMatrix = getMatrix3DTransform(0, 0, 0,   2, 2, 2,   0, Ry, 3.1416);
        var translateUniformLocation = gl.getUniformLocation(program, "u_matrix_transform")
        gl.uniformMatrix4fv(translateUniformLocation, false, transformMatrix);

        //Crear Uniforme con Matriz de Tranformacion cambiante (Tx,Ty,Tz  Sx,Sy,Sz  Rx,Ry,Rz)
        const viewMatrix = getMatrix3DView(0, 0, 0,   -0.5, 1.2,  2*Math.cos(Ry)+2);
        var viewUniformLocation = gl.getUniformLocation(program, "u_matrix_view");
        gl.uniformMatrix4fv(viewUniformLocation, false, viewMatrix);

        //Llamada de Dibujo para cada Frame
        gl.drawArrays(gl.TRIANGLES, 0, F.length/3)
        requestAnimationFrame(animate);
    }        
}

