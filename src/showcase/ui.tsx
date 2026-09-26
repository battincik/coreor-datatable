import { useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { ArrowRight, Check, Code2, Copy } from 'lucide-react'

export function NavLink({ to, active, navigate, children, className = '' }: { to:string; active?:boolean; navigate:(path:string)=>void; children:ReactNode; className?:string }) {
  return <a href={to} className={`${className} ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined} onClick={event => { if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); navigate(to) }}>{children}</a>
}

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow:string; title:string; description:string; action?:ReactNode }) {
  return <div className="sc-heading"><div><span className="sc-eyebrow">{eyebrow}</span><h1>{title}<span className="sc-accent">.</span></h1><p>{description}</p></div>{action}</div>
}

export function BackLink({ to, label, name, navigate }: { to:string; label:string; name:string; navigate:(path:string)=>void }) {
  return <div className="sc-back"><NavLink to={to} navigate={navigate}>← {label}</NavLink><span>/</span><span>{name}</span></div>
}

export function CodePanel({ code }: { code:string }) {
  const [copied,setCopied] = useState(false)
  const copy = async () => { try { await navigator.clipboard.writeText(code); setCopied(true); window.setTimeout(() => setCopied(false), 1800) } catch { setCopied(false) } }
  return <div className="sc-code"><div className="sc-code-top"><span><Code2 size={15}/> QUICK START</span><button onClick={() => void copy()}>{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied' : 'Copy'}</button></div><pre><code>{code}</code></pre></div>
}

export function NextLink({ navigate }: { navigate:(path:string)=>void }) {
  return <div className="sc-next"><span>KEEP EXPLORING</span><NavLink to="/types" navigate={navigate}>View all 19 column types <ArrowRight size={16}/></NavLink></div>
}

const subscribe = () => () => {}
export function ClientOnly({ children }: { children:ReactNode }) {
  const ready = useSyncExternalStore(subscribe, () => true, () => false)
  return ready ? children : <div className="sc-table-loading" aria-label="Loading interactive table">Preparing interactive table…</div>
}
