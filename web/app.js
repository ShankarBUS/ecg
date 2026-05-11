import { enableStickyHeader } from 'https://shankarbus.github.io/kaadu-ui/kaadu-ui.js';

enableStickyHeader();

export function isDebug() {
    return /localhost|127\.0\.0\.1|::1/.test(window.location.hostname);
}

// Workaround for VS Code's Live Server extension and GitHub Pages hosting
export function correctUrl(path) {
    if (isDebug()) {
        return '/web' + path;
    } else {
        return '/ecg' + path;
    }
}

document.querySelectorAll('.interact-button').forEach(button => {
    button.addEventListener('click', () => {
        navigation.navigate(correctUrl('/interact'));
    });
});
document.querySelectorAll('.learn-button').forEach(button => {
    button.addEventListener('click', () => {
        navigation.navigate(correctUrl('/learn'));
    });
});
ghRepoBtn.addEventListener('click', () => {
    window.open('https://github.com/ShankarBUS/ecg', '_blank');
});
ghProfileBtn.addEventListener('click', () => {
    window.open('https://github.com/ShankarBUS', '_blank');
});
