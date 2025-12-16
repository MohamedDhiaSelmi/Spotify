# 🧪 Exemples de tests pour toutes les routes

Ce document contient des exemples de requêtes pour tester toutes les routes de l'API Sportify.

## 📋 Table des matières

1. [Routes d'authentification](#routes-dauthentification)
2. [Routes utilisateur (protégées)](#routes-utilisateur-protégées)
3. [Scripts de test automatisés](#scripts-de-test-automatisés)

---

## 🔐 Routes d'authentification

### 1. Test de l'API Auth

**GET** `/auth/test`

```bash
curl http://localhost:3000/auth/test
```

**Réponse attendue:**
```json
{
  "message": "API Authentification - Fonctionne"
}
```

---

### 2. Inscription (Register)

**POST** `/auth/register`

#### Exemple avec cURL

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "cin": "12345678",
    "role": "user"
  }'
```

#### Exemple avec JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:3000/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'john_doe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    cin: '12345678',
    role: 'user'
  })
});

const data = await response.json();
console.log(data);
```

#### Exemple avec un coach

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "coach_fitness",
    "email": "coach@example.com",
    "password": "CoachPass123!",
    "cin": "87654321",
    "role": "coach",
    "specialite": "Fitness et musculation"
  }'
```

#### Exemple avec un admin

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_user",
    "email": "admin@example.com",
    "password": "AdminPass123!",
    "cin": "11111111",
    "role": "admin"
  }'
```

**Réponse attendue (201):**
```json
{
  "success": true,
  "message": "Inscription réussie",
  "user": {
    "_id": "...",
    "username": "john_doe",
    "email": "john@example.com",
    "role": "user",
    "cin": "12345678",
    "date_creation": "2024-01-15T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 3. Connexion (Login)

**POST** `/auth/login`

#### Exemple avec cURL

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

#### Exemple avec username

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john_doe",
    "password": "SecurePass123!"
  }'
```

#### Exemple avec JavaScript (Fetch)

```javascript
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'SecurePass123!'
  })
});

const { accessToken, refreshToken, user } = await response.json();
console.log('Access Token:', accessToken);
console.log('User:', user);

// Stocker les tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

**Réponse attendue (200):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "user": { ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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

### 4. Rafraîchir le token (Refresh)

**POST** `/auth/refresh`

#### Exemple avec cURL

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

#### Exemple avec JavaScript (Fetch)

```javascript
const refreshToken = localStorage.getItem('refreshToken');

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
localStorage.setItem('accessToken', accessToken);
console.log('Nouveau access token:', accessToken);
```

**Réponse attendue (200):**
```json
{
  "success": true,
  "message": "Token rafraîchi avec succès",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 5. Déconnexion (Logout)

**POST** `/auth/logout` 🔒 *Authentifié*

#### Exemple avec cURL

```bash
# Avec le token dans le header
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

#### Exemple avec JavaScript (Fetch)

```javascript
const accessToken = localStorage.getItem('accessToken');
const refreshToken = localStorage.getItem('refreshToken');

const response = await fetch('http://localhost:3000/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    refreshToken: refreshToken
  })
});

// Supprimer les tokens du localStorage
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
```

**Réponse attendue (200):**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

---

### 6. Déconnexion de tous les appareils

**POST** `/auth/logout-all` 🔒 *Authentifié*

#### Exemple avec cURL

```bash
curl -X POST http://localhost:3000/auth/logout-all \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Réponse attendue (200):**
```json
{
  "success": true,
  "message": "Déconnexion de tous les appareils réussie"
}
```

---

### 7. Obtenir les informations de l'utilisateur connecté

**GET** `/auth/me` 🔒 *Authentifié*

#### Exemple avec cURL

```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Exemple avec JavaScript (Fetch)

```javascript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('http://localhost:3000/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

const { user } = await response.json();
console.log('Utilisateur connecté:', user);
```

**Réponse attendue (200):**
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

## 👥 Routes utilisateur (protégées)

⚠️ **Toutes ces routes nécessitent un token d'authentification dans le header `Authorization: Bearer <token>`**

### 1. Test de l'API User

**GET** `/user/test`

```bash
curl http://localhost:3000/user/test
```

**Réponse attendue:**
```json
{
  "message": "Spotify - Gestion des utilisateurs fonctionne"
}
```

---

### 2. Ajouter un utilisateur (Admin uniquement)

**POST** `/user/add` 🔒 *Admin*

#### Exemple avec cURL

```bash
curl -X POST http://localhost:3000/user/add \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "NewPass123!",
    "cin": "99999999",
    "role": "user"
  }'
```

**Réponse attendue (201):**
```json
{
  "message": "Utilisateur ajouté avec succès",
  "user": { ... }
}
```

**Erreur (403) - Si pas admin:**
```json
{
  "success": false,
  "message": "Accès refusé. Rôle requis: admin"
}
```

---

### 3. Afficher tous les utilisateurs

**GET** `/user/showall` 🔒 *Authentifié*

#### Exemple basique

```bash
curl -X GET "http://localhost:3000/user/showall" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

#### Exemple avec pagination

```bash
curl -X GET "http://localhost:3000/user/showall?page=1&limit=10" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

#### Exemple avec filtres

```bash
# Filtrer par rôle
curl -X GET "http://localhost:3000/user/showall?role=coach" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# Recherche par texte
curl -X GET "http://localhost:3000/user/showall?q=fitness" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# Filtrer par date
curl -X GET "http://localhost:3000/user/showall?from=2024-01-01&to=2024-01-31" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# Filtrer par spécialité (coach)
curl -X GET "http://localhost:3000/user/showall?specialite=Fitness" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# Trier
curl -X GET "http://localhost:3000/user/showall?sortBy=date_creation&sortDir=desc" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# Combinaison de filtres
curl -X GET "http://localhost:3000/user/showall?role=coach&specialite=Fitness&page=1&limit=5" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

#### Exemple avec JavaScript (Fetch)

```javascript
const accessToken = localStorage.getItem('accessToken');

const response = await fetch('http://localhost:3000/user/showall?page=1&limit=10', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log('Utilisateurs:', data.users);
console.log('Pagination:', data.pagination);
```

**Réponse attendue (200):**
```json
{
  "success": true,
  "users": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

### 4. Afficher un utilisateur par ID

**GET** `/user/showbyid/:id` 🔒 *Authentifié*

#### Exemple avec cURL

```bash
curl -X GET "http://localhost:3000/user/showbyid/691656b34b84186eff60eedc" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

#### Exemple avec JavaScript (Fetch)

```javascript
const userId = '691656b34b84186eff60eedc';
const accessToken = localStorage.getItem('accessToken');

const response = await fetch(`http://localhost:3000/user/showbyid/${userId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});

const user = await response.json();
console.log('Utilisateur:', user);
```

**Réponse attendue (200):**
```json
{
  "_id": "691656b34b84186eff60eedc",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "user",
  "cin": "12345678",
  "date_creation": "2024-01-15T10:00:00.000Z"
}
```

**Erreur (404):**
```json
{
  "error": "Utilisateur non trouvé"
}
```

---

### 5. Afficher un utilisateur par username

**GET** `/user/showbyusername/:username` 🔒 *Authentifié*

#### Exemple avec cURL

```bash
curl -X GET "http://localhost:3000/user/showbyusername/john_doe" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Réponse attendue (200):**
```json
{
  "_id": "...",
  "username": "john_doe",
  "email": "john@example.com",
  ...
}
```

---

### 6. Afficher les utilisateurs par rôle

**GET** `/user/showbyrole/:role` 🔒 *Authentifié*

#### Exemples

```bash
# Tous les admins
curl -X GET "http://localhost:3000/user/showbyrole/admin" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# Tous les coachs
curl -X GET "http://localhost:3000/user/showbyrole/coach" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# Tous les utilisateurs
curl -X GET "http://localhost:3000/user/showbyrole/user" \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

**Réponse attendue (200):**
```json
[
  {
    "_id": "...",
    "username": "...",
    "role": "admin",
    ...
  },
  ...
]
```

---

### 7. Mettre à jour un utilisateur

**PUT** `/user/update/:id` 🔒 *Propriétaire ou Admin*

#### Exemple avec cURL

```bash
curl -X PUT "http://localhost:3000/user/update/691656b34b84186eff60eedc" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_updated",
    "email": "john.updated@example.com"
  }'
```

#### Exemple avec JavaScript (Fetch)

```javascript
const userId = '691656b34b84186eff60eedc';
const accessToken = localStorage.getItem('accessToken');

const response = await fetch(`http://localhost:3000/user/update/${userId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'john_updated',
    email: 'john.updated@example.com'
  })
});

const data = await response.json();
console.log('Utilisateur mis à jour:', data);
```

**Réponse attendue (200):**
```json
{
  "message": "Utilisateur modifié avec succès",
  "user": { ... }
}
```

**Erreur (403) - Si pas propriétaire ni admin:**
```json
{
  "success": false,
  "message": "Accès refusé. Vous devez être propriétaire de cette ressource ou administrateur."
}
```

---

### 8. Supprimer un utilisateur (Admin uniquement)

**DELETE** `/user/delete/:id` 🔒 *Admin*

#### Exemple avec cURL

```bash
curl -X DELETE "http://localhost:3000/user/delete/691656b34b84186eff60eedc" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

**Réponse attendue (200):**
```json
{
  "message": "Utilisateur supprimé avec succès"
}
```

---

### 9. Obtenir les statistiques (Admin uniquement)

**GET** `/user/stats` 🔒 *Admin*

#### Exemple avec cURL

```bash
# Statistiques générales
curl -X GET "http://localhost:3000/user/stats" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"

# Statistiques avec filtres
curl -X GET "http://localhost:3000/user/stats?role=coach&from=2024-01-01&to=2024-01-31" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>"
```

**Réponse attendue (200):**
```json
{
  "success": true,
  "total": 100,
  "byRole": {
    "user": 80,
    "coach": 15,
    "admin": 5
  },
  "bySpecialite": { ... },
  ...
}
```

---

### 10. Exporter les utilisateurs (Admin uniquement)

**GET** `/user/export` 🔒 *Admin*

#### Exemple CSV

```bash
curl -X GET "http://localhost:3000/user/export?format=csv" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  --output users.csv
```

#### Exemple PDF

```bash
curl -X GET "http://localhost:3000/user/export?format=pdf" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  --output users.pdf
```

#### Exemple avec filtres

```bash
curl -X GET "http://localhost:3000/user/export?role=coach&format=csv" \
  -H "Authorization: Bearer <ADMIN_ACCESS_TOKEN>" \
  --output coaches.csv
```

---

## 🔄 Scénarios de test complets

### Scénario 1: Inscription → Connexion → Accès protégé

```bash
# 1. Inscription
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test1234!",
    "cin": "12345678",
    "role": "user"
  }')

# Extraire le token
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 2. Utiliser le token pour accéder à une route protégée
curl -X GET "http://localhost:3000/user/showall" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Scénario 2: Connexion → Refresh token → Déconnexion

```bash
# 1. Connexion
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }')

# Extraire les tokens
ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

# 2. Rafraîchir le token
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"

# 3. Déconnexion
curl -X POST http://localhost:3000/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}"
```

---

## 📝 Notes importantes

1. **Remplacez `<ACCESS_TOKEN>`** par un vrai token obtenu via `/auth/login` ou `/auth/register`
2. **Remplacez `<ADMIN_ACCESS_TOKEN>`** par un token d'un utilisateur avec le rôle `admin`
3. **Les tokens expirent après 15 minutes** - utilisez `/auth/refresh` pour obtenir un nouveau token
4. **Toutes les routes `/user/*` nécessitent une authentification** sauf `/user/test`
5. **Certaines routes nécessitent des permissions spécifiques** (admin, propriétaire)

---

## 🧪 Tester avec Postman

### Collection Postman

1. Créez une nouvelle collection "Sportify API"
2. Ajoutez une variable d'environnement `baseUrl` = `http://localhost:3000`
3. Ajoutez une variable `accessToken` (vide au début)
4. Pour chaque requête :
   - Utilisez `{{baseUrl}}/auth/login` comme URL
   - Dans les tests, sauvegardez le token : `pm.environment.set("accessToken", pm.response.json().accessToken)`
   - Pour les routes protégées, utilisez `Authorization: Bearer {{accessToken}}`

---

## ✅ Checklist de test

- [ ] Test de l'API auth (`/auth/test`)
- [ ] Inscription (`/auth/register`)
- [ ] Connexion (`/auth/login`)
- [ ] Rafraîchir token (`/auth/refresh`)
- [ ] Obtenir infos utilisateur (`/auth/me`)
- [ ] Déconnexion (`/auth/logout`)
- [ ] Test de l'API user (`/user/test`)
- [ ] Lister les utilisateurs (`/user/showall`)
- [ ] Obtenir un utilisateur par ID (`/user/showbyid/:id`)
- [ ] Mettre à jour un utilisateur (`/user/update/:id`)
- [ ] Supprimer un utilisateur (`/user/delete/:id`) - Admin
- [ ] Statistiques (`/user/stats`) - Admin
- [ ] Export (`/user/export`) - Admin

---

Bon test! 🚀

