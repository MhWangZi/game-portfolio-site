import config from './feedback.json';
import './feedback.css';
/** The same unnumbered connector silhouette links pocket cards to the later sockets. */
export function TerminalStamp(){return <svg className="terminal-stamp" viewBox="0 0 64 36" role="img" aria-label={config.terminalStamp.label}>
  <path d="M5 7h54v22H5z M9 11h46v14H9z" fill="none" stroke="currentColor" strokeWidth="2"/>
  {Array.from({length:config.terminalStamp.pins},(_,i)=><path key={i} d={`M${20+i*12} 2v11h4V2z M${20+i*12} 23v11h4V23z`} fill="currentColor"/>)}
  <path d="m7 28 5-1m38-17 4-2M32 8l3 2" stroke="currentColor" opacity=".5"/>
</svg>}
