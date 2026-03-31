import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useState } from "react";
import { DrawingCanvas } from "./components/DrawingCanvas";
import { Gallery } from "./components/Gallery";
import { MyDrawings } from "./components/MyDrawings";

function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch {
      setError(flow === "signIn" ? "WRONG. TRY AGAIN." : "FAILED. EMAIL TAKEN?");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5dc] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border-8 border-black bg-white p-6 md:p-8 transform rotate-1 shadow-[12px_12px_0_0_#000]">
          <h1 className="font-mono text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 transform -rotate-2">
            BRUTAL
          </h1>
          <h2 className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-tight mb-6 md:mb-8 border-b-4 border-black pb-2">
            DRAW.
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-widest font-bold">EMAIL</label>
              <input
                name="email"
                type="email"
                required
                className="w-full border-4 border-black p-3 font-mono text-lg focus:outline-none focus:bg-yellow-200 transition-colors"
                placeholder="YOUR@EMAIL.COM"
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-widest font-bold">PASSWORD</label>
              <input
                name="password"
                type="password"
                required
                className="w-full border-4 border-black p-3 font-mono text-lg focus:outline-none focus:bg-yellow-200 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="bg-red-500 text-white font-mono font-bold p-2 text-center uppercase animate-pulse">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white font-mono text-xl font-bold uppercase p-4 hover:bg-yellow-400 hover:text-black transition-colors border-4 border-black disabled:opacity-50"
            >
              {loading ? "..." : flow === "signIn" ? "ENTER" : "CREATE"}
            </button>
          </form>

          <button
            onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
            className="w-full mt-4 font-mono text-sm uppercase underline underline-offset-4 hover:bg-black hover:text-white p-2 transition-colors"
          >
            {flow === "signIn" ? "NO ACCOUNT? MAKE ONE" : "HAVE ACCOUNT? SIGN IN"}
          </button>

          <div className="mt-6 pt-4 border-t-4 border-black border-dashed">
            <button
              onClick={() => signIn("anonymous")}
              className="w-full bg-[#ff6b6b] text-black font-mono font-bold uppercase p-3 hover:bg-[#ffd93d] transition-colors border-4 border-black"
            >
              SKIP → DRAW AS GUEST
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <span className="font-mono text-xs uppercase tracking-widest opacity-60">
            NO RULES. JUST DRAW.
          </span>
        </div>
      </div>
    </div>
  );
}

type View = "canvas" | "gallery" | "my-drawings";

function MainApp() {
  const { signOut } = useAuthActions();
  const [view, setView] = useState<View>("canvas");
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEditDrawing = (id: string) => {
    setEditingId(id);
    setView("canvas");
  };

  return (
    <div className="min-h-screen bg-[#f5f5dc] flex flex-col">
      {/* Header */}
      <header className="border-b-8 border-black bg-white sticky top-0 z-50">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-2 md:p-4 gap-2">
          <h1 className="font-mono text-xl md:text-3xl font-black uppercase tracking-tighter">
            BRUTAL<span className="text-[#ff6b6b]">DRAW</span>
          </h1>

          <nav className="flex items-center gap-1 md:gap-2 overflow-x-auto">
            <NavButton active={view === "canvas"} onClick={() => { setView("canvas"); setEditingId(null); }}>
              CANVAS
            </NavButton>
            <NavButton active={view === "gallery"} onClick={() => setView("gallery")}>
              GALLERY
            </NavButton>
            <NavButton active={view === "my-drawings"} onClick={() => setView("my-drawings")}>
              MY STUFF
            </NavButton>
            <button
              onClick={() => signOut()}
              className="font-mono text-xs md:text-sm uppercase px-2 md:px-3 py-2 border-2 md:border-4 border-black bg-red-500 text-white hover:bg-black transition-colors whitespace-nowrap"
            >
              EXIT
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-2 md:p-4">
        {view === "canvas" && <DrawingCanvas editingId={editingId} />}
        {view === "gallery" && <Gallery />}
        {view === "my-drawings" && <MyDrawings onEdit={handleEditDrawing} />}
      </main>

      {/* Footer */}
      <footer className="border-t-4 border-black bg-white p-3 md:p-4 text-center">
        <p className="font-mono text-[10px] md:text-xs text-gray-400 uppercase tracking-wider">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

function NavButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`font-mono text-xs md:text-sm uppercase px-2 md:px-4 py-2 border-2 md:border-4 border-black transition-all whitespace-nowrap ${
        active
          ? "bg-black text-white transform -rotate-1"
          : "bg-white hover:bg-[#ffd93d]"
      }`}
    >
      {children}
    </button>
  );
}

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5dc] flex items-center justify-center">
        <div className="border-8 border-black bg-white p-8 md:p-12 animate-pulse">
          <span className="font-mono text-2xl md:text-4xl font-black uppercase">LOADING...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <SignIn />;
  }

  return <MainApp />;
}
