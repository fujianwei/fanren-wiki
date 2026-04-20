"use client";

import React, { createContext, useContext, useReducer } from "react";
import type { GameState, GameAction, SpiritRoot } from "@/types/game";
import { getRealmConfig, calcXpGain } from "@/lib/game/engine";
import itemsData from "@/content/game/items.json";

const REALM_ORDER = ["lianqi", "zhuji", "jiedan", "yuanying", "huashen"] as const;
type RealmOrderSlug = typeof REALM_ORDER[number];

function nextRealm(current: string): RealmOrderSlug | null {
  const idx = REALM_ORDER.indexOf(current as RealmOrderSlug);
  return idx >= 0 && idx < REALM_ORDER.length - 1 ? REALM_ORDER[idx + 1] : null;
}

function createInitialState(spiritRoot: SpiritRoot, fortune: number): GameState {
  const realm = getRealmConfig("lianqi");
  return {
    fortune,
    spiritRoot,
    realmSlug: "lianqi",
    xp: 0,
    lifespan: realm.normalLifespan,
    lifespanMax: realm.normalLifespan,
    lingshi: 0,
    inventory: {},
    injury: "none",
    sectPath: null,
    emotion: { positive: 0, negative: 0 },
    enemies: [],
    fate: 50,
    rootIntact: true,
    rootDamageCount: 0,
    breakthroughExp: 0,
    phase: "playing",
    endingType: null,
    eventHistory: [],
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return createInitialState(action.spiritRoot, action.fortune);

    case "CONSUME_LIFESPAN": {
      const newLifespan = Math.max(0, state.lifespan - action.years);
      if (newLifespan === 0) {
        return { ...state, lifespan: 0, phase: "ended", endingType: "natural" };
      }
      return { ...state, lifespan: newLifespan };
    }

    case "ADD_XP": {
      const gained = calcXpGain(action.points, state.spiritRoot.cultivationMult, state.xp);
      return { ...state, xp: Math.min(100, state.xp + gained) };
    }

    case "ADD_LINGSHI":
      return { ...state, lingshi: Math.max(0, state.lingshi + action.amount) };

    case "ADD_ITEM": {
      const current = state.inventory[action.itemId] ?? 0;
      return {
        ...state,
        inventory: { ...state.inventory, [action.itemId]: current + action.count },
      };
    }

    case "USE_ITEM": {
      const count = state.inventory[action.itemId] ?? 0;
      if (count <= 0) return state;
      const item = (itemsData as Array<{ id: string; effect: { type: string; amount?: number } }>).find(
        (i) => i.id === action.itemId
      );
      if (!item) return state;

      let next: GameState = {
        ...state,
        inventory: { ...state.inventory, [action.itemId]: count - 1 },
      };

      const effect = item.effect;
      if (effect.type === "heal_injury") {
        next = { ...next, injury: "none" };
      } else if (effect.type === "add_xp" && effect.amount != null) {
        const gained = calcXpGain(effect.amount, state.spiritRoot.cultivationMult, state.xp);
        next = { ...next, xp: Math.min(100, state.xp + gained) };
      } else if (effect.type === "add_xp_flat" && effect.amount != null) {
        next = { ...next, xp: Math.min(100, state.xp + effect.amount) };
      } else if (effect.type === "add_lifespan" && effect.amount != null) {
        const realm = getRealmConfig(state.realmSlug);
        const newMax = Math.min(realm.limitLifespan, state.lifespanMax + effect.amount);
        const newLifespan = Math.min(newMax, state.lifespan + effect.amount);
        next = { ...next, lifespan: newLifespan, lifespanMax: newMax };
      } else if (effect.type === "clear_emotion") {
        next = { ...next, emotion: { ...state.emotion, negative: 0 } };
      }
      return next;
    }

    case "REMOVE_ITEM": {
      const count = state.inventory[action.itemId] ?? 0;
      if (count <= 0) return state;
      return {
        ...state,
        inventory: { ...state.inventory, [action.itemId]: count - 1 },
      };
    }

    case "SET_INJURY": {
      if (action.level === "dying") {
        const xuming = state.inventory["xuming_dan"] ?? 0;
        if (xuming > 0) {
          return {
            ...state,
            injury: "heavy",
            rootIntact: false,
            rootDamageCount: state.rootDamageCount + 1,
            inventory: { ...state.inventory, xuming_dan: xuming - 1 },
          };
        }
        return { ...state, phase: "ended", endingType: "death_battle" };
      }
      return { ...state, injury: action.level };
    }

    case "ADD_EMOTION": {
      const pos = Math.min(100, Math.max(0, state.emotion.positive + action.positive));
      const neg = Math.min(100, Math.max(0, state.emotion.negative + action.negative));
      return { ...state, emotion: { positive: pos, negative: neg } };
    }

    case "ADD_ENEMY":
      return { ...state, enemies: [...state.enemies, action.enemy] };

    case "REMOVE_ENEMY":
      return { ...state, enemies: state.enemies.filter((e) => e.id !== action.enemyId) };

    case "RECORD_EVENT":
      return { ...state, eventHistory: [...state.eventHistory, action.eventId] };

    case "ATTEMPT_BREAKTHROUGH":
      return { ...state, phase: "breakthrough" };

    case "BREAKTHROUGH_SUCCESS": {
      const next = nextRealm(state.realmSlug);
      if (!next) {
        return { ...state, phase: "ended", endingType: "ascend" };
      }
      const newRealm = getRealmConfig(next);
      return {
        ...state,
        realmSlug: next,
        xp: 0,
        lifespanMax: newRealm.normalLifespan,
        lifespan: newRealm.normalLifespan,
        breakthroughExp: 0,
        phase: "playing",
      };
    }

    case "BREAKTHROUGH_FAIL": {
      const exp = Math.min(15, state.breakthroughExp + 3);
      return { ...state, breakthroughExp: exp, phase: "playing" };
    }

    case "END_GAME":
      return { ...state, phase: "ended", endingType: action.endingType };

    case "SET_SECT_PATH":
      return { ...state, sectPath: action.sectPath };

    case "APPLY_MODAO_PENALTY": {
      // 魔道寿命上限-15%
      const newMax = Math.round(state.lifespanMax * 0.85);
      const newLifespan = Math.min(state.lifespan, newMax);
      return { ...state, lifespanMax: newMax, lifespan: newLifespan };
    }

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextValue | null>(null);

const PLACEHOLDER_STATE: GameState = {
  fortune: 50,
  spiritRoot: { type: "san", name: "三灵根", cultivationMult: 1.0, fortuneRange: [51, 80] },
  realmSlug: "lianqi",
  xp: 0,
  lifespan: 100,
  lifespanMax: 100,
  lingshi: 0,
  inventory: {},
  injury: "none",
  sectPath: null,
  emotion: { positive: 0, negative: 0 },
  enemies: [],
  fate: 50,
  rootIntact: true,
  rootDamageCount: 0,
  breakthroughExp: 0,
  phase: "gate",
  endingType: null,
  eventHistory: [],
};

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, PLACEHOLDER_STATE);
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
