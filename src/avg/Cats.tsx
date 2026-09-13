import { useEffect, useId, useRef, useState } from "react";
import { catRoutes } from "./world";
export function Sprite({
  index,
  className = "",
}: {
  index: number;
  className?: string;
}) {
  const clip = useId();
  const boxes = [
    [8, 35, 310, 297],
    [335, 43, 303, 287],
    [650, 61, 294, 267],
    [975, 111, 301, 218],
    [12, 350, 302, 293],
    [335, 360, 307, 282],
    [653, 365, 315, 280],
    [982, 451, 294, 193],
    [20, 678, 262, 244],
    [337, 674, 280, 247],
    [662, 674, 292, 247],
    [1009, 688, 251, 233],
    [16, 939, 283, 274],
    [326, 941, 297, 272],
    [650, 966, 290, 243],
    [970, 957, 300, 249],
  ];
  const extra = [
    [130, 145, 440, 460],
    [705, 255, 405, 358],
    [130, 690, 407, 467],
    [694, 690, 451, 467],
  ];
  const [x, y, width, height] =
    index >= 16 ? extra[index - 16] : boxes[index] || boxes[8];
  return (
    <svg
      aria-hidden="true"
      className={`avg-sprite ${className}`}
      viewBox={`${x} ${y} ${width} ${height}`}
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <clipPath id={clip}>
          <rect x={x} y={y} width={width} height={height} />
        </clipPath>
      </defs>
      <image
        clipPath={`url(#${clip})`}
        href={
          index >= 16
            ? "./media/avg/companion-states.webp"
            : "./media/avg/sprites.webp"
        }
        width={index >= 16 ? 1254 : 1278}
        height={index >= 16 ? 1254 : 1230}
      />
    </svg>
  );
}
function Cat({
  kind,
  onPet,
  still,
}: {
  kind: "white" | "blue";
  onPet: () => void;
  still: boolean;
}) {
  const route = catRoutes[kind];
  const [step, setStep] = useState(0);
  const [pet, setPet] = useState(false);
  const [petPosition, setPetPosition] = useState({ x: 0, y: 0 });
  const visited = useRef(new Set<number>());
  const [frame, setFrame] = useState(0);
  const position = route[step];
  useEffect(() => {
    visited.current.add(step);
    if (still || pet) return;
    const timer = setTimeout(
      () => setStep((s) => (s + 1) % route.length),
      position.duration * 1000,
    );
    return () => clearTimeout(timer);
  }, [step, pet, still, position.duration, route.length]);
  useEffect(() => {
    if (still || pet || !["walk", "jump"].includes(position.pose)) return;
    const timer = setInterval(() => setFrame((f) => 1 - f), 330);
    return () => clearInterval(timer);
  }, [position.pose, pet, still]);
  useEffect(() => {
    if (!pet) return;
    const timer = setTimeout(() => setPet(false), 1800);
    return () => clearTimeout(timer);
  }, [pet]);
  const offset = pet
    ? 2
    : position.pose === "sleep"
      ? 3
      : ["groom", "stretch"].includes(position.pose)
        ? 2
        : frame;
  return (
    <button
      aria-label={kind === "white" ? "摸摸蓝白猫" : "摸摸蓝猫"}
      data-cat={kind}
      data-step={step}
      data-visited={[...new Set([...visited.current, step])].join(",")}
      data-pose={pet ? "petted" : position.pose}
      className={`avg-cat ${pet ? "petted" : ""} ${position.pose === "jump" ? "jump" : ""}`}
      style={{
        left: `${pet ? petPosition.x : position.x}%`,
        top: `${pet ? petPosition.y : position.y}%`,
        zIndex: position.z ?? Math.round(position.y),
        transitionDuration:
          still || pet ? "0s" : `${Math.min(position.duration, 7)}s`,
        transform: `translate(-50%,-50%) scaleX(${position.flip ? -1 : 1})`,
      }}
      onClick={(event) => {
        const element = event.currentTarget;
        const parent = element.offsetParent as HTMLElement | null;
        const style = getComputedStyle(element);
        if (parent)
          setPetPosition({
            x: (parseFloat(style.left) / parent.clientWidth) * 100,
            y: (parseFloat(style.top) / parent.clientHeight) * 100,
          });
        setPet(true);
        onPet();
      }}
    >
      <Sprite index={(kind === "white" ? 0 : 4) + offset} />
      <span className="cat-heart">♥</span>
    </button>
  );
}
export function Cats({
  onPet,
  still,
}: {
  onPet: (kind: string) => void;
  still: boolean;
}) {
  return (
    <div className="avg-cats">
      <Cat kind="white" onPet={() => onPet("cat-white")} still={still} />
      <Cat kind="blue" onPet={() => onPet("cat-blue")} still={still} />
    </div>
  );
}
