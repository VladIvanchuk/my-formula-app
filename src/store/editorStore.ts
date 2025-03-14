import { create } from "zustand";
import { Descendant } from "slate";

interface EditorState {
  editorValue: Descendant[];
  setEditorValue: (value: Descendant[]) => void;
}

const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [{ text: "" }],
  },
];

export const useEditorStore = create<EditorState>((set) => ({
  editorValue: initialValue,

  setEditorValue: (value) => set({ editorValue: value }),
}));
