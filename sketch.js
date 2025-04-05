let numOfResampledPts = 500;
let drawing = []; // arr of points drawn by user

let path = []; // arr for storing reconstruction pts
//  var for time accumulator
let time = 0; // init time counter

//  flag for drawing done status
let drawingDone = false; // flag to know when drawing is finished

//  arr for fourier coefficients
let fourier = []; // will hold dft result

//  scale factor for epicycles (no scaling since centering drawing)
let scaleFactor = 1; // factor for scaling amplitude

//  var for time increment per step
let dt = 0; // time step value

//  var for speed multiplier
let speedMult = 0.6; // multiplier to adjust speed

//  flag for closing reconstruction path (if true, shape is closed)
let closedShape = false; // flag for closed shape reconstruction

//  var for number of epicycles to use
let numEpicycles = 0; // num of epicycles

// -------------- resample function --------------
// resamples an arr of points to have n evenly spaced points
function resample(points, n) {
  if (points.length < 2) return points; // if too few pts, return as is
  let totalLength = 0; // init total length
  for (let i = 1; i < points.length; i++) {
    totalLength += p5.Vector.dist(points[i - 1], points[i]); // add dist btw pts
  }
  let interval = totalLength / (n - 1); // calc interval btw new pts
  let newPoints = [points[0].copy()]; // start new arr with first pt
  let d = 0; // init accumulator for dist

  for (let i = 1; i < points.length; i++) {
    let prev = points[i - 1]; // current start pt
    let curr = points[i]; // current end pt
    let segmentDist = p5.Vector.dist(prev, curr); // dist btw current pts

    while (d + segmentDist >= interval) {
      let t = (interval - d) / segmentDist; // calc interp factor
      let nx = lerp(prev.x, curr.x, t); // calc new x using lerp
      let ny = lerp(prev.y, curr.y, t); // calc new y using lerp
      let newPoint = createVector(nx, ny); // create new pt vector

      newPoints.push(newPoint); // push new pt into new arr

      // prep for next segment, start from new pt
      prev = newPoint; // update prev pt

      segmentDist = p5.Vector.dist(prev, curr); // recalc remaining dist

      d = 0; // reset accumulator
    }
    d += segmentDist; // add segment dist to accumulator
  }
  return newPoints; // return resampled arr
}

// -------------- p5.js setup and event functions --------------
function setup() {
  createCanvas(600, 600); // create canvas of 600x600 pixels
  background(0); // set bg to black
}

function mousePressed() {
  drawing = []; // reset drawing arr

  path = []; // reset path arr

  fourier = []; // reset fourier arr

  drawingDone = false; // flag drawing as not done
  time = 0; // reset time counter
  background(0); // paiit canvas with black
}

function mouseDragged() {
  // capture mouse pts
  drawing.push(createVector(mouseX, mouseY)); // push current pt
  beginShape(); // start shape
  for (let p of drawing) {
    vertex(p.x, p.y); // add vertex for each pt
  }
  endShape(); // end shape drawing
}

function mouseReleased() {
  // resample drawn pts for smooth shape
  drawing = resample(drawing, numOfResampledPts);

  // center drawing by computing centroid of pts
  let centroid = createVector(0, 0); //  centroid vector
  for (let p of drawing) {
    centroid.add(p); // add each pt to centroid
  }
  centroid.div(drawing.length); // average to get centroid
  for (let p of drawing) {
    p.sub(centroid); // shift each pt by subtracting centroid
  }

  // convert drawing pts to complex numbers for dft computation
  let complex = []; // init arr for complex numbers
  for (let p of drawing) {
    complex.push({ re: p.x, im: p.y }); // push object with re and im vals
  }

  // compute discrete fourier transform
  fourier = dft(complex);
  // sort coefficients by amplitude in descending order
  fourier.sort((a, b) => b.amp - a.amp);

  // set dt so that time goes from 0 to two_pi in one cycle
  dt = (TWO_PI / fourier.length) * speedMult; // calc time step
  drawingDone = true; // mark drawing as finished

  // use all epicycles for reconstruction by default
  numEpicycles = fourier.length; // set num epicycles equal to fourier arr length
}

// computes dft of arr x (each element is complex {re, im})
// also adjusts frequency: for k > n/2, freq becomes k - n
function dft(x) {
  const N = x.length; // total num pts
  let X = []; // init arr for coefficients
  for (let k = 0; k < N; k++) {
    let re = 0; // init real accumulator
    let im = 0; // init imag accumulator
    for (let n = 0; n < N; n++) {
      const phi = (TWO_PI * k * n) / N; // calc phase angle
      re += x[n].re * cos(phi) + x[n].im * sin(phi); // add to real part
      im += -x[n].re * sin(phi) + x[n].im * cos(phi); // add to imag part
    }
    re /= N; // normalize real part
    im /= N; // normalize imag part
    const amp = sqrt(re * re + im * im); // calc amplitude
    const phase = atan2(im, re); // calc phase angle
    // adjust frequency to range from -n/2 to n/2 if needed
    let freq = k; // init freq as k
    if (k > N / 2) {
      freq = k - N; // adjust freq for negative values
    }
    X.push({ re, im, freq, amp, phase }); // push coefficient obj
  }
  return X; // return computed coefficients arr
}

// -------------- epicycle class --------------
// represents one epicycle for fourier reconstruction
class Epicycle {
  constructor(x, y, coeff) {
    this.x = x; // x coordinate of center
    this.y = y; // y coordinate of center
    this.freq = coeff.freq; // set freq from coefficient
    this.amp = coeff.amp * scaleFactor; // set amplitude with scaling
    this.phase = coeff.phase; // set phase from coefficient
  }
  // compute endpoint of epicycle at given time
  update(time) {
    let angle = this.phase + TWO_PI * this.freq * time; // calc angle using phase and freq
    let dx = this.amp * cos(angle); // calc x displacement
    let dy = this.amp * sin(angle); // calc y displacement
    return createVector(this.x + dx, this.y + dy); // return new endpoint as vector
  }
  // draw epicycle's circle on canvas
  display() {
    stroke(255, 100); // set stroke color with transparency
    noFill(); // no fill for circle
    ellipse(this.x, this.y, 2 * this.amp); // draw circle with diameter equal to 2 * amp
  }
}

// -------------- main draw loop --------------
function draw() {
  background(0); // clear canvas with black
  if (drawingDone) {
    // start from fixed center of canvas
    let prev = createVector(width / 2, height / 2); // set starting point at center
    // loop over first numEpicycles coefficients
    for (let i = 0; i < numEpicycles; i++) {
      let epi = new Epicycle(prev.x, prev.y, fourier[i]); // create new epicycle obj from coeff
      epi.display(); // draw epicycle circle
      let next = epi.update(time); // compute endpoint for current epicycle
      stroke(255); // set stroke to white for line
      line(prev.x, prev.y, next.x, next.y); // draw line from current center to endpoint
      prev = next; // update prev for next epicycle in chain
    }

    // use endpoint of last epicycle for reconstruction path
    path.unshift(prev.copy()); // add new endpoint at start of path arr
    if (path.length > 1000) {
      // if path arr too long
      path.pop(); // remove oldest point
    }

    // draw fourier reconstruction path on canvas
    stroke(255, 0, 255); // set stroke color magenta
    noFill(); // no fill for path shape
    beginShape(); // start shape for reconstruction path
    for (let p of path) {
      vertex(p.x, p.y); // add each pt in path as vertex
    }
    if (closedShape && path.length > 0) {
      // if closed shape flag set and path exists
      vertex(path[0].x, path[0].y); // close shape by connecting to first pt
    }
    endShape(); // finish drawing reconstruction shape

    // update time using dt increment
    time += dt; // add dt to time
    if (time > TWO_PI) {
      // if full cycle complete
      time = 0; // reset time counter
      path = []; // clear reconstruction path arr
    }
  }
}
