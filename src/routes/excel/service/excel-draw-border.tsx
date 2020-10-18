let drawTriangle = function(ctx:CanvasRenderingContext2D, ratio:number) {
    ctx.strokeStyle = "#b2b2b2";
    ctx.beginPath();
    ctx.moveTo(11 * ratio,23 * ratio);
    ctx.lineTo(27 * ratio, 23 * ratio)
    ctx.lineTo(27 * ratio, 7 * ratio);
    ctx.lineTo(11 * ratio, 23 * ratio);
    ctx.fillStyle = "#b4b4b4";
    ctx.fill();
}

export { drawTriangle }