// src/routes/auth.routes.js
const express = require('express');
const { register, login } = require('../controllers/auth.controller');
const { validateRegister } = require('../middleware/validation.middleware');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', login);

module.exports = router;
