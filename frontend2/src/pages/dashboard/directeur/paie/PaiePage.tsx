import React, { useState } from 'react';
import { BanknotesIcon, CheckCircleIcon, ClockIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const paiesMock = [
  { id: '1', enseignant: 'Koffi Konaté', periode: 'Novembre 2024', salaireBase: 350000, heuresSupp: 30000, primes: 25000, retenues: 15000, avances: 50000, totalNet: 340000, statut: 'PAYEE' },
  { id: '2', enseignant: 'Aminata Touré', periode: 'Novembre 2024', salaireBase: 330000, heuresSupp: 15000, primes: 20000, retenues: 12000, avances: 0, totalNet: 353000, statut: 'APPROUVEE' },
  { id: '3', enseignant: 'Moussa Diallo', periode: 'Novembre 2024', salaireBase: 280000, heuresSupp: 0, primes: 10000, retenues: 8000, avances: 30000, totalNet: 252000, statut: 'CALCULEE' },
  { id: '4', enseignant: 'Fatou Bamba', periode: 'Novembre 2024', salaireBase: 320000, heuresSupp: 20000, primes: 15000, retenues: 10000, avances: 0, totalNet: 345000, statut: 'PAYEE' },
  { id: '5', enseignant: 'Yacouba Yao', periode: 'Novembre 2024', salaireBase: 340000, heuresSupp: 0, primes: 20000, retenues: 11000, avances: 100000, totalNet: 249000, statut: 'BROUILLON' },
];

const fmt = (v: number) => new Intl.NumberFormat('fr-FR').format(v) + ' XOF';

const badgeStatut = (s: string) => {
  const map: any = {
    BROUILLON: 'bg-gray-100 text-gray-700',
    CALCULEE: 'bg-blue-100 text-blue-700',
    APPROUVEE: 'bg-amber-100 text-amber-700',
    PAYEE: 'bg-emerald-100 text-emerald-700',
    ANNULEE: 'bg-rose-100 text-rose-700',
  };
  return map[s] || 'bg-gray-100 text-gray-700';
};

const PaiePage: React.FC = () => {
  const [filtreStatut, setFiltreStatut] = useState('');
  const filtered = paiesMock.filter((p) => !filtreStatut || p.statut === filtreStatut);

  const totalNet = filtered.reduce((a, p) => a + p.totalNet, 0);

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BanknotesIcon className="h-7 w-7 text-blue-600" /> Paie du personnel
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {filtered.length} bulletin(s) • Total net : <span className="font-bold text-emerald-600">{fmt(totalNet)}</span>
          </p>
        </div>
        <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Tous les statuts</option>
          <option value="BROUILLON">Brouillon</option>
          <option value="CALCULEE">Calculée</option>
          <option value="APPROUVEE">Approuvée</option>
          <option value="PAYEE">Payée</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Enseignant</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Période</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Base</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">H. Supp</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Primes</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Retenues</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Avances</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Net</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Statut</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{p.enseignant}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{p.periode}</td>
                <td className="py-3 px-4 text-right text-sm text-gray-700">{fmt(p.salaireBase)}</td>
                <td className="py-3 px-4 text-right text-sm text-blue-600">{p.heuresSupp > 0 ? '+' + fmt(p.heuresSupp) : '—'}</td>
                <td className="py-3 px-4 text-right text-sm text-emerald-600">{p.primes > 0 ? '+' + fmt(p.primes) : '—'}</td>
                <td className="py-3 px-4 text-right text-sm text-rose-600">{p.retenues > 0 ? '-' + fmt(p.retenues) : '—'}</td>
                <td className="py-3 px-4 text-right text-sm text-amber-600">{p.avances > 0 ? '-' + fmt(p.avances) : '—'}</td>
                <td className="py-3 px-4 text-right font-bold text-gray-900">{fmt(p.totalNet)}</td>
                <td className="py-3 px-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${badgeStatut(p.statut)}`}>{p.statut}</span>
                </td>
                <td className="py-3 px-4">
                  <button className="p-1.5 text-gray-600 hover:bg-gray-100 rounded" title="Télécharger le bulletin">
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaiePage;