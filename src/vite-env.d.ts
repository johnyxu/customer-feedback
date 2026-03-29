/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_FEEDBACK_API_BASE_URL?: string
  readonly VITE_API_KEY?: string
  readonly VITE_SIGNED_UPLOAD_PATH?: string
  readonly VITE_FEEDBACK_SUBMIT_PATH?: string
  readonly VITE_FEEDBACK_EMAIL_SEND_CODE_PATH?: string
  readonly VITE_FEEDBACK_EMAIL_VERIFY_CODE_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
