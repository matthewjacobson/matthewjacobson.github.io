let string = 'hello';

let font;
let fontData;
let boundingBox;
let paths;
let walls;
let floodSize;

let index;
let pressed;

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

function lineLineIntersection(l1, l2) {
	let diffLA = {x: l1.x2 - l1.x1, y: l1.y2 - l1.y1};
	let diffLB = {x: l2.x2 - l2.x1, y: l2.y2 - l2.y1};
	let compareA = diffLA.x * l1.y1 - diffLA.y * l1.x1;
	let compareB = diffLB.x * l2.y1 - diffLB.y * l2.x1;
	let check1 = (diffLA.x * l2.y1 - diffLA.y * l2.x1) < compareA;
	let check2 = (diffLA.x * l2.y2 - diffLA.y * l2.x2) < compareA;
	let check3 = (diffLB.x * l1.y1 - diffLB.y * l1.x1) < compareB;
	let check4 = (diffLB.x * l1.y2 - diffLB.y * l1.x2) < compareB;
	if ((check1 ^ check2) && (check3 ^ check4)) {
		let lDetDivInv = 1 / ((diffLA.x * diffLB.y) - (diffLA.y * diffLB.x));
		let x = -((diffLA.x * compareB) - (compareA * diffLB.x)) * lDetDivInv;
		let y = -((diffLA.y * compareB) - (compareA * diffLB.y)) * lDetDivInv;
		return {bIntersect: true, x: x, y: y};
	} else {
		return {bIntersect: false};
	}
}

function getRayCast(ray) {
	let hit = false;
	let intersect = {x: ray.x + ray.dx, y: ray.y + ray.dy};
	let rayLine = {x1: ray.x, y1: ray.y, x2: ray.x + ray.dx, y2: ray.y + ray.dy};
	let minDist = dist(ray.x, ray.y, ray.x + ray.dx, ray.y + ray.dy);
	for (let i = 0; i < walls.length; i++) {
		let checkIntersect = lineLineIntersection(rayLine, walls[i]);
		if (checkIntersect.bIntersect) {
			hit = true;
			let currDist = dist(ray.x, ray.y, checkIntersect.x, checkIntersect.y);
			if (currDist < minDist) {
				minDist = currDist;
				intersect = {x: checkIntersect.x, y: checkIntersect.y};
			}
		}
	}
	return {bHit: hit, intersection: intersect};
}

function setup() {
	createCanvas(windowWidth, windowHeight, WEBGL);
	font = opentype.parse(fontData.bytes.buffer);
	let outline = getPathOutline(font.getPath(string, 0, 0, 72).commands);
	paths = outline.paths;
	boundingBox = {x: outline.xMin, y: outline.yMin, w: outline.xMax - outline.xMin, h: outline.yMax - outline.yMin};
	getWalls();
	floodSize = 100;
	index = 0;
	pressed = true;
}

function draw() {
	background(0);
	noStroke();
	fill(255);
	translate(-windowWidth / 2, -windowHeight / 2);
	for (let i = 0; i < walls.length; i++) {
		line(walls[i].x1, walls[i].y1, walls[i].x2, walls[i].y2);
	}
	let flood = [];
	for (let i = 0; i < 20; i++) {
		let angle = 2 * Math.PI * i / 20;
		let ray = {x: mouseX, y: mouseY, dx: floodSize * Math.cos(angle), dy: floodSize * Math.sin(angle)};
		let cast = getRayCast(ray);
		flood.push({angle: angle, x: cast.intersection.x, y: cast.intersection.y});
	}
// 	for (let i = 0; i < walls.length; i++) {
// 		let angle = Math.atan2(walls[i].y1 - mouseY, walls[i].x1 - mouseX);
// 		let distance = dist(mouseX, mouseY, walls[i].x1, walls[i].y1);
// 		if (distance < floodSize) {
// 			let ray = {x: mouseX, y: mouseY, dx: distance * Math.cos(angle), dy: distance * Math.sin(angle)};
// 			let cast = getRayCast(ray);
// 			flood.push({angle: angle, x: cast.intersection.x, y: cast.intersection.y});
// 		}
// 		let angleLeft = Math.atan2(walls[i].y1 - mouseY, walls[i].x1 - mouseX) - 0.1;
// 		let rayLeft = {x: mouseX, y: mouseY, dx: floodSize * Math.cos(angleLeft), dy: floodSize * Math.sin(angleLeft)};
// 		let castLeft = getRayCast(rayLeft);
// 		flood.push({angle: angleLeft, x: castLeft.intersection.x, y: castLeft.intersection.y});
// 		let angleRight = Math.atan2(walls[i].y1 - mouseY, walls[i].x1 - mouseX) + 0.1;
// 		let rayRight = {x: mouseX, y: mouseY, dx: floodSize * Math.cos(angleRight), dy: floodSize * Math.sin(angleRight)};
// 		let castRight = getRayCast(rayRight);
// 		flood.push({angle: angleRight, x: castRight.intersection.x, y: castRight.intersection.y});
// 	}
	flood.sort((a, b) => a.angle - b.angle);

	if (frameCount == 1) {
		console.log(flood);
	}
// 	beginShape();
// 		for (let i = 0; i < flood.length; i++) {
// 			vertex(flood[i].x, flood[i].y);
// 		}
// 	endShape(CLOSE);
	
// 	for (let i = 0; i < flood.length; i++) {
// 		beginShape();
// 			fill(255);
// 			vertex(mouseX, mouseY);
// 			fill(0);
// 			vertex(flood[i].x, flood[i].y);
// 			fill(0);
// 			vertex(flood[(i + 1) % flood.length].x, flood[(i + 1) % flood.length].y);
// 		endShape();
// 	}
	
		beginShape();
			fill(255);
			vertex(mouseX, mouseY);
			if (flood[index % flood.length].x < 0 && flood[(index + 1) % flood.length].x < 0) {
				fill(0);
				vertex(flood[index % flood.length].x, flood[index % flood.length].y);
				fill(0);
				vertex(flood[(index + 1) % flood.length].x, flood[(index + 1) % flood.length].y);
			} else {
				fill(0);
				vertex(flood[(index + 1) % flood.length].x, flood[(index + 1) % flood.length].y);
				fill(0);
				vertex(flood[index % flood.length].x, flood[index % flood.length].y);
			}
		endShape();
	if (pressed) console.log(index);
	pressed = false;
	
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
	getWalls();
}

function mouseWheel(event) {
	floodSize = Math.max(50, Math.min(500, floodSize + Math.max(-2, Math.min(2, event.delta))));
}

function keyPressed() {
	pressed = true;
	index++;
}
