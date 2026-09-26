import type { CSSProperties } from 'react'

export const loadingWrapStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
}

export const loadingTextStyle: CSSProperties = {
  color: '#64748B',
  fontSize: '14px',
  fontFamily: 'Segoe UI, system-ui, sans-serif',
  textAlign: 'center',
}

export const pageStyle: CSSProperties = {
  minHeight: '100vh',
  background: '#fff',
  fontFamily: 'Segoe UI, system-ui, sans-serif',
}

export const headerStyle: CSSProperties = {
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

export const contentStyle: CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '24px 16px',
}

export const labelStyle: CSSProperties = {
  display: 'block',
  color: '#475569',
  fontSize: '12px',
  fontWeight: 700,
  marginBottom: '6px',
  textTransform: 'uppercase',
}

export const inputStyle: CSSProperties = {
  width: '100%',
  background: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  padding: '12px 14px',
  color: '#0F172A',
  fontSize: '14px',
  marginBottom: '16px',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
}

export const notesInputStyle: CSSProperties = {
  ...inputStyle,
  minHeight: '80px',
  resize: 'vertical',
}

export const errorBoxStyle: CSSProperties = {
  background: '#FEF2F2',
  border: '1px solid #FECACA',
  borderRadius: '8px',
  padding: '12px',
  marginBottom: '12px',
}

export const errorTextStyle: CSSProperties = {
  color: '#dc2626',
  fontSize: '12px',
  margin: 0,
}

export const upgradeWrapStyle: CSSProperties = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '48px 20px',
  textAlign: 'center',
}

export const upgradeEmojiStyle: CSSProperties = {
  fontSize: '36px',
  marginBottom: '12px',
}

export const upgradeTitleStyle: CSSProperties = {
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

export function saveButtonStyle(saving: boolean): CSSProperties {
  return {
    width: '100%',
    background: '#0F172A',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 700,
    fontFamily: 'inherit',
    opacity: saving ? 0.7 : 1,
  }
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

export const addButtonStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'center',
  background: '#0F172A',
  color: '#fff',
  borderRadius: '8px',
  padding: '14px',
  fontSize: '15px',
  fontWeight: 700,
  textDecoration: 'none',
  marginBottom: '10px',
  boxSizing: 'border-box',
}

export const messageButtonStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'center',
  background: '#fff',
  color: '#0F172A',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  padding: '14px',
  fontSize: '15px',
  fontWeight: 700,
  textDecoration: 'none',
  marginBottom: '20px',
  boxSizing: 'border-box',
}

export const followUpBoxStyle: CSSProperties = {
  background: '#FFF7ED',
  border: '1px solid #FED7AA',
  borderRadius: '12px',
  padding: '14px',
  marginBottom: '20px',
}

export const followUpTitleStyle: CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#9A3412',
  textTransform: 'uppercase',
  marginBottom: '4px',
}

export const followUpTextStyle: CSSProperties = {
  fontSize: '12px',
  color: '#9A3412',
  margin: 0,
}

export const emptyWrapStyle: CSSProperties = {
  textAlign: 'center',
  padding: '40px 20px',
}

export const emptyEmojiStyle: CSSProperties = {
  fontSize: '36px',
  marginBottom: '12px',
}

export const emptyTextStyle: CSSProperties = {
  color: '#64748B',
  fontSize: '14px',
}

export const listWrapStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
}

export const normalCardStyle: CSSProperties = {
  border: '1px solid #E2E8F0',
  background: '#fff',
  borderRadius: '12px',
  padding: '14px',
}

export const flaggedCardStyle: CSSProperties = {
  border: '1px solid #FED7AA',
  background: '#FFFBF5',
  borderRadius: '12px',
  padding: '14px',
}

export const nameStyle: CSSProperties = {
  fontWeight: 700,
  fontSize: '14px',
  color: '#0F172A',
  marginBottom: '4px',
}

export const detailStyle: CSSProperties = {
  fontSize: '12px',
  color: '#64748B',
  marginBottom: '2px',
}

export const notesStyle: CSSProperties = {
  fontSize: '12px',
  color: '#94A3B8',
  marginTop: '6px',
  fontStyle: 'italic',
}

export const tagsWrapStyle: CSSProperties = {
  display: 'flex',
  gap: '6px',
  flexWrap: 'wrap',
  marginTop: '8px',
}

export const tagStyle: CSSProperties = {
  fontSize: '10px',
  padding: '2px 8px',
  borderRadius: '999px',
  background: '#F0F9FF',
  color: '#0369A1',
  border: '1px solid #BAE6FD',
}

export const contactedRowStyle: CSSProperties = {
  marginTop: '10px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}

export const contactedLabelStyle: CSSProperties = {
  fontSize: '11px',
  color: '#94A3B8',
}

export const contactedButtonStyle: CSSProperties = {
  fontSize: '10px',
  padding: '3px 10px',
  borderRadius: '6px',
  background: '#fff',
  color: '#0F172A',
  border: '1px solid #E2E8F0',
  cursor: 'pointer',
  fontFamily: 'inherit',
}
