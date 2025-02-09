const express = require('express')
const app = express()
const dotenv = require("dotenv").config()
const userRoutes = require('./routes/userRoute')
const productRoutes = require('./routes/productRoute')
app.use(express.json());

const port = process.env.PORT || 3000;

app.use ("/user", userRoutes);
app.use ("/product", productRoutes);
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Ecommerce app listening on port ${port}`)
})