declare module '@vitejs/plugin-vue' {
  import { Plugin } from 'vite';
  
  interface VuePluginOptions {
    include?: string | RegExp | (string | RegExp)[];
    exclude?: string | RegExp | (string | RegExp)[];
    isProduction?: boolean;
    script?: {
      defineModel?: boolean;
      propsDestructure?: boolean;
    };
    template?: {
      transformAssetUrls?: Record<string, string | string[]> | boolean;
    };
  }
  
  function vue(options?: VuePluginOptions): Plugin;
  export default vue;
}