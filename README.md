# 即梦数字人 OmniHuman1.5 技能

[![Version](https://img.shields.io/github/v/release/78design/jimeng-digital-human-skill?include_prereleases)](https://github.com/78design/jimeng-digital-human-skill/releases)
[![License](https://img.shields.io/github/license/78design/jimeng-digital-human-skill)](LICENSE)
[![Node](https://img.shields.io/node/v/jimeng-digital-human-skill)](package.json)

火山引擎即梦AI数字人视频生成API调用模块。根据人像图片和音频，生成数字人说话视频。

## 功能特性

- ✅ 支持单张图片 + 音频生成视频
- ✅ 支持任意画幅（人物、宠物、动漫等）
- ✅ 支持提示词控制画面、动作、运镜
- ✅ 密钥安全配置（环境变量）
- ✅ 完整签名机制（HMAC-SHA256 V4）
- ✅ 自动轮询等待结果

---

## 目录

- [安装](#安装)
- [配置](#配置)
- [使用](#使用)
- [API参数](#api参数)
- [常见问题](#常见问题)
- [相关链接](#相关链接)
- [更新日志](#更新日志)
- [许可证](#许可证)

---

## 安装

### 方式一：Git克隆（推荐）

```bash
git clone https://github.com/78design/jimeng-digital-human-skill.git
cd jimeng-digital-human-skill
```

### 方式二：下载压缩包

从 [Releases](https://github.com/78design/jimeng-digital-human-skill/releases) 页面下载最新版本的压缩包。

```bash
# 解压后进入目录
tar -xzf jimeng-digital-human-skill-v1.0.0.tar.gz
cd jimeng-digital-human-skill
```

### 方式三：npm安装（即将支持）

```bash
npm install jimeng-digital-human-skill
```

---

## 配置

### 1. 前置条件

#### 火山引擎账号准备

1. 注册火山引擎账号：https://www.volcengine.com/
2. 完成实名认证（个人或企业）
3. 开通即梦数字人服务

#### 开通 OmniHuman1.5 服务

访问智能视觉控制台开通服务：

👉 **[智能视觉控制台](https://console.volcengine.com/ai/overview)**

步骤：
1. 登录火山引擎控制台
2. 进入「智能视觉」→「服务管理」
3. 找到「OmniHuman1.5」
4. 点击「开通服务」（可选择免费试用或正式调用）

#### 获取 AK/SK 密钥

👉 **[密钥管理页面](https://console.volcengine.com/iam/keymanage)**

步骤：
1. 进入密钥管理页面
2. 点击「新建密钥」
3. 记录 `AccessKeyID` 和 `SecretAccessKey`

⚠️ **安全提示**：密钥非常重要，请妥善保管，不要泄露给他人！

### 2. 配置环境变量

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的密钥：

```bash
VOLCENGINE_ACCESS_KEY_ID=你的AccessKeyID
VOLCENGINE_SECRET_ACCESS_KEY=你的SecretAccessKey
```

---

## 使用

### 基本用法

```javascript
require('dotenv').config();
const jimeng = require('./jimeng');

// 生成数字人视频
const result = await jimeng.generateVideo(
  'https://example.com/person.jpg',  // 人像图片URL
  'https://example.com/speech.mp3',  // 音频URL（≤35秒）
  '微笑说话，自然表情'               // 可选：提示词
);

if (result.success) {
  console.log('视频链接:', result.videoUrl);
  // 视频链接有效期1小时，请及时下载
} else {
  console.error('错误:', result.error);
}
```

### 命令行测试

```bash
# 安装 dotenv（如需从 .env 读取）
npm install dotenv

# 运行示例
node example.js
```

---

## API参数

### 输入参数

| 参数 | 类型 | 必选 | 说明 |
|------|------|------|------|
| `imageUrl` | string | ✅ | 人像图片URL，公网可访问 |
| `audioUrl` | string | ✅ | 音频URL，时长≤35秒，公网可访问 |
| `prompt` | string | ❌ | 提示词，控制画面动作（中文/英文/日文/韩文） |

### 素材要求

#### 图片要求
- 包含清晰的人物/主体正面
- 支持任意画幅
- 支持人物、宠物、动漫等形象
- URL必须公网可直接访问

#### 音频要求
- 时长不能超过 **35秒**
- 支持格式：mp3、wav、m4a 等
- URL必须公网可直接访问

### 输出结果

```javascript
{
  success: true,           // 是否成功
  videoUrl: "https://...", // 视频下载链接（有效期1小时）
  error: null              // 错误信息（失败时）
}
```

---

## 常见问题

### Q1: 报错 50400 Access Denied

**原因**：服务未开通或 req_key 版本不匹配

**解决方案**：
1. 确认已在控制台开通 **OmniHuman1.5** 服务
2. 确认代码使用正确的 req_key：`jimeng_realman_avatar_picture_omni_v15`
3. 不要使用旧版 req_key（如 `omni_v2`）

👉 [开通服务入口](https://console.volcengine.com/ai/overview)

### Q2: 报错 invalid audio length

**原因**：音频时长超过35秒限制

**解决方案**：裁剪音频至35秒以内

### Q3: 报错 SignatureDoesNotMatch

**原因**：签名参数错误

**解决方案**：
1. 确认 Region = `cn-north-1`
2. 确认 Service = `cv`
3. 确认 AK/SK 正确无误

### Q4: 视频生成需要多久？

正常情况下约 **60-120秒**，取决于素材复杂度。

### Q5: 视频链接有效期？

视频链接有效期为 **1小时**，请及时下载保存。

---

## 相关链接

### 火山引擎官方

| 名称 | 链接 |
|------|------|
| 火山引擎官网 | https://www.volcengine.com/ |
| 即梦AI产品页 | https://www.volcengine.com/product/jimeng |
| 智能视觉控制台 | https://console.volcengine.com/ai/overview |
| 密钥管理 | https://console.volcengine.com/iam/keymanage |
| 费用中心 | https://console.volcengine.com/finance/overview |

### API文档

| 名称 | 链接 |
|------|------|
| OmniHuman1.5接口文档 | https://www.volcengine.com/docs/85621/1829013 |
| 通用返回字段及错误码 | https://www.volcengine.com/docs/6444/69728 |
| 快速入门指南 | https://www.volcengine.com/docs/85621/1995636 |
| SDK使用说明 | https://www.volcengine.com/docs/6444/79136 |

### 本项目

| 名称 | 链接 |
|------|------|
| GitHub仓库 | https://github.com/78design/jimeng-digital-human-skill |
| Releases下载 | https://github.com/78design/jimeng-digital-human-skill/releases |
| 问题反馈 | https://github.com/78design/jimeng-digital-human-skill/issues |

---

## 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新历史。

---

## 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 安全提示

⚠️ **密钥安全**：
- 绝不要将 AK/SK 硬编码在代码中
- 绝不要将 `.env` 文件上传到公开仓库
- 定期更换密钥，避免长期使用同一密钥
- 如密钥泄露，立即在控制台删除并重新创建

---

## 作者

田惠（田哥）

---

## 致谢

- 火山引擎即梦AI团队
- OmniHuman模型开发团队