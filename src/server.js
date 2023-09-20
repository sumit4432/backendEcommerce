const express = require("express");
const bodyParser = require("body-parser");
const register=require("./routes/UserRoutes")
const dotenv = require('dotenv'); 
const ConnectDB = require("./db/connect"); 
const categoryRoutes=require("./routes/category")
const productsRoute=require("./routes/products")

dotenv.config();
ConnectDB()
  .then(() => {
    const app = express();
    const PORT = process.env.PORT || 5000;
    // Middleware
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    // Routes
   app.use("/api", register )
     app.use("/api", categoryRoutes)
       app.use("/api", productsRoute)

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
