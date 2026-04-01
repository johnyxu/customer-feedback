import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { LocaleSwitcher } from "../../components/ui/LocaleSwitcher";
import {
  getFeedbackThread,
  submitFollowUp,
  uploadFiles,
  clearSessionToken,
  type AttachmentPayload,
  type FeedbackThread,
  type FeedbackMessage,
} from "../../api/feedbackService";
import { UploadBox } from "./components/UploadBox";

function formatTime(input: string): string {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return input;
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function statusBadge(status: string): { label: string; cls: string } {
  if (status === "replied") return { label: "管理员已回复", cls: "bg-emerald-50 text-emerald-700" };
  if (status === "processing") return { label: "处理中", cls: "bg-amber-50 text-amber-700" };
  if (status === "resolved") return { label: "已解决", cls: "bg-slate-100 text-slate-700" };
  return { label: "待处理", cls: "bg-blue-50 text-blue-600" };
}

const TYPE_LABEL: Record<string, string> = {
  bug: "问题反馈",
  feature: "功能建议",
  experience: "体验问题",
  other: "其他",
};

export function FeedbackDetailPage() {
  const navigate = useNavigate();
  const { feedbackId: feedbackIdParam } = useParams<{ feedbackId: string }>();
  const location = useLocation();
  const state = location.state as {
    feedback?: { id: string; title: string; status: string };
  } | null;

  const [thread, setThread] = useState<FeedbackThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyText, setReplyText] = useState("");
  const [replyFiles, setReplyFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const bottomRef = useRef<HTMLDivElement>(null);

  const feedbackId = feedbackIdParam ?? state?.feedback?.id ?? '';

  useEffect(() => {
    if (!feedbackId) {
      setError("缺少反馈 ID，请从列表页重新进入");
      setLoading(false);
      return;
    }
    let cancelled = false;
    getFeedbackThread(feedbackId)
      .then((data) => {
        if (!cancelled) setThread(data);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        if (err.message.includes("401")) {
          clearSessionToken();
          navigate("/");
          return;
        }
        setError("加载失败，请稍后重试");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [feedbackId, navigate]);

  // 新消息加载后滚动到底部
  useEffect(() => {
    if (!loading && thread) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [loading, thread]);

  async function handleSubmitFollowUp() {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    setUploadProgress(0);
    try {
      let attachments: AttachmentPayload[] = [];
      if (replyFiles.length > 0) {
        attachments = await uploadFiles(replyFiles, (_idx, loaded, total) => {
          if (total > 0) setUploadProgress(Math.round((loaded / total) * 100));
        });
      }
      await submitFollowUp(feedbackId, replyText.trim(), attachments);
      const updated = await getFeedbackThread(feedbackId);
      setThread(updated);
      setReplyText("");
      setReplyFiles([]);
      setUploadProgress(0);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setSubmitError("发送失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  }

  const messages: FeedbackMessage[] = thread
    ? [...thread.messages].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))
    : [];

  const badge = thread ? statusBadge(thread.status) : null;

  return (
    <div className="min-h-screen bg-[#f5f5f7] font-sans text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 pb-2 pt-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/feedback/list")}
            className="h-9 w-9 rounded-full bg-slate-100 text-slate-600"
            aria-label="back"
          >
            ‹
          </button>
          <h1 className="font-bold">反馈详情</h1>
          <LocaleSwitcher />
        </div>
      </header>

      <main className="space-y-3 px-4 py-4">
        {loading && <p className="py-10 text-center text-sm text-slate-400">加载中…</p>}

        {!loading && error && <p className="py-10 text-center text-sm text-red-500">{error}</p>}

        {!loading && !error && thread && (
          <>
            {/* 跟进回复输入框（卡片内容上方） */}
            <section className="rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
              <p className="mb-2 text-xs font-semibold text-slate-500">继续跟进回复</p>
              {submitError && <p className="mb-1 text-xs text-red-500">{submitError}</p>}
              <textarea
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="输入补充说明或追问…"
                className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-indigo-500 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmitFollowUp();
                }}
              />
              <div className="mt-2">
                <UploadBox files={replyFiles} onFilesChange={setReplyFiles} />
              </div>
              {submitting && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-[10px] text-slate-400">上传中 {uploadProgress}%</p>
                </div>
              )}
              <div className="mt-3 flex items-center justify-between">
                <p className="text-[10px] text-slate-400">⌘ + Enter 快速发送</p>
                <button
                  type="button"
                  disabled={!replyText.trim() || submitting}
                  onClick={handleSubmitFollowUp}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-40"
                >
                  {submitting ? "发送中…" : "发送"}
                </button>
              </div>
            </section>

            {/* 反馈概要卡片（含首条内容 + 附件） */}
            {(() => {
              const firstMsg = messages.find((m) => m.sender === "customer");
              const firstImages =
                firstMsg?.attachments.filter((a) => /\.(png|jpe?g|gif|webp)$/i.test(a.filename)) ??
                [];
              return (
                <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">#{thread.id}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {TYPE_LABEL[thread.type] ?? thread.type} · ⭐ {thread.rating}
                      </p>
                    </div>
                    {badge && (
                      <span
                        className={[
                          "shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold",
                          badge.cls,
                        ].join(" ")}
                      >
                        {badge.label}
                      </span>
                    )}
                  </div>
                  {firstMsg && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      {firstMsg.content}
                    </p>
                  )}
                  {firstImages.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {firstImages.map((att) => (
                        <a key={att.id} href={att.url} target="_blank" rel="noreferrer">
                          <img
                            src={att.url}
                            alt={att.filename}
                            className="h-36 w-full rounded-xl object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </section>
              );
            })()}

            {/* 处理进展时间线 */}
            <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <h3 className="text-sm font-bold">处理进展</h3>
              <ol className="mt-3 space-y-3 text-sm">
                {(() => {
                  const adminMsgs = messages.filter((m) => m.sender === "admin");
                  const lastAdmin = adminMsgs[adminMsgs.length - 1];
                  const firstCustomer = messages.find((m) => m.sender === "customer");
                  type Item = {
                    key: string;
                    title: string;
                    detail?: string;
                    time: string;
                    dotCls: string;
                  };
                  const items: Item[] = [];
                  if (lastAdmin) {
                    items.push({
                      key: "admin-replied",
                      title: "管理员已回复",
                      detail: lastAdmin.content,
                      time: formatTime(lastAdmin.createdAt),
                      dotCls: "bg-emerald-500",
                    });
                  }
                  if (adminMsgs.length > 0) {
                    items.push({
                      key: "assigned",
                      title: "系统：反馈已分配给客服",
                      time: formatTime(adminMsgs[0].createdAt),
                      dotCls: "bg-indigo-500",
                    });
                  }
                  if (firstCustomer) {
                    items.push({
                      key: "created",
                      title: "你提交了反馈",
                      time: formatTime(firstCustomer.createdAt),
                      dotCls: "bg-slate-300",
                    });
                  }
                  return items.map((item) => (
                    <li key={item.key} className="flex gap-3">
                      <span
                        className={["mt-1 h-2.5 w-2.5 shrink-0 rounded-full", item.dotCls].join(
                          " ",
                        )}
                      />
                      <div>
                        <p className="font-medium">{item.title}</p>
                        {item.detail && (
                          <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
                        )}
                        <p className="mt-1 text-[11px] text-slate-400">{item.time}</p>
                      </div>
                    </li>
                  ));
                })()}
              </ol>
            </section>

            {/* 管理员回复卡片（最新一条） */}
            {(() => {
              const lastAdmin = [...messages].reverse().find((m) => m.sender === "admin");
              if (!lastAdmin) return null;
              return (
                <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <h3 className="text-sm font-bold">管理员回复</h3>
                  <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                        客
                      </div>
                      <div>
                        <p className="text-sm font-semibold">小竹客服</p>
                        <p className="text-[11px] text-slate-500">
                          {formatTime(lastAdmin.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700">{lastAdmin.content}</p>
                  </div>
                </section>
              );
            })()}

            {/* 客户追问记录（第2条消息起） */}
            {messages.filter((m) => m.sender === "customer").length > 1 && (
              <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <h3 className="text-sm font-bold">你的追问</h3>
                <div className="mt-3 space-y-3">
                  {messages
                    .filter((m) => m.sender === "customer")
                    .slice(1)
                    .map((msg) => (
                      <div key={msg.id} className="rounded-xl bg-slate-50 p-3">
                        <p className="text-sm leading-relaxed text-slate-700">{msg.content}</p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    ))}
                </div>
              </section>
            )}

            <div ref={bottomRef} />
          </>
        )}
      </main>
    </div>
  );
}
