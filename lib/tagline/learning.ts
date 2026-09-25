/**
 * Structured feedback logging so real usage can eventually become a
 * training dataset (Phase 2+ of the roadmap below). This is
 * intentionally NOT called from generateTagline() itself — generation
 * stays pure, synchronous, and DB-free. The API route calls this
 * separately, and a missing table (or no Supabase client) never
 * breaks tagline generation — it just no-ops quietly.
 *
 * This is NOT machine learning. It only records structured events for
 * a future training step. Do not call it a "trained AI model."
 */

export type TaglineFeedbackAction =
  | "generated"
  | "accepted"
  | "rejected"
  | "regenerated"
  | "edited"
  | "selected"
  | "deleted";

export interface TaglineFeedbackEvent {
  businessId: string;
  category: string;
  products: string[];
  positioning: string[];
  tagline: string;
  action: TaglineFeedbackAction;
  editedTo?: string;
}

// Minimal shape so this file doesn't need to import the Supabase SDK —
// any client with `.from(table).insert(row)` works (service-role or
// user-scoped).
interface SupabaseLike {
  from(table: string): {
    insert(row: Record<string, unknown>): Promise<unknown>;
  };
}

export async function logTaglineFeedback(supabase: SupabaseLike, event: TaglineFeedbackEvent): Promise<void> {
  try {
    await supabase.from("tagline_feedback").insert({
      business_id: event.businessId,
      category: event.category,
      products: event.products || [],
      positioning: event.positioning || [],
      tagline: event.tagline,
      action: event.action,
      edited_to: event.editedTo ?? null,
    });
  } catch {
    // Optional table. Must never throw — feedback logging can't be
    // allowed to break the tagline feature or the API route around it.
  }
}
