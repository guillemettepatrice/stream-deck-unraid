# Unraid Stream Deck Plugin
🇫🇷 [Français](#-français) | 🇬🇧 [English](#-english)

---

## 🇫🇷 Français

Un plugin puissant et optimisé pour surveiller et contrôler votre serveur Unraid directement depuis un Elgato Stream Deck.

### 🚀 Fonctionnalités (V2.0)
Ce plugin a été entièrement réécrit pour offrir des performances maximales et une intégration native avec l'API Unraid.
- **Statistiques Serveur :** Surveillance en temps réel du CPU, de la RAM et de la température globale.
- **Réseau :** Suivi de la bande passante (RX/TX) avec sélection dynamique de l'interface (`eth0`, `br0`, etc.).
- **Docker :** Affichage de l'état et contrôle (Démarrer/Arrêter/Pause) des conteneurs via un menu déroulant auto-peuplé.
- **Machines Virtuelles (VM) :** Gestion des états des VM directement depuis les touches.
- **Stockage & Array :** Surveillance de l'espace libre/utilisé par disque ou partage, et état de la grappe (Array).
- **Onduleur (UPS) :** Suivi de la charge en watts et de la capacité de la batterie, avec seuil d'alerte personnalisable.
- **Températures :** Surveillance ciblée via les capteurs matériels.

### 📥 Installation
1. Téléchargez la dernière version du fichier `ca.qg-gbcm.streamdeck.unraid.streamDeckPlugin` depuis la section [Releases](../../releases) de ce dépôt.
2. Double-cliquez sur le fichier téléchargé. L'application Stream Deck l'installera automatiquement.

### ⚙️ Configuration
L'interface de configuration du plugin est divisée en deux onglets :
1. **Onglet Serveur (Global) :**
   - Renseignez l'URL de votre hôte Unraid (ex: `http://192.168.1.100`).
   - Collez votre **Clé API / Token GraphQL**.
   - *Ces paramètres sont partagés automatiquement entre toutes vos touches.*
2. **Onglet Action :**
   - Sélectionnez l'élément spécifique à surveiller (quel conteneur, quelle VM, quelle interface...).
   - Définissez le **taux de rafraîchissement** en secondes (ex: 2s pour le réseau, 60s pour le stockage).

### 🛠️ Développement & Compilation
Ce projet utilise le SDK moderne d'Elgato (`@elgato/streamdeck`) et est écrit en TypeScript. L'architecture repose sur un contrôleur centralisé (`BasePollingAction`) respectant le principe DRY.
- `npm install` pour installer les dépendances.
- `npm run build` pour compiler le TypeScript en JavaScript.
- Le déploiement (CI/CD) est géré automatiquement par **GitHub Actions**. La création d'un tag déclenche la compilation et l'empaquetage du plugin, qui est ensuite rattaché à la Release.

---

## 🇬🇧 English

A powerful and optimized plugin to monitor and control your Unraid server directly from an Elgato Stream Deck.

### 🚀 Features (V2.0)
This plugin has been completely rewritten to offer maximum performance and native integration with the Unraid API.
- **Server Stats:** Real-time monitoring of CPU, RAM, and overall temperature.
- **Network:** Bandwidth tracking (RX/TX) with dynamic interface selection (`eth0`, `br0`, etc.).
- **Docker:** Display state and control (Start/Stop/Pause) containers via an auto-populated dropdown.
- **Virtual Machines (VM):** Manage VM states directly from the keys.
- **Storage & Array:** Monitor free/used space per disk or share, and array status.
- **UPS:** Track wattage load and battery capacity, with a customizable alert threshold.
- **Temperatures:** Targeted monitoring via hardware sensors.

### 📥 Installation
1. Download the latest `ca.qg-gbcm.streamdeck.unraid.streamDeckPlugin` file from the [Releases](../../releases) section of this repository.
2. Double-click the downloaded file. The Stream Deck app will install it automatically.

### ⚙️ Configuration
The plugin configuration interface is divided into two tabs:
1. **Server Tab (Global):**
   - Unraid host URL (e.g., `http://192.168.1.100`).
   - Your **API Key / GraphQL Token**.
   - *These settings are automatically shared across all your keys.*
2. **Action Tab:**
   - Select the specific item to monitor.
   - Set the **refresh rate** in seconds.

### 🛠️ Development & Build
This project uses the modern Elgato SDK (`@elgato/streamdeck`) and is written in TypeScript. The architecture is based on a centralized controller (`BasePollingAction`) following the DRY principle.
- `npm install` to install dependencies.
- `npm run build` to compile TypeScript to JavaScript.
- Deployment (CI/CD) is handled automatically by **GitHub Actions**. Pushing a new tag triggers the build and packaging of the plugin, which is then attached to the Release.

---
*Développé par / Developed by Patrice | [pgdevops.ca](https://pgdevops.ca)*