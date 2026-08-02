import { UploadCloud, Database, Workflow, Rocket, Cpu, PlayCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface PipelineStage {
  id: string;
  icon: LucideIcon;
  /** Short label rendered on the 3D node */
  label: string;
  /** Infrastructure this step runs on */
  tag: string;
  title: string;
  description: string;
  /** Position on the 880x360 ground plane, in plane-local px */
  x: number;
  y: number;
}

/**
 * Single source of truth for the pipeline: both the animated 3D flow and the
 * explainer cards render from this array, so the two can never drift apart.
 * Mirrors the real end-to-end path described in CLAUDE.md.
 */
export const pipelineStages: PipelineStage[] = [
  {
    id: "upload",
    icon: UploadCloud,
    label: "Upload",
    tag: "Frontend",
    title: "Presigned upload",
    description: "Your browser PUTs the file directly to S3 — the raw bytes never touch our servers.",
    x: 150,
    y: 70,
  },
  {
    id: "object",
    icon: Database,
    label: "Object stored",
    tag: "S3 + EventBridge",
    title: "Object lands in S3",
    description: "An S3 event confirms the upload and the video row moves to QUEUED.",
    x: 440,
    y: 70,
  },
  {
    id: "queue",
    icon: Workflow,
    label: "Queued",
    tag: "Amazon SQS",
    title: "Queued for capacity",
    description: "Jobs wait in SQS so bursts of uploads never overwhelm the worker fleet.",
    x: 730,
    y: 70,
  },
  {
    id: "launch",
    icon: Rocket,
    label: "Task launched",
    tag: "Lambda Launcher",
    title: "Fargate task launched",
    description: "A Lambda checks running task count and starts an ECS Fargate task within capacity.",
    x: 730,
    y: 265,
  },
  {
    id: "transcode",
    icon: Cpu,
    label: "Transcode",
    tag: "ECS Fargate (ARM64)",
    title: "FFmpeg transcodes",
    description: "Five quality tiers (1440p → 360p) are encoded into HLS segments + a master playlist.",
    x: 440,
    y: 265,
  },
  {
    id: "deliver",
    icon: PlayCircle,
    label: "Stream",
    tag: "Signed playback",
    title: "Stream anywhere",
    description: "Outputs land in the processed bucket; we mint short-lived URLs for adaptive playback.",
    x: 150,
    y: 265,
  },
];

/** Plane dimensions the stage coordinates above are authored against. */
export const PLANE_WIDTH = 880;
export const PLANE_HEIGHT = 360;
