import pg from "pg";

let pgClient;

export function InitPg() {
  pgClient = new pg.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: parseInt(process.env.PG_PORT),
  });

  pgClient.connect(err => {
    if (err) {
      console.log("数据库连接出错");
      return;
    }
    console.log("数据库连接成功");
  });
}

export async function QueryPg(sqlText, sqlData) {
  if (!pgClient) {
    await InitPg();
  }

  return pgClient.query(sqlText, sqlData);
}
