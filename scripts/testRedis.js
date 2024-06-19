import { createClient } from "redis";

const channelName = "channel1";

const subClient = createClient();
subClient.subscribe(channelName, (message, channel) => {
  console.log(`消息：${channel}: ${message}`);
});
subClient.on("ready", () => {
  console.log("subClient ready");
});
subClient.connect();

async function FunA() {
  const client = await createClient()
    .on("error", err => {
      console.error(`报错：${err}`);
    })
    .on("ready", () => {
      console.log("client ready");
    })
    .on("end", () => {
      console.log("end");
    })
    .connect();
  setTimeout(() => {
    console.log("send");
    client.publish(channelName, "123");
  }, 1000);
}
FunA();
