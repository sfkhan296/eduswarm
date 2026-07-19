"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Presentation, FileText, Code2, Music, Video, Clapperboard,
  Globe, X, Loader2, Sparkles, Copy, Check,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import type { LangCode } from "@/lib/i18n";

// ─── Constants ────────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: "en" as LangCode, label: "English",    flag: "🇺🇸" },
  { code: "hi" as LangCode, label: "Hindi",      flag: "🇮🇳" },
  { code: "es" as LangCode, label: "Spanish",    flag: "🇪🇸" },
  { code: "fr" as LangCode, label: "French",     flag: "🇫🇷" },
  { code: "ar" as LangCode, label: "Arabic",     flag: "🇸🇦" },
  { code: "de" as LangCode, label: "German",     flag: "🇩🇪" },
  { code: "zh" as LangCode, label: "Chinese",    flag: "🇨🇳" },
  { code: "ja" as LangCode, label: "Japanese",   flag: "🇯🇵" },
  { code: "pt" as LangCode, label: "Portuguese", flag: "🇧🇷" },
  { code: "ru" as LangCode, label: "Russian",    flag: "🇷🇺" },
  { code: "ko" as LangCode, label: "Korean",     flag: "🇰🇷" },
  { code: "it" as LangCode, label: "Italian",    flag: "🇮🇹" },
];

// Maps detected language keyword → file extension
const CODE_EXTENSIONS: Record<string, string> = {
  python: "py", javascript: "js", typescript: "ts", java: "java",
  "c++": "cpp", cpp: "cpp", "c#": "cs", csharp: "cs", c: "c",
  go: "go", rust: "rs", ruby: "rb", swift: "swift", kotlin: "kt",
  php: "php", html: "html", css: "css", sql: "sql", bash: "sh",
  shell: "sh", r: "r", matlab: "m", scala: "scala", dart: "dart",
};

function detectExtension(code: string): string {
  const lower = code.toLowerCase();
  for (const [lang, ext] of Object.entries(CODE_EXTENSIONS)) {
    if (lower.includes(lang)) return ext;
  }
  return "txt";
}

export interface ToolsSidebarProps {
  currentTopic?: string;
}

// ─── ZIP / Open-XML helpers ───────────────────────────────────────────────────
function escXml(s: string) {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function u16(n: number){const b=new Uint8Array(2);new DataView(b.buffer).setUint16(0,n,true);return b;}
function u32(n: number){const b=new Uint8Array(4);new DataView(b.buffer).setUint32(0,n,true);return b;}
function cat(...a: Uint8Array[]){const t=a.reduce((s,x)=>s+x.length,0);const o=new Uint8Array(t);let p=0;for(const x of a){o.set(x,p);p+=x.length;}return o;}

// ─── CRC-32 (required by ZIP spec — PowerPoint rejects files without it) ──────
function crc32(data: Uint8Array): number {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function localHdr(name: Uint8Array, data: Uint8Array, crc: number) {
  return cat(
    new Uint8Array([0x50,0x4b,0x03,0x04]),
    u16(20), u16(0), u16(0), u16(0), u16(0),
    u32(crc), u32(data.length), u32(data.length),
    u16(name.length), u16(0),
    name
  );
}
function centralHdr(name: Uint8Array, data: Uint8Array, crc: number, off: number) {
  return cat(
    new Uint8Array([0x50,0x4b,0x01,0x02]),
    u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
    u32(crc), u32(data.length), u32(data.length),
    u16(name.length), u16(0), u16(0), u16(0), u16(0),
    u32(0), u32(off),
    name
  );
}
function eocd(cnt: number,cdSz: number,cdOff: number){return cat(new Uint8Array([0x50,0x4b,0x05,0x06]),u16(0),u16(0),u16(cnt),u16(cnt),u32(cdSz),u32(cdOff),u16(0));}

function zipDownload(files: Record<string, string>, filename: string) {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const cd: Uint8Array[] = [];
  let off = 0;
  for (const [name, content] of Object.entries(files)) {
    const nb = enc.encode(name);
    const db = enc.encode(content);
    const crc = crc32(db);
    const lh = localHdr(nb, db, crc);
    const ch = centralHdr(nb, db, crc, off);
    parts.push(lh, db);
    cd.push(ch);
    off += lh.length + db.length;
  }
  const cdSz = cd.reduce((s, b) => s + b.length, 0);
  const blob = new Blob(
    [...(parts as BlobPart[]), ...(cd as BlobPart[]), eocd(cd.length, cdSz, off) as BlobPart],
    { type: "application/zip" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ─── PPT builder ──────────────────────────────────────────────────────────────
interface Slide { title: string; bullets: string[]; }

function parseSlides(content: string): Slide[] {
  const blocks = content.split(/\n(?=Slide \d+[:.]\s)/i).filter(Boolean);
  if (blocks.length < 2) {
    // Fallback: split by blank lines
    return content.split(/\n{2,}/).filter(Boolean).map((block, i) => {
      const lines = block.split("\n").map(l=>l.trim()).filter(Boolean);
      return { title: lines[0] ?? `Slide ${i+1}`, bullets: lines.slice(1).map(l=>l.replace(/^[-•*]\s*/,"")) };
    });
  }
  return blocks.map((block, idx) => {
    const lines = block.split("\n").map(l=>l.trim()).filter(Boolean);
    const title = lines[0]?.replace(/^Slide \d+[:.]\s*/i,"") ?? `Slide ${idx+1}`;
    const bullets = lines.slice(1).map(l=>l.replace(/^[-•*]\s*/,"")).filter(Boolean);
    return { title, bullets };
  });
}

function buildPptx(topic: string, slides: Slide[]) {
  // Build each slide XML with proper styling and layout
  const SLIDE_W = 9144000; // EMUs (12192000 / 96 * 72)
  const SLIDE_H = 5143500;

  const slideXmls = slides.map(({ title, bullets }) => {
    const bulletParas = bullets
      .filter(b => b.trim())
      .map(b => `
        <a:p>
          <a:pPr marL="342900" indent="-342900">
            <a:buChar char="&#x2022;"/>
          </a:pPr>
          <a:r>
            <a:rPr lang="en-US" sz="2000" dirty="0"/>
            <a:t>${escXml(b.trim())}</a:t>
          </a:r>
        </a:p>`).join("");

    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
       xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
       xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm><a:off x="0" y="0"/><a:ext cx="${SLIDE_W}" cy="${SLIDE_H}"/><a:chOff x="0" y="0"/><a:chExt cx="${SLIDE_W}" cy="${SLIDE_H}"/></a:xfrm>
      </p:grpSpPr>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title"/>
          <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
          <p:nvPr><p:ph type="title"/></p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="457200" y="274638"/><a:ext cx="8229600" cy="1143000"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          <a:solidFill><a:srgbClr val="4F46E5"/></a:solidFill>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="en-US" sz="3200" b="1" dirty="0">
                <a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill>
              </a:rPr>
              <a:t>${escXml(title)}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="Content"/>
          <p:cNvSpPr><a:spLocks noGrp="1"/></p:cNvSpPr>
          <p:nvPr><p:ph idx="1"/></p:nvPr>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm><a:off x="457200" y="1600200"/><a:ext cx="8229600" cy="3347400"/></a:xfrm>
          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          ${bulletParas || `<a:p><a:r><a:rPr lang="en-US" sz="2000" dirty="0"/><a:t> </a:t></a:r></a:p>`}
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`;
  });

  // Slide relationship files (one per slide)
  const slideRelXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`;

  // Slide ID list for presentation.xml
  const slideIdList = slideXmls
    .map((_, i) => `<p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`)
    .join("\n        ");

  // Relationships for presentation.xml
  const presRels = slideXmls
    .map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`)
    .join("\n  ");

  // Content types for slides
  const slideContentTypes = slideXmls
    .map((_, i) => `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`)
    .join("\n  ");

  const files: Record<string, string> = {
    "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${slideContentTypes}
</Types>`,
    "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`,
    "ppt/presentation.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  saveSubsetFonts="1">
  <p:sldMasterIdLst/>
  <p:sldIdLst>
        ${slideIdList}
  </p:sldIdLst>
  <p:sldSz cx="${SLIDE_W}" cy="${SLIDE_H}" type="screen4x3"/>
  <p:notesSz cx="6858000" cy="9144000"/>
</p:presentation>`,
    "ppt/_rels/presentation.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${presRels}
</Relationships>`,
  };

  // Add each slide and its relationship file
  slideXmls.forEach((xml, i) => {
    files[`ppt/slides/slide${i + 1}.xml`] = xml;
    files[`ppt/slides/_rels/slide${i + 1}.xml.rels`] = slideRelXml;
  });

  zipDownload(files, `${topic.slice(0, 40).replace(/[^a-z0-9]/gi, "-")}.pptx`);
}

// ─── PPT Panel ────────────────────────────────────────────────────────────────
function PPTPanel({ topic: initTopic, lang }: { topic: string; lang: string }) {
  const { t } = useLanguage();
  const [topic, setTopic] = useState(initTopic);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => { setTopic(initTopic); }, [initTopic]);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setSlides([]); setRaw("");
    try {
      const res = await fetch("/api/backend/api/v1/chat/", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          message: `Create a PowerPoint presentation for: "${topic}". Format EXACTLY as:\nSlide 1: [Title]\n- bullet point\n- bullet point\nSlide 2: [Title]\n- bullet point\n...\nInclude: title slide, 5-7 content slides, summary slide. Respond in language: ${lang}.`,
          topic, level:"professional", language: lang, history:[],
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRaw(data.reply);
      setSlides(parseSlides(data.reply));
      setActiveSlide(0);
    } catch {
      setRaw("⚠️ Generation failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 px-3 py-2">
        Generates a slide-by-slide visual preview, then downloads a real <strong>.pptx</strong> file.
      </p>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("topic_label")}</label>
        <input value={topic} onChange={e=>setTopic(e.target.value)}
          placeholder="e.g. Photosynthesis, React hooks, World War II…"
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"/>
      </div>
      <Button onClick={generate} disabled={loading || !topic.trim()} className="w-full gap-2">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin"/>{t("learn_generating")}</> : <><Sparkles className="h-4 w-4"/>{t("generate")} Slides</>}
      </Button>

      <AnimatePresence>
        {slides.length > 0 && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-3">
            {/* Slide tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {slides.map((s,i) => (
                <button key={i} onClick={()=>setActiveSlide(i)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium transition-all border
                    ${activeSlide===i ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 border-border hover:border-primary/40"}`}>
                  {i+1}
                </button>
              ))}
            </div>

            {/* Slide preview card */}
            <motion.div key={activeSlide} initial={{opacity:0,x:8}} animate={{opacity:1,x:0}}
              className="rounded-xl border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 p-5 min-h-[160px]">
              <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-widest mb-2">
                Slide {activeSlide+1} / {slides.length}
              </p>
              <h3 className="font-bold text-base mb-3 text-foreground">{slides[activeSlide]?.title}</h3>
              <ul className="space-y-1.5">
                {slides[activeSlide]?.bullets.map((b,j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-400 shrink-0"/>
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Nav + download */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-1">
                <button onClick={()=>setActiveSlide(i=>Math.max(0,i-1))} disabled={activeSlide===0}
                  className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-muted disabled:opacity-40 transition-colors">← Prev</button>
                <button onClick={()=>setActiveSlide(i=>Math.min(slides.length-1,i+1))} disabled={activeSlide===slides.length-1}
                  className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-muted disabled:opacity-40 transition-colors">Next →</button>
              </div>
              <Button size="sm" onClick={()=>buildPptx(topic, slides)} className="gap-1.5">
                <Download className="h-3.5 w-3.5"/>{t("download")} .pptx
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Word Panel ───────────────────────────────────────────────────────────────
function WordPanel({ topic: initTopic, lang }: { topic: string; lang: string }) {
  const { t } = useLanguage();
  const [topic, setTopic] = useState(initTopic);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { setTopic(initTopic); }, [initTopic]);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setContent("");
    try {
      const res = await fetch("/api/backend/api/v1/chat/", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          message:`Write a comprehensive educational document on: "${topic}". Use ## headings for sections. Include: Introduction, Key Concepts, Real-world Examples, Common Misconceptions, Summary, Key Takeaways. Respond in language: ${lang}.`,
          topic, level:"professional", language: lang, history:[],
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setContent(data.reply);
    } catch { setContent("⚠️ Generation failed."); }
    finally { setLoading(false); }
  };

  const buildAndDownload = () => {
    const paragraphs = content.split("\n").map(line => {
      const trimmed = line.trim();
      if (!trimmed) return `<w:p/>`;
      const isH = /^#{1,3}\s/.test(trimmed);
      const text = trimmed.replace(/^#{1,3}\s*/,"");
      return `<w:p><w:pPr><w:pStyle w:val="${isH?"Heading1":"Normal"}"/></w:pPr><w:r><w:t xml:space="preserve">${escXml(text)}</w:t></w:r></w:p>`;
    }).join("\n");

    zipDownload({
      "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
      "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
      "word/document.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:pPr><w:pStyle w:val="Title"/></w:pPr><w:r><w:t>${escXml(topic)}</w:t></w:r></w:p>${paragraphs}<w:sectPr/></w:body></w:document>`,
      "word/_rels/document.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`,
    }, `${topic.slice(0,40)}.docx`);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 px-3 py-2">Generates a full document and downloads a real <strong>.docx</strong> file.</p>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("topic_label")}</label>
        <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Climate change, Machine learning…"
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"/>
      </div>
      <Button onClick={generate} disabled={loading||!topic.trim()} className="w-full gap-2">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin"/>{t("learn_generating")}</> : <><Sparkles className="h-4 w-4"/>{t("generate")} Document</>}
      </Button>
      <AnimatePresence>
        {content && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t("preview")}</span>
              <div className="flex gap-1">
                <button onClick={async()=>{await navigator.clipboard.writeText(content);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs border hover:bg-muted transition-colors">
                  {copied?<><Check className="h-3 w-3 text-emerald-500"/>{t("copied")}</>:<><Copy className="h-3 w-3"/>{t("copy")}</>}
                </button>
                <button onClick={buildAndDownload} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs border hover:bg-muted transition-colors">
                  <Download className="h-3 w-3"/>.docx
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap rounded-xl border bg-muted/30 p-3 text-xs leading-relaxed max-h-80 overflow-y-auto">{content}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Code Panel ───────────────────────────────────────────────────────────────
function CodePanel({ topic: initTopic }: { topic: string }) {
  const { t } = useLanguage();
  const [topic, setTopic] = useState(initTopic);
  const [code, setCode] = useState("");
  const [ext, setExt] = useState("txt");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => { setTopic(initTopic); }, [initTopic]);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setCode("");
    try {
      const res = await fetch("/api/backend/api/v1/chat/", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          message:`Generate ONLY working code for: "${topic}". Rules: output raw code only — zero prose outside of inline comments. Include a beginner example then an intermediate example. Pick the most appropriate programming language and state it in the very first comment line (e.g. // Language: JavaScript).`,
          topic, level:"professional", language: "en", history:[],
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const reply: string = data.reply;
      // Strip markdown fences if present
      const stripped = reply.replace(/^```[\w]*\n?/,"").replace(/\n?```$/,"").trim();
      setCode(stripped);
      setExt(detectExtension(stripped));
    } catch { setCode("// ⚠️ Generation failed."); setExt("txt"); }
    finally { setLoading(false); }
  };

  const download = () => {
    const slug = topic.toLowerCase().replace(/\s+/g,"-").slice(0,30);
    const blob = new Blob([code], {type:"text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`${slug}.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 px-3 py-2">
        Returns <strong>only code</strong> — no explanations. Downloads with the correct file extension for the detected language.
      </p>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("topic_label")}</label>
        <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. Binary search in Python, React useState hook…"
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"/>
      </div>
      <Button onClick={generate} disabled={loading||!topic.trim()} className="w-full gap-2">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin"/>{t("learn_generating")}</> : <><Sparkles className="h-4 w-4"/>{t("generate")} Code</>}
      </Button>
      <AnimatePresence>
        {code && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                {t("preview")}
                <span className="rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 text-[10px] font-bold font-mono">.{ext}</span>
              </span>
              <div className="flex gap-1">
                <button onClick={async()=>{await navigator.clipboard.writeText(code);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs border hover:bg-muted transition-colors">
                  {copied?<><Check className="h-3 w-3 text-emerald-500"/>{t("copied")}</>:<><Copy className="h-3 w-3"/>{t("copy")}</>}
                </button>
                <button onClick={download} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs border hover:bg-muted transition-colors">
                  <Download className="h-3 w-3"/>.{ext}
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap rounded-xl border bg-[#1e1e2e] text-green-300 p-3 text-xs leading-relaxed font-mono max-h-96 overflow-y-auto">{code}</pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── MP3 Panel ────────────────────────────────────────────────────────────────
// Step 1: generate script via LLM
// Step 2: send script to backend /api/v1/tts/ → get real .mp3 blob → play + download
const VOICE_GENDERS = [
  { id: "female", label: "Female", icon: "👩" },
  { id: "male",   label: "Male",   icon: "👨" },
  { id: "boy",    label: "Boy",    icon: "👦" },
  { id: "girl",   label: "Girl",   icon: "👧" },
];
const MP3_DURATIONS = [1, 2, 3, 5];

function MP3Panel({ topic: initTopic, lang }: { topic: string; lang: string }) {
  const { t } = useLanguage();
  const [topic, setTopic]         = useState(initTopic);
  const [voiceGender, setVoice]   = useState("female");
  const [minutes, setMinutes]     = useState(2);
  const [script, setScript]       = useState("");
  const [loadingScript, setLS]    = useState(false);
  const [loadingAudio, setLA]     = useState(false);
  const [audioUrl, setAudioUrl]   = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);
  const [playing, setPlaying]     = useState(false);
  const audioRef                  = useRef<HTMLAudioElement | null>(null);

  useEffect(() => { setTopic(initTopic); }, [initTopic]);
  // Revoke old blob URL when a new one is created
  useEffect(() => () => { if (audioUrl) URL.revokeObjectURL(audioUrl); }, [audioUrl]);

  // ── Step 1: generate script ─────────────────────────────────────────────────
  const generateScript = async () => {
    if (!topic.trim()) return;
    setLS(true); setScript(""); setAudioUrl(null);
    try {
      const res = await fetch("/api/backend/api/v1/chat/", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Write a natural, conversational ${minutes}-minute audio lesson about: "${topic}".
Output ONLY the spoken words — no markdown, no headings, no stage directions, no asterisks.
Voice style: ${voiceGender}. Respond in language: ${lang}.`,
          topic, level: "professional", language: lang, history: [],
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setScript(data.reply);
    } catch { setScript("⚠️ Script generation failed. Check the backend and try again."); }
    finally { setLS(false); }
  };

  // ── Step 2: send script to backend TTS → real .mp3 ──────────────────────────
  const generateAudio = async () => {
    if (!script.trim()) return;
    setLA(true); setAudioUrl(null);
    try {
      const res = await fetch("/api/backend/api/v1/tts/", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: script,
          language: lang,
          slow: voiceGender === "boy" || voiceGender === "girl",
        }),
      });
      if (!res.ok) throw new Error(`TTS failed: ${res.statusText}`);
      const blob = await res.blob(); // audio/mpeg
      setAudioUrl(URL.createObjectURL(blob));
    } catch (err) {
      alert("Audio generation failed: " + (err instanceof Error ? err.message : String(err)));
    } finally { setLA(false); }
  };

  const downloadMp3 = () => {
    if (!audioUrl) return;
    const a = document.createElement("a");
    a.href = audioUrl;
    a.download = `${topic.slice(0, 40).replace(/\s+/g, "-")}-lesson.mp3`;
    a.click();
  };

  const downloadScript = () => {
    const blob = new Blob([script], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${topic.slice(0, 40)}-script.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 px-3 py-2">
        Generate a script → convert to real <strong>.mp3</strong> via server TTS → play &amp; download.
      </p>

      {/* Topic */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("topic_label")}</label>
        <input value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="e.g. The water cycle, JavaScript closures…"
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"/>
      </div>

      {/* Voice */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Voice</label>
        <div className="grid grid-cols-2 gap-2">
          {VOICE_GENDERS.map(v => (
            <button key={v.id} onClick={() => setVoice(v.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all
                ${voiceGender === v.id
                  ? "border-pink-400 bg-pink-500/10 text-pink-600 dark:text-pink-400"
                  : "border-border hover:border-primary/30 hover:bg-muted/50"}`}>
              <span>{v.icon}</span>{v.label}
              {voiceGender === v.id && <Check className="h-3 w-3 ml-auto shrink-0 text-pink-500"/>}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Duration (minutes)</label>
        <div className="flex gap-2">
          {MP3_DURATIONS.map(d => (
            <button key={d} onClick={() => setMinutes(d)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all
                ${minutes === d ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"}`}>
              {d} min
            </button>
          ))}
        </div>
      </div>

      {/* Step 1: generate script */}
      <Button onClick={generateScript} disabled={loadingScript || !topic.trim()} className="w-full gap-2">
        {loadingScript
          ? <><Loader2 className="h-4 w-4 animate-spin"/>Generating script…</>
          : <><Sparkles className="h-4 w-4"/>Step 1 — Generate {minutes}-min Script</>}
      </Button>

      <AnimatePresence>
        {script && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            {/* Script preview */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Script</span>
              <div className="flex gap-1">
                <button onClick={async () => { await navigator.clipboard.writeText(script); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs border hover:bg-muted transition-colors">
                  {copied ? <><Check className="h-3 w-3 text-emerald-500"/>Copied</> : <><Copy className="h-3 w-3"/>Copy</>}
                </button>
                <button onClick={downloadScript}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs border hover:bg-muted transition-colors">
                  <Download className="h-3 w-3"/>.txt
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap rounded-xl border bg-muted/30 p-3 text-xs leading-relaxed max-h-36 overflow-y-auto">{script}</pre>

            {/* Step 2: convert to real mp3 */}
            <Button
              onClick={generateAudio}
              disabled={loadingAudio}
              variant="secondary"
              className="w-full gap-2 border border-pink-400/40 bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20"
            >
              {loadingAudio
                ? <><Loader2 className="h-4 w-4 animate-spin"/>Converting to MP3…</>
                : <><Music className="h-4 w-4"/>Step 2 — Generate .mp3 Audio</>}
            </Button>

            {/* Audio player + download */}
            <AnimatePresence>
              {audioUrl && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                  <audio
                    ref={audioRef}
                    controls
                    src={audioUrl}
                    className="w-full rounded-lg h-10"
                    onPlay={() => setPlaying(true)}
                    onPause={() => setPlaying(false)}
                    onEnded={() => setPlaying(false)}
                  />
                  <button
                    onClick={downloadMp3}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-pink-500 hover:bg-pink-600 text-white px-3 py-2.5 text-sm font-semibold transition-colors shadow-md shadow-pink-500/20"
                  >
                    <Download className="h-4 w-4"/>Download .mp3
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Video Panel ──────────────────────────────────────────────────────────────
const VIDEO_STYLES = [
  { id:"animated",  label:"Animated",  icon:"🎨" },
  { id:"original",  label:"Original",  icon:"🎬" },
];
const VOICE_TYPES = [
  { id:"male",   label:"Male",   icon:"👨" },
  { id:"female", label:"Female", icon:"👩" },
  { id:"boy",    label:"Boy",    icon:"👦" },
  { id:"girl",   label:"Girl",   icon:"👧" },
];
const DURATIONS = [1,2,3,5,10];

function VideoPanel({ topic: initTopic, lang }: { topic: string; lang: string }) {
  const { t } = useLanguage();
  const [topic, setTopic] = useState(initTopic);
  const [style, setStyle] = useState("animated");
  const [voice, setVoice] = useState("female");
  const [duration, setDuration] = useState(3);
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [didLoading, setDidLoading] = useState(false);
  const [didVideoUrl, setDidVideoUrl] = useState("");

  useEffect(()=>{ setTopic(initTopic); }, [initTopic]);

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setScript(""); setDidVideoUrl("");
    try {
      const res = await fetch("/api/backend/api/v1/chat/", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          message:`Write a ${duration}-minute ${style} educational video script about: "${topic}".
Voice: ${voice}. Format each scene as:
[Scene N] Visual: ... | Narrator (${voice} voice): ... | Duration: ~Xs
Keep tone engaging and educational. Respond in language: ${lang}.`,
          topic, level:"professional", language: lang, history:[],
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setScript(data.reply);
    } catch { setScript("⚠️ Generation failed."); }
    finally { setLoading(false); }
  };

  const download = () => {
    const blob = new Blob([script], {type:"text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`${topic.slice(0,40)}-video-script.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadVideo = async () => {
    if (!script.trim()) return;
    setVideoLoading(true);
    try {
      const res = await fetch("/api/backend/api/v1/video/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, language: lang, style, topic }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `eduswarm_video.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Video download failed:", err);
      alert("Video generation failed. Please try again.");
    } finally {
      setVideoLoading(false); }
  };

  const generateDidVideo = async () => {
    if (!script.trim()) return;
    setDidLoading(true); setDidVideoUrl("");
    try {
      const res = await fetch("/api/backend/api/v1/did-video/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, language: lang, voice, topic }),
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err.detail || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setDidVideoUrl(data.video_url);
    } catch (err: any) {
      console.error("D-ID video failed:", err);
      alert(`Avatar video failed: ${err.message}`);
    } finally {
      setDidLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 px-3 py-2">
        Configure your video then generate a production-ready script for tools like Synthesia, HeyGen, or Pictory.
      </p>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("topic_label")}</label>
        <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. How black holes work, Newton's laws…"
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"/>
      </div>

      {/* Style */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Video Style</label>
        <div className="grid grid-cols-2 gap-2">
          {VIDEO_STYLES.map(s=>(
            <button key={s.id} onClick={()=>setStyle(s.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all
                ${style===s.id ? "border-violet-400 bg-violet-500/10 text-violet-600 dark:text-violet-400" : "border-border hover:border-primary/30 hover:bg-muted/50"}`}>
              <span>{s.icon}</span>{s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Duration (minutes)</label>
        <div className="flex gap-2 flex-wrap">
          {DURATIONS.map(d=>(
            <button key={d} onClick={()=>setDuration(d)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all
                ${duration===d ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"}`}>
              {d} min
            </button>
          ))}
        </div>
      </div>

      {/* Voice */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Voice Type</label>
        <div className="grid grid-cols-2 gap-2">
          {VOICE_TYPES.map(v=>(
            <button key={v.id} onClick={()=>setVoice(v.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all
                ${voice===v.id ? "border-pink-400 bg-pink-500/10 text-pink-600 dark:text-pink-400" : "border-border hover:border-primary/30 hover:bg-muted/50"}`}>
              <span>{v.icon}</span>{v.label}
            </button>
          ))}
        </div>
      </div>

      <Button onClick={generate} disabled={loading||!topic.trim()} className="w-full gap-2">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin"/>{t("learn_generating")}</> : <><Sparkles className="h-4 w-4"/>Generate Script</>}
      </Button>

      <AnimatePresence>
        {script && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t("preview")}</span>
              <div className="flex gap-1">
                <button onClick={async()=>{await navigator.clipboard.writeText(script);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs border hover:bg-muted transition-colors">
                  {copied?<><Check className="h-3 w-3 text-emerald-500"/>{t("copied")}</>:<><Copy className="h-3 w-3"/>{t("copy")}</>}
                </button>
                <button onClick={download} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs border hover:bg-muted transition-colors">
                  <Download className="h-3 w-3"/>.txt
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap rounded-xl border bg-muted/30 p-3 text-xs leading-relaxed max-h-80 overflow-y-auto">{script}</pre>
            <button
              onClick={downloadVideo}
              disabled={videoLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-violet-400 bg-violet-500/10 px-3 py-2.5 text-sm font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {videoLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" />Generating MP4…</>
                : <><Video className="h-4 w-4" />Download Slide Video</>}
            </button>

            {/* D-ID AI Avatar Video */}
            <button
              onClick={generateDidVideo}
              disabled={didLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-pink-400 bg-pink-500/10 px-3 py-2.5 text-sm font-medium text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {didLoading
                ? <><Loader2 className="h-4 w-4 animate-spin"/>Creating avatar video (~60s)…</>
                : <><span>🤖</span>Generate AI Avatar Video</>}
            </button>

            {didVideoUrl && (
              <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
                className="rounded-xl border border-emerald-400/40 bg-emerald-500/5 p-3 space-y-2">
                <p className="text-xs font-semibold text-emerald-500">✅ Avatar video ready!</p>
                <a
                  href={didVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="eduswarm_avatar.mp4"
                  className="flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 transition-colors"
                >
                  <Download className="h-4 w-4"/>Download Avatar MP4
                </a>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Animation Panel ──────────────────────────────────────────────────────────
const CARTOON_STYLES = [
  { id:"anime",    label:"Anime",        icon:"⛩️",  color:"text-red-500",    bg:"bg-red-500/10"    },
  { id:"tomjerry", label:"Tom & Jerry",  icon:"🐭",  color:"text-yellow-500", bg:"bg-yellow-500/10" },
  { id:"dora",     label:"Dora",         icon:"🗺️",  color:"text-orange-500", bg:"bg-orange-500/10" },
  { id:"doraemon", label:"Doraemon",     icon:"🤖",  color:"text-blue-500",   bg:"bg-blue-500/10"   },
  { id:"heidi",    label:"Heidi",        icon:"⛰️",  color:"text-green-500",  bg:"bg-green-500/10"  },
];

function AnimationPanel({ topic: initTopic, lang }: { topic: string; lang: string }) {
  const { t } = useLanguage();
  const [topic, setTopic] = useState(initTopic);
  const [cartoonStyle, setCartoonStyle] = useState("anime");
  const [duration, setDuration] = useState(3);
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [didLoading, setDidLoading] = useState(false);
  const [didVideoUrl, setDidVideoUrl] = useState("");

  useEffect(()=>{ setTopic(initTopic); }, [initTopic]);

  const selected = CARTOON_STYLES.find(c=>c.id===cartoonStyle)!;

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setScript(""); setDidVideoUrl("");
    try {
      const res = await fetch("/api/backend/api/v1/chat/", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          message:`Write a ${duration}-minute animated educational explainer script in the style of "${selected.label}" about: "${topic}".
Format each scene as:
[Scene N]
Style: ${selected.label} animation
Setting: ...
Characters: ...
Action: ...
Dialogue: ...
Educational moment: ...
Duration: ~Xs

Make it fun, age-appropriate, and educational. Respond in language: ${lang}.`,
          topic, level:"child", history:[],
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setScript(data.reply);
    } catch { setScript("⚠️ Generation failed."); }
    finally { setLoading(false); }
  };

  const download = () => {
    const blob = new Blob([script], {type:"text/plain;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`${topic.slice(0,30)}-${cartoonStyle}-animation.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const downloadVideo = async () => {
    if (!script.trim()) return;
    setVideoLoading(true);
    try {
      const res = await fetch("/api/backend/api/v1/video/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, language: lang, style: cartoonStyle, topic }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `eduswarm_video.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Animation video failed:", err);
      alert("Video generation failed. Please try again.");
    } finally {
      setVideoLoading(false);
    }
  };

  const generateDidVideo = async () => {
    if (!script.trim()) return;
    setDidLoading(true); setDidVideoUrl("");
    try {
      const res = await fetch("/api/backend/api/v1/did-video/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script, language: lang, voice: "female", topic }),
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err.detail || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setDidVideoUrl(data.video_url);
    } catch (err: any) {
      console.error("D-ID animation video failed:", err);
      alert(`Avatar video failed: ${err.message}`);
    } finally {
      setDidLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 px-3 py-2">
        Pick a cartoon style and generate a scene-by-scene animated explainer script for your topic.
      </p>
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t("topic_label")}</label>
        <input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. How plants grow, Fractions, Gravity…"
          className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"/>
      </div>

      {/* Cartoon picker */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cartoon Style</label>
        <div className="grid grid-cols-1 gap-2">
          {CARTOON_STYLES.map(c=>(
            <motion.button key={c.id} onClick={()=>setCartoonStyle(c.id)}
              whileHover={{scale:1.01}} whileTap={{scale:0.98}}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all
                ${cartoonStyle===c.id ? `border-current ${c.bg} ${c.color} font-semibold` : "border-border hover:border-primary/30 hover:bg-muted/50"}`}>
              <span className="text-xl">{c.icon}</span>
              <span className="text-sm">{c.label}</span>
              {cartoonStyle===c.id && <Check className="h-3.5 w-3.5 ml-auto shrink-0"/>}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Duration (minutes)</label>
        <div className="flex gap-2 flex-wrap">
          {DURATIONS.map(d=>(
            <button key={d} onClick={()=>setDuration(d)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all
                ${duration===d ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30"}`}>
              {d} min
            </button>
          ))}
        </div>
      </div>

      <Button onClick={generate} disabled={loading||!topic.trim()} className={`w-full gap-2 ${selected.color}`}>
        {loading ? <><Loader2 className="h-4 w-4 animate-spin"/>{t("learn_generating")}</> : <><span>{selected.icon}</span>Generate {selected.label} Script</>}
      </Button>

      <AnimatePresence>
        {script && (
          <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{t("preview")}</span>
              <div className="flex gap-1">
                <button onClick={async()=>{await navigator.clipboard.writeText(script);setCopied(true);setTimeout(()=>setCopied(false),2000);}}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs border hover:bg-muted transition-colors">
                  {copied?<><Check className="h-3 w-3 text-emerald-500"/>{t("copied")}</>:<><Copy className="h-3 w-3"/>{t("copy")}</>}
                </button>
                <button onClick={download} className="flex items-center gap-1 rounded-md px-2 py-1 text-xs border hover:bg-muted transition-colors">
                  <Download className="h-3 w-3"/>.txt
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap rounded-xl border bg-muted/30 p-3 text-xs leading-relaxed max-h-80 overflow-y-auto">{script}</pre>
            <button
              onClick={downloadVideo}
              disabled={videoLoading}
              className={`w-full flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed
                ${selected.bg} ${selected.color} border-current hover:opacity-90`}
            >
              {videoLoading
                ? <><Loader2 className="h-4 w-4 animate-spin"/>Generating MP4…</>
                : <><span>{selected.icon}</span>Download {selected.label} Slide Video</>}
            </button>

            {/* D-ID AI Avatar Video */}
            <button
              onClick={generateDidVideo}
              disabled={didLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-pink-400 bg-pink-500/10 px-3 py-2.5 text-sm font-medium text-pink-600 dark:text-pink-400 hover:bg-pink-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {didLoading
                ? <><Loader2 className="h-4 w-4 animate-spin"/>Creating avatar video (~60s)…</>
                : <><span>🤖</span>Generate AI Avatar Video</>}
            </button>

            {didVideoUrl && (
              <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
                className="rounded-xl border border-emerald-400/40 bg-emerald-500/5 p-3 space-y-2">
                <p className="text-xs font-semibold text-emerald-500">✅ Avatar video ready!</p>
                <a
                  href={didVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="eduswarm_avatar.mp4"
                  className="flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 transition-colors"
                >
                  <Download className="h-4 w-4"/>Download Avatar MP4
                </a>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Language Panel ───────────────────────────────────────────────────────────
function LanguagePanel() {
  const { lang, setLang, t } = useLanguage();
  const current = LANGUAGES.find(l=>l.code===lang);
  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-muted/30 px-4 py-3 flex items-center gap-3">
        <span className="text-3xl">{current?.flag ?? "🌐"}</span>
        <div>
          <p className="text-xs text-muted-foreground">{t("current_language")}</p>
          <p className="font-bold text-base">{current?.label ?? "English"}</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t("language_note")}</p>
      <div className="grid grid-cols-2 gap-2">
        {LANGUAGES.map(({code, label, flag})=>(
          <motion.button key={code} onClick={()=>setLang(code)}
            whileHover={{scale:1.02}} whileTap={{scale:0.97}}
            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all
              ${lang===code ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border bg-background hover:border-primary/30 hover:bg-muted/50"}`}>
            <span className="text-xl">{flag}</span>
            <span className="truncate text-xs font-medium">{label}</span>
            {lang===code && <Check className="h-3.5 w-3.5 ml-auto shrink-0"/>}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

// ─── Main ToolsSidebar ────────────────────────────────────────────────────────
export function ToolsSidebar({ currentTopic }: ToolsSidebarProps) {
  const { lang, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [activeTool, setActiveTool] = useState<string|null>(null);
  const [topic, setTopic] = useState(currentTopic ?? "");

  useEffect(()=>{
    setMounted(true);
    const saved = localStorage.getItem("eduswarm_topic");
    if (saved && !currentTopic) setTopic(saved);
  }, []);

  useEffect(()=>{ if (currentTopic) setTopic(currentTopic); }, [currentTopic]);

  const TOOLS = [
    { id:"ppt",       icon:Presentation, label:t("tool_slides"),    color:"text-orange-500",  bg:"bg-orange-500/10",  desc:t("desc_slides")    },
    { id:"word",      icon:FileText,     label:t("tool_word"),      color:"text-blue-500",    bg:"bg-blue-500/10",    desc:t("desc_word")      },
    { id:"code",      icon:Code2,        label:t("tool_code"),      color:"text-emerald-500", bg:"bg-emerald-500/10", desc:t("desc_code")      },
    { id:"mp3",       icon:Music,        label:t("tool_mp3"),       color:"text-pink-500",    bg:"bg-pink-500/10",    desc:t("desc_mp3")       },
    { id:"mp4",       icon:Video,        label:t("tool_mp4"),       color:"text-violet-500",  bg:"bg-violet-500/10",  desc:t("desc_mp4")       },
    { id:"animated",  icon:Clapperboard, label:t("tool_animation"), color:"text-yellow-500",  bg:"bg-yellow-500/10",  desc:t("desc_animation") },
    { id:"language",  icon:Globe,        label:t("tool_language"),  color:"text-cyan-500",    bg:"bg-cyan-500/10",    desc:t("desc_language")  },
  ];

  const activeLangEntry = LANGUAGES.find(l=>l.code===lang);

  const openTool = (id: string) => {
    setActiveTool(prev => prev === id ? null : id);
  };
  const closeTool = () => {
    setActiveTool(null);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  };

  if (!mounted) return null;

  return (
    <>
      {/* Sidebar strip */}
      <div className="fixed left-0 top-0 h-full z-40 flex flex-col items-center justify-center gap-1 py-4 w-14">
        {TOOLS.map(({id, icon:Icon, label, color, bg, desc})=>(
          <div key={id} className="group relative flex items-center">
            <motion.button onClick={()=>openTool(id)} whileHover={{scale:1.08,x:2}} whileTap={{scale:0.93}}
              className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-all
                ${activeTool===id ? `${bg} border-current ${color} shadow-md` : "bg-background border-border hover:bg-muted hover:border-primary/30"}`}>
              {id==="language" && (
                <span className="absolute -top-1 -right-1 text-[9px] leading-none select-none pointer-events-none">
                  {activeLangEntry?.flag ?? "🌐"}
                </span>
              )}
              <Icon className={`h-4 w-4 transition-colors ${activeTool===id ? color : "text-muted-foreground group-hover:text-foreground"}`}/>
            </motion.button>
            {/* Tooltip — sibling, never clipped */}
            <div className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 z-[60] invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
              <div className="rounded-lg bg-popover border shadow-lg px-2.5 py-1.5 flex flex-col gap-0.5 ml-1">
                <span className="text-xs font-semibold text-popover-foreground">{label}</span>
                <span className="text-[10px] text-muted-foreground">{desc}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {activeTool && (
          <motion.div key="backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            onClick={closeTool} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"/>
        )}
      </AnimatePresence>

      {/* Slide-out panel */}
      <AnimatePresence>
        {activeTool && (
          <motion.div key="panel" initial={{x:-420,opacity:0}} animate={{x:0,opacity:1}} exit={{x:-420,opacity:0}}
            transition={{type:"spring",stiffness:320,damping:32}}
            className="fixed left-14 top-0 z-50 h-full w-[380px] bg-background border-r shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/20 shrink-0">
              {(()=>{
                const tool = TOOLS.find(t=>t.id===activeTool);
                if (!tool) return null;
                const Icon = tool.icon;
                return (
                  <div className="flex items-center gap-2.5">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${tool.bg}`}>
                      <Icon className={`h-5 w-5 ${tool.color}`}/>
                    </div>
                    <div>
                      <h2 className="font-semibold text-sm leading-tight">{tool.label}</h2>
                      <p className="text-xs text-muted-foreground">{tool.desc}</p>
                    </div>
                  </div>
                );
              })()}
              <button onClick={closeTool} className="rounded-lg p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4"/>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {activeTool==="ppt"       && <PPTPanel       topic={topic} lang={lang}/>}
              {activeTool==="word"      && <WordPanel      topic={topic} lang={lang}/>}
              {activeTool==="code"      && <CodePanel      topic={topic}/>}
              {activeTool==="mp3"       && <MP3Panel       topic={topic} lang={lang}/>}
              {activeTool==="mp4"       && <VideoPanel     topic={topic} lang={lang}/>}
              {activeTool==="animated"  && <AnimationPanel topic={topic} lang={lang}/>}
              {activeTool==="language"  && <LanguagePanel/>}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t px-5 py-3 bg-muted/10">
              <p className="text-[11px] text-muted-foreground text-center">
                EduSwarm AI · {activeLangEntry?.flag} {activeLangEntry?.label}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
