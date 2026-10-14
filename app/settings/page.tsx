"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { getClient, Settings } from "@/lib/supabase";
import { format, parseISO } from "date-fns";
import { Check } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    required_hours: 486,
    start_date: "2026-07-13",
    personal_quote: "Every little step is a chapter in our story.",
    background_url_1: "",
    background_url_2: "",
    background_url_3: "",
    background_url: "",
  });
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState("");
  const [uploadingBackgroundSlot, setUploadingBackgroundSlot] = useState<number | null>(null);

  const load = useCallback(async () => {
    const { data } = await getClient().from("settings").select("*").eq("id", 1).single();
    if (data) setSettings(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleBackgroundUpload(slot: 1 | 2 | 3, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setError("");
    setUploadingBackgroundSlot(slot);

    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`"${file.name}" is too large. Please use an image under 10MB.`);
      }

      const bucketName = "app-backgrounds";
      const filePath = `backgrounds/slot-${slot}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const supabase = getClient();

      const { data: uploaded, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type || "image/jpeg",
        });

      if (uploadError) {
        if (uploadError.message.toLowerCase().includes("bucket") && uploadError.message.toLowerCase().includes("not found")) {
          throw new Error("Create a Supabase Storage bucket called app-backgrounds in your dashboard before uploading a background.");
        }
        throw new Error(uploadError.message);
      }

      const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(uploaded?.path || filePath);
      const nextBackgroundUrl = publicUrlData.publicUrl;
      const fieldName = `background_url_${slot}` as const;

      setSettings(current => ({
        ...current,
        [fieldName]: nextBackgroundUrl,
        background_url: current.background_url || nextBackgroundUrl,
      }));

      const { error: updateError } = await supabase
        .from("settings")
        .update({
          [fieldName]: nextBackgroundUrl,
          background_url: nextBackgroundUrl,
        } as never)
        .eq("id", 1);

      if (updateError) {
        throw new Error(updateError.message);
      }

      window.dispatchEvent(new Event("background-updated"));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Background upload failed");
    } finally {
      setUploadingBackgroundSlot(null);
      if (e.currentTarget) e.currentTarget.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    const { error } = await getClient()
      .from("settings")
      .update({
        required_hours: settings.required_hours,
        start_date: settings.start_date,
        personal_quote: settings.personal_quote || "Every little step is a chapter in our story.",
        background_url_1: settings.background_url_1 || "",
        background_url_2: settings.background_url_2 || "",
        background_url_3: settings.background_url_3 || "",
        background_url: settings.background_url || settings.background_url_1 || "",
      } as never)
      .eq("id", 1);
    if (error) {
      setError(error.message);
    } else {
      window.dispatchEvent(new Event("background-updated"));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted font-mono text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-xs font-mono text-muted mt-0.5">OJT parameters</p>
      </div>

      <form onSubmit={handleSave} className="bg-surface border border-border rounded-2xl p-5 space-y-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono text-muted uppercase tracking-wider">
            Required hours (target)
          </label>
          <input
            type="number"
            min={1}
            step={0.5}
            value={settings.required_hours}
            onChange={e => setSettings(s => ({ ...s, required_hours: parseFloat(e.target.value) }))}
            required
            className="input font-mono text-lg"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono text-muted uppercase tracking-wider">
            OJT start date
          </label>
          <input
            type="date"
            value={settings.start_date}
            onChange={e => setSettings(s => ({ ...s, start_date: e.target.value }))}
            required
            className="input font-mono"
          />
          <p className="text-xs text-muted mt-0.5">
            Currently set to {format(parseISO(settings.start_date), "MMMM d, yyyy")}
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono text-muted uppercase tracking-wider">
            Personal quote
          </label>
          <textarea
            value={settings.personal_quote || ""}
            onChange={e => setSettings(s => ({ ...s, personal_quote: e.target.value }))}
            rows={3}
            className="input font-medium resize-none"
            placeholder="Write something sweet for her"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-mono text-muted uppercase tracking-wider">
            Wallpaper collage
          </label>

          {[1, 2, 3].map(slot => (
            <div key={slot} className="space-y-2">
              <input
                id={`background-upload-${slot}`}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => handleBackgroundUpload(slot as 1 | 2 | 3, e)}
                className="hidden"
              />

              <label
                htmlFor={`background-upload-${slot}`}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm text-soft transition hover:border-accent/40 hover:text-accent"
              >
                {uploadingBackgroundSlot === slot ? "Uploading…" : ` ${slot===1?"Top Photo":slot===2?"Middle Photo":"Bottom Photo"}`}
              </label>

              {settings[`background_url_${slot}` as keyof Settings] && (
                <div className="overflow-hidden rounded-xl border border-border">
                  <img
                    src={settings[`background_url_${slot}` as keyof Settings] as string}
                    alt={`${slot===1?"Top":slot===2?"Middle":"Bottom"} photo preview`}
                    className="h-20 w-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}

          <p className="text-xs text-muted mt-0.5">
            These three images become a fixed full-screen collage behind the frosted-glass UI across the app.
          </p>
        </div>

        {error && <p className="text-danger text-sm">{error}</p>}

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          {saved ? <><Check size={14} /> Saved</> : saving ? "Saving…" : "Save settings"}
        </button>
      </form>

      <div className="bg-surface border border-border rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-semibold">About your data</h2>
        <p className="text-xs text-muted leading-relaxed">
          All session data is stored in your Supabase database. Nothing is saved locally in the browser.
          To back up your data, go to your Supabase dashboard → Table Editor → Export as CSV.
        </p>
      </div>
    </div>
  );
}
