"use client";

import { useState, useMemo } from "react";
import GameDialog from "./GameDialog";
import { useGame } from "./GameProvider";
import { ITEMS } from "@/lib/game/items";
import { shuffle } from "@/lib/game/random";
import type { ItemConfig, ItemId } from "@/types/game";

interface Props {
  onClose: () => void;
}

// 境界提升类：金色边框
// 超级稀有：整体金色
const ULTRA_RARE_ITEMS = new Set(["butian_dan", "jiuqu_dan", "tiangang_zhen", "xuming_dan"]);

export default function MarketModal({ onClose }: Props) {
  const { state, dispatch } = useGame();
  const { lingshi, inventory } = state;

  const shopItems = useMemo(() => {
    const buyable = ITEMS.filter((i) => i.buyPrice !== null);
    return shuffle(buyable, Math.random).slice(0, 3);
  }, []);

  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [message, setMessage] = useState<string | null>(null);

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  }

  function handleBuy(item: ItemConfig) {
    if (!item.buyPrice || lingshi < item.buyPrice) {
      showMessage("灵石不足");
      return;
    }
    dispatch({ type: "ADD_LINGSHI", amount: -item.buyPrice });
    dispatch({ type: "ADD_ITEM", itemId: item.id as ItemId, count: 1 });
    showMessage(`购得 ${item.name}`);
  }

  function handleSell(item: ItemConfig) {
    const count = inventory[item.id as ItemId] ?? 0;
    if (count <= 0 || !item.sellPrice) return;
    dispatch({ type: "ADD_LINGSHI", amount: item.sellPrice });
    dispatch({ type: "REMOVE_ITEM", itemId: item.id as ItemId });
    showMessage(`售出 ${item.name}，获得 ${item.sellPrice} 灵石`);
  }

  const sellableItems = ITEMS.filter(
    (i) => i.sellPrice !== null && (inventory[i.id as ItemId] ?? 0) > 0
  );

  return (
    <GameDialog label="灵市" onClose={onClose}>
      <div
        className="w-full p-4 sm:p-6"
        style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif font-bold" style={{ color: "#e8f0ec" }}>
            灵市
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{ color: "#4ade9a" }}>
              灵石 ×{lingshi}
            </span>
            <button onClick={onClose} className="text-sm" style={{ color: "#93ad9f" }}>
              关闭
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {(["buy", "sell"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-full text-sm transition-all"
              style={{
                backgroundColor: tab === t ? "#4ade9a" : "#1a2820",
                color: tab === t ? "#0a0e0d" : "#93ad9f",
              }}
            >
              {t === "buy" ? "购买" : "出售"}
            </button>
          ))}
        </div>

        {message && (
          <div role="status"
            className="text-sm text-center mb-3 py-2 rounded-lg"
            style={{ backgroundColor: "#1a2820", color: "#4ade9a" }}
          >
            {message}
          </div>
        )}

        {tab === "buy" && (
          <div className="flex flex-col gap-2">
            {shopItems.map((item) => {
              const isUltra = ULTRA_RARE_ITEMS.has(item.id);
              const isBreakthrough = item.category === "breakthrough";
              const canBuy = !!(item.buyPrice && lingshi >= item.buyPrice);

              const bg = isUltra ? "#1e1608" : "#1a2820";
              const border = isUltra ? "1px solid #d4a843aa" : isBreakthrough ? "1px solid #d4a84355" : "1px solid #2a3828";
              const shadow = isUltra ? "0 0 16px rgba(212,168,67,0.15)" : "none";
              const nameColor = isUltra ? "#e8c86a" : isBreakthrough ? "#d4a843" : "#e8f0ec";

              return (
                <div
                  key={item.id}
                  className="relative flex flex-wrap items-center justify-between gap-3 px-3 py-4 rounded-xl"
                  style={{ backgroundColor: bg, border, boxShadow: shadow }}
                >
                  {isUltra && (
                    <div
                      className="w-full text-right px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: "#d4a84333", color: "#d4a843", fontSize: "10px", lineHeight: 1.4 }}
                    >
                      ✦ 稀世
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium" style={{ color: nameColor }}>
                      {item.name}
                    </div>
                    <div className="text-sm mt-0.5" style={{ color: "#93ad9f" }}>
                      {item.description}
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuy(item)}
                    disabled={!canBuy}
                    className="ml-3 px-3 py-1 rounded-full text-sm whitespace-nowrap flex-shrink-0"
                    style={{
                      backgroundColor: canBuy ? (isUltra || isBreakthrough ? "#d4a843" : "#4ade9a") : "#1a2820",
                      color: canBuy ? "#0a0e0d" : "#8da998",
                      cursor: canBuy ? "pointer" : "not-allowed",
                    }}
                  >
                    {item.buyPrice} 灵石
                  </button>
                </div>
              );
            })}
            <p className="text-sm text-center mt-2" style={{ color: "#8da998" }}>
              每次进入市场随机展示3件商品
            </p>
          </div>
        )}

        {tab === "sell" && (
          <div className="flex flex-col gap-2">
            {sellableItems.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: "#8da998" }}>
                背包中没有可出售的道具
              </p>
            )}
            {sellableItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ backgroundColor: "#1a2820", border: "1px solid #2a3828" }}
              >
                <div>
                  <div className="text-sm font-medium" style={{ color: "#e8f0ec" }}>
                    {item.name} ×{inventory[item.id as ItemId]}
                  </div>
                </div>
                <button
                  onClick={() => handleSell(item)}
                  className="ml-3 px-3 py-1 rounded-full text-sm"
                  style={{
                    backgroundColor: "#1a2820",
                    color: "#4ade9a",
                    border: "1px solid #4ade9a44",
                  }}
                >
                  售出 {item.sellPrice}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </GameDialog>
  );
}
