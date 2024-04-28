var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'uniform mat4 u_GlobalRotateMatrix;\n' + 
  'void main() {\n' +
  '  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
  '}\n';

var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
  canvas = document.getElementById('webgl')
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
}


let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_globalAngleY = 0;
let g_globalAngleX = 0;
let g_rearBodySeg1AngleY = 0;
let g_rearBodySeg1AngleX = 0;
let g_rearBodySeg2AngleY = 0;
let g_rearBodySeg2AngleX = 0;
let g_rearBodySeg3Angle = 0;
let g_frontBodyAngle = 0;
let g_pecFinAngle = 0;
let g_swimAnimation = false;
let g_secondaryAnimation = false;

function addActionsForHtmlUI() {
  document.getElementById('animationSwimOnButton').onclick = function() {g_swimAnimation=true};
  document.getElementById('animationSwimOffButton').onclick = function() {g_swimAnimation=false};
 
  document.getElementById('rearSeg1Slide').addEventListener('input', function() { g_rearBodySeg1AngleY = this.value; renderScene();})
  document.getElementById('rearSeg2Slide').addEventListener('input', function() { g_rearBodySeg2AngleY = this.value; renderScene();})
  document.getElementById('rearSeg3Slide').addEventListener('input', function() { g_rearBodySeg3Angle = this.value; renderScene();})
  document.getElementById('angleYSlide').addEventListener('input', function() { g_globalAngleY = this.value; renderScene(); })
  document.getElementById('angleXSlide').addEventListener('input', function() { g_globalAngleX = this.value; renderScene(); })
}

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();
  canvas.onmousedown=click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) }}
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.4, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  requestAnimationFrame(tick);
}

function click(ev) {
  if (ev.shiftKey && g_secondaryAnimation==false) {
    g_swimAnimation = false;
    g_secondaryAnimation = true;
  }
  else if (ev.shiftKey && g_secondaryAnimation==true) {
    g_secondaryAnimation = false;
  }

  let [x, y] = convertCoordinatesEventToGL(ev);
  g_globalAngleX += x;
  g_globalAngleY += y;
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; 
  var y = ev.clientY; 
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  return ([x, y]);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
  g_seconds = performance.now()/1000.0 - g_startTime;
  updateAnimationAngles();
  renderScene();
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_swimAnimation) {
    g_rearBodySeg1AngleY = (5*Math.sin(g_seconds));
    g_rearBodySeg2AngleY = (10*Math.sin(g_seconds));
    g_rearBodySeg3Angle = (5*Math.sin(g_seconds));
    g_frontBodyAngle = (5*Math.sin(g_seconds));
    g_pecFinAngle = (5*Math.sin(g_seconds));
  }
  else if (g_secondaryAnimation) {
    g_rearBodySeg1AngleX = (30*Math.sin(g_seconds))+30;
    g_rearBodySeg2AngleX = (10*Math.sin(g_seconds))+10;
    g_pecFinAngle = (5*(Math.sin(10*g_seconds)));
  }
}

var g_shapesList = [];

function renderScene() {
  var startTime = performance.now();
  var globalRotMat = new Matrix4().rotate(-g_globalAngleY, 0, 1, 0);
  globalRotMat.rotate(g_globalAngleX, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  var bodyColor = [0.5, 0.5, 0.5, 1.0];
  if(g_secondaryAnimation == true) {
    bodyColor = [0.3, 0, 0, 0.4];
  }
  var mainBodySeg = new Cube(bodyColor);
  mainBodySeg.matrix.translate(-.15, -.25, -0.1875)
  mainBodySeg.matrix.scale(0.3, 0.25,0.375);
  mainBodySeg.render();

  var rearBodySeg1 = new Cube(bodyColor);
  rearBodySeg1.matrix.rotate(-g_rearBodySeg1AngleY, 0, 1, 0);
  rearBodySeg1.matrix.rotate(g_rearBodySeg1AngleX, 1, 0, 0);
  var rearBodySeg1Coords = new Matrix4(rearBodySeg1.matrix);
  rearBodySeg1.matrix.scale(0.25, .2, 0.25);
  rearBodySeg1.matrix.translate(-0.5, -1.2, 0.755);
  rearBodySeg1.render();

  var rearBodySeg2 = new Cube(bodyColor);
  rearBodySeg2.matrix = rearBodySeg1Coords;
  rearBodySeg2.matrix.rotate(-g_rearBodySeg2AngleY, 0, 1, 0);
  rearBodySeg2.matrix.rotate(g_rearBodySeg2AngleX, 1, 0, 0)
  var rearBodySeg2Coords = new Matrix4(rearBodySeg2.matrix);
  rearBodySeg2.matrix.scale(0.2, 0.15, 0.275);
  rearBodySeg2.matrix.translate(-0.5, -1.6, 1.6);
  rearBodySeg2.render();

  var rearBodySeg3 = new Cube(bodyColor);
  rearBodySeg3.matrix = rearBodySeg2Coords;
  rearBodySeg3.matrix.rotate(-g_rearBodySeg3Angle, 0, 1, 0);
  var rearBodySeg3Coords1 = new Matrix4(rearBodySeg3.matrix);
  var rearBodySeg3Coords2 = new Matrix4(rearBodySeg3.matrix);
  rearBodySeg3.matrix.scale(0.15, 0.1, 0.149);
  rearBodySeg3.matrix.translate(-0.5, -2.35, 4.78);
  rearBodySeg3.render();

  var frontBodySeg = new Cube(bodyColor);
  frontBodySeg.matrix.rotate(g_frontBodyAngle, 0, 1, 0);
  var frontBodySegCoords = new Matrix4(frontBodySeg.matrix);
  frontBodySeg.matrix.scale(0.25, 0.2, 0.3)
  frontBodySeg.matrix.translate(-0.5, -1.25, -1.63)
  frontBodySeg.render();

  var head = new Cube(bodyColor);
  head.matrix = frontBodySegCoords;
  var headCoords1 = new Matrix4(head.matrix);
  var headCoords2 = new Matrix4(head.matrix);
  head.matrix.scale(0.75, 0.075, 0.2);
  head.matrix.translate(-0.5, -3, -3.46);
  head.render();

  var rightEye = new Cube([1,1,1,1]);
  rightEye.matrix = headCoords1;
  rightEye.matrix.translate(0.35, -0.205, -0.675)
  rightEye.matrix.scale(0.04, 0.04, 0.04)
  rightEye.render();

  var rightPupil = new Cube([0,0,0,1]);
  rightPupil.matrix = headCoords1;
  rightPupil.matrix.translate(0.4,0.1,0.1);
  rightPupil.matrix.scale(0.75, 0.75, 0.75)
  rightPupil.render();

  var leftEye = new Cube([1,1,1,1]);
  leftEye.matrix = headCoords2;
  leftEye.matrix.translate(-0.39, -0.205, -0.675)
  leftEye.matrix.scale(0.04, 0.04, 0.04)
  leftEye.render();

  var leftPupil = new Cube([0, 0, 0, 1]);
  leftPupil.matrix = headCoords2;
  leftPupil.matrix.translate(-0.1,0.15,0.1);
  leftPupil.matrix.scale(0.75, 0.75, 0.75);
  leftPupil.render();

  var dorsalFin = new TriangularPrism(bodyColor);
  dorsalFin.matrix.shear(0, 0, 0.25)
  dorsalFin.matrix.scale(0.01, 0.25, 0.15);
  dorsalFin.matrix.translate(0,0, -0.5)
  dorsalFin.render();

  var caudalFinTop = new TriangularPrism(bodyColor);
  caudalFinTop.matrix = rearBodySeg3Coords1;
  caudalFinTop.matrix.shear(0, 0, 0.45)
  caudalFinTop.matrix.scale(0.01, 0.4, 0.2)
  caudalFinTop.matrix.translate(0, -0.35, 3.61)
  caudalFinTop.render();

  var caudalFinBot = new TriangularPrism(bodyColor);
  caudalFinBot.matrix = rearBodySeg3Coords2;
  caudalFinBot.matrix.shear(0, 0, -0.2)
  caudalFinBot.matrix.scale(0.01, 0.2, 0.2)
  caudalFinBot.matrix.rotate(180, 0, 0, 1)
  caudalFinBot.matrix.translate(-1, 1, 3.1)
  caudalFinBot.render();

  var pectoralFinRight = new TriangularPrism(bodyColor);
  pectoralFinRight.matrix.shear(0, 0, 0.4)
  pectoralFinRight.matrix.rotate(-100, 0, 0, 1);
  pectoralFinRight.matrix.rotate(g_pecFinAngle, 1,0, 1);
  pectoralFinRight.matrix.scale(0.02, 0.35, 0.2);
  pectoralFinRight.matrix.translate(9, 0.43, -0.7)
  pectoralFinRight.render("right");

  var pectoralFinLeft = new TriangularPrism(bodyColor);
  pectoralFinLeft.matrix.rotate(100, 0, 0, 1)
  pectoralFinLeft.matrix.shear(0,0, 0.35)
  pectoralFinLeft.matrix.rotate(-g_pecFinAngle, 1,0, 1);
  pectoralFinLeft.matrix.scale(0.02, 0.35, 0.2);
  pectoralFinLeft.matrix.translate(-10,0.43, -0.8);
  pectoralFinLeft.render("left");


  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if(!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}