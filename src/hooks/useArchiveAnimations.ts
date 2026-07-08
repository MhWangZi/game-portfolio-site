import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

export function useArchiveAnimations() {
  const reducedMotion = usePrefersReducedMotion()

  useLayoutEffect(() => {
    if (reducedMotion) return

    gsap.registerPlugin(ScrollTrigger)

    const context = gsap.context(() => {
      gsap.fromTo(
        '.topbar',
        { autoAlpha: 0, y: -18 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out', delay: 0.9 },
      )

      gsap.fromTo(
        '.hero-copy > *, .hero-console .console-card',
        { autoAlpha: 0, y: 42, scale: 0.985 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.82, stagger: 0.07, ease: 'power3.out', delay: 1.05 },
      )

      gsap.to('.ambient-image', {
        yPercent: 8,
        scale: 1.06,
        ease: 'none',
        scrollTrigger: {
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      })

      gsap.utils.toArray<HTMLElement>('.featured-section, .section-shell, .personal-section, .work-detail').forEach((section) => {
        const revealItems = section.querySelectorAll(
          '.section-heading, .featured-card, .filter-row, .work-card, .detail-showcase, .detail-copy, .ability-card, .about-card, .note-card, .process-step, .contact-card-grid a',
        )
        gsap.fromTo(
          revealItems,
          { autoAlpha: 0, y: 58, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.78,
            stagger: 0.075,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 72%',
              once: true,
            },
          },
        )
      })

      gsap.utils.toArray<HTMLElement>('.flow-strip span').forEach((node, index) => {
        gsap.fromTo(
          node,
          { autoAlpha: 0, x: -18 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.38,
            delay: (index % 6) * 0.035,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: node,
              start: 'top 86%',
              once: true,
            },
          },
        )
      })
    })

    return () => context.revert()
  }, [reducedMotion])
}
