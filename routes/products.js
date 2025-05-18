const express = require('express');
const axios = require('axios');
const Product = require('../models/Product');
const router = express.Router();

// List products
router.get('/', async (req, res) => {
  const products = await Product.find();
  res.render('index', { products });
});

// Product details
router.get('/product/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render('product', { product });
});

// Vulnerable SSRF endpoint (FOR EDUCATIONAL PURPOSES ONLY)
router.post('/fetch-image', async (req, res) => {
  const { url } = req.body;
  try {
    // Intentionally vulnerable: No validation on the URL
    const response = await axios.get(url, { responseType: 'stream' });
    res.set('Content-Type', response.headers['content-type']);
    response.data.pipe(res);
  } catch (err) {
    res.status(500).send('Error fetching URL');
  }
});

module.exports = router;