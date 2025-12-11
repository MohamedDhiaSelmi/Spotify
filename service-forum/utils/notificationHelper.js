const Notification = require('../model/Notification');

async function createNotification(blog, type, sourceId, message) {
  try {
    const notification = new Notification({
      blogId: blog._id,
      auteurBlog: blog.auteur,
      type,
      sourceId,
      message
    });
    await notification.save();
    console.log(`Notification envoyée à ${blog.auteur}`);
  } catch (err) {
    console.error("Erreur création notification :", err);
  }
}

module.exports = { createNotification };
