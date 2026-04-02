import { SIGNED_UPLOAD_PATH } from '../constants/routes'
import { buildApiUrl, buildHeaders } from './client'

export type AttachmentPayload = {
  url: string
  filename: string
  size: number
}

export async function getSignedUploadUrl(
  filename: string,
  contentType: string,
  size: number,
): Promise<{ uploadUrl: string; fileUrl: string; requiredHeaders?: Record<string, string> }> {
  const response = await fetch(buildApiUrl(SIGNED_UPLOAD_PATH), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ filename, contentType: contentType || 'application/octet-stream', size }),
  })
  if (!response.ok) throw new Error(`Failed to get signed url: ${response.status}`)
  return response.json()
}

export async function uploadFileToCloudStorage(
  file: File,
  onProgress?: (loaded: number, total: number) => void,
): Promise<AttachmentPayload> {
  const signed = await getSignedUploadUrl(file.name, file.type, file.size)

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', signed.uploadUrl, true)
    xhr.timeout = 10 * 60 * 1000

    const headers = {
      'Content-Type': file.type || 'application/octet-stream',
      ...(signed.requiredHeaders ?? {}),
    }
    for (const [key, value] of Object.entries(headers)) {
      xhr.setRequestHeader(key, value)
    }

    xhr.upload.onprogress = event => {
      if (event.lengthComputable) onProgress?.(event.loaded, event.total)
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(file.size, file.size)
        resolve()
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`))
      }
    }
    xhr.onerror = () => reject(new Error('Upload failed: network error'))
    xhr.ontimeout = () => reject(new Error('Upload failed: timeout'))
    xhr.send(file)
  })

  return { url: signed.fileUrl, filename: file.name, size: file.size }
}

export async function uploadFiles(
  files: File[],
  onProgress?: (currentFileIndex: number, loaded: number, total: number) => void,
): Promise<AttachmentPayload[]> {
  const attachments: AttachmentPayload[] = []
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0)
  let uploadedBytesBeforeCurrent = 0

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const attachment = await uploadFileToCloudStorage(file, (loaded, total) => {
      if (totalBytes === 0) return
      onProgress?.(i, uploadedBytesBeforeCurrent + Math.min(loaded, total), totalBytes)
    })
    attachments.push(attachment)
    uploadedBytesBeforeCurrent += file.size
  }

  return attachments
}
