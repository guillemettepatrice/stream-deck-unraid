# Unraid Stream Deck Plugin

Un plugin non officiel pour Elgato Stream Deck permettant de surveiller et de contrôler un serveur Unraid via l'API GraphQL.

## 🚀 Fonctionnalités
- **Array State :** Surveillez l'état de votre grappe de disques (Started/Stopped).
- **Docker Control :** Affichez le statut en temps réel d'un conteneur spécifique et démarrez/arrêtez-le d'une simple pression.
- **Server Stats :** Suivez l'utilisation globale du CPU et de la RAM.

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