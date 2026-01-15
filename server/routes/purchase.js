const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');
const express = require('express');
const router = express.Router();

class Purchase extends Model {}
Purchase.init(
  {
    username: { type: DataTypes.STRING, primaryKey: true },
    items: {
      type: DataTypes.STRING,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue('items');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(val) {
        this.setDataValue('items', JSON.stringify(val));
      },
    },
  },
  {
    sequelize,
    modelName: 'purchase',
  }
);

// POST /api/db/purchase - create a new purchase
router.post('/', async (req, res) => {
  try {
    const { username, items } = req.body;
    if (!username || !items) {
      return res.status(400).json({ error: 'username and items are required' });
    }
    const purchase = await Purchase.create({ username, items });
    res.status(201).json(purchase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
