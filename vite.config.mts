import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@wendellhu/redi': join(__dirname, 'src'),
      '@wendellhu/redi/react-bindings': join(__dirname, 'src/react-bindings'),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      //控制代码注释的处理,保留注释（包括许可证信息）
      legalComments: 'inline',
    },
  },
  test: {
    //启用全局测试 API（无需显式导入）
    globals: true,
    coverage: {
      exclude: ['src/**/publicApi.ts', '**/__tests__/**', '**/__testing__/**'],
      //仅统计 src 目录下的 TypeScript 文件
      include: ['src/**/*.{ts,tsx}'],
      //使用 Istanbul 作为覆盖率工具
      provider: 'istanbul',
    },
  },
});
