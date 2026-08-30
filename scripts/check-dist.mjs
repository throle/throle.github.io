import { access, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const dist = join(root, 'dist');
const expected = [
  'index.html', 'research/index.html', 'projects/index.html', 'publications/index.html',
  'capabilities/index.html', 'about/index.html', 'privacy/index.html', '404.html',
  'projects/egs-multifield-diversion/index.html', 'projects/solar-thermal-storage/index.html',
  'projects/deep-geothermal-stimulation/index.html', 'projects/crude-pipeline-optimization/index.html',
  'projects/gas-leak-dataset/index.html', 'projects/gas-network-forecast/index.html',
  'projects/liquid-pipeline-platform/index.html', 'images/og-profile.svg', 'robots.txt', 'sitemap-index.xml'
];
const errors = [];
for (const file of expected) {
  try { await access(join(dist, file)); } catch { errors.push(`缺少构建产物 ${file}`); }
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) files.push(...(entry.isDirectory() ? await walk(join(dir, entry.name)) : [join(dir, entry.name)]));
  return files;
}
const htmlFiles = (await walk(dist)).filter((file) => file.endsWith('.html'));
const html = (await Promise.all(htmlFiles.map((file) => readFile(file, 'utf8')))).join('\n');
const homeHtml = await readFile(join(dist, 'index.html'), 'utf8');
if (/<form\b/i.test(html)) errors.push('构建产物含表单');
if (/google-analytics|gtag\(|plausible|umami/i.test(html)) errors.push('构建产物含统计脚本');
if (/\b1[3-9]\d{9}\b/.test(html)) errors.push('构建产物疑似含手机号');
if (/昆仑数智|国家管网集团|东部原油储运/.test(html)) errors.push('构建产物含企业真实名称');
if (/\.work(?:[\\/]|\b)/i.test(html)) errors.push('构建产物含.work内部路径');

const ogSvg = await readFile(join(dist, 'images', 'og-profile.svg'), 'utf8');
if (!/<svg[^>]*\bwidth="1200"[^>]*\bheight="630"[^>]*\bviewBox="0 0 1200 630"/i.test(ogSvg)) errors.push('OG图片不是1200×630 SVG');
if (!/<meta[^>]+property="og:image"[^>]+content="https:\/\/throle\.github\.io\/images\/og-profile\.svg"/i.test(homeHtml)) errors.push('首页缺少绝对OG图片URL');
if (!/<meta[^>]+property="og:image:width"[^>]+content="1200"/i.test(homeHtml)) errors.push('首页缺少OG宽度1200');
if (!/<meta[^>]+property="og:image:height"[^>]+content="630"/i.test(homeHtml)) errors.push('首页缺少OG高度630');
if (!/<meta[^>]+property="og:image:alt"[^>]+content="[^"]+"/i.test(homeHtml)) errors.push('首页缺少OG替代文字');
if (!/<meta[^>]+name="twitter:card"[^>]+content="summary_large_image"/i.test(homeHtml)) errors.push('首页Twitter卡片类型错误');

const jsonLd = homeHtml.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i)?.[1] ?? '';
if (!/"sameAs":\["https:\/\/github\.com\/throle"\]/.test(jsonLd)) errors.push('JSON-LD未使用已核验GitHub sameAs');
const footer = homeHtml.match(/<footer\b[\s\S]*?<\/footer>/i)?.[0] ?? '';
const footerGithubCount = footer.match(/https:\/\/github\.com\/throle/g)?.length ?? 0;
if (footerGithubCount !== 1) errors.push(`页脚GitHub入口应为1个，实际为${footerGithubCount}个`);

const featuredIds = [...homeHtml.matchAll(/data-project-id="([^"]+)"/g)].map((match) => match[1]);
const expectedFeaturedIds = ['project-01', 'project-07', 'project-06', 'project-03'];
if (featuredIds.join('|') !== expectedFeaturedIds.join('|')) errors.push(`首页精选顺序错误：${featuredIds.join(' → ')}`);

if (errors.length) { errors.forEach((error) => console.error(`- ${error}`)); process.exit(1); }
console.log(`构建产物检查通过：${htmlFiles.length}个HTML页面，关键路由与隐私范围正常。`);
