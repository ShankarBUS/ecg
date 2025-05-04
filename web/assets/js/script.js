import { defineLimbElectrodes, defineLimbLeads } from './Measurement.js';
import { handleWidthChange } from './Drawing.js';
import { CardiacElectricalCycle } from './CardiacCycle.js';
import { enableStickyHeader, enableHamburgerMenu, setupMessagePopup, showMessagePopup } from 'https://shankarbus.github.io/kaadu-ui/kaadu-ui.js';
import { setupLeadVisualization } from './LeadVisualization.js';
import { updateHeart } from './Slider.js';

let currentCardiacCycle = null;

async function initApp() {
    enableStickyHeader();
    enableHamburgerMenu();
    setupMessagePopup();
    // showMessagePopup('Welcome to the ECG Simulation! This simulation will help you understand the electrical activity of the heart. Use the controls to navigate through the cardiac cycle phases.');
    currentCardiacCycle = await CardiacElectricalCycle.getNormalCycle();
    defineLimbElectrodes();
    defineLimbLeads();
    handleWidthChange(window.innerWidth);
    setupLeadVisualization(currentCardiacCycle);

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

document.addEventListener('DOMContentLoaded', initApp);