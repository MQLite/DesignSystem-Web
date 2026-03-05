import { useRef, useState } from 'react'
import type { WizardState } from '../../types'
import { uploadSubject } from '../../api/client'

interface Props {
  state: WizardState
  update: (patch: Partial<WizardState>) => void
}

export default function Step5Subject({ state, update }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件（JPG / PNG / WEBP）')
      return
    }
    setError(null)
    setUploading(true)
    const localUrl = URL.createObjectURL(file)
    try {
      const res = await uploadSubject(file)
      update({ subjectAssetId: res.subjectAssetId, subjectPreviewUrl: localUrl })
    } catch (e) {
      setError((e as Error).message)
      URL.revokeObjectURL(localUrl)
    } finally {
      setUploading(false)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const reset = () => {
    update({ subjectAssetId: null, subjectPreviewUrl: null })
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="max-w-xl">
      <p className="text-gray-500 text-sm mb-6">
        上传主体照片（人物 / 团体照）。系统将自动抠图并融合至背景模板中。
      </p>

      {state.subjectPreviewUrl ? (
        /* Preview after upload */
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-6 flex items-start gap-5">
          <img
            src={state.subjectPreviewUrl}
            alt="主体预览"
            className="w-32 h-32 object-cover rounded-lg border border-indigo-200 flex-shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="font-medium text-gray-900">上传成功</span>
            </div>
            <p className="text-xs text-gray-400 font-mono mb-3">ID: {state.subjectAssetId}</p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 mb-4">
              PoC 阶段：抠图 &amp; 颜色调整功能待接入 AI 服务
            </div>
            <button
              onClick={reset}
              className="text-sm text-gray-500 underline hover:text-gray-700"
            >
              重新上传
            </button>
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-12 flex flex-col items-center justify-center text-center transition-colors ${
            dragging
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3 text-indigo-500">
              <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span className="text-sm font-medium">上传中…</span>
            </div>
          ) : (
            <>
              <svg
                className="w-12 h-12 text-gray-300 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="font-medium text-gray-700">拖放图片至此，或点击选择</p>
              <p className="text-sm text-gray-400 mt-1">支持 JPG · PNG · WEBP，最大 20 MB</p>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />

      {/* Adjustment controls placeholder */}
      {state.subjectPreviewUrl && (
        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="font-medium text-gray-800 mb-4 text-sm">颜色 &amp; 风格调整</h3>
          <div className="space-y-4 opacity-50 pointer-events-none">
            {['亮度', '对比度', '饱和度'].map((label) => (
              <div key={label} className="flex items-center gap-4">
                <span className="text-sm text-gray-600 w-16">{label}</span>
                <input type="range" min={-100} max={100} defaultValue={0} className="flex-1" />
                <span className="text-xs text-gray-400 w-8 text-right">0</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">* 调整功能在 PoC 阶段暂未实现</p>
        </div>
      )}
    </div>
  )
}
