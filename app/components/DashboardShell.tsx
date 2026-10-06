'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '../../lib/supabase'
import { getBusinessTier } from '../../lib/tiers'
import { getActingContext, ActingContext } from '../../lib/permissions'

type DashboardState = {
  context: ActingContext
  profile: any
  tierLimits: any
  locationName: string | null
  signOut: () => Promise<void>
}

const DashboardCtx = createContext<DashboardState | null>(null)

export function useDashboard(): DashboardState {
  const value = useContext(DashboardCtx)
  if (!value) throw new Error('useDashboard must be used inside DashboardShell')
  return value
}

type NavItem = {
  href: string
  label: string
  icon: string
  show: boolean
  external?: boolean
}

type NavGroup = { title: string; items: NavItem[] }

function isActive(pathname: string | null, href: string) {
  if (href.includes('#')) return false
  if (href === '/dashboard') return pathname === '/dashboard'
  return !!pathname && (pathname === href || pathname.startsWith(href + '/'))
}

function Icon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    home: (<><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>),
    users: (<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>),
    card: (<><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></>),
    file: (<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M16 13H8" /><path d="M16 17H8" /></>),
    megaphone: (<><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></>),
    zap: (<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />),
    activity: (<path d="M22 12h-4l-3 9L9 3l-3 9H2" />),
    code: (<><path d="M16 18l6-6-6-6" /><path d="M8 6l-6 6 6 6" /></>),
    globe: (<><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>),
    bag: (<><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></>),
    sliders: (<><path d="M4 21v-7" /><path d="M4 10V3" /><path d="M12 21v-9" /><path d="M12 8V3" /><path d="M20 21v-5" /><path d="M20 12V3" /><path d="M1 14h6" /><path d="M9 8h6" /><path d="M17 16h6" /></>),
    link: (<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>),
    briefcase: (<><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>),
    layers: (<><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>),
    more: (<><circle cx="5" cy="12" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="19" cy="12" r="1.5" /></>),
  }
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      {paths[name] ?? null}
    </svg>
  )
}

const shellCss = `
.cn-shell{min-height:100vh;background:#F8FAFC;color:#0F172A;font-family:'Segoe UI',system-ui,-apple-system,sans-serif}
.cn-shell *{box-sizing:border-box}
.cn-side{display:none}
.cn-top{position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;background:#fff;border-bottom:1px solid #E2E8F0;min-height:56px}
.cn-top-left{display:flex;align-items:center;gap:8px;min-width:0}
.cn-biz{font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cn-chip{font-size:12px;color:#475569;background:#F1F5F9;border-radius:999px;padding:3px 10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:170px}
.cn-acct{position:relative;flex-shrink:0}
.cn-avatar{width:36px;height:36px;border-radius:50%;border:none;background:#0F172A;color:#fff;font-weight:700;font-size:14px;cursor:pointer;font-family:inherit}
.cn-menu{position:absolute;right:0;top:44px;min-width:190px;background:#fff;border:1px solid #E2E8F0;border-radius:10px;box-shadow:0 8px 24px rgba(15,23,42,.12);padding:6px;z-index:60}
.cn-menu a,.cn-menu button{display:block;width:100%;text-align:left;padding:10px 12px;border-radius:8px;border:none;background:transparent;color:#0F172A;font-size:14px;font-family:inherit;text-decoration:none;cursor:pointer;min-height:40px}
.cn-menu a:hover,.cn-menu button:hover{background:#F1F5F9}
.cn-menu .cn-danger{color:#DC2626}
.cn-scrim{position:fixed;inset:0;z-index:50;background:transparent}
.cn-main{padding:16px 16px 96px}
.cn-bottom{position:fixed;left:0;right:0;bottom:0;z-index:40;display:flex;background:#fff;border-top:1px solid #E2E8F0;padding-bottom:env(safe-area-inset-bottom)}
.cn-bn{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;padding:8px 2px;min-height:56px;font-size:11px;color:#64748B;text-decoration:none;background:transparent;border:none;font-family:inherit;cursor:pointer}
.cn-bn.is-active{color:#0F172A;font-weight:700}
.cn-bn.is-active svg{color:#FF6B35}
.cn-sheet-bg{position:fixed;inset:0;z-index:70;background:rgba(15,23,42,.5)}
.cn-sheet{position:absolute;left:0;right:0;bottom:0;max-height:82vh;overflow-y:auto;background:#fff;border-radius:16px 16px 0 0;padding:8px 16px calc(16px + env(safe-area-inset-bottom))}
.cn-grip{width:36px;height:4px;border-radius:2px;background:#CBD5E1;margin:6px auto 8px}
.cn-sheet-group{font-size:13px;font-weight:700;color:#64748B;margin:14px 0 2px}
.cn-sheet-item{display:flex;align-items:center;gap:12px;width:100%;padding:12px 8px;min-height:48px;border-radius:8px;font-size:15px;color:#0F172A;text-decoration:none;background:transparent;border:none;font-family:inherit;text-align:left;cursor:pointer}
.cn-sheet-item:hover{background:#F1F5F9}
.cn-sheet-item.is-active{font-weight:700}
.cn-sheet-item.cn-danger{color:#DC2626}
.cn-brand{padding:4px 12px 14px}
.cn-brand-name{font-size:18px;font-weight:800;color:#fff}
.cn-brand-sub{font-size:12px;color:#94A3B8;margin-top:2px}
.cn-group-title{font-size:13px;font-weight:700;color:#94A3B8;padding:16px 12px 4px}
.cn-link{display:flex;align-items:center;gap:10px;width:100%;padding:9px 12px;border-radius:8px;color:#CBD5E1;font-size:14px;font-weight:600;text-decoration:none;background:transparent;border:none;font-family:inherit;cursor:pointer;text-align:left}
.cn-link:hover{background:rgba(255,255,255,.07);color:#fff}
.cn-link.is-active{background:rgba(255,255,255,.12);color:#fff}
.cn-side-foot{margin-top:auto;padding-top:12px;border-top:1px solid rgba(255,255,255,.1)}
.cn-link:focus-visible,.cn-bn:focus-visible,.cn-sheet-item:focus-visible,.cn-avatar:focus-visible,.cn-menu a:focus-visible,.cn-menu button:focus-visible{outline:2px solid #FF6B35;outline-offset:2px}
.cn-loading{min-height:100vh;display:flex;align-items:center;justify-content:center;background:#fff;color:#0F172A;font-size:14px;font-family:'Segoe UI',system-ui,sans-serif}
@media (min-width:900px){
  .cn-side{display:flex;flex-direction:column;position:fixed;top:0;bottom:0;left:0;width:232px;background:#0F172A;padding:18px 12px;overflow-y:auto;z-index:40}
  .cn-top{margin-left:232px;padding:10px 32px}
  .cn-main{margin-left:232px;padding:28px 32px 48px}
  .cn-bottom,.cn-sheet-bg{display:none}
}
@media (prefers-reduced-motion:no-preference){
  .cn-sheet{animation:cnUp .18s ease-out}
  @keyframes cnUp{from{transform:translateY(24px);opacity:.6}to{transform:none;opacity:1}}
}
`

export default function DashboardShell({
  children,
  chrome = true,
}: {
  children: ReactNode
  chrome?: boolean
}) {
  const pathname = usePathname()
  const [context, setContext] = useState<ActingContext | null>(null)
  const [profile, setProfile] = useState<any>(null)
  const [tierLimits, setTierLimits] = useState<any>(null)
  const [locationName, setLocationName] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

  useEffect(() => { load() }, [])

  useEffect(() => {
    setSheetOpen(false)
    setAccountOpen(false)
  }, [pathname])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    const currentUser = userData?.user
    if (!currentUser) {
      window.location.href = '/auth'
      return
    }

    const ctx = await getActingContext(currentUser.id)
    if (!ctx) {
      window.location.href = '/onboarding'
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', ctx.ownerId)
      .single()

    const { limits } = await getBusinessTier(ctx.ownerId)

    if (ctx.locationId) {
      const { data: loc } = await supabase
        .from('locations')
        .select('business_name, address')
        .eq('id', ctx.locationId)
        .maybeSingle()
      setLocationName(loc?.business_name || loc?.address || null)
    }

    setContext(ctx)
    setProfile(profileData)
    setTierLimits(limits)
    setReady(true)
  }

  async function signOut() {
    await supabase.auth.signOut()
    window.location.href = '/auth'
  }

  if (!ready || !context) {
    return (
      <>
        <style>{shellCss}</style>
        <div className="cn-loading">Loading...</div>
      </>
    )
  }

  const perms = context.permissions
  const slug = profile?.business_slug

  const value: DashboardState = { context, profile, tierLimits, locationName, signOut }

  // Pages that haven't been converted yet: share the data, but don't draw
  // the sidebar, top bar or bottom navigation.
  if (!chrome) {
    return <DashboardCtx.Provider value={value}>{children}</DashboardCtx.Provider>
  }

  const groups: NavGroup[] = ([
    {
      title: 'Run',
      items: [
        { href: '/dashboard/activity', label: 'Activity', icon: 'activity', show: !!context.isOwner },
        { href: '/dashboard/documents', label: 'Documents', icon: 'file', show: !!perms.documents && !!tierLimits?.documentsModule },
        { href: '/dashboard/employees', label: 'Employees', icon: 'briefcase', show: !!perms.employees && !!tierLimits?.employees },
        { href: '/dashboard/ai', label: 'Intelligence', icon: 'zap', show: !!tierLimits?.advancedAI },
      ],
    },
    {
      title: 'Grow',
      items: [
        { href: '/dashboard/customers', label: 'Customers', icon: 'users', show: !!perms.customers },
        { href: '/dashboard#products', label: 'Products', icon: 'bag', show: !!perms.products },
        { href: '/dashboard/payments', label: 'Payments', icon: 'card', show: !!perms.payments && !!tierLimits?.paymentsModule },
        { href: '/dashboard/marketing', label: 'Marketing', icon: 'megaphone', show: !!tierLimits?.marketingAutomation },
      ],
    },
    {
      title: 'Connect',
      items: [
        { href: '/dashboard#visibility', label: 'Visibility', icon: 'globe', show: !!context.isOwner },
        { href: slug ? '/store/' + slug : '/dashboard', label: 'Public page', icon: 'link', show: !!slug, external: true },
        { href: '/dashboard/integrations', label: 'Integrations', icon: 'layers', show: !!context.isOwner && !!tierLimits?.integrations },
        { href: '/dashboard/api-keys', label: 'Developer and API', icon: 'code', show: !!context.isOwner && !!tierLimits?.integrations },
      ],
    },
    {
      title: 'Admin',
      items: [
        { href: '/dashboard/settings', label: 'Settings', icon: 'sliders', show: true },
        { href: '/dashboard/billing', label: 'Billing', icon: 'card', show: !!context.isOwner },
      ],
    },
  ] as NavGroup[])
    .map(g => ({ ...g, items: g.items.filter(i => i.show) }))
    .filter(g => g.items.length > 0)

  const flat = groups.flatMap(g => g.items)
  const bottomPriority = [
    '/dashboard/customers',
    '/dashboard/payments',
    '/dashboard#products',
    '/dashboard/ai',
    '/dashboard/employees',
  ]
  const bottomItems = bottomPriority
    .map(h => flat.find(i => i.href === h))
    .filter(Boolean)
    .slice(0, 3) as NavItem[]

  const initial = (context.employeeName || profile?.business_name || 'U').trim().charAt(0).toUpperCase()

  function renderSideLink(item: NavItem) {
    const active = isActive(pathname, item.href)
    const className = 'cn-link' + (active ? ' is-active' : '')
    if (item.external) {
      return (
        <a key={item.href + item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </a>
      )
    }
    return (
      <Link key={item.href + item.label} href={item.href} className={className} aria-current={active ? 'page' : undefined}>
        <Icon name={item.icon} />
        <span>{item.label}</span>
      </Link>
    )
  }

  function renderSheetLink(item: NavItem) {
    const active = isActive(pathname, item.href)
    const className = 'cn-sheet-item' + (active ? ' is-active' : '')
    if (item.external) {
      return (
        <a key={item.href + item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={className} onClick={() => setSheetOpen(false)}>
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </a>
      )
    }
    return (
      <Link key={item.href + item.label} href={item.href} className={className} onClick={() => setSheetOpen(false)} aria-current={active ? 'page' : undefined}>
        <Icon name={item.icon} />
        <span>{item.label}</span>
      </Link>
    )
  }

  return (
    <DashboardCtx.Provider value={value}>
      <style>{shellCss}</style>
      <div className="cn-shell">
        <aside className="cn-side" aria-label="Main navigation">
          <div className="cn-brand">
            <div className="cn-brand-name">Cloutinet</div>
            <div className="cn-brand-sub">Business Operating System</div>
          </div>

          <Link href="/dashboard" className={'cn-link' + (isActive(pathname, '/dashboard') ? ' is-active' : '')} aria-current={isActive(pathname, '/dashboard') ? 'page' : undefined}>
            <Icon name="home" />
            <span>Dashboard</span>
          </Link>

          {groups.map(group => (
            <div key={group.title}>
              <div className="cn-group-title">{group.title}</div>
              {group.items.map(renderSideLink)}
            </div>
          ))}

          <div className="cn-side-foot">
            <button className="cn-link" onClick={signOut} style={{ color: '#FCA5A5' }}>
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        <header className="cn-top">
          <div className="cn-top-left">
            <span className="cn-biz">{profile?.business_name || 'Your business'}</span>
            {locationName && <span className="cn-chip">{locationName}</span>}
            {!context.isOwner && context.employeeName && (
              <span className="cn-chip">Signed in as {context.employeeName}</span>
            )}
          </div>
          <div className="cn-acct">
            <button
              className="cn-avatar"
              onClick={() => setAccountOpen(o => !o)}
              aria-label="Account menu"
              aria-expanded={accountOpen}
            >
              {initial}
            </button>
            {accountOpen && (
              <>
                <div className="cn-scrim" onClick={() => setAccountOpen(false)} />
                <div className="cn-menu" role="menu">
                  <Link href="/dashboard/settings" onClick={() => setAccountOpen(false)}>Settings</Link>
                  {context.isOwner && (
                    <Link href="/dashboard/billing" onClick={() => setAccountOpen(false)}>Billing</Link>
                  )}
                  <button className="cn-danger" onClick={signOut}>Sign out</button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="cn-main">{children}</main>

        <nav className="cn-bottom" aria-label="Quick navigation">
          <Link href="/dashboard" className={'cn-bn' + (isActive(pathname, '/dashboard') ? ' is-active' : '')}>
            <Icon name="home" />
            <span>Home</span>
          </Link>
          {bottomItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={'cn-bn' + (isActive(pathname, item.href) ? ' is-active' : '')}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
          <button className="cn-bn" onClick={() => setSheetOpen(true)} aria-label="Open all sections">
            <Icon name="more" />
            <span>More</span>
          </button>
        </nav>

        {sheetOpen && (
          <div className="cn-sheet-bg" onClick={() => setSheetOpen(false)}>
            <div className="cn-sheet" onClick={e => e.stopPropagation()} role="dialog" aria-label="All sections">
              <div className="cn-grip" />
              {groups.map(group => (
                <div key={group.title}>
                  <div className="cn-sheet-group">{group.title}</div>
                  {group.items.map(renderSheetLink)}
                </div>
              ))}
              <div className="cn-sheet-group">Account</div>
              <button className="cn-sheet-item cn-danger" onClick={signOut}>Sign out</button>
            </div>
          </div>
        )}
      </div>
    </DashboardCtx.Provider>
  )
}
