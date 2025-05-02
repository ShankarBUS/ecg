import { CardiacElectricalCycle } from './CardiacCycle.js';
import { Point } from './Math.js';

let heartBounds = null;
let limbElectrodes = null;

function defineHeartBoundaries() {
    heartBounds = {
        left: 4,
        top: 6,
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
        aVR: rightArm - (leftArm + leftLeg) / 2,
        aVL: leftArm - (rightArm + leftLeg) / 2,
        aVF: leftLeg - (leftArm + rightArm) / 2
    };
}

async function createHeartAndLimbElectrodes() {
    defineHeartBoundaries();
    defineLimbElectrodes();
    let cycle = await CardiacElectricalCycle.getNormalCycle();

    const canvas = document.getElementById('heartCanvas');
    canvas.width = cm2px(2 * heartBounds.width);
    canvas.height = cm2px(2 * heartBounds.height);
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'red';

    // Draw the main tilted heart shape
    ctx.beginPath();
    ctx.ellipse(
        cm2px(heartBounds.left + heartBounds.width / 2), cm2px(heartBounds.top + heartBounds.height / 2),
        cm2px(heartBounds.width / 2), cm2px(heartBounds.height / 2),
        -Math.PI / 4, 0, Math.PI * 2
    );
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fill();

    ctx.fillStyle = 'blue';
    limbElectrodes.forEach(lead => {
        ctx.beginPath();
        ctx.arc(cm2px(lead.x), cm2px(lead.y), cm2px(0.5), 0, 2 * Math.PI);
        ctx.fill();
    });

    cycle.phases.forEach((phase, index) => {
        let sp = phase.startPoint;
        let ep = phase.endPoint;

        if (!sp || !ep) return;

        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(cm2px(sp.x), cm2px(sp.y), 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = "green";
        ctx.arc(cm2px(ep.x), cm2px(ep.y), 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(cm2px(sp.x), cm2px(sp.y));
        ctx.lineTo(cm2px(ep.x), cm2px(ep.y));
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1.2;
        ctx.stroke();
    });
}

function px2cm(px) {
    var cpi = 2.54;
    var dpi = 96;
    var ppd = window.devicePixelRatio;
    return (px * cpi / (dpi * ppd)).toFixed(3);
}

function cm2px(cm) {
    return cm * 20;
    // var dpi = 96;
    // var cpi = 2.54;
    // var ppd = window.devicePixelRatio;
    // return Math.round(cm * dpi * ppd / cpi);
}

export { createHeartAndLimbElectrodes, cm2px, calculateLeadVoltages };