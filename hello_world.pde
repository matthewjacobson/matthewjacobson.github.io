/* @pjs preload="picture.jpg"; */

PImage src;

void setup()
{
  size(380, 582);
  src = loadImage("picture.jpg");
  src.resize(380, 582);
}

void draw(){  
  loadPixels();
  for (int x = 0; x < width; x++) {
    for (int y = 0; y < height; y++) {
      int loc = x + y * width;
      int mod = floor(warpSize * map(sin(map(noise(xNoiseResolution * x, yNoiseResolution * y), 0, 1, 0, 2 * PI) + 2 * PI * sceneRatio + map(y, 0, height, 0, 2 * PI)), -1, 1, 0, 1));
      pixels[loc] = image.get((x + mod) % width, y);
    }
  }
  updatePixels();
}
