import type { CSSProperties } from 'react'

export const loadingWrapStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export const loadingTextStyle: CSSProperties = {
  color: '#64748B',
  fontSize: '14px',
  fontFamily: 'Segoe UI, system-ui, sans-serif',
}

export const noPermissionWrapStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
}

export const noPermissionTextStyle: CSSProperties = {
  color: '#64748B',
  fontSize: '14px',
  fontFamily: 'Segoe UI, system-ui, sans-serif',
  textAlign: 'center',
}

export const pageWrapStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#fff',
  fontFamily: 'Segoe UI, system-ui, sans-serif',
}

export const headerBarStyle: CSSProperties = {
  background: '#0F172A',
  padding: '14px 20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

export const headerTitleStyle: CSSProperties = {
  fontSize: '16px',
  fontWeight: 800,
  color: '#fff',
}

export const backLinkStyle: CSSProperties = {
  color: '#94A3B8',
  fontSize: '13px',
  textDecoration: 'none',
}

export const upgradeContentWrapStyle: CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '48px 20px',
  textAlign: 'center',
}

export const upgradeIconStyle: CSSProperties = {
  fontSize: '36px',
  marginBottom: '12px',
}

export const upgradeHeadingStyle: CSSProperties = {
  fontSize: '18px',
  fontWeight: 800,
  color: '#0F172A',
  marginBottom: '8px',
}

export const upgradeTextStyle: CSSProperties = {
  fontSize: '14px',
  color: '#64748B',
  lineHeight: 1.5,
  marginBottom: '24px',
}

export const upgradeButtonStyle: CSSProperties = {
  display: 'inline-block',
  background: '#0F172A',
  color: '#fff',
  borderRadius: '8px',
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: 700,
  textDecoration: 'none',
}

export const contentWrapStyle: CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '24px 16px',
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

export const statsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '10px',
  marginBottom: '20px',
}

export const statCardGreenStyle: CSSProperties = {
  background: '#F0FDF4',
  border: '1px solid #BBF7D0',
  borderRadius: '12px',
  padding: '14px',
}

export const statLabelGreenStyle: CSSProperties = {
  fontSize: '11px',
  color: '#166534',
  fontWeight: 700,
  textTransform: 'uppercase',
}

export const statValueGreenStyle: CSSProperties = {
  fontSize: '18px',
  fontWeight: 800,
  color: '#166534',
  marginTop: '4px',
}

export const statCardOrangeStyle: CSSProperties = {
  background: '#FFF7ED',
  border: '1px solid #FED7AA',
  borderRadius: '12px',
  padding: '14px',
}

export const statLabelOrangeStyle: CSSProperties = {
  fontSize: '11px',
  color: '#9A3412',
  fontWeight: 700,
  textTransform: 'uppercase',
}

export const statValueOrangeStyle: CSSProperties = {
  fontSize: '18px',
  fontWeight: 800,
  color: '#9A3412',
  marginTop: '4px',
}

export const statCardNeutralStyle: CSSProperties = {
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '14px',
}

export const statLabelNeutralStyle: CSSProperties = {
  fontSize: '11px',
  color: '#475569',
  fontWeight: 700,
  textTransform: 'uppercase',
}

export const statValueNeutralStyle: CSSProperties = {
  fontSize: '18px',
  fontWeight: 800,
  color: '#0F172A',
  marginTop: '4px',
}

export const toggleFormButtonStyle: CSSProperties = {
  width: '100%',
  background: '#0F172A',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  padding: '12px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 700,
  fontFamily: 'inherit',
  marginBottom: '16px',
}

export const formBoxStyle: CSSProperties = {
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '20px',
}

export const inputStyle: CSSProperties = {
  width: '100%',
  background: '#fff',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  padding: '10px 12px',
  color: '#0F172A',
  fontSize: '13px',
  marginBottom: '10px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

export const statusRowStyle: CSSProperties = {
  display: 'flex',
  gap: '6px',
  flexWrap: 'wrap',
  marginBottom: '12px',
}

export function statusButtonStyle(active: boolean): CSSProperties {
  return {
    padding: '6px 10px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 700,
    border: '1px solid ' + (active ? '#0F172A' : '#E2E8F0'),
    background: active ? '#0F172A' : '#fff',
    color: active ? '#fff' : '#0F172A',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textTransform: 'capitalize',
  }
}

export const errorBoxStyle: CSSProperties = {
  background: '#FEF2F2',
  border: '1px solid #FECACA',
  borderRadius: '8px',
  padding: '10px',
  marginBottom: '12px',
}

export const errorTextStyle: CSSProperties = {
  color: '#dc2626',
  fontSize: '12px',
  margin: 0,
}

export function saveButtonStyle(saving: boolean): CSSProperties {
  return {
    width: '100%',
    background: '#0F172A',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 700,
    fontFamily: 'inherit',
    opacity: saving ? 0.7 : 1,
  }
}

export const sectionLabelStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#475569',
  textTransform: 'uppercase',
  marginBottom: '10px',
}

export const emptyTextStyle: CSSProperties = {
  color: '#64748B',
  fontSize: '13px',
  textAlign: 'center',
  padding: '20px',
}

export const recordsListStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
}

export const recordCardStyle: CSSProperties = {
  border: '1px solid #E2E8F0',
  borderRadius: '10px',
  padding: '12px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
}

export const recordNameStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: '13px',
  color: '#0F172A',
}

export const recordMetaStyle: CSSProperties = {
  fontSize: '11px',
  color: '#94A3B8',
}

export const recordMetaNoteStyle: CSSProperties = {
  fontSize: '11px',
  color: '#94A3B8',
  marginTop: '2px',
}

export const recordAmountWrapStyle: CSSProperties = {
  textAlign: 'right',
}

export const recordAmountStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: '13px',
  color: '#0F172A',
}

export function statusBadgeStyle(bg: string, color: string): CSSProperties {
  return {
    fontSize: '9px',
    padding: '2px 8px',
    borderRadius: '999px',
    fontWeight: 700,
    textTransform: 'capitalize',
    background: bg,
    color: color,
  }
}
