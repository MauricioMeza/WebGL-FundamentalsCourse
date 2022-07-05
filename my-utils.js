/*****************************************************************/
/********* BOILERPLATE LOADING AND COMPILING SHADERS *************/
/*****************************************************************/

//Create program with shaders
function createProgramFromShaders(gl, vert_shader, frag_shader){
    var vertShader = createShader(gl, gl.VERTEX_SHADER , vert_shader)
    var fragShader = createShader(gl, gl.FRAGMENT_SHADER , frag_shader)
    var program = createProgram(gl, vertShader, fragShader);
    return program;
}

//CreateShader - Use Webgl functions to compile shaders
function createShader(gl, type, src){
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
    if(success){
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader)
}

//CreateProgram - Use WebGl functions to put all shaders into pipeline
function createProgram(gl, vert, frag){
    var program = gl.createProgram();
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program)
    const success = gl.getProgramParameter(program, gl.LINK_STATUS)
    if(success){
        return program;
    }
    console.log(gl.getProgramInfoLog(shader));
    gl.deleteProgram(program)
}

/*****************************************************************/
/************ MATRIX - Transform, View, Perspective **************/
/*****************************************************************/

/*2D Transformation Matrices*/
function matTrans2D(x, y){
    return [1, 0, 0,
            0, 1, 0,
            x, y, 1]
}
function matScale2D(x, y){
    return [x, 0, 0,
            0, y, 0,
            0, 0, 1]   
}
function matRot2D(t){
    return [Math.cos(t), -Math.sin(t), 0,
            Math.sin(t),  Math.cos(t), 0,
            0,  0, 1]   
}

function getMatrix2D(Tx, Ty, Sx, Sy, r){
    const T = matTrans2D(Tx, Ty);
    const S = matScale2D(Sx, Sy);
    const R = matRot2D(r);

    var result = multiply3(T,S);
    result = multiply3(result, R)
    return result;
}

/*3D Transformation Matrices*/
function matIdentity(){
  return [1, 0, 0, 0,
          0, 1, 0, 0,
          0, 0, 1, 0,
          0, 0, 0, 1]
}
function matTrans3D(Tx, Ty, Tz){
  return [1,  0,  0,  0,
          0,  1,  0,  0,
          0,  0,  1,  0,
          Tx, Ty, Tz, 1]
}
function matScale3D(Sx, Sy, Sz){
  return [Sx, 0,  0,  0,
          0,  Sy, 0,  0,
          0,  0,  Sz, 0,
          0,  0,  0,  1]   
}
function matRotX3D(t){
  return [1,  0,  0,  0,
          0,   Math.cos(t), Math.sin(t), 0,
          0,  -Math.sin(t), Math.cos(t), 0,
          0,  0,  0,  1]   
}
function matRotY3D(t){
  return [Math.cos(t), 0, -Math.sin(t), 0,
          0,  1,  0,  0,
          Math.sin(t),  0,  Math.cos(t),  0,
          0,  0,  0,  1]   
}
function matRotZ3D(t){
  return [Math.cos(t), -Math.sin(t), 0, 0,
          Math.sin(t),  Math.cos(t), 0, 0,
          0,  0,  1,  0,
          0,  0,  0,  1]   
}

function matPerspective(nr, fr, fov){
  const aspc = 800/500;
  var f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
  return [f/aspc, 0,   0,                  0,
          0,      f,   0,                  0,
          0,      0,   (nr+fr)/(nr-fr),   -1,
          0,      0,   (nr*fr)/(nr-fr)*2,  1]   
}

function matPerspectiveAspect(nr, fr, fov, aspc){
  var f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
  return [f/aspc, 0,   0,                  0,
          0,      f,   0,                  0,
          0,      0,   (nr+fr)/(nr-fr),   -1,
          0,      0,   (nr*fr)/(nr-fr)*2,  0]     
}

function matFrustum(izq, der, abj, arr, nr, fr){
  return [2*nr/(der-izq),       0,                    0,                 0,
          0,                    2*nr/(arr-abj),       0,                 0,
          (der+izq)/(der-izq),  (arr+abj)/(arr-abj),  -(fr+nr)/(fr-nr), -1,
          0,                    0,                    -2*nr*fr/(fr-nr),  0]
}

function getMatrix3DTransform(Tx, Ty, Tz, Sx, Sy, Sz, Rx, Ry, Rz){
  const T = matTrans3D(Tx, Ty, Tz);
  const S = matScale3D(Sx, Sy, Sz);
  const RX = matRotX3D(Rx);
  const RY = matRotY3D(Ry);
  const RZ = matRotZ3D(Rz);

  var result = multiply4(T,S);
  result = multiply4(result, RX);
  result = multiply4(result, RY);
  result = multiply4(result, RZ);
  return result;
}

function getMatrix3DView(Tx, Ty, Tz, Rx, Ry, radio){
  const RX = matRotX3D(Rx);
  const RY = matRotY3D(Ry);
  const Zoom = matTrans3D(0, 0, radio);
  const Pan = matTrans3D(Tx, Ty, Tz);

  var result = multiply4(RY, RX);
  result = multiply4(result, Zoom);
  result = multiply4(result, Pan);

  return inverse(result);
}

function getMatrix3DViewFree(Tx, Ty, Tz, Rx, Ry, Rz){
  const Trans = matTrans3D(Tx, Ty, Tz);
  const RX = matRotX3D(Rx);
  const RY = matRotY3D(Ry);
  const RZ = matRotZ3D(Rz);

  var result = multiply4(Trans, RX);
  result = multiply4(result, RY);
  result = multiply4(result, RZ);

  return inverse(result);
}

function getMatrix3DPerspective(near, far, fov){
  const P = matPerspective(near, far, fov);
  return P;
}

function getMatrix3DPerspectiveAspect(near, far, fov, aspct){
  const P = matPerspectiveAspect(near, far, fov, aspct);
  return P;
}


//Multiply two 3x3 matrices
function multiply3(a, b) {
  var a00 = a[0 * 3 + 0];
  var a01 = a[0 * 3 + 1];
  var a02 = a[0 * 3 + 2];
  var a10 = a[1 * 3 + 0];
  var a11 = a[1 * 3 + 1];
  var a12 = a[1 * 3 + 2];
  var a20 = a[2 * 3 + 0];
  var a21 = a[2 * 3 + 1];
  var a22 = a[2 * 3 + 2];
  var b00 = b[0 * 3 + 0];
  var b01 = b[0 * 3 + 1];
  var b02 = b[0 * 3 + 2];
  var b10 = b[1 * 3 + 0];
  var b11 = b[1 * 3 + 1];
  var b12 = b[1 * 3 + 2];
  var b20 = b[2 * 3 + 0];
  var b21 = b[2 * 3 + 1];
  var b22 = b[2 * 3 + 2];

  return [
    b00 * a00 + b01 * a10 + b02 * a20,
    b00 * a01 + b01 * a11 + b02 * a21,
    b00 * a02 + b01 * a12 + b02 * a22,
    b10 * a00 + b11 * a10 + b12 * a20,
    b10 * a01 + b11 * a11 + b12 * a21,
    b10 * a02 + b11 * a12 + b12 * a22,
    b20 * a00 + b21 * a10 + b22 * a20,
    b20 * a01 + b21 * a11 + b22 * a21,
    b20 * a02 + b21 * a12 + b22 * a22,
  ];

//Multiply two 4x4 matrices
}
function multiply4(a, b) {
  var b00 = b[0 * 4 + 0];
  var b01 = b[0 * 4 + 1];
  var b02 = b[0 * 4 + 2];
  var b03 = b[0 * 4 + 3];
  var b10 = b[1 * 4 + 0];
  var b11 = b[1 * 4 + 1];
  var b12 = b[1 * 4 + 2];
  var b13 = b[1 * 4 + 3];
  var b20 = b[2 * 4 + 0];
  var b21 = b[2 * 4 + 1];
  var b22 = b[2 * 4 + 2];
  var b23 = b[2 * 4 + 3];
  var b30 = b[3 * 4 + 0];
  var b31 = b[3 * 4 + 1];
  var b32 = b[3 * 4 + 2];
  var b33 = b[3 * 4 + 3];
  var a00 = a[0 * 4 + 0];
  var a01 = a[0 * 4 + 1];
  var a02 = a[0 * 4 + 2];
  var a03 = a[0 * 4 + 3];
  var a10 = a[1 * 4 + 0];
  var a11 = a[1 * 4 + 1];
  var a12 = a[1 * 4 + 2];
  var a13 = a[1 * 4 + 3];
  var a20 = a[2 * 4 + 0];
  var a21 = a[2 * 4 + 1];
  var a22 = a[2 * 4 + 2];
  var a23 = a[2 * 4 + 3];
  var a30 = a[3 * 4 + 0];
  var a31 = a[3 * 4 + 1];
  var a32 = a[3 * 4 + 2];
  var a33 = a[3 * 4 + 3];

  return [
    b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
    b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
    b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
    b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
    b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
    b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
    b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
    b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
    b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
    b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
    b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
    b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
    b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
    b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
    b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
    b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
  ];
}

//Get Inverse of Matrix
function inverse(m) {
  var m00 = m[0 * 4 + 0];
  var m01 = m[0 * 4 + 1];
  var m02 = m[0 * 4 + 2];
  var m03 = m[0 * 4 + 3];
  var m10 = m[1 * 4 + 0];
  var m11 = m[1 * 4 + 1];
  var m12 = m[1 * 4 + 2];
  var m13 = m[1 * 4 + 3];
  var m20 = m[2 * 4 + 0];
  var m21 = m[2 * 4 + 1];
  var m22 = m[2 * 4 + 2];
  var m23 = m[2 * 4 + 3];
  var m30 = m[3 * 4 + 0];
  var m31 = m[3 * 4 + 1];
  var m32 = m[3 * 4 + 2];
  var m33 = m[3 * 4 + 3];
  var tmp_0  = m22 * m33;
  var tmp_1  = m32 * m23;
  var tmp_2  = m12 * m33;
  var tmp_3  = m32 * m13;
  var tmp_4  = m12 * m23;
  var tmp_5  = m22 * m13;
  var tmp_6  = m02 * m33;
  var tmp_7  = m32 * m03;
  var tmp_8  = m02 * m23;
  var tmp_9  = m22 * m03;
  var tmp_10 = m02 * m13;
  var tmp_11 = m12 * m03;
  var tmp_12 = m20 * m31;
  var tmp_13 = m30 * m21;
  var tmp_14 = m10 * m31;
  var tmp_15 = m30 * m11;
  var tmp_16 = m10 * m21;
  var tmp_17 = m20 * m11;
  var tmp_18 = m00 * m31;
  var tmp_19 = m30 * m01;
  var tmp_20 = m00 * m21;
  var tmp_21 = m20 * m01;
  var tmp_22 = m00 * m11;
  var tmp_23 = m10 * m01;

  var t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
      (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
  var t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
      (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
  var t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
      (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
  var t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
      (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);

  var d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

  return [
    d * t0,
    d * t1,
    d * t2,
    d * t3,
    d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
          (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
    d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
          (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
    d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
          (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
    d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
          (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
    d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
          (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
    d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
          (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
    d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
          (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
    d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
          (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
    d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
          (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
    d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
          (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
    d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
          (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
    d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
          (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
  ];
}

/*****************************************************************/
/***************** 2D and 3D Object Buffers **********************/
/*****************************************************************/

//Draw a Rectangle
function createRectangle(gl, x, y, width, height){
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;
  var positions = [
      x1, y1,
      x2, y1,
      x2, y2,
      x1, y1,
      x1, y2,
      x2, y2,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return positions.length/2;
}

//Draw an F
function createF(x, y, width, height, thickness){
  var positions = [
      // left column
      x, y,
      x + thickness, y,
      x, y + height,
      x, y + height,
      x + thickness, y,
      x + thickness, y + height,

      // top rung
      x + thickness, y,
      x + width, y,
      x + thickness, y + thickness,
      x + thickness, y + thickness,
      x + width, y,
      x + width, y + thickness,

      // middle rung
      x + thickness, y + thickness * 2,
      x + width * 2 / 3, y + thickness * 2,
      x + thickness, y + thickness * 3,
      x + thickness, y + thickness * 3,
      x + width * 2 / 3, y + thickness * 2,
      x + width * 2 / 3, y + thickness * 3,
  ];
  return positions;
}

function createFColors(){
  var positions = [
      // left column
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78, 0.78, 0.27,
      0.78, 0.78, 0.27,
      0.78, 0.78, 0.27,

      // top rung
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78, 0.78, 0.27,
      0.78, 0.78, 0.27,
      0.78, 0.78, 0.27,

      // middle rung
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78, 0.78, 0.27,
      0.78, 0.78, 0.27,
      0.78, 0.78, 0.27,
  ];
  return positions;
}

//Draw 3D F
function create3Df(){
  var positions = [
      0.0,  0,  0,
      0.1,  0,  0,
      0.0, .5,  0,

      0.0, .5,  0,
      0.1,  0,  0,
      0.1, .5,  0,

      .10,   0,  0,
      .33,   0,  0,
      .10,  .1,  0,

      .10,  .1,  0,
      .33,   0,  0,
      .33,  .1,  0,

      .10,  .2,  0,
      .23,  .2,  0,
      .10,  .3,  0,
      
      .10,  .3,  0,
      .23,  .2,  0,
      .23,  .3,  0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  return positions.length/3;
}

function create3DF(){
  var positions = [
      0,    0,    0,
      0,    0.5,  0,
      0.1,  0,    0,
      0,    0.5,  0,
      0.1,  0.5,  0,
      0.1,  0,    0,

      0.1,  0,    0,
      0.1,  0.1,  0,
      0.33, 0,    0,
      0.1,  0.1,  0,
      0.33, 0.1,  0,
      0.33, 0,    0,

      0.1,  0.2,  0,
      0.1,  0.3,  0,
      0.22, 0.2,  0,
      0.1,  0.3,  0,
      0.22, 0.3,  0,
      0.22, 0.2,  0,

      0,    0,    0.1,
      0.1,  0,    0.1,
      0,    0.5,  0.1,
      0,    0.5,  0.1,
      0.1,  0,    0.1,
      0.1,  0.5,  0.1,

      0.1,  0,    0.1,
      0.33, 0,    0.1,
      0.1,  0.1,  0.1,
      0.1,  0.1,  0.1,
      0.33, 0,    0.1,
      0.33, 0.1,  0.1,

      0.1,  0.2,  0.1,
      0.22, 0.2,  0.1,
      0.1,  0.3,  0.1,
      0.1,  0.3,  0.1,
      0.22, 0.2,  0.1,
      0.22, 0.3,  0.1,

      0,    0,    0,
      0.33, 0,    0,
      0.33, 0,    0.1,
      0,    0,    0,
      0.33, 0,    0.1,
      0,    0,    0.1,

      0.33, 0,    0,
      0.33, 0.1,  0,
      0.33, 0.1,  0.1,
      0.33, 0,    0,
      0.33, 0.1,  0.1,
      0.33, 0,    0.1,

      0.1,  0.1,  0,
      0.1,  0.1,  0.1,
      0.33, 0.1,  0.1,
      0.1,  0.1,  0,
      0.33, 0.1,  0.1,
      0.33, 0.1,  0,

      0.1,  0.1,  0,
      0.1,  0.2,  0.1,
      0.1,  0.1,  0.1,
      0.1,  0.1,  0,
      0.1,  0.2,  0,
      0.1,  0.2,  0.1,

      0.1,  0.2,  0,
      0.22, 0.2,  0.1,
      0.1,  0.2,  0.1,
      0.1,  0.2,  0,
      0.22, 0.2,  0,
      0.22, 0.2,  0.1,

      0.22, 0.2,  0,
      0.22, 0.3,  0.1,
      0.22, 0.2,  0.1,
      0.22, 0.2,  0,
      0.22, 0.3,  0,
      0.22, 0.3,  0.1,

      0.1,  0.3,   0,
      0.1,  0.3,   0.1,
      0.22, 0.3,   0.1,
      0.1,  0.3,   0,
      0.22, 0.3,   0.1,
      0.22, 0.3,   0,

      0.1,  0.3,   0,
      0.1,  0.5,   0.1,
      0.1,  0.3,   0.1,
      0.1,  0.3,   0,
      0.1,  0.5,   0,
      0.1,  0.5,   0.1,

      0,    0.5,   0,
      0,    0.5,   0.1,
      0.1,  0.5,   0.1,
      0,    0.5,   0,
      0.1,  0.5,   0.1,
      0.1,  0.5,   0,

      0,  0,     0,
      0,  0,     0.1,
      0,  0.5,   0.1,
      0,  0,     0,
      0,  0.5,   0.1,
      0,  0.5,   0
  ];
  return positions;
}

function create3DFColors(){
  var colors = [
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,

        // top rung front
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,

        // middle rung front
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,
      0.78,  0.27, 0.47,

        // left column back
      0.31, 0.27, 0.78,
      0.31, 0.27, 0.78,
      0.31, 0.27, 0.78,
      0.31, 0.27, 0.78,
      0.31, 0.27, 0.78,
      0.31, 0.27, 0.78,

        // top rung back
      0.31, 0.27, 0.78,
      0.31, 0.27, 0.78,
      0.31, 0.27, 0.78,
      0.31, 0.27, 0.78,
      0.31, 0.27, 0.78,
      0.31, 0.27, 0.78,

        // middle rung back
      0.31, 0.27, 0.78,
      0.31, 0.27, 0.78,
      0.31, 0.27, 0.78,
      0.31, 0.27, 0.78,
      0.31, 0.27, 0.78,
      0.31, 0.27, 0.78,

        // top
      0.27, 0.78, 0.81,
      0.27, 0.78, 0.81,
      0.27, 0.78, 0.81,
      0.27, 0.78, 0.81,
      0.27, 0.78, 0.81,
      0.27, 0.78, 0.81,

        // top rung right
      0.78, 0.78, 0.27,
      0.78, 0.78, 0.27,
      0.78, 0.78, 0.27,
      0.78, 0.78, 0.27,
      0.78, 0.78, 0.27,
      0.78, 0.78, 0.27,

        // under top rung
      0.81, 0.39, 0.27,
      0.81, 0.39, 0.27,
      0.81, 0.39, 0.27,
      0.81, 0.39, 0.27,
      0.81, 0.39, 0.27,
      0.81, 0.39, 0.27,

        // between top rung and middle
      0.81, 0.62, 0.27,
      0.81, 0.62, 0.27,
      0.81, 0.62, 0.27,
      0.81, 0.62, 0.27,
      0.81, 0.62, 0.27,
      0.81, 0.62, 0.27,

        // top of middle rung
      0.27, 0.70, 0.82,
      0.27, 0.70, 0.82,
      0.27, 0.70, 0.82,
      0.27, 0.70, 0.82,
      0.27, 0.70, 0.82,
      0.27, 0.70, 0.82,

        // right of middle rung
      0.39, 0.27, 0.82,
      0.39, 0.27, 0.82,
      0.39, 0.27, 0.82,
      0.39, 0.27, 0.82,
      0.39, 0.27, 0.82,
      0.39, 0.27, 0.82,

        // bottom of middle rung.
      76, 0.82, 0.39,
      76, 0.82, 0.39,
      76, 0.82, 0.39,
      76, 0.82, 0.39,
      76, 0.82, 0.39,
      76, 0.82, 0.39,

        // right of bottom
      0.55, 0.82, 80,
      0.55, 0.82, 80,
      0.55, 0.82, 80,
      0.55, 0.82, 80,
      0.55, 0.82, 80,
      0.55, 0.82, 80,

        // bottom
      0.35, 0.51, 0.43,
      0.35, 0.51, 0.43,
      0.35, 0.51, 0.43,
      0.35, 0.51, 0.43,
      0.35, 0.51, 0.43,
      0.35, 0.51, 0.43,

        // left side
      0.63, 0.63, 0.86,
      0.63, 0.63, 0.86,
      0.63, 0.63, 0.86,
      0.63, 0.63, 0.86,
      0.63, 0.63, 0.86,
      0.63, 0.63, 0.86
  ];
  return colors;
}

function create3DFTextureCoords(){
  var coords = [
    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,

    // top rung front
    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,

    // middle rung front
    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,

    // left column back
    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,

    // top rung back
    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,

    // middle rung back
    0, 0,
    1, 0,
    0, 1,
    0, 1,
    1, 0,
    1, 1,

    // top
    0, 0,
    1, 0,
    1, 1,
    0, 0,
    1, 1,
    0, 1,

    // top rung right
    0, 0,
    1, 0,
    1, 1,
    0, 0,
    1, 1,
    0, 1,

    // under top rung
    0, 0,
    0, 1,
    1, 1,
    0, 0,
    1, 1,
    1, 0,

    // between top rung and middle
    0, 0,
    1, 1,
    0, 1,
    0, 0,
    1, 0,
    1, 1,

    // top of middle rung
    0, 0,
    1, 1,
    0, 1,
    0, 0,
    1, 0,
    1, 1,

    // right of middle rung
    0, 0,
    1, 1,
    0, 1,
    0, 0,
    1, 0,
    1, 1,

    // bottom of middle rung.
    0, 0,
    0, 1,
    1, 1,
    0, 0,
    1, 1,
    1, 0,

    // right of bottom
    0, 0,
    1, 1,
    0, 1,
    0, 0,
    1, 0,
    1, 1,

    // bottom
    0, 0,
    0, 1,
    1, 1,
    0, 0,
    1, 1,
    1, 0,

    // left side
    0, 0,
    0, 1,
    1, 1,
    0, 0,
    1, 1,
    1, 0
  ]
  return coords;
}

function create3DCube(){
  var cubeCoords = [
    -0.2, -0.2,  -0.2,
    -0.2,  0.2,  -0.2,
     0.2, -0.2,  -0.2,
    -0.2,  0.2,  -0.2,
     0.2,  0.2,  -0.2,
     0.2, -0.2,  -0.2,

    -0.2, -0.2,   0.2,
     0.2, -0.2,   0.2,
    -0.2,  0.2,   0.2,
    -0.2,  0.2,   0.2,
     0.2, -0.2,   0.2,
     0.2,  0.2,   0.2,

    -0.2,   0.2, -0.2,
    -0.2,   0.2,  0.2,
     0.2,   0.2, -0.2,
    -0.2,   0.2,  0.2,
     0.2,   0.2,  0.2,
     0.2,   0.2, -0.2,

    -0.2,  -0.2, -0.2,
     0.2,  -0.2, -0.2,
    -0.2,  -0.2,  0.2,
    -0.2,  -0.2,  0.2,
     0.2,  -0.2, -0.2,
     0.2,  -0.2,  0.2,

    -0.2,  -0.2, -0.2,
    -0.2,  -0.2,  0.2,
    -0.2,   0.2, -0.2,
    -0.2,  -0.2,  0.2,
    -0.2,   0.2,  0.2,
    -0.2,   0.2, -0.2,

     0.2,  -0.2, -0.2,
     0.2,   0.2, -0.2,
     0.2,  -0.2,  0.2,
     0.2,  -0.2,  0.2,
     0.2,   0.2, -0.2,
     0.2,   0.2,  0.2,   
  ];

  return cubeCoords;
}

function create3DCubeColors(){
  var cubeColors = [
    0.2, 0.1, 0.4,
    0.2, 0.1, 0.4,
    0.2, 0.1, 0.4,
    0.2, 0.1, 0.4,
    0.2, 0.1, 0.4,
    0.2, 0.1, 0.4,

    0.4, 0.1, 0.2,
    0.4, 0.1, 0.2,
    0.4, 0.1, 0.2,
    0.4, 0.1, 0.2,
    0.4, 0.1, 0.2,
    0.4, 0.1, 0.2,

    0.1, 0.2, 0.4,
    0.1, 0.2, 0.4,
    0.1, 0.2, 0.4,
    0.1, 0.2, 0.4,
    0.1, 0.2, 0.4,
    0.1, 0.2, 0.4,

    0.4, 0.2, 0.1,
    0.4, 0.2, 0.1,
    0.4, 0.2, 0.1,
    0.4, 0.2, 0.1,
    0.4, 0.2, 0.1,
    0.4, 0.2, 0.1,

    0.2, 0.4, 0.1,
    0.2, 0.4, 0.1,
    0.2, 0.4, 0.1,
    0.2, 0.4, 0.1,
    0.2, 0.4, 0.1,
    0.2, 0.4, 0.1,

    0.1, 0.4, 0.2,
    0.1, 0.4, 0.2,
    0.1, 0.4, 0.2,
    0.1, 0.4, 0.2,
    0.1, 0.4, 0.2,
    0.1, 0.4, 0.2
  ];

  return cubeColors;
}

function create3DCubeTexCoords(){
  var texCoords = [
    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,

    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,

    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,

    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,

    0, 0,
    0, 1,
    1, 0,
    0, 1,
    1, 1,
    1, 0,

    0, 0,
    0, 1,
    1, 0,
    1, 0,
    0, 1,
    1, 1,
  ];
  return texCoords
}

function random(){
  return (2*Math.random())-1
}