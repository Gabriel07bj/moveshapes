import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // .env 파일을 현재 작업 디렉토리에서 로드합니다.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // 이 define 옵션은 Vite가 코드에서 `process.env.API_KEY`를
    // .env 파일의 `VITE_API_KEY` 값으로 대체하도록 만듭니다.
    // 이를 통해 Gemini SDK 코드를 변경하지 않고 Vite 환경에서 실행할 수 있습니다.
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            // 모든 node_modules 의존성을 'vendor' 청크로 분리합니다.
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
  };
});
