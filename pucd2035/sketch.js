
let string = 'hello';

let font;
let fontData;
let boundingBox;
let paths;
let walls;

function getBezierPoints(x1, y1, x2, y2, x3, y3, x4, y4) {
	let output = [];
	let steps = 10;
	let xMin = x1;
	let xMax = x1;
	let yMin = y1;
	let yMax = y1;
	for (let i = 0; i <= steps; i++) {
		let t = i / steps;
		let x = bezierPoint(x1, x2, x3, x4, t);
		let y = bezierPoint(y1, y2, y3, y4, t);
		if (x < xMin) xMin = x;
		if (x > xMax) xMax = x;
		if (y < yMin) yMin = y;
		if (y > yMax) yMax = y;
		output.push({x: x, y: y});
	}
	return {points: output, xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax};
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
	// store the bounding box
	let xMin = cmds[0].x;
	let xMax = cmds[0].x;
	let yMin = cmds[0].y;
	let yMax = cmds[0].y;
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
				if (cx < xMin) xMin = cx;
				if (cx > xMax) xMax = cx;
				if (cy < yMin) yMin = cy;
				if (cy > yMax) yMax = cy;
				break;
			case 'L': // line to
				currPath.push({x: cmd.x, y: cmd.y});
				if (cmd.x < xMin) xMin = cmd.x;
				if (cmd.x > xMax) xMax = cmd.x;
				if (cmd.y < yMin) yMin = cmd.y;
				if (cmd.y > yMax) yMax = cmd.y;
				cx = cmd.x;
				cy = cmd.y;
				break;
			case 'C': // curve to
				let curve = getBezierPoints(cx, cy, cmd.x1, cmd.y1, cmd.x2, cmd.y2, cmd.x, cmd.y);
				currPath = currPath.concat(curve.points);
				if (curve.xMin < xMin) xMin = curve.xMin;
				if (curve.xMax > xMax) xMax = curve.xMax;
				if (curve.yMin < yMin) yMin = curve.yMin;
				if (curve.yMax > yMax) yMax = curve.yMax;
				cx = cmd.x;
				cy = cmd.y;
				break;
			case 'Q': // quad to
				let quad = getBezierPoints(cx, cy, cmd.x1, cmd.y1, cmd.x1, cmd.y1, cmd.x, cmd.y);
				currPath = currPath.concat(quad.points);
				if (quad.xMin < xMin) xMin = quad.xMin;
				if (quad.xMax > xMax) xMax = quad.xMax;
				if (quad.yMin < yMin) yMin = quad.yMin;
				if (quad.yMax > yMax) yMax = quad.yMax;
				cx = cmd.x;
				cy = cmd.y;
				break;
			case 'Z': // close
				line(cx, cy, startX, startY);
				currPath.push({x: startX, y: startY});
				if (startX < xMin) xMin = startX;
				if (startX > xMax) xMax = startX;
				if (startY < yMin) yMin = startY;
				if (startY > yMax) yMax = startY;
				output.push(currPath);
				break;
		}
	}
	return {paths: output, xMin: xMin, xMax: xMax, yMin: yMin, yMax: yMax};
}

function preload() {
	fontData = loadBytes('assets/font.ttf');
}

function getWalls() {
	walls = [];
	let xOffset = boundingBox.x + boundingBox.w / 2;
	let yOffset = boundingBox.y + boundingBox.h / 2;
	let padding = 0.8;
	let scale = Math.min(padding * windowWidth / boundingBox.w, padding * windowHeight / boundingBox.h);
	for (let i = 0; i < paths.length; i++) {
		for (let j = 0; j < paths[i].length - 1; j++) {
			let x1 = scale * (paths[i][j].x - xOffset) + windowWidth / 2;
			let y1 = scale * (paths[i][j].y - yOffset) + windowHeight / 2;
			let x2 = scale * (paths[i][j + 1].x - xOffset) + windowWidth / 2;
			let y2 = scale * (paths[i][j + 1].y - yOffset) + windowHeight / 2;
			walls.push({x1: x1, y1: y1, x2: x2, y2: y2});
		}
	}
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	font = opentype.parse(fontData.bytes.buffer);
	let outline = getPathOutline(font.getPath(string, 0, 0, 72).commands);
	paths = outline.paths;
	boundingBox = {x: outline.xMin, y: outline.yMin, w: outline.xMax - outline.xMin, h: outline.yMax - outline.yMin};
	getWalls();
}

function draw() {
	background(0);
	noFill();
	stroke(255);
	for (let i = 0; i < walls.length; i++) {
		line(walls[i].x1, walls[i].y1, walls[i].x2, walls[i].y2);
	}
	for (let i = 0; i < 20; i++) {
		let angle = 2 * Math.PI * i / 20;
		line(mouseX, mouseY, mouseX + 50 * Math.cos(angle), mouseY + 50 * Math.sin(angle));
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	getWalls();
}
