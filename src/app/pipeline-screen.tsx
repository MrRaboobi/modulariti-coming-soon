"use client";

import { MotionValue, motion, useTransform } from "motion/react";
import { usePrefersReducedMotion } from "./use-reduced-motion";

const VIOLET = "#a99dff";
const CYAN = "#7dfae4";
const TEXT = "#f2f0f9";
const TEXT_DIM = "#9a97b3";
const TEXT_FAINT = "#6a6782";
const LINE = "#2c2942";

type Block = { id: string; x: number; y: number; w: number; h: number; accent: string; label: string };

const BLOCKS: Block[] = [
  { id: "doc", x: 150, y: 470, w: 280, h: 120, accent: VIOLET, label: "Document Extraction" },
  { id: "rag", x: 620, y: 330, w: 220, h: 110, accent: CYAN, label: "RAG" },
  { id: "vec", x: 620, y: 560, w: 220, h: 110, accent: VIOLET, label: "Vector DB" },
  { id: "grd", x: 1050, y: 440, w: 260, h: 120, accent: CYAN, label: "Guardrails" },
];

const CONNECTORS = [
  { from: "doc", to: "rag", d: "M430,530 C520,530 520,385 620,385" },
  { from: "doc", to: "vec", d: "M430,530 C520,530 520,615 620,615" },
  { from: "rag", to: "grd", d: "M840,385 C940,385 940,500 1050,500" },
  { from: "vec", to: "grd", d: "M840,615 C940,615 940,500 1050,500" },
];

// Stage windows over the macbook section's scroll progress (0-1).
const BOUNDARY = [0.14, 0.24];
const BLOCK_BASE = 0.25;
const BLOCK_STEP = 0.03;
const BLOCK_DUR = 0.07;
const FLOW = [0.42, 0.56];
const STATUS = [0.52, 0.6];

function useEntrance(progress: MotionValue<number>, [start, end]: [number, number]) {
  return useTransform(progress, [start, end], [0, 1]);
}

function BlockNode({
  block,
  progress,
  index,
}: {
  block: Block;
  progress: MotionValue<number>;
  index: number;
}) {
  const start = BLOCK_BASE + index * BLOCK_STEP;
  const t = useTransform(progress, [start, start + BLOCK_DUR], [0, 1]);
  const opacity = t;
  const y = useTransform(t, [0, 1], [14, 0]);
  const scale = useTransform(t, [0, 1], [0.94, 1]);

  return (
    <g transform={`translate(${block.x},${block.y})`}>
      <motion.g style={{ opacity, y, scale }}>
        <rect width={block.w} height={block.h} rx="16" fill="#171528" stroke={LINE} />
        <rect x="20" y="20" width="14" height="14" rx="4" fill={block.accent} />
        <text x="44" y="32" fontFamily="var(--font-mono)" fontSize="15" fill={TEXT} fontWeight={500}>
          {block.label}
        </text>
        <rect x="20" y={block.h - 34} width={block.w - 40} height="6" rx="3" fill="#241f38" />
        <rect x="20" y={block.h - 34} width={(block.w - 40) * 0.62} height="6" rx="3" fill={block.accent} opacity="0.55" />
      </motion.g>
    </g>
  );
}

function Connector({
  path,
  progress,
  index,
}: {
  path: string;
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
      strokeWidth="2"
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
      <path d="M2 4h50a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H24l-12 12V40H2a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4Z" transform="translate(2,0)" />
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

  const boundaryT = useEntrance(progress, BOUNDARY as [number, number]);
  const boundaryScale = useTransform(boundaryT, [0, 1], [0.97, 1]);

  const flowT = useEntrance(progress, FLOW as [number, number]);
  const dotOpacity = useTransform(progress, [FLOW[0], FLOW[0] + 0.02, FLOW[1] - 0.03, FLOW[1]], [0, 1, 1, 0]);
  const dotCx = useTransform(progress, [FLOW[0], FLOW[0] + 0.03, FLOW[0] + 0.06, FLOW[0] + 0.1, FLOW[1]], [130, 430, 620, 1050, 1370]);
  const dotCy = useTransform(progress, [FLOW[0], FLOW[0] + 0.03, FLOW[0] + 0.06, FLOW[0] + 0.1, FLOW[1]], [530, 530, 385, 500, 500]);

  const statusT = useEntrance(progress, STATUS as [number, number]);
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
      <rect width="1600" height="56" fill="#100e1c" />
      <rect y="55" width="1600" height="1" fill="#211f33" />
      <circle cx="28" cy="28" r="6" fill="#332f4a" />
      <circle cx="50" cy="28" r="6" fill="#332f4a" />
      <circle cx="72" cy="28" r="6" fill="#332f4a" />
      <text x="800" y="33" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" letterSpacing="1.5" fill={TEXT_FAINT}>
        MODULARITI &#183; CANVAS
      </text>

      {/* boundary: "your environment" */}
      <motion.g style={{ opacity: boundaryT, scale: boundaryScale, transformOrigin: "800px 600px" }}>
        <rect x="70" y="100" width="1460" height="1010" rx="28" fill="none" stroke="#3a3560" strokeWidth="2" strokeDasharray="3 10" strokeLinecap="round" />
        <text x="102" y="148" fontFamily="var(--font-mono)" fontSize="14" letterSpacing="2" fill={TEXT_FAINT}>
          YOUR ENVIRONMENT
        </text>
        <g transform="translate(1478,124)">
          <LockIcon />
        </g>

        {/* containment glow, loops continuously once flow begins */}
        {!reducedMotion && (
          <motion.rect
            x="70"
            y="100"
            width="1460"
            height="1010"
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
      {CONNECTORS.map((c, i) => (
        <Connector key={`${c.from}-${c.to}`} path={c.d} progress={progress} index={i} />
      ))}
      {BLOCKS.map((b, i) => (
        <BlockNode key={b.id} block={b} progress={progress} index={i} />
      ))}

      {/* input document */}
      <motion.g style={{ opacity: flowT }} transform="translate(96,503)">
        <DocIcon />
      </motion.g>

      {/* output answer */}
      <motion.g style={{ opacity: flowT }} transform="translate(1350,458)">
        <AnswerIcon />
      </motion.g>

      {/* traveling data packet */}
      {!reducedMotion && (
        <motion.circle r="9" fill={CYAN} style={{ opacity: dotOpacity, cx: dotCx, cy: dotCy }} />
      )}

      {/* status */}
      <motion.g style={{ opacity: statusT, y: statusY }}>
        <g transform="translate(102,1046)">
          <circle cx="8" cy="8" r="6" fill="#34e0c4" className={reducedMotion ? undefined : "pipeline-status-blink"} />
          <text x="26" y="13" fontFamily="var(--font-mono)" fontSize="15" fontWeight={600} fill={TEXT}>
            Running locally
          </text>
          <text x="26" y="34" fontFamily="var(--font-mono)" fontSize="12" fill={TEXT_FAINT}>
            0 bytes left your network
          </text>
        </g>
      </motion.g>
    </svg>
  );
}
