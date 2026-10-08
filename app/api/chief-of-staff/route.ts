import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getActingContext } from "@/lib/permissions";
import { getBusinessTier, TIER_LIMITS } from "@/lib/tiers";

export async function POST(req: Request) {
  const ctx: any = await getActingContext();
  if (!ctx?.ownerId) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const tier: any = await getBusinessTier(ctx.ownerId);
  const limits: any = (TIER_LIMITS as any)[tier] ?? tier;
  if (!limits?.aiAutomation) {
    return NextResponse.json(
      { error: "Upgrade your plan to use the AI Chief of Staff." },
      { status: 403 }
    );
  }

  const { question } = await req.json();
  if (!question || typeof question !== "string" || question.length > 500) {
    return NextResponse.json({ error: "Invalid question" }, { status: 400 });
  }

  const db = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Scope every query to the owner, and to the location if the user is location-scoped
  const scoped = (table: string, cols: string, limit: number) => {
    let q = db.from(table).select(cols).eq("user_id", ctx.ownerId).limit(limit);
    if (ctx.locationId) q = q.eq("location_id", ctx.locationId);
    return q;
  };

  const [customers, products, payments, documents] = await Promise.all([
    scoped("customers", "*", 100),
    scoped("products", "name,price,is_published,created_at", 100),
    scoped("payment_records", "*", 100),
    scoped("documents", "title,category,created_at", 100),
  ]);

  const data = {
    today: new Date().toISOString().slice(0, 10),
    customers: customers.data ?? [],
    products: products.data ?? [],
    payments: payments.data ?? [],
    documents: documents.data ?? [],
  };

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 700,
      messages: [
        {
          role: "system",
          content:
            "You are the AI Chief of Staff for a business. Answer only from the JSON data provided. If the data does not contain the answer, say so plainly. Be concise and practical. Use Naira (₦) for money.",
        },
        {
          role: "user",
          content: `DATA:\n${JSON.stringify(data).slice(0, 24000)}\n\nQUESTION: ${question}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "AI request failed" }, { status: 502 });
  }
  const json = await res.json();
  return NextResponse.json({ answer: json.choices?.[0]?.message?.content ?? "" });
}
