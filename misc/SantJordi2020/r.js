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
    if (width < height) {
        initial_radius = width / 3;
    } else {
        initial_radius = height / 3;
    }
    radius = initial_radius;
    centerY = height / 2 - 0.6*radius;
    stalkRadius = radius/5.0;
    angleMode(DEGREES);
    maxY = -1;
    minStalk = height;
    stalkX = centerX;
    direction = "in";
    loops = 1;
    lastX = centerX;
    leafStart = height;
}

function decreaseRadius(radius){
    return radius*0.999;
}

function increaseRadius(radius){
    return radius*1.01;
}

function swapRadius(radius, direction){
    if (direction == "in"){
        return increaseRadius(radius);
    }
    return decreaseRadius(radius);
}

function rose(){
    beginShape();
    stroke(230, 40, 0, 25);
    noFill();
    for (var i = 0; i < totalDegrees; i++) {
        var angX = (i+frameCount%35)/72;
        var angY = i/72;
        var angularNoiseX = noise(angX, frameCount / frDiv);
        var angularNoiseY = noise(angY, frameCount / frDiv);
        var dampenedAngularNoise = angularNoiseX > 0.8 ? angularNoiseX : 1;
        var x = centerX + radius * cos(i) * dampenedAngularNoise;
        var y = centerY + radius * sin(i) * angularNoiseY;
        if( y > maxY){
            maxY = y;
        }
        curveVertex(x, y);
    }
    endShape(CLOSE);
}
function leaf(){
    if(frameCount > 300 && frameCount < 400){
        beginShape();
        stroke(40, 255, 0, 5);
        noFill();
        var initialY = leafStartY;
        var initialX = leafStartX;
        for(var i=0;i<200;i++){
            var angularNoiseX = noise(i%35, frameCount / frDiv);
            var x = initialX - cos(i/89)*i/200*radius/2;
            var y = initialY - stalkRadius * 0.5 * sin(i/91)*i/200*radius/2;
            curveVertex(x, y);
        }
        endShape(CLOSE);
    }
}

function stalk(){
    if(Math.abs(minStalk-maxY) > 10){
        beginShape();
        stroke(40, 255, 0, 35);
        noFill();
        var initialY = minStalk;
        for(var i=0;i<400;i++){
            var angularNoiseX = noise(i%4, frameCount / frDiv);
            var newX = newX = centerX + cos(frameCount)*stalkRadius *angularNoiseX;
            var x = newX;
            var y = initialY-i%200/200.0*(initialY-maxY)/15000.0*frameCount*sin(i)* angularNoiseX;
            if( y < minStalk){
                minStalk = y;
            }
            curveVertex(x, y);
        }
        stalkX = x;
        endShape(CLOSE);
    }
}

function draw() {
    rose();
    stalk();
    if(frameCount == 300){
        leafStartY = minStalk;
        leafStartX = stalkX;
        console.log(leafStart);
    }
    leaf();
    if (loops < 0){
        noLoop();
    }
    if (radius <= width / 20) {
        direction = "out";
        loops -= 1;
    }
    if (radius >= initial_radius && direction == "out"){
        direction = "in";
        loops -= 1;
    }
    radius = direction == "out" ? increaseRadius(radius) : decreaseRadius(radius);
    frDiv = direction == "out" ? frDiv + 0.50 : frDiv - 0.5;
}

function windowResized() {
    setup();
    loop();
}

