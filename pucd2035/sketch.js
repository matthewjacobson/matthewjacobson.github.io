
let string = 'hello';

let font;
let fontData;
let outline;
let boundingBox;
let path;

function drawPathOutline(cmds) {
  // current pen position
  let cx = 0;
  let cy = 0;
  // start position of current contour
  let startX = 0;
  let startY = 0;
  for (let cmd of cmds) {
    switch (cmd.type) {
      case 'M':
        startX = cmd.x;
        startY = cmd.y;
        cx = cmd.x;
        cy = cmd.y;
        break;
      case 'L':
        line(cx, cy, cmd.x, cmd.y);
        cx = cmd.x;
        cy = cmd.y;
        break;
      case 'C':
        bezier(cx, cy, cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
        cx = cmd.x;
        cy = cmd.y;
        break;
      case 'Q':
        beginShape();
        vertex(cx, cy);
        quadraticVertex(cmd.x1, cmd.y1, cmd.x, cmd.y);
        endShape();
        cx = cmd.x;
        cy = cmd.y;
        break;
      case 'Z':
        // to complete path
        line(cx, cy, startX, startY);
        break;
		}
  }
}

function preload() {
	fontData = loadBytes('assets/font.ttf');
}

function setup() {
	createCanvas(windowWidth, windowHeight);

	font = opentype.parse(fontData.bytes.buffer);
	path = font.getPath(string, 0, 0, 72);

	// var currWidth = 0;
	// for (var i = 0; i < string.length; i++) {
	// 	outline = font.textToPoints(string.charAt(i), 0, 0, 10, {sampleFactor: 5, simplifyThreshold: 0});
	// 	boundingBox = font.textBounds(string.charAt(i), 0, 0, 10);
	// }
}

function draw() {
	background(51);
	push();
		translate(50, 125);
		path.draw(drawingContext); // opentype.js
	pop();
	push();
		noFill();
		stroke(0);
		strokeWeight(2);
		translate(50, 225);
		drawPathOutline(path.commands); // p5js
	pop();
	// beginShape();
	// 	translate(-boundingBox.x * width / boundingBox.w, -boundingBox.y * height / boundingBox.h);
	// 	for (let i = 0; i < outline.length; i++) {
	// 		let p = outline[i];
	// 		vertex(p.x * width / boundingBox.w, p.y * height / boundingBox.h);
	// 	}
	// endShape(CLOSE);
}

function windowResized() {
   resizeCanvas(windowWidth, windowHeight);
}
