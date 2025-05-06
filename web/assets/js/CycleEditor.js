import { ComboBox } from 'https://shankarbus.github.io/kaadu-ui/combo-box.js';
import { setCanvasDPI, drawArrow } from './Drawing.js';

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

    const closePopup = document.createElement('button');
    closePopup.id = 'closePopup';
    closePopup.setAttribute('aria-label', 'Close Popup');
    closePopup.textContent = 'Close';

    popupContent.appendChild(closePopup);

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

// #region Cycle Editor

function addPhaseEditor(phaseData = null) {
    if (!phasesContainer) return;

    const phaseDiv = document.createElement('div');
    phaseDiv.classList.add('phase-editor');

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.classList.add('remove-phase-button');
    removeButton.textContent = '(-)';
    phaseDiv.appendChild(removeButton);

    const createLabelInputPair = (labelText, inputType, inputName, value = '', step = null) => {
        const label = document.createElement('label');
        label.textContent = labelText;

        const input = document.createElement('input');
        input.type = inputType;
        input.name = inputName;
        input.value = value;
        if (step) input.step = step;

        phaseDiv.appendChild(label);
        phaseDiv.appendChild(input);
    };

    createLabelInputPair('Name:', 'text', 'phaseName', phaseData ? phaseData.name : '');
    createLabelInputPair('Start Time (ms):', 'number', 'startTime', phaseData ? phaseData.startTime : 0);
    createLabelInputPair('Duration (ms):', 'number', 'duration', phaseData ? phaseData.duration : 0);

    const editVectorButton = document.createElement('button');
    editVectorButton.type = 'button';
    editVectorButton.textContent = 'Edit Vector';
    phaseDiv.appendChild(editVectorButton);
    editVectorButton.addEventListener('click', () => {
        showVectorEditorPopup(phaseDiv);
    });

    createLabelInputPair('Start Point X:', 'number', 'startPointX', phaseData ? phaseData.startPoint?.x : 0);
    createLabelInputPair('Start Point Y:', 'number', 'startPointY', phaseData ? phaseData.startPoint?.y : 0);
    createLabelInputPair('End Point X:', 'number', 'endPointX', phaseData ? phaseData.endPoint?.x : 0);
    createLabelInputPair('End Point Y:', 'number', 'endPointY', phaseData ? phaseData.endPoint?.y : 0);
    createLabelInputPair('Name in Lead II:', 'text', 'nameInLead2', phaseData ? phaseData.nameInLead2 : '');

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

    createLabelInputPair('Multiplier:', 'number', 'multiplier', phaseData ? phaseData.multiplier : 0.1 , 0.1);

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

function loadCycleFromJson(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const cycleData = JSON.parse(e.target.result);
            document.getElementById('cycleName').value = cycleData.name || '';
            document.getElementById('cycleDuration').value = cycleData.duration || '';

            phasesContainer.innerHTML = '';
            (cycleData.phases || []).forEach(phase => addPhaseEditor(phase));
        } catch (error) {
            alert('Invalid JSON file');
        }
    };
    reader.readAsText(file);
}

function initEditor() {
    phasesContainer = document.getElementById('phasesContainer');
    const addPhaseButton = document.getElementById('addPhaseButton');
    const saveJsonButton = document.getElementById('saveJsonButton');
    const loadJsonInput = document.getElementById('loadJsonInput');

    addPhaseButton.addEventListener('click', addPhaseEditor);
    saveJsonButton.addEventListener('click', saveCycleToJson);
    loadJsonInput.addEventListener('change', loadCycleFromJson);
}

// #endregion

let phasesContainer;

setupVectorEditorPopup();
document.addEventListener('DOMContentLoaded', initEditor);
