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

vert_shader_picker = glsl`
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

frag_shader_picker = glsl`
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
    var w = gl.canvas.width;
    var h = gl.canvas.height;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

    //------- INTERACCION CON EL MOUSE --------
    //Obtener Posicion del Mouse
    var mouseX = -1;
    var mouseY = -1;
    var oldPickNdx = -1;
    gl.canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseX = e.clientX - rect.left;
        mouseY = e.clientY - rect.top;
    });
    //Obtener valores (izq, der, arb, abj) para crear una perspectiva igual con la matriz frustum
    var fTop, fBottom, fLeft, fRight, fWidth, fHeight;
    function frustumParameters(near, fov, aspect){  
        fTop = Math.tan(fov * 0.5) * near;
        fBottom = -fTop;
        fLeft = aspect * fBottom;
        fRight = aspect * fTop;
        fWidth = Math.abs(fRight - fLeft);
        fHeight = Math.abs(fTop - fBottom);
    }
    //Obtener un Frustum de solamente el pixel que esta debajo del mouse
    function getMousePixelFrustum(){
        const pixelX = mouseX * w / gl.canvas.clientWidth;
        const pixelY = h - mouseY * h / gl.canvas.clientHeight - 1;
        const subLeft = fLeft + pixelX * fWidth / w;
        const subBottom = fBottom + pixelY * fHeight / h;
        const subRight = subLeft + (fWidth / w);
        const subTop = subBottom + (fHeight / h);
        const frustumMatrix = matFrustum(subLeft, subRight, subBottom, subTop, near, far)

        return frustumMatrix;
    }
    //Obtener un objeto a partir del color del pixel renderizado
    function getObjectFromPixel(){
        //Leer color en esa posicion
        const data = new Uint8Array(4);
        gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);

        //Calcular ID a partir del color
        const id = data[0] + (data[1] << 8) + (data[2] << 16) + (data[3] << 24);

        //Visualizacion de la seleccion
        if (oldPickNdx >= 0) {
            objs[oldPickNdx].colorMult = [1,1,1,1];
            oldPickNdx = -1;
            canvas.style.cursor = "default";
        }

        if (id > 0) {
            const pickNdx = id - 1;
            oldPickNdx = pickNdx;
            objs[pickNdx].colorMult = [0,1,0,1];
            canvas.style.cursor = "pointer";
        }
    }

    //------- OBJETOS EN LA ESCENA --------
    //Definir Atributos
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    var positionAttributeLocation = gl.getAttribLocation(programPicker, "a_position")
    var colorAttributeLocation = gl.getAttribLocation(program, "a_color")
    
    //Crear Buffers
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

    //Crear Objetos de diferentes tipos y añadirlos a la lista
    var objs = []
    for(var i=0; i<15; i++){
        const id1 = (i*2)+1
        objs.push({
            //Id calculada a partir de su posicion la lista de objetos
            i: [((id1 >>  0) & 0xFF) / 0xFF,
                ((id1 >>  8) & 0xFF) / 0xFF,
                ((id1 >> 16) & 0xFF) / 0xFF,
                ((id1 >> 24) & 0xFF) / 0xFF],
            bufferPos: cubePosBuffer, 
            bufferCol: cubeColBuffer,
            colorMult : [1,1,1,1],
            vertCount : create3DCube().length/3,
            pos: {x: 1.5*random(), y: 1.5*random(), z: 1.5*random()} ,
            rot: {x: 3*Math.random(), y: 3*Math.random(), z: 3*Math.random()},
            scl: {x: 0.75, y: 0.75, z:0.75}
        });
        const id2 = (i*2)+2;
        objs.push({
            i: [((id2 >>  0) & 0xFF) / 0xFF,
                ((id2 >>  8) & 0xFF) / 0xFF,
                ((id2 >> 16) & 0xFF) / 0xFF,
                ((id2 >> 24) & 0xFF) / 0xFF],
            bufferPos: fPosBuffer, 
            bufferCol: fColBuffer,
            colorMult : [1,1,1,1], 
            vertCount : create3DF().length/3,
            pos: {x: 1.5*random(), y: 1.5*random(), z: 1.5*random()} ,
            rot: {x: 3*Math.random(), y: 3*Math.random(), z: 3*Math.random()},
            scl: {x: 0.75, y: 0.75, z:0.75}
        });
    }

    //Declarar Matriz de Perspectiva (Near, Far, FOV) 
    var near = 0.01;
    var far = 100;
    var fov = 1.6; 
    const perspectiveMatrix = matPerspectiveAspect(near, far, fov, aspect);
    frustumParameters(near, fov, aspect)

    //Declarar Matriz de Vista (Tx,Ty,Tz,  Rx,Ry,  ssZoom)
    const viewMatrix = getMatrix3DView(0, 0, 0,   -0.5, 1.5,  2.5);
    
    //Definir parametros de renderizado y pantalla
    gl.clearColor(1,1,1,1);
    gl.enable(gl.DEPTH_TEST) 


    //------ RENDER Y FRAME BUFFERS ------
    //Textura sobre la cual guardaremos el render de la escena
    var targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
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
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, 1, 1);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    
    //-------- CICLO DE DIBUJO -------
    requestAnimationFrame(draw);
    function draw(){
        //Animar la rotacion de los objetos una sola vez por frame
        objs.forEach((obj) => {
            obj.rot.x += 0.01;
            obj.rot.y += 0.02;
        })

        //Renderizar sobre el buffer con los shaders del picker
        const frustumMatrix = getMousePixelFrustum();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        gl.viewport(0, 0, 1, 1);
        drawObjs(programPicker, frustumMatrix, true);
        
        //Renderizar sobre el buffer con los shaders de presentacion
        getObjectFromPixel();
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, w, h);
        drawObjs(program, perspectiveMatrix, false);
        requestAnimationFrame(draw);
    }

    function drawObjs(program, pMatrix, onCanvas){
        //Refrescar la pantalla
        gl.useProgram(program);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        objs.forEach((obj) =>{
            //Atributo de Posicion comun en ambos shaders
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufferPos);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0); 

            //Uniformes con Matrices de Transformacion, Vista y Perspectiva comunes en ambos shaders
            var transUniformLocation = gl.getUniformLocation(program, "u_matrix_transform");
            var matrix_transform = getMatrix3DTransform(
                obj.pos.x, obj.pos.y, obj.pos.z,   
                obj.scl.x, obj.scl.y, obj.scl.z,
                obj.rot.x, obj.rot.y, obj.rot.z);
            gl.uniformMatrix4fv(transUniformLocation, false, matrix_transform);
            var perspectiveUniformLocation = gl.getUniformLocation(program, "u_matrix_perspective")
            gl.uniformMatrix4fv(perspectiveUniformLocation, false, pMatrix);
            var viewUniformLocation = gl.getUniformLocation(program, "u_matrix_view");
            gl.uniformMatrix4fv(viewUniformLocation, false, viewMatrix);

            //---Atributos y Uniformes segun los shaders que se utilizan---
            if(onCanvas){
                //Color identificador para el picker
                var idUniformLocation = gl.getUniformLocation(program, "u_id");
                gl.uniform4fv(idUniformLocation, obj.i);
            }else{
                //Colores y Multiplicador para el de presentacion
                gl.bindBuffer(gl.ARRAY_BUFFER, obj.bufferCol);
                gl.enableVertexAttribArray(colorAttributeLocation);
                gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0); 
                var colmultUniformLocation = gl.getUniformLocation(program, "u_color_mult");
                gl.uniform4fv(colmultUniformLocation, obj.colorMult); 
            }

            //Llamada de dibujo
            gl.drawArrays(gl.TRIANGLES, 0, obj.vertCount)
        })
    }    
}
