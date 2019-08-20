let font;
function preload() {
	font = loadFont('assets/font.otf');
}

let string = 'hello';
let outline;
let boundingBox;
function setup() {
	createCanvas(windowWidth, windowHeight);
	outline = font.textToPoints(string, 0, 0, 10, {sampleFactor: 5, simplifyThreshold: 0});
	boundingBox = font.textBounds(string, 0, 0, 10);
}

function draw() {
	background(51);
	beginShape();
		translate(-boundingBox.x * width / boundingBox.w, -boundingBox.y * height / boundingBox.h);
		for (let i = 0; i < outline.length; i++) {
			let p = outline[i];
			vertex(p.x * width / boundingBox.w, p.y * height / boundingBox.h);
		}
	endShape(CLOSE);
}

function windowResized() {
   resizeCanvas(windowWidth, windowHeight);
}
