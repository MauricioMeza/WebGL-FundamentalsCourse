//-------------------------------------
//----------VertexShader---------------
//-------------------------------------
vert_shader = glsl`
    attribute vec4 a_position;
    attribute vec2 a_tex_coord;
    uniform mat4 u_matrix_perspective;
    uniform mat4 u_matrix_view;
    uniform mat4 u_matrix_transform;
    varying vec2 v_tex_coord;

    void main() {
        v_tex_coord = a_tex_coord;
        gl_Position = u_matrix_perspective * u_matrix_view * u_matrix_transform * a_position;
    }

`;

//-------------------------------------
//----------FragmentShader-------------
//-------------------------------------
frag_shader = glsl`
    precision mediump float;
    varying vec2 v_tex_coord;
    uniform sampler2D u_texture;

    void main() {
        gl_FragColor = texture2D(u_texture, v_tex_coord); 
    }
`;

//-------------------------------------
//----------WebGL_JS_Code-------------
//-------------------------------------

main();


//Main Function
function main(){
    //Cargar el canvas y los shaders
    var canvas = document.getElementById("canvas_15");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);

    //Crear Buffer de Coordenadas de Textura (Coordenadas UV)
    var colorAttributeLocation = gl.getAttribLocation(program, "a_tex_coord")
    var colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    const cols = create3DFTextureCoords();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cols), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 2, gl.FLOAT, false, 0, 0)
    
    //Crear Buffer de Geometria
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    var positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const F = create3DF();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(F), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    //Definir la Textura, Configurarla y cargar Imagen HTML en esta
    var texture = gl.createTexture();
    var image = new Image();
    image.src = "cuy.jpg";
    image.addEventListener('load', () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        //Ajustes de la textura cuando la imagen no tiene tamaño como potencia de 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        //Definir tipo y formato de la imagen
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
    });


    //Crear Uniforme con Matriz de Perspectiva (Near, Far, FOV)
    const perspectiveMatrix = getMatrix3DPerspective(0.01, 100, 0.85);
    var perspectiveUniformLocation = gl.getUniformLocation(program, "u_matrix_perspective")
    gl.uniformMatrix4fv(perspectiveUniformLocation, false, perspectiveMatrix);

    //Crear Uniforme con Matriz de Vista (Tx,Ty,Tz,  Rx,Ry  Zoom)
    const viewMatrix = getMatrix3DView(0, 0, 0,   -0.5, 1.2,  2);
    var viewUniformLocation = gl.getUniformLocation(program, "u_matrix_view");
    gl.uniformMatrix4fv(viewUniformLocation, false, viewMatrix);
    
    //Definir Propiedades de la Pantalla y Modo de Renderizacion
    gl.enable(gl.DEPTH_TEST) 
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1,1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT);


    //Funcion de Animacion
    var Ry = 0;
    requestAnimationFrame(anim);
    function anim(){
        gl.clear(gl.COLOR_BUFFER_BIT);
        //Cambio de Rotacion para Animacion del Objetos
        Ry += 0.01;

        //Cargar Uniforme de la Matriz de Tranformacion (Tx,Ty,Tz, Sx,Sy,Sz, Rx,Ry,Rz)
        const transformMatrix = getMatrix3DTransform(0, .5, 0,   2.5, 2.5, 2.5,   0, Ry, 3.14);
        var translateUniformLocation = gl.getUniformLocation(program, "u_matrix_transform")
        gl.uniformMatrix4fv(translateUniformLocation, false, transformMatrix);

        //Llamada de Dibujo
        gl.drawArrays(gl.TRIANGLES, 0,  F.length/3)
        requestAnimationFrame(anim);
    }        
}

