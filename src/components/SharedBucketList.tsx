"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Check, Edit2, Sparkles } from "lucide-react";
import { db } from "../lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";

interface BucketItem {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string;
  createdAt?: string;
}

export default function SharedBucketList() {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [newItemText, setNewItemText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    // Primary query ordered by createdAt
    const q = query(collection(db, "bucket_list"), orderBy("createdAt", "asc"));

    const processSnapshot = (snapshot: any) => {
      if (snapshot.empty) {
        // If collection is completely empty, seed default items into Firestore
        const defaults = [
          { title: "Watch the sunset together", isCompleted: true, completedAt: "Feb 14, 2026", createdAt: new Date(Date.now() - 3000).toISOString() },
          { title: "Go café hopping in Manila", isCompleted: false, createdAt: new Date(Date.now() - 2000).toISOString() },
          { title: "Movie marathon (all Harry Potter movies)", isCompleted: false, createdAt: new Date(Date.now() - 1000).toISOString() },
          { title: "Take photobooth pictures", isCompleted: false, createdAt: new Date().toISOString() },
        ];
        defaults.forEach((item) => {
          addDoc(collection(db, "bucket_list"), item);
        });
        return;
      }

      const listItems: BucketItem[] = [];
      snapshot.forEach((docSnap: any) => {
        const data = docSnap.data();
        listItems.push({
          id: docSnap.id,
          title: data.title,
          isCompleted: data.isCompleted || false,
          completedAt: data.completedAt,
          createdAt: data.createdAt,
        });
      });
      setItems(listItems);
    };

    const unsubscribe = onSnapshot(
      q,
      processSnapshot,
      (error) => {
        console.error("Firestore bucket_list query error, using fallback:", error);
        // Fallback without ordering in case index is missing
        onSnapshot(collection(db, "bucket_list"), processSnapshot);
      }
    );

    return () => unsubscribe();
  }, []);

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const title = newItemText.trim();
    setNewItemText("");

    await addDoc(collection(db, "bucket_list"), {
      title,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    });
  };

  const toggleComplete = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const isCompleted = !item.isCompleted;
    const completedAt = isCompleted
      ? new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : undefined;

    await updateDoc(doc(db, "bucket_list", id), {
      isCompleted,
      ...(completedAt ? { completedAt } : { completedAt: null }),
    });
  };

  const startEdit = (item: BucketItem) => {
    setEditingId(item.id);
    setEditingText(item.title);
  };

  const saveEdit = async (id: string) => {
    if (!editingText.trim()) return;
    const title = editingText.trim();
    setEditingId(null);

    await updateDoc(doc(db, "bucket_list", id), { title });
  };

  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, "bucket_list", id));
  };

  const completedCount = items.filter((i) => i.isCompleted).length;
  const totalCount = items.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-card rounded-3xl p-6 shadow-sm border border-secondary space-y-6">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
          <span>🎯</span> Shared Bucket List
        </h3>
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-secondary-foreground font-medium">
            <span>{progressPercent}% completed</span>
            <span>{completedCount} / {totalCount} items</span>
          </div>
          <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Add Item Form */}
      <form onSubmit={addItem} className="flex gap-2">
        <input
          type="text"
          placeholder="Add a new adventure..."
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-secondary bg-background/50 focus:outline-none focus:border-primary text-sm transition-all"
        />
        <button
          type="submit"
          className="bg-primary text-primary-foreground p-2.5 rounded-xl hover:bg-primary/90 transition-all active:scale-95 flex items-center justify-center"
        >
          <Plus size={18} />
        </button>
      </form>

      {/* Item List */}
      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
              item.isCompleted 
                ? "bg-secondary/10 border-secondary/10 opacity-75" 
                : "bg-secondary/30 border-secondary/20"
            }`}
          >
            {editingId === item.id ? (
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                onBlur={() => saveEdit(item.id)}
                onKeyDown={(e) => e.key === "Enter" && saveEdit(item.id)}
                className="flex-1 bg-transparent border-b border-primary focus:outline-none text-sm py-0.5 text-foreground"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-3 flex-1 min-w-0" onClick={() => toggleComplete(item.id)}>
                <button
                  type="button"
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    item.isCompleted 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "border-secondary-foreground/30 hover:border-primary"
                  }`}
                >
                  {item.isCompleted && <Check size={12} strokeWidth={3} />}
                </button>
                <div className="text-left min-w-0">
                  <p className={`text-sm font-medium truncate ${item.isCompleted ? "line-through text-secondary-foreground" : "text-foreground"}`}>
                    {item.title}
                  </p>
                  {item.isCompleted && item.completedAt && (
                    <span className="text-[10px] text-secondary-foreground flex items-center gap-1 mt-0.5">
                      <Sparkles size={8} /> Completed on {item.completedAt}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 ml-2">
              {editingId !== item.id && (
                <button
                  onClick={() => startEdit(item)}
                  className="text-secondary-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary/40 transition-all"
                >
                  <Edit2 size={13} />
                </button>
              )}
              <button
                onClick={() => deleteItem(item.id)}
                className="text-secondary-foreground hover:text-red-400 p-1.5 rounded-lg hover:bg-secondary/40 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
