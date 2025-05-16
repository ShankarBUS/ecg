import { generateLeadsPoints, getLimbLead, getLimbLeads, durationToBeatsPerMinute } from "./Measurement.js";
import { changeSliderLead, setupECGSlider } from "./Slider.js";
import { drawECGWave, getECGCanvasWidthForTime, scaleTimeToPixels, setCanvasDPI } from "./Drawing.js";
import { createKeyValueTable } from 'https://shankarbus.github.io/kaadu-ui/kaadu-ui.js';

let ecgHeight = 200;
let currentLead = 1;
let allLeads = [];

const leadDetailsContainer = document.getElementById('leadDetailsContainer');
export function selectLead(leadIndex) {
    currentLead = leadIndex;
    changeSliderLead(currentLead);
    const lead = getLimbLead(leadIndex);
    const json = {
        'Selected:': lead.name,
        'Axis:': `${lead.axis}°`,
        '(+) Electrode:': lead.positiveElectrode.shortName,
        '(-) Electrodes:': lead.negativeElectrodes.map(e => e.shortName).join(', '),
    };
    const infoTable = createKeyValueTable(json, value => {
        const valueElement = document.createElement('span');
        valueElement.textContent = value;
        return valueElement;
    });
    leadDetailsContainer.innerHTML = '';
    leadDetailsContainer.appendChild(infoTable);
    displayLimbElectrodes(lead.positiveElectrode, lead.negativeElectrodes);
}

export function setupLeadVisualization(currentCardiacCycle) {
    displayECGDetails(currentCardiacCycle);
    const width = getECGCanvasWidthForTime(currentCardiacCycle.duration);
    const sliderWidth = scaleTimeToPixels(currentCardiacCycle.duration);
    generateLeadsPoints(currentCardiacCycle, width, ecgHeight);
    setupECGSlider(currentCardiacCycle, width, ecgHeight, sliderWidth);

    allLeads = getLimbLeads();
    const leadCMB = document.getElementById('leadCMB');
    var leadOptions = [];

    const leadsContainer = document.getElementById('leadsContainer');
    leadsContainer.innerHTML = '';
    for (var i = 0; i < allLeads.length; i++) {
        const leadLabel = document.createElement('div');
        leadLabel.className = 'lead-label';
        leadLabel.innerText = getLimbLead(i).name;
        leadOptions.push({
            value: i.toString(),
            label: getLimbLead(i).name
        });

        const leadCanvas = document.createElement('canvas');
        leadCanvas.id = `leadCanvas${i}`;
        leadCanvas.className = 'ecg-canvas';
        leadCanvas.name = i.toString();
        setCanvasDPI(leadCanvas, width, ecgHeight);
        drawECGWave(leadCanvas, i, 0);

        leadsContainer.appendChild(leadCanvas);
    }

    leadCMB.loadOptions(leadOptions);
    leadCMB.addEventListener('selectionChanged',
        () => selectLead(leadCMB.selectedItem.value));
    leadCMB.setSelectedItem(currentLead.toString());
    selectLead(currentLead);
}

export function updateECGWavesInAllLeads(time) {
    for (let i = 0; i < allLeads.length; i++) {
        const ecgCanvas = document.getElementById(`leadCanvas${i}`);
        if (!ecgCanvas) continue;
        drawECGWave(ecgCanvas, i, time);
    }
}

let bpmText = null;
let timeText = null;
let phaseText = null;
const ecgDetailsContainer = document.getElementById('ecgDetailsContainer');
export function displayECGDetails(cycle, phase = null, time = null) {
    if (!bpmText) {
        bpmText = document.createElement('p');
        ecgDetailsContainer.appendChild(bpmText);
    }
    if (!timeText) {
        timeText = document.createElement('p');
        ecgDetailsContainer.appendChild(timeText);
    }
    if (!phaseText) {
        phaseText = document.createElement('p');
        ecgDetailsContainer.appendChild(phaseText);
    }

    if (!cycle) return;
    if (!phase) phase = cycle.phases[0];
    if (!time) time = 0;

    bpmText.innerText = `HR: ${durationToBeatsPerMinute(cycle.duration)}/min |`;
    timeText.innerText = `Time: ${time}ms/${cycle.duration}ms |`;
    phaseText.innerText = `Phase: ${phase.name}`;
}

const electrodesContainer = document.getElementById('electrodesContainer');

export function createLimbElectrodeElement(e) {
    const electrodeLabel = document.createElement('p');
    electrodeLabel.id = `electrode-${e.shortName}-label`;
    electrodeLabel.className = 'electrode-label';
    electrodeLabel.innerText = e.shortName;

    const electrode = document.createElement('div');
    electrode.id = `electrode-${e.shortName}`;
    electrode.className = 'electrode';
    electrode.appendChild(electrodeLabel);

    electrode.style.left = `calc(${e.x * 100}% - ${e.x * 20}px)`;
    electrode.style.top = `${e.y * 100}%`;
    electrodesContainer.appendChild(electrode);
}

function displayLimbElectrodes(positiveElectrode, negativeElectrodes) {
    for (let i = 0; i < electrodesContainer.children.length; i++) {
        const electrode = electrodesContainer.children[i];
        electrode.style.display = 'none';
        if (electrode.id === `electrode-${positiveElectrode.shortName}`) {
            electrode.classList.toggle('electrode-negative', false);
            electrode.style.display = 'block';
        } else {
            negativeElectrodes.forEach((e) => {
                if (electrode.id === `electrode-${e.shortName}`) {
                    electrode.classList.toggle('electrode-negative', true);
                    electrode.style.display = 'block';
                }
            });
        }
    }
}

const monitorEffectCB = document.getElementById('monitorEffectCB');
const leadsGroup = document.getElementById('leadsGroup');
monitorEffectCB.addEventListener('click', () => {
    leadsGroup.classList.toggle('monitor-effect', monitorEffectCB.checked);
});