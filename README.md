# 李宗泽 · 工程研究档案

面向招聘者、技术面试官和科研/产业合作者的中文静态个人站点。内容聚焦地下能源、岩石力学、CFD/CAE、油气管网仿真、数据分析和工程验证，并明确区分本人参与与团队成果。

计划公开地址：<https://throle.github.io/>

## 技术栈

- Astro + TypeScript
- Markdown/MDX 内容集合
- 原生 CSS 与少量渐进增强 JavaScript
- GitHub Actions + GitHub Pages

## 本地运行

```bash
pnpm install
pnpm dev
```

生产检查与构建：

```bash
pnpm build
```

构建命令会依次运行公开前内容校验、Astro类型检查、静态构建和产物路由/隐私检查。

## 内容结构

- `src/content/projects`：七个项目，首页精选顺序为01、07、06、03。
- `src/content/publications`：两篇已发表第一作者SCI、一篇已发表中文核心和一个在投研究方向。
- `src/content/research`：三个研究专题。
- `src/content/tools`：实际形成且可公开说明的科研工作流。
- `src/pages`：首页、五个主导航页面、七个项目详情、隐私页和404。

`docs/` 是本地实施规范，包含本地路径与审查规则，已加入 `.gitignore`，不应进入公开仓库。

## 隐私与内容边界

本站不使用统计、追踪、表单或第三方字体。企业项目全部匿名，不公开手机号、出生日期、政治面貌、真实拓扑、现场数据、合同金额、内部图件和未授权材料。当前没有可下载的求职文档。

## 许可

站点代码采用 MIT License。个人照片、研究文字、论文元数据整理、示意图及其他个人或研究内容不随代码许可开放，除非文件另有说明。

最后更新：2026-08-29。
