//-------------------------------------
//----------VertexShader---------------
//-------------------------------------
vert_shader = glsl`
    //Tranfirmar posicion de cada vertice segun vectores definidos
    attribute vec2 a_position;
    uniform vec2 u_translation;
    uniform vec2 u_scaling;
    uniform vec2 u_rotating;

    void main() {
        vec2 translate =  a_position + u_translation;
        vec2 scale = translate * u_scaling;
        vec2 rotate = vec2( scale.x * u_rotating.y + scale.y * u_rotating.x,
                            scale.y * u_rotating.y - scale.x * u_rotating.x);
        vec4 position = vec4(rotate, 0.0, 1.0);
        gl_Position = position;
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
    //Cargar el canvas y los shaders
    var canvas = document.getElementById("canvas_06");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);

    //Crear Uniforme de Color para toda la figura
    var colorUniformLocation = gl.getUniformLocation(program, "u_color")
    gl.uniform4fv(colorUniformLocation, [1, 0, 0.5, 1])

    //Crear Buffer de Geometria con coordenadas definidas
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    var positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const f = createF(0, 0, 0.3, 0.5, 0.08);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(f), gl.STATIC_DRAW);  
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    //Crear uniformes de Vectores de Tranformacion
    var translateUniformLocation = gl.getUniformLocation(program, "u_translation")
    gl.uniform2f(translateUniformLocation, 0.0, 0.0);
    var scaleUniformLocation = gl.getUniformLocation(program, "u_scaling")
    gl.uniform2f(scaleUniformLocation, -1.0, 1.0);
    var rotateUniformLocation = gl.getUniformLocation(program, "u_rotating")
    var rot = Math.PI;
    gl.uniform2f(rotateUniformLocation, Math.sin(rot), Math.cos(rot));
    
    //Definir propiedades de la pantalla
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1,1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT);

    //LLamada de Dibujo
    gl.drawArrays(gl.TRIANGLES, 0, f.length/2)
}