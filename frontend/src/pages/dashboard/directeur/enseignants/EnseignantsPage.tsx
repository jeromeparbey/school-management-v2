import React, { useState } from 'react';
import { AcademicCapIcon, PlusIcon, PencilSquareIcon, TrashIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const enseignantsMock = [
  { id: '1', matricule: 'ENS-001', prenom: 'Koffi', nom: 'Konaté', sexe: 'M', specialite: 'Mathématiques', telephone: '+225 07 12 34 56', email: 'k.konate@ecole.ci', typeContrat: 'CDI', salaire: 350000, estActif: true, classes: 4 },
  { id: '2', matricule: 'ENS-002', prenom: 'Aminata', nom: 'Touré', sexe: 'F', specialite: 'Français', telephone: '+225 05 98 76 54', email: 'a.toure@ecole.ci', typeContrat: 'CDI', salaire: 330000, estActif: true, classes: 3 },
  { id: '3', matricule: 'ENS-003', prenom: 'Moussa', nom: 'Diallo', sexe: 'M', specialite: 'Anglais', telephone: '+225 01 23 45 67', email: 'm.diallo@ecole.ci', typeContrat: 'CDD', salaire: 280000, estActif: true, classes: 5 },
  { id: '4', matricule: 'ENS-004', prenom: 'Fatou', nom: 'Bamba', sexe: 'F', specialite: 'Histoire-Géo', telephone: '+225 07 45 67 89', email: 'f.bamba@ecole.ci', typeContrat: 'CDI', salaire: 320000, estActif: true, classes: 4 },
  { id: '5', matricule: 'ENS-005', prenom: 'Yacouba', nom: 'Yao', sexe: 'M', specialite: 'Sciences Physiques', telephone: '+225 05 11 22 33', email: 'y.yao@ecole.ci', typeContrat: 'CDI', salaire: 340000, estActif: true, classes: 3 },
  { id: '6', matricule: 'ENS-006', prenom: 'Salimata', nom: 'Sanogo', sexe: 'F', specialite: 'SVT', telephone: '+225 01 44 55 66', email: 's.sanogo@ecole.ci', typeContrat: 'Vacataire', salaire: 180000, estActif: false, classes: 2 },
];

const EnseignantsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filtreActif, setFiltreActif] = useState('');

  const filtered = enseignantsMock.filter((e) => {
    const matchSearch = !search || `${e.prenom} ${e.nom} ${e.specialite} ${e.matricule}`.toLowerCase().includes(search.toLowerCase());
    const matchActif = !filtreActif || String(e.estActif) === filtreActif;
    return matchSearch && matchActif;
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AcademicCapIcon className="h-7 w-7 text-blue-600" /> Enseignants
          </h1>
          <p className="mt-1 text-sm text-gray-500">{filtered.length} enseignant(s)</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <PlusIcon className="h-4 w-4" /> Nouvel enseignant
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text" placeholder="Rechercher..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
        <select value={filtreActif} onChange={(e) => setFiltreActif(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Tous</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((e) => (
          <div key={e.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold ${e.sexe === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                {e.prenom[0]}{e.nom[0]}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">{e.prenom} {e.nom}</h3>
                <p className="text-xs text-gray-500 font-mono">{e.matricule}</p>
                <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded ${e.estActif ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {e.estActif ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <p className="text-gray-700"><span className="font-medium">Spécialité :</span> {e.specialite}</p>
              <p className="text-gray-600 flex items-center gap-2"><PhoneIcon className="h-4 w-4" /> {e.telephone}</p>
              <p className="text-gray-600 flex items-center gap-2"><EnvelopeIcon className="h-4 w-4" /> {e.email}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="text-gray-500">Contrat</p>
                <p className="font-semibold text-gray-900">{e.typeContrat}</p>
              </div>
              <div>
                <p className="text-gray-500">Classes</p>
                <p className="font-semibold text-gray-900">{e.classes}</p>
              </div>
              <div>
                <p className="text-gray-500">Salaire</p>
                <p className="font-semibold text-gray-900">{(e.salaire / 1000).toFixed(0)}k</p>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 p-2 text-amber-600 hover:bg-amber-50 rounded-lg flex justify-center"><PencilSquareIcon className="h-4 w-4" /></button>
              <button className="flex-1 p-2 text-rose-600 hover:bg-rose-50 rounded-lg flex justify-center"><TrashIcon className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnseignantsPage;