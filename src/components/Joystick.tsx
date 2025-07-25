import React, { useRef, useState, useEffect } from "react";
import "./joystick.css";

interface JoystickProps {
  size?: number;
  baseColor?: string;
  stickColor?: string;
  onMove?: (x: number, y: number) => void;
  onStop?: () => void;
}

const Joystick: React.FC<JoystickProps> = ({
  size = 100,
  baseColor = "#ccc",
  stickColor = "#333",
  onMove,
  onStop,
}) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setDragging(true);
    moveStick(e);
  };

  const handleMove = (e: MouseEvent | TouchEvent) => {
    if (!dragging) return;
    moveStick(e);
  };

  const handleEnd = () => {
    setDragging(false);
    resetStick();
    if (onStop) onStop();
  };

  const moveStick = (
    e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent
  ) => {
    const base = baseRef.current;
    const stick = stickRef.current;
    if (!base || !stick) return;

    const baseRect = base.getBoundingClientRect();
    const baseCenter = {
      x: baseRect.left + baseRect.width / 2,
      y: baseRect.top + baseRect.height / 2,
    };

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - baseCenter.x;
    const dy = clientY - baseCenter.y;
    const maxRadius = size / 2 - 20;

    const distance = Math.min(Math.sqrt(dx * dx + dy * dy), maxRadius);
    const angle = Math.atan2(dy, dx);

    const x = distance * Math.cos(angle);
    const y = distance * Math.sin(angle);

    stick.style.transform = `translate(${x}px, ${y}px)`;

    const normalizedX = parseFloat((x / maxRadius).toFixed(2));
    const normalizedY = parseFloat((y / maxRadius).toFixed(2));

    if (onMove) onMove(normalizedX, normalizedY);
  };

  const resetStick = () => {
    const stick = stickRef.current;
    if (stick) {
      stick.style.transition = "transform 0.2s ease";
      stick.style.transform = `translate(0px, 0px)`;
      setTimeout(() => {
        if (stick) stick.style.transition = "none";
      }, 200);
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleEnd);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleEnd);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleEnd);
    };
  }, [dragging]);

  return (
    <div
      ref={baseRef}
      className="joystick-base"
      style={{ width: size, height: size, backgroundColor: baseColor }}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
    >
      <div
        ref={stickRef}
        className="joystick-stick"
        style={{ backgroundColor: stickColor }}
      />
    </div>
  );
};

export default Joystick;
