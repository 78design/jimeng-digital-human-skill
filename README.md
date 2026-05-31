# 即梦数字人 OmniHuman1.5 技能

火山引擎即梦AI数字人视频生成API调用模块。

## 功能

根据人像图片和音频，生成数字人说话视频。

## 安装

```bash
git clone https://github.com/your-username/jimeng-digital-human-skill.git
cd jimeng-digital-human-skill
```

## 配置

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入你的火山引擎 AK/SK：
```
VOLCENGINE_ACCESS_KEY_ID=你的AccessKeyID
VOLCENGINE_SECRET_ACCESS_KEY=你的SecretAccessKey
```

获取密钥：[火山引擎密钥管理](https://console.volcengine.com/iam/keymanage)

## 使用

```javascript
require('dotenv').config();
const jimeng = require('./jimeng');

const result = await jimeng.generateVideo(
  'https://example.com/image.jpg',  // 人像图片URL
  'https://example.com/audio.mp3',  // 音频URL（≤35秒）
  '微笑说话'                         // 可选提示词
);

if (result.success) {
  console.log('视频链接:', result.videoUrl);
} else {
  console.log('错误:', result.error);
}
```

## 参数说明

| 参数 | 必选 | 说明 |
|------|------|------|
| imageUrl | 是 | 人像图片URL，公网可访问 |
| audioUrl | 是 | 音频URL，时长≤35秒 |
| prompt | 否 | 提示词（中文/英文） |

## 注意事项

- 音频时长不能超过35秒
- 图片需包含清晰的人物正面
- 视频生成约需60-120秒
- 视频链接有效期1小时

## 前置条件

需要在火山引擎控制台开通 **OmniHuman1.5** 服务：
[智能视觉控制台](https://console.volcengine.com/ai/overview)

## License

MIT