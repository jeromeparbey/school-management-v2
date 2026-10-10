import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserGroupIcon, MagnifyingGlassIcon, PlusIcon,
  PencilSquareIcon, TrashIcon, EyeIcon,
} from '@heroicons/react/24/outline';

const elevesMock = [
  { id: '1', matricule: 'ELV-2024-001', prenom: 'Aminata', nom: 'Diallo', sexe: 'F', dateNaissance: '2010-05-12', classe: '3ème A', statut: 'ACTIF', responsable: 'Mamadou Diallo', telephone: '+225 07 12 34 56' },
  { id: '2', matricule: 'ELV-2024-002', prenom: 'Ibrahim', nom: 'Traoré', sexe: 'M', dateNaissance: '2011-08-22', classe: '5ème B', statut: 'ACTIF', responsable: 'Fatou Traoré', telephone: '+225 05 98 76 54' },
  { id: '3', matricule: 'ELV-2024-003', prenom: 'Mariam', nom: 'Koné', sexe: 'F', dateNaissance: '2012-03-15', classe: 'CM2 B', statut: 'ACTIF', responsable: 'Sékou Koné', telephone: '+225 01 23 45 67' },
  { id: '4', matricule: 'ELV-2024-004', prenom: 'Moussa', nom: 'Coulibaly', sexe: 'M', dateNaissance: '2009-11-08', classe: '3ème A', statut: 'ACTIF', responsable: 'Awa Coulibaly', telephone: '+225 07 45 67 89' },
  { id: '5', matricule: 'ELV-2024-005', prenom: 'Fatoumata', nom: 'Bamba', sexe: 'F', dateNaissance: '2013-07-19', classe: 'CM1 A', statut: 'ACTIF', responsable: 'Yacouba Bamba', telephone: '+225 05 11 22 33' },
  { id: '6', matricule: 'ELV-2024-006', prenom: 'Souleymane', nom: 'Yao', sexe: 'M', dateNaissance: '2011-02-28', classe: '5ème B', statut: 'SUSPENDU', responsable: 'Akissi Yao', telephone: '+225 01 44 55 66' },
  { id: '7', matricule: 'ELV-2024-007', prenom: 'Awa', nom: 'Sanogo', sexe: 'F', dateNaissance: '2010-09-03', classe: '4ème A', statut: 'ACTIF', responsable: 'Bakary Sanogo', telephone: '+225 07 77 88 99' },
  { id: '8', matricule: 'ELV-2024-008', prenom: 'Adama', nom: 'Ouattara', sexe: 'M', dateNaissance: '2012-12-11', classe: 'CM2 B', statut: 'TRANSFERE', responsable: 'Salimata Ouattara', telephone: '+225 05 33 22 11' },
];

const STATUTS = ['ACTIF', 'SUSPENDU', 'TRANSFERE', 'SORTI', 'ARCHIVE'];

const ElevesPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filtreClasse, setFiltreClasse] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');

  const classes = useMemo(() => [...new Set(elevesMock.map((e) => e.classe))].sort(), []);

  const elevesFiltres = useMemo(() => {
    return elevesMock.filter((e) => {
      const s = search.toLowerCase();
      const matchSearch = !s || `${e.prenom} ${e.nom} ${e.matricule}`.toLowerCase().includes(s);
      const matchClasse = !filtreClasse || e.classe === filtreClasse;
      const matchStatut = !filtreStatut || e.statut === filtreStatut;
      return matchSearch && matchClasse && matchStatut;
    });
  }, [search, filtreClasse, filtreStatut]);

  const badgeStatut = (statut: string) => {
    const map: any = {
      ACTIF: 'bg-emerald-100 text-emerald-700',
      SUSPENDU: 'bg-amber-100 text-amber-700',
      TRANSFERE: 'bg-blue-100 text-blue-700',
      SORTI: 'bg-gray-100 text-gray-700',
      ARCHIVE: 'bg-rose-100 text-rose-700',
    };
    return map[statut] || 'bg-gray-100 text-gray-700';
  };

  const calculerAge = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserGroupIcon className="h-7 w-7 text-blue-600" />
            Gestion des élèves
          </h1>
          <p className="mt-1 text-sm text-gray-500">{elevesFiltres.length} élève(s) sur {elevesMock.length}</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/eleves/nouveau')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <PlusIcon className="h-4 w-4" /> Nouvel élève
        </button>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, matricule..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select value={filtreClasse} onChange={(e) => setFiltreClasse(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">Toutes les classes</option>
            {classes.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filtreStatut} onChange={(e) => setFiltreStatut(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
            <option value="">Tous les statuts</option>
            {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Matricule</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Élève</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Âge</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Classe</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Responsable</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {elevesFiltres.map((e) => (
                <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-mono text-gray-600">{e.matricule}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm ${e.sexe === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                        {e.prenom[0]}{e.nom[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{e.prenom} {e.nom}</p>
                        <p className="text-xs text-gray-500">{e.telephone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{calculerAge(e.dateNaissance)} ans</td>
                  <td className="py-3 px-4 text-sm text-gray-900 font-medium">{e.classe}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{e.responsable}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${badgeStatut(e.statut)}`}>{e.statut}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => navigate(`/dashboard/eleves/${e.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Voir">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-amber-600 hover:bg-amber-50 rounded" title="Modifier">
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-rose-600 hover:bg-rose-50 rounded" title="Supprimer">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {elevesFiltres.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-gray-500">Aucun élève trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ElevesPage;