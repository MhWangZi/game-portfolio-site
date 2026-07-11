import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export function useConsoleAnimations() {
  const reducedMotion = usePrefersReducedMotion()

  useLayoutEffect(() => {
    if (reducedMotion) return

    gsap.registerPlugin(ScrollTrigger)
    const context = gsap.context(() => {
      gsap.fromTo(
        '.dc-topbar, .dc-chapter-rail, .dc-signal-strip',
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 1.15 },
      )

      gsap.fromTo(
        '.dc-current-builds .dc-build-copy > *, .dc-build-telemetry, .dc-build-controls',
        { autoAlpha: 0, y: 32, clipPath: 'inset(0 0 36% 0)' },
        {
          autoAlpha: 1,
          y: 0,
          clipPath: 'inset(0 0 0% 0)',
          duration: 0.78,
          stagger: 0.055,
          ease: 'power3.out',
          delay: 1.22,
        },
      )

      document.querySelectorAll<HTMLElement>('[data-chapter]').forEach((chapter) => {
        if (chapter.id === 'current') return

        const standardItems = chapter.querySelectorAll<HTMLElement>('[data-reveal]')
        const mediaItems = chapter.querySelectorAll<HTMLElement>('[data-reveal-media]')

        if (standardItems.length) {
          gsap.fromTo(
            standardItems,
            { autoAlpha: 0, y: 52, clipPath: 'inset(0 0 30% 0)' },
            {
              autoAlpha: 1,
              y: 0,
              clipPath: 'inset(0 0 0% 0)',
              duration: 0.78,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: { trigger: chapter, start: 'top 76%', once: true },
            },
          )
        }

        if (mediaItems.length) {
          gsap.fromTo(
            mediaItems,
            { autoAlpha: 0, scale: 1.045, clipPath: 'inset(8% 12% 12% 8%)' },
            {
              autoAlpha: 1,
              scale: 1,
              clipPath: 'inset(0% 0% 0% 0%)',
              duration: 1,
              stagger: 0.08,
              ease: 'expo.out',
              scrollTrigger: { trigger: chapter, start: 'top 72%', once: true },
            },
          )
        }
      })

      gsap.to('.dc-ambient-image', {
        yPercent: 7,
        scale: 1.05,
        ease: 'none',
        scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.7 },
      })
    })

    const refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 1800)
    return () => {
      window.clearTimeout(refreshTimer)
      context.revert()
    }
  }, [reducedMotion])
}
