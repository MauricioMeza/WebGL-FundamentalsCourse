//-------------------------------------
//----------VertexShader---------------
//-------------------------------------
vert_shader = glsl`
    //receive data from Buffer into gl_position (pos of current vertex)
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
     //Turn pixel into the uniform color
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
    //---CANVAS & GL-CONTEXT---
    var canvas = document.getElementById("canvas_14");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);

    
    //---OBJECTS TO DRAW---
    //Define Attribute Locations
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    
    //Define Buffers
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

    //Define objects
    var objs = []
    for(var i=0; i<15; i++){
        objs.push({
            geometryBuffer: cubePosBuffer, 
            colorBuffer: cubeColBuffer,
            vertCount: create3DF().length,
            uniforms: {
                u_matrix_transform: matIdentity()
            },
            pos: {x: 1.5*Math.random(), y: 1.5*Math.random(), z: 1.5*Math.random()} ,
            rot: {x: 3*Math.random(), y: 3*Math.random(), z: 3*Math.random()},
            mults: {x: 2*Math.random(), y:2*Math.random() }
        })
        objs.push({
            geometryBuffer: fPosBuffer, 
            colorBuffer: fColBuffer, 
            vertCount: create3DCube().length,
            uniforms: {
                u_matrix_transform: matIdentity()
            },
            pos: {x: 1.5*Math.random(), y: 1.5*Math.random(), z: 1.5*Math.random()} ,
            rot: {x: 3*Math.random(), y: 3*Math.random(), z: 3*Math.random()},
            mults: {x: 2*Math.random(), y:2*Math.random() }
        })
    }

    /*
    objects = [];
    obj = {
        geometryBuffer: geoBuffer,
        colorBuffer: colBuffer,
        pos: {x:0, y:0, z:0},
        rot: {x:0, y:0, z:0},
        scl: {x:0, y:0, z:0},
        uniforms:{
            u_matrix_transform: identy(),
            u_color: 0x00000
        }
    }
    objects.append(obj)
    */

    //Define Perspective and View Matrices
    const perspectiveMatrix = getMatrix3DPerspective(0.01, 100, 0.85);
    var perspectiveUniformLocation = gl.getUniformLocation(program, "u_matrix_perspective")
    gl.uniformMatrix4fv(perspectiveUniformLocation, false, perspectiveMatrix);

    const viewMatrix = getMatrix3DView(0, 0, 0,   -0.5, 1.2,  2);
    var viewUniformLocation = gl.getUniformLocation(program, "u_matrix_view");
    gl.uniformMatrix4fv(viewUniformLocation, false, viewMatrix);
    
    //Define Screen
    gl.enable(gl.DEPTH_TEST) 
    gl.enable(gl.CULL_FACE)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1,1,1,1)
    

    //Draw all Objects
    requestAnimationFrame(draw);
    function draw(){
        gl.clear(gl.COLOR_BUFFER_BIT);
        objs.forEach((obj) =>{
            obj.rot.x += 0.01 * obj.mults.x;
            obj.rot.y += 0.01 * obj.mults.y;

            //Setup obj attributes
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.geometryBuffer);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0); 

            gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
            gl.enableVertexAttribArray(colorAttributeLocation);
            gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0);
            
            //Setup object uniforms
            obj.uniforms.u_matrix_transform = getMatrix3DTransform(
                obj.pos.x, obj.pos.y, obj.pos.z,   
                0.45, 0.45, 0.45,
                obj.rot.x, obj.rot.y, obj.rot.z);
            var transUniformLocation = gl.getUniformLocation(program, "u_matrix_transform");
            gl.uniformMatrix4fv(transUniformLocation, false, obj.uniforms.u_matrix_transform);

            //draw obj from local and universal attributes/uniforms
            gl.drawArrays(gl.TRIANGLES, 0, obj.vertCount)
        })
        requestAnimationFrame(draw);
    }
    
    
    

    
}
