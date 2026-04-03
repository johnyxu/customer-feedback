import type { ChangeEvent } from 'react'
import { I18N_KEYS } from '@i18n/keys'
import { useI18n } from '@i18n/useI18n'

type UploadBoxProps = {
  files: File[]
  onFilesChange: (files: File[]) => void
}

export function UploadBox({ files, onFilesChange }: UploadBoxProps) {
  const { t } = useI18n()

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFiles = Array.from(event.target.files ?? [])
    onFilesChange(nextFiles)
  }

  return (
    <label className="block border-[1.5px] border-dashed border-gray-300 rounded-xl bg-gray-50 py-[18px] px-3.5 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-colors">
      <input
        type="file"
        accept="image/png,image/jpeg,video/mp4"
        className="hidden"
        multiple
        onChange={handleFileChange}
      />
      <div className="text-2xl text-gray-400 mb-1.5">☁</div>
      <p className="m-0 text-xs text-gray-500 leading-relaxed">
        {t(I18N_KEYS.UPLOAD_HELP_1)}
        <br />
        {t(I18N_KEYS.UPLOAD_HELP_2)}
      </p>
      {files.length > 0 && (
        <p className="m-0 mt-2 text-xs text-gray-600 leading-relaxed break-all">
          {files.length} file(s): {files.map(file => file.name).join(', ')}
        </p>
      )}
    </label>
  )
}
