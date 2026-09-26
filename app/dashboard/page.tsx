import type { CSSProperties } from 'react'

export const pageWrapStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#fff',
  fontFamily: 'Segoe UI, system-ui, sans-serif',
}

export const loadingWrapStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export const loadingTextStyle: CSSProperties = {
  color: '#0F172A',
  fontSize: '14px',
}

export const topBarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 16px',
  background: '#0F172A',
}

export const menuButtonStyle: CSSProperties = {
  background: 'rgba(255,255,255,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '8px',
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: '16px',
  color: '#fff',
}

export const brandTitleStyle: CSSProperties = {
  fontSize: '18px',
  fontWeight: 800,
  color: '#fff',
}

export const actingAsStyle: CSSProperties = {
  fontSize: '11px',
  color: '#94A3B8',
  fontWeight: 400,
  marginLeft: '8px',
}

export const menuOverlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(15,23,42,0.5)',
  zIndex: 50,
}

export const menuPanelStyle: CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  bottom: 0,
  width: '260px',
  maxWidth: '80vw',
  background: '#0F172A',
  boxShadow: '4px 0 24px rgba(0,0,0,0.2)',
  display: 'flex',
  flexDirection: 'column',
  padding: '16px',
  overflowY: 'auto',
}

export const menuHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '20px',
}

export const menuTitleStyle: CSSProperties = {
  fontSize: '16px',
  fontWeight: 800,
  color: '#fff',
}

export const menuCloseStyle: CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  fontSize: '18px',
  color: '#94A3B8',
}

export const menuListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  flex: 1,
}

export const sidebarLinkStyle: CSSProperties = {
  display: 'block',
  color: '#E2E8F0',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 600,
  padding: '10px 12px',
  borderRadius: '8px',
}

export const signOutRowStyle: CSSProperties = {
  borderTop: '1px solid rgba(255,255,255,0.1)',
  paddingTop: '12px',
}

export const signOutButtonStyle: CSSProperties = {
  ...sidebarLinkStyle,
  width: '100%',
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: '#F87171',
  fontFamily: 'inherit',
  textAlign: 'left',
}

export const contentWrapStyle: CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '16px',
}

export const welcomeBoxStyle: CSSProperties = {
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '24px',
  textAlign: 'center',
  marginBottom: '20px',
}

export const welcomeTitleStyle: CSSProperties = {
  color: '#0F172A',
  fontSize: '16px',
  marginBottom: '8px',
}

export const welcomeTextStyle: CSSProperties = {
  color: '#64748B',
  fontSize: '13px',
  marginBottom: '16px',
}

export const welcomeButtonStyle: CSSProperties = {
  display: 'inline-block',
  background: '#0F172A',
  color: '#fff',
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 700,
}

export const profileCardStyle: CSSProperties = {
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
}

export const profileTopRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '8px',
}

export const businessIdBadgeStyle: CSSProperties = {
  display: 'inline-block',
  background: '#0F172A',
  color: '#fff',
  fontSize: '10px',
  fontWeight: 700,
  padding: '2px 10px',
  borderRadius: '4px',
  marginBottom: '6px',
}

export const businessNameStyle: CSSProperties = {
  color: '#0F172A',
  fontWeight: 700,
  fontSize: '15px',
}

export const editLinkStyle: CSSProperties = {
  background: '#fff',
  color: '#0F172A',
  border: '1px solid #E2E8F0',
  borderRadius: '6px',
  padding: '4px 10px',
  fontSize: '11px',
  textDecoration: 'none',
}

export const locationLineStyle: CSSProperties = {
  color: '#64748B',
  fontSize: '12px',
  marginBottom: '8px',
}

export const storeLinkStyle: CSSProperties = {
  color: '#0F172A',
  fontSize: '12px',
  textDecoration: 'underline',
  fontWeight: 600,
}

export const scoreLabelStyle: CSSProperties = {
  fontSize: '11px',
  color: '#94A3B8',
  fontWeight: 700,
  textTransform: 'uppercase',
  marginBottom: '6px',
}

export const scoreRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '12px',
  marginBottom: '12px',
}

export const scoreNumberSuffixStyle: CSSProperties = {
  fontSize: '16px',
  color: '#94A3B8',
}

export const scoreTrackStyle: CSSProperties = {
  background: '#E2E8F0',
  borderRadius: '10px',
  height: '8px',
  overflow: 'hidden',
}

export const actionBoxStyle: CSSProperties = {
  background: '#FFF7ED',
  border: '1px solid #FED7AA',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
}

export const actionLabelStyle: CSSProperties = {
  fontSize: '11px',
  color: '#9A3412',
  fontWeight: 700,
  textTransform: 'uppercase',
  marginBottom: '6px',
}

export const actionTaskStyle: CSSProperties = {
  fontSize: '14px',
  color: '#0F172A',
  fontWeight: 600,
  marginBottom: '10px',
}

export const actionButtonStyle: CSSProperties = {
  display: 'inline-block',
  background: '#0F172A',
  color: '#fff',
  padding: '8px 18px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontSize: '12px',
  fontWeight: 700,
}

export const indexingBoxStyle: CSSProperties = {
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '16px',
}

export const indexingTitleStyle: CSSProperties = {
  color: '#0F172A',
  fontSize: '14px',
  marginBottom: '10px',
}

export const indexingRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '8px',
}

export const indexingTextStyle: CSSProperties = {
  color: '#64748B',
  fontSize: '12px',
  lineHeight: 1.5,
}

export const statsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '12px',
  marginBottom: '20px',
}

export const statCardStyle: CSSProperties = {
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '16px',
}

export const statNumberStyle: CSSProperties = {
  color: '#0F172A',
  fontSize: '24px',
  fontWeight: 800,
}

export const statLabelStyle: CSSProperties = {
  color: '#64748B',
  fontSize: '12px',
  marginTop: '4px',
}

export const productsHeaderRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '12px',
}

export const productsHeadingStyle: CSSProperties = {
  color: '#0F172A',
  fontSize: '15px',
}

export const addProductButtonStyle: CSSProperties = {
  background: '#0F172A',
  color: '#fff',
  padding: '8px 16px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '12px',
  fontWeight: 700,
}

export const locationBannerStyle: CSSProperties = {
  background: '#F0F9FF',
  border: '1px solid #BAE6FD',
  borderRadius: '8px',
  padding: '10px 14px',
  marginBottom: '16px',
  fontSize: '12px',
  color: '#0369A1',
  fontWeight: 600,
}

export const emptyProductsBoxStyle: CSSProperties = {
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '30px',
  textAlign: 'center',
}

export const emptyProductsTextStyle: CSSProperties = {
  color: '#64748B',
  fontSize: '13px',
  marginBottom: '12px',
}

export const emptyProductsButtonStyle: CSSProperties = {
  display: 'inline-block',
  background: '#0F172A',
  color: '#fff',
  padding: '10px 20px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 700,
}

export const productRowStyle: CSSProperties = {
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '10px',
  padding: '12px',
  marginBottom: '10px',
  display: 'flex',
  gap: '12px',
}

export const productImageStyle: CSSProperties = {
  width: '56px',
  height: '56px',
  borderRadius: '8px',
  objectFit: 'cover',
  flexShrink: 0,
}

export const productInfoWrapStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
}

export const productNameStyle: CSSProperties = {
  color: '#0F172A',
  fontWeight: 600,
  fontSize: '13px',
}

export const productPriceStyle: CSSProperties = {
  color: '#475569',
  fontSize: '12px',
}

export const productTagRowStyle: CSSProperties = {
  display: 'flex',
  gap: '6px',
  marginTop: '6px',
  flexWrap: 'wrap',
}

export const editTagStyle: CSSProperties = {
  fontSize: '10px',
  padding: '2px 8px',
  borderRadius: '4px',
  background: '#fff',
  color: '#0F172A',
  border: '1px solid #E2E8F0',
  textDecoration: 'none',
}

export const hideButtonStyle: CSSProperties = {
  fontSize: '10px',
  padding: '2px 8px',
  borderRadius: '4px',
  background: '#fff',
  color: '#64748B',
  border: '1px solid #E2E8F0',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

export const deleteButtonStyle: CSSProperties = {
  fontSize: '10px',
  padding: '2px 8px',
  borderRadius: '4px',
  background: 'transparent',
  color: '#ff4444',
  border: '1px solid #ff4444',
  cursor: 'pointer',
  fontFamily: 'inherit',
}

export function scoreNumberStyle(color: string): CSSProperties {
  return {
    fontSize: '32px',
    fontWeight: 800,
    color,
  }
}

export function scoreChangeStyle(positive: boolean): CSSProperties {
  return {
    fontSize: '13px',
    fontWeight: 700,
    color: positive ? '#00aa55' : '#ff4444',
  }
}

export function scoreFillStyle(color: string, pct: number): CSSProperties {
  return {
    background: color,
    height: '100%',
    width: pct + '%',
    borderRadius: '10px',
  }
}

export function statusDotStyle(color: string): CSSProperties {
  return {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: color,
  }
}

export function statusLabelStyle(color: string): CSSProperties {
  return {
    color,
    fontSize: '13px',
    fontWeight: 700,
  }
}

export function publishBadgeStyle(published: boolean): CSSProperties {
  return {
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '4px',
    background: published ? '#F0FDF4' : '#F8FAFC',
    color: published ? '#166534' : '#94A3B8',
    border: '1px solid ' + (published ? '#BBF7D0' : '#E2E8F0'),
  }
}
