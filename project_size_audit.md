# Project Size Audit & Cleanup Report

This document provides a highly detailed audit of the project's folder sizes, files, duplicates, unused assets, components, and dependencies. **No files have been modified or deleted automatically.** All cleanups must be approved or run manually.

## 📊 1. Core Summary Table

| Category | Size | Details |
| :--- | :--- | :--- |
| **Total Project Size (With node_modules)** | **315.96 MB** | Total workspace size |
| **Total Project Size (Without node_modules)** | **1.54 MB** | Clean workspace size |
| **node_modules Folder Size** | **314.42 MB** | Dependency footprint |
| **Assets Folders Size** | **378.11 KB** | `src/assets` + `public` folders |
| **All Images Size** | **419.71 KB** | Image assets (PNG, JPG, SVG, WebP, etc.) |
| **All Videos Size** | **0 Bytes** | Video assets (MP4, WebM) |
| **Potential Direct Cleanup Savings** | **114.84 KB** | From unused assets, components & duplicate files |

## 📁 2. Top 20 Largest Folders

| Rank | Folder Path | Size | Percentage of Clean Size |
| :--- | :--- | :--- | :--- |
| 1 | `node_modules` | 314.42 MB | 20424.42% |
| 2 | `node_modules\@cloudflare` | 85.74 MB | 5569.89% |
| 3 | `node_modules\@cloudflare\workerd-windows-64` | 85.71 MB | 5567.80% |
| 4 | `node_modules\@cloudflare\workerd-windows-64\bin` | 85.71 MB | 5567.76% |
| 5 | `node_modules\wrangler` | 26.91 MB | 1748.34% |
| 6 | `node_modules\typescript` | 22.53 MB | 1463.57% |
| 7 | `node_modules\typescript\lib` | 22.48 MB | 1460.08% |
| 8 | `node_modules\date-fns` | 20.29 MB | 1318.02% |
| 9 | `node_modules\@img` | 19.04 MB | 1236.73% |
| 10 | `node_modules\@img\sharp-win32-x64` | 18.97 MB | 1232.19% |
| 11 | `node_modules\@img\sharp-win32-x64\lib` | 18.95 MB | 1231.14% |
| 12 | `node_modules\@tanstack` | 18.5 MB | 1201.66% |
| 13 | `node_modules\.vite\deps` | 16.44 MB | 1067.75% |
| 14 | `node_modules\.vite` | 16.44 MB | 1067.75% |
| 15 | `node_modules\wrangler\wrangler-dist` | 15.55 MB | 1009.90% |
| 16 | `node_modules\date-fns\locale` | 15.06 MB | 978.31% |
| 17 | `node_modules\wrangler\node_modules` | 10.98 MB | 713.22% |
| 18 | `node_modules\@esbuild\win32-x64` | 10.86 MB | 705.41% |
| 19 | `node_modules\@esbuild` | 10.86 MB | 705.41% |
| 20 | `node_modules\wrangler\node_modules\@esbuild\win32-x64` | 10.85 MB | 704.75% |

## 📄 3. Top 20 Largest Files

| Rank | File Path | Size | Type |
| :--- | :--- | :--- | :--- |
| 1 | `node_modules\@cloudflare\workerd-windows-64\bin\workerd.exe` | 85.71 MB | .exe |
| 2 | `node_modules\@img\sharp-win32-x64\lib\libvips-42.dll` | 18.23 MB | .dll |
| 3 | `node_modules\wrangler\wrangler-dist\cli.js` | 12.11 MB | .js |
| 4 | `node_modules\@esbuild\win32-x64\esbuild.exe` | 10.86 MB | .exe |
| 5 | `node_modules\wrangler\node_modules\@esbuild\win32-x64\esbuild.exe` | 10.85 MB | .exe |
| 6 | `node_modules\lightningcss-win32-x64-msvc\lightningcss.win32-x64-msvc.node` | 9.06 MB | .node |
| 7 | `node_modules\typescript\lib\typescript.js` | 8.69 MB | .js |
| 8 | `node_modules\typescript\lib\_tsc.js` | 5.93 MB | .js |
| 9 | `node_modules\workerd\worker.mjs` | 4.48 MB | .mjs |
| 10 | `node_modules\wrangler\wrangler-dist\metafile-cjs.json` | 3.2 MB | .json |
| 11 | `node_modules\.vite\deps\lucide-react.js.map` | 3.11 MB | .map |
| 12 | `node_modules\@tailwindcss\oxide-win32-x64-msvc\tailwindcss-oxide.win32-x64-msvc.node` | 3.01 MB | .node |
| 13 | `node_modules\@rollup\rollup-win32-x64-msvc\rollup.win32-x64-msvc.node` | 2.43 MB | .node |
| 14 | `node_modules\.vite\deps\recharts.js.map` | 2.28 MB | .map |
| 15 | `node_modules\lucide-react\dynamic.d.ts` | 2.16 MB | .ts |
| 16 | `node_modules\lucide-react\dynamicIconImports.d.ts` | 2.16 MB | .ts |
| 17 | `node_modules\date-fns\locale\cdn.js.map` | 1.92 MB | .map |
| 18 | `node_modules\@rollup\rollup-win32-x64-gnu\rollup.win32-x64-gnu.node` | 1.86 MB | .node |
| 19 | `node_modules\typescript\lib\lib.dom.d.ts` | 1.79 MB | .ts |
| 20 | `node_modules\recharts\umd\Recharts.js.map` | 1.64 MB | .map |

## 👥 4. Duplicate Assets

*No duplicate assets found. The asset catalog is highly optimized!*

## 🔍 5. Unused & Deletable Assets

These files exist in `src/assets` or `public` but are never imported or referenced in the source code:

### Unused Images (8 files, Total: 41.67 KB)
| Image File | Size |
| :--- | :--- |
| `node_modules\@supabase\phoenix\priv\static\favicon.ico` | 152 Bytes |
| `node_modules\@supabase\phoenix\priv\static\phoenix-orange.png` | 15.66 KB |
| `node_modules\@supabase\phoenix\priv\static\phoenix.png` | 13.57 KB |
| `node_modules\date-fns\docs\logo.svg` | 2.37 KB |
| `node_modules\date-fns\docs\logotype.svg` | 2.63 KB |
| `node_modules\date-fns-jalali\docs\logo.svg` | 490 Bytes |
| `node_modules\date-fns-jalali\docs\logotype.svg` | 6.73 KB |
| `public\favicon.ico` | 70 Bytes |

### Unused Videos (0 files, Total: 0 Bytes)
*No unused videos found.*

### Unused Fonts (0 files, Total: 0 Bytes)
*No unused fonts found. Fonts are fetched from Google Fonts CDN.*

## 🧩 6. Unused React Components

These component files in `src/components` are never imported or referenced in any other file and represent dead code:

| Component File | Size |
| :--- | :--- |
| `src\components\site\LoadingScreen.tsx` | 5.78 KB |
| `src\components\ui\accordion.tsx` | 1.97 KB |
| `src\components\ui\alert-dialog.tsx` | 4.08 KB |
| `src\components\ui\aspect-ratio.tsx` | 143 Bytes |
| `src\components\ui\avatar.tsx` | 1.38 KB |
| `src\components\ui\calendar.tsx` | 7.04 KB |
| `src\components\ui\carousel.tsx` | 6.05 KB |
| `src\components\ui\context-menu.tsx` | 7.22 KB |
| `src\components\ui\drawer.tsx` | 2.9 KB |
| `src\components\ui\dropdown-menu.tsx` | 7.42 KB |
| `src\components\ui\hover-card.tsx` | 1.22 KB |
| `src\components\ui\input-otp.tsx` | 2.11 KB |
| `src\components\ui\menubar.tsx` | 8.35 KB |
| `src\components\ui\navigation-menu.tsx` | 5.03 KB |
| `src\components\ui\pagination.tsx` | 2.67 KB |
| `src\components\ui\radio-group.tsx` | 1.37 KB |
| `src\components\ui\resizable.tsx` | 1.52 KB |
| `src\components\ui\scroll-area.tsx` | 1.6 KB |
| `src\components\ui\slider.tsx` | 1 KB |
| `src\components\ui\sonner.tsx` | 734 Bytes |
| `src\components\ui\tabs.tsx` | 1.89 KB |
| `src\components\ui\toggle-group.tsx` | 1.71 KB |

## 📦 7. Unused Dependencies (package.json)

These dependencies are declared in your `package.json` but are **never imported or required** in your source code. Removing them from `package.json` and running `npm prune` or reinstalling will decrease your `node_modules` footprint and speed up deployment compilation times:

### Unused Production Dependencies (6)
*   `@hookform/resolvers`
*   `@supabase/ssr`
*   `@tanstack/router-plugin`
*   `date-fns`
*   `tailwindcss`
*   `tw-animate-css`

### Unused Dev Dependencies (7)
*   `@eslint/js`
*   `eslint-config-prettier`
*   `eslint-plugin-prettier`
*   `eslint-plugin-react-hooks`
*   `eslint-plugin-react-refresh`
*   `globals`
*   `typescript-eslint`

## 🧼 8. Direct Action Plan

> [!IMPORTANT]
> **Direct Cleanup Space Potential:** **114.84 KB**

To safely clean up these assets, components, and dependencies, you can execute the following steps:

1. **Remove Unused Assets & Components:**
   You can delete them manually or request Antigravity to run a clean command in CMD:
   ```bash
   Remove-Item "node_modules\@supabase\phoenix\priv\static\favicon.ico"
   Remove-Item "node_modules\@supabase\phoenix\priv\static\phoenix-orange.png"
   Remove-Item "node_modules\@supabase\phoenix\priv\static\phoenix.png"
   Remove-Item "node_modules\date-fns\docs\logo.svg"
   Remove-Item "node_modules\date-fns\docs\logotype.svg"
   Remove-Item "node_modules\date-fns-jalali\docs\logo.svg"
   Remove-Item "node_modules\date-fns-jalali\docs\logotype.svg"
   Remove-Item "public\favicon.ico"
   Remove-Item "src\components\site\LoadingScreen.tsx"
   Remove-Item "src\components\ui\accordion.tsx"
   Remove-Item "src\components\ui\alert-dialog.tsx"
   Remove-Item "src\components\ui\aspect-ratio.tsx"
   Remove-Item "src\components\ui\avatar.tsx"
   Remove-Item "src\components\ui\calendar.tsx"
   Remove-Item "src\components\ui\carousel.tsx"
   Remove-Item "src\components\ui\context-menu.tsx"
   Remove-Item "src\components\ui\drawer.tsx"
   Remove-Item "src\components\ui\dropdown-menu.tsx"
   Remove-Item "src\components\ui\hover-card.tsx"
   Remove-Item "src\components\ui\input-otp.tsx"
   Remove-Item "src\components\ui\menubar.tsx"
   Remove-Item "src\components\ui\navigation-menu.tsx"
   Remove-Item "src\components\ui\pagination.tsx"
   Remove-Item "src\components\ui\radio-group.tsx"
   Remove-Item "src\components\ui\resizable.tsx"
   Remove-Item "src\components\ui\scroll-area.tsx"
   Remove-Item "src\components\ui\slider.tsx"
   Remove-Item "src\components\ui\sonner.tsx"
   Remove-Item "src\components\ui\tabs.tsx"
   Remove-Item "src\components\ui\toggle-group.tsx"
   ```
2. **Remove Unused Dependencies:**
   Run `npm uninstall <package-names>` in your shell for the listed unused dependencies, e.g.:
   ```bash
   npm uninstall @hookform/resolvers @supabase/ssr @tanstack/router-plugin date-fns tailwindcss tw-animate-css
   ```
