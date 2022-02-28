// --------- tutorial for canvas
// https://daily-dev-tips.com/posts/javascript-mouse-drawing-on-the-canvas/

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let coord = { x: 0, y: 0 };
let hasSigned;

//=====================================//

canvas.addEventListener("mousedown", startSignature);
document.addEventListener("mouseup", finishAndSave);

// window.addEventListener("resize", resize, false);

//=====================================//

// function resize(){
//     canvas.width = window.innerWidth*0.8;
//     canvas.height = window.innerHeight*0.4;
// }
// resize();

console.log("offset XY", canvas.offsetLeft, canvas.offsetTop);
function reposition(e) {
    coord.x = e.clientX - 1.5*canvas.offsetLeft;
    coord.y = e.clientY - 1.5*canvas.offsetTop;
    console.log("coord", coord.x, coord.y);
    console.log("client", e.clientX, e.clientY);
}

function startSignature(e) {
    canvas.addEventListener("mousemove", draw);
    reposition(e);
}

function draw(e) {
    ctx.beginPath();
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.strokeStyle = "orange";
    ctx.moveTo(coord.x, coord.y);
    reposition(e);
    ctx.lineTo(coord.x, coord.y);
    ctx.stroke();
     if (
         coord.x < 0 ||
         coord.x > canvas.width ||
         coord.y < 0 ||
         coord.y > canvas.height
     ) {
         return canvas.removeEventListener("mousemove", draw);
     }
}

function finishAndSave() {
    canvas.removeEventListener("mousemove", draw);
    let hasSigned = true;
    let canvasData = canvas.toDataURL();
    document.getElementById("signature").value = canvasData;
}
