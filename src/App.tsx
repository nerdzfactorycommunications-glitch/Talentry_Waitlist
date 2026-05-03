import { type FormEvent, type RefObject, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import talentryLogoWordmark from './assets/talentry-logo.svg'
import talentryLogoWordmarkLight from './assets/talentry-logo-dark.svg'
import './App.css'

type BillingCycle = 'monthly' | 'annual'
type SubmitState = 'idle' | 'loading' | 'success' | 'error'
type WaitlistFormState = {
  fullName: string
  businessName: string
  email: string
  whatsapp: string
  staffCount: string
}

const STAFF_COUNT_OPTIONS = ['1-5', '6-10', '11-15', '16+'] as const
const PLAN_PRICING = {
  starter: { monthly: 35000, annual: 300000 },
  growth: { monthly: 65000, annual: 564000 },
  team: { monthly: 90000, annual: 780000 },
} as const

const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
const validateWhatsapp = (phone: string) => /^\+?[0-9]{9,15}$/.test(phone.trim())
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
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
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
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      surface.width = Math.floor(width * dpr)
      surface.height = Math.floor(height * dpr)
      surface.style.width = `${width}px`
      surface.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
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
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [referralToast, setReferralToast] = useState<string | null>(null)
  const [form, setForm] = useState<WaitlistFormState>({
    fullName: '',
    businessName: '',
    email: '',
    whatsapp: '',
    staffCount: '1-5',
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

  const starterEq = Math.round(PLAN_PRICING.starter.annual / 12)
  const growthEq = Math.round(PLAN_PRICING.growth.annual / 12)
  const teamEq = Math.round(PLAN_PRICING.team.annual / 12)
  const pricingNote =
    billingCycle === 'monthly'
      ? 'Monthly plans include a 28-day free trial.'
      : 'Annual plans are discounted (3-month equivalent savings).'
  const isLoading = submitState === 'loading'

  const buttonLabel =
    submitState === 'loading'
      ? 'Joining...'
      : submitState === 'success'
        ? 'Joined'
        : submitState === 'error'
          ? 'Try again'
          : 'Join the waitlist'

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
    if (!validateWhatsapp(form.whatsapp)) return setSubmitState('error'), setSubmitError('Please enter a valid WhatsApp number.')
    setSubmitState('loading')
    await new Promise((r) => setTimeout(r, 900))
    setSubmitState('success')
    window.location.hash = '#thanks'
  }

  const deliveryChip = useMemo(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''
      return `Staff modules weekly • Employer sessions monthly • ${tz || 'Your local time'}`
    } catch {
      return 'Staff modules weekly • Employer sessions monthly • Local time'
    }
  }, [])

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
                  Waitlist
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
            <p>© {new Date().getFullYear()} Talentry • A NerdzFactory Programme</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="page">
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
              <a href="#hero" onClick={() => setMenuOpen(false)}>
                Home
              </a>
            </li>
            <li>
              <a href="#inclusions" onClick={() => setMenuOpen(false)}>
                Programme
              </a>
            </li>
            <li>
              <a href="#plans" onClick={() => setMenuOpen(false)}>
                Plans
              </a>
            </li>
            <li>
              <a href="#outcomes" onClick={() => setMenuOpen(false)}>
                Outcomes
              </a>
            </li>
            <li>
              <a href="#waitlist" onClick={() => setMenuOpen(false)}>
                Waitlist
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
            <div className="tal-hero__grid">
              <div className="tal-hero__copy">
                <p className="tal-hero__eyebrow animate-on-scroll">NerdzFactory • Staff development</p>
                <h1 className="tal-hero__title animate-on-scroll">
                  Build teams that <span className="tal-hero__gradient">execute without drift.</span>
                </h1>
                <p className="tal-hero__lede animate-on-scroll">
                  Talentry is a 12-month programme for Nigerian SMEs: weekly learning for staff, monthly coaching for leaders — fully digital, fully practical.
                </p>
                <ul className="tal-hero__ticks animate-on-scroll" aria-label="Highlights">
                  <li>No classroom logistics</li>
                  <li>Designed for busy operators</li>
                  <li>Measurable behaviour change</li>
                </ul>
                <div className="tal-hero__actions animate-on-scroll">
                  <a className="tal-hero__btn tal-hero__btn--primary" href="#waitlist">
                    Reserve your spot
                  </a>
                  <a className="tal-hero__btn tal-hero__btn--ghost" href="#plans">
                    View plans
                  </a>
                </div>
              </div>
              <aside className="tal-hero__panel animate-on-scroll" aria-label="Programme snapshot">
                <div className="tal-hero__panelTop">
                  <span className="tal-hero__chip">Live rhythm</span>
                  <p className="tal-hero__panelNote" aria-live="polite">
                    {deliveryChip}
                  </p>
                </div>
                <dl className="tal-hero__stats">
                  <div>
                    <dt>Duration</dt>
                    <dd>12 months</dd>
                  </div>
                  <div>
                    <dt>Staff cadence</dt>
                    <dd>Weekly drops</dd>
                  </div>
                  <div>
                    <dt>Leaders</dt>
                    <dd>Monthly sessions</dd>
                  </div>
                </dl>
              </aside>
            </div>
          </div>
        </section>

        <section id="inclusions" className="tal-inclusions" aria-label="Programme inclusions">
          <div className="tal-inclusions__intro animate-on-scroll">
            <span className="tal-inclusions__label">Inside Talentry</span>
            <h2 className="tal-inclusions__title">One operating system for people performance.</h2>
          </div>
          <div className="tal-inclusions__track">
            <article className="tal-inc-card animate-on-scroll">
              <span className="tal-inc-card__icon" aria-hidden="true">
                ◆
              </span>
              <h3>Weekly staff modules</h3>
              <p>Short, applied lessons that fit into real work weeks — not theory marathons.</p>
            </article>
            <article className="tal-inc-card animate-on-scroll">
              <span className="tal-inc-card__icon" aria-hidden="true">
                ◇
              </span>
              <h3>Employer coaching</h3>
              <p>Monthly guidance on hiring, onboarding, and managing for outcomes.</p>
            </article>
            <article className="tal-inc-card animate-on-scroll">
              <span className="tal-inc-card__icon" aria-hidden="true">
                ▲
              </span>
              <h3>Playbooks you reuse</h3>
              <p>Templates and rhythms you can run again as you grow headcount.</p>
            </article>
            <article className="tal-inc-card animate-on-scroll">
              <span className="tal-inc-card__icon" aria-hidden="true">
                ●
              </span>
              <h3>Accountability design</h3>
              <p>Clear ownership, follow-through, and communication habits across teams.</p>
            </article>
          </div>
        </section>

        <section id="plans" className="tal-plans" aria-label="Pricing">
          <div className="tal-plans__head animate-on-scroll">
            <div>
              <h2 className="tal-plans__title">Transparent plans</h2>
              <p className="tal-plans__sub">{pricingNote}</p>
            </div>
            <div className="tal-plans__toggle" role="group" aria-label="Billing cycle">
              <button type="button" className={billingCycle === 'monthly' ? 'is-on' : ''} onClick={() => setBillingCycle('monthly')}>
                Monthly
              </button>
              <button type="button" className={billingCycle === 'annual' ? 'is-on' : ''} onClick={() => setBillingCycle('annual')}>
                Annual
              </button>
            </div>
          </div>
          <div className="tal-plans__deck">
            <article className="tal-plan animate-on-scroll">
              <header>
                <h3>Starter</h3>
                <p>Up to 5 staff</p>
              </header>
              <p className="tal-plan__price">
                {billingCycle === 'monthly' ? (
                  <>
                    <strong>{formatNaira(PLAN_PRICING.starter.monthly)}</strong>
                    <span>/ month</span>
                  </>
                ) : (
                  <>
                    <strong>{formatNaira(PLAN_PRICING.starter.annual)}</strong>
                    <span>/ year</span>
                    <small>~{formatNaira(starterEq)}/mo eq.</small>
                  </>
                )}
              </p>
            </article>
            <article className="tal-plan tal-plan--featured animate-on-scroll">
              <span className="tal-plan__badge">Most picked</span>
              <header>
                <h3>Growth</h3>
                <p>Up to 10 staff</p>
              </header>
              <p className="tal-plan__price">
                {billingCycle === 'monthly' ? (
                  <>
                    <strong>{formatNaira(PLAN_PRICING.growth.monthly)}</strong>
                    <span>/ month</span>
                  </>
                ) : (
                  <>
                    <strong>{formatNaira(PLAN_PRICING.growth.annual)}</strong>
                    <span>/ year</span>
                    <small>~{formatNaira(growthEq)}/mo eq.</small>
                  </>
                )}
              </p>
            </article>
            <article className="tal-plan animate-on-scroll">
              <header>
                <h3>Team</h3>
                <p>Up to 15 staff</p>
              </header>
              <p className="tal-plan__price">
                {billingCycle === 'monthly' ? (
                  <>
                    <strong>{formatNaira(PLAN_PRICING.team.monthly)}</strong>
                    <span>/ month</span>
                  </>
                ) : (
                  <>
                    <strong>{formatNaira(PLAN_PRICING.team.annual)}</strong>
                    <span>/ year</span>
                    <small>~{formatNaira(teamEq)}/mo eq.</small>
                  </>
                )}
              </p>
            </article>
          </div>
        </section>

        <section id="outcomes" className="tal-outcomes" aria-label="What you gain">
          <div className="tal-outcomes__head animate-on-scroll">
            <span className="tal-outcomes__kicker">Outcomes</span>
            <h2 className="tal-outcomes__title">From scattered effort to a team that closes the loop.</h2>
            <p className="tal-outcomes__lede">
              Talentry is a 12-month rhythm: staff learn in the flow of work while leaders tighten hiring, onboarding, and management systems.
            </p>
          </div>
          <div className="tal-outcomes__bento">
            <article className="tal-out__card tal-out__card--wide animate-on-scroll">
              <span className="tal-out__num">01</span>
              <h3>What Talentry is</h3>
              <p>Weekly staff modules plus monthly employer coaching — fully digital, built for Nigerian SMEs who cannot pause operations for classroom weeks.</p>
            </article>
            <article className="tal-out__card animate-on-scroll">
              <span className="tal-out__num">02</span>
              <h3>Sharper execution</h3>
              <p>Staff default to ownership: clearer handoffs, fewer dropped balls, and communication that matches the pace of the business.</p>
            </article>
            <article className="tal-out__card animate-on-scroll">
              <span className="tal-out__num">03</span>
              <h3>Better systems</h3>
              <p>Founders and managers get repeatable playbooks for hiring and onboarding without reinventing the wheel every quarter.</p>
            </article>
            <article className="tal-out__card tal-out__card--accent animate-on-scroll">
              <span className="tal-out__num">04</span>
              <h3>Consistency that sticks</h3>
              <p>Learning becomes a weekly habit — not a one-off workshop — so behaviour change compounds across the year.</p>
            </article>
          </div>
          <p className="tal-outcomes__tagline animate-on-scroll">Destination: reliable execution today, and people systems that scale with you tomorrow.</p>
        </section>

        <section id="waitlist" className="tal-waitlist-band">
          <div className="waitlist-container">
            <h2 className="animate-on-scroll">Join the waitlist</h2>
            <p className="waitlist-subtitle animate-on-scroll">
              Reserve early access to Talentry. We will confirm your spot and send launch updates — membership notices arrive first.
            </p>
            <form id="waitlist-form" className="animate-on-scroll" onSubmit={onSubmit}>
              <div className="form-group">
                <label className="sr-only" htmlFor={`${baseId}-fullName`}>
                  Full name
                </label>
                <input
                  id={`${baseId}-fullName`}
                  name="fullName"
                  type="text"
                  placeholder="Full name"
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
                  placeholder="Business name"
                  autoComplete="organization"
                  value={form.businessName}
                  onChange={(e) => onFieldChange('businessName', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label className="sr-only" htmlFor={`${baseId}-email`}>
                  Email
                </label>
                <input
                  id={`${baseId}-email`}
                  name="email"
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => onFieldChange('email', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label className="sr-only" htmlFor={`${baseId}-whatsapp`}>
                  WhatsApp
                </label>
                <input
                  id={`${baseId}-whatsapp`}
                  name="whatsapp"
                  type="tel"
                  inputMode="tel"
                  placeholder="WhatsApp number"
                  value={form.whatsapp}
                  onChange={(e) => onFieldChange('whatsapp', e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="form-group">
                <label className="sr-only" htmlFor={`${baseId}-staff`}>
                  Staff count
                </label>
                <select
                  id={`${baseId}-staff`}
                  name="staffCount"
                  value={form.staffCount}
                  onChange={(e) => onFieldChange('staffCount', e.target.value)}
                  disabled={isLoading}
                  required
                >
                  {STAFF_COUNT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      Staff: {opt}
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
              <div className="referral-title">Skip the line</div>
              <p className="referral-copy">Share your invite link with other SME owners who should be on the list.</p>
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
      </main>

      <footer className="tal-footer">
        <div className="tal-footer__grid">
          <div className="tal-footer__brand">
            <p className="tal-footer__name">Talentry</p>
            <p className="tal-footer__blurb">Staff development and employer coaching in one programme — by NerdzFactory.</p>
          </div>
          <nav className="tal-footer__nav" aria-label="Footer">
            <a href="#inclusions">Programme</a>
            <a href="#plans">Plans</a>
            <a href="#outcomes">Outcomes</a>
            <a href="#waitlist">Waitlist</a>
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
          <p>© {new Date().getFullYear()} Talentry • A NerdzFactory Programme</p>
        </div>
      </footer>
    </div>
  )
}

export default App
