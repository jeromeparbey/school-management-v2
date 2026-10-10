import React, { useState } from 'react';
import {
  BuildingOfficeIcon, PlusIcon, PencilSquareIcon,
  TrashIcon, UserGroupIcon, AcademicCapIcon,
} from '@heroicons/react/24/outline';

const classesMock = [
  { id: '1', nom: '3ème A', code: '3A', niveau: 'Collège', effectif: 28, capacite: 35, salle: 'B12', titulaire: 'M. Konaté', moyenne: 15.42 },
  { id: '2', nom: '3ème B', code: '3B', niveau: 'Collège', effectif: 30, capacite: 35, salle: 'B13', titulaire: 'Mme Touré', moyenne: 12.10 },
  { id: '3', nom: '4ème A', code: '4A', niveau: 'Collège', effectif: 30, capacite: 35, salle: 'B08', titulaire: 'M. Diallo', moyenne: 14.25 },
  { id: '4', nom: '5ème B', code: '5B', niveau: 'Collège', effectif: 31, capacite: 35, salle: 'B05', titulaire: 'Mme Bamba', moyenne: 13.56 },
  { id: '5', nom: 'CM2 B', code: 'CM2B', niveau: 'Primaire', effectif: 32, capacite: 40, salle: 'A02', titulaire: 'M. Yao', moyenne: 14.87 },
  { id: '6', nom: 'CM1 A', code: 'CM1A', niveau: 'Primaire', effectif: 29, capacite: 40, salle: 'A01', titulaire: 'Mme Sanogo', moyenne: 13.98 },
];

const ClassesPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filtreNiveau, setFiltreNiveau] = useState('');

  const niveaux = [...new Set(classesMock.map((c) => c.niveau))];
  const filtered = classesMock.filter((c) =>
    (!search || c.nom.toLowerCase().includes(search.toLowerCase())) &&
    (!filtreNiveau || c.niveau === filtreNiveau)
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BuildingOfficeIcon className="h-7 w-7 text-blue-600" /> Gestion des classes
          </h1>
          <p className="mt-1 text-sm text-gray-500">{filtered.length} classe(s)</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <PlusIcon className="h-4 w-4" /> Nouvelle classe
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Rechercher une classe..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
        <select value={filtreNiveau} onChange={(e) => setFiltreNiveau(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Tous les niveaux</option>
          {niveaux.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c) => {
          const taux = Math.round((c.effectif / (c.capacite || 1)) * 100);
          return (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{c.nom}</h3>
                  <p className="text-xs text-gray-500 font-mono">{c.code} • {c.niveau}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${taux > 90 ? 'bg-rose-100 text-rose-700' : taux > 75 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {taux}%
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <UserGroupIcon className="h-4 w-4" />
                  <span>{c.effectif} / {c.capacite} élèves</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <AcademicCapIcon className="h-4 w-4" />
                  <span>{c.titulaire}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="text-xs">🏫</span><span>Salle {c.salle}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Moyenne</p>
                  <p className={`text-lg font-bold ${c.moyenne >= 14 ? 'text-emerald-600' : c.moyenne >= 10 ? 'text-blue-600' : 'text-rose-600'}`}>
                    {c.moyenne.toFixed(2)}/20
                  </p>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg"><PencilSquareIcon className="h-4 w-4" /></button>
                  <button className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><TrashIcon className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClassesPage;