<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cloutinet — Create. Share. Grow.</title>
<meta name="description" content="Cloutinet creates a Google-searchable page for your business so customers can find and contact you on WhatsApp.">
<style>

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #0f172a;
    background: #ffffff;
  }

  a { text-decoration: none; color: inherit; }
  ul { list-style: none; }

  .wrap { max-width: 720px; margin: 0 auto; padding: 0 24px; }

  /* Buttons */
  .btn-green {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #4ade4a;
    color: #0f2a0f;
    font-weight: 700;
    font-size: 15px;
    padding: 14px 32px;
    border-radius: 999px;
    box-shadow: 0 10px 20px rgba(20,80,20,0.25);
  }
  .btn-dark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #0f172a;
    color: #ffffff;
    font-weight: 700;
    font-size: 15px;
    padding: 14px 24px;
    border-radius: 999px;
  }

  /* ---------------- HERO ---------------- */
  .hero {
    background: radial-gradient(60% 50% at 50% 85%, rgba(168,85,247,0.55) 0%, rgba(30,17,70,0) 70%),
                linear-gradient(180deg, #2a1863 0%, #1e1146 60%);
    padding: 80px 24px 60px;
    text-align: center;
    color: #ffffff;
  }

  .logo-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin-bottom: 24px;
  }
  .logo-mark {
    width: 36px;
    height: 36px;
    background: #ffffff;
    color: #5b21b6;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 18px;
  }
  .logo-text { font-size: 20px; font-weight: 700; }

  .hero h1 {
    font-size: 44px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: -0.5px;
  }
  .hero h1 .accent { color: #5ce65c; }

  .hero p.sub {
    margin-top: 18px;
    color: #ddd6fe;
    font-size: 17px;
  }

  .hero .btn-green { margin-top: 30px; }

  .steps {
    margin-top: 56px;
    padding-top: 32px;
    border-top: 1px solid rgba(255,255,255,0.12);
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    max-width: 480px;
    margin-left: auto;
    margin-right: auto;
  }
  .step { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .step .icon-box {
    width: 40px; height: 40px;
    border: 1px solid rgba(255,255,255,0.2);
    background: rgba(255,255,255,0.05);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
  }
  .step span.label { font-size: 12px; font-weight: 500; color: #e9d5ff; }

  /* ---------------- FEATURES LIST ---------------- */
  .features {
    padding: 80px 24px;
    text-align: center;
  }
  .features h2 {
    font-size: 32px;
    font-weight: 800;
    line-height: 1.2;
  }
  .features h2 .accent { color: #7c3aed; }

  .feature-list {
    margin-top: 40px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    text-align: left;
  }
  .feature-row {
    display: flex;
    align-items: center;
    gap: 16px;
    background: #f8fafc;
    border: 1px solid #f1f5f9;
    border-radius: 16px;
    padding: 14px 16px;
  }
  .feature-row .icon-box {
    width: 40px; height: 40px;
    flex-shrink: 0;
    background: #7c3aed;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    color: #ffffff;
  }
  .feature-row span.label { font-weight: 600; color: #1e293b; }

  /* ---------------- HOW IT WORKS ---------------- */
  .how-it-works {
    background: #f8fafc;
    padding: 80px 24px;
    text-align: center;
  }
  .how-it-works h2 {
    font-size: 32px;
    font-weight: 800;
    line-height: 1.2;
  }
  .how-it-works h2 .accent { color: #16a34a; }

  .flow {
    margin-top: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  .flow-step { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .flow-circle {
    width: 64px; height: 64px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 6px 16px rgba(0,0,0,0.08);
    display: flex; align-items: center; justify-content: center;
  }
  .flow-circle.purple {
    border-radius: 20px;
    background: #7c3aed;
    box-shadow: 0 6px 16px rgba(124,58,237,0.35);
  }
  .flow-step span.label { font-size: 13px; font-weight: 500; color: #475569; }
  .flow-arrow { font-size: 22px; color: #cbd5e1; }

  .banner {
    margin-top: 56px;
    background: linear-gradient(115deg, #7c3aed 0%, #8b5cf6 45%, #7c3aed 100%);
    border-radius: 32px;
    padding: 40px 32px;
    color: #ffffff;
  }
  .banner p {
    font-size: 22px;
    font-weight: 800;
    line-height: 1.35;
  }

  /* ---------------- PRICING ---------------- */
  .pricing {
    padding: 80px 24px;
    text-align: center;
  }
  .pricing .eyebrow {
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #7c3aed;
  }
  .pricing h2 {
    margin-top: 8px;
    font-size: 32px;
    font-weight: 800;
  }

  .plans {
    margin-top: 48px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .plan-card {
    text-align: left;
    border-radius: 24px;
    padding: 32px;
    background: #ffffff;
    border: 1px solid #f1f5f9;
  }
  .plan-card.highlight {
    background: #1e1146;
    color: #ffffff;
    border-color: transparent;
  }
  .plan-card h3 { font-size: 18px; font-weight: 700; }
  .plan-price {
    margin-top: 12px;
    display: flex;
    align-items: baseline;
    gap: 4px;
  }
  .plan-price .amount { font-size: 30px; font-weight: 800; }
  .plan-price .cadence { color: #94a3b8; }
  .plan-card.highlight .plan-price .cadence { color: #ddd6fe; }
  .plan-blurb { margin-top: 8px; font-size: 14px; color: #64748b; }
  .plan-card.highlight .plan-blurb { color: #ddd6fe; }

  .plan-features { margin-top: 24px; display: flex; flex-direction: column; gap: 10px; font-size: 14px; }
  .plan-features li { display: flex; align-items: flex-start; gap: 8px; }
  .plan-features .check { color: #16a34a; }
  .plan-card.highlight .plan-features .check { color: #5ce65c; }

  .plan-card .btn-green,
  .plan-card .btn-dark { margin-top: 28px; width: 100%; }

  /* ---------------- FINAL CTA ---------------- */
  .final-cta {
    background: #1e1146;
    padding: 80px 24px;
    text-align: center;
    color: #ffffff;
  }
  .final-cta h2 { font-size: 32px; font-weight: 800; }
  .final-cta p { margin-top: 12px; color: #ddd6fe; }
  .final-cta .btn-green { margin-top: 28px; }

  /* ---------------- FOOTER ---------------- */
  footer {
    padding: 56px 24px;
    font-size: 14px;
    color: #64748b;
  }
  .footer-top {
    display: flex;
    flex-direction: column;
    gap: 40px;
  }
  .footer-brand-row { display: flex; align-items: center; gap: 8px; }
  .footer-logo-mark {
    width: 28px; height: 28px;
    background: #7c3aed;
    color: #ffffff;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-size: 14px;
  }
  .footer-brand-row span.name { font-weight: 700; color: #0f172a; }
  footer p.tagline { margin-top: 12px; max-width: 280px; }
  footer p.flag { margin-top: 16px; }

  .footer-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
  .footer-cols .col p.head { font-weight: 600; color: #0f172a; }
  .footer-cols .col ul { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }

  footer .copyright {
    margin-top: 48px;
    border-top: 1px solid #f1f5f9;
    padding-top: 24px;
    font-size: 12px;
    color: #94a3b8;
  }

  /* ---------------- RESPONSIVE ---------------- */
  @media (min-width: 640px) {
    .hero h1 { font-size: 60px; }
    .plans { flex-direction: row; }
    .plan-card { flex: 1; }
    .footer-top { flex-direction: row; justify-content: space-between; }
    .footer-cols { grid-template-columns: 1fr 1fr 1fr; }
  }

</style>
</head>
<body>

  <!-- ================= HERO ================= -->
  <section class="hero">
    <div class="wrap">
      <div class="logo-row">
        <span class="logo-mark">C</span>
        <span class="logo-text">Cloutinet</span>
      </div>

      <h1>Create.<br>Share.<br><span class="accent">Grow.</span></h1>
      <p class="sub">Your business deserves to be found.</p>

      <a href="/signup" class="btn-green">cloutinet.online</a>

      <div class="steps">
        <div class="step">
          <span class="icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.75"><path d="M3 9l9-7 9 7v11a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>
          </span>
          <span class="label">Create Your Page</span>
        </div>
        <div class="step">
          <span class="icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.75"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <span class="label">Get Found</span>
        </div>
        <div class="step">
          <span class="icon-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.75"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </span>
          <span class="label">Grow Your Business</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= FEATURE LIST ================= -->
  <section class="features" id="features">
    <div class="wrap">
      <h2>Add <span class="accent">everything</span><br>your customers need to know.</h2>

      <div class="feature-list">
        <div class="feature-row">
          <span class="icon-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.75"><path d="M3 9l9-7 9 7v11a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg></span>
          <span class="label">Business Details</span>
        </div>
        <div class="feature-row">
          <span class="icon-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.75"><path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5"/><line x1="12" y1="13" x2="12" y2="21"/></svg></span>
          <span class="label">Products &amp; Services</span>
        </div>
        <div class="feature-row">
          <span class="icon-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.75"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></span>
          <span class="label">Photos &amp; Videos</span>
        </div>
        <div class="feature-row">
          <span class="icon-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.75"><path d="M20.59 13.41L11 3.83A2 2 0 0 0 9.59 3H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.59a2 2 0 0 0 2.83 0l5.59-5.59a2 2 0 0 0 0-2.83z"/><circle cx="7.5" cy="7.5" r="1"/></svg></span>
          <span class="label">Prices</span>
        </div>
        <div class="feature-row">
          <span class="icon-box"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.75"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>
          <span class="label">Location</span>
        </div>
        <div class="feature-row">
          <span class="icon-box">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="white"><path d="M16 3C9 3 3.3 8.7 3.3 15.7c0 2.6.7 5 2 7.1L3 29l6.4-2.2c2 1.1 4.3 1.7 6.6 1.7 7 0 12.7-5.7 12.7-12.7C28.7 8.7 23 3 16 3zm0 23.1c-2.1 0-4.1-.6-5.8-1.6l-.4-.2-3.8 1.3 1.3-3.7-.3-.4a10.3 10.3 0 0 1-1.7-5.8c0-5.8 4.7-10.4 10.5-10.4S26.5 9.9 26.5 15.7 21.8 26.1 16 26.1z"/></svg>
          </span>
          <span class="label">WhatsApp Contact</span>
        </div>
      </div>
    </div>
  </section>

  <!-- ================= HOW IT WORKS ================= -->
  <section class="how-it-works" id="how-it-works">
    <div class="wrap">
      <h2>Customers find you.<br>They reach you.<br><span class="accent">You grow.</span></h2>

      <div class="flow">
        <div class="flow-step">
          <span class="flow-circle">
            <svg width="30" height="30" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20.5H24v7h11.3C33.7 31.9 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5-5C33.6 5.9 29.1 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l5.8 4.3C13.7 15.5 18.5 12 24 12c3.1 0 5.9 1.2 8 3.1l5-5C33.6 5.9 29.1 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"/>
              <path fill="#4CAF50" d="M24 44c5.1 0 9.6-1.7 12.8-4.6l-5.9-5c-1.7 1.2-4 2-6.9 2-5.3 0-9.7-3.1-11.3-7.6l-5.9 4.5C9.5 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20.5H24v7h11.3c-.8 2.3-2.3 4.2-4.3 5.5l5.9 5C40.7 34.7 44 29.8 44 24c0-1.2-.1-2.4-.4-3.5z"/>
            </svg>
          </span>
          <span class="label">They Search</span>
        </div>

        <span class="flow-arrow">&rarr;</span>

        <div class="flow-step">
          <span class="flow-circle purple">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.75"><path d="M3 9l9-7 9 7v11a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>
          </span>
          <span class="label">They Find You</span>
        </div>

        <span class="flow-arrow">&rarr;</span>

        <div class="flow-step">
          <span class="flow-circle">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="#25D366"><path d="M16 3C9 3 3.3 8.7 3.3 15.7c0 2.6.7 5 2 7.1L3 29l6.4-2.2c2 1.1 4.3 1.7 6.6 1.7 7 0 12.7-5.7 12.7-12.7C28.7 8.7 23 3 16 3zm0 23.1c-2.1 0-4.1-.6-5.8-1.6l-.4-.2-3.8 1.3 1.3-3.7-.3-.4a10.3 10.3 0 0 1-1.7-5.8c0-5.8 4.7-10.4 10.5-10.4S26.5 9.9 26.5 15.7 21.8 26.1 16 26.1z"/></svg>
          </span>
          <span class="label">They Contact You</span>
        </div>
      </div>

      <div class="banner">
        <p>More Visibility.<br>More Customers. More Sales.</p>
      </div>
    </div>
  </section>

  <!-- ================= PRICING ================= -->
  <section class="pricing" id="pricing">
    <div class="wrap">
      <p class="eyebrow">Simple pricing</p>
      <h2>Plans for every stage of your business</h2>

      <div class="plans">

        <div class="plan-card">
          <h3>Free</h3>
          <div class="plan-price"><span class="amount">₦0</span><span class="cadence">forever</span></div>
          <p class="plan-blurb">For businesses just getting started online.</p>
          <ul class="plan-features">
            <li><span class="check">✓</span><span>1 Google-searchable page</span></li>
            <li><span class="check">✓</span><span>Up to 5 products or services</span></li>
            <li><span class="check">✓</span><span>WhatsApp contact button</span></li>
            <li><span class="check">✓</span><span>Basic visibility score</span></li>
          </ul>
          <a href="/signup?plan=free" class="btn-dark">Start Free</a>
        </div>

        <div class="plan-card highlight">
          <h3>Growth</h3>
          <div class="plan-price"><span class="amount">₦5,000</span><span class="cadence">/month</span></div>
          <p class="plan-blurb">For businesses ready to rank and grow.</p>
          <ul class="plan-features">
            <li><span class="check">✓</span><span>Everything in Free</span></li>
            <li><span class="check">✓</span><span>Unlimited products or services</span></li>
            <li><span class="check">✓</span><span>Full visibility score + tips</span></li>
            <li><span class="check">✓</span><span>Review management tools</span></li>
            <li><span class="check">✓</span><span>Priority support</span></li>
          </ul>
          <a href="/signup?plan=growth" class="btn-green">Start Growth Plan</a>
        </div>

        <div class="plan-card">
          <h3>Business</h3>
          <div class="plan-price"><span class="amount">₦15,000</span><span class="cadence">/month</span></div>
          <p class="plan-blurb">For teams managing multiple locations.</p>
          <ul class="plan-features">
            <li><span class="check">✓</span><span>Everything in Growth</span></li>
            <li><span class="check">✓</span><span>Up to 5 business locations</span></li>
            <li><span class="check">✓</span><span>Analytics dashboard</span></li>
            <li><span class="check">✓</span><span>Dedicated account manager</span></li>
          </ul>
          <a href="/contact?topic=business-plan" class="btn-dark">Talk to Sales</a>
        </div>

      </div>
    </div>
  </section>

  <!-- ================= FINAL CTA ================= -->
  <section class="final-cta">
    <div class="wrap">
      <h2>Ready to Get More Customers?</h2>
      <p>Join Nigerian businesses already growing with Cloutinet.</p>
      <a href="/signup" class="btn-green">Create Your Free Page</a>
    </div>
  </section>

  <!-- ================= FOOTER ================= -->
  <footer>
    <div class="wrap">
      <div class="footer-top">
        <div>
          <div class="footer-brand-row">
            <span class="footer-logo-mark">C</span>
            <span class="name">Cloutinet</span>
          </div>
          <p class="tagline">Helping Nigerian businesses get found and win more customers.</p>
          <p class="flag">Made for Nigerian businesses 🇳🇬</p>
        </div>

        <div class="footer-cols">
          <div class="col">
            <p class="head">Product</p>
            <ul>
              <li><a href="#how-it-works">How it Works</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><a href="/check-score">Check Score</a></li>
            </ul>
          </div>
          <div class="col">
            <p class="head">Company</p>
            <ul>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div class="col">
            <p class="head">Legal</p>
            <ul>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </div>

      <p class="copyright">© 2026 Cloutinet. All rights reserved.</p>
    </div>
  </footer>

</body>
</html>
