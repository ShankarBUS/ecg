import { getLeadPoints, generateLeadsPoints, getLimbLead } from "./Measurement.js";
import { changeSliderLead, setupEcgSlider } from "./Slider.js";
import { drawECGWave } from "./Drawing.js";

let ecgWidth = 200;
let ecgHeight = 200;
let currentLead = 1;

export function setupLeadVisualization(currentCardiacCycle) {
    generateLeadsPoints(currentCardiacCycle, ecgWidth, ecgHeight);
    setupEcgSlider(currentCardiacCycle, currentLead, ecgWidth, ecgHeight);

    const leadsContainer = document.getElementById('leadsContainer');

    for (var i = 0; i < 6; i++) {
        const leadLabel = document.createElement('div');
        leadLabel.className = 'lead-label';
        leadLabel.innerText = getLimbLead(i).name;

        const leadCanvas = document.createElement('canvas');
        leadCanvas.id = `leadCanvas${i}`;
        leadCanvas.width = 200;
        leadCanvas.height = 200;
        let ecgPoints = getLeadPoints(i);
        drawECGWave(leadCanvas, ecgPoints);

        const card = document.createElement('div');
        card.className = 'card ecg-card';

        card.appendChild(leadLabel);
        card.appendChild(leadCanvas);

        const leadIndex = i;
        card.addEventListener('click', () => {
            currentLead = leadIndex;
            changeSliderLead(currentLead);
        });

        leadsContainer.appendChild(card);
    }
}