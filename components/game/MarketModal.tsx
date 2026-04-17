"use client";

import { useState, useMemo } from "react";
import { useGame } from "./GameProvider";
import itemsData from "@/content/game/items.json";
import type { ItemId } from "@/types/game";

interface Props {
  onClose: () => void;
}

interface ItemData {
  id: string;
  name: string;
  category: string;
  description: string;
  buyPrice: number | null;
  sellPrice: number | null;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MarketModal({ onClose }: Props) {
  const { state, dispatch } = useGame();
  const { lingshi, inventory } = state;

  const shopItems = useMemo(() => {
    const buyable = (itemsData as ItemData[]).filter((i) => i.buyPrice !== null);
    return shuffle(buyable).slice(0, 3);
  }, []);

  const [tab, setTab] = useState<"buy" | "sell">("buy");
  const [message, setMessage] = useState<string | null>(null);

  function showMessage(msg: string) {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2000);
  }

  function handleBuy(item: ItemData) {
    if (!item.buyPrice || lingshi < item.buyPrice) {
      showMessage("灵石不足");
      return;
    }
    dispatch({ type: "ADD_LINGSHI", amount: -item.buyPrice });
    dispatch({ type: "ADD_ITEM", itemId: item.id as ItemId, count: 1 });
    showMessage(`购得 ${item.name}`);
  }

  function handleSell(item: ItemData) {
    const count = inventory[item.id as ItemId] ?? 0;
    if (count <= 0 || !item.sellPrice) return;
    dispatch({ type: "ADD_LINGSHI", amount: item.sellPrice });
    dispatch({ type: "REMOVE_ITEM", itemId: item.id as ItemId });
    showMessage(`售出 ${item.name}，获得 ${item.sellPrice} 灵石`);
  }

  const sellableItems = (itemsData as ItemData[]).filter(
    (i) => i.sellPrice !== null && (inventory[i.id as ItemId] ?? 0) > 0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6"
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
            <button onClick={onClose} className="text-xs" style={{ color: "#6a8878" }}>
              关闭
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {(["buy", "sell"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="px-4 py-1.5 rounded-full text-xs transition-all"
              style={{
                backgroundColor: tab === t ? "#4ade9a" : "#1a2820",
                color: tab === t ? "#0a0e0d" : "#6a8878",
              }}
            >
              {t === "buy" ? "购买" : "出售"}
            </button>
          ))}
        </div>

        {message && (
          <div
            className="text-xs text-center mb-3 py-2 rounded-lg"
            style={{ backgroundColor: "#1a2820", color: "#4ade9a" }}
          >
            {message}
          </div>
        )}

        {tab === "buy" && (
          <div className="flex flex-col gap-2">
            {shopItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ backgroundColor: "#1a2820", border: "1px solid #2a3828" }}
              >
                <div>
                  <div className="text-sm font-medium" style={{ color: "#e8f0ec" }}>
                    {item.name}
                  </div>
                  <div className="text-xs" style={{ color: "#6a8878" }}>
                    {item.description}
                  </div>
                </div>
                <button
                  onClick={() => handleBuy(item)}
                  disabled={!item.buyPrice || lingshi < item.buyPrice}
                  className="ml-3 px-3 py-1 rounded-full text-xs whitespace-nowrap"
                  style={{
                    backgroundColor:
                      !item.buyPrice || lingshi < item.buyPrice ? "#1a2820" : "#4ade9a",
                    color:
                      !item.buyPrice || lingshi < item.buyPrice ? "#4a6a58" : "#0a0e0d",
                    cursor:
                      !item.buyPrice || lingshi < item.buyPrice ? "not-allowed" : "pointer",
                  }}
                >
                  {item.buyPrice} 灵石
                </button>
              </div>
            ))}
            <p className="text-xs text-center mt-2" style={{ color: "#4a6a58" }}>
              每次进入市场随机展示3件商品
            </p>
          </div>
        )}

        {tab === "sell" && (
          <div className="flex flex-col gap-2">
            {sellableItems.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: "#4a6a58" }}>
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
                  className="ml-3 px-3 py-1 rounded-full text-xs"
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
    </div>
  );
}
