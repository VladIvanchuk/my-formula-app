import { BaseEditor } from "slate";
import { ReactEditor } from "slate-react";

type CustomText = { text: string };

export type CustomElement = ParagraphElement | MentionElementType;

export type ParagraphElement = {
  type: "paragraph";
  children: CustomText[];
};

export type MentionElementType = {
  type: "mention";
  value: string;
  children: CustomText[];
};

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}
