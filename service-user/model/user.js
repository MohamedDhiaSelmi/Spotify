const mongo = require('mongoose')
const bcrypt = require('bcryptjs')
const schema = mongo.Schema

const User = new schema({
    username: {
        type: String,
        required: true,
        match: [/^[a-zA-Z0-9_]{3,30}$/, 'Username invalide']
    },
    email: {
        type: String,
        required: true,
        // email should be unique for account recovery and login by email
        unique: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide']
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'coach'],
        default: 'user'
    },
    cin: {
        type: String,
        required: true,
        unique: true, // ← CIN reste unique
        match: [/^\d{8}$/, 'CIN doit avoir 8 chiffres']
    },
    specialite: {
        type: String,
        required: function() {
            return this.role === 'coach';
        }
    },
    // store refresh tokens for user (one-to-many for multi-device)
    refreshTokens: {
        type: [String],
        default: []
    },
    // Token pour la réinitialisation du mot de passe
    resetPasswordToken: {
        type: String,
        default: null
    },
    // Date d'expiration du token de réinitialisation
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    date_creation: {
        type: Date,
        default: Date.now
    }
})

// Text index to support search on username, email and specialite
User.index({ username: 'text', email: 'text', specialite: 'text' })

// Hash password before saving if modified
User.pre('save', async function(next) {
    try {
        if (!this.isModified('password')) return next()
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(this.password, salt)
        this.password = hash
        next()
    } catch (err) {
        next(err)
    }
})

module.exports = mongo.model('User', User)