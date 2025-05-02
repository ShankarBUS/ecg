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
export function defineLimbElectrodes() {
    limbElectrodes = [
        new Electrode('leftArm', 1, 0),
        new Electrode('rightArm', 0, 0),
        new Electrode('leftLeg', 1 / 2, Math.sqrt(3) / 2)
    ];
}

function calculateElectrodeVoltages(vector) {
    return limbElectrodes.map(electrode => {
        return electrode.getVoltageReadingFrom(vector);
    });
}

export function calculateLead2Voltage(vector) {
    const rightArm = limbElectrodes[1].getVoltageReadingFrom(vector);
    const leftLeg = limbElectrodes[2].getVoltageReadingFrom(vector);

    return leftLeg - rightArm;
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
