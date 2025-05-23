import { defineLimbElectrodes, defineLimbLeads } from './Measurement.js';
import { handleWidthChange } from './Drawing.js';
import { CardiacElectricalCycle } from './models/CardiacElectricalCycle.js';
import { enableStickyHeader, enableHamburgerMenu, setupMessagePopup, showMessagePopup } from 'https://shankarbus.github.io/kaadu-ui/kaadu-ui.js';
import { setupLeadVisualization } from './LeadVisualization.js';
import { updateHeart } from './Slider.js';

let currentCardiacCycle = null;

async function initApp() {
    enableStickyHeader();
    enableHamburgerMenu();
    setupMessagePopup();
    
    defineLimbElectrodes();
    defineLimbLeads();
    handleWidthChange(window.innerWidth, true);
    loadConditions();

    let resizeTimeout;

    window.addEventListener('resize', function () {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(function () {
            const handled = handleWidthChange(window.innerWidth);
            if (handled) updateHeart();
        }, 200);
    });
}

const conditionCMB = document.getElementById('conditionCMB');

async function loadConditions() {
    try {
        const response = await fetch('./assets/data/conditions.json');
        const data = await response.json();
        const options = data.conditions.map(condition => ({
            value: condition.id,
            label: condition.name
        }));
        conditionCMB.loadOptions(options);

        conditionCMB.addEventListener('selectionChanged',
             () => selectCondition(conditionCMB.selectedItem.value));
        conditionCMB.setSelectedItem('NRML'); // Set default value to normal
        selectCondition(conditionCMB.selectedItem.value);
    } catch (error) {
        console.error('Error loading conditions:', error);
    }
}

async function selectCondition(id) {
    currentCardiacCycle = await loadCycleFromCondition(id);
    if (currentCardiacCycle)
        setupLeadVisualization(currentCardiacCycle);
}

async function loadCycleFromCondition(id) {
    try {
        const response = await fetch(`./assets/data/cycle-${id}.json`);
        const data = await response.json();
        return CardiacElectricalCycle.fromJson(data);
    } catch (error) {
        console.error('Error loading cycle from condition:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', initApp);