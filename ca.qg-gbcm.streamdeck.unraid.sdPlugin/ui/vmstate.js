let websocket = null;
let pluginUUID = null;
let actionInfo = {};

// Fonction native appelée par le Stream Deck au chargement de l'interface
function connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo, inActionInfo) {
    pluginUUID = inPluginUUID;
    actionInfo = JSON.parse(inActionInfo);
    let settings = actionInfo.payload.settings;

    websocket = new WebSocket("ws://127.0.0.1:" + inPort);

    websocket.onopen = function () {
        // Enregistrer l'inspecteur
        websocket.send(JSON.stringify({
            event: inRegisterEvent,
            uuid: pluginUUID
        }));

        // Restaurer les paramètres visuels sauvegardés
        if (settings.refreshRate) {
            document.getElementById('refresh-rate').value = settings.refreshRate;
        }

        // Demander la liste des VMs au plugin TypeScript
        requestVmsList();
    };

    websocket.onmessage = function (evt) {
        let jsonObj = JSON.parse(evt.data);
        let event = jsonObj.event;
        let payload = jsonObj.payload || {};

        // On écoute la réponse du plugin
        if (event === "sendToPropertyInspector" && payload.event === "getVmsList") {
            populateDropdown(payload.items, settings.vmId);
        }
    };

    // Écouteurs d'événements pour sauvegarder automatiquement
    document.getElementById('vm-select').addEventListener('change', saveSettings);
    document.getElementById('refresh-rate').addEventListener('change', saveSettings);
    document.getElementById('refresh-btn').addEventListener('click', requestVmsList);
}

function requestVmsList() {
    document.getElementById('vm-select').innerHTML = '<option value="">Chargement depuis Unraid...</option>';
    if (websocket) {
        websocket.send(JSON.stringify({
            event: "sendToPlugin",
            action: actionInfo.action,
            context: pluginUUID,
            payload: { event: "getVmsList" }
        }));
    }
}

function populateDropdown(vms, savedVmId) {
    const select = document.getElementById('vm-select');
    select.innerHTML = '<option value="">Sélectionnez une VM</option>';
    
    vms.forEach(vm => {
        let option = document.createElement('option');
        option.value = vm.value;
        option.text = vm.label;
        // Si c'est la VM qui était déjà sauvegardée, on la sélectionne par défaut
        if (vm.value === savedVmId) {
            option.selected = true;
        }
        select.appendChild(option);
    });
}

function saveSettings() {
    const select = document.getElementById('vm-select');
    const newSettings = {
        vmId: select.value,
        vmName: select.options[select.selectedIndex]?.text || "",
        refreshRate: document.getElementById('refresh-rate').value
    };

    if (websocket) {
        websocket.send(JSON.stringify({
            event: "setSettings",
            context: pluginUUID,
            payload: newSettings
        }));
    }
}