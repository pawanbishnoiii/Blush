import { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/upload";
import { cn } from "@/lib/utils";

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

export function Area({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold transition-colors",
        checked ? "border-transparent bg-success text-success-foreground" : "border-border bg-card",
      )}
    >
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          checked ? "bg-success-foreground" : "bg-muted-foreground/50",
        )}
      />
      {label}
    </button>
  );
}

/** Upload button + progress bar + direct URL entry. */
export function ImageUploader({
  bucket,
  folder,
  label = "Add image",
  multiple = false,
  onDone,
}: {
  bucket: string;
  folder?: string;
  label?: string;
  multiple?: boolean;
  onDone: (urls: string[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [url, setUrl] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const out: string[] = [];
    const total = files.length;
    try {
      for (let i = 0; i < total; i++) {
        const file = files[i]!;
        const signed = await uploadFile(
          bucket,
          file,
          (pct) => setProgress(Math.round(((i + pct / 100) / total) * 100)),
          folder,
        );
        out.push(signed);
      }
      onDone(out);
      toast.success(total > 1 ? `${total} images uploaded` : "Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-border bg-background/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={progress !== null}
          className="rounded-full bg-secondary px-4 py-2 text-[11px] font-bold text-secondary-foreground disabled:opacity-60"
        >
          {progress !== null ? `Uploading ${progress}%` : label}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        <span className="text-[11px] text-muted-foreground">or paste a direct URL</span>
      </div>

      {progress !== null && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="mt-2 flex gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className="min-w-0 flex-1 rounded-full border border-border bg-card px-3 py-2 text-xs outline-none"
        />
        <button
          type="button"
          onClick={() => {
            const v = url.trim();
            if (!v) return;
            onDone([v]);
            setUrl("");
          }}
          className="shrink-0 rounded-full border border-border px-3 py-2 text-[11px] font-bold"
        >
          Add URL
        </button>
      </div>
    </div>
  );
}
