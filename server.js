const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const colors = require("colors");
const morgan = require("morgan");
const connectDB = require("./config/db");

//dotenv
dotenv.config();

//connect to db
connectDB();

//rest object
const app = express();

//middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(morgan("dev"));

//router
// app.get("/", (rep, res) => {
//     res.status(200).json({
//         success: true,
//         message: "welcome to full stack",
//     });
// });
app.use("/api/auth", require("./routes/userRourtes"));
app.use("/api/post", require('./routes/postRourtes'));
//port
const PORT = process.env.PORT || 3001;

//listen
app.listen(PORT, () => {
    console.log(`Server Running ${PORT}`.bgGreen.white);
});
