const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');
const express = require('express');
const router = express.Router();

class Purchase extends Model {}
Purchase.init(
  {
    username: { type: DataTypes.STRING, primaryKey: true },
    cost: DataTypes.DECIMAL(10,2),
  },
  {
    sequelize,
    modelName: 'purchase',
  }
);


//get all orders
router.get('/getOrders', async (req, res) => {
  try {
    const orders = await Purchase.findAll();

    //return only username and parsed items
    const formatted = orders.map(order => ({
      username: order.username,
      items: order.items
    }));

    res.json(formatted);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  };
});


//get a specific order based on username
router.get('/getOrder/:username', async (req, res) => {
  try {
    const order = await Purchase.findByPk(req.params.username);

    //if we don't have an order then throw
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    };

    //return only username and parsed items
    res.json({
      username: order.username,
      cost: order.cost,
    });
  }
  catch(err) {
    res.status(500).json({error: err.message});
  };
});


//create a new order
router.post('/createNewOrder/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const cost = req.body.cost;

    //if the cost is 0, terminate
    if (cost <= 0) {
      return res.status(400).json({error: "A cost cannot be 0 or less"});
    };

    const newOrder = await Purchase.create({
      username: username,
      cost: cost,
    });

    return res.status(201).json(newOrder);
  }
  catch (err) {
    return res.status(500).json({error: err.message});
  };
})


//delete an order based on username
router.delete('/deleteOrder/:username', async (req, res) => {
  try {
    const username = req.params.username;

    //make sure we got a username
    if (!username) {
      return res.status(400).json({error: "Did not receive a username"});
    };

    //delete the order
    const deleted = await Purchase.destroy({ where: { username } });
    if (deleted) {
      return res.status(200).json({});
    }

    else {
      return res.status(404).json({error: "Failed to delete order"});
    };
  }

  catch (err) {
    return res.status(500).json({error: err.message});
  }
});

module.exports = router;
