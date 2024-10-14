 
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginImp from 'vite-plugin-imp';

// https://vitejs.dev/config/
export default defineConfig({
 base: '/docs/',
  plugins: [
    react(),
    vitePluginImp({
      libList: [
        {
          libName: 'antd',
          style: (name) => {
            return `antd/es/${name}/style/index`;
          },
        },
       
      ],
    }),
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  build: {
   outDir: 'docs',
   assetsDir: 'assets', // 资源目录
   // 设置输出js/css路径,统一携带 /dos/前缀
  }
})