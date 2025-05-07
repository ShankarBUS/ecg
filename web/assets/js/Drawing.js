import { Vector } from './Math.js';
import { getLimbLead } from './Measurement.js';

const heartCanvas = document.getElementById('heartCanvas');
let heartSize = 320; // default heartCanvas size
let ecgColor = 'red';
let vectorColor = 'dodgerblue';
let axisColor = 'red';
let gridColor = 'rgba(100, 100, 100, 0.5)';

export function setCanvasDPI(canvas, width, height, r = 1, set2dTransform = true) {
    const ratio = Math.ceil(window.devicePixelRatio);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    if (set2dTransform) {
        canvas.getContext('2d').setTransform(ratio * r, 0, 0, ratio * r, 0, 0);
    }
}

export function setupHeartCanvas(heartCanvasSize) {
    let ratio = heartCanvasSize / heartSize;
    setCanvasDPI(heartCanvas, heartCanvasSize, heartCanvasSize, ratio);
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
}

export function drawPhaseVectorInHeart(phase, leadIndex) {
    const ctx = heartCanvas.getContext('2d');
    ctx.clearRect(0, 0, heartSize, heartSize);

    // Co-ordinate Axes and Lead Axis Vector
    drawAxes(ctx, leadIndex);

    // Phase Vector
    if (!phase.startPoint || !phase.endPoint || phase.type === 'flat') return;
    let sp = phase.startPoint;
    let ep = phase.endPoint;

    drawArrow(ctx, sp.x, sp.y, ep.x, ep.y, vectorColor, 2);

    // Projection Vector (of Phase on Lead)
    const lead = getLimbLead(leadIndex);
    const leadAngle = lead.axis * Math.PI / 180;
    const leadVector = new Vector(Math.cos(leadAngle), Math.sin(leadAngle));
    const phaseVector = new Vector(ep.x - sp.x, ep.y - sp.y);
    const dot = phaseVector.dot(leadVector);
    drawArrow(ctx, heartSize / 2, heartSize / 2,
        (heartSize / 2) + dot * (leadVector.x), (heartSize/2) + (dot * leadVector.y), 'green', 2);
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

export function drawArrow(ctx, startX, startY, endX, endY, color, lineWidth) {
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

let smallHeart = false;

export function handleWidthChange(width, init = false) {
    let handled = false;

    if ((smallHeart || init) && width >= 400) {
        setupHeartCanvas(320);
        smallHeart = false;
        handled = true;
    }
    else if ((!smallHeart || init) && width < 400) {
        setupHeartCanvas(200);
        smallHeart = true;
        handled = true;
    }
    return handled;
}
