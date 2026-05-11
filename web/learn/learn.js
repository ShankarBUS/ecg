import { enableStickyHeader } from 'https://shankarbus.github.io/kaadu-ui/kaadu-ui.js';
import { initNoolagam, navigateTo } from 'https://shankarbus.github.io/kaadu-ui/noolagam.js';

initNoolagam({ docsMapUrl: 'data/docs-map.json', pageListElId: 'pageList' });
enableStickyHeader();

homeButton.addEventListener('click', () => navigateTo(''));
ghRepoBtn.addEventListener('click', () => {
    window.open('https://github.com/ShankarBUS/ecg', '_blank');
});
ghProfileBtn.addEventListener('click', () => {
    window.open('https://github.com/ShankarBUS', '_blank');
});
