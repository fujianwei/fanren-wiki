"use client";

import React, { createContext, useContext, useEffect, useReducer, useRef } from "react";
import { createInitialState, EMPTY_META, gameReducer, META_SCHEMA_VERSION } from "@/lib/game/reducer";
import type { GameAction, GameState, MetaState } from "@/types/game";

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);
const RUN_KEY = "fanren-wiki:run:v3";
const META_KEY = "fanren-wiki:meta:v3";

const PLACEHOLDER_STATE: GameState = {
  ...createInitialState(
    { type: "san", name: "三灵根", cultivationMult: 1.0, fortuneRange: [51, 80] },
    50,
    EMPTY_META
  ),
  phase: "gate",
};

function readMeta(): MetaState {
  try {
    const raw = window.localStorage.getItem(META_KEY);
    if (!raw) return EMPTY_META;
    const parsed = JSON.parse(raw) as MetaState;
    if (parsed?.schemaVersion !== META_SCHEMA_VERSION || !Array.isArray(parsed.lives)) return EMPTY_META;
    return parsed;
  } catch {
    return EMPTY_META;
  }
}

function readRun(): GameState | null {
  try {
    const raw = window.localStorage.getItem(RUN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { schemaVersion?: number; state?: GameState };
    if (parsed.schemaVersion !== META_SCHEMA_VERSION || !parsed.state) return null;
    return parsed.state;
  } catch {
    return null;
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, PLACEHOLDER_STATE);
  const hydratedRef = useRef(false);

  useEffect(() => {
    const meta = readMeta();
    const savedRun = readRun();
    if (savedRun && savedRun.phase !== "gate") {
      dispatch({
        type: "HYDRATE_RUN",
        state: {
          ...savedRun,
          meta: {
            ...meta,
            selectedObsession: savedRun.meta?.selectedObsession ?? meta.selectedObsession,
          },
        },
      });
    } else {
      dispatch({ type: "HYDRATE_RUN", state: { ...PLACEHOLDER_STATE, meta } });
    }
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    // Do not overwrite a saved run with the initial gate placeholder while
    // hydration is still being committed.
    if (state.phase === "gate") return;
    try {
      window.localStorage.setItem(RUN_KEY, JSON.stringify({ schemaVersion: META_SCHEMA_VERSION, state }));
      window.localStorage.setItem(META_KEY, JSON.stringify(state.meta));
    } catch {
      // Storage can be unavailable in private mode; the current session still works.
    }
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
