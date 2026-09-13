import { useId } from "react";
import type { CSSProperties } from "react";
import type { SceneRegion } from "./sceneObjects";

// The foreground samples the exact same pixels as the room. The clip is explicit:
// viewBox + meet alone exposes adjacent atlas cells when the viewport is wider.
export function NativeObject({
  region,
  source = "archive",
  onOpen,
  active = false,
}: {
  region: SceneRegion;
  source?: "archive" | "lounge";
  onOpen: (id: string) => void;
  active?: boolean;
}) {
  const clip = useId();
  const width = source === "archive" ? 836 : 1672,
    height = source === "archive" ? 470.5 : 941;
  const x = (region.x / 100) * width,
    y = (region.y / 100) * height + (source === "archive" ? 470.5 : 0);
  const w = (region.w / 100) * width,
    h = (region.h / 100) * height;
  return (
    <button
      className={`native-object ${source === "archive" ? "native-drawer" : "native-player"} ${active ? "is-playing" : ""}`}
      aria-label={region.label}
      data-object={region.id}
      onClick={() => onOpen(region.panel)}
      style={
        {
          left: `${region.x}%`,
          top: `${region.y}%`,
          width: `${region.w}%`,
          height: `${region.h}%`,
        } as CSSProperties
      }
    >
      <svg
        viewBox={`${x} ${y} ${w} ${h}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clip}>
            <rect x={x} y={y} width={w} height={h} />
          </clipPath>
        </defs>
        <image
          clipPath={`url(#${clip})`}
          href={`./media/avg/${source === "archive" ? "scenes" : "room"}.webp`}
          width="1672"
          height="941"
        />
      </svg>
      <span className="native-label">{region.label}</span>
      {source === "lounge" && active && (
        <i className="native-led" aria-hidden="true" />
      )}
    </button>
  );
}
