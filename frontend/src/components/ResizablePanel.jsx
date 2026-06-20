import { useRef, useState, useEffect } from "react";

export function PanelGroup({
  direction = "horizontal",
  children,
  className = "",
}) {
  const [panels, setPanels] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    // Initialize panels from children
    const panelChildren = Array.isArray(children) ? children : [children];
    const panelElements = panelChildren.filter(
      (child) => child?.type?.name === "Panel" || child?.type === Panel,
    );

    const initialPanels = panelElements.map((child, index) => ({
      id: index,
      size: child.props.defaultSize || 50,
      minSize: child.props.minSize || 20,
    }));

    setPanels(initialPanels);
  }, [children]);

  const handleResize = (index, delta) => {
    if (!containerRef.current || panels.length === 0) return;

    const containerSize =
      direction === "horizontal"
        ? containerRef.current.offsetWidth
        : containerRef.current.offsetHeight;

    const deltaPercent = (delta / containerSize) * 100;

    setPanels((prevPanels) => {
      const newPanels = [...prevPanels];

      // Adjust current panel
      const newSize = Math.max(
        newPanels[index].minSize,
        Math.min(
          100 - newPanels[index + 1].minSize,
          newPanels[index].size + deltaPercent,
        ),
      );

      const actualDelta = newSize - newPanels[index].size;

      // Adjust next panel
      newPanels[index].size += actualDelta;
      newPanels[index + 1].size -= actualDelta;

      return newPanels;
    });
  };

  const childrenArray = Array.isArray(children) ? children : [children];
  let panelIndex = 0;

  return (
    <div
      ref={containerRef}
      className={`flex ${direction === "horizontal" ? "flex-row" : "flex-col"} h-full w-full ${className}`}
    >
      {childrenArray.map((child, index) => {
        if (!child) return null;

        if (child.type?.name === "Panel" || child.type === Panel) {
          const currentPanelIndex = panelIndex;
          const panel = panels[currentPanelIndex];
          panelIndex++;

          return (
            <div
              key={index}
              style={{
                [direction === "horizontal" ? "width" : "height"]: panel
                  ? `${panel.size}%`
                  : "50%",
                overflow: "auto",
              }}
            >
              {child.props.children}
            </div>
          );
        }

        if (
          child.type?.name === "PanelResizeHandle" ||
          child.type === PanelResizeHandle
        ) {
          const handleIndex = panelIndex - 1;

          return (
            <PanelResizeHandle
              key={index}
              direction={direction}
              onResize={(delta) => handleResize(handleIndex, delta)}
              className={child.props.className}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

export function Panel({ children, defaultSize, minSize }) {
  return <>{children}</>;
}

export function PanelResizeHandle({
  direction = "horizontal",
  onResize,
  className = "",
}) {
  const [isDragging, setIsDragging] = useState(false);
  const startPosRef = useRef(0);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    startPosRef.current = direction === "horizontal" ? e.clientX : e.clientY;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e) => {
      const currentPos = direction === "horizontal" ? e.clientX : e.clientY;
      const delta = currentPos - startPosRef.current;

      if (Math.abs(delta) > 0) {
        onResize?.(delta);
        startPosRef.current = currentPos;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, direction, onResize]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`${
        direction === "horizontal"
          ? "w-2 cursor-col-resize"
          : "h-2 cursor-row-resize"
      } bg-base-300 hover:bg-primary transition-colors ${isDragging ? "bg-primary" : ""} ${className}`}
      style={{
        userSelect: "none",
        flexShrink: 0,
      }}
    />
  );
}
