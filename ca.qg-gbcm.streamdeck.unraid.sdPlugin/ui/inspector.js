const { streamDeckClient } = SDPIComponents;

const hostInput = document.getElementById('unraidHost');
const apiKeyInput = document.getElementById('apiKey');
const saveBtn = document.getElementById('saveBtn');

streamDeckClient.getGlobalSettings();

saveBtn.addEventListener('click', () => {
    let hostValue = hostInput.value.trim();
    if (hostValue.endsWith('/')) {
        hostValue = hostValue.slice(0, -1);
    }
    
    const newSettings = {
        unraidHost: hostValue,
        apiKey: apiKeyInput.value.trim()
    };
    
    streamDeckClient.setGlobalSettings(newSettings);
    
    // Récupération dynamique de la traduction
    const originalText = saveBtn.textContent;
    saveBtn.textContent = SDPIComponents.i18n.getMessage("Localization.Saved") || "✔ Saved !";
    
    setTimeout(() => {
        saveBtn.textContent = originalText;
    }, 1500);
});

window.switchTab = function(clickedElement) {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('selected');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    clickedElement.classList.add('selected');
    
    const targetId = clickedElement.getAttribute('data-target');
    document.querySelector(targetId).classList.add('active');
};