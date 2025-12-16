# 🔧 Guide de dépannage - Authentification

Ce guide vous aide à résoudre les problèmes courants liés à l'authentification JWT.

## ❌ Erreur: "Token invalide ou expiré"

### Causes possibles

1. **Token expiré** (le plus courant)
   - Les access tokens expirent après 15 minutes par défaut
   - **Solution**: Utilisez le refresh token pour obtenir un nouveau access token

2. **Token mal formé**
   - Le token n'est pas au bon format JWT
   - **Solution**: Vérifiez que le token est bien envoyé dans le header `Authorization: Bearer <token>`

3. **Secret JWT incorrect**
   - Le secret utilisé pour vérifier le token ne correspond pas à celui utilisé pour le générer
   - **Solution**: Vérifiez que les variables d'environnement `JWT_SECRET` et `JWT_REFRESH_SECRET` sont correctement configurées

4. **Token invalide (signature incorrecte)**
   - Le token a été modifié ou créé avec un autre secret
   - **Solution**: Reconnectez-vous pour obtenir un nouveau token

5. **Issuer ou Audience incorrects**
   - Le token n'a pas les bons paramètres `iss` ou `aud`
   - **Solution**: Vérifiez que le token a été généré avec les mêmes paramètres

### Solutions détaillées

#### 1. Vérifier si le token est expiré

```bash
# Décoder le token (sans vérification) pour voir la date d'expiration
node -e "const jwt = require('jsonwebtoken'); const token = 'VOTRE_TOKEN_ICI'; const decoded = jwt.decode(token); console.log('Expire à:', new Date(decoded.exp * 1000)); console.log('Maintenant:', new Date());"
```

Si le token est expiré, utilisez le refresh token:

```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "VOTRE_REFRESH_TOKEN"
  }'
```

#### 2. Vérifier la configuration des secrets

Vérifiez que votre fichier `.env` contient:

```env
JWT_SECRET=your-super-secret-key-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production-min-32-chars
```

⚠️ **IMPORTANT**: Si vous changez les secrets, tous les tokens existants deviendront invalides. Les utilisateurs devront se reconnecter.

#### 3. Tester l'authentification

Utilisez le script de test:

```bash
npm run test-auth
```

Ce script va:
- Vérifier la configuration des secrets
- Générer un token de test
- Vérifier que le token fonctionne
- Tester différents scénarios d'erreur

#### 4. Vérifier le format du token dans la requête

Le token doit être envoyé dans le header `Authorization` avec le préfixe `Bearer `:

```bash
# ✅ Correct
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." http://localhost:3000/user/showall

# ❌ Incorrect (sans "Bearer ")
curl -H "Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." http://localhost:3000/user/showall
```

#### 5. Vérifier les logs du serveur

Les erreurs détaillées sont maintenant loggées dans la console. Vérifiez:
- Les messages d'erreur spécifiques
- Les codes d'erreur (`TOKEN_EXPIRED`, `INVALID_TOKEN`, etc.)
- Les suggestions dans la réponse (`hint`)

---

## ❌ Erreur: "Token manquant"

### Cause
Le token n'est pas envoyé dans la requête.

### Solution
Assurez-vous d'envoyer le token dans:
1. Le header `Authorization: Bearer <token>`, ou
2. Les cookies (`accessToken`)

---

## ❌ Erreur: "Utilisateur non trouvé"

### Causes possibles

1. **L'utilisateur a été supprimé**
   - Le token fait référence à un utilisateur qui n'existe plus
   - **Solution**: L'utilisateur doit se reconnecter

2. **L'ID utilisateur dans le token est incorrect**
   - Le token contient un ID invalide
   - **Solution**: Reconnectez-vous pour obtenir un nouveau token

---

## ❌ Erreur: "Refresh token invalide ou expiré"

### Causes possibles

1. **Refresh token expiré** (7 jours par défaut)
   - **Solution**: L'utilisateur doit se reconnecter

2. **Refresh token révoqué**
   - Le token a été supprimé lors d'une déconnexion
   - **Solution**: L'utilisateur doit se reconnecter

3. **Refresh token invalide**
   - Le token n'est pas dans la liste des tokens valides de l'utilisateur
   - **Solution**: L'utilisateur doit se reconnecter

---

## 🔍 Débogage étape par étape

### 1. Vérifier la connexion

```bash
# Tester la route de test
curl http://localhost:3000/auth/test
```

### 2. Tester l'inscription

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

### 3. Tester la connexion

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

### 4. Tester une route protégée

```bash
# Remplacez <ACCESS_TOKEN> par le token reçu lors du login
curl -H "Authorization: Bearer <ACCESS_TOKEN>" http://localhost:3000/user/showall
```

### 5. Tester le refresh token

```bash
# Remplacez <REFRESH_TOKEN> par le refresh token reçu lors du login
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<REFRESH_TOKEN>"
  }'
```

---

## 🛠️ Codes d'erreur

| Code d'erreur | Description | Solution |
|---------------|-------------|----------|
| `TOKEN_EXPIRED` | Le token a expiré | Utilisez `/auth/refresh` pour obtenir un nouveau token |
| `INVALID_TOKEN` | Le token est invalide | Reconnectez-vous pour obtenir un nouveau token |
| `INVALID_TOKEN_PAYLOAD` | Le token ne contient pas les bonnes informations | Reconnectez-vous |
| `USER_NOT_FOUND` | L'utilisateur associé au token n'existe plus | Reconnectez-vous |
| `DATABASE_ERROR` | Erreur lors de la récupération de l'utilisateur | Vérifiez la connexion à la base de données |
| `AUTHENTICATION_ERROR` | Erreur générale d'authentification | Vérifiez les logs du serveur |

---

## 📝 Exemple de réponse d'erreur améliorée

```json
{
  "success": false,
  "message": "Token expiré. Veuillez vous reconnecter ou utiliser le refresh token.",
  "error": "TOKEN_EXPIRED",
  "hint": "Utilisez /auth/refresh pour obtenir un nouveau token"
}
```

---

## ✅ Checklist de dépannage

- [ ] Vérifier que le serveur est démarré
- [ ] Vérifier que MongoDB est connecté
- [ ] Vérifier que les variables d'environnement sont configurées
- [ ] Vérifier que le token est bien envoyé dans le header `Authorization: Bearer <token>`
- [ ] Vérifier que le token n'est pas expiré
- [ ] Vérifier que les secrets JWT sont corrects
- [ ] Vérifier que l'utilisateur existe dans la base de données
- [ ] Consulter les logs du serveur pour plus de détails
- [ ] Utiliser le script `npm run test-auth` pour tester

---

## 🔗 Ressources

- [Documentation d'authentification](./AUTH_DOCUMENTATION.md)
- [Script de test](./scripts/testAuth.js)
- [Service d'authentification](./services/authService.js)

---

## 💡 Conseils

1. **Toujours utiliser HTTPS en production** pour protéger les tokens
2. **Stockez les secrets de manière sécurisée** (variables d'environnement, gestionnaire de secrets)
3. **Implémentez une rotation des tokens** pour une sécurité accrue
4. **Loggez les erreurs** pour faciliter le débogage
5. **Testez régulièrement** l'authentification avec le script de test

---

## 📞 Support

Si le problème persiste:
1. Vérifiez les logs du serveur
2. Utilisez le script `npm run test-auth`
3. Vérifiez la configuration des variables d'environnement
4. Consultez la documentation complète dans `AUTH_DOCUMENTATION.md`

