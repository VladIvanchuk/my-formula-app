import { RenderElementProps } from "slate-react";
import { CustomElement } from "../types";
import { MentionElement } from "./MentionElement";

interface CustomRenderElementProps extends RenderElementProps {
  element: CustomElement;
}

export function renderElement(props: CustomRenderElementProps) {
  const { element, attributes, children } = props;
  switch (element.type) {
    case "mention":
      return <MentionElement {...props} element={element} />;
    default:
      return (
        <p {...attributes} style={{ margin: 0 }}>
          {children}
        </p>
      );
  }
}
