import express from 'express';
import 'dotenv/config'; 
import passwordRoutes from "./routes/password.js";
import usersRoutes from "./routes/users.js"
import connectToMongo from './db.js';

import cors from "cors"

connectToMongo();
const app = express();
app.use(cors());
app.use(express.json());
const port = 3000

app.use("/api/passwords",passwordRoutes);
app.use("/api/users",usersRoutes);


app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});