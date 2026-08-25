// Workshop Ledger reminder: this page is a workshop table — make the process visible, let the canvas breathe, and use olive/clay as purposeful marks.
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  Download,
  Eraser,
  LayoutGrid,
  Library,
  MessageCircle,
  Mic,
  MonitorUp,
  MoreHorizontal,
  MousePointer2,
  Palette,
  PanelRight,
  PenLine,
  Play,
  Plus,
  Radio,
  Redo2,
  Save,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  Undo2,
  Users,
  Video,
  VideoOff,
} from "lucide-react";
import { toast } from "sonner";

const HERO_IMAGE = "/manus-storage/atelier-hero_14757717.jpg";
const STUDY_IMAGE = "/manus-storage/studio-study_d154207e.jpg";
const PORTRAIT_IMAGE = "/manus-storage/portrait-study_f80ce5d2.jpg";
const BRAND_MARK = "/manus-storage/atelier-mark_375a044a.png";

type ViewName = "workbench" | "schedule" | "library";
type ToolName = "pencil" | "eraser";
type Point = { x: number; y: number };

type NavItemProps = {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick: () => void;
};

function NavItem({ icon: Icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      className="nav-ink flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-[13px] font-medium"
      data-active={active}
      onClick={onClick}
    >
      <Icon size={16} strokeWidth={1.8} />
      <span>{label}</span>
      {active ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#c96e52]" /> : null}
    </button>
  );
}

function SectionLabel({ children, tone = "olive" }: { children: React.ReactNode; tone?: "olive" | "clay" }) {
  return (
    <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#67735c]">
      <span className={`h-1.5 w-1.5 rounded-full ${tone === "clay" ? "bg-[#c96e52]" : "bg-[#67735c]"}`} />
      {children}
    </div>
  );
}

function formatTime() {
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date());
}

function Workbench({ onNavigate }: { onNavigate: (view: ViewName) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const redoRef = useRef<ImageData[]>([]);
  const [tool, setTool] = useState<ToolName>("pencil");
  const [color, setColor] = useState("#30342d");
  const [size, setSize] = useState(4);
  const [historyCount, setHistoryCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [sessionOpen, setSessionOpen] = useState(true);
  const [savedAt, setSavedAt] = useState("10:34 AM");

  const getCanvasPoint = (event: ReactPointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const paintStarterSketch = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#fffdf7";
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.strokeStyle = "rgba(103,115,92,.12)";
    ctx.setLineDash([7, 11]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width * .19, height * .12);
    ctx.lineTo(width * .19, height * .88);
    ctx.moveTo(width * .16, height * .47);
    ctx.lineTo(width * .82, height * .47);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = "rgba(48,52,45,.2)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(width * .5, height * .35, width * .13, height * .17, -.08, 0, Math.PI * 2);
    ctx.moveTo(width * .39, height * .51);
    ctx.quadraticCurveTo(width * .5, height * .43, width * .62, height * .52);
    ctx.moveTo(width * .38, height * .54);
    ctx.quadraticCurveTo(width * .3, height * .72, width * .29, height * .9);
    ctx.moveTo(width * .62, height * .54);
    ctx.quadraticCurveTo(width * .71, height * .72, width * .74, height * .9);
    ctx.stroke();
    ctx.strokeStyle = "rgba(201,110,82,.4)";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(width * .36, height * .83);
    ctx.quadraticCurveTo(width * .5, height * .77, width * .67, height * .84);
    ctx.stroke();
    ctx.fillStyle = "rgba(103,115,92,.55)";
    ctx.font = "600 13px DM Sans, sans-serif";
    ctx.fillText("loose construction", width * .7, height * .16);
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = 1200;
    canvas.height = 760;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const stored = window.localStorage.getItem("atelier-live-sketch");
    if (stored) {
      const image = new Image();
      image.onload = () => ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      image.src = stored;
    } else {
      paintStarterSketch(ctx, canvas.width, canvas.height);
    }
  }, []);

  const pushHistory = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (historyRef.current.length > 24) historyRef.current.shift();
    redoRef.current = [];
    setHistoryCount(historyRef.current.length);
    setRedoCount(0);
  };

  const startDrawing = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pushHistory();
    isDrawingRef.current = true;
    const point = getCanvasPoint(event);
    lastPointRef.current = point;
    ctx.beginPath();
    ctx.arc(point.x, point.y, Math.max(1, (tool === "eraser" ? size * 1.4 : size) / 2), 0, Math.PI * 2);
    ctx.fillStyle = tool === "eraser" ? "#fffdf7" : color;
    ctx.fill();
  };

  const draw = (event: ReactPointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !isDrawingRef.current || !lastPointRef.current) return;
    const point = getCanvasPoint(event);
    ctx.strokeStyle = tool === "eraser" ? "#fffdf7" : color;
    ctx.lineWidth = tool === "eraser" ? size * 3 : size;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const previous = historyRef.current.pop();
    if (!canvas || !ctx || !previous) return;
    redoRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(previous, 0, 0);
    setHistoryCount(historyRef.current.length);
    setRedoCount(redoRef.current.length);
  };

  const redo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const next = redoRef.current.pop();
    if (!canvas || !ctx || !next) return;
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    ctx.putImageData(next, 0, 0);
    setHistoryCount(historyRef.current.length);
    setRedoCount(redoRef.current.length);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    pushHistory();
    paintStarterSketch(ctx, canvas.width, canvas.height);
    window.localStorage.removeItem("atelier-live-sketch");
    setSavedAt("Not saved yet");
    toast("Fresh sheet ready", { description: "The construction sketch is back. Make a mark when you’re ready." });
  };

  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    window.localStorage.setItem("atelier-live-sketch", canvas.toDataURL("image/png"));
    setSavedAt(formatTime());
    toast.success("Sketch saved locally", { description: "This study will be here when you return to the workbench." });
  };

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "atelier-live-study.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("PNG exported", { description: "Your study is ready to share or archive." });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-[#d8d1c4] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.17em] text-[#67735c]">
            <span>Live room</span><span className="text-[#b6ae9f]">/</span><span>Wednesday studies</span>
          </div>
          <h1 className="display-face text-4xl font-semibold leading-[.98] tracking-[-0.04em] text-[#252820] sm:text-5xl">Make room for the mark<span className="text-[#c96e52]">.</span></h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#68685e]">A quiet place to look closely, draw loosely, and make something with other people in the room.</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-end">
          <button type="button" className="tool-button flex items-center gap-2 rounded-sm border border-[#cfc7b8] bg-[#faf7f0] px-3 py-2 text-xs font-semibold text-[#30342d] shadow-sm" onClick={() => toast("Share link copied", { description: "Invite someone into this class room." })}><Users size={15} /> Invite</button>
          <button type="button" className="tool-button flex items-center gap-2 rounded-sm bg-[#67735c] px-3 py-2 text-xs font-semibold text-[#faf7f0] shadow-sm" onClick={() => setSessionOpen((value) => !value)}><Settings2 size={15} /> {sessionOpen ? "Session live" : "Open session"}</button>
        </div>
      </header>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_318px]">
        <div className="min-w-0 space-y-5">
          <section className="workbench-panel overflow-hidden rounded-sm border border-[#2a2c25] bg-[#20221d] shadow-[0_14px_36px_rgba(38,39,29,.16)]" aria-label="Live class preview">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-3 text-[#f5f0e7]">
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]"><span className="live-pulse h-2 w-2 rounded-full bg-[#c96e52]" /> Live now</span>
                <span className="hidden text-xs text-white/45 sm:inline">Portraits in graphite · 01:18:24</span>
              </div>
              <button type="button" aria-label="More live room actions" className="rounded-sm p-1 text-white/55 transition hover:bg-white/10 hover:text-white" onClick={() => toast("Room menu", { description: "Recording, layout, and guest controls are ready to connect." })}><MoreHorizontal size={18} /></button>
            </div>
            <div className="relative aspect-video overflow-hidden bg-[#373a31]">
              <img src={HERO_IMAGE} alt="Graphite portrait study on an artist desk" className="absolute inset-0 h-full w-full object-cover opacity-75" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#1b1c19]/90 via-[#1b1c19]/15 to-transparent" />
              <div className="absolute left-4 top-4 flex items-center gap-2 rounded-sm bg-[#1e201c]/70 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#f5f0e7] backdrop-blur-sm"><Video size={13} /> Host preview</div>
              <div className="absolute bottom-4 left-4 max-w-sm text-[#f5f0e7] sm:bottom-6 sm:left-6"><p className="mb-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#d8dfc7]">Your camera · host view</p><p className="display-face text-2xl leading-tight sm:text-3xl">Look for the quiet edge of the shadow.</p></div>
              <div className="absolute bottom-4 right-4 flex gap-2 sm:bottom-6 sm:right-6">
                <button type="button" aria-label={micOn ? "Mute microphone" : "Unmute microphone"} className="rounded-sm bg-[#f5f0e7]/90 p-2.5 text-[#30342d] transition hover:bg-white" onClick={() => setMicOn((value) => !value)}>{micOn ? <Mic size={16} /> : <VideoOff size={16} />}</button>
                <button type="button" aria-label={cameraOn ? "Turn camera off" : "Turn camera on"} className="rounded-sm bg-[#f5f0e7]/90 p-2.5 text-[#30342d] transition hover:bg-white" onClick={() => setCameraOn((value) => !value)}>{cameraOn ? <Video size={16} /> : <VideoOff size={16} />}</button>
                <button type="button" aria-label="Share screen" className="rounded-sm bg-[#c96e52] p-2.5 text-[#fff8ed] transition hover:bg-[#b65f47]" onClick={() => toast("Screen share ready", { description: "Connect your broadcast provider to share a second camera or reference." })}><MonitorUp size={16} /></button>
              </div>
            </div>
          </section>

          <section className="workbench-panel paper-card overflow-hidden rounded-sm border border-[#d8d1c4]">
            <div className="flex flex-col gap-3 border-b border-[#e1d9cc] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e1e7d6] text-[#67735c]"><PenLine size={16} /></span><div><div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#c96e52]">Core artifact</div><h2 className="display-face text-lg font-semibold text-[#30342d]">Shared sketch sheet</h2><p className="text-[11px] text-[#7c7a70]">Everyone can draw on their own canvas</p></div></div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-[#67735c]"><span className="h-1.5 w-1.5 rounded-full bg-[#67735c]" /> Autosaved locally</div>
            </div>
            <div className="canvas-frame mx-4 mt-4 overflow-hidden rounded-sm sm:mx-5">
              <canvas ref={canvasRef} className="block h-auto max-h-[58vh] min-h-[260px] w-full touch-none bg-[#fffdf7]" onPointerDown={startDrawing} onPointerMove={draw} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} aria-label="Interactive drawing canvas" />
            </div>
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#7c7a70]">Tools</span>
                <button type="button" aria-label="Pencil" aria-pressed={tool === "pencil"} className={`tool-button flex items-center gap-2 rounded-sm px-2.5 py-2 text-xs font-semibold ${tool === "pencil" ? "bg-[#67735c] text-[#faf7f0]" : "bg-[#eee9df] text-[#53564a] hover:bg-[#e5dfd2]"}`} onClick={() => setTool("pencil")}><PenLine size={15} /> Pencil</button>
                <button type="button" aria-label="Eraser" aria-pressed={tool === "eraser"} className={`tool-button flex items-center gap-2 rounded-sm px-2.5 py-2 text-xs font-semibold ${tool === "eraser" ? "bg-[#67735c] text-[#faf7f0]" : "bg-[#eee9df] text-[#53564a] hover:bg-[#e5dfd2]"}`} onClick={() => setTool("eraser")}><Eraser size={15} /> Eraser</button>
                <span className="mx-1 h-6 w-px bg-[#ddd5c8]" />
                <button type="button" aria-label="Undo" className="tool-button rounded-sm bg-[#eee9df] p-2 text-[#53564a] disabled:cursor-not-allowed disabled:opacity-35" onClick={undo} disabled={!historyCount}><Undo2 size={16} /></button>
                <button type="button" aria-label="Redo" className="tool-button rounded-sm bg-[#eee9df] p-2 text-[#53564a] disabled:cursor-not-allowed disabled:opacity-35" onClick={redo} disabled={!redoCount}><Redo2 size={16} /></button>
                <button type="button" aria-label="Clear canvas" className="tool-button rounded-sm bg-[#eee9df] p-2 text-[#53564a] hover:bg-[#f2d9d0] hover:text-[#a24e3b]" onClick={clearCanvas}><Trash2 size={16} /></button>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5" aria-label="Color palette">
                  {["#30342d", "#67735c", "#c96e52", "#baa58a", "#ede3d1"].map((swatch) => <button type="button" key={swatch} aria-label={`Use ${swatch}`} className={`h-5 w-5 rounded-full border-2 transition hover:scale-110 ${color === swatch ? "border-[#30342d] ring-2 ring-[#d3ccbd]" : "border-[#faf7f0]"}`} style={{ backgroundColor: swatch }} onClick={() => { setColor(swatch); setTool("pencil"); }} />)}
                </div>
                <label className="flex items-center gap-2 text-[11px] font-semibold text-[#68685e]">Size <input aria-label="Brush size" type="range" min="1" max="18" value={size} onChange={(event) => setSize(Number(event.target.value))} className="w-20 accent-[#67735c]" /></label>
              </div>
            </div>
            <div className="flex flex-col gap-3 border-t border-[#e1d9cc] px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div className="flex items-center gap-2 text-[#7c7a70]"><Check size={15} className="text-[#67735c]" /><span>Saved locally • {savedAt}</span></div>
              <div className="flex items-center gap-2"><button type="button" className="tool-button flex items-center gap-2 rounded-sm px-2.5 py-2 font-semibold text-[#67735c] hover:bg-[#ece6da]" onClick={saveCanvas}><Save size={15} /> Save study</button><button type="button" className="tool-button flex items-center gap-2 rounded-sm bg-[#30342d] px-3 py-2 font-semibold text-[#faf7f0] hover:bg-[#454b3e]" onClick={exportCanvas}><Download size={15} /> Export PNG</button></div>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="workbench-panel paper-card rounded-sm border border-[#d8d1c4] p-4 sm:p-5">
            <div className="flex items-start justify-between"><SectionLabel tone="clay">Today's prompt</SectionLabel><Sparkles size={16} className="text-[#c96e52]" /></div>
            <h2 className="display-face max-w-[245px] text-2xl font-semibold leading-[1.05] text-[#30342d]">Draw the shadow before the object.</h2>
            <p className="mt-3 text-sm leading-6 text-[#68685e]">Give the dark shape a full minute. Let it be strange. The light will find its way in later.</p>
            <div className="mt-4 overflow-hidden rounded-sm"><img src={PORTRAIT_IMAGE} alt="Graphite portrait lesson reference" className="h-36 w-full object-cover object-center" /></div>
            <button type="button" className="mt-4 flex w-full items-center justify-between border-t border-[#e1d9cc] pt-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-[#67735c]" onClick={() => toast("Prompt notes opened", { description: "Add reference notes to this lesson from the host controls." })}>Open prompt notes <ChevronDown size={15} /></button>
          </section>

          <section className="workbench-panel paper-card rounded-sm border border-[#d8d1c4] p-4 sm:p-5">
            <div className="flex items-center justify-between"><SectionLabel>In the room · 08</SectionLabel><button type="button" className="text-[#7c7a70] transition hover:text-[#30342d]" onClick={() => toast("Participant tools", { description: "Mute, spotlight, and invite controls are ready to connect." })}><MoreHorizontal size={17} /></button></div>
            <div className="mb-4 flex items-center gap-2"><div className="flex -space-x-2">{["AL", "JM", "KT", "RS"].map((initials, index) => <span key={initials} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#faf7f0] text-[10px] font-bold ${index === 0 ? "bg-[#c96e52] text-[#fff8ed]" : index === 1 ? "bg-[#67735c] text-[#faf7f0]" : index === 2 ? "bg-[#d6c4a9] text-[#4d4e43]" : "bg-[#dfe3d6] text-[#67735c]"}`}>{initials}</span>)}</div><span className="text-xs text-[#68685e]">+ 4 quietly making</span></div>
            <div className="space-y-3">{[["Ari L.", "Working in charcoal", "AL"], ["Jules M.", "Trying the soft edge", "JM"], ["Kai T.", "Listening", "KT"]].map(([name, note, initials]) => <div key={name} className="flex items-center gap-3"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ece6da] text-[9px] font-bold text-[#67735c]">{initials}</span><div className="min-w-0"><p className="truncate text-xs font-semibold text-[#30342d]">{name}</p><p className="truncate text-[11px] text-[#858278]">{note}</p></div><span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#67735c]" /></div>)}</div>
            <button type="button" className="mt-4 flex w-full items-center justify-center gap-2 border-t border-[#e1d9cc] pt-3 text-xs font-bold text-[#67735c]" onClick={() => toast("Chat opened", { description: "Keep participant conversation beside the workbench." })}><MessageCircle size={15} /> Open room chat</button>
          </section>

          <section className="rule-lines workbench-panel rounded-sm border border-[#d8d1c4] bg-[#ece8dd] p-4 sm:p-5">
            <SectionLabel>Next on the table</SectionLabel>
            <div className="flex gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f8f4eb] text-[#67735c]"><Clock3 size={16} /></div><div><p className="text-sm font-bold text-[#30342d]">The generous eraser</p><p className="mt-1 text-xs leading-5 text-[#68685e]">Friday · 6:00 PM · 75 minutes</p><button type="button" className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#c96e52]" onClick={() => onNavigate("schedule")}>View schedule →</button></div></div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ScheduleView({ onNavigate }: { onNavigate: (view: ViewName) => void }) {
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-[#d8d1c4] pb-5 sm:flex-row sm:items-end sm:justify-between"><div><SectionLabel>Class calendar</SectionLabel><h1 className="display-face text-4xl font-semibold tracking-[-0.04em] text-[#252820]">Make a little room.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#68685e]">Plan the next study, send the room link, and keep the materials close.</p></div><button type="button" className="tool-button flex items-center gap-2 self-start rounded-sm bg-[#67735c] px-3 py-2 text-xs font-semibold text-[#faf7f0]" onClick={() => toast.success("New class draft created", { description: "Add a title, date, and prompt from your host settings." })}><Plus size={15} /> New class</button></header>
      <div className="grid gap-5 lg:grid-cols-2"><div className="paper-card overflow-hidden rounded-sm border border-[#d8d1c4] lg:col-span-2"><div className="grid md:grid-cols-[1.15fr_.85fr]"><img src={HERO_IMAGE} alt="Graphite portrait study on a studio table" className="h-64 w-full object-cover md:h-full" /><div className="p-5 sm:p-7"><div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.17em] text-[#c96e52]"><span className="h-1.5 w-1.5 rounded-full bg-[#c96e52]" /> Next live class</div><h2 className="display-face text-3xl font-semibold leading-tight text-[#30342d]">The generous eraser</h2><p className="mt-3 text-sm leading-6 text-[#68685e]">A 75-minute graphite study about subtraction, soft edges, and the parts we leave unfinished on purpose.</p><div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-[#67735c]"><span className="rounded-sm bg-[#e4eadb] px-2.5 py-1.5">Friday, Sep 04</span><span className="rounded-sm bg-[#eee9df] px-2.5 py-1.5">6:00 PM</span><span className="rounded-sm bg-[#eee9df] px-2.5 py-1.5">75 min</span></div><div className="mt-6 flex gap-2"><button type="button" className="tool-button rounded-sm bg-[#30342d] px-3 py-2 text-xs font-semibold text-[#faf7f0]" onClick={() => toast("Class link copied", { description: "Share it with your students before the room opens." })}>Copy room link</button><button type="button" className="tool-button rounded-sm border border-[#cfc7b8] px-3 py-2 text-xs font-semibold text-[#30342d]" onClick={() => toast("Class editor opened", { description: "Materials and prompts are ready to customize." })}>Edit details</button></div></div></div></div><div className="paper-card rounded-sm border border-[#d8d1c4] p-5"><SectionLabel>Upcoming · 02</SectionLabel><div className="space-y-4">{[["Gesture warm-up", "Sep 11 · 6:00 PM", "15 spots"], ["Ink, water, patience", "Sep 18 · 6:00 PM", "18 spots"]].map(([title, date, spots]) => <div key={title} className="flex items-center gap-3 border-b border-[#e6dfd3] pb-4 last:border-0 last:pb-0"><div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-sm bg-[#eee9df] text-[#67735c]"><CalendarDays size={16} /><span className="mt-0.5 text-[8px] font-bold uppercase">Fri</span></div><div className="min-w-0"><p className="text-sm font-bold text-[#30342d]">{title}</p><p className="mt-1 text-xs text-[#7c7a70]">{date} · {spots}</p></div><button type="button" className="ml-auto text-[#67735c]" aria-label={`Edit ${title}`} onClick={() => toast("Class editor opened", { description: `Update materials for ${title}.` })}><MoreHorizontal size={17} /></button></div>)}</div></div><div className="paper-card rounded-sm border border-[#d8d1c4] p-5"><SectionLabel>Host checklist</SectionLabel><div className="space-y-3">{["Choose a reference image", "Write one generous prompt", "Test your camera + mic"].map((item, index) => <button type="button" key={item} className="flex w-full items-center gap-3 text-left text-sm text-[#4f5147]" onClick={() => toast("Checklist updated", { description: item })}><span className={`flex h-5 w-5 items-center justify-center rounded-full border ${index < 2 ? "border-[#67735c] bg-[#e4eadb] text-[#67735c]" : "border-[#cfc7b8] text-transparent"}`}><Check size={13} /></span>{item}</button>)}</div></div></div>
      <button type="button" className="text-xs font-bold uppercase tracking-[0.16em] text-[#67735c]" onClick={() => onNavigate("workbench")}>← Back to workbench</button>
    </div>
  );
}

function LibraryView({ onNavigate }: { onNavigate: (view: ViewName) => void }) {
  return (
    <div className="space-y-6">
      <header className="border-b border-[#d8d1c4] pb-5"><SectionLabel>Study library</SectionLabel><h1 className="display-face text-4xl font-semibold tracking-[-0.04em] text-[#252820]">Keep the good marks.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-[#68685e]">A small archive of references, saved studies, and prompts to bring back into the room.</p></header>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[[PORTRAIT_IMAGE, "Portrait / soft edge", "Saved today"], [STUDY_IMAGE, "Desk study / graphite", "Saved yesterday"], [HERO_IMAGE, "Shadow first", "Reference"]].map(([image, title, meta]) => <button type="button" key={title} className="paper-card group overflow-hidden rounded-sm border border-[#d8d1c4] text-left transition hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(51,53,39,.12)]" onClick={() => toast("Study opened", { description: `${title} is ready on the workbench.` })}><div className="aspect-[4/3] overflow-hidden bg-[#e9e4d9]"><img src={image} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" /></div><div className="p-4"><p className="text-sm font-bold text-[#30342d]">{title}</p><p className="mt-1 text-xs text-[#858278]">{meta}</p></div></button>)}</div>
      <button type="button" className="text-xs font-bold uppercase tracking-[0.16em] text-[#67735c]" onClick={() => onNavigate("workbench")}>← Back to workbench</button>
    </div>
  );
}

export default function Home() {
  const [activeView, setActiveView] = useState<ViewName>("workbench");
  const navigate = (view: ViewName) => setActiveView(view);

  return (
    <div className="lesson-shell paper-grain">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[246px] flex-col bg-[#20221d] px-4 py-5 text-[#f5f0e7] md:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-2 pb-5"><img src={BRAND_MARK} alt="" className="h-10 w-10 object-contain" /><div><p className="display-face text-xl font-semibold leading-none">Atelier</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#b7c2a2]">Live studio</p></div></div>
        <div className="mt-7 px-2"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Your studio</p><p className="mt-2 text-xs leading-5 text-white/55">Host a thoughtful room.<br />Keep the tools close.</p></div>
        <nav className="mt-5 space-y-1" aria-label="Primary navigation"><NavItem icon={LayoutGrid} label="Workbench" active={activeView === "workbench"} onClick={() => navigate("workbench")} /><NavItem icon={CalendarDays} label="Schedule" active={activeView === "schedule"} onClick={() => navigate("schedule")} /><NavItem icon={Library} label="Study library" active={activeView === "library"} onClick={() => navigate("library")} /></nav>
        <div className="mt-auto space-y-1"><button type="button" className="nav-ink flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-[13px] font-medium" onClick={() => toast("Room settings", { description: "Customize your host profile and default class tools." })}><Settings2 size={16} /> Settings</button><button type="button" className="nav-ink flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-left text-[13px] font-medium" onClick={() => toast("Help center", { description: "Find thoughtful guidance for hosting your next room." })}><CircleHelp size={16} /> Help center</button><div className="mt-4 flex items-center gap-3 border-t border-white/10 px-2 pt-4"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d6c4a9] text-[10px] font-bold text-[#30342d]">ML</span><div className="min-w-0"><p className="truncate text-xs font-semibold">Mara L.</p><p className="truncate text-[10px] text-white/40">Host account</p></div><button type="button" aria-label="Account menu" className="ml-auto text-white/45" onClick={() => toast("Account menu", { description: "Profile settings are ready to connect." })}><MoreHorizontal size={16} /></button></div></div>
      </aside>

      <div className="md:pl-[246px]">
        <header className="flex h-[68px] items-center justify-between border-b border-[#d8d1c4] bg-[#f5f0e7]/92 px-4 backdrop-blur-xl sm:px-6 md:px-8"><div className="flex items-center gap-3 md:hidden"><img src={BRAND_MARK} alt="" className="h-8 w-8 object-contain" /><span className="display-face text-lg font-semibold text-[#30342d]">Atelier Live</span></div><div className="hidden items-center gap-3 md:flex"><div className="flex items-center gap-2 border-r border-[#d8d1c4] pr-4"><img src={BRAND_MARK} alt="" className="h-7 w-7 object-contain" /><span className="display-face text-base font-semibold text-[#30342d]">Atelier Live</span></div><span className="h-2 w-2 rounded-full bg-[#67735c]" /><span className="text-xs font-semibold text-[#67685d]">Wednesday, September 02, 2026</span></div><div className="flex items-center gap-2"><button type="button" aria-label="Notifications" className="rounded-sm p-2 text-[#68685e] transition hover:bg-[#eae4d8] hover:text-[#30342d]" onClick={() => toast("No new notes", { description: "You are caught up with the room." })}><Bell size={17} /></button><button type="button" className="flex items-center gap-2 rounded-sm border border-[#cfc7b8] bg-[#faf7f0] px-2.5 py-1.5 text-xs font-semibold text-[#30342d] transition hover:bg-white" onClick={() => toast("Host menu", { description: "Profile and account settings are ready to connect." })}><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#67735c] text-[8px] font-bold text-white">ML</span><span className="hidden sm:inline">Mara</span><ChevronDown size={14} /></button></div></header>
        <main className="container py-7 sm:py-9 lg:py-11">{activeView === "workbench" ? <Workbench onNavigate={navigate} /> : activeView === "schedule" ? <ScheduleView onNavigate={navigate} /> : <LibraryView onNavigate={navigate} />}</main>
      </div>
    </div>
  );
}
