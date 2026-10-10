import React, { useState } from 'react';
import { CurrencyDollarIcon, PlusIcon, EyeIcon, XCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const paiementsMock = [
  { id: '1', reference: 'PAY-2024-001', eleve: 'Aminata Diallo', classe: '3ème A', montant: 150000, moyen: 'ESPECES', date: '2024-11-15', caissier: 'Mme Kouassi', statut: 'COMPLET' },
  { id: '2', reference: 'PAY-2024-002', eleve: 'Ibrahim Traoré', classe: '5ème B', montant: 100000, moyen: 'MOBILE_MONEY', date: '2024-11-16', caissier: 'M. Bamba', statut: 'COMPLET' },
  { id: '3', reference: 'PAY-2024-003', eleve: 'Mariam Koné', classe: 'CM2 B', montant: 75000, moyen: 'VIREMENT', date: '2024-11-17', caissier: 'Mme Kouassi', statut: 'COMPLET' },
  { id: '4', reference: 'PAY-2024-004', eleve: 'Moussa Coulibaly', classe: '3ème A', montant: 200000, moyen: 'CHEQUE', date: '2024-11-18', caissier: 'M. Bamba', statut: 'ANNULE' },
  { id: '5', reference: 'PAY-2024-005', eleve: 'Fatoumata Bamba', classe: 'CM1 A', montant: 120000, moyen: 'MOBILE_MONEY', date: '2024-11-19', caissier: 'Mme Kouassi', statut: 'COMPLET' },
];

const fmt = (v: number) => new Intl.NumberFormat('fr-FR').format(v) + ' XOF';

const PaiementsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');

  const filtered = paiementsMock.filter((p) => {
    const s = search.toLowerCase();
    const matchSearch = !s || `${p.eleve} ${p.reference}`.toLowerCase().includes(s);
    const matchStatut = !filtreStatut || p.statut === filtreStatut;
    return matchSearch && matchStatut;
  });

  const total = filtered.filter((p) => p.statut === 'COMPLET').reduce((a, p) => a + p.montant, 0);

  const badgeMoyen = (m: string) => {
    const map: any = {
      ESPECES: 'bg-green-100 text-green-700',
      MOBILE_MONEY: 'bg-purple-100 text-purple-700',
      VIREMENT: 'bg-blue-100 text-blue-700',
      CHEQUE: 'bg-amber-100 text-amber-700',
      CARTE: 'bg-indigo-100 text-indigo-700',
    };
    return map[m] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CurrencyDollarIcon className="h-7 w-7 text-blue-600" /> Paiements
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {filtered.length} paiement(s) • Total encaissé : <span className="font-bold text-emerald-600">{fmt(total)}</span>
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <PlusIcon className="h-4 w-4" /> Nouveau paiement
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Rechercher par élève ou référence..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Tous les statuts</option>
          <option value="COMPLET">Complets</option>
          <option value="ANNULE">Annulés</option>
          <option value="REMBOURSE">Remboursés</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Référence</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Élève</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Classe</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Montant</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Moyen</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Caissier</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className={`border-b border-gray-100 hover:bg-gray-50 ${p.statut === 'ANNULE' ? 'opacity-60' : ''}`}>
                <td className="py-3 px-4 font-mono text-sm text-gray-700">{p.reference}</td>
                <td className="py-3 px-4 font-medium text-gray-900">{p.eleve}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{p.classe}</td>
                <td className="py-3 px-4 text-right font-bold text-emerald-600">{fmt(p.montant)}</td>
                <td className="py-3 px-4"><span className={`text-xs font-semibold px-2 py-1 rounded ${badgeMoyen(p.moyen)}`}>{p.moyen}</span></td>
                <td className="py-3 px-4 text-sm text-gray-600">{new Date(p.date).toLocaleDateString('fr-FR')}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{p.caissier}</td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2">
                    <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Voir"><EyeIcon className="h-4 w-4" /></button>
                    {p.statut === 'COMPLET' && (
                      <button className="p-1.5 text-rose-600 hover:bg-rose-50 rounded" title="Annuler"><XCircleIcon className="h-4 w-4" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaiementsPage;