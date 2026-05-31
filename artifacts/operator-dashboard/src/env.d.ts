/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NODE_API_ORIGIN?: string;
  readonly VITE_NODE_WS_ORIGIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}