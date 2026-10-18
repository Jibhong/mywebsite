"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import atlas from "./atlas.json";
import { useRouter } from "next/navigation";


const size = 128;

type Values = Record<string, number>;
type Pos = { x: number; y: number };


export function Solas() {
  const router = useRouter();

  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const [facing, setFacing] = useState(0);
  const [mouth, setMouth] = useState(0);
  const [eye, setEye] = useState(0);
  const [flipped, setFlipped] = useState(0);

  const [showChat, setShowChat] = useState(false);
  const [chatText, setChatText] = useState("Hi! I'm Solas.");

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputFocusRef = useRef(false);

  const isHoverRef = useRef(false);

  const nowRef = useRef(pos); // latest nowPos for the timer loop
  nowRef.current = pos;
  const rafRef = useRef(0);

  // random walk
  useEffect(() => {
    function move(to: Pos, ms = 1000): Promise<void> {
      cancelAnimationFrame(rafRef.current);
      const from = { ...nowRef.current };
      setFacing(Math.abs(from.x - to.x) > 0.1 ? 1 : 0);
      setFlipped(from.x > to.x ? 1 : 0);
      const start = performance.now();

      return new Promise(resolve => {
        const tick = (time: number) => {
          const t = Math.min((time - start) / ms, 1);
          const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
          const e = ease(t);
          setPos({
            x: from.x + (to.x - from.x) * e,
            y: from.y + (to.y - from.y) * e,
          });
          if (t < 1) rafRef.current = requestAnimationFrame(tick);
          else resolve();
        };
        rafRef.current = requestAnimationFrame(tick);
      });
    }
    async function randomWalk() {
      const from = nowRef.current;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.min(1, Math.random() + 0.2) * 0.3 * 0.99;
      await move({
        x: Math.min(1, Math.max(0, from.x + Math.cos(angle) * dist)),
        y: Math.min(1, Math.max(0, from.y + Math.sin(angle) * dist)),
      });
      setFacing(0);
    }
    let t: ReturnType<typeof setTimeout>;
    const loop = async () => {
      if (!isHoverRef.current) await randomWalk();
      t = setTimeout(loop, 3000 + Math.random() * 2000);
    };
    t = setTimeout(loop, 1);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearHideTimer() {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }

  function solasHoverStart() {
    clearHideTimer(); // reset: cancel the pending hide
    setShowChat(true);
    isHoverRef.current = true;
  }

  function solasHoverEnd() {
    if (inputFocusRef.current) return;
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      setShowChat(false);
      isHoverRef.current = false;
      hideTimerRef.current = null;
    }, 2000);
  }

  function solasClick() {
    setEye(1);
    setMouth(1);
    setTimeout(() => {
      setEye(0);
      setMouth(0);
    }, 300);
  }

  async function sendChat(e: React.SubmitEvent) {

    e.preventDefault();
    const inputText = input.trim().slice(0, 50);;
    if (!inputText || loading) return;
    setInput("");
    setLoading(true);

    const res = await fetch("/api/solas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          chatText ? { role: "assistant", content: chatText } : {},
          { role: "user", content: inputText },
        ],
      }),
    });
    if (res.ok) {
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let outputText = "";
      let oldTextLen = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let ev;
          try {
            ev = JSON.parse(line);
          } catch {
            continue;
          }


          if (ev.type === "text") {
            outputText += ev.text;
            if (outputText.length - oldTextLen > 10) {
              setMouth((m) => (m === 1 ? 0 : 1));
              oldTextLen = outputText.length;
            }
            setChatText(outputText);
          } else if (ev.type === "navigate") {
            router.push(ev.path);
          }
        }
      }
    } else {
      setChatText("I'm hungry, give me some ram.");
    }
    setMouth(0);
    setLoading(false);
  }

  const values: Values = { facing, mouth, eye };
  const key = atlas.meta.fieldOrder.map(f => `${f}=${values[f]}`).join("|");
  const frame = atlas.frames[(atlas.lookup as Record<string, number>)[key]];
  const scale = size / atlas.meta.cell.w;
  const L = `((100vw - ${size}px) * ${pos.x})`; // Solas left edge in px
  const W = 224;                               // bubble width (w-56)
  const below = pos.y < 0.25;

  const bubbleRef = useRef<HTMLDivElement>(null);
  const [bubbleH, setBubbleH] = useState(0);
  useLayoutEffect(() => {
    if (showChat && bubbleRef.current) setBubbleH(bubbleRef.current.offsetHeight);
  }, [chatText, showChat]);


  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatText]);

  return (
    <div
      className="fixed z-50 cursor-pointer"
      onClick={solasClick}
      onPointerEnter={solasHoverStart}
      onPointerLeave={solasHoverEnd}
      style={{
        left: `calc((100vw - ${size}px) * ${pos.x})`,
        top: `calc((100dvh - ${size}px) * ${pos.y})`,
      }}
    >
      {showChat && (() => {
        const spaceAbove = pos.y * (window.innerHeight - size); // px above Solas
        const below = spaceAbove < bubbleH + 8;                  // doesn't fit above

        return (
          <div
            ref={bubbleRef}
            onClick={(e) => {
              e.stopPropagation();
              solasHoverStart();
            }}
            onPointerEnter={solasHoverStart}
            onPointerLeave={solasHoverEnd}
            className={`absolute top-0 flex w-56 cursor-default gap-1 transition-transform duration-300 ${below ? "flex-col-reverse" : "flex-col"
              }`}
            style={{
              left: `clamp(calc(8px - ${L}), ${(size - W) / 2}px, calc(100vw - ${W + 8}px - ${L}))`,
              transform: below
                ? `translateY(${size + 8}px)`
                : "translateY(calc(-100% - 8px))",
            }}
          >
            {/* chat bubble */}
            <div className="overflow-hidden rounded-xl border-2 border-gray-200 bg-white text-sm text-black">
              <div ref={chatRef}
                className="solas-scroll max-h-60 overflow-y-auto overscroll-contain whitespace-pre-wrap break-words p-2"
              >
                {chatText}
              </div>
            </div>

            {/* text box */}
            <form onSubmit={sendChat}>
              <input
                value={input}
                maxLength={50}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => {
                  inputFocusRef.current = true;
                  solasHoverStart();
                }}
                onBlur={() => {
                  inputFocusRef.current = false;
                  solasHoverEnd();
                }}
                placeholder="Say something..."
                className="w-full rounded-xl border-2 border-gray-200 bg-white px-2 py-1 text-sm text-black outline-none focus:border-orange-300"
              />
            </form>
          </div>
        );
      })()}

      <div
        role="img"
        aria-label="Solas"
        style={{
          width: size,
          height: size,
          backgroundImage: `url(${atlas.meta.image})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${atlas.meta.size.w * scale}px ${atlas.meta.size.h * scale}px`,
          backgroundPosition: `-${frame.x * scale}px -${frame.y * scale}px`,
          transform: `scaleX(${facing === 1 && flipped ? -1 : 1})`,
        }}
      />
    </div>
  );
}