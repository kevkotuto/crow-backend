
# Messagerie Backend

Ce projet est un backend de messagerie en temps réel, conçu pour fournir une infrastructure sécurisée et performante pour une application de messagerie moderne. Il gère l'authentification, la messagerie instantanée, la gestion des fichiers, les notifications push, et bien plus encore.

## Fonctionnalités

### Authentification et Gestion des Utilisateurs
- **Enregistrement et Connexion** : Les utilisateurs peuvent s'inscrire et se connecter en utilisant leur numéro de téléphone, avec OTP (via l'API Termii).
- **Gestion des Tokens JWT** : Sécurisation des requêtes API via des tokens JWT.
- **Statut en Ligne** : Suivi des utilisateurs connectés en temps réel avec `Socket.io`.
- **Détection de l'Inactivité** : Mise à jour de l'état en ligne en fonction des connexions et déconnexions.

### Messagerie en Temps Réel
- **Envoi et Réception de Messages** : Envoi et réception instantanés de messages textuels.
- **Statuts des Messages** : Suivi des messages (envoyé, reçu, lu).
- **Notifications Push** : (Prévu) Intégration avec Firebase Cloud Messaging (FCM) ou Expo pour envoyer des notifications push.
- **Gestion des Médias** : Upload de fichiers (images, vidéos) et stockage sur le serveur dans un dossier `uploads`.
- **Accusés de Réception** : Confirmation instantanée de la réception et de la lecture des messages.

### Communication en Temps Réel avec `Socket.io`
- **Événements de Typing** : Notification en temps réel lorsque l'autre personne est en train de taper un message.
- **Réactions aux Messages** : Les utilisateurs peuvent réagir aux messages avec des émojis ou autres réactions.
- **Statut des Utilisateurs** : Gestion en temps réel des statuts de connexion et de déconnexion.

### Recherche et Filtrage des Messages
- **Recherche** : Recherche de messages par contenu, expéditeur ou destinataire.
- **Filtrage** : Filtrage des messages par date.

### Sécurité
- **Chiffrement des Messages** : Les messages sont chiffrés avant d'être stockés dans la base de données.
- **Protection des Données** : Sécurisation des données utilisateur via des tokens JWT.

### Gestion des Groupes (Prévu)
- **Groupes de Discussion** : Création de groupes de discussion avec gestion des membres et des rôles.

### Journalisation et Surveillance (Prévu)
- **Logs d'Activité** : Suivi des activités clés pour des audits et des analyses.
- **Surveillance des Performances** : Surveillance en temps réel des performances du serveur.

## Prérequis

- Node.js (v14 ou supérieur)
- MySQL
- Termii API pour l'envoi des OTP
- Firebase Cloud Messaging (FCM) ou Expo pour les notifications push (optionnel)
- Outils de gestion de base de données (comme MySQL Workbench)

## Installation

1. Clonez le dépôt :

   ```bash
   git clone https://github.com/votre-utilisateur/votre-repo.git
   cd votre-repo
   ```

2. Installez les dépendances :

   ```bash
   npm install
   ```

3. Configurez la base de données MySQL en exécutant les commandes SQL dans `db/schema.sql` pour créer les tables nécessaires.

4. Créez un fichier `.env` à la racine du projet et ajoutez les variables d'environnement nécessaires :

   ```plaintext
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=votre_mot_de_passe
   DB_NAME=messagerie_db

   TERMII_API_KEY=votre_termii_api_key

   JWT_SECRET=votre_secret_jwt

   PORT=4001
   ```

5. Créez le dossier `uploads` à la racine du projet pour stocker les fichiers uploadés :

   ```bash
   mkdir uploads
   ```

## Utilisation

### Lancer le Serveur

Démarrez le serveur en mode développement :

```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:4001`.

### Routes Principales

#### Authentification

- **POST** `/api/auth/register` : Inscription de l'utilisateur avec OTP.
- **POST** `/api/auth/login` : Connexion de l'utilisateur avec OTP.

#### Messagerie

- **POST** `/api/messages/send` : Envoi d'un message.
- **GET** `/api/messages/conversation/:userId1/:userId2` : Récupération des messages entre deux utilisateurs.
- **POST** `/api/messages/react` : Ajouter une réaction à un message.
- **POST** `/api/messages/unreact` : Supprimer une réaction à un message.
- **GET** `/api/messages/search?term=:searchTerm` : Rechercher des messages.
- **GET** `/api/messages/filter?startDate=:startDate&endDate=:endDate` : Filtrer les messages par date.

#### Fichiers

- **POST** `/api/messages/upload` : Upload de fichiers (images, vidéos).

### WebSocket (Socket.io)

Les événements suivants sont disponibles via `Socket.io` :

- `userOnline` : Notification quand un utilisateur se connecte.
- `typing` : Indication qu'un utilisateur est en train de taper un message.
- `stopTyping` : Indication qu'un utilisateur a arrêté de taper.
- `reactionAdded` : Réaction ajoutée à un message.
- `reactionRemoved` : Réaction supprimée d'un message.
- `messageReceived` : Message reçu.
- `messageRead` : Message lu.

## Sécurité

- **Chiffrement des Messages** : Les messages sont chiffrés avant d'être stockés.
- **Tokens JWT** : Chaque requête API est sécurisée par un token JWT.

## Contribution

Les contributions sont les bienvenues. Veuillez soumettre des PR ou ouvrir des issues pour toute suggestion d'amélioration.

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.
