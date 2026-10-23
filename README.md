# Unraid Stream Deck Plugin

*Read this in [French](#-version-française)*

An unofficial Elgato Stream Deck plugin to monitor and control an Unraid server via its GraphQL API.

## 🚀 Features
- **Array State:** Monitor your array status (Started/Stopped) and toggle it directly.
- **Docker Control:** Display real-time status of a specific container and start/stop it with a single press.
- **Server Stats:** Track overall CPU and RAM usage with dynamic visual gauges.

## 🛠 Installation
1. Download the `ca.qg-gbcm.streamdeck.unraid.streamDeckPlugin` file from the [Releases](../../releases) section.
2. Double-click the file to install it into the Stream Deck application.

## ⚙️ Unraid Configuration (Prerequisites)
This plugin requires the Unraid GraphQL API to be active on your server.

1. Go to your Unraid server settings and ensure the local API is enabled.
2. Generate an API key.
3. Enter your server URL (e.g., `http://192.168.1.50`) and API key in the Global Settings of any plugin action on your Stream Deck.

## ⚠️ Security Best Practices
Stream Deck global settings are saved in plain text on your local machine. 
**Do NOT generate or use an API key associated with your `root` account.**
Create a restricted user in Unraid dedicated solely to GraphQL monitoring and Docker management to limit risks in case your workstation is compromised.

---

## 🇫🇷 Version Française

Un plugin non officiel pour Elgato Stream Deck permettant de surveiller et de contrôler un serveur Unraid via l'API GraphQL.

## 🚀 Fonctionnalités
- **Array State :** Surveillez l'état de votre grappe de disques (Started/Stopped) et basculez son état.
- **Docker Control :** Affichez le statut en temps réel d'un conteneur spécifique et démarrez/arrêtez-le d'une simple pression.
- **Server Stats :** Suivez l'utilisation globale du CPU et de la RAM grâce à des jauges visuelles.

## 🛠 Installation
1. Téléchargez le fichier `ca.qg-gbcm.streamdeck.unraid.streamDeckPlugin` depuis la section [Releases](../../releases).
2. Double-cliquez sur le fichier pour l'installer dans l'application Stream Deck.

## ⚙️ Configuration Unraid (Prérequis)
Ce plugin nécessite que l'API Unraid soit active sur votre serveur.

1. Allez dans les paramètres de votre serveur Unraid et assurez-vous que l'API locale est activée.
2. Générez une clé d'API.
3. Renseignez l'URL de votre serveur (ex: `http://192.168.1.50`) et la clé d'API dans les paramètres globaux d'une action du plugin sur Stream Deck.

## ⚠️ Sécurité et bonnes pratiques
Les paramètres globaux de l'application Stream Deck sont sauvegardés en texte clair sur votre ordinateur local. 
**Ne générez PAS et n'utilisez PAS une clé d'API associée à votre compte `root`.**
Créez un utilisateur restreint dans Unraid dédié uniquement au monitoring et à la gestion de vos conteneurs Docker pour limiter les risques en cas de compromission de votre poste de travail.