import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";

interface MyDrawingsProps {
  onEdit: (id: string) => void;
}

export function MyDrawings({ onEdit }: MyDrawingsProps) {
  const drawings = useQuery(api.drawings.list);
  const removeMutation = useMutation(api.drawings.remove);

  const handleDelete = async (id: Id<"drawings">) => {
    if (confirm("DELETE THIS DRAWING FOREVER?")) {
      await removeMutation({ id });
    }
  };

  if (drawings === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="border-4 border-black bg-white p-6 animate-pulse">
          <span className="font-mono text-xl font-bold uppercase">LOADING...</span>
        </div>
      </div>
    );
  }

  if (drawings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="border-8 border-black bg-white p-8 md:p-12 transform rotate-1 shadow-[12px_12px_0_0_#000]">
          <h2 className="font-mono text-2xl md:text-4xl font-black uppercase mb-4">NO DRAWINGS YET</h2>
          <p className="font-mono text-sm md:text-base uppercase">GO MAKE SOMETHING!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="border-b-4 border-black pb-2">
        <h2 className="font-mono text-2xl md:text-4xl font-black uppercase tracking-tight">
          MY DRAWINGS
        </h2>
        <p className="font-mono text-xs md:text-sm uppercase opacity-60">
          {drawings.length} CREATION{drawings.length !== 1 ? "S" : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {drawings.map((drawing: Doc<"drawings">, i: number) => (
          <div
            key={drawing._id}
            className="border-4 md:border-8 border-black bg-white transform hover:scale-105 transition-transform"
            style={{
              transform: `rotate(${(i % 3) - 1}deg)`,
            }}
          >
            <div className="border-b-4 border-black p-2 md:p-3 bg-[#6bcb77]">
              <h3 className="font-mono text-sm md:text-lg font-bold uppercase truncate">
                {drawing.title}
              </h3>
            </div>

            <div className="p-3 md:p-4 space-y-2 md:space-y-3">
              <div className="font-mono text-xs md:text-sm uppercase space-y-1">
                <p>
                  <span className="opacity-50">STROKES:</span>{" "}
                  <span className="font-bold">{drawing.strokes.length}</span>
                </p>
                <p>
                  <span className="opacity-50">CREATED:</span>{" "}
                  <span className="font-bold">
                    {new Date(drawing.createdAt).toLocaleDateString()}
                  </span>
                </p>
                <p>
                  <span className="opacity-50">UPDATED:</span>{" "}
                  <span className="font-bold">
                    {new Date(drawing.updatedAt).toLocaleDateString()}
                  </span>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(drawing._id)}
                  className="flex-1 bg-[#4d96ff] border-2 md:border-4 border-black px-2 md:px-4 py-1 md:py-2 font-mono text-xs md:text-sm font-bold uppercase hover:bg-black hover:text-white transition-colors"
                >
                  EDIT
                </button>
                <button
                  onClick={() => handleDelete(drawing._id)}
                  className="bg-[#ff6b6b] border-2 md:border-4 border-black px-2 md:px-4 py-1 md:py-2 font-mono text-xs md:text-sm font-bold uppercase hover:bg-black hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
