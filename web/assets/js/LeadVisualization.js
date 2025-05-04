import { getLeadPoints, generateLeadsPoints, getLimbLead } from "./Measurement.js";
import { changeSliderLead, setupECGSlider } from "./Slider.js";
import { drawECGWave, setCanvasDPI } from "./Drawing.js";
import { createKeyValueTable } from 'https://shankarbus.github.io/kaadu-ui/kaadu-ui.js';

let ecgWidth = 200;
let ecgHeight = 200;
let currentLead = 1;

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
    generateLeadsPoints(currentCardiacCycle, ecgWidth, ecgHeight);
    setupECGSlider(currentCardiacCycle, ecgWidth, ecgHeight);
    selectLead(currentLead);

    const leadsContainer = document.getElementById('leadsContainer');

    for (var i = 0; i < 6; i++) {
        const leadLabel = document.createElement('div');
        leadLabel.className = 'lead-label';
        leadLabel.innerText = getLimbLead(i).name;

        const leadCanvas = document.createElement('canvas');
        leadCanvas.id = `leadCanvas${i}`;
        setCanvasDPI(leadCanvas, ecgWidth, ecgHeight);
        let ecgPoints = getLeadPoints(i);
        drawECGWave(leadCanvas, ecgPoints);

        const card = document.createElement('div');
        card.className = 'card ecg-card';

        card.appendChild(leadLabel);
        card.appendChild(leadCanvas);

        const leadIndex = i;
        card.addEventListener('click', () => {
            selectLead(leadIndex);
        });

        leadsContainer.appendChild(card);
    }
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
