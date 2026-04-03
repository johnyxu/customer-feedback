import type { I18nKey } from '../keys'

export const enMessages: Record<I18nKey, string> = {
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

  'common.loading': 'Loading...',
  'common.loadFailedRetry': 'Failed to load. Please try again later',

  'feedback.status.new': 'Pending',
  'feedback.status.reviewed': 'In Progress',
  'feedback.status.replied': 'Admin Replied',
  'feedback.status.resolved': 'Resolved',
  'feedback.type.experienceIssue': 'Experience Issue',

  'detail.page.title': 'Feedback Details',

  'entry.sendCodeFailed': 'Failed to send verification code. Please try again',
  'entry.hero.title': 'Start feedback fast and track progress in real time',
  'entry.hero.desc': 'Enter your email to receive updates, or continue anonymously.',
  'entry.section.title': 'Start Feedback',
  'entry.section.desc':
    'We will send a one-time code to verify your identity, then you can continue and track admin replies.',
  'entry.email.label': 'Email Address',
  'entry.email.hint.empty': 'Please enter a commonly used email to receive progress updates.',
  'entry.email.hint.valid': 'Email format looks good. You can continue.',
  'entry.email.hint.invalid': 'Invalid email format. Please check and try again.',
  'entry.next.verify': 'Next: Verify Email',
  'entry.anon.title': 'Anonymous Feedback',
  'entry.anon.desc':
    'Anonymous feedback will still be handled, but progress may be slower without a verifiable contact method.',
  'entry.anon.continue': 'Continue Anonymously',
  'entry.anon.selected': 'Anonymous mode selected. You will not receive updates by email later.',
  'entry.sending': 'Sending...',

  'list.title': 'My Feedback',
  'list.empty': 'No feedback records yet',
  'list.overview': 'Feedback Overview',
  'list.repliedSummarySuffix': 'items have been replied to or resolved',
  'list.viewDetail': 'View Details ›',

  'verify.page.title': 'Verify Email',
  'verify.sent.title': 'Verification code has been sent to your email',
  'verify.sent.desc':
    'Please enter the 6-digit code within 10 minutes. After verification, you can continue feedback and receive admin replies.',
  'verify.email.label': 'Email',
  'verify.code.label': 'Verification Code',
  'verify.hint.valid': 'Code format is valid. You can continue.',
  'verify.hint.paste': 'Pasting a 6-digit code is supported.',
  'verify.submit': 'Verify and Continue',
  'verify.submitting': 'Verifying...',
  'verify.notReceived': 'Did not receive the email?',
  'verify.resend': 'Resend Code',
  'verify.resendAfterSuffix': 'until resend',
  'verify.error.invalidCode': 'Invalid or expired code. Please request a new one',

  'followup.sendFailed': 'Failed to send. Please try again later',
  'followup.title': 'Continue Follow-up',
  'followup.placeholder': 'Enter additional details or follow-up questions…',
  'followup.uploading': 'Uploading',
  'followup.shortcut': '⌘ + Enter to send quickly',
  'followup.send': 'Send',
  'followup.sending': 'Sending…',

  'message.role.customerShort': 'Me',
  'message.role.adminShort': 'CS',
  'message.role.customerName': 'Me',
  'message.role.supportName': 'Xiaozhu Support',

  'date.justNow': 'just now',
  'date.minutesAgo': 'minutes ago',
  'date.hoursAgo': 'hours ago',
  'date.yesterday': 'yesterday',
  'date.daysAgo': 'days ago',
}
