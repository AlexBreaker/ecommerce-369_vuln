const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

dotenv.config();
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/', productRoutes);
app.use('/', authRoutes);

// Seed initial products
const Product = require('./models/Product');
app.get('/seed', async (req, res) => {
  await Product.deleteMany({});
  await Product.insertMany([
    { name: 'Laptop', price: 999, description: 'High-performance laptop', imageUrl: 'https://via.placeholder.com/150' },
    { name: 'Phone', price: 499, description: 'Latest smartphone', imageUrl: 'https://via.placeholder.com/150' }
  ]);
  res.send('Database seeded');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));