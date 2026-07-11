import { ArrowRight, BookOpen, ChevronDown, FlaskConical, TerminalSquare, Workflow } from 'lucide-react'
import { useState } from 'react'
import { fieldNotes, processSteps } from '../data/siteContent'

export function FieldNotes() {
  const [activeNoteId, setActiveNoteId] = useState(fieldNotes[0].id)
  const activeNote = fieldNotes.find((note) => note.id === activeNoteId) ?? fieldNotes[0]

  return (
    <section className="dc-chapter dc-field-notes" id="notes" data-chapter>
      <div className="dc-section-heading" data-reveal>
        <div><span>05</span><strong>FIELD NOTES</strong></div>
        <h2>设计笔记与方法轨道</h2>
        <p>短问题、短观察，留下下一轮调整入口。</p>
      </div>

      <div className="dc-notes-console">
        <div className="dc-log-list" data-reveal>
          <div className="dc-log-list-title"><TerminalSquare size={16} /><span>PROTOTYPE LOGS</span></div>
          {fieldNotes.map((note) => (
            <button
              className={note.id === activeNoteId ? 'active' : ''}
              type="button"
              key={note.id}
              onClick={() => setActiveNoteId(note.id)}
            >
              <span>{note.code}</span>
              <div><strong>{note.question}</strong><em>{note.category}</em></div>
              <ChevronDown size={15} />
            </button>
          ))}
        </div>

        <article className="dc-log-detail" key={activeNote.id} data-reveal-media>
          <div className="dc-log-status"><span>OPEN LOG / {activeNote.code}</span><strong>{activeNote.category}</strong></div>
          <h3>{activeNote.question}</h3>
          <div className="dc-log-fields">
            <div><span><BookOpen size={15} />观察</span><p>{activeNote.observation}</p></div>
            <div><span><FlaskConical size={15} />调整</span><p>{activeNote.adjustment}</p></div>
            <div><span><ArrowRight size={15} />结果</span><p>{activeNote.result}</p></div>
          </div>
        </article>
      </div>

      <div className="dc-process-track" data-reveal>
        <div className="dc-process-label"><Workflow size={17} /><span>PROCESS / ITERATION ROUTE</span></div>
        <div className="dc-process-steps">
          {processSteps.map((step, index) => (
            <article key={step.title}>
              <span>{step.index}</span>
              <strong>{step.title}</strong>
              <p>{step.body}</p>
              {index < processSteps.length - 1 ? <ArrowRight size={15} aria-hidden="true" /> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
