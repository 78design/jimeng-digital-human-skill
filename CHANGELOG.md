# 更新日志

本项目的所有重要变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

## [1.0.0] - 2026-05-31

### 新增
- 首次发布
- 即梦数字人 OmniHuman1.5 API 调用模块
- 支持图片+音频生成数字人说话视频
- 环境变量配置密钥，安全合规
- 完整的签名机制实现（HMAC-SHA256）
- 任务提交与结果轮询功能
- GitHub Actions 自动发布压缩包

### 文档
- README.md 使用说明
- skill.md 技能描述
- .env.example 环境变量模板

### 安全
- 密钥通过环境变量配置，不硬编码
- .gitignore 阻止敏感文件上传

---

## 版本说明

- **主版本号（Major）**: 不兼容的API变更
- **次版本号（Minor）**: 向后兼容的功能新增
- **修订号（Patch）**: 向后兼容的问题修复