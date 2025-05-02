import { setupEcgSlider } from './Slider.js';
import { createHeartAndLimbElectrodes } from './Measurement.js';
import { drawVectors } from './Drawing.js';
import { CardiacElectricalCycle } from './CardiacCycle.js';

let currentCardiacCycle = null;

// Function to initialize the application
async function initApp() {

    currentCardiacCycle = await CardiacElectricalCycle.getNormalCycle();
    // Setup ECG slider
    await setupEcgSlider(currentCardiacCycle);
    createHeartAndLimbElectrodes();
    drawVectors(currentCardiacCycle);
}

// Event listener for DOMContentLoaded to ensure the app initializes after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);