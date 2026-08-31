import { readFile, readdir } from 'node:fs/promises';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
const contentRoot = join(root, 'src', 'content');
const sourceRoots = [join(root, 'src'), join(root, 'public')];
const errors = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else files.push(path);
  }
  return files;
}

const allPublicSourceFiles = (await Promise.all(sourceRoots.map(walk))).flat();
const textFiles = allPublicSourceFiles.filter((file) => /\.(astro|md|mdx|ts|js|mjs|css|txt|svg)$/i.test(file));
const texts = new Map(await Promise.all(textFiles.map(async (file) => [file, await readFile(file, 'utf8')])));

const forbidden = [
  [/\b(?!15801053205\b)1[3-9]\d{9}\b/g, '未授权手机号'],
  [/1997\s*[年./-]\s*11\s*[月./-]\s*0?4/g, '完整出生日期'],
  [/中共党员|政治面貌|CET-?6|六级未通过/g, '私密身份或英语信息'],
  [/昆仑数智|国家管网集团|东部原油储运/g, '企业真实名称'],
  [/[A-Za-z]:\\/g, '本地绝对路径'],
  [/\.work(?:[\\/]|\b)/g, '内部工作目录'],
  [/合同金额|项目金额/g, '项目金额描述']
];

for (const [file, text] of texts) {
  for (const [pattern, label] of forbidden) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) errors.push(`${relative(root, file)} 包含禁止内容：${label}`);
  }
}

const projectDir = join(contentRoot, 'projects');
const projectFiles = (await readdir(projectDir)).filter((name) => /\.mdx?$/.test(name));
if (projectFiles.length !== 7) errors.push(`项目文件应为7个，实际为${projectFiles.length}个`);

const expectedFeatured = new Map([
  ['project-01', 1], ['project-07', 2], ['project-06', 3], ['project-03', 4]
]);
const foundFeatured = new Map();
const ids = new Set();
const slugs = new Set();
const requiredFields = ['id', 'slug', 'title', 'summary', 'projectType', 'organizationPublic', 'status', 'publicLevel', 'problem', 'personalRole', 'collaborationBoundary', 'validation', 'limitations', 'deliverables', 'discussionQuestions', 'updatedAt'];

for (const name of projectFiles) {
  const file = join(projectDir, name);
  const text = await readFile(file, 'utf8');
  for (const field of requiredFields) if (!new RegExp(`^${field}:`, 'm').test(text)) errors.push(`${name} 缺少字段 ${field}`);
  const id = text.match(/^id:\s*(.+)$/m)?.[1].trim();
  const slug = text.match(/^slug:\s*(.+)$/m)?.[1].trim();
  if (!id || ids.has(id)) errors.push(`${name} 的id缺失或重复`); else ids.add(id);
  if (!slug || slugs.has(slug)) errors.push(`${name} 的slug缺失或重复`); else slugs.add(slug);
  const featured = /^featured:\s*true$/m.test(text);
  const order = Number(text.match(/^featuredOrder:\s*(\d+)$/m)?.[1]);
  if (featured) foundFeatured.set(id, order);
  if (/^publicLevel:\s*仅概要$/m.test(text) && /^evidenceLinks:/m.test(text)) errors.push(`${name} 为仅概要但含公开证据链接，请人工复核`);
}

if (foundFeatured.size !== 4) errors.push(`首页精选应为4个，实际为${foundFeatured.size}个`);
for (const [id, order] of expectedFeatured) if (foundFeatured.get(id) !== order) errors.push(`${id} 首页顺序应为${order}`);
for (const id of foundFeatured.keys()) if (!expectedFeatured.has(id)) errors.push(`${id} 不应进入V1首页精选`);

const p05 = await readFile(join(projectDir, '05-gas-leak-dataset.mdx'), 'utf8');
const p05Role = '我负责2063组仿真工况的批量运行、状态跟踪和数据汇总，其中既有我直接运行的任务，也有我组织同门完成的任务；当时没有按这两类单独计数。我还参与了识别算法测试和技术交付。';
if (!p05.includes(p05Role)) errors.push('项目05缺少最新当事人表述');
if (!/燃气管网仿真底座和核心内核由同门师兄和课题组开发/.test(p05)) errors.push('项目05未明确核心内核由同门师兄和课题组开发');
const p06 = await readFile(join(projectDir, '06-gas-network-forecast.mdx'), 'utf8');
if (!/LSTM负荷预测的主要代码是我写的/.test(p06) || !/核心物理仿真内核、平台框架和整体业务系统由同门师兄和课题组开发/.test(p06)) errors.push('项目06缺少LSTM本人代码或核心内核协作说明');
const expectedKernelAttribution = new Map([
  ['04', /一维水热力核心仿真内核由同门师兄和课题组开发/],
  ['05', /燃气管网仿真底座和核心内核由同门师兄和课题组开发/],
  ['06', /核心物理仿真内核、平台框架和整体业务系统由同门师兄和课题组开发/],
  ['07', /核心水热力与混油仿真内核、优化平台及在线集成由同门师兄和课题组共同开发/]
]);
for (const [id, attributionPattern] of expectedKernelAttribution) {
  const name = projectFiles.find((item) => item.startsWith(`${id}-`));
  const text = await readFile(join(projectDir, name), 'utf8');
  if (!attributionPattern.test(text)) errors.push(`项目${id}缺少核心内核协作说明`);
}

const publicationText = (await Promise.all((await readdir(join(contentRoot, 'publications'))).map((name) => readFile(join(contentRoot, 'publications', name), 'utf8')))).join('\n');
for (const doi of ['10.1063/5.0226595', '10.1016/j.powtec.2026.122245']) if (!publicationText.includes(doi)) errors.push(`缺少已核验DOI：${doi}`);
if (!/venue: 岩土力学[\s\S]*status: 已发表/.test(publicationText)) errors.push('中文核心未标记为已发表');
if (!/venue: Journal of Rock Mechanics and Geotechnical Engineering[\s\S]*status: 在投/.test(publicationText)) errors.push('JRMGE研究未标记为在投');

const renderedSource = [...texts.values()].join('\n');
if (!renderedSource.includes("phone: '15801053205'")) errors.push('站点数据缺少已授权联系电话');
if (!renderedSource.includes('tel:${site.phoneHref}')) errors.push('页面缺少可拨打的电话链接');
const scopeViolations = [
  [/<form\b/i, '联系表单'], [/google-analytics|gtag\(|plausible|umami/i, '统计脚本'],
  [/聊天机器人|chatbot/i, '聊天机器人'], [/three\.js|<canvas\b/i, '3D或Canvas'],
  [/下载简历|href=["'][^"']+\.pdf/i, '简历下载']
];
for (const [pattern, label] of scopeViolations) if (pattern.test(renderedSource)) errors.push(`源码包含范围外功能：${label}`);

if (errors.length) {
  console.error('公开前内容校验失败：');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`公开前内容校验通过：7个项目、${foundFeatured.size}个精选项目、2个已核验DOI；未发现设定的隐私与范围禁项。`);
