import { calculateLead2Voltage } from './Measurement.js';
import { drawPhaseVectorInHeart } from './Drawing.js';

let currentPhase = 0;
let ecgPoints = null;
let ecgWidth = 200;
let ecgHeight = 200;
const ecgSlider = document.getElementById('ecgSlider');
const ecgCanvas = document.getElementById('ecgWaveCanvas');
const ecgPointer = document.getElementById('ecgPointer');
const ecgContext = ecgCanvas.getContext('2d');

let currentCycle = null;

export async function setupEcgSlider(currentCardiacCycle) {
    currentCycle = currentCardiacCycle;
    const width = ecgCanvas.width = ecgWidth;
    const height = ecgCanvas.height = ecgHeight;
    ecgSlider.style.width = `${width}px`;
    ecgSlider.style.height = `${height}px`;
    ecgPoints = generateEcgPoints(width, height);
    drawECGWave();
    movePointer();
    ecgSlider.addEventListener('input', updateEcgPhase);
}

function generateEcgPoints(width, height) {
    const phases = currentCycle.phases;
    const scaleX = width / currentCycle.duration;
    const centerY = height * 0.6;
    const amplitudeFactor = height / 2;

    let currentX = 0;
    let prevY = 0;
    const points = [];

    phases.forEach((phase) => {
        currentX = phase.startTime * scaleX;
        let amplitude = calculateLead2Voltage(phase.getVector()) * amplitudeFactor;
        let duration = phase.duration * scaleX;
        let y = centerY - amplitude;
        if (phase.type === 'smooth') {
            for (let x = 0; x < duration; x++) {
                y = centerY - amplitude * Math.sin((Math.PI * x) / (duration));
                points.push({ x: currentX + x, y });
            }
        } else if (phase.type === 'spike') {
            points.push({ x: currentX + duration, y: y });
        }
        else {
            points.push({ x: currentX, y: prevY });
            points.push({ x: currentX + (duration / 4), y: y });
            points.push({ x: currentX + duration, y: y });
        }
        prevY = y;
    });

    return points;
}

function drawECGWave() {
    ecgContext.clearRect(0, 0, ecgCanvas.width, ecgCanvas.height);
    ecgContext.beginPath();
    ecgContext.lineWidth = 1;

    for (var x = 0; x <= ecgWidth; x += 20) {
        ecgContext.moveTo(x, 0);
        ecgContext.lineTo(x, ecgHeight);
    }

    for (var y = 0; y <= ecgHeight; y += 20) {
        ecgContext.moveTo(0, y);
        ecgContext.lineTo(ecgWidth, y);
    }

    ecgContext.strokeStyle = "rgba(100, 100, 100, 0.5)";
    ecgContext.stroke();

    ecgContext.beginPath();
    ecgPoints.forEach((point, index) => {
        if (index === 0) {
            ecgContext.moveTo(point.x, point.y);
        } else {
            ecgContext.lineTo(point.x, point.y);
        }
    });

    ecgContext.strokeStyle = 'red';
    ecgContext.lineWidth = 2;
    ecgContext.stroke();
    ecgContext.closePath();
}

function movePointer() {
    const x = ecgSlider.value / ecgSlider.max * ecgCanvas.width;
    const y = getYValueFromSlider(x);
    ecgPointer.style.left = `${x - 5}px`;
    ecgPointer.style.top = `${y - 5}px`;
}

function getYValueFromSlider(x) {
    const pointIndex = ecgPoints.findIndex(point => point.x >= x);

    if (pointIndex == -1) {
        return ecgPoints[ecgPoints.length - 1].y;
    }

    if (pointIndex == 0 || ecgPoints[pointIndex].x == x) {
        return ecgPoints[pointIndex].y;
    }

    const prevPoint = ecgPoints[pointIndex - 1];
    const nextPoint = ecgPoints[pointIndex];
    const slope = (nextPoint.y - prevPoint.y) / (nextPoint.x - prevPoint.x);
    return prevPoint.y + slope * (x - prevPoint.x);
}

function updateEcgPhase() {
    currentPhase = ecgSlider.value;
    movePointer();
    updateLeads();
}

function updateLeads() {
    const time = currentPhase * currentCycle.duration / 100;
    let phase = currentCycle.phases.find(phase => phase.startTime <= time && phase.startTime + phase.duration >= time);
    if (phase) {
        drawPhaseVectorInHeart(phase, time);
    }
}