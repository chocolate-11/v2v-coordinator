import { createClient } from "redis";

const client = createClient(); // 连接到Redis服务器
client.connect();

const channel = "my-channel"; // 定义频道名称

setInterval(() => {
  const message = Math.random().toString(36); // 生成随机消息
  // client.publish(channel, message); // 发布消息
  client.xAdd("my-channel", "*", { message: "Hello World!" });
  console.log(`发布消息: ${message}`);
}, 1000); // 每秒发布一次消息
