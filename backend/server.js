const express = require("express");
const cors = require("cors");
require('dotenv').config();
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());



app.use(express.json());


app.post("/api/auth/register", (req, res) => {
  
  res.send({ message: "User registered successfully" });
});

app.post("/api/auth/login", (req, res) => {

  res.send({ token: "dummy-jwt-token" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});