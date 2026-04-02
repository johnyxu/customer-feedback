export type Locale = 'zh-CN' | 'zh-Hant' | 'en'

export const messages: Record<Locale, Record<string, string>> = {
  'zh-CN': {
    'nav.title': '反馈建议',
    'nav.back': '返回上一页',
    'nav.switchLanguage': '切换语言',
    'nav.languagePickerTitle': '选择语言',
    'nav.languagePickerCancel': '取消',
    'locale.zh-CN': '简体中文',
    'locale.zh-Hant': '繁體中文',
    'locale.en': 'English',
    'hero.title': '告诉我们你的想法',
    'hero.description': '无论是功能建议、体验问题，还是 Bug 反馈，我们都会认真阅读并持续优化产品。',
    'hero.sla': '通常 1-3 个工作日内回复',

    'section.feedbackType': '反馈类型',
    'section.detail': '详细描述',
    'section.rating': '满意度评分',
    'section.attachments': '附件（可选）',
    'section.contact': '联系方式（可选）',
    'section.otherChannels': '其他反馈渠道',

    'feedback.type.bug': '问题反馈',
    'feedback.type.feature': '功能建议',
    'feedback.type.experience': '体验优化',
    'feedback.type.other': '其他',

    'detail.label': '请尽可能详细地描述问题或建议',
    'detail.placeholder': '例如：在统计页面切换月份时，图表会短暂闪烁。希望可以优化切换动画。',
    'detail.tip': '建议包含：出现位置、操作步骤、预期结果。',

    'rating.1': '当前评分：1 分（非常不满意）',
    'rating.2': '当前评分：2 分（不太满意）',
    'rating.3': '当前评分：3 分（一般）',
    'rating.4': '当前评分：4 分（满意）',
    'rating.5': '当前评分：5 分（非常满意）',

    'upload.help.1': '上传截图或录屏可帮助我们更快定位问题',
    'upload.help.2': '支持 PNG/JPG/MP4，单个文件不超过 20MB',

    'contact.inputLabel': '邮箱或微信号',
    'contact.placeholder': '留下联系方式，便于我们跟进反馈进度',
    'contact.allow': '我同意客服通过上述联系方式联系我，仅用于处理本次反馈，不会用于营销推广。',

    'channel.email.label': '邮箱支持',
    'channel.email.value': 'support@xiaozhu.app',
    'channel.time.label': '工作时间',
    'channel.time.value': '工作日 09:00-18:00',

    'submit.button': '提交反馈',
    'submit.success': '反馈已提交，感谢你的建议！',
  },
  'zh-Hant': {
    'nav.title': '反饋建議',
    'nav.back': '返回上一頁',
    'nav.switchLanguage': '切換語言',
    'nav.languagePickerTitle': '選擇語言',
    'nav.languagePickerCancel': '取消',
    'locale.zh-CN': '簡體中文',
    'locale.zh-Hant': '繁體中文',
    'locale.en': 'English',
    'hero.title': '告訴我們你的想法',
    'hero.description': '無論是功能建議、體驗問題，還是 Bug 反饋，我們都會認真閱讀並持續優化產品。',
    'hero.sla': '通常 1-3 個工作日內回覆',

    'section.feedbackType': '反饋類型',
    'section.detail': '詳細描述',
    'section.rating': '滿意度評分',
    'section.attachments': '附件（可選）',
    'section.contact': '聯絡方式（可選）',
    'section.otherChannels': '其他反饋管道',

    'feedback.type.bug': '問題反饋',
    'feedback.type.feature': '功能建議',
    'feedback.type.experience': '體驗優化',
    'feedback.type.other': '其他',

    'detail.label': '請盡可能詳細地描述問題或建議',
    'detail.placeholder': '例如：在統計頁面切換月份時，圖表會短暫閃爍。希望可以優化切換動畫。',
    'detail.tip': '建議包含：出現位置、操作步驟、預期結果。',

    'rating.1': '目前評分：1 分（非常不滿意）',
    'rating.2': '目前評分：2 分（不太滿意）',
    'rating.3': '目前評分：3 分（一般）',
    'rating.4': '目前評分：4 分（滿意）',
    'rating.5': '目前評分：5 分（非常滿意）',

    'upload.help.1': '上傳截圖或錄影可幫助我們更快定位問題',
    'upload.help.2': '支援 PNG/JPG/MP4，單個檔案不超過 20MB',

    'contact.inputLabel': '信箱或微信號',
    'contact.placeholder': '留下聯絡方式，便於我們跟進反饋進度',
    'contact.allow': '我同意客服透過上述聯絡方式聯繫我，僅用於處理本次反饋，不會用於行銷推廣。',

    'channel.email.label': '信箱支援',
    'channel.email.value': 'support@xiaozhu.app',
    'channel.time.label': '工作時間',
    'channel.time.value': '工作日 09:00-18:00',

    'submit.button': '提交反饋',
    'submit.success': '反饋已提交，感謝你的建議！',
  },
  en: {
    'nav.title': 'Feedback',
    'nav.back': 'Go back',
    'nav.switchLanguage': 'Switch language',
    'nav.languagePickerTitle': 'Choose language',
    'nav.languagePickerCancel': 'Cancel',
    'locale.zh-CN': 'Simplified Chinese',
    'locale.zh-Hant': 'Traditional Chinese',
    'locale.en': 'English',
    'hero.title': 'Tell us what you think',
    'hero.description':
      'Whether it is a feature idea, UX issue, or bug report, we read every message and keep improving the product.',
    'hero.sla': 'We usually reply within 1-3 business days',

    'section.feedbackType': 'Feedback Type',
    'section.detail': 'Details',
    'section.rating': 'Satisfaction Rating',
    'section.attachments': 'Attachment (Optional)',
    'section.contact': 'Contact (Optional)',
    'section.otherChannels': 'Other Channels',

    'feedback.type.bug': 'Bug Report',
    'feedback.type.feature': 'Feature Request',
    'feedback.type.experience': 'UX Improvement',
    'feedback.type.other': 'Other',

    'detail.label': 'Please describe your issue or suggestion in detail',
    'detail.placeholder':
      'Example: The chart briefly flickers when switching months on the statistics page. It would be great to optimize this transition.',
    'detail.tip': 'Helpful info: where it happened, steps to reproduce, and expected result.',

    'rating.1': 'Current rating: 1 (Very Dissatisfied)',
    'rating.2': 'Current rating: 2 (Dissatisfied)',
    'rating.3': 'Current rating: 3 (Neutral)',
    'rating.4': 'Current rating: 4 (Satisfied)',
    'rating.5': 'Current rating: 5 (Very Satisfied)',

    'upload.help.1': 'Upload a screenshot or screen recording to help us investigate faster',
    'upload.help.2': 'Supports PNG/JPG/MP4, up to 20MB per file',

    'contact.inputLabel': 'Email or WeChat ID',
    'contact.placeholder': 'Leave your contact so we can follow up on your feedback',
    'contact.allow':
      'I agree that support may contact me using the information above only for this feedback case and not for marketing.',

    'channel.email.label': 'Email Support',
    'channel.email.value': 'support@xiaozhu.app',
    'channel.time.label': 'Working Hours',
    'channel.time.value': 'Weekdays 09:00-18:00',

    'submit.button': 'Submit Feedback',
    'submit.success': 'Feedback submitted. Thank you for helping us improve!',
  },
}
