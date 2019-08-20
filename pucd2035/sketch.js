
let string = 'hello';

let font;
let fontData;
let outline;
let boundingBox;
let path;
let test;

function getBezierPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
	let output = [];
	let steps = 20;
	for (let i = 0; i <= steps; i++) {
		let t = i / steps;
		let x = bezierPoint(x1, x2, x3, x4, t);
		let y = bezierPoint(y1, y2, y3, y4, t);
		output.push({x: x, y: y});
	}
	return output;
}

function getPathOutline(cmds) {

	// output to store the paths
	let output = [];

	// current pen position
	let cx = 0;
	let cy = 0;

	// start position of current contour
	let startX = 0;
	let startY = 0;

	// store the current path
	let currPath = [];

	for (let cmd of cmds) {

		switch (cmd.type) {
			case 'M': // move to
				startX = cmd.x;
				startY = cmd.y;
				cx = cmd.x;
				cy = cmd.y;
				currPath = [{x: cx, y: cy}];
				break;
			case 'L': // line to
				line(cx, cy, cmd.x, cmd.y);
				currPath.push({x: cmd.x, y: cmd.y});
				cx = cmd.x;
				cy = cmd.y;
				break;
			case 'C': // curve to
				bezier(cx, cy, cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
				currPath = currPath.concat(getBezierPoints(cx, cy, cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y));
				cx = cmd.x;
				cy = cmd.y;
				break;
			case 'Q': // quad to
				beginShape();
				vertex(cx, cy);
				quadraticVertex(cmd.x1, cmd.y1, cmd.x, cmd.y);
				endShape();
				currPath = currPath.concat(getBezierPoints(cx, cy, cmd.x1, cmd.y1, cmd.x1, cmd.y1, cmd.x, cmd.y));
				cx = cmd.x;
				cy = cmd.y;
				break;
			case 'Z': // close
				line(cx, cy, startX, startY);
				currPath.push({x: startX, y: startY});
				output.push(currPath);
				break;
		}

	}

	return output;

}

function drawPathOutline(cmds) {
	// current pen position
	let cx = 0;
	let cy = 0;
	// start position of current contour
	let startX = 0;
	let startY = 0;
	for (let cmd of cmds) {
		switch (cmd.type) {
			case 'M': // move to
				startX = cmd.x;
				startY = cmd.y;
				cx = cmd.x;
				cy = cmd.y;
				break;
			case 'L': // line to
				line(cx, cy, cmd.x, cmd.y);
				cx = cmd.x;
				cy = cmd.y;
				break;
			case 'C': // curve to
				bezier(cx, cy, cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
				cx = cmd.x;
				cy = cmd.y;
				break;
			case 'Q': // quad to
				beginShape();
				vertex(cx, cy);
				quadraticVertex(cmd.x1, cmd.y1, cmd.x, cmd.y);
				endShape();
				cx = cmd.x;
				cy = cmd.y;
				break;
			case 'Z': // close
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

	console.log(path.commands);
	console.log(getPathOutline(path.commands));

	test = getPathOutline(path.commands);
	// var currWidth = 0;
	// for (var i = 0; i < string.length; i++) {
	// 	outline = font.textToPoints(string.charAt(i), 0, 0, 10, {sampleFactor: 5, simplifyThreshold: 0});
	// 	boundingBox = font.textBounds(string.charAt(i), 0, 0, 10);
	// }
}

function draw() {
	background(51);

	scale (2, 2);

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

	push();
		translate(50, 400);
		for (let i = 0; i < test.length; i++) {
			for (let j = 0; j < test[i].length; j++) {
				ellipse(test[i][j].x, test[i][j].y, 5, 5);
			}
		}
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
