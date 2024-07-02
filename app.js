require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const path = require("path");

const connectDB = require("./config/db");

// routes imported
const authRouter = require("./routes/auth");
const contactRouter = require("./routes/contact");

const app = express();

// middlewares
app.use(express.json());
app.use(morgan("tiny"));
app.use(require("cors")());

// routes
app.use("/api", authRouter);
app.use("/api", contactRouter);

// server configurations
const PORT = process.env.PORT || 8000;
app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Server listening on port: ${PORT}`);
  } catch (error) {
    console.log(error);
  }
});
