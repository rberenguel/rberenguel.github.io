var centerX;
var centerY;
var totalDegrees = 360;
var radius;
var frDiv = 150;

function setup() {
    createCanvas(
        window.innerWidth,
        window.innerHeight
    );
    background(0);
    centerX = width / 2;
    centerY = height / 2;
    if (width < height) {
        radius = width / 1.4;
    } else {
        radius = height / 1.4;
    }
    radius_stalk = radius/30.0
    angleMode(DEGREES);
}

function draw() {
    beginShape();
    stroke(40, 255, 0, 25);
    noFill();
    for (var i = 0; i < totalDegrees; i++) {
        var noiseFactor = noise(i / 35, frameCount / frDiv);
        var x = centerX + radius_stalk * sin(i) * noiseFactor;
        var y = centerY + radius+radius * cos(i) * noiseFactor;
        curveVertex(x, y);
    }
    endShape(CLOSE);
    beginShape();
    stroke(255, 40, 0, 25);
    noFill();
    for (var i = 0; i < totalDegrees; i++) {
        var dampening = Math.exp(-Math.abs(totalDegrees % 72 - 36)/36);
        var noiseFactor = noise(i / 72, frameCount / frDiv)*2*dampening;
        var x = centerX + radius * sin(i) * noiseFactor;
        var y = centerY + radius * cos(i) * noiseFactor;
        curveVertex(x, y);
    }
    endShape(CLOSE);
    if (radius <= width / 20) {
        noLoop();
    }
    radius -= 0.60;
    frDiv += 0.5;
}

function windowResized() {
    setup();
    loop();
}

