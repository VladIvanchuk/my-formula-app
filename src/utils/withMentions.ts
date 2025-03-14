import { Editor } from "slate";

export const withMentions = (editor: Editor) => {
  const { isVoid, isInline } = editor;

  editor.isVoid = (element) => {
    return element.type === "mention" ? true : isVoid(element);
  };

  editor.isInline = (element) => {
    return element.type === "mention" ? true : isInline(element);
  };

  return editor;
};
