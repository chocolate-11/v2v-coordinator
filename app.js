import "dotenv/config";
import express from "express";

import router from "./router.js";
import { VerifyDiscordRequest } from "./scripts/coordinator_server/node_fetch.js";
import { InitPg } from "./scripts/coordinator_server/pg.js";

const app = express();
const PORT = process.env.PORT;

// app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use("/v2vcoordinator", router);

app.listen(PORT, async () => {
  console.log("Listening on port", PORT);
  InitPg();
});
