import type { RefObject } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'

type ConsoleRoot = RefObject<HTMLDivElement | null>

function createChapterTimeline(
  chapter: HTMLElement,
  selector: gsap.utils.SelectorFunc,
  chapterId: string,
) {
  const timeline = gsap.timeline({
    defaults: { duration: 0.72, ease: 'power3.out' },
    scrollTrigger: {
      trigger: chapter,
      start: 'top 78%',
      once: true,
    },
  })

  const heading = selector(`#${chapterId} .dc-section-heading > *`)

  if (heading.length) {
    timeline.fromTo(
      heading,
      { autoAlpha: 0, y: 30, clipPath: 'inset(0 0 45% 0)' },
      { autoAlpha: 1, y: 0, clipPath: 'inset(0 0 0% 0)', stagger: 0.065 },
      0,
    )
  }

  if (chapterId === 'radar') {
    timeline
      .fromTo(
        selector('#radar .dc-radar-map'),
        { autoAlpha: 0, scale: 0.965, clipPath: 'inset(8% 12% 8% 12%)' },
        { autoAlpha: 1, scale: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9 },
        0.12,
      )
      .fromTo(
        selector('#radar .dc-radar-node'),
        { autoAlpha: 0, scale: 0.72, y: 18 },
        { autoAlpha: 1, scale: 1, y: 0, duration: 0.56, stagger: { each: 0.07, from: 'center' } },
        0.34,
      )
      .fromTo(
        selector('#radar .dc-radar-panel'),
        { autoAlpha: 0, x: 46, clipPath: 'inset(0 0 0 18%)' },
        { autoAlpha: 1, x: 0, clipPath: 'inset(0 0 0 0%)', duration: 0.82 },
        0.25,
      )
  }

  if (chapterId === 'cases') {
    timeline
      .fromTo(
        selector('#cases .dc-case-stage'),
        { autoAlpha: 0, x: -54, clipPath: 'inset(0 14% 0 0)' },
        { autoAlpha: 1, x: 0, clipPath: 'inset(0 0% 0 0)', duration: 0.9 },
        0.13,
      )
      .fromTo(
        selector('#cases .dc-case-console'),
        { autoAlpha: 0, x: 44, clipPath: 'inset(0 0 0 16%)' },
        { autoAlpha: 1, x: 0, clipPath: 'inset(0 0 0 0%)', duration: 0.82 },
        0.22,
      )
      .fromTo(
        selector('#cases .dc-case-timeline > *'),
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.48, stagger: 0.08 },
        0.58,
      )
  }

  if (chapterId === 'projects') {
    timeline
      .fromTo(
        selector('#projects .dc-index-filter > *'),
        { autoAlpha: 0, y: 14 },
        { autoAlpha: 1, y: 0, duration: 0.46, stagger: 0.045 },
        0.12,
      )
      .fromTo(
        selector('#projects .dc-command-list > button'),
        { autoAlpha: 0, x: -24 },
        { autoAlpha: 1, x: 0, duration: 0.52, stagger: { each: 0.035, from: 'start' } },
        0.22,
      )
      .fromTo(
        selector('#projects .dc-index-preview'),
        { autoAlpha: 0, x: 46, clipPath: 'inset(0 0 0 16%)' },
        { autoAlpha: 1, x: 0, clipPath: 'inset(0 0 0 0%)', duration: 0.82 },
        0.34,
      )
  }

  if (chapterId === 'notes') {
    timeline
      .fromTo(
        selector('#notes .dc-log-list'),
        { autoAlpha: 0, x: -34 },
        { autoAlpha: 1, x: 0, duration: 0.7 },
        0.14,
      )
      .fromTo(
        selector('#notes .dc-log-list > button'),
        { autoAlpha: 0, x: -18 },
        { autoAlpha: 1, x: 0, duration: 0.46, stagger: 0.055 },
        0.28,
      )
      .fromTo(
        selector('#notes .dc-log-detail'),
        { autoAlpha: 0, x: 42, clipPath: 'inset(0 0 0 14%)' },
        { autoAlpha: 1, x: 0, clipPath: 'inset(0 0 0 0%)', duration: 0.8 },
        0.22,
      )
      .fromTo(
        selector('#notes .dc-process-steps article'),
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06 },
        0.66,
      )
  }

  if (chapterId === 'contact') {
    timeline
      .fromTo(
        selector('#contact .dc-contact-copy > *'),
        { autoAlpha: 0, x: -34 },
        { autoAlpha: 1, x: 0, duration: 0.64, stagger: 0.07 },
        0.08,
      )
      .fromTo(
        selector('#contact .dc-contact-grid > a'),
        { autoAlpha: 0, y: 34, scale: 0.975 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.62, stagger: 0.075 },
        0.24,
      )
      .fromTo(
        selector('#contact .dc-contact-footer > span'),
        { autoAlpha: 0, y: 10 },
        { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.08 },
        0.68,
      )
  }

  return timeline
}

export function useConsoleAnimations(root: ConsoleRoot) {
  useGSAP(
    () => {
      if (!root.current) return

      const selector = gsap.utils.selector(root.current)
      const media = gsap.matchMedia()

      media.add(
        {
          desktop: '(min-width: 981px)',
          mobile: '(max-width: 980px)',
          reduce: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { desktop, reduce } = context.conditions as {
            desktop: boolean
            mobile: boolean
            reduce: boolean
          }

          if (reduce) {
            gsap.set(selector('[data-reveal], [data-reveal-media]'), {
              autoAlpha: 1,
              clearProps: 'transform,clipPath',
            })
            return
          }

          const frameTimeline = gsap.timeline({
            delay: document.documentElement.dataset.archiveReady === 'true' ? 0 : 1.18,
            defaults: { duration: 0.58, ease: 'power3.out' },
          })

          frameTimeline
            .fromTo(selector('.dc-topbar'), { autoAlpha: 0, y: -22 }, { autoAlpha: 1, y: 0 }, 0)
            .fromTo(selector('.dc-chapter-rail'), { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0 }, 0.08)
            .fromTo(selector('.dc-signal-strip'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0 }, 0.16)

          const railProgress = selector('.dc-rail-line i')
          if (railProgress.length) {
            gsap.fromTo(
              railProgress,
              { scaleY: 0.14, transformOrigin: 'top center' },
              {
                scaleY: 1,
                ease: 'none',
                scrollTrigger: {
                  trigger: root.current,
                  start: 'top top',
                  end: 'bottom bottom',
                  scrub: 0.35,
                },
              },
            )
          }

          ;['radar', 'cases', 'projects', 'notes', 'contact'].forEach((chapterId) => {
            const chapter = root.current?.querySelector<HTMLElement>(`#${chapterId}`)
            if (chapter) createChapterTimeline(chapter, selector, chapterId)
          })

          const ambient = selector('.dc-ambient-image')
          if (ambient.length) {
            gsap.to(ambient, {
              yPercent: desktop ? 7 : 3,
              scale: desktop ? 1.055 : 1.025,
              ease: 'none',
              scrollTrigger: {
                trigger: root.current,
                start: 'top top',
                end: 'bottom bottom',
                scrub: desktop ? 0.8 : 0.45,
              },
            })

            if (desktop) {
              const xTo = gsap.quickTo(ambient[0], 'x', { duration: 0.9, ease: 'power3.out' })
              const rotateTo = gsap.quickTo(ambient[0], 'rotation', { duration: 1.1, ease: 'power3.out' })
              const handlePointerMove = (event: PointerEvent) => {
                const normalizedX = event.clientX / window.innerWidth - 0.5
                xTo(normalizedX * 18)
                rotateTo(normalizedX * 0.18)
              }

              window.addEventListener('pointermove', handlePointerMove, { passive: true })
              return () => window.removeEventListener('pointermove', handlePointerMove)
            }
          }
        },
      )

      const refresh = () => ScrollTrigger.refresh()
      document.fonts?.ready.then(refresh).catch(() => undefined)
      window.addEventListener('load', refresh, { once: true })

      return () => {
        window.removeEventListener('load', refresh)
        media.revert()
      }
    },
    { scope: root },
  )
}
