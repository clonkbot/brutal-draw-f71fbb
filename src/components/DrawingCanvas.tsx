import { useRef, useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

const COLORS = [
  "#000000",
  "#ff6b6b",
  "#ffd93d",
  "#6bcb77",
  "#4d96ff",
  "#9b59b6",
  "#ffffff",
];

const WIDTHS = [4, 8, 16, 32];

export function DrawingCanvas({ editingId }: { editingId: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [color, setColor] = useState("#000000");
  const [width, setWidth] = useState(8);
  const [currentDrawingId, setCurrentDrawingId] = useState<Id<"drawings"> | null>(
    editingId as Id<"drawings"> | null
  );
  const [title, setTitle] = useState("UNTITLED");
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  const createDrawing = useMutation(api.drawings.create);
  const addStrokeMutation = useMutation(api.drawings.addStroke);
  const clearStrokesMutation = useMutation(api.drawings.clearStrokes);
  const publishToGallery = useMutation(api.gallery.publish);

  const existingDrawing = useQuery(
    api.drawings.get,
    currentDrawingId ? { id: currentDrawingId } : "skip"
  );

  // Handle canvas resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const maxWidth = Math.min(rect.width - 16, 1200);
        const maxHeight = Math.min(window.innerHeight - 300, 800);
        setCanvasSize({
          width: maxWidth,
          height: Math.max(400, maxHeight),
        });
      }
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // Load existing drawing
  useEffect(() => {
    if (existingDrawing) {
      setStrokes(existingDrawing.strokes);
      setTitle(existingDrawing.title);
    }
  }, [existingDrawing]);

  // Reset when editingId changes
  useEffect(() => {
    if (editingId) {
      setCurrentDrawingId(editingId as Id<"drawings">);
    } else {
      setCurrentDrawingId(null);
      setStrokes([]);
      setTitle("UNTITLED");
    }
  }, [editingId]);

  // Draw all strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid pattern
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw all strokes
    [...strokes, { points: currentStroke, color, width }].forEach((stroke) => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      stroke.points.forEach((point) => {
        ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });
  }, [strokes, currentStroke, color, width]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDrawing(true);
    const point = getPointerPos(e);
    setCurrentStroke([point]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const point = getPointerPos(e);
    setCurrentStroke((prev) => [...prev, point]);
  };

  const handlePointerUp = async () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentStroke.length > 1) {
      const newStroke: Stroke = { points: currentStroke, color, width };
      setStrokes((prev) => [...prev, newStroke]);

      // Save to database
      if (currentDrawingId) {
        await addStrokeMutation({ id: currentDrawingId, stroke: newStroke });
      }
    }
    setCurrentStroke([]);
  };

  const handleNewDrawing = async () => {
    const id = await createDrawing({ title: "UNTITLED" });
    setCurrentDrawingId(id);
    setStrokes([]);
    setTitle("UNTITLED");
  };

  const handleClear = async () => {
    setStrokes([]);
    if (currentDrawingId) {
      await clearStrokesMutation({ id: currentDrawingId });
    }
  };

  const handlePublish = async () => {
    if (!currentDrawingId) {
      const id = await createDrawing({ title });
      setCurrentDrawingId(id);
      // Save all strokes
      for (const stroke of strokes) {
        await addStrokeMutation({ id, stroke });
      }
      // Get image data
      const canvas = canvasRef.current;
      if (canvas) {
        const imageData = canvas.toDataURL("image/png");
        await publishToGallery({ drawingId: id, title, imageData });
      }
    } else {
      const canvas = canvasRef.current;
      if (canvas) {
        const imageData = canvas.toDataURL("image/png");
        await publishToGallery({ drawingId: currentDrawingId, title, imageData });
      }
    }
    alert("PUBLISHED TO GALLERY!");
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Title Input */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value.toUpperCase())}
          className="flex-1 border-4 border-black p-2 md:p-3 font-mono text-lg md:text-2xl font-bold uppercase focus:outline-none focus:bg-yellow-200"
          placeholder="NAME YOUR MASTERPIECE"
        />
        <button
          onClick={handleNewDrawing}
          className="bg-[#6bcb77] border-4 border-black px-4 md:px-6 py-2 md:py-3 font-mono font-bold uppercase hover:bg-[#ffd93d] transition-colors"
        >
          NEW
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 md:gap-4 p-2 md:p-4 bg-white border-4 border-black">
        {/* Colors */}
        <div className="flex items-center gap-1 md:gap-2">
          <span className="font-mono text-[10px] md:text-xs uppercase font-bold hidden sm:inline">COLOR:</span>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-6 h-6 md:w-8 md:h-8 border-2 md:border-4 border-black transition-transform ${
                color === c ? "scale-125 rotate-12" : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="w-px h-6 md:h-8 bg-black hidden sm:block" />

        {/* Widths */}
        <div className="flex items-center gap-1 md:gap-2">
          <span className="font-mono text-[10px] md:text-xs uppercase font-bold hidden sm:inline">SIZE:</span>
          {WIDTHS.map((w) => (
            <button
              key={w}
              onClick={() => setWidth(w)}
              className={`w-6 h-6 md:w-8 md:h-8 border-2 md:border-4 border-black flex items-center justify-center bg-white transition-transform ${
                width === w ? "scale-110 rotate-6 bg-[#ffd93d]" : ""
              }`}
            >
              <div
                className="rounded-full bg-black"
                style={{ width: w / 2, height: w / 2 }}
              />
            </button>
          ))}
        </div>

        <div className="w-px h-6 md:h-8 bg-black hidden sm:block" />

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto">
          <button
            onClick={handleClear}
            className="bg-[#ff6b6b] border-2 md:border-4 border-black px-2 md:px-4 py-1 md:py-2 font-mono text-xs md:text-sm font-bold uppercase hover:bg-black hover:text-white transition-colors"
          >
            CLEAR
          </button>
          <button
            onClick={handlePublish}
            className="bg-[#4d96ff] border-2 md:border-4 border-black px-2 md:px-4 py-1 md:py-2 font-mono text-xs md:text-sm font-bold uppercase hover:bg-black hover:text-white transition-colors"
          >
            PUBLISH
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="border-8 border-black bg-white shadow-[8px_8px_0_0_#000] md:shadow-[16px_16px_0_0_#000] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-auto cursor-crosshair touch-none"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="font-mono text-xs md:text-sm uppercase tracking-widest opacity-60">
          DRAW SOMETHING. ANYTHING. NO JUDGMENT.
        </p>
      </div>
    </div>
  );
}
