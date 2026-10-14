"use client";

import { useEffect, useState } from "react";
import { getClient } from "@/lib/supabase";

export default function AppBackground() {
  const [backgroundUrls, setBackgroundUrls] = useState<Array<string | null>>([null, null, null]);

  useEffect(() => {
    const loadBackground = async () => {
      try {
        const { data } = await getClient()
          .from("settings")
          .select("background_url_1, background_url_2, background_url_3")
          .eq("id", 1)
          .single();

        if (data) {
          setBackgroundUrls([
            data.background_url_1 ?? null,
            data.background_url_2 ?? null,
            data.background_url_3 ?? null,
          ]);
        }
      } catch {
        // Ignore missing or empty fields until the user configures a collage.
      }
    };

    loadBackground();
    const onBackgroundUpdate = () => loadBackground();
    window.addEventListener("background-updated", onBackgroundUpdate);

    return () => {
      window.removeEventListener("background-updated", onBackgroundUpdate);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-30 overflow-hidden">
      {backgroundUrls.filter(Boolean).length > 0 ? (
        backgroundUrls.map((url, index) =>
          url ? (
            <img
              key={`${url}-${index}`}
              src={url}
              alt="Background collage"
              className="absolute inset-x-0 w-full object-cover blur-[8px]"
              style={{
                top: `${index * 33.333}vh`,
                left: 0,
                height: "33.333vh",
                width: "100vw",
              }}
            />
          ) : null
        )
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_rgba(15,23,42,0.75)_42%,_rgba(2,6,23,0.95)_100%)]" />
      )}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
}
