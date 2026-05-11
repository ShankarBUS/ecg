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
    var rightClick = event.button === 2;
    if (!draggingPoint && !rightClick) {
        points.push({ x, y });
        drawPoints();
        updateVectors();
    }
    else if (draggingPoint && !rightClick) {
        vectorCanvas.style.cursor = 'move';
    }
    else if (draggingPoint && rightClick) {
        points = points.filter(p => p !== draggingPoint);
        draggingPoint = null;
        drawPoints();
        updateVectors();
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

        if (point === draggingPoint) {
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
        }

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

    if (points.length >= 2) {
        for (let i = 0; i < points.length - 1; i += 2) {
            const a = points[i];
            const b = points[i + 1];
            drawArrow(ctx, a.x, a.y, b.x, b.y, 'dodgerblue', 2);
        }
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
    const pathsField = phaseDiv.querySelector('[name="pathsData"]');
    points = [];
    if (pathsField && pathsField.value) {
        try {
            const parsed = JSON.parse(pathsField.value);
            if (Array.isArray(parsed)) points = parsed.map(p => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 }));
        } catch (e) {
            points = [];
        }
    }
    drawPoints();
}

function updateVectors() {
    // Store the points array in the hidden pathsData field as JSON
    if (!currentPhaseDiv) return;
    const pathsField = currentPhaseDiv.querySelector('[name="pathsData"]');
    if (pathsField) {
        pathsField.value = JSON.stringify(points.map(p => ({ x: Number(p.x) || 0, y: Number(p.y) || 0 })));
        const summary = currentPhaseDiv.querySelector('.points-count');
        if (summary) summary.textContent = `Points: ${points.length}`;
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

    // Hidden storage for multiple vector points (as JSON array of {x,y}).
    const pathsInput = document.createElement('input');
    pathsInput.type = 'hidden';
    pathsInput.name = 'pathsData';
    // visible summary of number of points
    const pointsSummary = document.createElement('span');
    // populate from phaseData.paths or fallback to start/end points
    let initialPoints = [];
    if (phaseData && phaseData.paths && Array.isArray(phaseData.paths) && phaseData.paths.length > 0) {
        // phaseData.paths may be array of strings like "sx,sy,ex,ey" or objects
        try {
            const parsed = phaseData.paths.map(p => {
                if (typeof p === 'string') {
                    const parts = p.split(',').map(Number);
                    return { x: parts[0], y: parts[1], endX: parts[2], endY: parts[3] };
                }
                return p;
            });
            parsed.forEach(p => initialPoints.push({ x: p.x, y: p.y }, { x: p.endX, y: p.endY }));
        } catch (e) {
            initialPoints = [];
        }
    } else if (phaseData && phaseData.startPoint && phaseData.endPoint) {
        initialPoints = [{ x: phaseData.startPoint.x, y: phaseData.startPoint.y }, { x: phaseData.endPoint.x, y: phaseData.endPoint.y }];
    }
    pathsInput.value = JSON.stringify(initialPoints || []);
    pointsSummary.textContent = `Points: ${(initialPoints || []).length}`;
    phaseDiv.appendChild(pathsInput);
    phaseDiv.appendChild(pointsSummary);
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
    let nameInLead2 = phaseDiv.querySelector('[name="nameInLead2"]').value;
    let typeCMB = phaseDiv.querySelector('combo-box.combo-box');
    let type = typeCMB && typeCMB.selectedItem ? typeCMB.selectedItem.value : 'flat';
    let multiplier = parseFloat(phaseDiv.querySelector('[name="multiplier"]').value);

    // Read points from hidden pathsData and convert into array of path strings "sx,sy,ex,ey"
    const pathsField = phaseDiv.querySelector('[name="pathsData"]');
    let paths = [];
    if (pathsField && pathsField.value) {
        try {
            const parsed = JSON.parse(pathsField.value);
            if (Array.isArray(parsed) && parsed.length >= 2) {
                for (let i = 0; i < parsed.length - 1; i += 2) {
                    const a = parsed[i];
                    const b = parsed[i + 1];
                    paths.push(`${Number(a.x) || 0},${Number(a.y) || 0},${Number(b.x) || 0},${Number(b.y) || 0}`);
                }
            }
        } catch (e) {
            paths = [];
        }
    }

    return {
        name: name,
        startTime: startTime,
        duration: duration,
        paths: paths,
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
