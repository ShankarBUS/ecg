import { ComboBox } from 'https://shankarbus.github.io/kaadu-ui/combo-box.js';
import { createExpander } from 'https://shankarbus.github.io/kaadu-ui/kaadu-ui.js';
import { setCanvasDPI, drawArrow } from './Drawing.js';
import { CardiacActivity } from './models/CardiacActivity.js';
import { CardiacElectricalCycle } from './models/CardiacElectricalCycle.js';

// #region Vector Editor Popup

let popup = null;
let vectorCanvas = null;
let ctx = null;
let points = [];
let draggingPoint = null;
let currentPhaseDiv = null;

function setupVectorEditorPopup() {
    popup = document.createElement('div');
    popup.id = 'vectorEditorPopup';
    popup.className = 'popup';
    popup.setAttribute('aria-hidden', 'true');

    const popupContent = document.createElement('div');
    popupContent.id = 'popupContent';
    popupContent.className = 'popup-content';

    const popupTitle = document.createElement('h2');
    popupTitle.id = 'popupTitle';
    popupTitle.className = 'popup-title';
    popupTitle.textContent = 'Edit Vector';
    popupContent.appendChild(popupTitle);

    const popupDescription = document.createElement('p');
    popupDescription.id = 'popupDescription';
    popupDescription.className = 'popup-description';
    popupDescription.textContent = 'Click to add points, drag to move them.';
    popupContent.appendChild(popupDescription);

    const vectorEditorContainer = document.createElement('div');
    vectorEditorContainer.id = 'vectorEditorContainer';
    vectorEditorContainer.className = 'heart-container';

    const heartImg = document.createElement('img');
    heartImg.id = 'heartImg';
    heartImg.className = 'heart-image';
    heartImg.src = './assets/svgs/heart.svg';
    heartImg.alt = 'Heart Image';

    vectorCanvas = document.createElement('canvas');
    vectorCanvas.id = 'vectorCanvas';
    vectorCanvas.className = 'heart-canvas';
    setCanvasDPI(vectorCanvas, 320, 320, 1);
    vectorCanvas.style.cursor = 'crosshair';
    ctx = vectorCanvas.getContext('2d');

    vectorCanvas.addEventListener('mousedown', onMouseDown);
    vectorCanvas.addEventListener('mousemove', onMouseMove);
    vectorCanvas.addEventListener('mouseup', onMouseUp);

    vectorEditorContainer.appendChild(heartImg);
    vectorEditorContainer.appendChild(vectorCanvas);

    popupContent.appendChild(vectorEditorContainer);

    const closePopup = document.createElement('button');
    closePopup.id = 'closePopup';
    closePopup.setAttribute('aria-label', 'Close Popup');
    closePopup.textContent = 'Close';

    popupContent.appendChild(closePopup);

    popup.appendChild(popupContent);
    document.body.appendChild(popup);

    closePopup.addEventListener('click', () => closeVectorEditorPopup());

    popup.addEventListener('click', (event) => {
        if (event.target === popup) closeVectorEditorPopup();
    });
}

function onMouseDown(event) {
    const { x, y } = getMousePos(event);
    draggingPoint = getPointAt(x, y);
    if (!draggingPoint && points.length < 2) {
        points.push({ x, y });
        drawPoints();
        updateVectors();
    }
    else if (draggingPoint) {
        vectorCanvas.style.cursor = 'move';
    }
}

function onMouseMove(event) {
    if (draggingPoint) {
        const { x, y } = getMousePos(event);
        draggingPoint.x = x;
        draggingPoint.y = y;
        drawPoints();
        updateVectors();
    }
}

function onMouseUp() {
    draggingPoint = null;
    vectorCanvas.style.cursor = 'crosshair';
    drawPoints();
}

function getMousePos(event) {
    const rect = vectorCanvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function getPointAt(x, y, tolerance = 5) {
    return points.find(point => Math.hypot(point.x - x, point.y - y) < tolerance);
}

function drawPoints() {
    ctx.clearRect(0, 0, vectorCanvas.width, vectorCanvas.height);

    points.forEach(point => {
        // Draw the grid
        ctx.beginPath();
        ctx.moveTo(point.x, 0);
        ctx.lineTo(point.x, vectorCanvas.height);
        ctx.moveTo(0, point.y);
        ctx.lineTo(vectorCanvas.width, point.y);
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();

        // Draw the point
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    });

    if (draggingPoint) {
        ctx.fillStyle = 'red';
        ctx.font = '14px Cascadia Code';
        ctx.fillText(`(${draggingPoint.x}, ${draggingPoint.y})`, 10, 10);
    }
    if (points.length === 2) {
        const [sp, ep] = points;
        drawArrow(ctx, sp.x, sp.y, ep.x, ep.y, 'dodgerblue', 2);
    }
}

function closeVectorEditorPopup() {
    if (popup) {
        popup.setAttribute('aria-hidden', 'true');
        ctx.clearRect(0, 0, vectorCanvas.width, vectorCanvas.height);
        currentPhaseDiv = null;
        points = [];
    }
}

function showVectorEditorPopup(phaseDiv) {
    currentPhaseDiv = phaseDiv;
    popup.setAttribute('aria-hidden', 'false');
    const startPointX = parseFloat(phaseDiv.querySelector('[name="startPointX"]').value);
    const startPointY = parseFloat(phaseDiv.querySelector('[name="startPointY"]').value);
    const endPointX = parseFloat(phaseDiv.querySelector('[name="endPointX"]').value);
    const endPointY = parseFloat(phaseDiv.querySelector('[name="endPointY"]').value);
    if (isNaN(startPointX) || isNaN(startPointY) || isNaN(endPointX) || isNaN(endPointY)) {
        points = [];
    } else {
        points = [
            { x: startPointX, y: startPointY },
            { x: endPointX, y: endPointY }
        ];
    }
    drawPoints();
}

function updateVectors() {
    if (points.length === 2) {
        const [sp, ep] = points;
        currentPhaseDiv.querySelector('[name="startPointX"]').value = sp.x.toFixed(2);
        currentPhaseDiv.querySelector('[name="startPointY"]').value = sp.y.toFixed(2);
        currentPhaseDiv.querySelector('[name="endPointX"]').value = ep.x.toFixed(2);
        currentPhaseDiv.querySelector('[name="endPointY"]').value = ep.y.toFixed(2);
    }
}

// #endregion

// #region Activity Editor

function createLabelInputPair(parent, labelText, inputType, inputName, value = '', step = null) {
    const label = document.createElement('label');
    label.textContent = labelText;

    const input = document.createElement('input');
    input.type = inputType;
    input.name = inputName;
    input.value = value;
    if (step) input.step = step;

    parent.appendChild(label);
    parent.appendChild(input);
};

function addPhaseEditor(phasesContainer, phaseData = null) {
    if (!phasesContainer) return;

    const phaseDiv = document.createElement('div');
    phaseDiv.classList.add('phase-editor');

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.classList.add('remove-button');
    removeButton.textContent = '(-)';
    removeButton.title = 'Remove Phase';
    phaseDiv.appendChild(removeButton);

    createLabelInputPair(phaseDiv, 'Name:', 'text', 'phaseName', phaseData ? phaseData.name : '');
    createLabelInputPair(phaseDiv, 'Start Time (ms):', 'number', 'startTime', phaseData ? phaseData.startTime : 0);
    createLabelInputPair(phaseDiv, 'Duration (ms):', 'number', 'duration', phaseData ? phaseData.duration : 0);

    const editVectorButton = document.createElement('button');
    editVectorButton.type = 'button';
    editVectorButton.textContent = 'Edit Vector';
    phaseDiv.appendChild(editVectorButton);
    editVectorButton.addEventListener('click', () => {
        showVectorEditorPopup(phaseDiv);
    });

    createLabelInputPair(phaseDiv, 'Start Point X:', 'number', 'startPointX', phaseData ? phaseData.startPoint?.x : null);
    createLabelInputPair(phaseDiv, 'Start Point Y:', 'number', 'startPointY', phaseData ? phaseData.startPoint?.y : null);
    createLabelInputPair(phaseDiv, 'End Point X:', 'number', 'endPointX', phaseData ? phaseData.endPoint?.x : null);
    createLabelInputPair(phaseDiv, 'End Point Y:', 'number', 'endPointY', phaseData ? phaseData.endPoint?.y : null);
    createLabelInputPair(phaseDiv, 'Name in Lead II:', 'text', 'nameInLead2', phaseData ? phaseData.nameInLead2 : '');

    const typeLabel = document.createElement('label');
    typeLabel.textContent = 'Type:';

    const typeCMB = new ComboBox();
    typeCMB.name = 'type';
    typeCMB.loadOptions([
        { value: 'flat', label: 'Flat' },
        { value: 'smooth', label: 'Smooth' },
        { value: 'spike', label: 'Spike' }
    ]);
    typeCMB.setSelectedItem(phaseData ? phaseData.type : 'flat');

    phaseDiv.appendChild(typeLabel);
    phaseDiv.appendChild(typeCMB);

    createLabelInputPair(phaseDiv, 'Multiplier:', 'number', 'multiplier', phaseData ? phaseData.multiplier : 0.1, 0.1);

    phasesContainer.appendChild(phaseDiv);
    removeButton.addEventListener('click', () => {
        phasesContainer.removeChild(phaseDiv);
    });
}

function addCycleEditor(cycleData = null) {
    if (!cyclesContainer) return;

    const cycleDiv = document.createElement('div');
    cycleDiv.classList.add('cycle-editor');

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.classList.add('remove-button');
    removeButton.textContent = '(-)';
    removeButton.title = 'Remove Cycle';
    cycleDiv.appendChild(removeButton);

    createLabelInputPair(cycleDiv, 'Cycle Name:', 'text', 'cycleName', cycleData ? cycleData.name : '');
    createLabelInputPair(cycleDiv, 'Cycle Duration (ms):', 'number', 'cycleDuration', cycleData ? cycleData.duration : 0);

    const phasesContainer = document.createElement('div');
    phasesContainer.classList.add('cards-grid');

    const addPhaseButton = document.createElement('button');
    addPhaseButton.type = 'button';
    addPhaseButton.textContent = '(+) Add Phase';
    addPhaseButton.title = 'Add Phase';
    cycleDiv.appendChild(addPhaseButton);
    addPhaseButton.addEventListener('click', () => {
        addPhaseEditor(phasesContainer);
    });

    if (cycleData && cycleData.phases) {
        cycleData.phases.forEach(phase => addPhaseEditor(phasesContainer, phase));
    }

    const phaseLabel = document.createElement('label');
    phaseLabel.textContent = 'Phases';
    const expander = createExpander([phaseLabel], phasesContainer);
    cycleDiv.appendChild(expander);
    cyclesContainer.appendChild(cycleDiv);
    removeButton.addEventListener('click', () => {
        cyclesContainer.removeChild(cycleDiv);
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

function getCycleData(cycleDiv) {
    const cycleName = cycleDiv.querySelector('[name="cycleName"]').value;
    const cycleDuration = parseInt(cycleDiv.querySelector('[name="cycleDuration"]').value, 10);
    const phases = Array.from(cycleDiv.querySelectorAll('.phase-editor')).map(phaseDiv => getPhaseData(phaseDiv));
    return new CardiacElectricalCycle(cycleName, cycleDuration, phases);
}

function saveActivityToJson() {
    const activityName = document.getElementById('activityName').value;
    const activityDuration = parseInt(document.getElementById('activityDuration').value, 10);
    const cycles = Array.from(cyclesContainer.querySelectorAll('.cycle-editor')).map(cycleDiv => getCycleData(cycleDiv));

    let activity = new CardiacActivity(activityName, activityDuration, cycles);
    const json = JSON.stringify(activity, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${activityName || 'Activity'}.json`;
    link.click();

}

function loadActivityFromJson(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            document.getElementById('activityName').value = data.name || '';
            document.getElementById('activityDuration').value = data.duration || '';

            cyclesContainer.innerHTML = '';
            (data.cycles || []).forEach(cycle => addCycleEditor(cycle));
        } catch (error) {
            alert('Invalid JSON file');
        }
    };
    reader.readAsText(file);

}

function initEditor() {
    cyclesContainer = document.getElementById('cyclesContainer');
    const addCycleButton = document.getElementById('addCycleButton');
    const saveJsonButton = document.getElementById('saveJsonButton');
    const loadJsonInput = document.getElementById('loadJsonInput');

    addCycleButton.addEventListener('click', addCycleEditor);
    saveJsonButton.addEventListener('click', saveActivityToJson);
    loadJsonInput.addEventListener('change', loadActivityFromJson);
}

// #endregion

let cyclesContainer;

setupVectorEditorPopup();
document.addEventListener('DOMContentLoaded', initEditor);
