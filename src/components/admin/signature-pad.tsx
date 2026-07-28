"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Pen, Type, Trash2, Check } from "lucide-react";

interface SignaturePadProps {
  onSave: (data: string, type: "drawn" | "typed") => void;
  onCancel?: () => void;
  signerName?: string;
  compact?: boolean;
}

export default function SignaturePad({ onSave, onCancel, signerName = "", compact = false }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<"drawn" | "typed">("drawn");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [typedSig, setTypedSig] = useState(signerName);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#0F172A";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const pos = getPos(e, canvas);
    setIsDrawing(true);
    setLastPos(pos);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setLastPos(pos);
  };

  const stopDraw = () => setIsDrawing(false);

  const clearCanvas = () => {
    initCanvas();
    setHasDrawn(false);
  };

  const renderTypedSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = `italic ${compact ? 28 : 36}px "Georgia", serif`;
    ctx.fillStyle = "#0D9488";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(typedSig || "Signature", canvas.width / 2, canvas.height / 2);
  };

  useEffect(() => {
    if (mode === "typed") {
      renderTypedSignature();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typedSig, mode]);

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl, mode);
  };

  const canHeight = compact ? 100 : 140;

  return (
    <div className="space-y-3">
      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode("drawn"); clearCanvas(); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            mode === "drawn"
              ? "bg-[#0D9488] text-white"
              : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:border-[#0D9488]"
          }`}
        >
          <Pen size={12} /> Draw Signature
        </button>
        <button
          onClick={() => { setMode("typed"); renderTypedSignature(); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            mode === "typed"
              ? "bg-[#0D9488] text-white"
              : "bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:border-[#0D9488]"
          }`}
        >
          <Type size={12} /> Type Signature
        </button>
      </div>

      {/* Typed name input */}
      {mode === "typed" && (
        <input
          className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
          placeholder="Type your full name"
          value={typedSig}
          onChange={e => setTypedSig(e.target.value)}
        />
      )}

      {/* Canvas */}
      <div className="relative border-2 border-[#E2E8F0] rounded-xl overflow-hidden bg-white"
           style={{ height: canHeight }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={canHeight * 2}
          className="w-full touch-none cursor-crosshair"
          style={{ height: canHeight }}
          onMouseDown={mode === "drawn" ? startDraw : undefined}
          onMouseMove={mode === "drawn" ? draw : undefined}
          onMouseUp={mode === "drawn" ? stopDraw : undefined}
          onMouseLeave={mode === "drawn" ? stopDraw : undefined}
          onTouchStart={mode === "drawn" ? startDraw : undefined}
          onTouchMove={mode === "drawn" ? draw : undefined}
          onTouchEnd={mode === "drawn" ? stopDraw : undefined}
        />
        {mode === "drawn" && !hasDrawn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-[#CBD5E1] text-sm">Draw your signature here</p>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-[#E2E8F0]" style={{ bottom: 24 }} />
        <p className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-[#CBD5E1]">Signature</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {mode === "drawn" && (
          <button
            onClick={clearCanvas}
            className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-red-500 transition-colors"
          >
            <Trash2 size={12} /> Clear
          </button>
        )}
        <div className="flex gap-2 ml-auto">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1.5 text-xs text-[#64748B] border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={mode === "drawn" && !hasDrawn}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0D9488] text-white text-xs rounded-lg hover:bg-[#0f766e] disabled:opacity-40 transition-colors"
          >
            <Check size={12} /> Apply Signature
          </button>
        </div>
      </div>
    </div>
  );
}
