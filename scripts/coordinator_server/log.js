import moment from "moment";
import { QueryPg } from "./pg.js";

export function GetUTCTime() {
  return moment.utc();
}

export const LogCatalogEnum = {
  CreateUser: "CreateUser",
  UpdateUser: "UpdateUser",
  CreateOrder: "CreateOrder",
  UpdateOrder: "UpdateOrder",
};

export function StoreLog(catalog, message) {
  return QueryPg(
    "insert into log_info (catalog, message, create_time) values ($1, $2, $3)",
    [catalog, message, GetUTCTime()]
  );
}
