import React, { useState } from 'react';
import { DocumentTextIcon, PlusIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const notesMock = [
  { id: '1', eleve: 'Aminata Diallo', classe: '3ème A', matiere: 'Mathématiques', type: 'Devoir', note: 15.5, coef: 2, date: '2024-11-15', statut: 'VALIDE' },
  { id: '2', eleve: 'Ibrahim Traoré', classe: '5ème B', matiere: 'Français', type: 'Composition', note: 12.0, coef: 3, date: '2024-11-18', statut: 'VALIDE' },
  { id: '3', eleve: 'Mariam Koné', classe: 'CM2 B', matiere: 'Mathématiques', type: 'Test', note: 18.5, coef: 1, date: '2024-11-20', statut: 'EN_ATTENTE' },
  { id: '4', eleve: 'Moussa Coulibaly', classe: '3ème A', matiere: 'Anglais', type: 'Devoir', note: 9.5, coef: 2, date: '2024-11-21', statut: 'VALIDE' },
  { id: '5', eleve: 'Fatoumata Bamba', classe: 'CM1 A', matiere: 'SVT', type: 'Examen', note: 14.0, coef: 3, date: '2024-11-22', statut: 'EN_ATTENTE' },
  { id: '6', eleve: 'Awa Sanogo', classe: '4ème A', matiere: 'Histoire-Géo', type: 'TP', note: 16.5, coef: 1, date: '2024-11-23', statut: 'VALIDE' },
];

const NotesPage: React.FC = () => {
  const [filtreClasse, setFiltreClasse] = useState('');
  const [filtreMatiere, setFiltreMatiere] = useState('');

  const classes = [...new Set(notesMock.map((n) => n.classe))];
  const matieres = [...new Set(notesMock.map((n) => n.matiere))];

  const filtered = notesMock.filter((n) =>
    (!filtreClasse || n.classe === filtreClasse) &&
    (!filtreMatiere || n.matiere === filtreMatiere)
  );

  const noteColor = (n: number) => n >= 14 ? 'text-emerald-600' : n >= 10 ? 'text-blue-600' : 'text-rose-600';

  return (
    <div className="p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="h-7 w-7 text-blue-600" /> Saisie des notes
          </h1>
          <p className="mt-1 text-sm text-gray-500">{filtered.length} note(s)</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          <PlusIcon className="h-4 w-4" /> Nouvelle note
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <select value={filtreClasse} onChange={(e) => setFiltreClasse(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Toutes les classes</option>
          {classes.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filtreMatiere} onChange={(e) => setFiltreMatiere(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Toutes les matières</option>
          {matieres.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Élève</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Classe</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Matière</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Note</th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Coef.</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((n) => (
              <tr key={n.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{n.eleve}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{n.classe}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{n.matiere}</td>
                <td className="py-3 px-4"><span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">{n.type}</span></td>
                <td className={`py-3 px-4 text-center font-bold ${noteColor(n.note)}`}>{n.note.toFixed(2)}/20</td>
                <td className="py-3 px-4 text-center text-sm text-gray-600">×{n.coef}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{new Date(n.date).toLocaleDateString('fr-FR')}</td>
                <td className="py-3 px-4">
                  {n.statut === 'VALIDE' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                      <CheckCircleIcon className="h-3 w-3" /> Validé
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded">En attente</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotesPage;