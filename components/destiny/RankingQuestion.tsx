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

interface RankOption {
  id: string;
  text: string;
}

interface Props {
  text: string;
  options: RankOption[];
  order: string[]; // option ids in current order
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
      style={style}
      {...attributes}
      {...listeners}
      className={`flex items-center gap-3 p-4 rounded-xl border-2 bg-bamboo-50 cursor-grab select-none transition-colors
        ${isDragging ? "opacity-50 border-bamboo-400 shadow-lg" : "border-bamboo-200 hover:border-bamboo-300"}`}
    >
      <span className="w-6 h-6 rounded-full bg-bamboo-400 text-white text-xs flex items-center justify-center font-bold shrink-0">
        {rank}
      </span>
      <span className="text-bamboo-700 text-sm">{text}</span>
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
    <div className="bg-white rounded-2xl border border-bamboo-200 p-8 shadow-sm">
      <p className="text-bamboo-400 text-xs tracking-widest mb-4">拖拽排序</p>
      <h2 className="text-bamboo-700 font-serif text-lg leading-relaxed mb-6">{text}</h2>

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
          className="bg-bamboo-400 text-white px-8 py-2.5 rounded-full text-sm hover:bg-bamboo-500 transition-colors disabled:opacity-50"
        >
          确认排序
        </button>
      </div>
    </div>
  );
}
