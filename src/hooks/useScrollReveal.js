import { useCallback, useRef } from 'react'

/**
 * Hook to trigger fade-up animation when element enters viewport
 */
export function useScrollReveal(threshold = 0.01) {
  const observerRef = useRef(null)

  const ref = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    if (node) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(node) // Only reveal once
          }
        },
        { 
          threshold,
          rootMargin: '100px 0px 100px 0px' // Much more aggressive
        }
      )
      observer.observe(node)
      observerRef.current = observer
    }
  }, [threshold])

  return ref
}

/**
 * Hook to observe multiple children with staggered animation, supporting dynamic elements.
 */
export function useStaggerReveal(threshold = 0.01) {
  const observerRef = useRef(null)

  const ref = useCallback((node) => {
    if (observerRef.current) {
      observerRef.current.disconnect()
      observerRef.current = null
    }

    if (node) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible')
              observer.unobserve(entry.target)
            }
          })
        },
        { 
          threshold,
          rootMargin: '100px 0px 100px 0px'
        }
      )

      // Observe existing children
      const children = node.querySelectorAll('.fade-up')
      children.forEach((child) => observer.observe(child))

      // Watch for dynamically added children (e.g. after Supabase fetch completes)
      const mutationObserver = new MutationObserver(() => {
        const currentChildren = node.querySelectorAll('.fade-up')
        currentChildren.forEach((child) => observer.observe(child))
      })
      mutationObserver.observe(node, { childList: true, subtree: true })

      observerRef.current = {
        disconnect() {
          observer.disconnect()
          mutationObserver.disconnect()
        }
      }
    }
  }, [threshold])

  return ref
}

