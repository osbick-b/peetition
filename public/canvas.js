// --------- tutorial for canvas
// https://daily-dev-tips.com/posts/javascript-mouse-drawing-on-the-canvas/

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
let coord = { x: 0, y: 0 };
let hasSigned;

//=====================================//

canvas.addEventListener("mousedown", startSignature);
document.addEventListener("mouseup", finishAndSave);

// window.addEventListener("resize", resize);

//=====================================//

// function resize(){
//     ctx.canvas.width = window.innerWidth;
//     ctx.canvas.height = window.innerHeight;
// }

function reposition(e) {
    coord.x = e.clientX - canvas.offsetLeft;
    coord.y = e.clientY - canvas.offsetTop;
    console.log(coord.x, coord.y);
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
    // add save part --- maybe better do it on submit, just get value and shove it to db
    let hasSigned = true;
    let canvasData = canvas.toDataURL();
    document.getElementById("signature").value = canvasData;
    console.log("value", document.getElementById("signature").value);
}

