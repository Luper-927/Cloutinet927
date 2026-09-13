'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Business = {
  id: string;
  business_name: string;
  country: string;
  email: string;
  created_at: string;
};

type Trade = {
  id: string;
  counterparty_email: string;
  description: string;
  amount: number;
  escrow_fee: number | null;
  currency: string;
  status: string;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
  buyer_confirmed: boolean;
  seller_confirmed: boolean;
  dispute_opened_at: string | null;
  dispute_opened_by: string | null;
  fee_responsibility: string | null;
  funded: boolean;
};

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [incomingCount, setIncomingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [fundingId, setFundingId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      setUserId(session.user.id);

      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single();
      if (!businessError && businessData) setBusiness(businessData);

      const { data: tradeData, error: tradeError } = await supabase
        .from('trades')
        .select('*')
        .eq('buyer_id', session.user.id)
        .order('created_at', { ascending: false });
      if (!tradeError && tradeData) setTrades(tradeData);

      const { count } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true })
        .eq('counterparty_id', session.user.id)
        .eq('status', 'pending');
      setIncomingCount(count || 0);
      setLoading(false);
    };
    loadData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleBuyerConfirm = async (tradeId: string) => {
    setUpdatingId(tradeId);
    const trade = trades.find((t) => t.id === tradeId);
    if (!trade) { setUpdatingId(null); return; }
    const bothWillBeConfirmed = trade.seller_confirmed === true;
    const updates: Record<string, string | boolean> = { buyer_confirmed: true };
    if (bothWillBeConfirmed) {
      updates.status = 'completed';
      updates.completed_at = new Date().toISOString();
    }
    const { error } = await supabase.from('trades').update(updates).eq('id', tradeId);
    if (!error) setTrades((prev) => prev.map((t) => (t.id === tradeId ? { ...t, ...updates } : t)));
    setUpdatingId(null);
  };

  const handleOpenDispute = async (tradeId: string) => {
    setUpdatingId(tradeId);
    const updates = {
      status: 'disputed',
      dispute_opened_at: new Date().toISOString(),
      dispute_opened_by: userId,
    };
    const { error } = await supabase.from('trades').update(updates).eq('id', tradeId);
    if (!error) setTrades((prev) => prev.map((t) => (t.id === tradeId ? { ...t, ...updates } : t)));
    setUpdatingId(null);
  };

  const handleResolveDispute = async (tradeId: string, outcome: 'completed' | 'declined') => {
    setUpdatingId(tradeId);
    const updates: Record<string, string> = { status: outcome };
    if (outcome === 'completed') updates.completed_at = new Date().toISOString();
    const { error } = await supabase.from('trades').update(updates).eq('id', tradeId);
    if (!error) setTrades((prev) => prev.map((t) => (t.id === tradeId ? { ...t, ...updates } : t)));
    setUpdatingId(null);
  };

  const handleBuyerCancel = async (tradeId: string) => {
    setUpdatingId(tradeId);
    const updates = {
      status: 'declined',
      cancelled_by: userId,
      fee_responsibility: 'buyer',
    };
    const { error } = await supabase.from('trades').update(updates).eq('id', tradeId);
    if (!error) setTrades((prev) => prev.map((t) => (t.id === tradeId ? { ...t, ...updates } : t)));
    setUpdatingId(null);
  };

  const handleFundEscrow = async (trade: Trade) => {
    setFundingId(trade.id);
    try {
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: business?.email,
          amount: trade.amount + (trade.escrow_fee || 0),
          tradeId: trade.id,
        }),
      });
      const data = await response.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        alert(data.error || 'Failed to start payment');
      }
    } catch (err) {
      alert('Something went wrong starting payment');
    } finally {
      setFundingId(null);
    }
  };

  const daysRemaining = (disputeOpenedAt: string) => {
    const opened = new Date(disputeOpenedAt).getTime();
    const elapsed = (Date.now() - opened) / (1000 * 60 * 60 * 24);
    return Math.ceil(Math.max(0, 14 - elapsed));
  };

  const activeTrades = trades.filter((t) => ['pending', 'accepted', 'disputed'].includes(t.status));
  const finishedTrades = trades.filter((t) => t.status === 'completed' || t.status === 'declined');
  const formatDate = (iso: string) => new Date(iso).toLocaleString();

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-body">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <p className="text-accent text-sm tracking-widest uppercase">Canesson</p>
          <button onClick={handleLogout} className="text-sm text-body hover:text-heading">Log out</button>
        </div>

        <h1 className="text-3xl font-bold text-heading mb-2">Welcome, {business?.business_name || 'there'}</h1>
        <p className="text-body mb-6">{business?.country}</p>

        <Link href="/trades/incoming" className="inline-block border border-border rounded-lg px-4 py-3 bg-surface mb-10 hover:border-accent">
          <span className="text-heading font-bold">Trades sent to you</span>
          {incomingCount > 0 && (
            <span className="ml-2 text-xs bg-accent text-white px-2 py-1 rounded-full">{incomingCount} pending</span>
          )}
        </Link>

        <div className="border border-border rounded-lg p-6 bg-surface mb-6">
          <h2 className="text-sm uppercase tracking-wide text-body mb-4">Account details</h2>
          <div className="flex flex-col gap-2 text-heading">
            <p><span className="text-body">Email:</span> {business?.email}</p>
            <p><span className="text-body">Joined:</span> {business?.created_at ? new Date(business.created_at).toLocaleDateString() : ''}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm uppercase tracking-wide text-body">Active trades</h2>
          <Link href="/trade/new" className="bg-accent hover:bg-accent-hover text-white font-bold py-2 px-4 rounded text-sm">
            + New trade
          </Link>
        </div>

        {activeTrades.length === 0 ? (
          <div className="border border-border rounded-lg p-6 bg-surface mb-10">
            <p className="text-body">No active trades. Start one above.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mb-10">
            {activeTrades.map((trade) => (
              <div key={trade.id} className="border border-border rounded-lg p-4 bg-surface">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-heading font-bold">{trade.amount.toLocaleString()} {trade.currency}</p>
                  <span className="text-xs uppercase text-accent bg-accent/10 px-2 py-1 rounded">{trade.status}</span>
                </div>
                <p className="text-body text-sm mb-1">{trade.description}</p>
                <p className="text-body text-xs">With: {trade.counterparty_email}</p>
                {trade.escrow_fee != null && (
                  <p className="text-body text-xs">
                    Escrow fee: {trade.escrow_fee.toLocaleString()} {trade.currency} · Total held: {(trade.amount + trade.escrow_fee).toLocaleString()} {trade.currency}
                  </p>
                )}
                <p className="text-body text-xs mb-3">
                  Created: {formatDate(trade.created_at)}
                  {trade.accepted_at && <> · Accepted: {formatDate(trade.accepted_at)}</>}
                </p>

                {trade.status === 'accepted' && !trade.funded && (
                  <div className="mb-3">
                    <button
                      onClick={() => handleFundEscrow(trade)}
                      disabled={fundingId === trade.id}
                      className="bg-accent hover:bg-accent-hover text-white text-sm font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                      {fundingId === trade.id ? 'Starting payment...' : 'Fund escrow (test payment)'}
                    </button>
                  </div>
                )}

                {trade.status === 'accepted' && trade.funded && (
                  <div>
                    <p className="text-body text-xs mb-2">
                      ✓ Escrow funded ·{' '}
                      {trade.buyer_confirmed ? '✓ You confirmed' : 'Waiting for your confirmation'}
                      {' · '}
                      {trade.seller_confirmed ? '✓ Counterparty confirmed' : 'Waiting for counterparty'}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {!trade.buyer_confirmed && (
                        <button onClick={() => handleBuyerConfirm(trade.id)} disabled={updatingId === trade.id}
                          className="bg-accent hover:bg-accent-hover text-white text-sm font-bold py-2 px-4 rounded disabled:opacity-50">
                          Confirm trade complete
                        </button>
                      )}
                      <button onClick={() => handleOpenDispute(trade.id)} disabled={updatingId === trade.id}
                        className="border border-border text-body text-sm font-bold py-2 px-4 rounded disabled:opacity-50">
                        Raise a dispute
                      </button>
                      <button onClick={() => handleBuyerCancel(trade.id)} disabled={updatingId === trade.id}
                        className="text-body text-xs underline disabled:opacity-50">
                        Cancel trade (you&apos;ll pay the full escrow fee)
                      </button>
                    </div>
                  </div>
                )}

                {trade.status === 'disputed' && trade.dispute_opened_at && (
                  <div className="bg-accent/10 border border-accent rounded p-3">
                    <p className="text-heading text-sm font-bold mb-1">Dispute in progress</p>
                    <p className="text-body text-xs mb-1">Opened: {formatDate(trade.dispute_opened_at)}</p>
                    <p className="text-body text-xs mb-3">
                      {daysRemaining(trade.dispute_opened_at)} days left to resolve directly with the other party.
                    </p>
                    <p className="text-body text-xs mb-2">Once you've agreed with the other party, mark the outcome:</p>
                    <div className="flex gap-2">
                      <button onClick={() => handleResolveDispute(trade.id, 'completed')} disabled={updatingId === trade.id}
                        className="bg-accent hover:bg-accent-hover text-white text-sm font-bold py-2 px-4 rounded disabled:opacity-50">
                        Resolved — release funds
                      </button>
                      <button onClick={() => handleResolveDispute(trade.id, 'declined')} disabled={updatingId === trade.id}
                        className="border border-border text-body text-sm font-bold py-2 px-4 rounded disabled:opacity-50">
                        Resolved — refund buyer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <h2 className="text-sm uppercase tracking-wide text-body mb-4">History</h2>
        {finishedTrades.length === 0 ? (
          <div className="border border-border rounded-lg p-6 bg-surface">
            <p className="text-body">No finished trades yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {finishedTrades.map((trade) => (
              <div key={trade.id} className="border border-border rounded-lg p-4 bg-surface opacity-75">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-heading font-bold">{trade.amount.toLocaleString()} {trade.currency}</p>
                  <span className="text-xs uppercase text-body bg-border px-2 py-1 rounded">{trade.status}</span>
                </div>
                <p className="text-body text-sm mb-1">{trade.description}</p>
                <p className="text-body text-xs">With: {trade.counterparty_email}</p>
                {trade.fee_responsibility === 'buyer' && (
                  <p className="text-body text-xs">Cancelled by buyer — full escrow fee charged to buyer</p>
                )}
                {trade.completed_at && <p className="text-body text-xs">Completed: {formatDate(trade.completed_at)}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
