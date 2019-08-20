
let string = 'hello';

let font;
let fontData;
let outline;
let boundingBox;
let path;

function preload() {
	fontData = loadBytes('assets/font.otf');
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
