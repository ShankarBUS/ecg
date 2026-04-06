import { defineLimbElectrodes, defineLimbLeads } from './Measurement.js';
import { handleWidthChange } from './Drawing.js';
import { enableStickyHeader, enableHamburgerMenu, setupMessagePopup, showMessagePopup } from 'https://shankarbus.github.io/kaadu-ui/kaadu-ui.js';
import { setupLeadVisualization } from './LeadVisualization.js';
import { updateECGPhase, updateHeart } from './Slider.js';
import { CardiacActivity } from './models/CardiacActivity.js';

let currentCardiacActivity = null;
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
    currentCardiacActivity = await loadActivityFromCondition(id);
    if (currentCardiacActivity && currentCardiacActivity.cycles.length > 0) {
        currentCardiacCycle = currentCardiacActivity.cycles[0];
        setupLeadVisualization(currentCardiacCycle);
    }
}

async function loadActivityFromCondition(id) {
    try {
        const response = await fetch(`./assets/data/activity-${id}.json`);
        const data = await response.json();
        return CardiacActivity.fromJson(data);
    } catch (error) {
        console.error('Error loading activity from condition:', error);
        return null;
    }
}

const playPauseBtn = document.getElementById('playPauseBtn');
const ecgSlider = document.getElementById('ecgSlider');
const speedInput = document.getElementById('speedInput');
const loopToggle = document.getElementById('loopToggle');
let isPlaying = false;
let animationFrameId = null;
let lastTimestamp = null;

playPauseBtn.addEventListener('click', () => {
    if (isPlaying) {
        pauseAnimation();
    } else {
        startAnimation();
    }
});

function startAnimation() {
    if (!currentCardiacCycle) return;
    isPlaying = true;
    playPauseBtn.textContent = 'Pause';
    lastTimestamp = null;
    animationFrameId = requestAnimationFrame(animate);
}

function pauseAnimation() {
    isPlaying = false;
    playPauseBtn.textContent = 'Play';
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function animate(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const elapsed = timestamp - lastTimestamp;
    const speed = parseFloat(speedInput.value);

    const cycleDurationMs = currentCardiacCycle.duration / speed;
    const sliderValue = (elapsed / cycleDurationMs) * parseFloat(ecgSlider.max);
    ecgSlider.value = sliderValue;
    updateECGPhase();

    if (elapsed < cycleDurationMs) {
        animationFrameId = requestAnimationFrame(animate);
    }
    else if (loopToggle.checked) {
        lastTimestamp = null;
        animationFrameId = requestAnimationFrame(animate);
    }
    else {
        pauseAnimation();
        ecgSlider.value = 0;
        updateECGPhase(0);
    }
}

document.addEventListener('DOMContentLoaded', initApp);