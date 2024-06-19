import { GetUTCTime } from "./log.js";
import { DiscordSeverRequest } from "./node_fetch.js";
import { QueryPg } from "./pg.js";
// 返回队列排队时间最久的order
async function GetOrder() {
  const orderSqlData = await QueryPg(
    "select id, s3_bucket, upload_video_path, option_style, upload_video_duration, add_watermark from order_info order by enque_time ASC limit 1"
  );
  return orderSqlData.rows[0];
}

export async function OnRequest(req, res) {
  const workerInfo = req.body.worker_info;

  const workerSqlData = await QueryPg(
    "select id from v2v_worker where node_id=$1",
    [workerInfo.node_id]
  );

  if (workerSqlData.rows.length === 0) {
    console.log("添加worker");
    await QueryPg(
      "insert into v2v_worker (node_id, worker_id, vendor, location, gpu_model, gpu_memory, create_time, update_time) values ($1, $2, $3, $4, $5, $6, $7, $8)",
      [
        workerInfo.node_id,
        workerInfo.worker_id,
        workerInfo.vendor,
        workerInfo.location,
        workerInfo.gpu.model,
        workerInfo.gpu.memory,
        GetUTCTime(),
        GetUTCTime(),
      ]
    );
  } else {
    console.log("更新worker信息");
    await QueryPg(
      "update v2v_worker set node_id=$1, worker_id=$2, vendor=$3, location=$4, gpu_model=$5, gpu_memory=$6, update_time=$7 where id=$8",
      [
        workerInfo.node_id,
        workerInfo.worker_id,
        workerInfo.vendor,
        workerInfo.location,
        workerInfo.gpu.model,
        workerInfo.gpu.memory,
        GetUTCTime(),
        workerSqlData.rows[0].id,
      ]
    );
  }

  console.log("更新order信息");
  const order = await GetOrder();
  await QueryPg(
    "update order_info set order_status=$1, generate_time=$2, worker_id=$3, worker_program_repo=$4, worker_program_tag=$5, update_time=$6 where id=$7",
    [
      "generating",
      GetUTCTime(),
      workerInfo.worker_id,
      workerInfo.program.repo,
      workerInfo.program.tag,
      GetUTCTime(),
      order.id,
    ]
  );

  await res.send({
    code: 0,
    message: "正常",
    data: {
      order: {
        id: parseInt(order.id),
        upload_video_path: order.upload_video_path,
        option_style: order.option_style,
        option_duration: order.upload_video_duration,
        add_watermark: order.add_watermark,
        s3_endpoint: "https://cos.na-siliconvalley.myqcloud.com",
        s3_bucket: order.s3_bucket,
      },
    },
  });

  await DiscordSeverRequest({
    type: "request",
    order_id: order.id,
  });
}

export async function OnProgress(req, res) {
  console.log("更新order进度");
  await QueryPg(
    "update order_info set process_status=$1, update_time=$2 where id=$3",
    [(req.body.progress * 100).toString(), GetUTCTime(), req.body.id]
  );

  await res.send({
    code: 0,
    message: "正常",
  });

  await DiscordSeverRequest({
    type: "progress",
    order_id: req.body.id,
  });
}

export async function OnPreview(req, res) {
  console.log("order创建preview");
  await QueryPg(
    "update order_info set synth_image_preview_path=$1, update_time=$2 where id=$3",
    [req.body.synth_image_preview_path, GetUTCTime(), req.body.id]
  );

  await res.send({
    code: 0,
    message: "正常",
  });

  await DiscordSeverRequest({
    type: "preview",
    order_id: req.body.id,
  });
}

export async function OnFinish(req, res) {
  console.log("完成order");
  await QueryPg(
    "update order_info set order_status=$1, finish_time=$2, synth_video_path=$3, synth_video_size=$4, synth_video_duration=$5, synth_video_width=$6, synth_video_height=$7, update_time=$8 where id=$9",
    [
      "finished",
      GetUTCTime(),
      req.body.synth_video_path,
      req.body.synth_video_size,
      req.body.synth_video_duration,
      req.body.synth_video_width,
      req.body.synth_video_height,
      GetUTCTime(),
      req.body.id,
    ]
  );

  await res.send({
    code: 0,
    message: "正常",
  });

  await DiscordSeverRequest({
    type: "finish",
  });
}

export async function OnAbort(req, res) {
  console.log(req.body);
  console.log("终止order");
  await QueryPg(
    "update order_info set order_status=$1, process_status=$2, process_exception=$3, update_time=$4 where id=$5",
    ["queued", null, req.body.reason, GetUTCTime(), req.body.id]
  );

  await res.send({
    code: 0,
    message: "正常",
  });

  await DiscordSeverRequest({
    type: "abort",
  });
}
