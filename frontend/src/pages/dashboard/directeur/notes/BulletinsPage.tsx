import React, { useState } from 'react';
import { DocumentTextIcon, ArrowDownTrayIcon, EyeIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';

const bulletinsMock = [
  { id: '1', eleve: 'Aminata Diallo', classe: '3ème A', periode: 'Trimestre 1', moyenne: 15.42, rang: 1, effectif: 28, appreciation: 'Excellent trimestre', statut: 'VALIDE' },
  { id: '2', eleve: 'Ibrahim Traoré', classe: '5ème B', periode: 'Trimestre 1', moyenne: 11.80, rang: 15, effectif: 31, appreciation: 'Doit fournir plus d\'efforts', statut: 'VALIDE' },
  { id: '3', eleve: 'Mariam Koné', classe: 'CM2 B', periode: 'Trimestre 1', moyenne: 16.20, rang: 2, effectif: 32, appreciation: 'Très bon travail', statut: 'EN_ATTENTE' },
  { id: '4', eleve: 'Moussa Coulibaly', classe: '3ème A', periode: 'Trimestre 1', moyenne: 10.50, rang: 22, effectif: 28, appreciation: 'Peut mieux faire', statut: 'VALIDE' },
  { id: '5', eleve: 'Awa Sanogo', classe: '4ème A', periode: 'Trimestre 1', moyenne: 14.75, rang: 5, effectif: 30, appreciation: 'Bon trimestre', statut: 'EN_ATTENTE' },
];

const BulletinsPage: React.FC = () => {
  const [filtreStatut, setFiltreStatut] = useState('');
  const filtered = bulletinsMock.filter((b) => !filtreStatut || b.statut === filtreStatut);

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="h-7 w-7 text-blue-600" /> Bulletins
          </h1>
          <p className="mt-1 text-sm text-gray-500">{filtered.length} bulletin(s)</p>
        </div>
        <div className="flex gap-2">
          <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">Tous</option>
            <option value="VALIDE">Validés</option>
            <option value="EN_ATTENTE">En attente</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((b) => (
          <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900">{b.eleve}</h3>
                <p className="text-xs text-gray-500">{b.classe} • {b.periode}</p>
              </div>
              {b.statut === 'VALIDE' ? (
                <CheckBadgeIcon className="h-5 w-5 text-emerald-500" />
              ) : (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded font-semibold">En attente</span>
              )}
            </div>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-500">Moyenne</p>
                <p className={`text-3xl font-bold ${b.moyenne >= 14 ? 'text-emerald-600' : b.moyenne >= 10 ? 'text-blue-600' : 'text-rose-600'}`}>
                  {b.moyenne.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Rang</p>
                <p className="text-lg font-bold text-gray-900">{b.rang}<span className="text-xs text-gray-500">/{b.effectif}</span></p>
              </div>
            </div>

            <p className="mt-3 text-xs text-gray-600 italic bg-gray-50 p-2 rounded">"{b.appreciation}"</p>

            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 font-medium">
                <EyeIcon className="h-4 w-4" /> Voir
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium">
                <ArrowDownTrayIcon className="h-4 w-4" /> PDF
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BulletinsPage;