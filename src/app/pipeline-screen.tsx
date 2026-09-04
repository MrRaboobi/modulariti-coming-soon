"use client";

import { useSyncExternalStore } from "react";
import { MotionValue, motion, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "./use-reduced-motion";

const VIOLET = "#a99dff";
const CYAN = "#7dfae4";
const TEXT = "#f2f0f9";
const TEXT_DIM = "#9a97b3";
const TEXT_FAINT = "#6a6782";
const LINE = "#2c2942";

// Stage windows over the macbook section's scroll progress (0-1).
const BOUNDARY: [number, number] = [0.14, 0.24];
const BLOCK_BASE = 0.25;
const BLOCK_STEP = 0.03;
const BLOCK_DUR = 0.07;
const FLOW: [number, number] = [0.42, 0.56];
const STATUS: [number, number] = [0.52, 0.6];

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
  chrome: { h: 56, dotR: 6, dotY: 28, dotXs: [28, 50, 72], titleSize: 13, titleY: 33 },
  boundary: { x: 70, y: 100, w: 1460, h: 1010 },
  boundaryLabel: { x: 102, y: 148, size: 14 },
  lock: { x: 1478, y: 124, scale: 1 },
  blockStyle: {
    accent: 14,
    accentX: 20,
    accentY: 20,
    labelX: 44,
    labelY: 32,
    labelSize: 15,
    barInset: 20,
    barBottom: 34,
    barH: 6,
  },
  blocks: [
    { id: "doc", x: 150, y: 470, w: 280, h: 120, accent: VIOLET, label: "Document Extraction" },
    { id: "rag", x: 620, y: 330, w: 220, h: 110, accent: CYAN, label: "RAG" },
    { id: "vec", x: 620, y: 560, w: 220, h: 110, accent: VIOLET, label: "Vector DB" },
    { id: "grd", x: 1050, y: 440, w: 260, h: 120, accent: CYAN, label: "Guardrails" },
  ],
  connectors: [
    "M430,530 C520,530 520,385 620,385",
    "M430,530 C520,530 520,615 620,615",
    "M840,385 C940,385 940,500 1050,500",
    "M840,615 C940,615 940,500 1050,500",
  ],
  input: { x: 96, y: 503, scale: 1 },
  output: { x: 1350, y: 458, scale: 1 },
  dot: {
    r: 9,
    t: [0, 0.21, 0.43, 0.71, 1],
    x: [130, 430, 620, 1050, 1370],
    y: [530, 530, 385, 500, 500],
  },
  status: { x: 102, y: 1046, dotR: 6, titleX: 26, titleY: 13, titleSize: 15, subY: 34, subSize: 12 },
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
    { id: "doc", x: 420, y: 246, w: 760, h: 140, accent: VIOLET, label: "Document Extraction" },
    { id: "rag", x: 420, y: 436, w: 760, h: 140, accent: CYAN, label: "RAG" },
    { id: "vec", x: 420, y: 626, w: 760, h: 140, accent: VIOLET, label: "Vector DB" },
    { id: "grd", x: 420, y: 816, w: 760, h: 140, accent: CYAN, label: "Guardrails" },
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
        <rect width={block.w} height={block.h} rx="16" fill="#171528" stroke={LINE} />
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
          fontFamily="var(--font-mono)"
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
          fill="#241f38"
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
      stroke={CYAN}
      strokeOpacity="0.45"
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
    <g stroke={CYAN} strokeWidth="2" fill="none" strokeLinejoin="round">
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
        <radialGradient id="pipeline-bg" cx="30%" cy="10%" r="90%">
          <stop offset="0%" stopColor="#171331" />
          <stop offset="55%" stopColor="#0e0d1a" />
          <stop offset="100%" stopColor="#0a0a12" />
        </radialGradient>
      </defs>

      <rect width="1600" height="1200" fill="url(#pipeline-bg)" />

      {/* top chrome */}
      <rect width="1600" height={chrome.h} fill="#100e1c" />
      <rect y={chrome.h - 1} width="1600" height="1" fill="#211f33" />
      {chrome.dotXs.map((cx) => (
        <circle key={cx} cx={cx} cy={chrome.dotY} r={chrome.dotR} fill="#332f4a" />
      ))}
      <text
        x="800"
        y={chrome.titleY}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
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
          stroke="#3a3560"
          strokeWidth="2"
          strokeDasharray="3 10"
          strokeLinecap="round"
        />
        <text
          x={boundaryLabel.x}
          y={boundaryLabel.y}
          fontFamily="var(--font-mono)"
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
            stroke={CYAN}
            strokeWidth="3"
            strokeOpacity="0.4"
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
        <motion.circle r={dot.r} fill={CYAN} style={{ opacity: dotOpacity, cx: dotCx, cy: dotCy }} />
      )}

      {/* status */}
      <motion.g style={{ opacity: statusT, y: statusY }}>
        <g transform={`translate(${status.x},${status.y})`}>
          <circle
            cx={status.dotR}
            cy={status.dotR}
            r={status.dotR}
            fill="#34e0c4"
            className={reducedMotion ? undefined : "pipeline-status-blink"}
          />
          <text
            x={status.titleX}
            y={status.titleY + status.dotR}
            fontFamily="var(--font-mono)"
            fontSize={status.titleSize}
            fontWeight={600}
            fill={TEXT}
          >
            Running locally
          </text>
          <text
            x={status.titleX}
            y={status.subY + status.dotR}
            fontFamily="var(--font-mono)"
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
