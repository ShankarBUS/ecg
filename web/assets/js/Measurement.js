import { Vector } from './Math.js';
import { createLimbElectrodeElement } from './LeadVisualization.js';

export class Electrode {
    constructor(name, shortName, x, y) {
        this.name = name;
        this.shortName = shortName;
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
    constructor(name, index, axis, positiveElectrode = null, negativeElectrodes = null) {
        this.name = name;
        this.index = index;
        this.axis = axis;
        this.positiveElectrode = positiveElectrode;
        this.negativeElectrodes = negativeElectrodes;
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
        new Electrode('Right Arm', 'RA', 0, 0),
        new Electrode('Left Arm', 'LA', 1, 0),
        new Electrode('Left Leg', 'LL', 1 / 2, Math.sqrt(3) / 2),
    ];
    limbElectrodes.forEach((e, i) => {
        createLimbElectrodeElement(e);
    });
}

let allLeads;

export function defineLimbLeads() {
    const ra = limbElectrodes[0];
    const la = limbElectrodes[1];
    const ll = limbElectrodes[2];

    const leadI = new Lead('Lead I', 0, 0, la, [ra]);
    const leadII = new Lead('Lead II', 1, 60, ll, [ra]);
    const leadIII = new Lead('Lead III', 2, 120, ll, [la]);
    const leadAVR = new Lead('Lead aVR', 3, -150, ra, [la, ll]);
    const leadAVL = new Lead('Lead aVL', 4, -30, la, [ra, ll]);
    const leadAVF = new Lead('Lead aVF', 5, 90, ll, [ra, la]);

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
    const rightArm = voltages[0];
    const leftArm = voltages[1];
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
    let vLeadI = allLeads[0].voltages = [];
    let vLeadII = allLeads[1].voltages = [];
    let vLeadIII = allLeads[2].voltages = [];
    let vLeadAVR = allLeads[3].voltages = [];
    let vLeadAVL = allLeads[4].voltages = [];
    let vLeadAVF = allLeads[5].voltages = [];

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

    let pLeadI = generateECGPoints(vLeadI, width, height);
    let pLeadII = generateECGPoints(vLeadII, width, height);
    let pLeadIII = generateECGPoints(vLeadIII, width, height);
    let pLeadAVR = generateECGPoints(vLeadAVR, width, height);
    let pLeadAVL = generateECGPoints(vLeadAVL, width, height);
    let pLeadAVF = generateECGPoints(vLeadAVF, width, height);

    allPoints = [pLeadI, pLeadII, pLeadIII, pLeadAVR, pLeadAVL, pLeadAVF];
}

export function generateECGPoints(lead, width, height) {
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
        //if (phase.type === 'smooth') {
            for (let x = 0; x < duration; x++) {
                y = centerY - amplitude * Math.sin((Math.PI * x) / (duration));
                points.push({ x: currentX + x, y });
            }
        // } else if (phase.type === 'spike') {
        //     points.push({ x: currentX + duration, y: y });
        // }
        // else {
        //     points.push({ x: currentX, y: prevY });
        //     points.push({ x: currentX + (duration / 4), y: y });
        //     points.push({ x: currentX + duration, y: y });
        // }
        prevY = y;
    });

    return points;
}
