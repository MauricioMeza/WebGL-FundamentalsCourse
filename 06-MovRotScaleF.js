//-------------------------------------
//----------VertexShader---------------
//-------------------------------------
vert_shader = glsl`
    //receive data from Buffer into gl_position (pos of current vertex)
    attribute vec2 a_position;
    attribute vec3 a_color;
    uniform vec2 u_translation;
    uniform vec2 u_scaling;
    uniform vec2 u_rotating;
    varying vec3 v_color;

    void main() {
        v_color = a_color;
        vec2 translate =  a_position + u_translation;
        vec2 scale = vec2(translate.x * u_scaling.x, translate.y * u_scaling.y);
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
     //Turn pixel into the uniform color
    uniform vec4 u_color; 
    varying vec3 v_color;

    void main() {
    gl_FragColor = vec4(v_color, 1.0); 
    }
`;

//-------------------------------------
//----------WebGL_JS_Code-------------
//-------------------------------------
main();
//Main Function
function main(){
    //Get canvas, context and programs
    var canvas = document.getElementById("canvas_06");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);

    //Create info buffer
    var colorAttributeLocation = gl.getAttribLocation(program, "a_color")
    var colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    const fCol = createFColors();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fCol), gl.STATIC_DRAW);  
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    var positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const f = createF(0, 0, 0.3, 0.5, 0.08);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(f), gl.STATIC_DRAW);  
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    
    var translateUniformLocation = gl.getUniformLocation(program, "u_translation")
    gl.uniform2f(translateUniformLocation, 0.0, 0.0);
    var scaleUniformLocation = gl.getUniformLocation(program, "u_scaling")
    gl.uniform2f(scaleUniformLocation, -1.0, 1.0);
    var rotateUniformLocation = gl.getUniformLocation(program, "u_rotating")
    var rot = Math.PI;
    gl.uniform2f(rotateUniformLocation, Math.sin(rot), Math.cos(rot));
    
    //Deifine Screen
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1,1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Draw
    gl.drawArrays(gl.TRIANGLES, 0, f.length/2)
}