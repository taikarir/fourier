let points = [];
let data;

function preload() {
  data = loadStrings('./nike-4-logo-pack/nike-4-logo-svg-vector.svg');
  console.log(data);
}

function setup() {
  createCanvas(800, 800);
  extractPoints(data);
}

function draw() {
  background(255);
  translate(width/2, height/2);
  
  // Display the extracted points
  stroke(255, 0, 0); // Red stroke color
  strokeWeight(10); // Thick stroke weight
  
  for (let i = 0; i < points.length; i++) {
    let px = map(points[i].x, 0, 192.756, 0, width);
    let py = map(points[i].y, 0, 192.756, 0, height);
    point(px, py);
  }
}

function extractPoints(data) {
  let svgData = data.join('');
  //let pathStartIndex = svgData.indexOf('<path');
  //let pathEndIndex = svgData.indexOf('/>', pathStartIndex);
  //let pathData = svgData.substring(pathStartIndex, pathEndIndex);
  let pathList = svgData.match(/<path[^>]+d *= *([^>]+)>/gi);
  console.log(pathList.groups);

  let pathData = pathList.join('').match(/d *= *([^>]+)>/gi).join('');

  let matches = pathData.match(/[\w][ \-\.\d]+/ig);
  console.log(matches);

  let cx = 0;
  let cy = 0;
  if (matches) {
    for (let i = 0; i < matches.length; i++) {
      let values = matches[i].match(/ *([\-]?\d*[\.]?\d{0,3})/ig);
      let type = matches[i][0];

      values = values.slice(1, values.length-1);

      for (var j = 0; j < values.length; j++) {
        values[j] = Math.floor(values[j]);
      }
      console.log(values);
      
      if (type==="M" || type==="L") {
        cx = values[0];
        cy = values[1];
      } else if (type==="m" || type==="l") {
        cx += values[0];
        cy += values[1];
      } else if (type==="H") {
        cx = values[0];
      } else if (type==="V") {
        cy = values[0];
      } else if (type==="h") {
        cx += values[0];
      } else if (type==="v") {
        cy += values[0];
      } else if (type==="C") {
        cx = values[0];
        cy = values[1];
        points.push({x: cx, y: cy});
        cx = values[2];
        cy = values[3];
        points.push({x: cx, y: cy});
        cx = values[4];
        cy = values[5];
      } else if (type==="c") {
        cx + values[0];
        cy += values[1];
        points.push({x: cx, y: cy});
        cx += values[2];
        cy += values[3];
        points.push({x: cx, y: cy});
        cx += values[4];
        cy += values[5];
      }
      points.push({x: cx, y: cy});
      points.push({x: cx, y: cy});
    }
  }
  console.log(points);
}

