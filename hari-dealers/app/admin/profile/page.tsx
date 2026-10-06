import { ShieldCheck, UserRound } from 'lucide-react';

export default function AdminProfilePage() {
  return <div className="mx-auto max-w-3xl space-y-6">
    <header><p className="text-xs uppercase tracking-widest text-gold-400">Administrator account</p><h1 className="mt-2 text-3xl font-bold text-white">Admin Profile</h1></header>
    <section className="rounded-2xl border border-charcoal-800 bg-charcoal-950 p-6">
      <div className="flex items-center gap-4"><span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold-500/40 bg-burgundy-950 text-gold-300"><UserRound/></span><div><h2 className="text-lg font-semibold text-white">HARI DEALERS Administrator</h2><p className="text-sm text-charcoal-300">haridealers</p></div></div>
      <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-700/30 bg-emerald-950/20 p-4"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400"/><p className="text-sm text-charcoal-200">Single administrator account. The password is configured on the server and is never displayed here. Admin access uses a signed, HttpOnly session that expires after 12 hours.</p></div>
    </section>
  </div>;
}
