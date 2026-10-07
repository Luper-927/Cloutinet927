// Dark styles for the dashboard home, matching the Cloutinet homepage:
// navy #0A0E27, translucent white panels, blue-600 buttons, emerald accents.

export const homeCss = `
.dh-wrap{max-width:1040px;margin:0 auto;color:#E2E8F0}
.dh-wrap *{box-sizing:border-box}
.dh-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:20px}
.dh-h1{font-size:28px;font-weight:800;letter-spacing:-0.02em;margin:0;line-height:1.15;color:#fff}
.dh-sub{color:#94A3B8;font-size:13px;margin-top:4px}
.dh-muted{color:#94A3B8;font-size:12px}
.dh-btn{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:8px 16px;border-radius:8px;background:#2563EB;color:#fff;font-size:13px;font-weight:600;text-decoration:none;border:none;cursor:pointer;font-family:inherit}
.dh-btn:hover{background:#3B82F6}
.dh-btn-ghost{display:inline-flex;align-items:center;justify-content:center;min-height:36px;padding:6px 14px;border-radius:8px;background:transparent;color:#fff;font-size:13px;font-weight:600;text-decoration:none;border:1px solid rgba(255,255,255,.2);cursor:pointer;font-family:inherit}
.dh-btn-ghost:hover{border-color:rgba(255,255,255,.4);background:rgba(255,255,255,.05)}
.dh-btn:focus-visible,.dh-btn-ghost:focus-visible,.dh-action:focus-visible,.dh-metric:focus-visible,.dh-text-link:focus-visible,.dh-brief-link:focus-visible,.dh-tag:focus-visible,.dh-more:focus-visible{outline:2px solid #60A5FA;outline-offset:2px}

.dh-brief{background:linear-gradient(135deg,rgba(37,99,235,.20),rgba(10,14,39,0) 65%),rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:22px 22px 8px;margin-bottom:16px}
.dh-brief h2{color:#fff;font-size:19px;font-weight:700;letter-spacing:-0.01em;margin:0 0 2px;line-height:1.3}
.dh-brief-note{color:#94A3B8;font-size:12px;margin:0 0 14px}
.dh-brief-item{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;padding:13px 0;border-top:1px solid rgba(255,255,255,.09);font-size:14px;line-height:1.5;color:#E2E8F0}
.dh-brief-link{color:#34D399;font-weight:700;font-size:13px;white-space:nowrap;text-decoration:none;min-height:24px}
.dh-brief-link:hover{color:#6EE7B7}
.dh-brief-dismiss{background:transparent;border:none;color:#94A3B8;cursor:pointer;font-size:12px;font-family:inherit;padding:2px 4px;flex-shrink:0}
.dh-brief-dismiss:hover{color:#fff}
.dh-brief-empty{padding:13px 0 18px;color:#CBD5E1;font-size:14px;line-height:1.55;border-top:1px solid rgba(255,255,255,.09)}

.dh-strip{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:rgba(255,255,255,.10);border:1px solid rgba(255,255,255,.10);border-radius:16px;overflow:hidden;margin-bottom:24px}
.dh-metric{display:block;background:#0D1230;padding:16px 18px;text-decoration:none;color:inherit}
.dh-metric:hover{background:#121842}
.dh-metric:last-child:nth-child(odd){grid-column:1/-1}
.dh-m-label{font-size:12px;color:#94A3B8}
.dh-m-value{font-size:24px;font-weight:800;margin-top:4px;font-variant-numeric:tabular-nums;letter-spacing:-0.02em;color:#fff}
.dh-m-sub{font-size:12px;color:#94A3B8;margin-top:2px}
.dh-up{color:#34D399}
.dh-down{color:#F87171}

.dh-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:24px}
.dh-sec{scroll-margin-top:76px;min-width:0}
.dh-sec-head{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:10px}
.dh-sec-head h3{margin:0;font-size:15px;font-weight:700;color:#fff}
.dh-panel{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:16px}
.dh-pad{padding:18px}
.dh-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid rgba(255,255,255,.07);font-size:14px;line-height:1.45;color:#E2E8F0}
.dh-row:last-child{border-bottom:none}
.dh-row strong{color:#fff}
.dh-row-main{display:flex;align-items:flex-start;gap:10px;min-width:0}
.dh-dot{width:8px;height:8px;border-radius:50%;background:#FBBF24;margin-top:6px;flex-shrink:0}
.dh-text-link{color:#34D399;font-size:13px;font-weight:700;text-decoration:none;white-space:nowrap}
.dh-text-link:hover{color:#6EE7B7;text-decoration:underline}
.dh-empty{padding:20px 16px;color:#94A3B8;font-size:13px;line-height:1.5}

.dh-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.dh-action{display:flex;align-items:center;min-height:48px;padding:10px 14px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.04);border-radius:12px;font-size:13px;font-weight:600;color:#fff;text-decoration:none}
.dh-action:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.2)}

.dh-time{color:#64748B;font-size:12px;white-space:nowrap}

.dh-score-row{display:flex;align-items:baseline;gap:12px;margin-bottom:10px}
.dh-score{font-size:36px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-0.02em}
.dh-score small{font-size:16px;color:#94A3B8;font-weight:600}
.dh-track{background:rgba(255,255,255,.10);border-radius:10px;height:8px;overflow:hidden;margin-bottom:16px}
.dh-fill{height:100%;border-radius:10px}
.dh-vis-line{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:13px;color:#CBD5E1;padding-top:14px;border-top:1px solid rgba(255,255,255,.08);margin-top:14px;line-height:1.5}
.dh-status{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;margin-bottom:4px}
.dh-status span{color:#E2E8F0 !important}
.dh-status i{width:8px;height:8px;border-radius:50%;display:inline-block}

.dh-banner{background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.30);border-radius:10px;padding:10px 14px;margin-bottom:10px;font-size:12px;color:#93C5FD;font-weight:600}
.dh-prod{display:flex;gap:12px;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.07)}
.dh-prod:last-child{border-bottom:none}
.dh-prod img{width:56px;height:56px;border-radius:10px;object-fit:cover;flex-shrink:0}
.dh-prod-main{flex:1;min-width:0}
.dh-prod-name{font-size:14px;font-weight:600;color:#fff}
.dh-prod-price{font-size:12px;color:#94A3B8;margin-top:1px}
.dh-prod-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.dh-tag{display:inline-flex;align-items:center;min-height:32px;padding:4px 12px;border-radius:8px;font-size:12px;background:transparent;color:#E2E8F0;border:1px solid rgba(255,255,255,.15);text-decoration:none;cursor:pointer;font-family:inherit}
.dh-tag:hover{background:rgba(255,255,255,.07)}
.dh-tag-live{background:rgba(52,211,153,.12);color:#34D399;border-color:rgba(52,211,153,.30);cursor:default}
.dh-tag-live:hover{background:rgba(52,211,153,.12)}
.dh-tag-hidden{background:rgba(255,255,255,.04);color:#94A3B8;cursor:default}
.dh-tag-hidden:hover{background:rgba(255,255,255,.04)}
.dh-tag-danger{color:#F87171;border-color:rgba(248,113,113,.40)}
.dh-tag-danger:hover{background:rgba(248,113,113,.10)}
.dh-more{display:block;width:100%;padding:13px;border:none;background:transparent;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;border-top:1px solid rgba(255,255,255,.07)}
.dh-more:hover{background:rgba(255,255,255,.05)}

.dh-welcome{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.10);border-radius:16px;padding:32px 20px;text-align:center}
.dh-welcome h2{margin:0 0 6px;font-size:20px;color:#fff}
.dh-welcome p{margin:0 0 18px;color:#94A3B8;font-size:14px}
.dh-loading{padding:40px 0;text-align:center;color:#94A3B8;font-size:14px}

@media (min-width:720px){
  .dh-strip{grid-template-columns:repeat(var(--n,4),1fr)}
  .dh-metric:last-child:nth-child(odd){grid-column:auto}
  .dh-actions{grid-template-columns:repeat(3,1fr)}
}
@media (min-width:1180px){
  .dh-grid{grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);grid-template-areas:"att qa" "act vis" "prod prod";align-items:start}
  .dh-att{grid-area:att}
  .dh-qa{grid-area:qa}
  .dh-act{grid-area:act}
  .dh-vis{grid-area:vis}
  .dh-prod-sec{grid-area:prod}
  .dh-actions{grid-template-columns:1fr 1fr}
}
`
