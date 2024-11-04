// vite.config.ts
import { defineConfig } from "file:///C:/Users/BeenYan/Desktop/tauri/project/yuntech_item_system/node_modules/.pnpm/vite@5.2.6_sass@1.72.0/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/BeenYan/Desktop/tauri/project/yuntech_item_system/node_modules/.pnpm/@vitejs+plugin-vue@4.6.2_vite@5.2.6_vue@3.4.21/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { quasar, transformAssetUrls } from "file:///C:/Users/BeenYan/Desktop/tauri/project/yuntech_item_system/node_modules/.pnpm/@quasar+vite-plugin@1.6.0_@vitejs+plugin-vue@4.6.2_quasar@2.15.1_vite@5.2.6_vue@3.4.21/node_modules/@quasar/vite-plugin/src/index.js";
import { resolve } from "path";
var __vite_injected_original_dirname = "C:\\Users\\BeenYan\\Desktop\\tauri\\project\\yuntech_item_system";
var vite_config_default = defineConfig(async () => ({
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      autoImportComponentCase: "pascal",
      sassVariables: "src/quasar-variables.sass"
    })
  ],
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"]
    }
  },
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src")
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxCZWVuWWFuXFxcXERlc2t0b3BcXFxcdGF1cmlcXFxccHJvamVjdFxcXFx5dW50ZWNoX2l0ZW1fc3lzdGVtXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxCZWVuWWFuXFxcXERlc2t0b3BcXFxcdGF1cmlcXFxccHJvamVjdFxcXFx5dW50ZWNoX2l0ZW1fc3lzdGVtXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9CZWVuWWFuL0Rlc2t0b3AvdGF1cmkvcHJvamVjdC95dW50ZWNoX2l0ZW1fc3lzdGVtL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcclxuaW1wb3J0IHsgcXVhc2FyLCB0cmFuc2Zvcm1Bc3NldFVybHMgfSBmcm9tICdAcXVhc2FyL3ZpdGUtcGx1Z2luJztcclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGFzeW5jICgpID0+ICh7XHJcbiAgcGx1Z2luczogW1xyXG4gICAgdnVlKHtcclxuICAgICAgdGVtcGxhdGU6IHsgdHJhbnNmb3JtQXNzZXRVcmxzIH0sXHJcbiAgICB9KSxcclxuICAgIHF1YXNhcih7XHJcbiAgICAgIGF1dG9JbXBvcnRDb21wb25lbnRDYXNlOiAncGFzY2FsJyxcclxuICAgICAgc2Fzc1ZhcmlhYmxlczogJ3NyYy9xdWFzYXItdmFyaWFibGVzLnNhc3MnLFxyXG4gICAgfSksXHJcbiAgXSxcclxuXHJcbiAgLy8gVml0ZSBvcHRpb25zIHRhaWxvcmVkIGZvciBUYXVyaSBkZXZlbG9wbWVudCBhbmQgb25seSBhcHBsaWVkIGluIGB0YXVyaSBkZXZgIG9yIGB0YXVyaSBidWlsZGBcclxuICAvL1xyXG4gIC8vIDEuIHByZXZlbnQgdml0ZSBmcm9tIG9ic2N1cmluZyBydXN0IGVycm9yc1xyXG4gIGNsZWFyU2NyZWVuOiBmYWxzZSxcclxuICAvLyAyLiB0YXVyaSBleHBlY3RzIGEgZml4ZWQgcG9ydCwgZmFpbCBpZiB0aGF0IHBvcnQgaXMgbm90IGF2YWlsYWJsZVxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogMTQyMCxcclxuICAgIHN0cmljdFBvcnQ6IHRydWUsXHJcbiAgICB3YXRjaDoge1xyXG4gICAgICAvLyAzLiB0ZWxsIHZpdGUgdG8gaWdub3JlIHdhdGNoaW5nIGBzcmMtdGF1cmlgXHJcbiAgICAgIGlnbm9yZWQ6IFsnKiovc3JjLXRhdXJpLyoqJ10sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxyXG4gICAgfSxcclxuICB9LFxyXG59KSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBOFcsU0FBUyxvQkFBb0I7QUFDM1ksT0FBTyxTQUFTO0FBQ2hCLFNBQVMsUUFBUSwwQkFBMEI7QUFDM0MsU0FBUyxlQUFlO0FBSHhCLElBQU0sbUNBQW1DO0FBTXpDLElBQU8sc0JBQVEsYUFBYSxhQUFhO0FBQUEsRUFDdkMsU0FBUztBQUFBLElBQ1AsSUFBSTtBQUFBLE1BQ0YsVUFBVSxFQUFFLG1CQUFtQjtBQUFBLElBQ2pDLENBQUM7QUFBQSxJQUNELE9BQU87QUFBQSxNQUNMLHlCQUF5QjtBQUFBLE1BQ3pCLGVBQWU7QUFBQSxJQUNqQixDQUFDO0FBQUEsRUFDSDtBQUFBO0FBQUE7QUFBQTtBQUFBLEVBS0EsYUFBYTtBQUFBO0FBQUEsRUFFYixRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsSUFDWixPQUFPO0FBQUE7QUFBQSxNQUVMLFNBQVMsQ0FBQyxpQkFBaUI7QUFBQSxJQUM3QjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssUUFBUSxrQ0FBVyxLQUFLO0FBQUEsSUFDL0I7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
