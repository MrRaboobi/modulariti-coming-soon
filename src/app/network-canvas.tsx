"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

type Node = { x: number; y: number; vx: number; vy: number; s: number };

const NODE_COUNT = 24;
const LINK_DIST = 140;

export function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let frame = 0;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        s: Math.random() * 3 + 2,
      }));
    }

    function step() {
      ctx!.clearRect(0, 0, width, height);
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = width + 20;
        if (n.x > width + 20) n.x = -20;
        if (n.y < -20) n.y = height + 20;
        if (n.y > height + 20) n.y = -20;
      }
      for (let a = 0; a < nodes.length; a++) {
        for (let b = a + 1; b < nodes.length; b++) {
          const dx = nodes[a].x - nodes[b].x;
          const dy = nodes[a].y - nodes[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const op = (1 - dist / LINK_DIST) * 0.35;
            ctx!.strokeStyle = `rgba(140,140,220,${op.toFixed(3)})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(nodes[a].x, nodes[a].y);
            ctx!.lineTo(nodes[b].x, nodes[b].y);
            ctx!.stroke();
          }
        }
      }
      nodes.forEach((n, k) => {
        ctx!.fillStyle = k % 2 === 0 ? "rgba(124,108,245,0.85)" : "rgba(52,224,196,0.85)";
        ctx!.beginPath();
        ctx!.roundRect(n.x - n.s / 2, n.y - n.s / 2, n.s, n.s, 1.5);
        ctx!.fill();
      });
    }

    function loop() {
      step();
      if (!reduceMotion) frame = requestAnimationFrame(loop);
    }

    function handleResize() {
      resize();
      makeNodes();
      if (reduceMotion) step();
    }

    resize();
    makeNodes();
    if (reduceMotion) {
      step();
    } else {
      frame = requestAnimationFrame(loop);
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className={styles.bgCanvas} aria-hidden="true" />;
}
