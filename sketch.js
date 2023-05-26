class Complex {
    constructor(a, b) {
        this.re = a;
        this.im = b;
    }

    add(c) {
        this.re += c.re;
        this.im += c.im;
    }

    mult(c) {
        const re = this.re * c.re - this.im * c.im;
        const im = this.re * c.im + this.im * c.re;
        return new Complex(re, im);
    }
}

function dft(x) {
    const X = [];
    const N = x.length;
    for (let k = 0; k < N; k++) {
        let sum = new Complex(0, 0);
        for (let n = 0; n < N; n++) {
            const phi = (TWO_PI * k * n) / N;
            const c = new Complex(cos(phi), -sin(phi));
            sum.add(x[n].mult(c));
        }
        sum.re = sum.re / N;
        sum.im = sum.im / N;

        let freq = k;
        let amp = sqrt(sum.re * sum.re + sum.im * sum.im);
        let phase = atan2(sum.im, sum.re);
        X[k] = { re: sum.re, im: sum.im, freq, amp, phase };
    }
    return X;
}

const USER = 0;
const FOURIER = 1;
const PATHPOINTS = 2;

let x = [];
let fourierX;
let time = 0;
let path = [];
let drawing = [];
let state = -1;
let textValue;
let tInit = 0;

let period;
let shiftx;
let shifty;
let scale;

let showpoints;

function mousePressed() {
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        return;
    }
    state = USER;
    drawing = [];
    x = [];
    time = 0;
    path = [];
    document.getElementById("textarea").value = "";
    //document.getElementById("textarea").value += ("\n"+(mouseX-width/2)+","+(mouseY-height/2));
}

function mouseReleased() {
    if (mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
        return;
    }
    state = FOURIER;
    const skip = 1;
    for (let i = 0; i < drawing.length; i += skip) {
        x.push(new Complex(drawing[i].x, drawing[i].y));
    }
    fourierX = dft(x);

    fourierX.sort((a, b) => b.amp - a.amp);
}

function setup() {
    createCanvas(windowWidth/2, windowHeight);
    background(0);
    strokeWeight(5);
    textValue = document.getElementById("textarea").value;
}

function epicycles(x, y, rotation, fourier) {
    for (let i = 0; i < fourier.length; i++) {
        let prevx = x;
        let prevy = y;
        let freq = fourier[i].freq;
        let radius = fourier[i].amp;
        let phase = fourier[i].phase;
        x += radius * cos(freq * time + phase + rotation);
        y += radius * sin(freq * time + phase + rotation);

        stroke(255, 100);
        noFill();
        strokeWeight(3);
        ellipse(prevx, prevy, radius * 2);
        stroke(255);
        line(prevx, prevy, x, y);
   }
    return createVector(x, y);
}

function draw() {
    textSize(75);
    textAlign(CENTER, CENTER);
    fill(255, 255, 255);
    //text("quantum\ncomputing", width/2, height/2);
    period = document.getElementById("period").value;
    shiftx = parseInt(document.getElementById("shiftx").value);
    shifty = parseInt(document.getElementById("shifty").value);
    scale = parseInt(document.getElementById("scale").value)/100;
    showpoints = (document.getElementById("showpoints").checked);
    
    document.getElementById("periodlabel").innerHTML=period;
    document.getElementById("shiftxlabel").innerHTML=shiftx;
    document.getElementById("shiftylabel").innerHTML=shifty;
    document.getElementById("scalelabel").innerHTML=scale;
    
    if (document.getElementById("textarea").value != textValue) {
        textValue = document.getElementById("textarea").value;
        textLines = textValue.split('\n');
        drawing = [];
        x = [];
        path = [];
        for (let i = 0; i < textLines.length; i++) {
            var coords = textLines[i].split(',');
            coords = [(parseInt(coords[0])*scale+shiftx), (parseInt(coords[1])*scale+shifty)];
            //coords = [(parseInt(coords[0])), (parseInt(coords[1]))];
            //console.log(coords);
            drawing.push(createVector(coords[0], coords[1]));
            //console.log(drawing);
        }
        state = FOURIER;
        tInit = millis();
        const skip = 1;
        for (let i = 0; i < drawing.length; i += skip) {
            x.push(new Complex(drawing[i].x, drawing[i].y));
        }

        fourierX = dft(x);

        fourierX.sort((a, b) => b.amp - a.amp);
    } else {
    }
    if (state == USER) {
        background(0);
        let point = createVector(mouseX - width / 2, mouseY - height / 2);
        drawing.push(point);
        stroke(255);
        strokeWeight(5);
        noFill();
        beginShape();
        for (let v of drawing) {
            vertex(v.x + width / 2, v.y + height / 2);
        }
        endShape();
    } else if (state == FOURIER) {
        background(0);
        textSize(75);
        textAlign(CENTER, CENTER);
        fill(255, 255, 255);
        //text("quantum\ncomputing", width/2, height/2);
        let v = epicycles(width / 2, height / 2, 0, fourierX);
        path.unshift(v);
        
        strokeWeight(5);
        
        /*beginShape();
        noFill();
        stroke(0, 255, 255);
        for (let i = 0; i < path.length; i++) {
            stroke((i*10+100)%256, (i*10+200)%256, (i*10+300)%256);
            vertex(path[i].x, path[i].y);
        }
        endShape();*/
        
        let s;
        strokeWeight(5);
        for (let i = path.length-1; i > 0; i--) {
         //   console.log(path[i]);
        
            s = {x: path[i].x/500, y: path[i].y/500};
            stroke(256/2*cos(s.x)+256/2, 256/2*sin(s.y)+256/2, 256/2*sin(s.x+100)+256/2);
            line(path[i].x, path[i].y, path[i-1].x, path[i-1].y);
            
        }

        const dt = TWO_PI / fourierX.length;
        if (document.getElementById("textarea").value === "") {
            time += dt;
        } else {
            if (showpoints) {
                for (let i = 0; i < drawing.length; i++) {
                    strokeWeight(8);
                    s = {x: drawing[i].x/500, y: drawing[i].y/500};
                    stroke(256/2*cos(s.x)+256/2, 256/2*sin(s.y)+256/2, 256/2*sin(s.x+100)+256/2);
                    point(drawing[i].x+width/2, drawing[i].y+height/2);
                }
            }
            //time = TWO_PI*((millis()-tInit)/1000)/period;
            //console.log(time);
            if (document.getElementById("textarea").value === "") {
                // -------fix this---------//
                time = TWO_PI*((millis()-tInit)/1000)/period;
                console.log(time);
            } else {
                time += dt;
            }
        }

        if (time > TWO_PI) {
            tInit = millis();
            time = 0;
            path = [];
        }
    }
}

