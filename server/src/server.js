import express from "express";
import cors from "cors";

import { router } from "./api.js";
import { newStore } from "./store.js";

const app = express();
newStore("./db.json")

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

app.use(express.static('dist'));

app.use("/api/tasks", router);

app.get("/api/ping", (req, res) => {
  res.send("Server is running!");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
