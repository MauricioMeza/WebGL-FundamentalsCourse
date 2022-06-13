//-------------------------------------
//----------VertexShader---------------
//-------------------------------------
vert_shader = glsl`
    //receive data from Buffer into gl_position (pos of current vertex)
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
     //Turn pixel into the uniform color
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
    //Get canvas, context and programs
    var canvas = document.getElementById("canvas_15");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);

    //Create info buffer
    var colorAttributeLocation = gl.getAttribLocation(program, "a_tex_coord")
    var colorBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
    const cols = create3DFTextureCoords();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cols), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.vertexAttribPointer(colorAttributeLocation, 2, gl.FLOAT, false, 0, 0)
    
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    var positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const F = create3DF();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(F), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    //Define texture
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));

    var image = new Image();
    image.src = "cuy.jpg";
    image.addEventListener('load', () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        //Ajusting texture to WebGL power of 2
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
        //Pre-generate different size textures
    });

    //Define Perspective Matrix
    const perspectiveMatrix = getMatrix3DPerspective(0.01, 100, 0.85);
    var perspectiveUniformLocation = gl.getUniformLocation(program, "u_matrix_perspective")
    gl.uniformMatrix4fv(perspectiveUniformLocation, false, perspectiveMatrix);
    
    //Deifine Screen
    gl.enable(gl.DEPTH_TEST) 
    gl.enable(gl.CULL_FACE)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1,1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT);

    var Ry = 0;
    requestAnimationFrame(anim);
    //Draw
    function anim(){
        gl.clear(gl.COLOR_BUFFER_BIT);
        Ry += 0.01;
        drawF(gl, program, F.length/3, {x:0, y:.5, z:0, sx:2.5, sy:2.5, sz:2.5, rx:0, ry:Ry, rz:3.1416});
        requestAnimationFrame(anim);
    }        
}

function drawF(gl, program, num, t){
    //Define Transformation Matrix
    const transformMatrix = getMatrix3DTransform(t.x, t.y, t.z,   t.sx, t.sy, t.sz,   t.rx, t.ry, t.rz);
    var translateUniformLocation = gl.getUniformLocation(program, "u_matrix_transform")
    gl.uniformMatrix4fv(translateUniformLocation, false, transformMatrix);

    //Define View Matrix
    const viewMatrix = getMatrix3DView(0, 0, 0,   -0.5, 1.2,  2);
    var viewUniformLocation = gl.getUniformLocation(program, "u_matrix_view");
    gl.uniformMatrix4fv(viewUniformLocation, false, viewMatrix);

    gl.drawArrays(gl.TRIANGLES, 0, num)
}


