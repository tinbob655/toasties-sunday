const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../sequelize');
const express = require('express');
const router = express.Router();
const { requireAuth, requireOwnerOrAdmin, requireAdmin } = require('../middleware/auth');

class Purchase extends Model {}
Purchase.init(
  {
    username: {
      type: DataTypes.STRING, primaryKey: true
    },

    cost: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
    },

    paid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    toasties: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const val = this.getDataValue('toasties');
        return val ? JSON.parse(val) : [];
      },
      set(val) {
        this.setDataValue('toasties', JSON.stringify(val ?? []));
      }
    },

    drinks: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const val = this.getDataValue('drinks');
        return val ? JSON.parse(val) : [];
      },
      set(val) {
        this.setDataValue('drinks', JSON.stringify(val ?? []));
      }
    },

    deserts: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        const val = this.getDataValue('deserts');
        return val ? JSON.parse(val): [];
      },
      set(val) {
        this.setDataValue('deserts', JSON.stringify(val ?? []));
      }
    }
  },
  {
    sequelize,
    modelName: 'purchase',
  }
);


//helper: block order modifications between 2pm and 11pm on Sundays
function isOrderBlocked() {
  const now = new Date();
  return now.getDay() === 0 && now.getHours() >= 14 && now.getHours() < 23;
}

//get all orders (with optional pagination) - ADMIN ONLY
router.get('/getOrders', requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    //if no pagination params provided, return all (backwards compatible)
    if (!req.query.page && !req.query.limit) {
      const orders = await Purchase.findAll();
      return res.status(200).json(orders);
    }

    const { count, rows: orders } = await Purchase.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      orders,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  };
});


//get a specific order based on username - owner or admin only
router.get('/getOrder/:username', requireOwnerOrAdmin('username'), async (req, res) => {
  try {
    const order = await Purchase.findByPk(req.params.username);

    //if we don't have an order then throw
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    };

    return res.status(200).json(order);
  }
  catch(err) {
    res.status(500).json({error: err.message});
  };
});


//create a new order - owner or admin only
router.post('/createNewOrder/:username', requireOwnerOrAdmin('username'), async (req, res) => {
  try {

    //check if orders are blocked (2pm-11pm on Sundays)
    if (isOrderBlocked()) {
      return res.status(403).json({ error: 'Orders cannot be created between 2:00 PM and 11:00 PM on Sundays.' });
    }

    //make sure we have a username
    const username = req.params.username;
    if (!username) {
      return res.status(400).json({error: "Did not receive a username to place the order with"});
    };

    //if the cost is 0 or too large, terminate
    const cost = req.body.cost;
    if (cost <= 0 || cost > 100) {
      return res.status(400).json({error: "A cost cannot be 0 or less"});
    };

    //create the order
    const { toasties, drinks, deserts } = req.body;
    console.log(toasties, drinks, deserts);
    const newOrder = await Purchase.create({
      username,
      cost,
      toasties,
      drinks,
      deserts
    });
    return res.status(201).json(newOrder);
  }
  catch (err) {
    console.error('Error creating order:', err);
    return res.status(500).json({error: err.message});
  };
})


//delete an order based on username - owner or admin only
router.delete('/deleteOrder/:username', requireOwnerOrAdmin('username'), async (req, res) => {
  try {

    //check if orders are blocked (2pm-11pm on Sundays)
    if (isOrderBlocked()) {
      return res.status(403).json({ error: 'Orders cannot be deleted between 2:00 PM and 11:00 PM on Sundays.' });
    }

    const username = req.params.username;

    //make sure we got a username
    if (!username) {
      return res.status(400).json({error: "Did not receive a username"});
    };

    //attempt to delete the order
    const deleted = await Purchase.destroy({ where: { username, paid: false } });
    if (deleted) {
      return res.status(200).json({});
    } 

    else {
      
      //if we failed to delete the order, then either we can't find it or it was already paid for
      const order = await Purchase.findByPk(username);
      if (!order) {

        //if we can't find the order
        return res.status(404).json({error: "Order not found"});
      };

      if (order.paid) {

        //if the order has been paid for
        return res.status(403).json({error: "Cannot delete a paid order"});
      };

      //other errors
      return res.status(404).json({error: "Failed to delete order"});
    };
  }

  catch (err) {
    return res.status(500).json({error: err.message});
  }
});


//edit an order based on username - owner or admin only
router.put('/editOrder/:username', requireOwnerOrAdmin('username'), async (req, res) => {
  try {

    //check if orders are blocked (2pm-11pm on Sundays)
    if (isOrderBlocked()) {
      return res.status(403).json({ error: 'Orders cannot be edited between 2:00 PM and 11:00 PM on Sundays.' });
    }

    //make sure we have a username
    const username = req.params.username;
    if (!username) {
      return res.status(400).json({error: "Did not receive a username"});
    };
  
    //make sure we got given a new cost
    const newCost = req.body.cost;
    if (!newCost) {
      return res.status(400).json({error: "Did not receive a cost"});
    }
    else if (newCost <= 0 || newCost > 100) {
      return res.status(400).json({error: `Invalid cost: ${newCost}`});
    };
  
    //get the old order
    const oldOrder = await Purchase.findByPk(username);
    if (!oldOrder) {
      return res.status(400).json({error: `Could not find an order associated with username: ${username}`});
    };

    //if the old order was paid for we cannot edit it
    if (oldOrder.paid) {
      return res.status(403).json({error: "Cannot edit an order which has already been paid for"});
    };
  
    //otherwise, update the order
    ['toasties', 'drinks', 'deserts'].forEach(key => {
      if (oldOrder[key] != req.body[key]) {
        oldOrder[key] = req.body[key];
      };
    });
    oldOrder.cost = newCost;

    //save the order
    await oldOrder.save();
    return res.status(200).json(oldOrder);
  }

  catch (err) {
    return res.status(500).json({error: err.message});
  };
});


//mark an order as paid - requires verified payment intent
router.put('/payOrder/:username', requireOwnerOrAdmin('username'), async (req, res) => {

  try {
    const { paymentIntentId } = req.body;
    const username = req.params.username;
    const sessionUsername = req.session.user.username;
    
    //make sure we have a username
    if (!username) {
      return res.status(400).json({error: "Did not receive a username"});
    };

    //make sure we have a payment intent ID to verify
    if (!paymentIntentId) {
      return res.status(400).json({error: "Payment intent ID is required to mark order as paid"});
    };

    //verify the payment with Stripe
    const stripe = require('stripe')(process.env.STRIPE_SK);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    //check payment status
    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({error: `Payment not completed. Status: ${paymentIntent.status}`});
    };
    
    //verify the payment belongs to the order's user (from metadata)
    if (paymentIntent.metadata.username !== username) {
      return res.status(403).json({error: "Payment does not match this order"});
    };
    
    //check if user is allowed (either admin, or the owner making their own payment)
    const adminUsers = (process.env.SUDO_USERS || '').split(',').map(u => u.trim());
    const isAdmin = adminUsers.includes(sessionUsername);
    const isOwner = sessionUsername === username;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({error: "You cannot mark someone else's order as paid"});
    };
  
    //get the order
    const oldOrder = await Purchase.findByPk(username);
    if (!oldOrder) {
      return res.status(400).json({error: `Could not find an order associated with username: ${username}`});
    };

    //verify the payment amount matches the order cost (within rounding tolerance)
    const paidAmount = paymentIntent.amount / 100; // Convert from pence
    if (Math.abs(paidAmount - parseFloat(oldOrder.cost)) > 0.01) {
      return res.status(400).json({error: `Payment amount (£${paidAmount}) does not match order cost (£${oldOrder.cost})`});
    };
  
    //payment verified - mark order as paid
    oldOrder.paid = true;
    await oldOrder.save();
    return res.status(200).json(oldOrder);
  }
  catch (err) {
    return res.status(500).json({error: err.message});
  };
});

module.exports = router;