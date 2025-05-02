import { setupEcgSlider } from './ecgSlider.js';
import { createHeartAndLimbElectrodes } from './Measurement.js';

// Function to initialize the application
async function initApp() {

    // Setup ECG slider
    await setupEcgSlider();
    createHeartAndLimbElectrodes();
}

// Event listener for DOMContentLoaded to ensure the app initializes after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initApp);