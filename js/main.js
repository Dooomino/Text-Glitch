window.onload = function () {
  //  update();
  init();
  console.log("innerWidth:" + innerWidth);
  console.log("innerHeight:" + innerHeight);
  console.log("ScWidth:" + screen.width);
  console.log("SCHeight:" + screen.height);
}
window.onresize = init;

var output = [];
var json = "";
var fontsize = 16;
var svg = d3.selectAll("svg");
var Rrange = 0;

var cx = 0,
  cy = 0;

function randFlip() {
  return Math.random() * 100 % 2 == 0 ? -1 : 1;
}

function noiseColor(hex, noiseAmt) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result)
    return null;
  var r = parseInt(((255 - result[1], 16) * (100 + noiseAmt) / 100));
  var g = parseInt(((255 - result[2], 16) * (100 + noiseAmt) / 100));
  var b = parseInt(((255 - result[3], 16) * (100 + noiseAmt) / 100));

  if (r < 10) r = '0' + r.toString(16);
  if (g < 10) g = '0' + g.toString(16);
  if (b < 10) b = '0' + b.toString(16);

  return '#' + r + g + b
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

  update();
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
    randT.val(parseInt(bar.attr('max')))
  bar.val(randT.val());
  Rrange = parseInt(bar.val());
}

function updateSize() {
  var bar = $("#size");
  var fontText = $("#fontValue");
  var example = $("#example");
  fontText.val(bar.val());
  fontsize = bar.val();
  example.css("font-size", bar.val() + "px");
}

function updateNoise() {
  var bar = $("#noise");
  var noiseText = $("#noiseValue");
  noiseText.val(bar.val());
}

function updateNoiseFromInput() {
  var bar = $("#noise");
  var noiseText = $("#noiseValue");
  if (noiseText.val() > parseInt(bar.attr('max')))
    noiseText.val(parseInt(bar.attr('max')))
  bar.val(noiseText.val());
}


function updateColor() {
  var example = $("#example");
  var colorP = $("#colorSelector");
  var colorT = $("#colorText");
  example.css("color", colorP.val());
  colorT.val(colorP.val());
}

function updateColorFromInput() {
  var example = $("#example");
  var colorP = $("#colorSelector");
  var colorT = $("#colorText");
  example.css("color", colorP.val());
  colorP.val(colorT.val());
}

function updateSizeFromInput() {
  var bar = $("#size");
  var fontText = $("#fontValue");
  var example = $("#example");
  if (fontText.val() > parseInt(bar.attr('max')))
    fontText.val(parseInt(bar.attr('max')))
  bar.val(fontText.val());
  fontsize = fontText.val();
  example.css("font-size", fontText.val() + "px");
}

function onTextChange() {
  var example = $("#example");
  example.html($("#text-input").val());
}

function getColor(d, colorVal, noiseVal) {
  var randNoise = Math.random() * noiseVal;

  return d.inv ? noiseColor(colorVal, randNoise) : colorVal
}


function update() {
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

    var data = Array.from(d.data);
    var imgd = []
    for (var i = 0; i < data.length; i += 4) {
      let lightness = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
      if (data[i + 3] < 255)
        imgd.push(lightness);
      else
        imgd.push(255);
    }
    var imgd_tr = [];
    output = []
    while (imgd.length) {
      imgd_tr.push(imgd.splice(0, tw));
    }
    cx = imgd_tr[0].length;
    cy = imgd_tr.length;
    var noiseFac = parseInt(Math.random() * cy) + 1;
    for (var i = 0; i < imgd_tr.length; i++) {
      var line = [];
      for (var j = 0; j < imgd_tr[i].length; j++) {
        noiseFac = parseInt(Math.random() * cy) + 1;
        if (imgd_tr[i][j] == 255) {
          if (j % noiseFac != 0 || j == 0) {
            line.push({
              data: imgd_tr[i][j],
              x: i,
              y: j,
              inv: false
            })
          } else {
            line.push({
              data: imgd_tr[i][j],
              x: i,
              y: j,
              inv: true
            })
          }
        } else {
          if (j % noiseFac == 0 && j != 0) {
            line.push({
              data: 0,
              x: i,
              y: j,
              inv: true,
            })
          }
        }
      }
      output.push(line)
    }
    //DEBUG
    //    console.log(output);
    draw(output);
    //DEBUG
    //    ctx.strokeRect(ltx, lty, tw, th);
    //map.append(c);
    json = JSON.stringify(output);
    var file = "data:text/json;charset=utf-8," + encodeURIComponent(json);
    var el = $('#downloadData');
    el.attr("href", file);
    el.attr("download", "data.json");
  }
}

function draw(output) {
  var colorVal = $("#colorSelector").val();
  var noiseVal = parseInt($("#noiseValue").val());
  var invColor = noiseColor(colorVal, noiseVal);
  //  console.log(invColor);

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

  var column = row.selectAll(".pixel")
    .data((d) => d)
    .join(
      enter => enter.append("rect")
      .attr("class", "pixel")
      .attr("x", (d) => scaleX(d.y))
      .attr("y", 0)
      //      .attr('transform', (d, i) => 'translate(0,' + Rrange / 2 * Math.random() + ')')
      .attr("width", rects)
      .attr("height", rects)
      .style("fill", (d) => getColor(d, colorVal, noiseVal)),
      up => up.selectAll(".pixel")
      .attr("class", "pixel")
      .attr("x", (d, j) => scaleX(j))
      .attr("y", 0)
      //      .attr('transform', (d, i) => 'translate(0,' + Rrange / 2 * Math.random() + ')')
      .attr("width", rects)
      .attr("height", rects)
      .style("fill", (d) => getColor(d, colorVal, noiseVal)),
      exit => exit.selectAll(".pixel").remove()
    );

  //  svg.selectAll("rect")
  //    .data(data)
  //    .join(
  //      enter => enter.append("g")
  //      .attr("class", "row").append("rect")
  //      .attr("x", function (d, i) {
  //        console.log(i);
  //      })
  //      .attr("y", function (d, i) {
  //        //        console.log(scaleY(i));
  //      })
  //      .attr("fill", (d, i) => d[i] == 0 ? "black" : "green")
  //    )

  // Prepare Download
  var download = $('#svg').clone();
  download.css("background-color", "black");
  download = download[0].outerHTML;
  var prepend = '<?xml version="1.0" standalone="no"?>\r\n'
  const blob = new Blob([prepend, download.toString()], {
    type: 'image/svg+xml'
  });
  var url = window.URL.createObjectURL(blob);
  var el = $('#downloadSVG');
  el.attr("href", url);
  el.attr("download", "download.svg");

}
