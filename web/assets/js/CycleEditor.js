import { ComboBox } from 'https://shankarbus.github.io/kaadu-ui/combo-box.js';
import { setCanvasDPI, drawArrow } from './Drawing.js';

function setupVectorPickerPopup() {
    const popup = document.createElement('div');
    popup.id = 'vectorPickupPopup';
    popup.className = 'popup';
    popup.setAttribute('aria-hidden', 'true');

    const popupContent = document.createElement('div');
    popupContent.id = 'popupContent';
    popupContent.className = 'popup-content';

    const closePopup = document.createElement('button');
    closePopup.id = 'closePopup';
    closePopup.setAttribute('aria-label', 'Close Popup');
    closePopup.textContent = 'Close';

    popupContent.appendChild(closePopup);

    const vectorPickerContainer = document.createElement('div');
    vectorPickerContainer.id = 'vectorPickerContainer';
    vectorPickerContainer.className = 'heart-container';

    const heartImg = document.createElement('img');
    heartImg.id = 'heartImg';
    heartImg.className = 'heart-image';
    heartImg.src = './assets/svgs/heart.svg';
    heartImg.alt = 'Heart Image';

    const vectorCanvas = document.createElement('canvas');
    vectorCanvas.id = 'vectorCanvas';
    vectorCanvas.className = 'heart-canvas';
    setCanvasDPI(vectorCanvas, 320, 320, 1);
    vectorCanvas.style.cursor = 'crosshair';

    vectorPickerContainer.appendChild(heartImg);
    vectorPickerContainer.appendChild(vectorCanvas);

    popupContent.appendChild(vectorPickerContainer);

    popup.appendChild(popupContent);
    document.body.appendChild(popup);

    closePopup.addEventListener('click', () => closePickerPopup());

    popup.addEventListener('click', (event) => {
        if (event.target === popup) closePickerPopup();
    });
}

function closePickerPopup() {
    const popup = document.getElementById('vectorPickupPopup');
    if (popup) {
        popup.setAttribute('aria-hidden', 'true');
        const vectorCanvas = document.getElementById('vectorCanvas');
        const ctx = vectorCanvas.getContext('2d');
        ctx.clearRect(0, 0, vectorCanvas.width, vectorCanvas.height);
        vectorCanvas.removeEventListener('click', pickVector);
    }
}

function pickVector(phaseDiv) {
    const popup = document.getElementById('vectorPickupPopup');
    popup.setAttribute('aria-hidden', 'false');

    const vectorCanvas = document.getElementById('vectorCanvas');
    const ctx = vectorCanvas.getContext('2d');

    let points = [];

    vectorCanvas.addEventListener('click', (event) => {
        if (points.length >= 2) return;

        const rect = vectorCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        points.push({ x, y });

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, vectorCanvas.height);
        ctx.moveTo(0, y);
        ctx.lineTo(vectorCanvas.width, y);
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = points.length == 1 ? 'blue' : 'green';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();

        if (points.length === 2) {
            const [sp, ep] = points;
            drawArrow(ctx, sp.x, sp.y, ep.x, ep.y, 'dodgerblue', 2);

            phaseDiv.querySelector('[name="startPointX"]').value = sp.x.toFixed(2);
            phaseDiv.querySelector('[name="startPointY"]').value = sp.y.toFixed(2);
            phaseDiv.querySelector('[name="endPointX"]').value = ep.x.toFixed(2);
            phaseDiv.querySelector('[name="endPointY"]').value = ep.y.toFixed(2);
        }
    });
}

function addNewPhase() {
    const phaseDiv = document.createElement('div');
    phaseDiv.classList.add('phase-editor');

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.classList.add('remove-phase-button');
    removeButton.textContent = '(-)';
    phaseDiv.appendChild(removeButton);

    const createLabelInputPair = (labelText, inputType, inputName, step = null) => {
        const label = document.createElement('label');
        label.textContent = labelText;

        const input = document.createElement('input');
        input.type = inputType;
        input.name = inputName;
        if (step) input.step = step;

        phaseDiv.appendChild(label);
        phaseDiv.appendChild(input);
    };

    createLabelInputPair('Name:', 'text', 'phaseName');
    createLabelInputPair('Start Time (ms):', 'number', 'startTime');
    createLabelInputPair('Duration (ms):', 'number', 'duration');

    const pickVectorButton = document.createElement('button');
    pickVectorButton.type = 'button';
    pickVectorButton.textContent = 'Pick Vector';
    phaseDiv.appendChild(pickVectorButton);
    pickVectorButton.addEventListener('click', () => {
        pickVector(phaseDiv);
    });

    createLabelInputPair('Start Point X:', 'number', 'startPointX');
    createLabelInputPair('Start Point Y:', 'number', 'startPointY');
    createLabelInputPair('End Point X:', 'number', 'endPointX');
    createLabelInputPair('End Point Y:', 'number', 'endPointY');
    createLabelInputPair('Name in Lead II:', 'text', 'nameInLead2');

    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Type:';

    const typeCMB = new ComboBox();
    typeCMB.name = 'type';
    typeCMB.loadOptions([
        { value: 'flat', label: 'Flat' },
        { value: 'smooth', label: 'Smooth' },
        { value: 'spike', label: 'Spike' }
    ]);

    phaseDiv.appendChild(typeLabel);
    phaseDiv.appendChild(typeCMB);

    createLabelInputPair('Multiplier:', 'number', 'multiplier', '0.1');

    phasesContainer.appendChild(phaseDiv);
    removeButton.addEventListener('click', () => {
        phasesContainer.removeChild(phaseDiv);
    });
}

function getPhaseData(phaseDiv) {

    let name = phaseDiv.querySelector('[name="phaseName"]').value;
    let startTime = parseInt(phaseDiv.querySelector('[name="startTime"]').value, 10);
    let duration = parseInt(phaseDiv.querySelector('[name="duration"]').value, 10);
    let startPointX = parseFloat(phaseDiv.querySelector('[name="startPointX"]').value);
    let startPointY = parseFloat(phaseDiv.querySelector('[name="startPointY"]').value);
    let endPointX = parseFloat(phaseDiv.querySelector('[name="endPointX"]').value);
    let endPointY = parseFloat(phaseDiv.querySelector('[name="endPointY"]').value);
    let nameInLead2 = phaseDiv.querySelector('[name="nameInLead2"]').value;
    let typeCMB = phaseDiv.querySelector('combo-box.combo-box');
    let type = typeCMB && typeCMB.selectedItem ? typeCMB.selectedItem.value : 'flat';
    let multiplier = parseFloat(phaseDiv.querySelector('[name="multiplier"]').value);

    return {
        name: name,
        startTime: startTime,
        duration: duration,
        startPoint: {
            x: startPointX,
            y: startPointY
        },
        endPoint: {
            x: endPointX,
            y: endPointY
        },
        nameInLead2: nameInLead2,
        type: type,
        multiplier: multiplier
    };
}

function saveCycleToJson() {
    const cycleName = document.getElementById('cycleName').value;
    const cycleDuration = parseInt(document.getElementById('cycleDuration').value, 10);
    const phases = Array.from(phasesContainer.querySelectorAll('.phase-editor')).map(phaseDiv => getPhaseData(phaseDiv));

    const cycleJson = JSON.stringify({ name: cycleName, duration: cycleDuration, phases }, null, 2);
    const blob = new Blob([cycleJson], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${cycleName || 'CardiacElectricalCycle'}.json`;
    link.click();
}

function initEditor() {
    phasesContainer = document.getElementById('phasesContainer');
    const addPhaseButton = document.getElementById('addPhaseButton');
    const saveJsonButton = document.getElementById('saveJsonButton');
    addPhaseButton.addEventListener('click', addNewPhase);
    saveJsonButton.addEventListener('click', saveCycleToJson);

}

let phasesContainer;

setupVectorPickerPopup();
document.addEventListener('DOMContentLoaded', initEditor);
