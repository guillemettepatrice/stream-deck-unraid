const { streamDeckClient, i18n } = SDPIComponents;

Promise.all([
    fetch('../en.json').then(res => res.json()),
    fetch('../fr.json').then(res => res.json())
]).then(([en, fr]) => {
    i18n.locales = { en, fr };
    
    document.querySelectorAll('*').forEach(el => {
        Array.from(el.attributes).forEach(attr => {
            if (attr.value.startsWith('__MSG_') && attr.value.endsWith('__')) {
                const key = attr.value.replace('__MSG_', '').replace('__', '');
                const translatedText = i18n.getMessage(key) || key;
                
                el.setAttribute(attr.name, translatedText);
            }
        });

        if (el.tagName.startsWith('SDPI-') && typeof el.requestUpdate === 'function') {
            el.requestUpdate();
        }
    });
}).catch(err => console.error("Erreur de chargement des traductions:", err));


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