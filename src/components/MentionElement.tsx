import React from "react";
import { RenderElementProps } from "slate-react";
import { MentionElementType } from "../types";

type Props = RenderElementProps & {
  element: MentionElementType;
};

export const MentionElement: React.FC<Props> = ({ attributes, element }) => {
  return (
    <span
      {...attributes}
      contentEditable={false}
      style={{
        display: "inline-block",
        backgroundColor: "rgb(67 67 67)",
        borderRadius: 4,
        padding: "2px 6px",
        margin: "0 2px",
        color: "#fff",
      }}
    >
      {element.value}
    </span>
  );
};
