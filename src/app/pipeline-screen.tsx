"use client";

import { useSyncExternalStore } from "react";
import { MotionValue, motion, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "./use-reduced-motion";

const BLUE = "#2075ff";
const BLUE_DEEP = "#0b47a8";
const TEAL = "#07752f";
const TEXT = "#051524";
const TEXT_DIM = "#445062";
const TEXT_FAINT = "#6b7280";
const LINE = "#e5e9f0";
const LINE_STRONG = "#cbd2dd";

// Stage windows over the macbook section's scroll progress (0-1).
const BOUNDARY: [number, number] = [0.12, 0.22];
const BLOCK_BASE = 0.24;
const BLOCK_STEP = 0.03;
const BLOCK_DUR = 0.07;
const FLOW: [number, number] = [0.44, 0.64];
const STATUS: [number, number] = [0.6, 0.7];

type Block = { id: string; x: number; y: number; w: number; h: number; accent: string; label: string };

type Layout = {
  chrome: { h: number; dotR: number; dotY: number; dotXs: [number, number, number]; titleSize: number; titleY: number };
  boundary: { x: number; y: number; w: number; h: number };
  boundaryLabel: { x: number; y: number; size: number };
  lock: { x: number; y: number; scale: number };
  blockStyle: {
    accent: number;
    accentX: number;
    accentY: number;
    labelX: number;
    labelY: number;
    labelSize: number;
    barInset: number;
    barBottom: number;
    barH: number;
  };
  blocks: Block[];
  connectors: string[];
  input: { x: number; y: number; scale: number };
  output: { x: number; y: number; scale: number };
  dot: { r: number; t: number[]; x: number[]; y: number[] };
  status: {
    x: number;
    y: number;
    dotR: number;
    titleX: number;
    titleY: number;
    titleSize: number;
    subY: number;
    subSize: number;
  };
};

const DESKTOP: Layout = {
  chrome: { h: 84, dotR: 11, dotY: 42, dotXs: [48, 84, 120], titleSize: 24, titleY: 50 },
  boundary: { x: 80, y: 200, w: 1460, h: 890 },
  boundaryLabel: { x: 116, y: 262, size: 26 },
  lock: { x: 1432, y: 226, scale: 1.7 },
  blockStyle: {
    accent: 24,
    accentX: 32,
    accentY: 30,
    labelX: 74,
    labelY: 52,
    labelSize: 28,
    barInset: 32,
    barBottom: 48,
    barH: 10,
  },
  blocks: [
    { id: "doc", x: 210, y: 520, w: 420, h: 150, accent: BLUE, label: "Document Extraction" },
    { id: "rag", x: 700, y: 350, w: 330, h: 140, accent: BLUE_DEEP, label: "RAG" },
    { id: "vec", x: 700, y: 620, w: 330, h: 140, accent: BLUE, label: "Vector DB" },
    { id: "grd", x: 1100, y: 480, w: 330, h: 150, accent: BLUE_DEEP, label: "Guardrails" },
  ],
  connectors: [
    "M630,595 C665,595 665,420 700,420",
    "M630,595 C665,595 665,690 700,690",
    "M1030,420 C1065,420 1065,555 1100,555",
    "M1030,690 C1065,690 1065,555 1100,555",
  ],
  input: { x: 112, y: 552, scale: 1.6 },
  output: { x: 1448, y: 522, scale: 1.3 },
  dot: {
    r: 14,
    t: [0, 0.21, 0.43, 0.71, 1],
    x: [185, 630, 700, 1100, 1470],
    y: [595, 595, 420, 555, 555],
  },
  status: { x: 116, y: 968, dotR: 11, titleX: 46, titleY: 24, titleSize: 28, subY: 62, subSize: 22 },
};

// Phones paint this SVG about 366px wide, so desktop type would land near 3px.
// The mobile layout trades the branching graph for a legible vertical chain.
const MOBILE: Layout = {
  chrome: { h: 96, dotR: 15, dotY: 48, dotXs: [56, 106, 156], titleSize: 36, titleY: 60 },
  boundary: { x: 60, y: 150, w: 1480, h: 960 },
  boundaryLabel: { x: 104, y: 224, size: 42 },
  lock: { x: 1394, y: 178, scale: 2 },
  blockStyle: {
    accent: 42,
    accentX: 34,
    accentY: 30,
    labelX: 96,
    labelY: 64,
    labelSize: 48,
    barInset: 34,
    barBottom: 46,
    barH: 12,
  },
  blocks: [
    { id: "doc", x: 420, y: 246, w: 760, h: 140, accent: BLUE, label: "Document Extraction" },
    { id: "rag", x: 420, y: 436, w: 760, h: 140, accent: BLUE_DEEP, label: "RAG" },
    { id: "vec", x: 420, y: 626, w: 760, h: 140, accent: BLUE, label: "Vector DB" },
    { id: "grd", x: 420, y: 816, w: 760, h: 140, accent: BLUE_DEEP, label: "Guardrails" },
  ],
  connectors: ["M800,386 L800,436", "M800,576 L800,626", "M800,766 L800,816"],
  input: { x: 168, y: 260, scale: 2.1 },
  output: { x: 1240, y: 840, scale: 1.9 },
  dot: {
    r: 20,
    t: [0, 0.2, 0.4, 0.6, 0.8, 1],
    x: [232, 800, 800, 800, 800, 1300],
    y: [316, 316, 506, 696, 886, 886],
  },
  status: { x: 104, y: 986, dotR: 15, titleX: 46, titleY: 27, titleSize: 42, subY: 78, subSize: 32 },
};

function subscribeToViewport(callback: () => void) {
  window.addEventListener("resize", callback);
  return () => window.removeEventListener("resize", callback);
}

function useLayout() {
  const isNarrow = useSyncExternalStore(
    subscribeToViewport,
    () => window.innerWidth < 768,
    () => false,
  );
  return isNarrow ? MOBILE : DESKTOP;
}

function useEntrance(progress: MotionValue<number>, [start, end]: [number, number]) {
  return useTransform(progress, [start, end], [0, 1]);
}

function BlockNode({
  block,
  style,
  progress,
  index,
}: {
  block: Block;
  style: Layout["blockStyle"];
  progress: MotionValue<number>;
  index: number;
}) {
  const start = BLOCK_BASE + index * BLOCK_STEP;
  const t = useTransform(progress, [start, start + BLOCK_DUR], [0, 1]);
  const y = useTransform(t, [0, 1], [14, 0]);
  const scale = useTransform(t, [0, 1], [0.94, 1]);
  const barW = block.w - style.barInset * 2;

  return (
    <g transform={`translate(${block.x},${block.y})`}>
      <motion.g style={{ opacity: t, y, scale }}>
        <rect
          width={block.w}
          height={block.h}
          rx="14"
          fill="#ffffff"
          stroke={LINE}
          filter="url(#pipeline-card-shadow)"
        />
        <rect
          x={style.accentX}
          y={style.accentY}
          width={style.accent}
          height={style.accent}
          rx={style.accent / 3}
          fill={block.accent}
        />
        <text
          x={style.labelX}
          y={style.labelY}
          fontFamily="var(--stack-sans)"
          fontSize={style.labelSize}
          fill={TEXT}
          fontWeight={500}
        >
          {block.label}
        </text>
        <rect
          x={style.barInset}
          y={block.h - style.barBottom}
          width={barW}
          height={style.barH}
          rx={style.barH / 2}
          fill="#eef2f7"
        />
        <rect
          x={style.barInset}
          y={block.h - style.barBottom}
          width={barW * 0.62}
          height={style.barH}
          rx={style.barH / 2}
          fill={block.accent}
          opacity="0.55"
        />
      </motion.g>
    </g>
  );
}

function Connector({
  path,
  width,
  progress,
  index,
}: {
  path: string;
  width: number;
  progress: MotionValue<number>;
  index: number;
}) {
  const start = BLOCK_BASE + (2 + index) * BLOCK_STEP;
  const pathLength = useTransform(progress, [start, start + BLOCK_DUR], [0, 1]);
  return (
    <motion.path
      d={path}
      fill="none"
      stroke={BLUE}
      strokeOpacity="0.55"
      strokeWidth={width}
      style={{ pathLength }}
    />
  );
}

function DocIcon() {
  return (
    <g stroke={TEXT_DIM} strokeWidth="2" fill="none" strokeLinejoin="round">
      <rect x="0" y="0" width="42" height="54" rx="4" />
      <path d="M10 16h22M10 27h22M10 38h14" strokeLinecap="round" />
    </g>
  );
}

function AnswerIcon() {
  return (
    <g stroke={BLUE} strokeWidth="2" fill="none" strokeLinejoin="round">
      <path
        d="M2 4h50a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H24l-12 12V40H2a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z"
        transform="translate(2,0)"
      />
      <path d="M14 18h28M14 27h18" strokeLinecap="round" opacity="0.7" />
    </g>
  );
}

function LockIcon() {
  return (
    <g stroke={TEXT_FAINT} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="18" width="28" height="20" rx="4" />
      <path d="M10 18v-6a8 8 0 0 1 16 0v6" />
    </g>
  );
}

export function PipelineScreen({ progress }: { progress: MotionValue<number> }) {
  const reducedMotion = usePrefersReducedMotion();
  const layout = useLayout();
  const { chrome, boundary, boundaryLabel, lock, status, dot } = layout;

  const boundaryT = useEntrance(progress, BOUNDARY);
  const boundaryScale = useTransform(boundaryT, [0, 1], [0.97, 1]);

  const flowT = useEntrance(progress, FLOW);
  const flowSpan = FLOW[1] - FLOW[0];
  const dotStops = dot.t.map((f) => FLOW[0] + f * flowSpan);
  const dotOpacity = useTransform(
    progress,
    [FLOW[0], FLOW[0] + 0.02, FLOW[1] - 0.03, FLOW[1]],
    [0, 1, 1, 0],
  );
  const dotCx = useTransform(progress, dotStops, dot.x);
  const dotCy = useTransform(progress, dotStops, dot.y);

  const statusT = useEntrance(progress, STATUS);
  const statusY = useTransform(statusT, [0, 1], [10, 0]);

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1600 1200"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="pipeline-bg" cx="30%" cy="6%" r="92%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#fbfcfe" />
          <stop offset="100%" stopColor="#f3f6fa" />
        </radialGradient>
        <filter id="pipeline-card-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#051524" floodOpacity="0.12" />
        </filter>
      </defs>

      <rect width="1600" height="1200" fill="url(#pipeline-bg)" />

      {/* top chrome */}
      <rect width="1600" height={chrome.h} fill="#f7f9fc" />
      <rect y={chrome.h - 1} width="1600" height="1" fill={LINE} />
      {chrome.dotXs.map((cx) => (
        <circle key={cx} cx={cx} cy={chrome.dotY} r={chrome.dotR} fill={LINE_STRONG} />
      ))}
      <text
        x="800"
        y={chrome.titleY}
        textAnchor="middle"
        fontFamily="var(--stack-sans)"
        fontSize={chrome.titleSize}
        letterSpacing={chrome.titleSize * 0.12}
        fill={TEXT_FAINT}
      >
        MODULARITI &#183; CANVAS
      </text>

      {/* boundary: "your environment" */}
      <motion.g style={{ opacity: boundaryT, scale: boundaryScale, transformOrigin: "800px 600px" }}>
        <rect
          x={boundary.x}
          y={boundary.y}
          width={boundary.w}
          height={boundary.h}
          rx="28"
          fill="none"
          stroke={LINE_STRONG}
          strokeWidth="2"
          strokeDasharray="3 10"
          strokeLinecap="round"
        />
        <text
          x={boundaryLabel.x}
          y={boundaryLabel.y}
          fontFamily="var(--stack-sans)"
          fontSize={boundaryLabel.size}
          letterSpacing={boundaryLabel.size * 0.14}
          fill={TEXT_FAINT}
        >
          YOUR ENVIRONMENT
        </text>
        <g transform={`translate(${lock.x},${lock.y}) scale(${lock.scale})`}>
          <LockIcon />
        </g>

        {/* containment glow, loops continuously once flow begins */}
        {!reducedMotion && (
          <motion.rect
            x={boundary.x}
            y={boundary.y}
            width={boundary.w}
            height={boundary.h}
            rx="28"
            fill="none"
            stroke={BLUE}
            strokeWidth="3"
            strokeOpacity="0.45"
            style={{ opacity: flowT }}
            className="pipeline-contain-pulse"
          />
        )}
      </motion.g>

      {/* blocks + connectors */}
      {layout.connectors.map((d, i) => (
        <Connector key={d} path={d} width={layout === MOBILE ? 4 : 2} progress={progress} index={i} />
      ))}
      {layout.blocks.map((b, i) => (
        <BlockNode key={b.id} block={b} style={layout.blockStyle} progress={progress} index={i} />
      ))}

      {/* input document */}
      <motion.g
        style={{ opacity: flowT }}
        transform={`translate(${layout.input.x},${layout.input.y}) scale(${layout.input.scale})`}
      >
        <DocIcon />
      </motion.g>

      {/* output answer */}
      <motion.g
        style={{ opacity: flowT }}
        transform={`translate(${layout.output.x},${layout.output.y}) scale(${layout.output.scale})`}
      >
        <AnswerIcon />
      </motion.g>

      {/* traveling data packet */}
      {!reducedMotion && (
        <motion.circle r={dot.r} fill={BLUE} style={{ opacity: dotOpacity, cx: dotCx, cy: dotCy }} />
      )}

      {/* status */}
      <motion.g style={{ opacity: statusT, y: statusY }}>
        <g transform={`translate(${status.x},${status.y})`}>
          <circle
            cx={status.dotR}
            cy={status.dotR}
            r={status.dotR}
            fill={TEAL}
            className={reducedMotion ? undefined : "pipeline-status-blink"}
          />
          <text
            x={status.titleX}
            y={status.titleY + status.dotR}
            fontFamily="var(--stack-sans)"
            fontSize={status.titleSize}
            fontWeight={600}
            fill={TEXT}
          >
            Running locally
          </text>
          <text
            x={status.titleX}
            y={status.subY + status.dotR}
            fontFamily="var(--stack-mono)"
            fontSize={status.subSize}
            fill={TEXT_FAINT}
          >
            0 bytes left your network
          </text>
        </g>
      </motion.g>
    </svg>
  );
}
