import { setupEcgSlider } from './Slider.js';
import { defineLimbElectrodes } from './Measurement.js';
import { drawPhaseVectorInHeart, setupHeartCanvas } from './Drawing.js';
import { CardiacElectricalCycle } from './CardiacCycle.js';

let currentCardiacCycle = null;

// Function to initialize the application
async function initApp() {
    currentCardiacCycle = await CardiacElectricalCycle.getNormalCycle();
    defineLimbElectrodes();
    await setupEcgSlider(currentCardiacCycle);
    setupHeartCanvas(320);
    drawPhaseVectorInHeart(currentCardiacCycle.phases[0], 0);
}

// Event listener for DOMContentLoaded to ensure the app initializes after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);