const canvas = document.getElementById('heartCanvas');
let heart_left = 0;
let heart_top = 0;
let heart_width = 0;
let heart_height = 0;
let electrodes = null;

export function setupCanvas(electrodeDistance, heartWidth, heartHeight, limbElectrodes) {
    canvas.width = cm2px(electrodeDistance);
    canvas.height = cm2px(electrodeDistance);
    heart_left = electrodeDistance / 2 - heartWidth / 2;
    heart_top = electrodeDistance / 2 - heartHeight / 2;
    heart_width = heartWidth;
    heart_height = heartHeight;
    electrodes = limbElectrodes;
}

export function drawVectors(cycle) {
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'red';

    // Draw the main tilted heart shape
    ctx.beginPath();
    ctx.ellipse(
        cm2px(heart_left + (heart_width / 2)), cm2px(heart_top + (heart_height / 2)),
        cm2px(heart_width / 2), cm2px(heart_height / 2),
        Math.PI / 4, 0, Math.PI * 2
    );
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fill();

    ctx.fillStyle = 'blue';
    electrodes.forEach(lead => {
        let x = lead.x <= 0 ? lead.x + 0.5 : lead.x - 0.5;
        let y = lead.y <= 0 ? lead.y + 0.5 : lead.y - 0.5;
        // ctx.lineTo(cm2px(x), cm2px(y));
        // ctx.moveTo(cm2px(x), cm2px(y));
        // ctx.strokeStyle = 'black';
        // ctx.lineWidth = 1.2;
        // ctx.stroke();

        ctx.beginPath();
        ctx.arc(cm2px(x), cm2px(y), cm2px(0.5), 0, 2 * Math.PI);
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

function cm2px(cm) {
    return cm * 20;
    // var dpi = 96;
    // var cpi = 2.54;
    // var ppd = window.devicePixelRatio;
    // return Math.round(cm * dpi * ppd / cpi);
}