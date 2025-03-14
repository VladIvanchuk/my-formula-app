import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  createEditor,
  Descendant,
  Editor,
  Transforms,
  Range,
  BaseEditor,
} from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { withHistory } from "slate-history";
import { useAutocomplete } from "../hooks/useAutocomplete";
import { useEditorStore } from "../store/editorStore";
import { renderElement } from "./renderElement";

// Типи для Slate
type CustomElement = ParagraphElement | MentionElement;
type ParagraphElement = { type: "paragraph"; children: CustomText[] };
type MentionElement = {
  type: "mention";
  value: string;
  children: CustomText[];
};

type CustomText = { text: string };

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const withMentions = (editor: Editor) => {
  const { isVoid, isInline } = editor;

  editor.isVoid = (element) => {
    return element.type === "mention" ? true : isVoid(element);
  };

  editor.isInline = (element) => {
    return element.type === "mention" ? true : isInline(element);
  };

  return editor;
};

export const MyFormulaEditor: React.FC = () => {
  const editor = useMemo(
    () => withMentions(withHistory(withReact(createEditor()))),
    []
  );
  const { editorValue, setEditorValue } = useEditorStore();
  const [targetRange, setTargetRange] = useState<Range | null>(null);
  const [searchText, setSearchText] = useState("");
  const { data: suggestions = [] } = useAutocomplete(searchText);
  const containerRef = useRef<HTMLDivElement>(null);

  // При першому рендері можна сфокусувати редактор
  useEffect(() => {
    ReactEditor.focus(editor);
  }, [editor]);

  const onChange = useCallback(
    (newValue: Descendant[]) => {
      setEditorValue(newValue);

      try {
        const { selection } = editor;
        if (selection && Range.isCollapsed(selection)) {
          const [start] = Range.edges(selection);
          const beforeRange = Editor.before(editor, start, { unit: "word" });

          if (beforeRange) {
            const beforeTextRange = Editor.range(editor, beforeRange, start);
            const beforeText = Editor.string(editor, beforeTextRange);

            if (beforeText) {
              setSearchText(beforeText);
              setTargetRange(beforeTextRange);
              return;
            }
          }
        }

        setSearchText("");
        setTargetRange(null);
      } catch (error) {
        console.error("Selection error:", error);
        setSearchText("");
        setTargetRange(null);
      }
    },
    [editor, setEditorValue]
  );

  const insertMention = (mentionName: string) => {
    if (targetRange) {
      Transforms.select(editor, targetRange);
      Transforms.delete(editor);

      const mentionNode: MentionElement = {
        type: "mention",
        value: mentionName,
        children: [{ text: "" }],
      };

      Transforms.insertNodes(editor, mentionNode);

      // Додаємо порожній текст після тегу
      Transforms.insertText(editor, " ");

      // Оновлюємо селекшн
      Transforms.move(editor);
      ReactEditor.focus(editor);

      setTargetRange(null);
      setSearchText("");
    }
  };

  return (
    <div
      style={{
        position: "relative",
        border: "1px #ccc solid",
        borderRadius: "12px",
        padding: "8px",
        height: "50px",
        display: "flex",
        alignItems: "center",
      }}
      ref={containerRef}
    >
      <Slate editor={editor} initialValue={editorValue} onChange={onChange}>
        <Editable
          style={{
            width: "800px",
            outline: "none",
          }}
          placeholder="Type your formula..."
          onKeyDown={(event) => {
            // Якщо Enter і є підказки, вставити першу
            if (event.key === "Enter" && suggestions.length > 0 && searchText) {
              event.preventDefault();
              insertMention(suggestions[0].name);
            }
          }}
          renderElement={renderElement}
        />
      </Slate>

      {targetRange &&
        suggestions.length > 0 &&
        (() => {
          if (!containerRef.current) return null;

          // Отримуємо позицію курсору
          const domRange = ReactEditor.toDOMRange(editor, targetRange);
          const rect = domRange.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();

          // Розраховуємо позицію відносно контейнера
          const top =
            rect.bottom -
            containerRect.top +
            containerRef.current.scrollTop +
            5;
          const left = rect.left - containerRect.left;

          return (
            <div
              style={{
                position: "absolute",
                top: `${top}px`,
                left: `${left}px`,
                border: "1px solid #ccc",
                background: "rgb(67 67 67)",
                zIndex: 10,
                maxHeight: "150px",
                overflowY: "auto",
              }}
            >
              {suggestions.map((item) => (
                <div
                  key={item.id}
                  style={{ padding: 8, cursor: "pointer" }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertMention(item.name);
                  }}
                >
                  {item.name}
                </div>
              ))}
            </div>
          );
        })()}
    </div>
  );
};
