"use client";
/**
 * Mixer React context. Used by provider, injector, and hooks.
 */

import { createContext } from "react";
import type { MixerContextValue } from "./types";

export const MixerContext = createContext<MixerContextValue | null>(null);
