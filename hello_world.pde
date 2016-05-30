PImage src;

void setup()
{
  size(380, 582);
  src = loadImage("picture.jpg");
  src.resize(380, 0);
}

void draw(){  
  image(src, 0, 0);
  println(mouseX, mouseY);
}
