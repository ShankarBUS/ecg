import { Vector } from './Math.js';

export class Electrode {
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.unitVector = new Vector(x, y).normalize();
    }

    voltage = 0;
    unitVector = null;

    getVector() {
        return this.unitVector;
    }

    getVoltageReadingFrom(vector) {
        return this.getVector().dot(vector);
    }
}

export class Lead {
    constructor(name, index, axis) {
        this.name = name;
        this.index = index;
        this.axis = axis;
    }

    voltages = [];
}

let limbElectrodes = null;

// Einthoven's triangle:
// --------------------
//        Lead I
//      (RA)--(LA)
// Lead II \  / Lead III
//         (LL)
export function defineLimbElectrodes() {
    limbElectrodes = [
        new Electrode('leftArm', 1, 0),
        new Electrode('rightArm', 0, 0),
        new Electrode('leftLeg', 1 / 2, Math.sqrt(3) / 2)
    ];
}

let allLeads;

export function defineLimbLeads() {
    const leadI = new Lead('Lead I', 0, 0);
    const leadII = new Lead('Lead II', 1, 60);
    const leadIII = new Lead('Lead III', 2, 120);
    const leadAVR = new Lead('Lead AVR', 3, -150);
    const leadAVL = new Lead('Lead AVL', 4, -30);
    const leadAVF = new Lead('Lead AVF', 5, 90);

    allLeads = [leadI, leadII, leadIII, leadAVR, leadAVL, leadAVF];
}

export function getLimbLead(index) {
    return allLeads[index];
}

function calculateElectrodeVoltages(vector) {
    return limbElectrodes.map(electrode => {
        return electrode.getVoltageReadingFrom(vector);
    });
}

export function calculateLeadVoltages(vector) {
    const voltages = calculateElectrodeVoltages(vector);
    const leftArm = voltages[0];
    const rightArm = voltages[1];
    const leftLeg = voltages[2];

    return [
        leftArm - rightArm,
        leftLeg - rightArm,
        leftLeg - leftArm,
        rightArm - (leftArm + leftLeg) / 2,
        leftArm - (rightArm + leftLeg) / 2,
        leftLeg - (leftArm + rightArm) / 2,
    ];
}

let allPoints;
let currentCycle;

export function getLeadPoints(lead) {
    return allPoints[lead];
}

export function generateLeadsPoints(currentCardiacCycle, width, height) {
    currentCycle = currentCardiacCycle;
    const phases = currentCycle.phases;
    let vLeadI = allLeads[0].voltages;
    let vLeadII = allLeads[1].voltages;
    let vLeadIII = allLeads[2].voltages;
    let vLeadAVR = allLeads[3].voltages;
    let vLeadAVL = allLeads[4].voltages;
    let vLeadAVF = allLeads[5].voltages;

    phases.forEach((phase) => {
        const vector = phase.getVector();
        const voltages = calculateLeadVoltages(vector);
        vLeadI.push(voltages[0]);
        vLeadII.push(voltages[1]);
        vLeadIII.push(voltages[2]);
        vLeadAVR.push(voltages[3]);
        vLeadAVL.push(voltages[4]);
        vLeadAVF.push(voltages[5]);
    });

    let pLeadI = generateEcgPoints(vLeadI, width, height);
    let pLeadII = generateEcgPoints(vLeadII, width, height);
    let pLeadIII = generateEcgPoints(vLeadIII, width, height);
    let pLeadAVR = generateEcgPoints(vLeadAVR, width, height);
    let pLeadAVL = generateEcgPoints(vLeadAVL, width, height);
    let pLeadAVF = generateEcgPoints(vLeadAVF, width, height);

    allPoints = [pLeadI, pLeadII, pLeadIII, pLeadAVR, pLeadAVL, pLeadAVF];
}

export function generateEcgPoints(lead, width, height) {
    const phases = currentCycle.phases;
    const scaleX = width / currentCycle.duration;
    const centerY = height * 0.6;
    const amplitudeFactor = height / 2;

    let currentX = 0;
    let prevY = 0;
    const points = [];

    phases.forEach((phase, index) => {
        currentX = phase.startTime * scaleX;
        let amplitude = lead[index] * amplitudeFactor;
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
