import signalsService from "../services/signalsService.js";
import { db } from "../services/signalsService.js";

const pullSignals = async (req, res) => {
  db.read();
  const signals = db.data.signals;
  return res.json(signals);
};

export default {
  pullSignals,
};
