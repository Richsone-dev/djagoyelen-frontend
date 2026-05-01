import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import Select from 'react-select';

const Facture = () => {
  const [factures, setFactures] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const initialFormState = {
    id: null,
    client_id: '',
    date_emission: new Date().toISOString().split('T')[0],
    items: [{ designation: '', quantite: 1, prix_unitaire: 0 }],
    tva_taux: 18,
    total_ht: 0,
    total_ttc: 0
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [resFactures, resClients] = await Promise.all([
        api.get('/factures'),
        api.get('/clients')
      ]);
      setFactures(resFactures.data || []);
      setClients(resClients.data || []);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const ht = formData.items.reduce((sum, item) => sum + (item.quantite * item.prix_unitaire), 0);
    const tva = ht * (formData.tva_taux / 100);
    setFormData(prev => ({ ...prev, total_ht: ht, total_ttc: ht + tva }));
  }, [formData.items, formData.tva_taux]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.client_id) return alert("Veuillez sélectionner un client");
    
    try {
      isEditing ? await api.put(`/factures/${formData.id}`, formData) : await api.post('/factures', formData);
      alert("Enregistré avec succès ✅");
      setFormData(initialFormState);
      setView('list');
      fetchData();
    } catch (error) {
      alert("Erreur lors de la sauvegarde.");
    }
  };

  const handleItemChange = (idx, field, value) => {
    const items = [...formData.items];
    items[idx][field] = field === 'designation' ? value : parseFloat(value) || 0;
    setFormData({ ...formData, items });
  };

  const addItem = () => setFormData({...formData, items: [...formData.items, { designation: '', quantite: 1, prix_unitaire: 0 }]});

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary fw-bold">Gestion des Factures</h2>
        {view === 'list' && (
          <button className="btn btn-primary" onClick={() => { setIsEditing(false); setFormData(initialFormState); setView('form'); }}>
            + Nouvelle Facture
          </button>
        )}
      </div>

      {view === 'list' ? (
        <div className="card shadow-sm p-3">
          <input className="form-control mb-3" placeholder="🔍 Rechercher par client..." onChange={(e) => setSearchTerm(e.target.value)} />
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr><th>Numéro</th><th>Client</th><th>Total TTC</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {factures.filter(f => f.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase())).map(f => (
                <tr key={f.id}>
                  <td><strong>{f.num_facture}</strong></td>
                  <td>{f.client?.nom}</td>
                  <td className="fw-bold">{parseFloat(f.total_ttc).toLocaleString()} FCFA</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => { setIsEditing(true); setFormData({...f, items: f.lignes || []}); setView('form'); }}>Modifier</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={async () => { if(window.confirm("Supprimer ?")) { await api.delete(`/factures/${f.id}`); fetchData(); }}}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card shadow-sm p-4">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Sélectionner le Client</label>
              <Select
                options={clients.map(c => ({ value: c.id, label: c.nom }))}
                value={clients.find(c => c.id === formData.client_id) ? { value: formData.client_id, label: clients.find(c => c.id === formData.client_id).nom } : null}
                onChange={(c) => setFormData({ ...formData, client_id: c.value })}
                required
              />
            </div>

            <div className="bg-light p-3 rounded">
              <h5>Lignes de facture</h5>
              {formData.items.map((item, i) => (
                <div key={i} className="row g-2 mb-2">
                  <div className="col-6"><input className="form-control" placeholder="Désignation" value={item.designation} onChange={(e) => handleItemChange(i, 'designation', e.target.value)} required /></div>
                  <div className="col-2"><input type="number" className="form-control" value={item.quantite} onChange={(e) => handleItemChange(i, 'quantite', e.target.value)} /></div>
                  <div className="col-4"><input type="number" className="form-control" value={item.prix_unitaire} onChange={(e) => handleItemChange(i, 'prix_unitaire', e.target.value)} /></div>
                </div>
              ))}
              <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addItem}>+ Ajouter une ligne</button>
            </div>

            <div className="mt-3 text-end">
              <h4 className="text-primary">Total TTC: {formData.total_ttc.toLocaleString()} FCFA</h4>
              <button type="button" className="btn btn-secondary me-2" onClick={() => setView('list')}>Annuler</button>
              <button type="submit" className="btn btn-success px-4">Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Facture;