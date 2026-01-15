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

//create a new order
router.post('/', async (req, res) => {
  try {
    const { username, items } = req.body;

    //make sure we have a username and at least one item
    if (!username || !items || items.length < 1) {
      return res.status(400).json({ error: 'username and items are required' });
    };

    const purchase = await Purchase.create({ username, items });
    res.status(201).json(purchase);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//get all orders
router.get('/getOrders', async (req, res) => {
  try {
    const orders = await Purchase.findAll();
    res.json(orders);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//get a specific order based on username
router.get('/getOrder/:username', async (req, res) => {
  try {
    const order = await Purchase.findByPk(req.params.username);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  }
  catch(err) {
    res.status(500).json({error: err.message});
  }
});

module.exports = router;
