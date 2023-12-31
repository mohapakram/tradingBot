import signalsService from "../services/SignalsService.js";
import { db } from "../services/SignalsService.js";

const pullSignals = async (req, res) => {
  db.read();
  const signals = db.data.signals;
  return res.json(signals);
};

export default {
  pullSignals,
};
