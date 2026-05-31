/**
 * 即梦数字人示例脚本
 */

require('dotenv').config();
const jimeng = require('./jimeng');

async function main() {
  // 示例参数（替换为你的实际素材）
  const imageUrl = process.env.TEST_IMAGE_URL || 'https://example.com/person.jpg';
  const audioUrl = process.env.TEST_AUDIO_URL || 'https://example.com/speech.mp3';
  const prompt = '自然说话，微笑表情';

  console.log('开始生成数字人视频...');
  console.log('图片:', imageUrl);
  console.log('音频:', audioUrl);

  const result = await jimeng.generateVideo(imageUrl, audioUrl, prompt);

  if (result.success) {
    console.log('\n✅ 视频生成成功！');
    console.log('下载链接:', result.videoUrl);
    console.log('\n⚠️ 链接有效期1小时，请及时下载');
  } else {
    console.error('\n❌ 生成失败:', result.error);
  }
}

main().catch(console.error);