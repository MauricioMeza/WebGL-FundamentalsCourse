let models;
let picked, cached = true;
let pv, e, m;
let canvas; 
let fpsText;
let fps, avg, total;
let count;

function setup() {
  container = document.getElementById("comp")
  fpsText = document.getElementById("fps")
  let w = container.getAttribute("canvW");
  let h = container.getAttribute("canvH");
  let num = container.getAttribute("num");
  let trange = container.getAttribute("trange");
  count = 0;
  total = 0;
  frameRate(60);

  canvas = createCanvas(parseInt(w), parseInt(h), WEBGL);
  canvas.className = "canvas-side";
  canvas.parent(container) 
  // define initial state
  colorMode(RGB, 1);
  models = [];
  for (let i=0; i<num; i++) {
    models.push(
      {
        position: createVector((random() * 2 - 1) * trange, (random() * 2 - 1) * trange, (random() * 2 - 1) * trange),
        rotation: {x: random(), y: random(), z:random()},
        size: random() * 30 + 10,
        color: color(random(), random(), random())
      }
    );
  }
}

function draw() {
  // (optionally) cache pv and e matrices to speedup computations
  if (cached) {
    pv = pvMatrix();
    e = eMatrix();
  }
  background(1);
  models.forEach(element => {
    push();
    translate(element.position);
    rotateX(element.rotation.x);
    rotateY(element.rotation.y);
    rotateZ(element.rotation.z);
    // cache model matrix, just before drawing it
    m = mMatrix();
    let picked = cached ? mousePicking({ mMatrix: m, size: element.size, pvMatrix: pv, eMatrix: e, shape: Tree.SQUARE})
      : mousePicking({ mMatrix: m, size: element.size * 2.5, shape: Tree.SQUARE})
    fill(picked ? 'red' : element.color);
    box(element.size);
    pop();
    checkFPS()
  }
  );
}

function checkFPS(){
  const fps = frameRate();
  total += fps;
  count++;
  avg = total/count
  if(fpsText){
    fpsText.innerHTML = "FPS: " + fps.toFixed(1) + " / Promedio FPS: " + avg.toFixed(2)
  }
}
