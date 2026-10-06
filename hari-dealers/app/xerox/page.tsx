'use client';

import { useEffect, useMemo, useState } from 'react';
import { Printer, UploadCloud, FileText, CheckCircle2 } from 'lucide-react';

type Prices = { a4_bw: number; a4_colour: number; a3_bw: number; a3_colour: number; single_side: number; double_side: number; spiral_binding: number };
const money = (n: number) => `₹${n.toFixed(2)}`;

export default function XeroxPage() {
  const [prices, setPrices] = useState<Prices | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<{ order_number: string; estimated_price: number } | null>(null);
  const [spec, setSpec] = useState({ pages: 1, copies: 1, print_type: 'B&W', paper_size: 'A4', print_side: 'Single Side', binding: 'None' });
  useEffect(() => { fetch('/api/xerox').then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setPrices(d); }).catch(e => setMessage(e.message)); }, []);
  const estimate = useMemo(() => {
    if (!prices) return 0;
    const rate = prices[`${spec.paper_size.toLowerCase()}_${spec.print_type === 'B&W' ? 'bw' : 'colour'}` as keyof Prices] as number;
    return spec.pages * spec.copies * rate + prices[spec.print_side === 'Single Side' ? 'single_side' : 'double_side'] + (spec.binding === 'Spiral Binding' ? prices.spiral_binding : 0);
  }, [prices, spec]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMessage(''); setResult(null);
    if (!file) { setMessage('Please choose a document to print.'); return; }
    setBusy(true);
    try {
      const form = new FormData(e.currentTarget); form.set('document', file);
      const response = await fetch('/api/xerox', { method: 'POST', body: form }); const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not submit the request.');
      setResult(data.order); e.currentTarget.reset(); setFile(null); setSpec({ pages: 1, copies: 1, print_type: 'B&W', paper_size: 'A4', print_side: 'Single Side', binding: 'None' });
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Request failed.'); } finally { setBusy(false); }
  }
  const field = 'w-full rounded-xl border border-charcoal-200 bg-white px-4 py-3 text-sm text-charcoal-900 outline-none focus:border-burgundy-700';
  return <div className="min-h-screen bg-ivory py-12 sm:py-16"><div className="mx-auto max-w-6xl px-4 sm:px-6">
    <div className="mb-9 rounded-3xl bg-gradient-to-br from-burgundy-950 to-burgundy-800 p-8 text-white sm:p-12"><span className="text-xs font-bold uppercase tracking-[.2em] text-gold-300">Quick. Clear. Convenient.</span><h1 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">Xerox &amp; Printing</h1><p className="mt-4 max-w-2xl text-white/75">Upload your document, choose print options and see the current estimated price before you submit.</p></div>
    {result ? <div className="mx-auto max-w-xl rounded-3xl border border-green-200 bg-white p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto h-12 w-12 text-green-600"/><h2 className="mt-4 text-2xl font-bold">Request received</h2><p className="mt-2 text-charcoal-600">Order <strong>{result.order_number}</strong> · estimate {money(Number(result.estimated_price))}</p><p className="mt-2 text-sm text-charcoal-500">We’ll contact you to confirm the final price and collection time.</p><button onClick={()=>setResult(null)} className="mt-6 rounded-xl bg-burgundy-950 px-5 py-3 font-semibold text-white">Place another request</button></div> : <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <form onSubmit={submit} className="space-y-6 rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <section><h2 className="mb-4 text-lg font-bold">Your details</h2><div className="grid gap-4 sm:grid-cols-2"><input name="name" required className={field} placeholder="Full name"/><input name="phone" required className={field} placeholder="Phone number"/><input name="email" required type="email" className={`${field} sm:col-span-2`} placeholder="Email address"/></div></section>
        <section><h2 className="mb-4 text-lg font-bold">Print settings</h2><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm">Pages<input className={`${field} mt-1`} type="number" min="1" max="1000" required value={spec.pages} onChange={e=>setSpec({...spec,pages:Number(e.target.value)})}/></label><label className="text-sm">Copies<input className={`${field} mt-1`} type="number" min="1" max="100" required value={spec.copies} onChange={e=>setSpec({...spec,copies:Number(e.target.value)})}/></label>
          {([['print_type','Print colour',['B&W','Colour']],['paper_size','Paper size',['A4','A3']],['print_side','Print sides',['Single Side','Double Side']],['binding','Binding',['None','Spiral Binding']]] as const).map(([key,label,options])=><label key={key} className="text-sm">{label}<select className={`${field} mt-1`} value={spec[key]} onChange={e=>setSpec({...spec,[key]:e.target.value})}>{options.map(o=><option key={o}>{o}</option>)}</select></label>)}</div></section>
        <section><h2 className="mb-3 text-lg font-bold">Document</h2><label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-charcoal-200 p-5 hover:border-burgundy-500"><UploadCloud className="h-6 w-6 text-burgundy-800"/><span className="min-w-0"><span className="block font-semibold">{file?.name || 'Choose a file'}</span><span className="text-xs text-charcoal-500">PDF, DOC, DOCX, JPG or PNG · up to 15 MB</span></span><input type="file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" className="sr-only" onChange={e=>setFile(e.target.files?.[0] || null)}/></label><textarea name="notes" className={`${field} mt-4`} rows={3} maxLength={1000} placeholder="Instructions (optional)"/></section>
        {message && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{message}</p>}<button disabled={busy||!prices} className="w-full rounded-xl bg-burgundy-950 px-5 py-4 font-bold text-white hover:bg-burgundy-800 disabled:opacity-50">{busy?'Submitting…':'Submit print request'}</button>
      </form>
      <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><Printer className="h-6 w-6 text-burgundy-800"/><h2 className="text-lg font-bold">Price estimate</h2></div><div className="my-6 text-4xl font-bold text-burgundy-950">{prices?money(estimate):'—'}</div><p className="text-sm text-charcoal-600">Pages × copies × page rate, plus binding and side charges where configured.</p>{prices&&<div className="mt-6 space-y-2 border-t border-charcoal-100 pt-4 text-sm"><p>A4 B&amp;W <b className="float-right">{money(prices.a4_bw)}/page</b></p><p>A4 Colour <b className="float-right">{money(prices.a4_colour)}/page</b></p><p>A3 B&amp;W <b className="float-right">{money(prices.a3_bw)}/page</b></p><p>A3 Colour <b className="float-right">{money(prices.a3_colour)}/page</b></p><p>Spiral binding <b className="float-right">{money(prices.spiral_binding)}</b></p></div>}<p className="mt-5 flex items-center gap-2 text-xs text-charcoal-500"><FileText className="h-4 w-4"/>Your uploaded file is stored in private Supabase storage.</p></aside>
    </div>}
  </div></div>;
}
