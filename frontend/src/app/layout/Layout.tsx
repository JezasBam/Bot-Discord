import { useEffect, useRef, useState, type ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface LayoutProps {
  sidebar: ReactNode;
  editor: ReactNode;
  preview: ReactNode;
}

function readStoredBool(key: string, fallback: boolean) {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    return raw === "1" || raw === "true";
  } catch {
    return fallback;
  }
}

function readStoredNumber(key: string, fallback: number) {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function Layout({ sidebar, editor, preview }: LayoutProps) {
  const [sidebarHidden, setSidebarHidden] = useState(() =>
    readStoredBool("layout.sidebarHidden", false),
  );
  const [previewWidth, setPreviewWidth] = useState(() =>
    readStoredNumber("layout.previewWidth", 560),
  );
  const resizeRef = useRef<{ startX: number; startW: number } | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        "layout.sidebarHidden",
        sidebarHidden ? "1" : "0",
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [sidebarHidden]);

  useEffect(() => {
    try {
      window.localStorage.setItem("layout.previewWidth", String(previewWidth));
    } catch {
      // Ignore localStorage errors
    }
  }, [previewWidth]);

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      const s = resizeRef.current;
      if (!s) return;
      const dx = s.startX - e.clientX;
      setPreviewWidth(clamp(s.startW + dx, 360, 900));
    };

    const handleUp = () => {
      resizeRef.current = null;
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="h-12 flex items-center justify-between px-3 bg-discord-dark border-b border-discord-light">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarHidden((v) => !v)}
            className="h-8 px-2 rounded bg-discord-lighter border border-discord-light hover:bg-discord-light text-discord-text flex items-center gap-2"
            title={sidebarHidden ? "Show Discord panel" : "Hide Discord panel"}
          >
            {sidebarHidden ? (
              <PanelLeftOpen size={16} />
            ) : (
              <PanelLeftClose size={16} />
            )}
            <span className="text-sm">Discord Panel</span>
          </button>
          <span className="text-sm text-discord-muted truncate">
            Embed Builder
          </span>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Projects */}
        <aside
          className={`flex-shrink-0 bg-discord-dark overflow-hidden transition-all duration-200 ${
            sidebarHidden
              ? "w-0 border-r-0"
              : "w-64 border-r border-discord-light"
          }`}
        >
          {!sidebarHidden && <div className="h-full">{sidebar}</div>}
        </aside>

        {/* Main content */}
        <main className="flex-1 flex overflow-hidden bg-discord-bg">
          {/* Editor */}
          <section className="flex-1 overflow-y-auto p-4">{editor}</section>

          {/* Preview */}
          <div
            role="separator"
            aria-orientation="vertical"
            onPointerDown={(e) => {
              resizeRef.current = { startX: e.clientX, startW: previewWidth };
              (e.currentTarget as HTMLDivElement).setPointerCapture(
                e.pointerId,
              );
            }}
            className="w-1 cursor-col-resize bg-discord-light/40 hover:bg-discord-light"
            title="Drag to resize preview"
          />
          <aside
            style={{ width: `${previewWidth}px` }}
            className="flex-shrink-0 border-l border-discord-light overflow-y-auto p-4"
          >
            {preview}
          </aside>
        </main>
      </div>
    </div>
  );
}
