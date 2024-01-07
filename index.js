import express from "express/index.js";
const app = express();
const port = 3001;
import cors from "cors";
import signalsController from "./controllers/SignalsController.js";
import { startListening } from "./services/signalsService.js";

startListening();

app.use(cors());

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
