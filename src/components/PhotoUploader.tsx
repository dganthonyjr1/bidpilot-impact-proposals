import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, X, ImagePlus } from "lucide-react";
import { toast } from "sonner";

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  prefix?: string;
  max?: number;
};

export function PhotoUploader({ value, onChange, prefix = "intake", max = 8 }: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (value.length + files.length > max) {
      toast.error(`Max ${max} photos`);
      return;
    }
    setUploading(true);
    const next: string[] = [];
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const folder = user?.id || "anon";
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} is not an image`);
          continue;
        }
        if (file.size > 8 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 8 MB`);
          continue;
        }
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${folder}/${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await supabase.storage.from("job-photos").upload(path, file, {
          cacheControl: "31536000",
          upsert: false,
          contentType: file.type,
        });
        if (error) { toast.error(error.message); continue; }
        const { data: pub } = supabase.storage.from("job-photos").getPublicUrl(path);
        next.push(pub.publicUrl);
      }
      onChange([...value, ...next]);
    } finally {
      setUploading(false);
    }
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        {value.map((url) => (
          <div key={url} className="relative aspect-square rounded-md overflow-hidden border border-border group">
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <label className="aspect-square flex flex-col items-center justify-center gap-1 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-primary transition text-muted-foreground text-xs">
            <ImagePlus className="h-5 w-5" />
            <span>{uploading ? "Uploading…" : "Add"}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Up to {max} job-site photos (JPG/PNG, max 8 MB each). Shown on the proposal page and PDF.</p>
    </div>
  );
}