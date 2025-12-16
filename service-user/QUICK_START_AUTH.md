# 🚀 Guide de démarrage rapide - Authentification

## ✅ Votre système d'authentification fonctionne!

D'après le test, tout est configuré correctement. Voici un résumé et les prochaines étapes.

## 📊 Résultat du test

✅ **Tout fonctionne correctement:**
- Connexion MongoDB: ✅
- Utilisateur de test: ✅ (test@example.com)
- Génération de tokens: ✅
- Vérification de tokens: ✅
- Tests d'erreur: ✅

⚠️ **Avertissement:** Vous utilisez les secrets par défaut (normal pour le développement)

## 🔐 Configuration des secrets (Recommandé)

### Option 1: Générer des secrets automatiquement

```bash
npm run generate-secrets
```

Cela générera des secrets sécurisés que vous pourrez copier dans votre fichier `.env`.

### Option 2: Créer manuellement le fichier .env

Créez un fichier `.env` à la racine du projet:

```env
# JWT Configuration
JWT_SECRET=votre-secret-super-securise-min-32-caracteres-aleatoires
JWT_REFRESH_SECRET=votre-refresh-secret-super-securise-min-32-caracteres-aleatoires

# Token Expiry (optionnel)
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Environment
NODE_ENV=development
PORT=3000
```

⚠️ **Important:** 
- Ne commitez JAMAIS le fichier `.env` dans Git
- Utilisez des secrets différents pour chaque environnement
- En production, utilisez des secrets d'au moins 32 caractères

## 🧪 Tester l'authentification

### 1. Tester la génération de tokens

```bash
npm run test-auth
```

### 2. Tester l'inscription

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "nouveauuser",
    "email": "nouveau@example.com",
    "password": "SecurePass123!",
    "cin": "87654321",
    "role": "user"
  }'
```

### 3. Tester la connexion

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "votre-mot-de-passe"
  }'
```

### 4. Utiliser le token pour accéder à une route protégée

```bash
# Remplacez <ACCESS_TOKEN> par le token reçu lors du login
curl -H "Authorization: Bearer <ACCESS_TOKEN>" \
  http://localhost:3000/user/showall
```

## 📝 Exemple complet

### Étape 1: Inscription
```bash
POST /auth/register
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "cin": "12345678",
  "role": "user"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Inscription réussie",
  "user": { ... },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Étape 2: Utiliser le token
```bash
GET /user/showall
Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Étape 3: Rafraîchir le token (si expiré)
```bash
POST /auth/refresh
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## 🔍 Vérifier que tout fonctionne

1. **Testez le script:**
   ```bash
   npm run test-auth
   ```

2. **Vérifiez les routes:**
   ```bash
   # Route de test
   curl http://localhost:3000/auth/test
   
   # Route protégée (devrait retourner 401 sans token)
   curl http://localhost:3000/user/showall
   ```

3. **Testez avec un token:**
   - Connectez-vous via `/auth/login`
   - Utilisez le token reçu dans le header `Authorization: Bearer <token>`

## 🛠️ Dépannage

Si vous rencontrez l'erreur "Token invalide ou expiré":

1. **Vérifiez que le token n'est pas expiré** (15 minutes par défaut)
   - Solution: Utilisez `/auth/refresh` avec le refresh token

2. **Vérifiez le format du header:**
   ```
   Authorization: Bearer <token>
   ```
   ⚠️ N'oubliez pas l'espace après "Bearer"!

3. **Vérifiez les secrets JWT:**
   - Si vous changez les secrets, tous les tokens existants deviendront invalides
   - Les utilisateurs devront se reconnecter

4. **Consultez les logs du serveur** pour plus de détails

## 📚 Documentation complète

- [Documentation d'authentification](./AUTH_DOCUMENTATION.md) - Guide complet
- [Guide de dépannage](./TROUBLESHOOTING_AUTH.md) - Solutions aux problèmes courants

## ✅ Checklist

- [x] Système d'authentification installé
- [x] Script de test fonctionnel
- [ ] Fichier `.env` créé avec des secrets sécurisés (optionnel pour dev)
- [ ] Test d'inscription réussi
- [ ] Test de connexion réussi
- [ ] Test d'accès à une route protégée réussi

## 🎉 Prêt à utiliser!

Votre système d'authentification est opérationnel. Vous pouvez maintenant:
- Protéger vos routes avec `authenticate`
- Vérifier les rôles avec `requireAdmin`, `requireCoachOrAdmin`, etc.
- Gérer les tokens avec les endpoints `/auth/*`

Bon développement! 🚀

