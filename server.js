/**
 * server.js - 建议触发器：每 1 小时执行一次
 * 功能：扫描未读短信请求 -> 自动回复保活内容 -> 发送飞书消息卡片
 */
function KeepMeAliveServer() {
  const CONFIG = {
    // 全新随机口令库
    CODE_POOL: ['V9pX7mN2', 'L4kR9tB5', 'J2zQ6wH8', 'P5mV3nS9', 'T7bK1xR4', 'D8jF2mG6', 'W4nL9vK3', 'R2tS5xM8', 'C9zQ1vB4', 'H6kJ9pL2', 'N5mX3rT7', 'K1vB8wZ4', 'M9pL2nG6', 'B4vR7sT1', 'S8jK2mW5', 'X3nT9vL4', 'G6mF2zQ8', 'W1vR9sT4', 'L2pK7mN5', 'V8nB4wX3', 'J9zQ1rT6', 'P4mV2sB8', 'H7kL1nX5', 'T3nS9vM2', 'R8jF4zQ6', 'K2pX7mB1', 'M5vL9nT3', 'B1nR8wS4', 'S6jK2mV9', 'X4pT1rN7', 'G9zQ3mF2', 'W5vB8sT4'],
    BATCH_LIMIT: 8, 
    FEISHU_NOTIFY: false, 
    FEISHU_WEBHOOK: "https://open.feishu.cn/open-apis/bot/v2/hook/YOUR_DE-IDENTIFIED_ID",
    KEYWORD: "KeepMeAliveServer" 
  };

  const myEmail = Session.getActiveUser().getEmail();
  // 核心搜索逻辑：未读 + 网关来源 + 包含口令 + 含有请求标识 REQ-ID + 排除响应标识 RES-ID
  const query = `is:unread from:@txt.voice.google.com to:${myEmail} (${CONFIG.CODE_POOL.join(' OR ')}) "REQ-ID" -RES-ID`;
  const threads = GmailApp.search(query, 0, CONFIG.BATCH_LIMIT);

  console.log(`[Server] 任务启动：正在扫描未读保活请求...`);
  console.log(`[Server] 搜索指令: ${query}`);
  console.log(`[Server] 发现匹配会话数量: ${threads.length}`);

  // 100条响应语料 (50中 / 50英)
  const replyCorpus = [
    "节点状态当前非常稳定", "All services are operational", "数据同步已经顺利完成", "Latency is within limits", "安全策略已实时更新", 
    "Heartbeat signal is strong", "系统负载处于理想区间", "Backup successfully verified", "连接链路状态极佳", "Encryption keys rotated", 
    "内核补丁已平滑升级", "Database cluster is healthy", "内存回收机制执行完毕", "Audit logs are cleared", "监控指标显示全绿", 
    "Traffic routing optimized", "认证令牌刷新成功", "Cache hit rate is high", "防火墙规则库已对齐", "Packet flow is smooth", 
    "主备切换演练通过", "Resource allocation done", "熵池能量充足", "System uptime record hit", "分布式锁无竞争", 
    "Automated healing active", "证书链路校验通过", "Disk space is ample", "异步任务处理完毕", "API quotas are normal", 
    "边缘节点反馈正常", "Load balancing is stable", "身份验证协议版本V3", "Resolver is healthy", "端口监听状态正常", 
    "Sharding is balanced", "数据完整性校验通过", "Network path is clear", "任务队列清空成功", "Heuristic check passed",
    "集群资源调度就绪", "Hardware diagnosis OK", "快照保存任务完成", "Connection is secured", "配置参数一致性检查通过",
    "Cloud sync completed", "实时流处理效率提升", "Shunts are working", "链路震荡自动修复", "Environment is stable",
    "成功解析请求指纹", "Instructions recorded", "物理层检测无报错", "Uptime is impressive", "计算资源利用率正常",
    "Session is established", "逻辑校验完全一致", "Handshake confirmed", "并发处理能力充足", "Protocol is active",
    "安全审计日志已归档", "Firewall is guarding", "自愈模块静默运行", "No threats detected", "系统时钟同步完成",
    "Cluster nodes synced", "缓存预热已经开启", "DNS records updated", "主节点选举状态正常", "Task finished now",
    "服务响应保持峰值", "Scaling is successful", "全量备份周期结束", "Logs are being analyzed", "硬件层无异常中断",
    "Grid status is green", "加密引擎运行平稳", "Access is authorized", "跨区冗余同步成功", "Validation passed",
    "对等节点发现完成", "Signal strength 100%", "缓存清理机制就绪", "Response is lightning fast", "模块加载匹配成功",
    "Ports are listening", "维护周期已经顺延", "Optimizing data flow", "链路拓扑更新完毕", "Security patch live",
    "实时反馈机制在线", "Environment verified", "权限控制列表同步", "Ready for next cycle", "操作流水号已生成"
  ];

  threads.forEach((thread, tIdx) => {
    // 频率控制，防止发送过快被网关封禁
    if (tIdx > 0) Utilities.sleep(2000); 
    
    const messages = thread.getMessages();
    messages.forEach(msg => {
      // 确认是未读且包含请求特征的邮件
      if (msg.isUnread() && msg.getFrom() !== myEmail && msg.getPlainBody().includes("REQ-ID")) {
        const fullBody = msg.getPlainBody();
        const cleanBody = fullBody.replace(/\s+/g, " ");
        
        // 正则提取身份：It's 之后的内容
        const nameMatch = cleanBody.match(/It's\s+([a-zA-Z0-9_\-\.]+)/);
        const name = nameMatch ? nameMatch[1] : "Unknown";

        // 随机抽取响应内容
        const randomCode = CONFIG.CODE_POOL[Math.floor(Math.random() * CONFIG.CODE_POOL.length)];
        const randomUpdate = replyCorpus[Math.floor(Math.random() * replyCorpus.length)];
        const resID = Math.random().toString(36).toUpperCase().substring(2, 10);
        const timeStr = Utilities.formatDate(new Date(), "GMT+8", "yyyy/MM/dd HH:mm:ss");

        // 构造回复正文
        const replyText = `Hi ${name}, status recorded: ${randomUpdate} (Time:${timeStr} Code:${randomCode}) RES-ID:${resID}`;

        try {
          console.log(`[Server] 正在处理 -> 用户: ${name} | 来自: ${msg.getFrom()}`);
          msg.reply(replyText); // 执行回复
          msg.markRead();       // 标记已读，防止重复处理
          console.log(`[Server] 回复成功：${replyText}`);

          // 调用飞书通知
          if (CONFIG.FEISHU_NOTIFY) {
            sendFeishuNotify(CONFIG, name, cleanBody, randomUpdate, randomCode, timeStr);
          }
        } catch (e) {
          console.error(`[Server失败] 回复用户 ${name} 时发生异常: ${e.toString()}`);
        }
      }
    });
  });
  console.log(`[Server] 本周期处理完成。`);
}

/**
 * 飞书卡片消息推送函数
 */
function sendFeishuNotify(config, user, original, status, code, time) {
  const payload = {
    "msg_type": "interactive",
    "card": {
      "header": { 
        "title": { "tag": "plain_text", "content": `[GV] ${user} 交互完成` }, 
        "template": "blue" 
      },
      "elements": [
        { "tag": "div", "fields": [
          { "is_short": true, "text": { "tag": "lark_md", "content": `**发起身份:**\n${user}` } },
          { "is_short": true, "text": { "tag": "lark_md", "content": `**匹配口令:**\n${code}` } }
        ]},
        { "tag": "div", "text": { "tag": "lark_md", "content": `**请求原文:**\n${original.substring(0, 100)}...` }},
        { "tag": "hr" },
        { "tag": "div", "text": { "tag": "lark_md", "content": `**系统响应状态:**\n${status}` }},
        { "tag": "note", "elements": [{ "tag": "plain_text", "content": `Time: ${time} | From: ${Session.getEffectiveUser().getUsername()} | ID: ${config.KEYWORD}` }] }
      ]
    }
  };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  try {
    console.log(`[飞书] 正在推送通知卡片...`);
    const resp = UrlFetchApp.fetch(config.FEISHU_WEBHOOK, options);
    const resText = resp.getContentText();
    console.log(`[飞书日志] API返回结果: ${resText}`);
  } catch (e) {
    console.error(`[飞书异常] Webhook 调用失败: ${e.toString()}`);
  }
}