import { createClient } from "redis";

const client = createClient(); // 连接到Redis服务器
client.connect();

const channel = "my-channel"; // 定义频道名称

client.subscribe(channel, (message, key) => {
  console.log(`收到消息: ${message}`);
  setTimeout(() => {
    // 模拟处理消息耗时2秒
    console.log("处理消息完成");
  }, 2000);
}); // 订阅频道
