import { type FormEvent, type RefObject, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import talentryLogoWordmark from './assets/talentry-logo.svg'
import talentryLogoWordmarkLight from './assets/talentry-logo-dark.svg'
import './App.css'

type SubmitState = 'idle' | 'loading' | 'success' | 'error'
type WaitlistFormState = {
  fullName: string
  businessName: string
  email: string
  whatsapp: string
  staffCount: string
  sector: string
  challenge: string
}

const STAFF_COUNT_OPTIONS = [
  { value: '1-5', label: '1-5 staff' },
  { value: '6-10', label: '6-10 staff' },
  { value: '11-15', label: '11-15 staff' },
  { value: '16+', label: '16+ staff (Enterprise)' },
] as const

const SECTOR_OPTIONS = [
  { value: '', label: 'Select your sector' },
  { value: 'retail-trade', label: 'Retail and Trade' },
  { value: 'fashion-apparel', label: 'Fashion and Apparel' },
  { value: 'food-hospitality', label: 'Food and Hospitality' },
  { value: 'professional-services', label: 'Professional Services' },
  { value: 'logistics-delivery', label: 'Logistics and Delivery' },
  { value: 'tech-digital', label: 'Tech and Digital Services' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'real-estate', label: 'Real Estate' },
  { value: 'other', label: 'Other' },
] as const

const CHALLENGE_OPTIONS = [
  { value: '', label: 'What is your biggest staff challenge right now?' },
  { value: 'no-initiative', label: 'No initiative — always waiting to be told' },
  { value: 'poor-communication', label: 'Poor communication — embarrassing client interactions' },
  { value: 'no-ownership', label: 'No ownership — nothing is their responsibility' },
  { value: 'inconsistency', label: 'Inconsistency — good when watched, absent when not' },
  { value: 'cannot-solve', label: 'Cannot problem solve — escalates everything upward' },
  { value: 'poor-work-ethic', label: 'Poor work ethic — does minimum to get by' },
] as const

const PLAN_PRICING = {
  starter: 35000,
  growth: 65000,
  team: 90000,
} as const

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: 'Is the first month really free?',
    a: 'Yes. When we go live, your first four weeks are completely free with no commitment. If you are not feeling the value by the end of week four, you can cancel with no charge.',
  },
  {
    q: 'How is content delivered to my staff?',
    a: 'Each Monday, staff receive a focused video (under 15 minutes) to their email at 4am. We can also deliver via WhatsApp. No classrooms and no full-day workshops.',
  },
  {
    q: 'How much time does this take out of the workday?',
    a: 'Under 15 minutes of learning for staff, plus one practical task to apply during the week. As the owner, you get one monthly session designed to fit your schedule.',
  },
  {
    q: 'How quickly will I see results?',
    a: 'Many teams show shifts in engagement and conversation quality within the first few weeks. By week four you should have a clear sense of whether the rhythm is working for your business.',
  },
  {
    q: 'What is the employer track exactly?',
    a: 'Once a month you receive practical guidance on hiring deliberately, onboarding with intention, sharing vision, setting culture, and getting the best from your team — plus a preview of what your staff are learning.',
  },
  {
    q: 'Can I cancel after the trial?',
    a: 'Yes. If you do not want to continue after the free month, you cancel and you are not charged. No hard feelings.',
  },
  {
    q: 'Who built this programme?',
    a: 'Talentry is a NerdzFactory initiative — built for Nigerian entrepreneurs who want both sides of the staff problem addressed at the same time.',
  },
  {
    q: 'What if my staff do not engage with the content?',
    a: 'The programme includes weekly tasks, monthly check-ins, and accountability rhythms designed to drive participation. Your monthly summary also highlights engagement so you can coach your team alongside the content.',
  },
]

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
const validateWhatsapp = (phone: string) => /^\+?[0-9]{9,15}$/.test(phone.replace(/[\s-]/g, ''))
const formatNaira = (amount: number) => `₦${amount.toLocaleString('en-NG')}`

function randomInRange(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function useHeroLiveBackground(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    const canvas = canvasRef.current
    const container = canvas?.parentElement ?? null
    if (!canvas || !container) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const surface = canvas
    const host = container
    const context = ctx

    let width = 0
    let height = 0
    let nodes: { x: number; y: number; vx: number; vy: number; strength: number }[] = []
    let edges: { a: number; b: number; key: string }[] = []
    let pulses: { eIndex: number; t: number; speed: number; size: number; hue: number }[] = []
    let rafId = 0
    let lastTs = 0

    function buildScene() {
      const area = width * height
      const targetNodes = Math.max(24, Math.min(72, Math.floor(area / 32000)))
      nodes = []
      edges = []
      pulses = []
      for (let i = 0; i < targetNodes; i++) {
        const nx = Math.random()
        const ny = Math.pow(Math.random(), 0.9)
        nodes.push({
          x: nx * width,
          y: ny * height,
          vx: randomInRange(-0.02, 0.02),
          vy: randomInRange(-0.02, 0.02),
          strength: randomInRange(0.6, 1),
        })
      }
      const k = 3
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i]
        const dists: { j: number; d2: number }[] = []
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          dists.push({ j, d2: dx * dx + dy * dy })
        }
        dists.sort((p, q) => p.d2 - q.d2)
        for (let n = 0; n < k && n < dists.length; n++) {
          const j = dists[n].j
          const key = i < j ? `${i}-${j}` : `${j}-${i}`
          if (!edges.some((e) => e.key === key)) {
            edges.push({ a: i, b: j, key })
          }
        }
      }
      const pulseCount = Math.max(6, Math.floor(edges.length * 0.32))
      for (let p = 0; p < pulseCount; p++) {
        pulses.push({
          eIndex: Math.floor(Math.random() * Math.max(1, edges.length)),
          t: Math.random(),
          speed: randomInRange(0.12, 0.42),
          size: randomInRange(2.2, 3.6),
          hue: Math.random() < 0.6 ? 22 : 268,
        })
      }
    }

    function resize() {
      const rect = host.getBoundingClientRect()
      width = Math.max(1, Math.floor(rect.width))
      height = Math.max(1, Math.floor(rect.height))
      const d = Math.min(window.devicePixelRatio || 1, 2)
      surface.width = Math.floor(width * d)
      surface.height = Math.floor(height * d)
      surface.style.width = `${width}px`
      surface.style.height = `${height}px`
      context.setTransform(d, 0, 0, d, 0, 0)
      buildScene()
    }

    function step(dt: number) {
      for (const n of nodes) {
        n.x += n.vx * dt
        n.y += n.vy * dt
        if (n.x < 0) {
          n.x = 0
          n.vx *= -1
        }
        if (n.x > width) {
          n.x = width
          n.vx *= -1
        }
        if (n.y < 0) {
          n.y = 0
          n.vy *= -1
        }
        if (n.y > height) {
          n.y = height
          n.vy *= -1
        }
      }
      for (const pulse of pulses) {
        pulse.t += (pulse.speed * dt) / 1000
        if (pulse.t > 1) {
          pulse.t = 0
          pulse.eIndex = Math.floor(Math.random() * Math.max(1, edges.length))
          pulse.speed = randomInRange(0.12, 0.42)
        }
      }
    }

    function drawBackground() {
      const g = context.createLinearGradient(0, 0, width, height)
      g.addColorStop(0, 'rgba(15,28,63,0.88)')
      g.addColorStop(0.45, 'rgba(45,20,70,0.55)')
      g.addColorStop(1, 'rgba(240,90,40,0.35)')
      context.fillStyle = g
      context.fillRect(0, 0, width, height)
      context.strokeStyle = 'rgba(255,255,255,0.06)'
      context.lineWidth = 1
      const spacing = 48
      context.beginPath()
      for (let x = 0.5; x < width; x += spacing) {
        context.moveTo(x, 0)
        context.lineTo(x, height)
      }
      for (let y = 0.5; y < height; y += spacing) {
        context.moveTo(0, y)
        context.lineTo(width, y)
      }
      context.stroke()
    }

    function drawNetwork() {
      context.lineWidth = 1.1
      for (const e of edges) {
        const a = nodes[e.a]
        const b = nodes[e.b]
        if (!a || !b) continue
        const dx = a.x - b.x
        const dy = a.y - b.y
        const dist = Math.hypot(dx, dy)
        const alpha = Math.max(0, 0.14 - (dist / 600) * 0.14)
        if (alpha <= 0.01) continue
        context.strokeStyle = `rgba(255,255,255,${alpha})`
        context.beginPath()
        context.moveTo(a.x, a.y)
        context.lineTo(b.x, b.y)
        context.stroke()
      }
      for (const n of nodes) {
        context.fillStyle = 'rgba(255,255,255,0.22)'
        context.beginPath()
        context.arc(n.x, n.y, 2 + n.strength * 0.55, 0, Math.PI * 2)
        context.fill()
      }
      for (const pulse of pulses) {
        if (!edges[pulse.eIndex]) continue
        const e = edges[pulse.eIndex]
        const a = nodes[e.a]
        const b = nodes[e.b]
        const x = a.x + (b.x - a.x) * pulse.t
        const y = a.y + (b.y - a.y) * pulse.t
        const grd = context.createRadialGradient(x, y, 0, x, y, pulse.size * 4)
        grd.addColorStop(0, `hsla(${pulse.hue}, 78%, 58%, 0.88)`)
        grd.addColorStop(1, 'rgba(0,0,0,0)')
        context.fillStyle = grd
        context.beginPath()
        context.arc(x, y, pulse.size * 2.1, 0, Math.PI * 2)
        context.fill()
      }
    }

    function frame(ts: number) {
      const dt = lastTs ? ts - lastTs : 16
      lastTs = ts
      context.clearRect(0, 0, width, height)
      drawBackground()
      step(dt)
      drawNetwork()
      rafId = requestAnimationFrame(frame)
    }

    resize()
    rafId = requestAnimationFrame(frame)
    let resizeTimer: number
    const onResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(resize, 120)
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      clearTimeout(resizeTimer)
    }
  }, [canvasRef])
}

function App() {
  const baseId = useId()
  const heroCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const mainRef = useRef<HTMLElement | null>(null)

  const [route, setRoute] = useState<'waitlist' | 'thanks'>(() =>
    window.location.hash === '#thanks' ? 'thanks' : 'waitlist'
  )
  const [navScrolled, setNavScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [referralToast, setReferralToast] = useState<string | null>(null)
  const [form, setForm] = useState<WaitlistFormState>({
    fullName: '',
    businessName: '',
    email: '',
    whatsapp: '',
    staffCount: '',
    sector: '',
    challenge: '',
  })

  useHeroLiveBackground(heroCanvasRef)

  useEffect(() => {
    const onHashChange = () => {
      setRoute(window.location.hash === '#thanks' ? 'thanks' : 'waitlist')
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 50)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  useEffect(() => {
    const root = mainRef.current
    if (!root) return
    const els = root.querySelectorAll<HTMLElement>('.animate-on-scroll')
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [route])

  const shareUrl = useMemo(() => {
    const url = window.location.href
    return url.includes('#') ? url.slice(0, url.indexOf('#')) : url
  }, [])
  const shareText = useMemo(
    () =>
      'Talentry is a 12-month staff development programme for Nigerian businesses. Join the waitlist.',
    []
  )

  const isLoading = submitState === 'loading'

  const buttonLabel =
    submitState === 'loading'
      ? 'Submitting...'
      : submitState === 'success'
        ? 'Submitted'
        : submitState === 'error'
          ? 'Try again'
          : 'Join Waitlist'

  const onFieldChange = (key: keyof WaitlistFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (submitState === 'error') setSubmitState('idle')
  }

  const copyInviteLink = useCallback(async () => {
    const u = new URL(window.location.href)
    u.hash = 'waitlist'
    try {
      await navigator.clipboard.writeText(u.toString())
      setReferralToast('Link copied')
      window.setTimeout(() => setReferralToast(null), 2000)
    } catch {
      setReferralToast(u.toString())
      window.setTimeout(() => setReferralToast(null), 4000)
    }
  }, [])

  async function copyLinkThanks() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setSubmitError('Link copied!')
      window.setTimeout(() => setSubmitError(null), 1200)
    } catch {
      setSubmitError('Could not copy link.')
      window.setTimeout(() => setSubmitError(null), 1600)
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    if (!form.fullName.trim()) return setSubmitState('error'), setSubmitError('Please enter your full name.')
    if (!form.businessName.trim()) return setSubmitState('error'), setSubmitError('Please enter your business name.')
    if (!validateEmail(form.email)) return setSubmitState('error'), setSubmitError('Please enter a valid email address.')
    const wa = form.whatsapp.replace(/[\s-]/g, '')
    if (!validateWhatsapp(wa)) return setSubmitState('error'), setSubmitError('Please enter a valid WhatsApp number.')
    if (!form.staffCount) return setSubmitState('error'), setSubmitError('Please select your team size.')
    if (!form.sector) return setSubmitState('error'), setSubmitError('Please select your sector.')
    if (!form.challenge) return setSubmitState('error'), setSubmitError('Please select your biggest staff challenge.')
    setSubmitState('loading')
    await new Promise((r) => setTimeout(r, 900))
    setSubmitState('success')
    window.location.hash = '#thanks'
  }

  if (route === 'thanks') {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(shareText)
    return (
      <div className="page page-thanks">
        <header className="tal-header">
          <nav className="tal-nav tal-nav--solid" aria-label="Site">
            <a href="#hero" className="tal-nav__logo" onClick={() => setMenuOpen(false)}>
              <img src={talentryLogoWordmark} alt="Talentry" className="logo-img" />
            </a>
            <button
              type="button"
              className={`tal-nav__toggle nav-toggle ${menuOpen ? 'active' : ''}`}
              aria-label="Toggle navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span />
              <span />
              <span />
            </button>
            <ul className={`tal-nav__links ${menuOpen ? 'active' : ''}`}>
              <li>
                <a href="#hero" onClick={() => setMenuOpen(false)}>
                  Home
                </a>
              </li>
              <li>
                <a href="#waitlist" onClick={() => setMenuOpen(false)}>
                  Join Waitlist
                </a>
              </li>
            </ul>
          </nav>
        </header>
        <main className="thanks-main">
          <section className="thanks-card">
            <h1>You are on the waitlist</h1>
            <p className="thanks-lead">We will email you confirmation and launch updates.</p>
            <div className="share-box">
              <p className="share-label">Share Talentry</p>
              <div className="share-buttons">
                <a className="share-btn share-wa" href={`https://wa.me/?text=${encodedText}%0A${encodedUrl}`} target="_blank" rel="noreferrer">
                  WhatsApp
                </a>
                <a className="share-btn share-fb" href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer">
                  Facebook
                </a>
                <a className="share-btn share-x" href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} target="_blank" rel="noreferrer">
                  X
                </a>
              </div>
              <button type="button" className="referral-copy-btn" onClick={copyLinkThanks}>
                Copy page link
              </button>
              {submitError ? <p className="referral-toast is-visible">{submitError}</p> : null}
            </div>
            <a className="submit-button thanks-back" href="#waitlist">
              Back to site
            </a>
          </section>
        </main>
        <footer className="tal-footer tal-footer--compact">
          <div className="tal-footer__bar">
            <p>© {new Date().getFullYear()} Talentry</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="page page-content">
      <header className="tal-header">
        <nav className={`tal-nav ${navScrolled ? 'tal-nav--solid' : ''}`} aria-label="Site">
          <a href="#hero" className="tal-nav__logo" onClick={() => setMenuOpen(false)}>
            <img src={navScrolled ? talentryLogoWordmark : talentryLogoWordmarkLight} alt="Talentry" className="logo-img" />
          </a>
          <button
            type="button"
            className={`tal-nav__toggle nav-toggle ${menuOpen ? 'active' : ''}`}
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
          <ul className={`tal-nav__links ${menuOpen ? 'active' : ''}`}>
            <li>
              <a href="#problem" onClick={() => setMenuOpen(false)}>
                The Problem
              </a>
            </li>
            <li>
              <a href="#programme" onClick={() => setMenuOpen(false)}>
                The Programme
              </a>
            </li>
            <li>
              <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
                How It Works
              </a>
            </li>
            <li>
              <a href="#pricing" onClick={() => setMenuOpen(false)}>
                Pricing
              </a>
            </li>
            <li>
              <a href="#waitlist" onClick={() => setMenuOpen(false)}>
                Join Waitlist
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main ref={mainRef}>
        <section id="hero" className="tal-hero" aria-label="Hero">
          <div className="tal-hero__canvas">
            <canvas id="hero-live" ref={heroCanvasRef} aria-hidden="true" />
            <div className="tal-hero__veil" />
          </div>
          <div className="tal-hero__inner">
            <div className="tal-hero__stack">
              <p className="tal-hero__eyebrow animate-on-scroll">For Businesses Looking to 10X Their Growth</p>
              <h1 className="tal-hero__title animate-on-scroll">
                <span className="tal-hero__line">Grow your team.</span>
                <span className="tal-hero__line">Grow your business.</span>
              </h1>
              <p className="tal-hero__lede animate-on-scroll">
                Talentry is a 12-month development programme that works on both sides of your staff problem. Your team. And you as the leader. At the same time.
              </p>
              <div className="tal-hero__actions animate-on-scroll">
                <a className="tal-hero__btn tal-hero__btn--primary" href="#waitlist">
                  Join Waitlist
                </a>
                <a className="tal-hero__btn tal-hero__btn--ghost" href="#how-it-works">
                  See how it works ↓
                </a>
              </div>
              <dl className="tal-hero__metrics animate-on-scroll">
                <div>
                  <dt>100k+</dt>
                  <dd>Youth and professionals trained across Africa</dd>
                </div>
                <div>
                  <dt>12mo</dt>
                  <dd>Full development journey</dd>
                </div>
                <div>
                  <dt>Free</dt>
                  <dd>First month. Zero risk.</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        <section id="familiar" className="tal-familiar">
          <div className="tal-wrap">
            <h2 className="tal-section-title animate-on-scroll">Does this sound familiar?</h2>
            <p className="tal-section-lede animate-on-scroll">Business owners tell us this every week.</p>
            <ul className="tal-familiar__list">
              {[
                'Staff who wait to be told everything, never show initiative',
                'Cannot solve basic problems without escalating everything',
                'Fail to follow through on tasks without constant reminders',
                'Handle clients poorly and embarrass you with customers',
                'Do not seem to understand what adding value even means',
                'You spend more time supervising than running your business',
              ].map((t) => (
                <li key={t} className="tal-familiar__item animate-on-scroll">
                  <span className="tal-familiar__x" aria-hidden>
                    ✕
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="tal-cta-row animate-on-scroll">
              <a className="tal-btn-solid" href="#waitlist">
                Join Waitlist
              </a>
            </div>
          </div>
        </section>

        <section id="problem" className="tal-problem">
          <div className="tal-wrap">
            <h2 className="tal-section-title animate-on-scroll">The Real Problem</h2>
            <p className="tal-problem__subtitle animate-on-scroll">Two gaps. One daily frustration.</p>
            <div className="tal-problem__columns animate-on-scroll">
              <p>
                Most young Nigerians enter the workforce genuinely wanting to do well. But our environment and education system were never designed to form them for professional life. They come willing. But not work-ready.
              </p>
              <p>
                And that is only one side of the problem. Most entrepreneurs set out to run a business without ever learning how to attract the right people, structure their teams for growth, or consistently get the best out of the people they already have.
              </p>
            </div>
            <p className="tal-problem__bridge animate-on-scroll">
              When these two gaps collide, it creates the kind of daily frustration that quietly stunts business growth and keeps entrepreneurs stuck managing people instead of building something remarkable.
            </p>
            <div className="tal-gap-grid">
              {[
                {
                  n: '01',
                  t: 'The Employee Gap',
                  p: 'Never trained to think independently, take initiative, or operate with a sense of ownership. The system gave them certificates. Not formation.',
                },
                {
                  n: '02',
                  t: 'The Employer Gap',
                  p: 'Never shown how to hire deliberately, onboard with intention, or create an environment where good people want to perform and stay.',
                },
                {
                  n: '03',
                  t: 'The Culture Gap',
                  p: 'Nigerian culture has never strongly emphasised giving value and pursuing excellence at work. Staff do not even know what that looks like.',
                },
                {
                  n: '04',
                  t: 'The Formation Gap',
                  p: 'No one ever asked them: why does this company need you? Are you a gain or a pain? What do you want to be known for here?',
                },
              ].map((g) => (
                <article key={g.n} className="tal-gap-card animate-on-scroll">
                  <span className="tal-gap-card__n">{g.n}</span>
                  <h3>{g.t}</h3>
                  <p>{g.p}</p>
                </article>
              ))}
            </div>
            <div className="tal-problem__collision animate-on-scroll">
              <h3>When these gaps collide in your workplace</h3>
              <p>
                You get the frustration most business owners live with every single day. Staff who are present but not productive. Business growth that is slower than it should be. An entrepreneur stuck managing people instead of building something.
              </p>
            </div>
            <blockquote className="tal-quote animate-on-scroll">
              <p>&quot;That&apos;s exactly why I built Talentry. To fix both sides of the problem at the same time.&quot; — Ade Olowojoba</p>
            </blockquote>
          </div>
        </section>

        <section id="video" className="tal-video" aria-labelledby="video-heading">
          <div className="tal-wrap tal-video__inner">
            <p className="tal-video__kicker animate-on-scroll">Hear It Directly</p>
            <h2 id="video-heading" className="tal-section-title animate-on-scroll">
              Why I built Talentry
            </h2>
            <p className="tal-video__meta animate-on-scroll">Ade Olowojoba | 6 minutes</p>
            <div className="tal-video__frame animate-on-scroll" role="region" aria-label="Programme video">
              <div className="tal-video__placeholder">
                <span className="tal-video__play" aria-hidden>
                  ▶
                </span>
                <p>Add your video embed URL here (e.g. YouTube or Vimeo).</p>
              </div>
            </div>
          </div>
        </section>

        <section id="programme" className="tal-programme">
          <div className="tal-wrap">
            <h2 className="tal-section-title animate-on-scroll">The Talentry Programme</h2>
            <p className="tal-section-lede animate-on-scroll">Built for both sides of the problem</p>
            <p className="tal-programme__intro animate-on-scroll">
              Talentry works on two tracks simultaneously. Your staff are developed every week. You as the business owner are developed every month. One programme. One subscription. Both sides fixed.
            </p>
            <div className="tal-tracks">
              <article className="tal-track tal-track--staff animate-on-scroll">
                <span className="tal-track__label">Primary Track</span>
                <h3>Staff Development</h3>
                <p className="tal-track__cadence">Weekly Sessions</p>
                <p>
                  Every Monday your team receives a focused video learning delivered to their email at 4am. Under 15 minutes. One powerful insight. One reflection prompt. One practical task to apply that week. Over 12 months across five carefully designed pillars, your staff are formed into professionals who think better, communicate better, and understand what it means to truly add value.
                </p>
                <ul className="tal-track__list">
                  {[
                    '52-week formation curriculum',
                    'Video delivered to email at 4am every Monday',
                    'No classrooms. No disruption to the workday.',
                    'Monthly accountability check-ins',
                    'Access to all five development pillars',
                  ].map((x) => (
                    <li key={x}>
                      <span aria-hidden>✓</span> {x}
                    </li>
                  ))}
                </ul>
              </article>
              <article className="tal-track tal-track--employer animate-on-scroll">
                <span className="tal-track__label">Employer Track</span>
                <h3>Leadership Development</h3>
                <p className="tal-track__cadence">Monthly Sessions</p>
                <p>
                  Once a month you receive your own session as the business owner. Practical guidance on how to hire deliberately, onboard with intention, share your vision, set culture, and create an environment where good people give you their very best.
                </p>
                <ul className="tal-track__list">
                  {[
                    '12 monthly employer sessions',
                    'Hiring, onboarding, culture, retention',
                    'Personal welcome video before week one',
                    'Preview of what your staff are learning',
                    'Guidance on getting the best from each pillar',
                  ].map((x) => (
                    <li key={x}>
                      <span aria-hidden>✓</span> {x}
                    </li>
                  ))}
                </ul>
              </article>
            </div>
            <div className="tal-pillars">
              <h3 className="tal-pillars__title animate-on-scroll">The Five Staff Development Pillars</h3>
              <ol className="tal-pillars__grid">
                {[
                  { n: '01', t: 'Inner Foundation', p: 'Self-esteem, emotional regulation, identity, confidence, victim mindset' },
                  { n: '02', t: 'Professional Identity', p: 'Ownership, initiative, work ethic, consistency, standards' },
                  { n: '03', t: 'Thinking & Execution', p: 'Problem solving, prioritisation, attention to detail, follow-through' },
                  { n: '04', t: 'Communication Mastery', p: 'Written, verbal, upward reporting, feedback, conflict' },
                  { n: '05', t: 'Relational Intelligence', p: 'Authority, peer dynamics, trust, influence, managing up' },
                ].map((pillar) => (
                  <li key={pillar.n} className="tal-pillar-card animate-on-scroll">
                    <span className="tal-pillar-card__n">{pillar.n}</span>
                    <h4>{pillar.t}</h4>
                    <p>{pillar.p}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="tal-how">
          <div className="tal-wrap">
            <h2 className="tal-section-title animate-on-scroll">How It Works</h2>
            <p className="tal-section-lede animate-on-scroll">Designed for the Nigerian workday.</p>
            <p className="tal-how__intro animate-on-scroll">No full-day workshops. No pulling staff off their desks. Talentry fits into the rhythm of real work.</p>
            <ol className="tal-how__steps">
              {[
                {
                  n: '01',
                  t: 'You receive a personal welcome video',
                  p: 'Before week one begins, you get a personal video walking you through what your staff are about to experience and what to watch for as the weeks progress.',
                },
                {
                  n: '02',
                  t: 'Weekly session delivered every Monday',
                  p: 'Your staff receive one focused session via WhatsApp or email. 15 minutes. One powerful insight. No disruption to the workday.',
                },
                {
                  n: '03',
                  t: 'Practical task applied during the week',
                  p: 'Each session includes one specific task your staff apply at work before Friday. Small. Observable. Connected directly to their real work.',
                },
                {
                  n: '04',
                  t: 'Monthly check-in builds accountability',
                  p: 'A short Friday question keeps engagement alive and builds the habit of reflection and accountability week by week.',
                },
                {
                  n: '05',
                  t: 'Access to all five development pillars',
                  p: 'You receive a clear monthly summary of participation, engagement quality, and observable shifts to look for in your team.',
                },
              ].map((s) => (
                <li key={s.n} className="tal-how-step animate-on-scroll">
                  <span className="tal-how-step__n">{s.n}</span>
                  <div>
                    <h3>{s.t}</h3>
                    <p>{s.p}</p>
                  </div>
                </li>
              ))}
            </ol>
            <article className="tal-sample-week animate-on-scroll">
              <p className="tal-sample-week__tag">Foundation Module | Video Learning</p>
              <h3 className="tal-sample-week__head">
                <span>Week 01</span> Why Companies Hire Anyone. And What That Means For You.
              </h3>
              <p className="tal-sample-week__hook">Every company hires for one reason: to solve a problem. What problem were you hired to solve?</p>
              <ul className="tal-sample-week__bullets">
                <li>The difference between your job title and your actual purpose in the organisation</li>
                <li>How the company makes money and where your role sits in that chain</li>
                <li>Reflection: Are you still solving the problem they hired you to solve?</li>
              </ul>
              <div className="tal-sample-week__task">
                <p className="tal-sample-week__taskLabel">This Week&apos;s Task</p>
                <p>
                  Write down in your own words what problem your company hired you to solve. Then write one honest sentence about how well you are solving it right now.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section id="free-month" className="tal-free-month">
          <div className="tal-wrap">
            <h2 className="tal-section-title animate-on-scroll">Your Free Month</h2>
            <p className="tal-section-lede animate-on-scroll">What happens when we go live.</p>
            <div className="tal-free-month__body animate-on-scroll">
              <p>
                When we go live, waitlist members get first access and early bird pricing. The first four weeks are completely free with no commitment required. By the end of week four you will know whether this is working. You will see it in how your staff engage and feel it in the conversations happening in your team.
              </p>
              <p>
                If you do not feel the value by week four, you cancel. No hard feelings. No charge. But if the content does what we know it does, cancelling will be the last thing on your mind.
              </p>
            </div>
            <div className="tal-cta-row animate-on-scroll">
              <a className="tal-btn-solid" href="#waitlist">
                Join Waitlist
              </a>
            </div>
          </div>
        </section>

        <section id="journey" className="tal-journey" aria-label="Your first weeks">
          <div className="tal-wrap">
            <h2 className="tal-section-title animate-on-scroll">Your first weeks</h2>
            <ol className="tal-journey__track">
              {[
                {
                  n: '0',
                  t: 'Before Week 1',
                  s: 'Personal welcome video from the Talentry team',
                  p: 'You receive a welcome video walking you through what your staff are about to experience and why it matters for your business.',
                },
                {
                  n: '1',
                  t: 'Week 1',
                  s: 'Why Companies Hire Anyone',
                  p: 'Your staff confront the real reason they are in your business. Not the job description. The actual problem they were hired to solve.',
                },
                {
                  n: '2',
                  t: 'Week 2',
                  s: 'Why Are You Really Here',
                  p: 'What do you want your time at this company to mean? Staff define their professional purpose for the first time.',
                },
                {
                  n: '3',
                  t: 'Week 3',
                  s: 'Pain or Gain',
                  p: 'The most honest session in the programme. Staff assess themselves: are they currently an asset or a liability to the business?',
                },
                {
                  n: '4',
                  t: 'Week 4 | Decision Point',
                  s: 'Become a Key Person of Influence and Value',
                  p: 'Staff commit to what they want to be known for. Your card is charged only if you choose to continue after this week.',
                },
              ].map((row) => (
                <li key={row.n} className="tal-journey__step animate-on-scroll">
                  <span className="tal-journey__n">{row.n}</span>
                  <div>
                    <p className="tal-journey__phase">{row.t}</p>
                    <h3>{row.s}</h3>
                    <p>{row.p}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="pricing" className="tal-pricing-v2">
          <div className="tal-wrap">
            <h2 className="tal-section-title animate-on-scroll">Simple Pricing</h2>
            <p className="tal-section-lede animate-on-scroll">No surprises. No long contracts.</p>
            <p className="tal-pricing-v2__note animate-on-scroll">First month is completely free across all tiers. After that, pay monthly. Cancel anytime.</p>
            <div className="tal-pricing-v2__grid">
              <article className="tal-price-card animate-on-scroll">
                <h3>Starter</h3>
                <p className="tal-price-card__price">
                  {formatNaira(PLAN_PRICING.starter)}<span>/month</span>
                </p>
                <p className="tal-price-card__cap">Up to 5 staff members</p>
                <ul>
                  {['Weekly staff sessions for all enrolled staff', 'Video delivery to staff email at 4am Mondays', 'Monthly accountability check-ins', 'Monthly employer session', 'Monthly progress summary'].map(
                    (x) => (
                      <li key={x}>
                        <span aria-hidden>✓</span> {x}
                      </li>
                    )
                  )}
                </ul>
                <a className="tal-price-card__btn" href="#waitlist">
                  Join Waitlist
                </a>
              </article>
              <article className="tal-price-card tal-price-card--featured animate-on-scroll">
                <span className="tal-price-card__badge">Most Popular</span>
                <h3>Growth</h3>
                <p className="tal-price-card__price">
                  {formatNaira(PLAN_PRICING.growth)}<span>/month</span>
                </p>
                <p className="tal-price-card__cap">Up to 10 staff members</p>
                <ul>
                  {['Everything in Starter', 'Role-specific content tracks', 'Bi-weekly group reflection sessions', 'Quarterly review call with programme lead', 'Priority access to new content'].map((x) => (
                    <li key={x}>
                      <span aria-hidden>✓</span> {x}
                    </li>
                  ))}
                </ul>
                <a className="tal-price-card__btn" href="#waitlist">
                  Join Waitlist
                </a>
              </article>
              <article className="tal-price-card animate-on-scroll">
                <h3>Team</h3>
                <p className="tal-price-card__price">
                  {formatNaira(PLAN_PRICING.team)}<span>/month</span>
                </p>
                <p className="tal-price-card__cap">Up to 15 staff members</p>
                <ul>
                  {['Everything in Growth', 'Industry-customised content', 'Monthly 1-on-1 staff progress calls', 'Dedicated programme manager', 'Early access to new modules'].map((x) => (
                    <li key={x}>
                      <span aria-hidden>✓</span> {x}
                    </li>
                  ))}
                </ul>
                <a className="tal-price-card__btn" href="#waitlist">
                  Join Waitlist
                </a>
              </article>
              <article className="tal-price-card tal-price-card--enterprise animate-on-scroll">
                <h3>Enterprise</h3>
                <p className="tal-price-card__price tal-price-card__price--custom">Custom pricing</p>
                <p className="tal-price-card__cap">15+ staff members</p>
                <ul>
                  {['Everything in Team', 'Fully customised programme design', 'Dedicated Talentry programme lead', 'Custom content for your industry and culture', 'Flexible team size and delivery structure'].map((x) => (
                    <li key={x}>
                      <span aria-hidden>✓</span> {x}
                    </li>
                  ))}
                </ul>
                <a className="tal-price-card__btn tal-price-card__btn--outline" href="#waitlist">
                  Join Waitlist
                </a>
              </article>
            </div>
            <p className="tal-pricing-v2__footer animate-on-scroll">
              First month is completely free when we launch. Join the waitlist now to lock in your early bird pricing. No payment required today.
            </p>
            <div className="tal-cta-row animate-on-scroll">
              <a className="tal-btn-solid" href="#waitlist">
                Join Waitlist
              </a>
            </div>
          </div>
        </section>

        <section id="waitlist" className="tal-waitlist-band">
          <div className="waitlist-container">
            <h2 className="animate-on-scroll">Join Waitlist</h2>
            <p className="waitlist-subtitle animate-on-scroll">
              We are opening Talentry to a small first cohort very soon. Sign up and you will be the first to know when we go live. No payment yet.
            </p>
            <p className="tal-waitlist-promise animate-on-scroll">
              Takes about 30 seconds. No payment required. We will reach out when we open.
            </p>
            <form id="waitlist-form" className="animate-on-scroll" onSubmit={onSubmit}>
              <div className="form-group">
                <label className="sr-only" htmlFor={`${baseId}-fullName`}>
                  Your full name
                </label>
                <input
                  id={`${baseId}-fullName`}
                  name="fullName"
                  type="text"
                  placeholder="Your Full Name"
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) => onFieldChange('fullName', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label className="sr-only" htmlFor={`${baseId}-businessName`}>
                  Business name
                </label>
                <input
                  id={`${baseId}-businessName`}
                  name="businessName"
                  type="text"
                  placeholder="Business Name"
                  autoComplete="organization"
                  value={form.businessName}
                  onChange={(e) => onFieldChange('businessName', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label className="sr-only" htmlFor={`${baseId}-whatsapp`}>
                  WhatsApp number
                </label>
                <input
                  id={`${baseId}-whatsapp`}
                  name="whatsapp"
                  type="tel"
                  inputMode="tel"
                  placeholder="WhatsApp Number"
                  value={form.whatsapp}
                  onChange={(e) => onFieldChange('whatsapp', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label className="sr-only" htmlFor={`${baseId}-email`}>
                  Email address
                </label>
                <input
                  id={`${baseId}-email`}
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => onFieldChange('email', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label className="sr-only" htmlFor={`${baseId}-staff`}>
                  How many staff do you have?
                </label>
                <select
                  id={`${baseId}-staff`}
                  name="staffCount"
                  value={form.staffCount}
                  onChange={(e) => onFieldChange('staffCount', e.target.value)}
                  disabled={isLoading}
                  required
                >
                  <option value="" disabled>
                    Select team size
                  </option>
                  {STAFF_COUNT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="sr-only" htmlFor={`${baseId}-sector`}>
                  Business sector
                </label>
                <select
                  id={`${baseId}-sector`}
                  name="sector"
                  value={form.sector}
                  onChange={(e) => onFieldChange('sector', e.target.value)}
                  disabled={isLoading}
                  required
                >
                  {SECTOR_OPTIONS.map((opt) => (
                    <option key={opt.value || 'placeholder'} value={opt.value} disabled={opt.value === ''}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="sr-only" htmlFor={`${baseId}-challenge`}>
                  Biggest staff challenge
                </label>
                <select
                  id={`${baseId}-challenge`}
                  name="challenge"
                  value={form.challenge}
                  onChange={(e) => onFieldChange('challenge', e.target.value)}
                  disabled={isLoading}
                  required
                >
                  {CHALLENGE_OPTIONS.map((opt) => (
                    <option key={opt.value || 'placeholder-ch'} value={opt.value} disabled={opt.value === ''}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="submit-button" disabled={isLoading}>
                {buttonLabel}
              </button>
              {submitState === 'error' && submitError ? (
                <p className="form-error" role="alert">
                  {submitError}
                </p>
              ) : null}
            </form>
            <p className="disclaimer animate-on-scroll">Early access, launch updates, and programme details — we never sell your data.</p>
            <div className="referral-card animate-on-scroll">
              <div className="referral-title">Share the waitlist</div>
              <p className="referral-copy">Send your invite link to another SME owner who should be on the list.</p>
              <button type="button" className="referral-copy-btn" onClick={copyInviteLink}>
                Copy your invite link
              </button>
              {referralToast ? (
                <div className="referral-toast is-visible" role="status">
                  {referralToast}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section id="faq" className="tal-faq" aria-labelledby="faq-heading">
          <div className="tal-wrap">
            <h2 id="faq-heading" className="tal-section-title animate-on-scroll">
              Questions
            </h2>
            <p className="tal-section-lede animate-on-scroll">Things people ask before they sign up</p>
            <div className="tal-faq__list">
              {FAQ_ITEMS.map((item, i) => (
                <div key={item.q} className="tal-faq__item animate-on-scroll">
                  <button
                    type="button"
                    className="tal-faq__q"
                    aria-expanded={openFaq === i}
                    aria-controls={`${baseId}-faq-${i}`}
                    id={`${baseId}-faq-btn-${i}`}
                    onClick={() => setOpenFaq((prev) => (prev === i ? null : i))}
                  >
                    <span>{item.q}</span>
                    <span className="tal-faq__icon" aria-hidden>
                      {openFaq === i ? '−' : '+'}
                    </span>
                  </button>
                  <div
                    id={`${baseId}-faq-${i}`}
                    role="region"
                    aria-labelledby={`${baseId}-faq-btn-${i}`}
                    className="tal-faq__panel"
                    hidden={openFaq !== i}
                  >
                    {openFaq === i ? <p className="tal-faq__a">{item.a}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="tal-footer tal-footer--content">
        <div className="tal-footer__grid">
          <div className="tal-footer__brand">
            <p className="tal-footer__name">Talentry</p>
          </div>
          <nav className="tal-footer__nav" aria-label="Footer">
            <a href="#problem">The Problem</a>
            <a href="#programme">The Programme</a>
            <a href="#pricing">Pricing</a>
            <a href="#waitlist">Join Waitlist</a>
          </nav>
          <div className="tal-footer__social">
            <a className="tal-foot-social tal-foot-social--x" href="https://twitter.com/intent/tweet?text=Join%20the%20Talentry%20waitlist" target="_blank" rel="noopener noreferrer" aria-label="Share on X">
              <i className="fa-brands fa-x-twitter" aria-hidden="true" />
            </a>
            <a className="tal-foot-social tal-foot-social--wa" href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
              <i className="fa-brands fa-whatsapp" aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="tal-footer__bar">
          <p>© {new Date().getFullYear()} Talentry</p>
        </div>
      </footer>
    </div>
  )
}

export default App
