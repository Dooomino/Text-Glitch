var c = document.createElement("canvas"),
  ctx = c.getContext("2d");
var size = 16;
ctx.font = "bold " + size + "px sans-serif";

var m = ctx.measureText("Hello");
var sx = m.actualBoundingBoxRight - m.actualBoundingBoxLeft;
var sy = m.actualBoundingBoxAscent - m.actualBoundingBoxDescent;
sx = Math.ceil(sx);
sy = Math.ceil(sy);

ctx.font = "bold " + size + "px Verdana";
ctx.fillStyle = "black";
ctx.textAlign = "center";
ctx.fillText("Hello", ctx.canvas.width / 2, ctx.canvas.height / 2);

var map = document.getElementById("map");
map.append(c);
var ltx = ctx.canvas.width / 2 - sx / 2,
  lty = ctx.canvas.height / 2 - sy,
  tw = sx,
  th = sy;

//var w = tw - ltx;
var d = ctx.getImageData(ltx, lty, tw, th);

//DEBUG
//ctx.strokeRect(ltx, lty, tw, th);
//ctx.putImageData(d, 10, 70);

var data = Array.from(d.data);
var imgd = []
for (var i = 0; i < data.length; i += 4) {
  let lightness = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
  if (data[i + 3] < 255)
    imgd.push(lightness);
  else
    imgd.push(255);
}
console.log("img:", imgd);

var output = []
while (imgd.length) {
  output.push(imgd.splice(0, tw));
}

console.log(m, sx, sy);
var json = JSON.stringify(output);

console.log([output]);

//function download() {
var file = "data:text/json;charset=utf-8," + encodeURIComponent(json);
var el = document.getElementById('download');
el.setAttribute("href", file);
el.setAttribute("download", "data.json");
//  element.style.display = 'none';

//  element.click();
//}
//copy(output.join('\n'))
