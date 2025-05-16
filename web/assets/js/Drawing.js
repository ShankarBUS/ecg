import { Vector3 } from './Math.js';
import { getLeadPoints, getLimbLead } from './Measurement.js';

const heartCanvas = document.getElementById('heartCanvas');
let heartSize = 320; // default heartCanvas size

let isDarkTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

// #region Colors

let ecgColor_dark = 'rgba(0, 255, 64, 1)';
let ecgColor_light = 'black';

let ecgGridColor_dark = 'rgba(0, 225, 255, 0.5)';
let ecgGridColor_light = 'rgba(255, 55, 98, 0.5)';

let vectorColor = 'dodgerblue';
let axisColor = 'red';
let gridColor = 'rgba(100, 100, 100, 0.5)';

// #endregion

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
    const leadVector = new Vector3(Math.cos(leadAngle), Math.sin(leadAngle), 0);
    const phaseVector = new Vector3(ep.x - sp.x, ep.y - sp.y, ep.z - sp.z);
    const dot = phaseVector.dot(leadVector);
    drawArrow(ctx, heartSize / 2, heartSize / 2,
        (heartSize / 2) + dot * (leadVector.x), (heartSize / 2) + (dot * leadVector.y), 'green', 2);
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

// Standard: 25mm = 200px, so 1mm = 8px
const mmPerPx = 8; // 1mm = 8px
const smallBox = mmPerPx; // 1mm
const largeBox = smallBox * 5; // 5mm = 40px
const pxPerSecond = 25 * mmPerPx; // 25mm/s
const pxPerMv = 10 * mmPerPx; // 10mm/mV

// Time is in ms
export function scaleTimeToPixels(time) {
    return time / 1000 * pxPerSecond;
}

// Voltage is in mV
// 1mV = 10mm = 80px
export function scaleVoltageToPixels(voltage) {
    return voltage * pxPerMv;
}

// This ensures a full large box always fits within the calculated width
// Minimum width is 200px
export function getECGCanvasWidthForTime(time) {
    const width = scaleTimeToPixels(time) + 50; // 50px for the labels
    const correctedWidth = Math.ceil(width / largeBox) * largeBox;
    return correctedWidth < 200 ? 200 : correctedWidth;
}

export function drawECGGrid(ctx, ecgWidth, ecgHeight) {
    // Draw small boxes (light lines)
    ctx.beginPath();
    for (let x = 0; x <= ecgWidth; x += smallBox) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ecgHeight);
    }
    for (let y = 0; y <= ecgHeight; y += smallBox) {
        ctx.moveTo(0, y);
        ctx.lineTo(ecgWidth, y);
    }

    ctx.strokeStyle = isDarkTheme ? ecgGridColor_dark : ecgGridColor_light;
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.closePath();

    // Draw large boxes (darker lines)
    ctx.beginPath();
    for (let x = 0; x <= ecgWidth; x += largeBox) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ecgHeight);
    }
    for (let y = 0; y <= ecgHeight; y += largeBox) {
        ctx.moveTo(0, y);
        ctx.lineTo(ecgWidth, y);
    }
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();

    // Draw unit scales (time and voltage)
    ctx.save();
    ctx.font = '10px Cascadia Code';
    ctx.fillStyle = isDarkTheme ? ecgColor_dark : ecgColor_light;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    // Time scale (horizontal, every large box)
    for (let x = largeBox; x < ecgWidth; x += largeBox) {
        const sec = (x / pxPerSecond).toFixed(2);
        ctx.fillText(`${sec}s`, x + 2, ecgHeight);
    }
    // Voltage scale (vertical, every large box)
    ctx.textAlign = 'right';
    for (let y = largeBox; y < ecgHeight; y += largeBox) {
        const mv = ((ecgHeight * 0.6 - y) / pxPerMv).toFixed(2);
        ctx.fillText(`${mv}mV`, ecgWidth - 2, y + 2);
    }
    ctx.restore();
}

export function drawECGWave(ecgCanvas, leadIndex = 0, time = null) {
    if (!ecgCanvas) return;

    const ecgPoints = getLeadPoints(leadIndex);
    const ecgWidth = ecgCanvas.width;
    const ecgHeight = ecgCanvas.height;

    let ctx = ecgCanvas.getContext('2d');
    ctx.clearRect(0, 0, ecgCanvas.width, ecgCanvas.height);

    drawECGGrid(ctx, ecgWidth, ecgHeight);

    ctx.beginPath();
    for (let i = 0; i < ecgPoints.length; i++) {
        const point = ecgPoints[i];

        if (time && point.x > scaleTimeToPixels(time)) break; // Stop drawing if the point is beyond the current time

        if (i === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
    }

    ctx.strokeStyle = isDarkTheme ? ecgColor_dark : ecgColor_light;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();

    ctx.font = '12px Cascadia Code';
    ctx.fillStyle = isDarkTheme ? ecgColor_dark : ecgColor_light;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    var leadName = getLimbLead(leadIndex).name;
    ctx.fillText(leadName, 10, 10);
}

const darkThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

function handleThemeChange(event) {
    isDarkTheme = event.matches;
    var ecgCanvases = document.getElementsByClassName('ecg-canvas');
    for (let i = 0; i < ecgCanvases.length; i++) {
        const ecgCanvas = ecgCanvases[i];
        const leadIndex = parseInt(ecgCanvas.name);
        drawECGWave(ecgCanvas, leadIndex);
    }
}

// Add listener for changes
darkThemeMediaQuery.addEventListener('change', handleThemeChange);