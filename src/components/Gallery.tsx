import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";

export function Gallery() {
  const items = useQuery(api.gallery.list);
  const likeMutation = useMutation(api.gallery.like);

  const handleLike = async (id: Id<"gallery">) => {
    await likeMutation({ id });
  };

  if (items === undefined) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="border-4 border-black bg-white p-6 animate-pulse">
          <span className="font-mono text-xl font-bold uppercase">LOADING GALLERY...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="border-8 border-black bg-white p-8 md:p-12 transform -rotate-2">
          <h2 className="font-mono text-2xl md:text-4xl font-black uppercase mb-4">EMPTY GALLERY</h2>
          <p className="font-mono text-sm md:text-base uppercase">BE THE FIRST TO PUBLISH!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="border-b-4 border-black pb-2">
        <h2 className="font-mono text-2xl md:text-4xl font-black uppercase tracking-tight">
          PUBLIC GALLERY
        </h2>
        <p className="font-mono text-xs md:text-sm uppercase opacity-60">
          {items.length} MASTERPIECE{items.length !== 1 ? "S" : ""} AND COUNTING
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {items.map((item: Doc<"gallery">, i: number) => (
          <div
            key={item._id}
            className="border-4 md:border-8 border-black bg-white transform hover:scale-105 transition-transform"
            style={{
              transform: `rotate(${(i % 5) - 2}deg)`,
            }}
          >
            <div className="border-b-4 border-black p-2 md:p-3 bg-[#ffd93d]">
              <h3 className="font-mono text-sm md:text-lg font-bold uppercase truncate">
                {item.title || "UNTITLED"}
              </h3>
            </div>
            <div className="aspect-square overflow-hidden bg-white">
              <img
                src={item.imageData}
                alt={item.title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="border-t-4 border-black p-2 md:p-3 flex items-center justify-between bg-white">
              <button
                onClick={() => handleLike(item._id)}
                className="flex items-center gap-1 md:gap-2 font-mono text-sm md:text-lg font-bold uppercase hover:text-[#ff6b6b] transition-colors active:scale-125"
              >
                <span className="text-xl md:text-2xl">♥</span>
                <span>{item.likes}</span>
              </button>
              <span className="font-mono text-[10px] md:text-xs uppercase opacity-50">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
