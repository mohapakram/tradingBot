import express from "express/index.js";
const app = express();
const port = 3001;
import cors from "cors";
import signalsController from "./controllers/signalsController.js";
import { startListening } from "./services/signalsService.js";

// Example data
const data = {
  message: "Hello, world!",
  timestamp: new Date(),
};

startListening();

app.use(cors());
// GET route
// app.get('/signals', signalsController.pullSignals);

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});