import React, { useState, useRef, useEffect } from "react";
import { RenderElementProps } from "slate-react";
import { MentionElementType } from "../types";

type Props = RenderElementProps & {
  element: MentionElementType;
};

export const MentionElement: React.FC<Props> = ({ attributes, element }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLSpanElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect() || {
        left: 0,
        top: 0,
      };

      setPosition({
        top: buttonRect.bottom - containerRect.top + 4,
        left: buttonRect.left - containerRect.left,
      });
    }
  }, [isDropdownOpen]);

  return (
    <span
      {...attributes}
      ref={containerRef}
      contentEditable={false}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        position: "relative",
        backgroundColor: "rgb(67 67 67)",
        borderRadius: 4,
        padding: "2px 6px",
        margin: "0 2px",
        color: "#fff",
      }}
    >
      {element.value}

      <button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDropdownOpen(!isDropdownOpen);
        }}
      >
        value {selectedValue}
      </button>

      {isDropdownOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: `${position.top}px`,
            left: `${position.left}px`,
            backgroundColor: "rgb(80 80 80)",
            border: "1px solid #555",
            borderRadius: "4px",
            zIndex: 1000,
            minWidth: "60px",
          }}
        >
          {[1, 2, 3].map((value) => (
            <div
              key={value}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedValue(value);
                setIsDropdownOpen(false);
              }}
              style={{
                padding: "6px 12px",
                cursor: "pointer",
                color: "#fff",
                borderBottom: "1px solid #555",
              }}
            >
              {value}
            </div>
          ))}
        </div>
      )}
    </span>
  );
};
