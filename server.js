import express from "express";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";

const app = express();
const PORT = process.env.PORT || 8000;
dotenv.config();

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(express.static("public"))
app.use(fileUpload())

app.get('/', (req, res) => {
    res.send("Server started here");
})

//import routes
import ApiRoutes from "./routes/api.js";
app.use('/api', ApiRoutes);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})

