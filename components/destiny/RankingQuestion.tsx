"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface RankOption { id: string; text: string; }

interface Props {
  text: string;
  options: RankOption[];
  order: string[];
  onOrderChange: (newOrder: string[]) => void;
  onConfirm: () => void;
  disabled?: boolean;
}

function SortableItem({ id, text, rank }: { id: string; text: string; rank: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        border: isDragging ? "1px solid #4ade9a" : "1px solid #1a2820",
        backgroundColor: isDragging ? "rgba(74,222,154,0.08)" : "#111a16",
        boxShadow: isDragging ? "0 0 16px rgba(74,222,154,0.25)" : "none",
        opacity: isDragging ? 0.8 : 1,
        borderRadius: "12px",
        padding: "16px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        cursor: "grab",
        userSelect: "none",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      {...attributes}
      {...listeners}
    >
      <span
        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
        style={{ backgroundColor: "#4ade9a", color: "#0a0e0d" }}
      >
        {rank}
      </span>
      <span className="text-sm" style={{ color: "#b8ccc2" }}>{text}</span>
    </div>
  );
}

export default function RankingQuestion({ text, options, order, onOrderChange, onConfirm, disabled }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = order.indexOf(String(active.id));
      const newIndex = order.indexOf(String(over.id));
      onOrderChange(arrayMove(order, oldIndex, newIndex));
    }
  }

  return (
    <div
      className="rounded-2xl p-8 relative overflow-hidden card-glow"
      style={{ backgroundColor: "#111a16", border: "1px solid #1a2820" }}
    >
      <p className="text-xs tracking-widest mb-4" style={{ color: "#6a8878" }}>拖拽排序</p>
      <h2 className="font-serif text-lg leading-relaxed mb-6" style={{ color: "#e8f0ec" }}>{text}</h2>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3 mb-6">
            {order.map((id, idx) => {
              const opt = options.find((o) => o.id === id)!;
              return <SortableItem key={id} id={id} text={opt.text} rank={idx + 1} />;
            })}
          </div>
        </SortableContext>
      </DndContext>

      <div className="text-center">
        <button
          disabled={disabled}
          onClick={onConfirm}
          className="btn-primary"
          style={{ opacity: disabled ? 0.5 : 1 }}
        >
          确认排序
        </button>
      </div>
    </div>
  );
}
