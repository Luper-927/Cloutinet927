'use client'

import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    if (isStandalone) return

    function handler(e: any) {
      e.preventDefault()
      setDeferredPrompt(e)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed', bottom: '16px', left: '16px', right: '16px',
        maxWidth: '440px', margin: '0 auto',
        background: '#0F172A', borderRadius: '12px', padding: '14px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px', zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        fontFamily: 'Segoe UI, system-ui, sans-serif'
      }}
    >
      <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>
        Install Cloutinet for quick access
      </div>
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={() => setVisible(false)}
          style={{
            background: 'transparent', color: '#94A3B8', border: 'none',
            fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', padding: '8px'
          }}
        >
          Not now
        </button>
        <button
          onClick={handleInstall}
          style={{
            background: '#fff', color: '#0F172A', border: 'none',
            borderRadius: '8px', padding: '8px 14px', fontSize: '13px',
            fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
          }}
        >
          Install
        </button>
      </div>
    </div>
  )
}
