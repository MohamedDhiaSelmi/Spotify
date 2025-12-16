const User = require("../model/user");

const validate = async (req, res, next) => {
  const { username, email, password, role, cin, specialite } = req.body;
  
  const errors = [];

  // 1️⃣ Validation du USERNAME 
  if (!username || username.trim() === '') {
    errors.push("Le username est obligatoire");
  } else {
    const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    if (!usernameRegex.test(username)) {
      errors.push("Le username doit contenir 3-30 caractères (lettres, chiffres, underscores)");
    }
  }

  // 2️⃣ Validation de l'EMAIL 
  if (!email || email.trim() === '') {
    errors.push("L'email est obligatoire");
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push("Format d'email invalide");
    } else {
      // Vérifier unicité de l'email
      try {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
          errors.push("Cet email est déjà utilisé");
        }
      } catch (error) {
        errors.push("Erreur lors de la vérification de l'email");
      }
    }
  }

  // 3️⃣ Validation du MOT DE PASSE
  if (!password || password.trim() === '') {
    errors.push("Le mot de passe est obligatoire");
  } else {
    // Vérifier longueur minimale
    if (password.length < 8) {
      errors.push("Le mot de passe doit avoir au moins 8 caractères");
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      errors.push("Le mot de passe doit contenir : majuscule, minuscule, chiffre et caractère spécial (@$!%*?&)");
    }
    
    // Empêcher mots de passe trop simples
    const weakPasswords = ["12345678", "password", "azertyui", "qwertyui", "00000000"];
    if (weakPasswords.includes(password.toLowerCase())) {
      errors.push("Ce mot de passe est trop simple");
    }
  }

  // 4️⃣ Validation du CIN ( UNIQUE)
  if (!cin || cin.trim() === '') {
    errors.push("Le CIN est obligatoire");
  } else {
    const cinRegex = /^\d{8}$/;
    if (!cinRegex.test(cin)) {
      errors.push("Le CIN doit contenir exactement 8 chiffres");
    } else {
      // Vérifier unicité du CIN 
      try {
        const existingCin = await User.findOne({ cin });
        if (existingCin) {
          errors.push("Ce CIN est déjà utilisé");
        }
      } catch (error) {
        errors.push("Erreur lors de la vérification du CIN");
      }
    }
  }

  // 5️⃣ Validation du ROLE
  const validRoles = ['user', 'admin', 'coach'];
  if (!role || role.trim() === '') {
    errors.push("Le rôle est obligatoire");
  } else if (!validRoles.includes(role)) {
    errors.push(`Le rôle doit être: ${validRoles.join(', ')}`);
  }

  // 6️⃣ Validation de la SPÉCIALITÉ (pour coachs seulement)
  if (role === 'coach') {
    if (!specialite || specialite.trim() === '') {
      errors.push("La spécialité est obligatoire pour les coachs");
    } else if (specialite.length < 2) {
      errors.push("La spécialité doit avoir au moins 2 caractères");
    } else if (specialite.length > 50) {
      errors.push("La spécialité ne peut pas dépasser 50 caractères");
    }
  }

  // Retourner les erreurs ou continuer
  if (errors.length > 0) {
    return res.status(400).json({ 
      success: false,
      message: "Erreurs de validation", 
      errors: errors 
    });
  }

  next();
};

module.exports = validate;