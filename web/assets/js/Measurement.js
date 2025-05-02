import { drawVectors, setupCanvas } from './Drawing.js';
import { Vector } from './Math.js';

export class Electrode {
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
    }

    voltage = 0;

    getVector() {
        return new Vector(this.x, this.y);
    }

    getVoltageReadingFrom(vector) {
        return vector.dot(this.getVector());
    }
}

export class Lead {
    constructor(name, voltage, axis) {
        this.name = name;
        this.voltage = voltage;
        this.axis = axis;
    }
}

let limbElectrodes = null;

let heartWidth = 8; // cm
let heartHeight = 12; // cm
let electrodeDistance = 24; // cm

// Einthoven's triangle:
// --------------------
//        Lead I
//      (RA)--(LA)
// Lead II \  / Lead III
//         (LL)
function defineLimbElectrodes() {
    limbElectrodes = [
        new Electrode('leftArm', electrodeDistance, 0),
        new Electrode('rightArm', 0, 0),
        new Electrode('leftLeg', electrodeDistance / 2, electrodeDistance),
    ];
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
        new Lead('leadI', leftArm - rightArm, 0),
        new Lead('leadII', leftLeg - rightArm, 60),
        new Lead('leadIII', leftLeg - leftArm, 120),
        new Lead('aVR', rightArm - (leftArm + leftLeg) / 2, -150),
        new Lead('aVL', leftArm - (rightArm + leftLeg) / 2, -30),
        new Lead('aVF', leftLeg - (leftArm + rightArm) / 2, 90)
    ];
}

export function createHeartAndLimbElectrodes() {
    defineLimbElectrodes();
    setupCanvas(electrodeDistance, heartHeight, heartWidth, limbElectrodes);
}
