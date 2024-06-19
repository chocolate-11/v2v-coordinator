import "dotenv/config";
import fetch from "node-fetch";
import { verifyKey } from "discord-interactions";
import { HttpsProxyAgent } from "https-proxy-agent";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
import moment from "moment";

const proxyUrl = "http://127.0.0.1:7890";
const agent = new HttpsProxyAgent(proxyUrl);

// const key = nacl.sign.keyPair();
// console.log(key);
// console.log("publicKey：", naclUtil.encodeBase64(key.publicKey));
// const a = naclUtil.encodeBase64(key.secretKey);
// console.log("secretKey：", a);
// console.log("secretKey：", naclUtil.decodeBase64(a));

export function VerifyDiscordRequest(clientKey) {
  return function (req, res, buf, encoding) {
    const signature = req.get("X-Signature-Ed25519");
    const timestamp = req.get("X-Signature-Timestamp");

    const isValidRequest = verifyKey(buf, signature, timestamp, clientKey);
    if (!isValidRequest) {
      res.status(401).send("Bad request signature");
      throw new Error("Bad request signature");
    }
  };
}

export async function DiscordRequest(endpoint, options) {
  return new Promise(async (resolve, reject) => {
    const url = "https://discord.com/api/v10/" + endpoint;
    if (options.body) options.body = JSON.stringify(options.body);
    const res = await fetch(url, {
      headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        "Content-Type": "application/json; charset=UTF-8",
        "User-Agent":
          "DiscordBot (https://github.com/discord/discord-example-app, 1.0.0)",
      },
      ...options,
      // agent,
    });
    if (!res.ok) {
      const data = await res.json();
      console.log(res.status);
      reject(JSON.stringify(data));
    }
    resolve(res.json());
  });
}

export async function DiscordSeverRequest(body) {
  return new Promise(async (resolve, reject) => {
    const url = process.env.DISCORD_SERVER_URL;
    if (body) body = JSON.stringify(body);
    const Timestamp = moment().unix();
    const textEncoder = new TextEncoder();

    const Ed25519 = naclUtil.encodeBase64(
      nacl.sign.detached(
        textEncoder.encode(body),
        naclUtil.decodeBase64(process.env.SECRET_KEY)
      )
    );
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "X-Signature-Timestamp": Timestamp.toString(),
        "X-Signature-Ed25519": Ed25519,
        "X-Signature-Source": "coordinator",
      },
      method: "POST",
      body,
      // agent,
    });
    if (!res.ok) {
      const data = await res.json();
      console.log(res.status);
      reject(JSON.stringify(data));
    }
    resolve(res.json());
  });
}
