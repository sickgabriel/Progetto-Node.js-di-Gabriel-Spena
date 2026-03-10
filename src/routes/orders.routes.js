// Definizione rotte REST per ordini
const express = require('express');
const controller = require('../controllers/orders.controller');

const router = express.Router();

router.post('/', controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

module.exports = router;

