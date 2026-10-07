// Shared dark styles for dashboard pages, matching the Cloutinet homepage:
// navy background, translucent white panels, blue-600 buttons, emerald accents.

export const uiCss = `
.ui-wrap{max-width:560px;margin:0 auto;color:#E2E8F0}
.ui-wrap *{box-sizing:border-box}
.ui-title{font-size:28px;font-weight:800;letter-spacing:-0.02em;color:#fff;margin:0 0 14px;line-height:1.15}
.ui-sub{color:#94A3B8;font-size:14px;margin:0 0 16px;line-height:1.5}
.ui-back{display:inline-block;color:#94A3B8;font-size:13px;text-decoration:none;padding:6px 0;margin-bottom:10px}
.ui-back:hover{color:#fff}

.ui-card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:16px}
.ui-card-flag{border-color:rgba(251,191,36,.45);background:rgba(251,191,36,.07)}
.ui-stack{display:flex;flex-direction:column;gap:10px;margin-bottom:16px}
.ui-list{display:flex;flex-direction:column;gap:10px}
.ui-between{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
.ui-name{font-weight:700;font-size:15px;color:#fff}
.ui-meta{font-size:12px;color:#94A3B8;margin-top:2px}
.ui-line{font-size:13px;color:#CBD5E1;margin-top:3px;overflow-wrap:anywhere}
.ui-note{font-size:13px;color:#CBD5E1;margin-top:8px;line-height:1.45}
.ui-section-label{font-size:13px;font-weight:700;color:#94A3B8;margin:20px 0 10px}

.ui-label{display:block;color:#CBD5E1;font-size:13px;font-weight:600;margin-bottom:6px}
.ui-input{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:12px 14px;color:#fff;font-size:14px;margin-bottom:16px;outline:none;font-family:inherit;min-height:44px}
.ui-input::placeholder{color:#64748B}
.ui-input:focus{border-color:#60A5FA;box-shadow:0 0 0 3px rgba(96,165,250,.2)}
select.ui-input option{background:#0F1433;color:#fff}
textarea.ui-input{min-height:96px;resize:vertical}
.ui-input.tight{margin-bottom:10px}

.ui-btn{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:10px 18px;border-radius:8px;background:#2563EB;color:#fff;font-size:14px;font-weight:600;border:1px solid transparent;cursor:pointer;font-family:inherit;text-decoration:none}
.ui-btn:hover{background:#3B82F6}
.ui-btn:disabled{opacity:.6;cursor:default}
.ui-btn:focus-visible,.ui-pill:focus-visible,.ui-linkrow:focus-visible{outline:2px solid #60A5FA;outline-offset:2px}
.ui-block{display:flex;width:100%}
.ui-btn-ghost{background:transparent;border-color:rgba(255,255,255,.2);color:#fff}
.ui-btn-ghost:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.4)}
.ui-btn-danger{background:transparent;color:#F87171;border-color:rgba(248,113,113,.4)}
.ui-btn-danger:hover{background:rgba(248,113,113,.10)}
.ui-btn-sm{min-height:34px;padding:6px 12px;font-size:12px}
.ui-actions{display:flex;gap:8px}
.ui-actions>*{flex:1}

.ui-pills{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.ui-pill{padding:7px 12px;min-height:34px;border-radius:8px;font-size:12px;font-weight:600;border:1px solid rgba(255,255,255,.15);background:transparent;color:#CBD5E1;cursor:pointer;font-family:inherit;text-transform:capitalize}
.ui-pill:hover{background:rgba(255,255,255,.07)}
.ui-pill.is-on{background:#2563EB;border-color:#2563EB;color:#fff}

.ui-badge{display:inline-flex;align-items:center;font-size:11px;font-weight:700;padding:2px 10px;border-radius:999px;text-transform:capitalize;white-space:nowrap}
.ui-badge-good{background:rgba(52,211,153,.14);color:#34D399}
.ui-badge-warn{background:rgba(251,191,36,.14);color:#FBBF24}
.ui-badge-bad{background:rgba(248,113,113,.14);color:#F87171}
.ui-badge-mute{background:rgba(255,255,255,.08);color:#94A3B8}
.ui-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.ui-tag{font-size:11px;padding:3px 10px;border-radius:999px;background:rgba(59,130,246,.14);color:#93C5FD}

.ui-error{background:rgba(248,113,113,.10);border:1px solid rgba(248,113,113,.35);border-radius:10px;padding:12px;margin-bottom:12px}
.ui-error p{color:#FCA5A5;font-size:13px;margin:0}
.ui-banner{background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.30);border-radius:10px;padding:10px 14px;margin-bottom:14px;font-size:12px;color:#93C5FD;font-weight:600}
.ui-warn{background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.35);border-radius:12px;padding:14px;margin-bottom:16px}
.ui-warn-title{color:#FBBF24;font-weight:700;font-size:14px;margin-bottom:4px}
.ui-warn p{color:#CBD5E1;font-size:13px;margin:0;line-height:1.45}

.ui-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px}
.ui-stat{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:14px 16px}
.ui-stat-label{font-size:12px;color:#94A3B8}
.ui-stat-value{font-size:20px;font-weight:800;margin-top:4px;color:#fff;letter-spacing:-0.02em;overflow-wrap:anywhere}
.ui-stat-good .ui-stat-value{color:#34D399}
.ui-stat-warn .ui-stat-value{color:#FBBF24}

.ui-linkrow{display:flex;justify-content:space-between;align-items:center;gap:10px;min-height:52px;padding:12px 16px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);border-radius:12px;color:#fff;text-decoration:none;font-size:14px;font-weight:600}
.ui-linkrow:hover{background:rgba(255,255,255,.09)}
.ui-linkrow span.go{color:#34D399;font-size:13px;font-weight:700}

.ui-contacted{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,.08)}
.ui-contacted span{font-size:12px;color:#94A3B8}

.ui-upgrade{text-align:center;padding:40px 12px}
.ui-upgrade h2{color:#fff;font-size:20px;font-weight:800;margin:0 0 8px;letter-spacing:-0.01em}
.ui-upgrade p{color:#94A3B8;font-size:14px;line-height:1.5;margin:0 0 22px}
.ui-empty{text-align:center;color:#94A3B8;font-size:14px;padding:32px 16px;line-height:1.5}
`
