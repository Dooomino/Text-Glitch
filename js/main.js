window.onload = function () {
  //  update();
  init();
}
window.onresize = init;

var output = [];
var json = "";
var fontsize = 16;
var svg = d3.selectAll("svg");
var Rrange = 0;

function init() {
  d3.selectAll("svg")
    .attr("width", innerWidth * 0.9)
    .attr("height", innerHeight * 0.8);
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
    ctx.canvas.width = sx * 1.2;
    ctx.canvas.height = sy * 1.2;
    ctx.font = "bold " + fontsize + "px Verdana";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText(text, ctx.canvas.width / 2, ctx.canvas.height / 2 + sy / 2);

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
    output = [];
    while (imgd.length) {
      output.push(imgd.splice(0, tw));
    }
    //DEBUG
    //    console.log(output);    
    draw(output);
    //    ctx.strokeRect(ltx, lty, tw, th);
    //map.append(c);
    json = JSON.stringify(output);
    var file = "data:text/json;charset=utf-8," + encodeURIComponent(json);
    var el = document.getElementById('download');
    el.setAttribute("href", file);
    el.setAttribute("download", "data.json");
  }
}


function draw(data) {
  svg.selectAll("g").remove();
  var sizeX = svg.attr("width");
  var rects = sizeX / data[0].length; // rect width; 
  svg.attr("height", rects * data.length);
  var sizeY = svg.attr("height");

  var scaleX = d3.scaleLinear()
    .domain([0, data[0].length])
    .range([0, sizeX]);
  var scaleY = d3.scaleLinear()
    .domain([0, data.length])
    .range([0, sizeY]);

  var row = svg.selectAll(".row")
    .data(data)
    .join(
      enter => enter.append("g")
      .attr("class", "row")
      .attr('transform', (d, i) =>
        'translate(0,' + (i * rects) + ')'
      ),
      up => up.selectAll(".row")
      .attr('transform', (d, i) =>
        'translate(0,' + (i * rects) + ')'
      ),
      exit => exit.selectAll(".row").remove()
    );

  var column = row.selectAll(".pixel")
    .data((d) => d)
    .join(
      enter => enter.append("rect")
      .attr("class", "pixel")
      .attr("x", (d, j) => scaleX(j))
      .attr("y", 0)
      .attr('transform', (d, i) =>
        'translate(' + Rrange * Math.random() + ',0)'
      )
      .attr("width", rects)
      .attr("height", rects)
      .style("fill", (d) => d == 0 ? "black" : "green"),
      up => up.selectAll(".pixel")
      .attr("class", "pixel")
      .attr("x", (d, j) => scaleX(j))
      .attr("y", 0)
      .attr('transform', (d, i) =>
        'translate(' + Rrange * Math.random() + ',0)'
      )
      .attr("width", rects)
      .attr("height", rects)
      .style("fill", (d) => d == 0 ? "black" : "green"),
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
}
