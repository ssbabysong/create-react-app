// 拍照识别：把豆袋照片发给 Claude，提取结构化信息
// 没有后端，直接用用户自己的 API Key 从浏览器调用（Key 只存在本机）
import { ORIGINS, PROCESSES, ROASTS, USAGES, FLAVORS, BLEND } from './data.js';

const KEY = 'bean-vault:apiKey';

export function getApiKey() {
  try {
    return localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
}

export function setApiKey(v) {
  try {
    if (v) localStorage.setItem(KEY, v.trim());
    else localStorage.removeItem(KEY);
  } catch {
    /* 忽略 */
  }
}

const TOOL = {
  name: 'record_bean',
  description: '记录从咖啡豆包装照片上识别出的信息。',
  strict: true,
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: '豆子名称，通常是产区/庄园/批次名，例如「耶加雪菲 孔加 G1」' },
      roaster: { type: 'string', description: '烘焙商 / 品牌' },
      country: { type: 'string', description: `产地国家，用中文；优先从这些里选：${ORIGINS.map((o) => o.name).join('、')}；拼配豆填「${BLEND}」；无法判断填空字符串` },
      region: { type: 'string', description: '产区' },
      farm: { type: 'string', description: '庄园 / 处理站 / 合作社 / 生产者' },
      variety: { type: 'string', description: '品种，用常见中文译名，例如 瑰夏、SL28、粉红波旁、卡杜拉' },
      process: { type: 'string', enum: [...PROCESSES, ''], description: '处理法；Washed=水洗，Natural=日晒，Honey=蜜处理，Anaerobic=厌氧，Wet-hulled=湿刨法，其他发酵类=特殊发酵' },
      roast: { type: 'string', enum: [...ROASTS, ''], description: '烘焙度' },
      usage: { type: 'string', enum: [...USAGES, ''], description: '适合手冲(filter/pour over)还是意式(espresso)，看不出填空' },
      roastDate: { type: 'string', description: '烘焙日期，格式 YYYY-MM-DD；没写年份时取今天之前最近的那个日期；找不到填空字符串' },
      weight: { type: 'number', description: '净重（克），找不到填 0' },
      price: { type: 'number', description: '价格（人民币），找不到填 0' },
      flavors: {
        type: 'array',
        items: { type: 'string' },
        description: `风味描述，翻成简短中文词；尽量使用这些词：${FLAVORS.join('、')}；也可以用更具体的词，如 白桃、荔枝、乌龙茶`,
      },
      notes: { type: 'string', description: '包装上其他值得记的信息（海拔、冲煮建议等），一句话' },
    },
    required: ['name', 'roaster', 'country', 'region', 'farm', 'variety', 'process', 'roast', 'usage', 'roastDate', 'weight', 'price', 'flavors', 'notes'],
    additionalProperties: false,
  },
};

const toBase64 = (dataUrl) => dataUrl.slice(dataUrl.indexOf(',') + 1);

/**
 * @param {string[]} images JPEG dataURL 列表（正面、背面…）
 * @returns {Promise<object>} record_bean 的字段
 */
export async function extractBean(images) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('还没有设置 API Key');

  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const today = new Date().toISOString().slice(0, 10);

  let response;
  try {
    response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 4000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low' },
      tools: [TOOL],
      tool_choice: { type: 'auto' },
      messages: [
        {
          role: 'user',
          content: [
            ...images.map((url) => ({
              type: 'image',
              source: { type: 'base64', media_type: 'image/jpeg', data: toBase64(url) },
            })),
            {
              type: 'text',
              text: `这些是同一包咖啡豆的包装照片（可能是正面和背面）。今天是 ${today}。请读出包装上的信息，调用 record_bean 工具记录下来。只填包装上能看到或能可靠推断的内容，看不到的字段留空。`,
            },
          ],
        },
      ],
    });
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) throw new Error('API Key 无效，请在设置里检查');
    if (err instanceof Anthropic.RateLimitError) throw new Error('请求太频繁，稍后再试');
    if (err instanceof Anthropic.APIError) throw new Error(`识别失败（${err.status ?? '网络错误'}）`);
    throw new Error('网络连接失败，请检查网络');
  }

  if (response.stop_reason === 'refusal') throw new Error('这张照片没能识别，请手动填写');
  const call = response.content.find((b) => b.type === 'tool_use' && b.name === TOOL.name);
  if (!call) throw new Error('没有从照片里读到豆子信息');
  return call.input;
}
