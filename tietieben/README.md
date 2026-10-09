# 贴贴本

以贴纸为主的电子手帐。一年一本，年 / 月 / 周 / 日四种跨页，拍照收集贴纸，拖进页面里。

第一版是网页应用（PWA），在 iPad 和 iPhone 的 Safari 里打开即可使用，可以「添加到主屏幕」全屏离线使用。

## 开发

```bash
cd tietieben
npm install
npm run dev      # 本地开发
npm run build    # 类型检查 + 打包到仓库根目录的 docs/
```

`docs/` 是打包结果，GitHub Pages 直接从这里发布，改完代码后需要重新 `npm run build` 并提交 `docs/`。

## 结构

- `src/book.ts` 本子布局、跨页渲染、翻页引擎和导航
- `src/items.ts` 贴纸、胶带、文字、手写笔迹和页面上的手势
- `src/drawer.ts` 贴纸抽屉：拼贴胶带、贴纸卷、和纸胶带、收集、文字，揭贴纸和拖放
- `src/templates.ts` 各种页面版式，所有可写的位置都存成字段
- `src/photo.ts` 照片做成贴纸（自动去背景、擦除/恢复笔刷）
- `src/shelf.ts` 书架和设置
- `src/state.ts` 状态、撤销重做、保存；`src/store.ts` IndexedDB 存储
- `src/data/` 内置贴纸、胶带和 PET 拼贴素材（全部是 SVG，没有图片文件）

数据只存在设备本地的 IndexedDB 里。
