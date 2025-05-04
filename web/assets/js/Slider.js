import { getLeadPoints } from './Measurement.js';
import { drawPhaseVectorInHeart, drawECGWave } from './Drawing.js';

let currentPhase = 0;
let ecgPoints = null;
let currentLead = 0;
const ecgSlider = document.getElementById('ecgSlider');
const ecgPointer = document.getElementById('ecgPointer');
const ecgCanvas = document.getElementById('ecgWaveCanvas');

let currentCycle = null;

export function setupEcgSlider(currentCardiacCycle, leadIndex, width, height) {
    currentCycle = currentCardiacCycle;
    ecgCanvas.width = width;
    ecgCanvas.height = height;
    ecgSlider.style.width = `${width}px`;
    ecgSlider.style.height = `${height}px`;
    ecgSlider.min = 0;
    ecgSlider.max = currentCycle.duration;
    currentLead = leadIndex;
    changeSliderLead(leadIndex);
    ecgSlider.addEventListener('input', updateEcgPhase);
}

export function changeSliderLead(leadIndex) {
    currentLead = leadIndex;
    ecgPoints = getLeadPoints(leadIndex);
    drawECGWave(ecgCanvas, ecgPoints);
    movePointer();
    updateHeart();
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
    updateHeart();
}

function updateHeart() {
    const time = currentPhase;
    let phase = currentCycle.phases.find(phase => phase.startTime <= time && phase.startTime + phase.duration >= time);
    if (phase) {
        drawPhaseVectorInHeart(phase, time, currentLead);
    }
}