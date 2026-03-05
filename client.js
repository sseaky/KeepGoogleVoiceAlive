/**
 * client.js - 建议触发器：每 3 天执行一次
 */
function KeepMeAliveClient() {
  const CONFIG = {
    // 必须与 Server 保持一致
    CODE_POOL: ['V9pX7mN2', 'L4kR9tB5', 'J2zQ6wH8', 'P5mV3nS9', 'T7bK1xR4', 'D8jF2mG6', 'W4nL9vK3', 'R2tS5xM8', 'C9zQ1vB4', 'H6kJ9pL2', 'N5mX3rT7', 'K1vB8wZ4', 'M9pL2nG6', 'B4vR7sT1', 'S8jK2mW5', 'X3nT9vL4', 'G6mF2zQ8', 'W1vR9sT4', 'L2pK7mN5', 'V8nB4wX3', 'J9zQ1rT6', 'P4mV2sB8', 'H7kL1nX5', 'T3nS9vM2', 'R8jF4zQ6', 'K2pX7mB1', 'M5vL9nT3', 'B1nR8wS4', 'S6jK2mV9', 'X4pT1rN7', 'G9zQ3mF2', 'W5vB8sT4'],
    ID_PREFIX: "99",
    DEFAULT_SERVER: "" 
  };

  const myEmail = Session.getActiveUser().getEmail();
  const identity = CONFIG.ID_PREFIX ? `${CONFIG.ID_PREFIX}.${Session.getEffectiveUser().getUsername()}` : Session.getEffectiveUser().getUsername();
  const nowStr = Utilities.formatDate(new Date(), "GMT+8", "yyyy/MM/dd HH:mm:ss");

  let recipient = CONFIG.DEFAULT_SERVER;
  const searchQuery = `from:@txt.voice.google.com to:${myEmail} (${CONFIG.CODE_POOL.slice(0, 10).join(' OR ')}) "RES-ID" -REQ-ID`;
  const threads = GmailApp.search(searchQuery, 0, 1);
  
  if (threads.length > 0) {
    recipient = threads[0].getMessages().pop().getFrom();
    console.log(`[Client] 定位成功: ${recipient}`);
  }

  if (!recipient) return console.warn(`[Client] 寻址失败。`);

  // 全新 100 条请求语料 (50中 / 50英)
  const corpus = [
    "今天的阳光格外温暖", "The stars look bright tonight", "保持学习是一辈子的事", "Coding is an art form", "新的一周充满了挑战", 
    "Focus on the present moment", "早起看到日出的感觉很好", "Tech changes our lives", "保持好奇心是探索的动力", "Stay hungry stay foolish", 
    "大自然的色彩非常绚烂", "Coffee makes life better", "专注是成功的唯一基石", "Explore the unknown world", "阅读让灵魂保持平静", 
    "Innovation drives progress", "坚持就是最后的胜利", "Kindness is a superpower", "远足锻炼了我的意志", "Practice makes perfect", 
    "晚风轻轻吹过树梢", "Music heals the heart", "目标明确才能少走弯路", "Dreams never expire", "珍惜身边的每一个瞬间", 
    "Positive vibes only", "每一次尝试都有其价值", "Success is a journey", "运动释放了多巴胺", "Health is true wealth", 
    "时间管理是一门学问", "Believe in yourself", "团队的力量是巨大的", "Simplicity is beauty", "积极思考能改变人生", 
    "The world is vast", "保护环境是我们的责任", "Keep moving forward", "志愿者工作很有意义", "Learning never stops", 
    "智慧点亮了人生轨迹", "Courage to change", "诚信是立身之本", "Inner peace matters", "不断超越自我实现价值", 
    "Adventure is out there", "细心观察周围的世界", "Time is precious", "乐观的人更有吸引力", "Be the best version",
    "记录生活中的点滴美好", "Technology is evolving", "独立思考不随波逐流", "Nature is healing", "心态决定了生活质量",
    "Consistency is key", "艺术源于生活的感悟", "Growth mindset pays off", "平凡中蕴含着伟大", "Make today count",
    "挑战自我实现新的突破", "Gratitude is an attitude", "专注当下的每一件事", "Life is a gift", "勇气是面对困难的盔甲",
    "Keep your head up", "发现身边的微小确幸", "Hard work wins", "思维的广度决定格局", "Change is inevitable",
    "自律带给我真正的自由", "Stay bold and brave", "心怀感恩所遇皆美好", "Trust the process", "努力成为更好的自己",
    "Good things take time", "发现生活中的无限可能", "Sparkle every day", "互助共赢开创局面", "Chase your goals",
    "系统运行进入新的周期", "Logic is verified", "校验程序执行完毕", "Syncing data now", "链路通畅信号满格",
    "Protocol is stable", "准备开始下一项测试", "Environment is ready", "执行预设的保活流程", "Task initiated"
  ];

  const talk = corpus[Math.floor(Math.random() * corpus.length)];
  const currentCode = CONFIG.CODE_POOL[Math.floor(Math.random() * CONFIG.CODE_POOL.length)];
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();

  const body = `It's ${identity} REQ-ID:${randomStr}. Code:${currentCode}. Msg: ${talk} (${nowStr})`;

  try {
    GmailApp.sendEmail(recipient, "", body);
    console.log(`[Client] 发送完毕: ${body}`);
  } catch (e) {
    console.error(`[Client] 异常: ${e.toString()}`);
  }
}