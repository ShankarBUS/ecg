import { setupEcgSlider } from './Slider.js';
import { defineLimbElectrodes } from './Measurement.js';
import { drawPhaseVectorInHeart, setupHeartCanvas } from './Drawing.js';
import { CardiacElectricalCycle } from './CardiacCycle.js';
import { enableStickyHeader, enableHamburgerMenu, setupMessagePopup, showMessagePopup } from 'https://shankarbus.github.io/kaadu-ui/kaadu-ui.js';

let currentCardiacCycle = null;

// Function to initialize the application
async function initApp() {
    enableStickyHeader();
    enableHamburgerMenu();
    setupMessagePopup();
    // showMessagePopup('Welcome to the ECG Simulation! This simulation will help you understand the electrical activity of the heart. Use the controls to navigate through the cardiac cycle phases.');
    currentCardiacCycle = await CardiacElectricalCycle.getNormalCycle();
    defineLimbElectrodes();
    await setupEcgSlider(currentCardiacCycle);
    setupHeartCanvas(320);
    drawPhaseVectorInHeart(currentCardiacCycle.phases[0], 0);
}

// Event listener for DOMContentLoaded to ensure the app initializes after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);