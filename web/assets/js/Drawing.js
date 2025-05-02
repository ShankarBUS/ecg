import { Point } from './Math.js';

const canvas = document.getElementById('heartCanvas');
let size = 512; // default canvas size

export function setupCanvas(canvasSize) {
    size = canvasSize;
    canvas.width = canvasSize;
    canvas.height = canvasSize;
}

export function drawPhaseVector(phase, time) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);

    if (!phase.startPoint || !phase.endPoint) return;
    const t = (time - phase.startTime) / phase.duration;
    let sp = phase.startPoint;
    let ep = new Point(
        sp.x + (phase.endPoint.x - phase.startPoint.x) * t,
        sp.y + (phase.endPoint.y - phase.startPoint.y) * t
    );

    const lgrad = ctx.createLinearGradient(cm2px(sp.x), cm2px(sp.y), cm2px(ep.x), cm2px(ep.y));
    lgrad.addColorStop(0, "transparent");
    lgrad.addColorStop(1, "yellow");
    ctx.strokeStyle = lgrad;
    ctx.beginPath();
    ctx.moveTo(cm2px(sp.x), cm2px(sp.y));
    ctx.lineTo(cm2px(ep.x), cm2px(ep.y));
    ctx.lineWidth = 10;
    ctx.stroke();

    const gradient = ctx.createRadialGradient(cm2px(ep.x), cm2px(ep.y), 1, cm2px(ep.x), cm2px(ep.y), 20);

    gradient.addColorStop(0, "yellow");
    gradient.addColorStop(1, "transparent");

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.arc(cm2px(ep.x), cm2px(ep.y), 20, 0, 2 * Math.PI);
    ctx.fill();
}

function cm2px(cm) {
    return cm * (size / 1024) * 800 / 12;
    // var dpi = 96;
    // var cpi = 2.54;
    // var ppd = window.devicePixelRatio;
    // return Math.round(cm * dpi * ppd / cpi);
}