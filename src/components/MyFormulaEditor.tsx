import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createEditor, Descendant, Editor, Range, Transforms } from "slate";
import { withHistory } from "slate-history";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";
import { useAutocomplete } from "../hooks/useAutocomplete";
import { useEditorStore } from "../store/editorStore";
import { MentionElementType } from "../types";
import { renderElement } from "./renderElement";
import { withMentions } from "../utils/withMentions";

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

      const mentionNode: MentionElementType = {
        type: "mention",
        value: mentionName,
        children: [{ text: "" }],
      };

      Transforms.insertNodes(editor, mentionNode);

      Transforms.insertText(editor, " ");

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

          const domRange = ReactEditor.toDOMRange(editor, targetRange);
          const rect = domRange.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();

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
