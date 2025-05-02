import { CardiacElectricalCycle } from './CardiacCycle.js';

let heartBounds = null;
let limbElectrodes = null;

function defineHeartBoundaries() {
    heartBounds = {
        left: 8,
        top: 12,
        width: 8,
        height: 12
    }; // Average heart size in centimeters
}

function defineLimbElectrodes() {
    limbElectrodes = [
        { name: 'leftArm', x: 16, y: 0 },
        { name: 'leftLeg', x: 16, y: 24 },
        { name: 'rightArm', x: 0, y: 0 },
        { name: 'rightLeg', x: 0, y: 24 }
    ];
}

function calculateLeadVoltages(limbElectrodeVoltages) {
    const { leftArm, rightArm, leftLeg } = limbElectrodeVoltages;

    return {
        leadI: leftArm - rightArm,
        leadII: leftLeg - rightArm,
        leadIII: leftLeg - leftArm,
        aVR: rightArm -(leftArm + leftLeg) / 2,
        aVL: leftArm - (rightArm + leftLeg) / 2,
        aVF: leftLeg - (leftArm + rightArm) / 2
    };
}

async function createHeartAndLimbElectrodes() {
    defineHeartBoundaries();
    defineLimbElectrodes();
    let cycle = await CardiacElectricalCycle.getNormalCycle();

    cycle.phases.forEach(phase => {
        const startPoint = phase.startPoint || { x: 0, y: 0 };
        const endPoint = phase.endPoint || { x: 0, y: 0 };

        console.log(`Phase - Type: ${typeof phase} Name: ${phase.name}, Start Point: (${startPoint.x}, ${startPoint.y}), End Point: (${endPoint.x}, ${endPoint.y})`);
    });

    const canvas = document.getElementById('heartCanvas');
    canvas.width = cm2px(3 * heartBounds.width);
    canvas.height = cm2px(3 * heartBounds.height);
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.fillStyle = 'red';
    ctx.translate(cm2px(-heartBounds.left / 2), cm2px(heartBounds.top));
    ctx.rotate(-45 * Math.PI / 180);
    ctx.beginPath();
    ctx.ellipse(
        cm2px(heartBounds.left),
        cm2px(heartBounds.top),
        cm2px(heartBounds.width / 2),
        cm2px(heartBounds.height / 2),
        0, 0, 2 * Math.PI
    );
    ctx.fill();

    ctx.restore();

    ctx.fillStyle = 'blue';
    limbElectrodes.forEach(lead => {
        ctx.beginPath();
        ctx.arc(cm2px(lead.x), cm2px(lead.y), cm2px(0.5), 0, 2 * Math.PI);
        ctx.fill();
    });
}

function px2cm(px) {
    var cpi = 2.54;
    var dpi = 96;
    var ppd = window.devicePixelRatio;
    return (px * cpi / (dpi * ppd)).toFixed(3);
}

function cm2px(cm) {
    var dpi = 96;
    var cpi = 2.54;
    var ppd = window.devicePixelRatio;
    return Math.round(cm * dpi * ppd / cpi);
}

export { createHeartAndLimbElectrodes, cm2px, calculateLeadVoltages };