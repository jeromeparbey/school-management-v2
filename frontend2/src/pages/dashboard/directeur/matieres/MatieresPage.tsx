import React, { useState } from 'react';
import { BookOpenIcon, PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

const matieresMock = [
  { id: '1', nom: 'Mathématiques', code: 'MATH', coefficient: 4, dureeCours: 60, niveau: 'Collège', enseignant: 'M. Konaté' },
  { id: '2', nom: 'Français', code: 'FR', coefficient: 4, dureeCours: 60, niveau: 'Collège', enseignant: 'Mme Touré' },
  { id: '3', nom: 'Anglais', code: 'ANG', coefficient: 2, dureeCours: 45, niveau: 'Collège', enseignant: 'M. Diallo' },
  { id: '4', nom: 'Histoire-Géo', code: 'HG', coefficient: 2, dureeCours: 60, niveau: 'Collège', enseignant: 'Mme Bamba' },
  { id: '5', nom: 'Sciences Physiques', code: 'PC', coefficient: 3, dureeCours: 60, niveau: 'Collège', enseignant: 'M. Yao' },
  { id: '6', nom: 'SVT', code: 'SVT', coefficient: 2, dureeCours: 60, niveau: 'Collège', enseignant: 'Mme Sanogo' },
  { id: '7', nom: 'Éducation Civique', code: 'EC', coefficient: 1, dureeCours: 45, niveau: 'Primaire', enseignant: 'M. Coulibaly' },
];

const MatieresPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const filtered = matieresMock.filter((m) =>
    !search || `${m.nom} ${m.code}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpenIcon className="h-7 w-7 text-blue-600" /> Matières
          </h1>
          <p className="mt-1 text-sm text-gray-500">{filtered.length} matière(s)</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <PlusIcon className="h-4 w-4" /> Nouvelle matière
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <input
          type="text"
          placeholder="Rechercher une matière..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Matière</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Code</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Niveau</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Coef.</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Durée</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Enseignant</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{m.nom}</td>
                <td className="py-3 px-4"><span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{m.code}</span></td>
                <td className="py-3 px-4 text-sm text-gray-600">{m.niveau}</td>
                <td className="py-3 px-4"><span className="font-bold text-blue-600">×{m.coefficient}</span></td>
                <td className="py-3 px-4 text-sm text-gray-600">{m.dureeCours} min</td>
                <td className="py-3 px-4 text-sm text-gray-600">{m.enseignant}</td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2">
                    <button className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"><PencilSquareIcon className="h-4 w-4" /></button>
                    <button className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"><TrashIcon className="h-4 w-4" /></button>
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

export default MatieresPage;