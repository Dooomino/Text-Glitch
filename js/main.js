window.onload = function () {
  //  update();

  init();
  console.log("innerWidth:" + innerWidth);
  console.log("innerHeight:" + innerHeight);
  console.log("ScWidth:" + screen.width);
  console.log("SCHeight:" + screen.height);
};

window.onresize = init;

var output = [];
var json = "";
var fontsize = 53;
var svg = d3.selectAll("svg");
var Rrange = 0;
var noiseVal = 0;
var colorVal = $("#colorSelector").val();
var cx = 0,
  cy = 0;

var blob;

function randFlip() {
  return Math.random() * 100 % 2 == 0 ? -1 : 1;
}

function noiseColor(hex, noiseAmt) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result)
    return null;
  var r = parseInt((255 - parseInt(result[1], 16)) * noiseAmt / 100);
  var g = parseInt((255 - parseInt(result[2], 16)) * noiseAmt / 100);
  var b = parseInt((255 - parseInt(result[3], 16)) * noiseAmt / 100);

  if (r < 10) r = '0' + r.toString(16);
  if (g < 10) g = '0' + g.toString(16);
  if (b < 10) b = '0' + b.toString(16);

  return '#' + r + g + b;
}

function getInvert(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result)
    return null;

  var r = 255 - parseInt(result[1], 16);
  var g = 255 - parseInt(result[2], 16);
  var b = 255 - parseInt(result[3], 16);

  if (r < 10) r = '0' + r.toString(16);
  if (g < 10) g = '0' + g.toString(16);
  if (b < 10) b = '0' + b.toString(16);

  // console.log(r,g,b)
  return '#' + r + g + b;
}

// algorithm origin: 
// http://www.w3.org/TR/2011/REC-css3-color-20110607/#hsl-color
function hueToRgb(m1, m2, h) {
  if (h < 0) h += 1;
  if (h > 1) h -= 1;
  if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
  if (h * 2 < 1) return m2;
  if (h * 3 < 2) return m1 + (m2 - m1) * (2 / 3 - h) * 6;
  return m1;
}

function randomHslToHex() {
  var clamp = function (v, min, max) {
    return Math.max(min, Math.min(v, max));
  };

  var h = clamp(Math.random(), 0.4, 1);
  var s = clamp(Math.random(), 0.3, 0.4);
  var l = clamp(Math.random(), 0.3, 0.4);
  var r, g, b;

  if (s == 0)
    r = g = b = l;

  var m2, m1;
  if (l <= 0.5) {
    m2 = l * (s + 1);
  } else {
    m2 = l + s - l * s;
  }
  m1 = l * 2 - m2;

  r = parseInt(255 * hueToRgb(m1, m2, h + 1 / 3));
  g = parseInt(255 * hueToRgb(m1, m2, h));
  b = parseInt(255 * hueToRgb(m1, m2, h - 1 / 3));
  // console.log([m1, m2, h], [r, g, b]);

  if (r < 10) r = '0' + r.toString(16);
  if (g < 10) g = '0' + g.toString(16);
  if (b < 10) b = '0' + b.toString(16);
  return '#' + r + g + b;
}

function init() {
  d3.selectAll("svg")
    .attr("width", screen.width * 0.9)
    .attr("height", screen.height * 0.8);
  var bar = $("#rand");
  bar.val(bar.attr('min') + Math.random() * bar.attr('max'));
  bar = $("#noise");
  bar.val(bar.attr('min') + Math.random() * bar.attr('max'));


  onTextChange();
  updateColor();
  updateRand();
  updateNoise();

  Create();
}

function updateRand() {
  var bar = $("#rand");
  var randT = $("#randValue");
  randT.val(parseInt(bar.val()));
  Rrange = parseInt(bar.val());
}

function updateRandFromInput() {
  var bar = $("#rand");
  var randT = $("#randValue");
  if (randT.val() > parseInt(bar.attr('max')))
    randT.val(parseInt(bar.attr('max')));
  bar.val(randT.val());
  Rrange = parseInt(bar.val());
}

function updateNoise() {
  var bar = $("#noise");
  var noiseText = $("#noiseValue");
  noiseText.val(bar.val());
  noiseVal = parseInt($("#noiseValue").val());
}

function updateNoiseFromInput() {
  var bar = $("#noise");
  var noiseText = $("#noiseValue");
  if (noiseText.val() > parseInt(bar.attr('max')))
    noiseText.val(parseInt(bar.attr('max')));
  bar.val(noiseText.val());
  noiseVal = parseInt($("#noiseValue").val());
}


function updateColor() {
  var example = $("#example");
  var colorP = $("#colorSelector");
  var colorT = $("#colorText");
  example.css("color", colorP.val());
  colorT.val(colorP.val());
  colorVal = $("#colorSelector").val();
}

function updateColorFromInput() {
  var example = $("#example");
  var colorP = $("#colorSelector");
  var colorT = $("#colorText");
  example.css("color", colorP.val());
  colorP.val(colorT.val());
  colorVal = $("#colorSelector").val();
}


function updateSize() {
  var bar = $("#size");
  var fontText = $("#fontValue");
  var example = $("#example");
  fontText.val(bar.val());
  fontsize = bar.val();
  example.css("font-size", bar.val() + "px");
}

function updateSizeFromInput() {
  var bar = $("#size");
  var fontText = $("#fontValue");
  var example = $("#example");
  if (fontText.val() > parseInt(bar.attr('max')))
    fontText.val(parseInt(bar.attr('max')));
  bar.val(fontText.val());
  fontsize = fontText.val();
  example.css("font-size", fontText.val() + "px");
}

function onTextChange() {
  var example = $("#example");
  example.html($("#text-input").val());
}

function update() {
  $(".progress").removeClass("inactive").addClass("active");

  setTimeout(Create(), 2000);
  setTimeout(function () {
    $(".progress").removeClass("active");
    $(".progress").addClass("inactive");
  }, 3000);
}

function Create() {
  var text = $("#text-input").val();
  //  var text = "Hello";
  if (text.length > 0) {
    //    console.log(text);
    var c = document.createElement("canvas"),
      ctx = c.getContext("2d");
    var map = $("#map");
    ctx.font = "bold " + fontsize + "px sans-serif";

    var m = ctx.measureText(text);
    var sx = m.actualBoundingBoxRight - m.actualBoundingBoxLeft;
    var sy = m.actualBoundingBoxAscent - m.actualBoundingBoxDescent;
    sx = Math.ceil(sx);
    sy = Math.ceil(sy);
    ctx.canvas.width = sx * 2;
    ctx.canvas.height = sy * 2;
    ctx.font = "bold " + fontsize + "px Verdana";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(text, ctx.canvas.width / 2, ctx.canvas.height / 2 + sy * 0.6);

    var ltx = 0,
      lty = 0,
      tw = ctx.canvas.width,
      th = ctx.canvas.height + sy;
    var d = ctx.getImageData(ltx, lty, tw, th);

    c.remove();
    var data = Array.from(d.data);
    var imgd = [];
    //Normalize data
    for (var i = 0; i < data.length; i += 4) {
      var lightness = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
      if (data[i + 3] < 255)
        imgd.push(lightness);
      else
        imgd.push(255);
    }

    // init Pramas
    var imgd_tr = [];
    output = [];
    while (imgd.length) {
      imgd_tr.push(imgd.splice(0, tw));
    }
    cx = imgd_tr[0].length;
    cy = imgd_tr.length;
    var threshold = Math.ceil(0.1 * fontsize + 0.1 * Rrange);

    // Calculate color distortion
    for (var i = 0; i < cy; i++) {
      var noiseFac = parseInt(Math.random() * cx);
      var offset = parseInt(Math.random() * (cx - threshold));
      var randNoise = Math.random() * noiseVal;
      var line = [];
      for (var j = 0; j < cx; j++) {
        //Calculate white noise
        //Determin if this pixel is noise
        var randDet = parseInt(Math.random() * noiseVal);
        if (randDet % 7 == 0) {
          line.push({
            data: imgd_tr[i][j],
            x: i,
            y: j,
            inv: true,
            color: randomHslToHex()
          });
          continue;
        }
        //if not, generate noise lines
        //if the pixel has data 
        if (imgd_tr[i][j] > 0) {
          // determin the line should appare or not
          if (Math.abs(noiseFac - (j + offset)) <= threshold &&
            (noiseFac % 6 == 0 || randFlip() < 0)) {

            line.push({
              data: imgd_tr[i][j],
              x: i,
              y: j,
              inv: true,
              color: noiseColor(colorVal, randNoise)
            });
          } else {
            line.push({
              data: imgd_tr[i][j],
              x: i,
              y: j,
              inv: false,
              color: colorVal
            });
          }
        }
        //random pick pixel if there is no data 
        else {
          // determin the line should appare or not
          if (Math.abs(noiseFac - (j + offset)) <= threshold &&
            (noiseFac % 6 == 0 || randFlip() < 0)) {

            line.push({
              data: 0,
              x: i,
              y: j,
              inv: true,
              color: noiseColor(colorVal, randNoise)
            });
          }
        }
      }
      output.push(line);
    }
    //DEBUG
    //    console.log(output);

    // Draw data 
    draw(output);

    //DEBUG
    //    ctx.strokeRect(ltx, lty, tw, th);
    //    map.append(c);

    // Generate Json file
    json = JSON.stringify(output);
    var file = "data:text/json;charset=utf-8," + encodeURIComponent(json);
    var el = $('#downloadData');
    el.attr("href", file);
    el.attr("download", "data.json");

  }
}

function draw(output) {
  colorVal = $("#colorSelector").val();
  noiseVal = parseInt($("#noiseValue").val());

  svg.selectAll("g").remove();
  var sizeX = svg.attr("width");
  var rects = sizeX / cx; // rect width; 
  svg.attr("height", rects * cy);
  var sizeY = svg.attr("height");

  var scaleX = d3.scaleLinear()
    .domain([0, cx])
    .range([0, sizeX]);
  var scaleY = d3.scaleLinear()
    .domain([0, cy])
    .range([0, sizeY]);
  //create Rows of pixels as groups
  var row = svg.selectAll(".row")
    .data(output)
    .join(
      enter => enter.append("g")
      .attr("class", "row")
      .attr('transform', (d, i) =>
        'translate(' + randFlip() * Rrange * Math.random() + ',' + (i * rects) + ')'
      ),
      up => up.selectAll(".row")
      .attr('transform', (d, i) =>
        'translate(' + randFlip() * Rrange * Math.random() + ',' + (i * rects) + ')'
      ),
      exit => exit.selectAll(".row").remove()
    );

  //for each rows insert pixels where value is not 0/null 
  var column = row.selectAll(".pixel")
    .data((d) => d)
    .join(
      enter => enter.append("rect")
      .attr("class", "pixel")
      .attr("x", (d) => scaleX(d.y))
      .attr("y", 0)
      .attr("width", rects)
      .attr("height", rects)
      .style("stroke", (d) => d.color)
      .style("stroke-width", (d) => d.inv ? "0" : "1")
      .style("fill", (d) => d.color),

      up => up.selectAll(".pixel")
      .attr("class", "pixel")
      .attr("x", (d, j) => scaleX(j))
      .attr("y", 0)
      .attr("width", rects)
      .attr("height", rects)
      .style("stroke", (d) => d.color)
      .style("stroke-width", (d) => d.inv ? "0" : "1")
      .style("fill", (d) => d.color),

      exit => exit.selectAll(".pixel").remove()
    );

  // Prepare Download
  var download = $('#svg').clone();
  download.css("background-color", "black");
  download = download[0].outerHTML;
  var prepend = '<?xml version="1.0" standalone="no"?>\r\n';
  const DOMURL = window.URL || window.webkitURL || window;
  blob = new Blob([prepend, download.toString()], {
    type: 'image/svg+xml;charset=utf-8'
  });
  var url = DOMURL.createObjectURL(blob);
  var el = $('#downloadSVG');
  el.attr("href", url);
  el.attr("download", "download.svg");

}

function downloadImg() {
  var canvas = document.createElement("canvas");
  canvas.width = $("#svg").width();
  canvas.height = $("#svg").height();
  var ctx = canvas.getContext("2d");
  const DOMURL = window.URL || window.webkitURL || window;
  var url = DOMURL.createObjectURL(blob);
  var img = new Image();
  img.onload = function () {
    ctx.drawImage(img, 0, 0);
    var png = canvas.toDataURL("image/png");
    //    console.log(png);
    $("#downloadPNG").attr("href", png);
    $("#downloadPNG").attr("download", "Output.png");
    $("#downloadPNG")[0].click();
  };
  img.src = url;
  img.remove();
}