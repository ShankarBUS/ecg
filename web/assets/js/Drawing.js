import { Point } from './Math.js';

const canvas = document.getElementById('heartCanvas');
let size = 320; // default canvas size

export function setupHeartCanvas(canvasSize) {
    size = canvasSize;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
}

export function drawPhaseVectorInHeart(phase, time) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);

    if (!phase.startPoint || !phase.endPoint) return;
    const t = (time - phase.startTime) / phase.duration;
    let sp = phase.startPoint;
    let ep = new Point(
        sp.x + (phase.endPoint.x - phase.startPoint.x) * t,
        sp.y + (phase.endPoint.y - phase.startPoint.y) * t
    );

    const lgrad = ctx.createLinearGradient(sp.x, sp.y, ep.x, ep.y);
    lgrad.addColorStop(0, "#1e90ff11");
    lgrad.addColorStop(1, "dodgerblue");
    ctx.strokeStyle = lgrad;
    ctx.beginPath();
    ctx.moveTo(sp.x, sp.y);
    ctx.lineTo(ep.x, ep.y);
    ctx.lineWidth = 10;
    ctx.stroke();

    const gradient = ctx.createRadialGradient(ep.x, ep.y, 1, ep.x, ep.y, 20);

    gradient.addColorStop(0, "dodgerblue");
    gradient.addColorStop(1, "#1e90ff11");

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.arc(ep.x, ep.y, 20, 0, 2 * Math.PI);
    ctx.fill();
}
