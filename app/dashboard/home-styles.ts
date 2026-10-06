export const homeCss = `
.dh-wrap{max-width:1040px;margin:0 auto}
.dh-wrap *{box-sizing:border-box}
.dh-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;margin-bottom:18px}
.dh-h1{font-size:22px;font-weight:800;letter-spacing:-0.01em;margin:0;line-height:1.2}
.dh-sub{color:#64748B;font-size:13px;margin-top:3px}
.dh-muted{color:#64748B;font-size:12px}
.dh-btn{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:8px 16px;border-radius:8px;background:#0F172A;color:#fff;font-size:13px;font-weight:700;text-decoration:none;border:none;cursor:pointer;font-family:inherit}
.dh-btn-ghost{display:inline-flex;align-items:center;justify-content:center;min-height:36px;padding:6px 12px;border-radius:8px;background:#fff;color:#0F172A;font-size:13px;font-weight:600;text-decoration:none;border:1px solid #E2E8F0;cursor:pointer;font-family:inherit}
.dh-btn:focus-visible,.dh-btn-ghost:focus-visible,.dh-action:focus-visible,.dh-metric:focus-visible,.dh-text-link:focus-visible,.dh-brief-link:focus-visible{outline:2px solid #FF6B35;outline-offset:2px}

.dh-brief{background:#0F172A;color:#E2E8F0;border-radius:14px;padding:20px 20px 6px;margin-bottom:16px}
.dh-brief h2{color:#fff;font-size:18px;font-weight:700;margin:0 0 2px;line-height:1.3}
.dh-brief-note{color:#94A3B8;font-size:12px;margin:0 0 14px}
.dh-brief-item{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;padding:13px 0;border-top:1px solid rgba(255,255,255,.1);font-size:14px;line-height:1.5}
.dh-brief-link{color:#FDBA74;font-weight:700;font-size:13px;white-space:nowrap;text-decoration:none;min-height:24px}
.dh-brief-dismiss{background:transparent;border:none;color:#94A3B8;cursor:pointer;font-size:12px;font-family:inherit;padding:2px 4px;flex-shrink:0}
.dh-brief-empty{padding:4px 0 16px;color:#CBD5E1;font-size:14px;line-height:1.55;border-top:1px solid rgba(255,255,255,.1);padding-top:13px}

.dh-strip{display:grid;grid-template-columns:repeat(2,1fr);gap:1px;background:#E2E8F0;border:1px solid #E2E8F0;border-radius:12px;overflow:hidden;margin-bottom:22px}
.dh-metric{display:block;background:#fff;padding:14px 16px;text-decoration:none;color:inherit}
.dh-metric:hover{background:#F8FAFC}
.dh-metric:last-child:nth-child(odd){grid-column:1/-1}
.dh-m-label{font-size:12px;color:#64748B}
.dh-m-value{font-size:22px;font-weight:800;margin-top:4px;font-variant-numeric:tabular-nums;letter-spacing:-0.01em}
.dh-m-sub{font-size:12px;color:#64748B;margin-top:2px}
.dh-up{color:#15803D}
.dh-down{color:#B91C1C}

.dh-grid{display:grid;grid-template-columns:minmax(0,1fr);gap:22px}
.dh-sec{scroll-margin-top:76px;min-width:0}
.dh-sec-head{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:8px}
.dh-sec-head h3{margin:0;font-size:15px;font-weight:700}
.dh-panel{background:#fff;border:1px solid #E2E8F0;border-radius:12px}
.dh-pad{padding:16px}
.dh-row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px 14px;border-bottom:1px solid #EEF2F6;font-size:14px;line-height:1.45}
.dh-row:last-child{border-bottom:none}
.dh-row-main{display:flex;align-items:flex-start;gap:10px;min-width:0}
.dh-dot{width:8px;height:8px;border-radius:50%;background:#FF6B35;margin-top:6px;flex-shrink:0}
.dh-text-link{color:#0F172A;font-size:13px;font-weight:700;text-decoration:underline;white-space:nowrap}
.dh-empty{padding:18px 14px;color:#64748B;font-size:13px;line-height:1.5}

.dh-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.dh-action{display:flex;align-items:center;min-height:46px;padding:10px 12px;border:1px solid #E2E8F0;background:#fff;border-radius:10px;font-size:13px;font-weight:600;color:#0F172A;text-decoration:none}
.dh-action:hover{background:#F1F5F9}

.dh-time{color:#94A3B8;font-size:12px;white-space:nowrap}

.dh-score-row{display:flex;align-items:baseline;gap:12px;margin-bottom:10px}
.dh-score{font-size:32px;font-weight:800;font-variant-numeric:tabular-nums}
.dh-score small{font-size:16px;color:#94A3B8;font-weight:600}
.dh-track{background:#E2E8F0;border-radius:10px;height:8px;overflow:hidden;margin-bottom:14px}
.dh-fill{height:100%;border-radius:10px}
.dh-vis-line{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;font-size:13px;color:#475569;padding-top:12px;border-top:1px solid #EEF2F6;margin-top:12px;line-height:1.5}
.dh-status{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:700;margin-bottom:4px}
.dh-status i{width:8px;height:8px;border-radius:50%;display:inline-block}

.dh-banner{background:#F0F9FF;border:1px solid #BAE6FD;border-radius:8px;padding:10px 14px;margin-bottom:10px;font-size:12px;color:#0369A1;font-weight:600}
.dh-prod{display:flex;gap:12px;padding:12px 14px;border-bottom:1px solid #EEF2F6}
.dh-prod:last-child{border-bottom:none}
.dh-prod img{width:56px;height:56px;border-radius:8px;object-fit:cover;flex-shrink:0}
.dh-prod-main{flex:1;min-width:0}
.dh-prod-name{font-size:14px;font-weight:600}
.dh-prod-price{font-size:12px;color:#475569;margin-top:1px}
.dh-prod-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
.dh-tag{display:inline-flex;align-items:center;min-height:32px;padding:4px 10px;border-radius:6px;font-size:12px;background:#fff;color:#0F172A;border:1px solid #E2E8F0;text-decoration:none;cursor:pointer;font-family:inherit}
.dh-tag-live{background:#F0FDF4;color:#166534;border-color:#BBF7D0;cursor:default}
.dh-tag-hidden{background:#F8FAFC;color:#64748B;cursor:default}
.dh-tag-danger{background:transparent;color:#DC2626;border-color:#FCA5A5}
.dh-more{display:block;width:100%;padding:12px;border:none;background:transparent;color:#0F172A;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;border-top:1px solid #EEF2F6}

.dh-welcome{background:#fff;border:1px solid #E2E8F0;border-radius:12px;padding:28px 20px;text-align:center}
.dh-welcome h2{margin:0 0 6px;font-size:18px}
.dh-welcome p{margin:0 0 16px;color:#64748B;font-size:14px}
.dh-loading{padding:40px 0;text-align:center;color:#64748B;font-size:14px}

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
