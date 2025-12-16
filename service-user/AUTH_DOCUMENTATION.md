# 🔐 Documentation d'Authentification et Sécurité API

Ce document explique comment utiliser le système d'authentification et de sécurité de l'API Sportify.

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Endpoints d'authentification](#endpoints-dauthentification)
3. [Protection des routes](#protection-des-routes)
4. [Utilisation des tokens](#utilisation-des-tokens)
5. [Exemples de requêtes](#exemples-de-requêtes)
6. [Configuration](#configuration)

---

## 🎯 Vue d'ensemble

Le système d'authentification utilise **JWT (JSON Web Tokens)** avec deux types de tokens :
- **Access Token** : Valide 15 minutes, utilisé pour accéder aux ressources protégées
- **Refresh Token** : Valide 7 jours, utilisé pour obtenir un nouveau access token

### Fonctionnalités de sécurité

✅ **JWT avec expiration**
✅ **Refresh tokens pour renouvellement automatique**
✅ **Rate limiting** sur les routes d'authentification (protection brute force)
✅ **Hashage des mots de passe** avec bcrypt
✅ **Validation des données** avant création
✅ **Gestion multi-appareils** (jusqu'à 5 refresh tokens par utilisateur)
✅ **Cookies HTTP-only** pour stockage sécurisé des tokens
✅ **Protection par rôles** (admin, coach, user)

---

## 🔑 Endpoints d'authentification

### 1. Inscription (Register)

**POST** `/auth/register`

Crée un nouvel utilisateur et retourne les tokens.

**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "cin": "12345678",
  "role": "user",
  "specialite": "Fitness" // Requis si role = "coach"
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Inscription réussie",
  "user": {
    "_id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "cin": "12345678"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Connexion (Login)

**POST** `/auth/login`

Authentifie un utilisateur existant.

**Body:**
```json
{
  "email": "john@example.com", // ou "username": "john_doe"
  "password": "SecurePass123!"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}
```

**Erreur (401):**
```json
{
  "success": false,
  "message": "Email/Username ou mot de passe incorrect"
}
```

---

### 3. Rafraîchir le token (Refresh)

**POST** `/auth/refresh`

Génère un nouveau access token à partir d'un refresh token.

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Token rafraîchi avec succès",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 4. Déconnexion (Logout)

**POST** `/auth/logout` 🔒 *Authentifié*

Déconnecte l'utilisateur et invalide le refresh token.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Body (optionnel):**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

### 5. Déconnexion de tous les appareils

**POST** `/auth/logout-all` 🔒 *Authentifié*

Déconnecte l'utilisateur de tous les appareils.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Déconnexion de tous les appareils réussie"
}
```

---

### 6. Obtenir les informations de l'utilisateur connecté

**GET** `/auth/me` 🔒 *Authentifié*

Retourne les informations de l'utilisateur actuellement connecté.

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Réponse (200):**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "cin": "12345678",
    "date_creation": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## 🛡️ Protection des routes

### Middleware d'authentification

Toutes les routes protégées nécessitent un **access token valide** dans le header :

```
Authorization: Bearer <accessToken>
```

### Middleware de rôles

#### `requireAdmin`
Seuls les administrateurs peuvent accéder.

```javascript
router.get("/admin-only", authenticate, requireAdmin, controller.action);
```

#### `requireCoachOrAdmin`
Les coachs et administrateurs peuvent accéder.

```javascript
router.get("/coach-resource", authenticate, requireCoachOrAdmin, controller.action);
```

#### `requireOwnerOrAdmin`
Le propriétaire de la ressource ou un administrateur peut accéder.

```javascript
router.put("/update/:id", authenticate, requireOwnerOrAdmin(), controller.action);
```

### Exemple de routes protégées

```javascript
// Route publique
router.get("/public", controller.publicAction);

// Route authentifiée (n'importe quel utilisateur connecté)
router.get("/protected", authenticate, controller.protectedAction);

// Route admin uniquement
router.delete("/admin", authenticate, requireAdmin, controller.adminAction);

// Route propriétaire ou admin
router.put("/update/:id", authenticate, requireOwnerOrAdmin(), controller.update);
```

---

## 🔐 Utilisation des tokens

### Option 1 : Header Authorization (Recommandé pour API)

```javascript
fetch('http://localhost:3000/user/showall', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'application/json'
  }
})
```

### Option 2 : Cookies (Automatique)

Si vous utilisez les cookies (définis lors du login/register), les tokens sont automatiquement envoyés avec chaque requête.

### Gestion du refresh token

Quand l'access token expire (après 15 minutes), utilisez le refresh token pour en obtenir un nouveau :

```javascript
// 1. Access token expiré - obtenir un nouveau
const response = await fetch('http://localhost:3000/auth/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    refreshToken: refreshToken
  })
});

const { accessToken } = await response.json();

// 2. Utiliser le nouveau access token
```

---

## 📝 Exemples de requêtes

### Exemple complet avec cURL

#### 1. Inscription
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234!",
    "cin": "12345678",
    "role": "user"
  }'
```

#### 2. Connexion
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

#### 3. Accéder à une route protégée
```bash
curl -X GET http://localhost:3000/user/showall \
  -H "Authorization: Bearer <accessToken>" \
  -H "Content-Type: application/json"
```

#### 4. Rafraîchir le token
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<refreshToken>"
  }'
```

---

### Exemple avec JavaScript (Fetch API)

```javascript
// 1. Connexion
const loginResponse = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'Test1234!'
  })
});

const { accessToken, refreshToken, user } = await loginResponse.json();

// 2. Utiliser le token pour accéder à une route protégée
const protectedResponse = await fetch('http://localhost:3000/user/showall', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await protectedResponse.json();
console.log(data);

// 3. Rafraîchir le token si nécessaire
const refreshResponse = await fetch('http://localhost:3000/auth/refresh', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ refreshToken })
});

const { accessToken: newAccessToken } = await refreshResponse.json();
```

---

## ⚙️ Configuration

### Variables d'environnement (.env)

Créez un fichier `.env` à la racine du projet :

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production-min-32-chars

# Token Expiry (optionnel - valeurs par défaut)
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Environment
NODE_ENV=development # ou 'production'
PORT=3000
```

### Sécurité en production

⚠️ **IMPORTANT** :
1. Changez les secrets JWT en production
2. Utilisez des secrets d'au moins 32 caractères
3. Activez HTTPS (`secure: true` dans les cookies)
4. Configurez CORS pour autoriser uniquement votre domaine
5. Utilisez un gestionnaire de secrets (AWS Secrets Manager, etc.)

---

## 🚨 Gestion des erreurs

### Erreurs d'authentification

| Code | Message | Description |
|------|---------|-------------|
| 401 | Accès non autorisé. Token manquant. | Aucun token fourni |
| 401 | Token invalide ou expiré | Token invalide ou expiré |
| 401 | Utilisateur non trouvé | L'utilisateur du token n'existe plus |
| 403 | Accès refusé. Rôle requis: admin | Permissions insuffisantes |

### Erreurs de validation

| Code | Message | Description |
|------|---------|-------------|
| 400 | Tous les champs sont requis | Champs manquants |
| 400 | Cet email est déjà utilisé | Email dupliqué |
| 400 | Le mot de passe doit contenir... | Mot de passe invalide |

---

## 📊 Structure des tokens JWT

### Access Token Payload
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234568790,
  "iss": "sportify-api",
  "aud": "sportify-client"
}
```

### Refresh Token Payload
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "type": "refresh",
  "iat": 1234567890,
  "exp": 1234571490,
  "iss": "sportify-api",
  "aud": "sportify-client"
}
```

---

## 🔄 Flux d'authentification

```
1. Client → POST /auth/register ou /auth/login
   ↓
2. Serveur → Génère accessToken + refreshToken
   ↓
3. Client → Stocke les tokens
   ↓
4. Client → Utilise accessToken pour requêtes protégées
   ↓
5. Si accessToken expiré → POST /auth/refresh
   ↓
6. Serveur → Retourne nouveau accessToken
   ↓
7. Client → Continue avec nouveau accessToken
```

---

## ✅ Checklist de sécurité

- [x] Hashage des mots de passe (bcrypt)
- [x] JWT avec expiration
- [x] Refresh tokens
- [x] Rate limiting sur auth
- [x] Validation des données
- [x] Protection par rôles
- [x] Cookies HTTP-only
- [x] CORS configuré
- [x] Helmet pour sécurité HTTP
- [x] Gestion multi-appareils

---

## 📞 Support

Pour toute question ou problème, consultez les logs du serveur ou vérifiez :
1. Les variables d'environnement sont correctement configurées
2. Les tokens sont valides et non expirés
3. Les headers Authorization sont correctement formatés
4. Les rôles de l'utilisateur sont corrects

