//-------------------------------------
//----------VertexShader---------------
//-------------------------------------
const glsl = x => x;
const vert_shader = glsl`
    //receive data from Buffer into gl_position (pos of current vertex)
    attribute vec4 a_position;
    attribute vec2 a_texture;
    varying vec2 v_texture;

    void main() {
        v_texture = a_texture;
        gl_Position = a_position;    
    }
`;

//-------------------------------------
//----------FragmentShader-------------
//-------------------------------------
const frag_shader = glsl`

precision mediump float;
     //Turn pixel into the uniform color
    uniform sampler2D u_image;
    varying vec2 v_texture; 

    void main() {
        gl_FragColor = texture2D(u_image, v_texture); 
    }
`;

//-------------------------------------
//----------WebGL_JS_Code-------------
//-------------------------------------
main();

function main(){
    var img = new Image();
    img.onload = function(){
        render(img);
    }
    img.src = "./cuy.jpg";
}

//Main Function
function render(img){
    //Get canvas, context and programs
    var canvas = document.getElementById("canvas");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);

    //Create square buffer
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var positions = [
        -1, 1,
        1, 1,
        1, -1,
        -1, 1,
        -1, -1,
        1, -1
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    //Create texture buffer
    var textureAttributeLocation = gl.getAttribLocation(program, "a_texture");
    var textureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    createRectangle(gl, 0, 0, 1, 1)
    gl.enableVertexAttribArray(textureAttributeLocation)
    gl.vertexAttribPointer(textureAttributeLocation, 2, gl.FLOAT, false, 0, 0)

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    
    //Deifine Screen
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0,0,0,0)
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6)
}

