import { Point } from './Math.js';
import { getLimbLead } from './Measurement.js';

const heartCanvas = document.getElementById('heartCanvas');
let heartSize = 320; // default heartCanvas size
let ecgColor = 'red';
let impulseColor = 'dodgerblue';
let impulseColor2 = '#1e90ff11';
let axisColor = 'red';
let gridColor = 'rgba(100, 100, 100, 0.5)';

function setCanvasDPI(canvas, size, r = 1, set2dTransform = true) {
    const ratio = Math.ceil(window.devicePixelRatio);
    canvas.width = size * ratio;
    canvas.height = size * ratio;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    if (set2dTransform) {
        canvas.getContext('2d').setTransform(ratio * r, 0, 0, ratio * r, 0, 0);
    }
}

export function setupHeartCanvas(heartCanvasSize) {
    heartCanvasSize;
    let ratio = heartCanvasSize / heartSize;
    setCanvasDPI(heartCanvas, heartCanvasSize, ratio);
}

function drawAxes(ctx, leadIndex) {
    // Draw grid
    ctx.beginPath();
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.moveTo(heartSize / 2, 0);
    ctx.lineTo(heartSize / 2, heartSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, heartSize / 2);
    ctx.lineTo(heartSize, heartSize / 2);
    ctx.stroke();
    ctx.closePath();

    let angle = getLimbLead(leadIndex).axis * Math.PI / 180;

    // Draw axis
    ctx.beginPath();
    const x = heartSize / 2 + (heartSize / 2 * Math.cos(angle));
    const y = heartSize / 2 + (heartSize / 2 * Math.sin(angle));
    drawArrow(ctx, heartSize / 2, heartSize / 2, x, y, axisColor, 2);

    // Draw angle arc and label
    ctx.beginPath();
    ctx.arc(heartSize / 2, heartSize / 2, 10, 0, angle);
    ctx.strokeStyle = axisColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = axisColor;
    ctx.font = "12px Cascadia Code";
    ctx.fillText(`${getLimbLead(leadIndex).axis}°`,
        heartSize - 50, 20);
}

export function drawPhaseVectorInHeart(phase, time, leadIndex) {
    const ctx = heartCanvas.getContext('2d');
    ctx.clearRect(0, 0, heartSize, heartSize);

    drawAxes(ctx, leadIndex);

    if (!phase.startPoint || !phase.endPoint) return;
    const t = (time - phase.startTime) / phase.duration;
    let sp = phase.startPoint;
    let ep = phase.endPoint;
    let cep = new Point(
        sp.x + (ep.x - sp.x) * t,
        sp.y + (ep.y - sp.y) * t
    );

    drawArrow(ctx, sp.x, sp.y, ep.x, ep.y, impulseColor, 2);

    const gradient = ctx.createRadialGradient(cep.x, cep.y, 1, cep.x, cep.y, 20);

    gradient.addColorStop(0, impulseColor);
    gradient.addColorStop(1, impulseColor2);

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.arc(cep.x, cep.y, 20, 0, 2 * Math.PI);
    ctx.fill();
}

export function drawECGWave(ecgCanvas, ecgPoints) {
    if (!ecgCanvas || !ecgPoints) return;
    const ecgWidth = ecgCanvas.width;
    const ecgHeight = ecgCanvas.height;

    let ctx = ecgCanvas.getContext('2d');
    ctx.clearRect(0, 0, ecgCanvas.width, ecgCanvas.height);
    ctx.beginPath();
    ctx.lineWidth = 1;

    for (var x = 0; x <= ecgWidth; x += 20) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ecgHeight);
    }

    for (var y = 0; y <= ecgHeight; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(ecgWidth, y);
    }

    ctx.strokeStyle = gridColor;
    ctx.stroke();

    ctx.beginPath();
    ecgPoints.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });

    ctx.strokeStyle = ecgColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function drawArrow(ctx, startX, startY, endX, endY, color, lineWidth) {
    const headLength = 10;
    const angle = Math.atan2(endY - startY, endX - startX);

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - headLength * Math.cos(angle - Math.PI / 6),
        endY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        endX - headLength * Math.cos(angle + Math.PI / 6),
        endY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(endX, endY);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
}

export function handleWidthChange(width) {
    if (width < 400) {
        setupHeartCanvas(200);
    } else {
        setupHeartCanvas(320);
    }
}