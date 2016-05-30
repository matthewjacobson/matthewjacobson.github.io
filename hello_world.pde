/* @pjs preload="picture.jpg"; */

PImage src;
int warpSize = 50;
float xNoiseResolution = 0.03;
float yNoiseResolution = 0.005;
boolean mouseHover = false;
int countKeyPresses = 0;

void setup()
{
  size(380, 582);
  src = loadImage("picture.jpg");
  src.resize(380 + warpSize, 582 + warpSize);
}

void draw() {
  float sceneRatio = (float(frameCount) - 1) / 200;
  
  xNoiseResolution = map(mouseX, 0, width, 0.05, 0);
  yNoiseResolution = map(mouseY, 0, height, 0.01, 0);
  
  if (mouseHover) {
    loadPixels();
    for (int x = 0; x < width; x++) {
      for (int y = 0; y < height; y++) {
        int loc = x + y * width;
        int mod = floor(warpSize * map(sin(map(noise(xNoiseResolution * x, yNoiseResolution * y), 0, 1, 0, 2 * PI) + 2 * PI * sceneRatio + map(y, 0, height, 0, 2 * PI)), -1, 1, 0, 1));
        pixels[loc] = src.get(x + mod, y);
      }
    }
    updatePixels();
  }
  else {
    image(src, 0, 0);
  }
  println(countKeyPresses);
}

void mouseOver() {
  mouseHover = true;
}

void mouseOut() {
  mouseHover = false;
}

void mouseClicked() {
  link("https://en.wikipedia.org/wiki/Paul_Erd%C5%91s");
}

interface Javascript {}
Javascript javascript=null;
void bindJavascript(Javascript js) { javascript=js; }

void keyPressed() {
  if (key == CODED) {
    if (keyCode == RIGHT || keyCode == LEFT) {
      src = loadImage("picture.jpg");
      src.resize(380 + warpSize, 582 + warpSize);
      if (keyCode == RIGHT) countKeyPresses++;
      else if (keyCode == LEFT) countKeyPresses--;
      if (countKeyPresses < 0) countKeyPresses = countKeyPresses + 4;
      if (countKeyPresses % 4 == 1) src.filter(BLUR, 3);
      else if (countKeyPresses % 4 == 2) src.filter(POSTERIZE, 3);
      else if (countKeyPresses % 4 == 3) {
        src.filter(BLUR, 3);
        src.filter(POSTERIZE, 3);
      }
    }
  }
}
