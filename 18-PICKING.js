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

const vert_shader_picker = glsl`
    attribute vec4 a_position;
    uniform mat4 u_matrix_perspective;
    uniform mat4 u_matrix_view;
    uniform mat4 u_matrix_transform;

    void main() {
        gl_Position = u_matrix_perspective * u_matrix_view * u_matrix_transform * a_position;
    }
`;

//-------------------------------------
//----------FragmentShader-------------
//-------------------------------------
frag_shader = glsl`
    precision mediump float;
    varying vec4 v_color;
    uniform vec4 u_color_mult;

    void main() {
        gl_FragColor = v_color * u_color_mult; 
    }
`;

const frag_shader_picker = glsl`
    precision mediump float;
    uniform vec4 u_id;

    void main() {
        gl_FragColor = u_id; 
    }
`;

//-------------------------------------
//----------WebGL_JS_Code--------------
//-------------------------------------
main();

function main(){
    //Cargar el canvas y los shaders
    var canvas = document.getElementById("canvas_17");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    var programPicker = createProgramFromShaders(gl, vert_shader_picker, frag_shader_picker);
    var oldPickNdx = -1;
    var w = gl.canvas.width;
    var h = gl.canvas.height;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

    //Interaccion del Mouse
    let mouseX = -1;
    let mouseY = -1;
    gl.canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });
    function getMousePixelFrustum(){
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;  
        const top = Math.tan(fov * 0.5) * near;
        const bottom = -top;
        const left = aspect * bottom;
        const right = aspect * top;
        const width = Math.abs(right - left);
        const height = Math.abs(top - bottom);

        const pixelX = mouseX * w / gl.canvas.clientWidth;
        const pixelY = h - mouseY * h / gl.canvas.clientHeight - 1;
        const subLeft = left + pixelX * width / w;
        const subBottom = bottom + pixelY * height / h;
        const subRight = subLeft + (width / w);
        const subTop = subBottom + (height / h);
        const frustumMatrix = matFrustum(subLeft, subRight, subBottom, subTop, near, far)

        return frustumMatrix;
    }
    function getObjectFromPixel(){
        const data = new Uint8Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
        const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);

        if (oldPickNdx >= 0) {
            objs[oldPickNdx].mults.color = [1,1,1,1];
            oldPickNdx = -1;
            canvas.style.cursor = "default";
        }

        if (id > 0) {
            const pickNdx = id - 1;
            oldPickNdx = pickNdx;
            objs[pickNdx].mults.color = [1,1,0,1];
            canvas.style.cursor = "pointer";
        }

    }

    //------- OBJECTS TO DRAW --------
    //Definir Atributos
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    var positionAttributeLocation = gl.getAttribLocation(programPicker, "a_position")
    var colorAttributeLocation = gl.getAttribLocation(program, "a_color")
    
    //Definir Buffers
    var cubePosBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, cubePosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(create3DCube()), gl.STATIC_DRAW);

    var cubeColBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(create3DCubeColors()), gl.STATIC_DRAW);

    var fPosBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, fPosBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(create3DF()), gl.STATIC_DRAW);

    var fColBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, fColBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(create3DFColors()), gl.STATIC_DRAW);

    //Definir Objetos
    var objs = []
    for(var i=0; i<15; i++){
        const id1 = (i*2)+1
        objs.push({
            bufferPos: cubePosBuffer, 
            bufferCol: cubeColBuffer,
            i: [((id1 >>  0) & 0xFF) / 0xFF,
                ((id1 >>  8) & 0xFF) / 0xFF,
                ((id1 >> 16) & 0xFF) / 0xFF,
                ((id1 >> 24) & 0xFF) / 0xFF],
            uniforms: {
                u_matrix_transform: matIdentity()
            },
            pos: {x: 1.5*Math.random(), y: 1.5*Math.random(), z: 1.5*Math.random()} ,
            rot: {x: 3*Math.random(), y: 3*Math.random(), z: 3*Math.random()},
            mults: {x: 2*Math.random(), y:2*Math.random(), color:[1,1,1,1] }
        });
        const id2 = (i*2)+2;
        objs.push({
            bufferPos: fPosBuffer, 
            bufferCol: fColBuffer, 
            i: [((id2 >>  0) & 0xFF) / 0xFF,
                ((id2 >>  8) & 0xFF) / 0xFF,
                ((id2 >> 16) & 0xFF) / 0xFF,
                ((id2 >> 24) & 0xFF) / 0xFF],
            uniforms: {
                u_matrix_transform: matIdentity()
            },
            pos: {x: 1.5*Math.random(), y: 1.5*Math.random(), z: 1.5*Math.random()} ,
            rot: {x: 3*Math.random(), y: 3*Math.random(), z: 3*Math.random()},
            mults: {x: 2*Math.random(), y:2*Math.random(), color:[1,1,1,1] }
        });
    }

    //Define Perspective Matrix values
    var near = 0.01;
    var far = 100;
    var fov = 1.6; 
    const perspectiveMatrix = matPerspectiveAspect(near, far, fov, aspect);

    //Define View Matrix values
    var x = 0;
    var y = 0;
    var z = 0;
    var zoom = 2.5;
    var rx = -0.5;
    var ry = 1.2;
    const viewMatrix = getMatrix3DView(x, y, z,   rx, ry,  zoom);

    //Textura sobre la cual guardaremos el render de la escena
    var targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    //Frame Buffer para renderizar sobre textura
    var frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, targetTexture, 0);
    //Render Buffer para usar la informacion de profundidad
    var depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    
    //-------- DRAW --------
    var ticker = 0;
    requestAnimationFrame(draw);
    function draw(){
        ticker += 0.01

        //Define Transform Matrix and Animate
        objs.forEach((obj) => {
            obj.uniforms.u_matrix_transform = getMatrix3DTransform(
            obj.pos.x, obj.pos.y, obj.pos.z,   
            0.45, 0.45, 0.45,
            obj.rot.x + ticker, obj.rot.y + ticker, obj.rot.z);
        })

        //Render picker in buffer and check pixel
        const frustumMatrix = getMousePixelFrustum();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.viewport(0, 0, 1, 1);
        drawObjs(programPicker, frustumMatrix, true);
        
        //Render objects
        getObjectFromPixel();
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, w, h);
        drawObjs(program, perspectiveMatrix, false);
        requestAnimationFrame(draw);
    }

    function drawObjs(program, pMatrix, onCanvas){
        //Define Screen
        gl.useProgram(program);
        gl.enable(gl.DEPTH_TEST) 
        gl.enable(gl.CULL_FACE)
        gl.clearColor(1,1,1,1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        objs.forEach((obj) =>{
            //Setup obj attributes and uniforms
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufferPos);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0); 

            if(onCanvas){
                var idUniformLocation = gl.getUniformLocation(program, "u_id");
                gl.uniform4fv(idUniformLocation, obj.i);
            }else{
                gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufferCol);
                gl.enableVertexAttribArray(colorAttributeLocation);
                gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0); 

                var colmultUniformLocation = gl.getUniformLocation(program, "u_color_mult");
                gl.uniform4fv(colmultUniformLocation, obj.mults.color); 
            }

            //Define Perspective, Transform and View Matrices
            var transUniformLocation = gl.getUniformLocation(program, "u_matrix_transform");
            gl.uniformMatrix4fv(transUniformLocation, false, obj.uniforms.u_matrix_transform);

            
            var perspectiveUniformLocation = gl.getUniformLocation(program, "u_matrix_perspective")
            gl.uniformMatrix4fv(perspectiveUniformLocation, false, pMatrix);

            
            var viewUniformLocation = gl.getUniformLocation(program, "u_matrix_view");
            gl.uniformMatrix4fv(viewUniformLocation, false, viewMatrix);

            //Draw info from buffers
            gl.drawArrays(gl.TRIANGLES, 0, 100)
        })
    }    
}
