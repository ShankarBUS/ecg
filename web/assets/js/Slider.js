import { getLeadPoints } from './Measurement.js';
import { setCanvasDPI, drawPhaseVectorInHeart, drawECGWave } from './Drawing.js';
import { Point } from './Math.js';
import { displayECGDetails, updateECGWavesInAllLeads } from './LeadVisualization.js';

let currentPhase = null;
let ecgPoints = null;
let currentLead = 0;
let _sliderWidth = 0;

const ecgSlider = document.getElementById('ecgSlider');
const ecgPointer = document.getElementById('ecgPointer');
const ecgCanvas = document.getElementById('ecgWaveCanvas');

const heartPointer = document.getElementById('heartPointer');

let currentCycle = null;

export function setupECGSlider(currentCardiacCycle, width, height, sliderWidth) {
    currentCycle = currentCardiacCycle;
    currentPhase = currentCycle.phases[0];
    setCanvasDPI(ecgCanvas, width, height);
    _sliderWidth = sliderWidth;
    ecgSlider.style.width = `${sliderWidth}px`;
    ecgSlider.style.height = `${height}px`;
    ecgSlider.min = 0;
    ecgSlider.max = currentCycle.duration;
    ecgSlider.value = 0;
    ecgSlider.addEventListener('input', updateECGPhase);
}

export function changeSliderLead(leadIndex) {
    currentLead = leadIndex;
    ecgPoints = getLeadPoints(leadIndex);
    ecgCanvas.name = leadIndex.toString();
    drawECGWave(ecgCanvas, leadIndex);
    moveECGPointer();
    updateHeart(currentPhase);
}

function moveECGPointer() {
    const x = ecgSlider.value / ecgSlider.max * _sliderWidth;
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

function updateECGPhase() {
    const time = ecgSlider.value;
    moveECGPointer();
    currentPhase = currentCycle.phases.find(phase => phase.startTime <= time && phase.startTime + phase.duration >= time);
    updateHeart(currentPhase);
    updateECGWavesInAllLeads(time);
    displayECGDetails(currentCycle, currentPhase, time);
}

export function updateHeart(phase) {
   if (phase) {
        drawPhaseVectorInHeart(phase, currentLead);
        //moveHeartPointer(phase, time);
    }
}

function moveHeartPointer(phase, time) {
    let sp = phase.startPoint;
    let ep = phase.endPoint;
    if (!sp || !ep) return;
    const t = (time - phase.startTime) / phase.duration;
    let cep = new Point(
        sp.x + (ep.x - sp.x) * t,
        sp.y + (ep.y - sp.y) * t
    );

    let ratio = window.innerWidth >= 400 ? 1 : 0.625;
    let left = cep.x * ratio;
    let top = cep.y * ratio;

    heartPointer.style.left = `${left - 20}px`;
    heartPointer.style.top = `${top - 20}px`;
}