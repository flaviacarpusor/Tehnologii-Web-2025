const Interaction = require('../../models/Interaction');

async function updateInteraction(req, res) {
  try {
    const interactionId = req.body.interactionId;
    const newType = req.body.newType;

    if (!interactionId || !newType) {
      return res.status(400).json({ error: 'Câmpuri lipsă' });
    }

    const updatedInteraction = await Interaction.updateInteraction(interactionId, newType);
    res.status(200).json(updatedInteraction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Eroare server' });
  }
}

module.exports = { updateInteraction };