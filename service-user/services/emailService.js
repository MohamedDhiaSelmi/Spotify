require('dotenv').config()
const https = require('https')
const { URL } = require('url')

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'
const MAIL_FROM = process.env.MAIL_FROM || 'noreply@sportify.com'
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || 'Sportify'

/**
 * Envoie un email via l'API Brevo
 * @param {Object} options - Options de l'email
 * @param {string} options.to - Adresse email du destinataire
 * @param {string} options.subject - Sujet de l'email
 * @param {string} options.html - Contenu HTML de l'email
 * @param {string} [options.text] - Contenu texte de l'email (optionnel)
 * @returns {Promise<Object>} - Résultat de l'envoi avec messageId
 */
async function sendEmail({ to, subject, html, text }) {
  // Vérifier la configuration
  if (!BREVO_API_KEY) {
    throw new Error('Configuration Brevo manquante: BREVO_API_KEY non définie dans .env')
  }

  if (!to || !subject || !html) {
    throw new Error('Paramètres manquants: to, subject et html sont requis')
  }

  // Préparer le contenu de l'email
  const emailData = {
    sender: {
      name: MAIL_FROM_NAME,
      email: MAIL_FROM
    },
    to: [
      {
        email: to
      }
    ],
    subject: subject,
    htmlContent: html
  }

  // Ajouter le contenu texte si fourni
  if (text) {
    emailData.textContent = text
  }

  try {
    const url = new URL(BREVO_API_URL)
    const postData = JSON.stringify(emailData)

    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseData = ''

        res.on('data', (chunk) => {
          responseData += chunk
        })

        res.on('end', () => {
          try {
            const parsedData = responseData ? JSON.parse(responseData) : {}

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({
                messageId: parsedData.messageId || 'Email envoyé avec succès',
                success: true
              })
            } else {
              // Gérer les erreurs de l'API Brevo
              const errorMessage = parsedData.message || `Erreur ${res.statusCode}: ${res.statusMessage}`
              reject(new Error(errorMessage))
            }
          } catch (parseError) {
            reject(new Error(`Erreur lors de la lecture de la réponse: ${parseError.message}`))
          }
        })
      })

      req.on('error', (error) => {
        reject(new Error(`Erreur lors de l'envoi de l'email: ${error.message}`))
      })

      req.write(postData)
      req.end()
    })
  } catch (error) {
    // Si c'est déjà une erreur avec un message, la relancer
    if (error.message && error.message.includes('Erreur')) {
      throw error
    }
    // Sinon, créer une nouvelle erreur
    throw new Error(`Erreur lors de l'envoi de l'email: ${error.message}`)
  }
}

module.exports = {
  sendEmail
}

