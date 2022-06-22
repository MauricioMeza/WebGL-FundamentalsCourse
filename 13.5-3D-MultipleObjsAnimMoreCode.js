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
    var canvas = document.getElementById("canvas_12");
    var gl = canvas.getContext("webgl");
    var program = createProgramFromShaders(gl, vert_shader, frag_shader);
    gl.useProgram(program);

    
    //---OBJECTS TO DRAW---
    //Define Attribute Locations
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    
    //Creamos los Buffers que usan los objetos (Geometria y Color)
    var fPosBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, fPosBuffer);
    var geometry = create3DF();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(geometry), gl.STATIC_DRAW);

    var fColBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, fColBuffer);
    var colors = create3DFColors();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    //Definimos las propiedades de cada objeto y los guardamos en un arreglo
    var objs = []
    for(var i=0; i<25; i++){
        objs.push({
            geometryBuffer: fPosBuffer, 
            colorBuffer: fColBuffer, 
            vertCount: geometry.length/3,
            pos: {x: random(), y: random(), z: random()} ,
            rot: {x: 2*random(), y: 2*random(), z: 2*random()},
            scl: {x: 0.8, y:0.8, z:0.8},
        })
    }

    //Define Perspective and View Matrices
    var perspectiveUniformLocation = gl.getUniformLocation(program, "u_matrix_perspective")
    const perspectiveMatrix = getMatrix3DPerspective(0.01, 100, 0.85);
    gl.uniformMatrix4fv(perspectiveUniformLocation, false, perspectiveMatrix);

    var viewUniformLocation = gl.getUniformLocation(program, "u_matrix_view");
    const viewMatrix = getMatrix3DView(0, 0, 0,   -0.5, 1.2,  2);
    gl.uniformMatrix4fv(viewUniformLocation, false, viewMatrix);

    var transUniformLocation = gl.getUniformLocation(program, "u_matrix_transform");
    
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
            //Cambio de Rotacion para Animacion de los Objetos
            obj.rot.x += 0.01 
            obj.rot.y += 0.01

            //Cargar atributos a partir de buffers del objeto (Geometria y Color)
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.geometryBuffer);
            gl.enableVertexAttribArray(positionAttributeLocation);
            gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0); 

            gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
            gl.enableVertexAttribArray(colorAttributeLocation);
            gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0);
            
            //Cargar Uniforme (Matriz de Tranformacion) a partir de info del Objeto (Pos, Rot, Scl)
            var transformMatrix = getMatrix3DTransform(
                obj.pos.x, obj.pos.y, obj.pos.z,   
                obj.scl.x, obj.scl.y, obj.scl.z,
                obj.rot.x, obj.rot.y, obj.rot.z);
            gl.uniformMatrix4fv(transUniformLocation, false, transformMatrix);

            //Dibujar todos los triangulos del objeto en un solo Draw Call
            gl.drawArrays(gl.TRIANGLES, 0, obj.vertCount)
        })
        requestAnimationFrame(draw);
    }
    
    
    

    
}
