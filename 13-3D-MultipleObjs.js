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
    //Get canvas, context and programs
    var canvas = document.getElementById("canvas_12");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);

    //Create Buffers
    var arrays = {
        color: {numComponents: 3, data: create3DFColors()},
        position:{numComponents: 3, data: create3DF()}
    }
    var buffers = webglUtils.createBufferInfoFromArrays(gl, arrays);

    //Create Attributes
    var attribSetters =  webglUtils.createAttributeSetters(gl, program)
    webglUtils.setBuffersAndAttributes(gl, attribSetters, buffers)

    //Create Uniforms
    var uniformSetters = webglUtils.createUniformSetters(gl, program)
    var uniforms_all = {
        u_matrix_perspective: getMatrix3DPerspective(0.01, 100, 0.7),
        u_matrix_view: getMatrix3DView(0,.25,0, -0.25,0.75,2),
    }
    webglUtils.setUniforms(uniformSetters, uniforms_all)

    //Define Objs and their uniforms
    var objs = []
    for(var i=0; i<50; i++){
        objs.push({
            buffer: buffers, 
            uniforms: {
                u_matrix_transform: getMatrix3DTransform(
                    Math.random(),Math.random(),Math.random(),  .4,.4,.4,
                    3*Math.random(),3*Math.random(),3*Math.random()  
                )
            }
        })
    }
    
    //Deifine Screen
    gl.enable(gl.DEPTH_TEST) 
    gl.enable(gl.CULL_FACE)
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(1,1,1,1)
    gl.clear(gl.COLOR_BUFFER_BIT);

    //Draw all Objects
    objs.forEach((obj) =>{
        webglUtils.setBuffersAndAttributes(gl,attribSetters, obj.buffer);
        webglUtils.setUniforms(uniformSetters, obj.uniforms)

        gl.drawArrays(gl.TRIANGLES, 0, buffers.numElements)
    })
    
    

    
}
