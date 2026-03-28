import { useI18n } from '../../../i18n/useI18n'

export function UploadBox() {
  const { t } = useI18n()

  return (
    <label className="block border-[1.5px] border-dashed border-gray-300 rounded-xl bg-gray-50 py-[18px] px-3.5 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 transition-colors">
      <input type="file" accept="image/png,image/jpeg,video/mp4" className="hidden" />
      <div className="text-2xl text-gray-400 mb-1.5">☁</div>
      <p className="m-0 text-xs text-gray-500 leading-relaxed">
        {t('upload.help.1')}
        <br />
        {t('upload.help.2')}
      </p>
    </label>
  )
}
