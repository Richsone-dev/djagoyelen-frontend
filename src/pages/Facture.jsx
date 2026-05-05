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
      setFactures(resFactures.data);
      setClients(resClients.data);
    } catch (error) {
      console.error(error);
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

    if (!formData.client_id) {
      alert("Veuillez sélectionner un client");
      return;
    }

    const payload = {
      client_id: formData.client_id,
      date_emission: formData.date_emission,
      tva_taux: formData.tva_taux,
      total_ht: formData.total_ht,
      total_ttc: formData.total_ttc,
      lignes: formData.items
    };

    try {
      if (isEditing) {
        await api.put(`/factures/${formData.id}`, payload);
      } else {
        await api.post('/factures', payload);
      }

      alert("Enregistré ✅");
      setFormData(initialFormState);
      setView('list');
      fetchData();

    } catch (error) {
      console.error(error.response?.data);
      alert("Erreur ❌");
    }
  };

  const handleItemChange = (idx, field, value) => {
    const items = [...formData.items];
    items[idx][field] = field === 'designation' ? value : parseFloat(value) || 0;
    setFormData({ ...formData, items });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { designation: '', quantite: 1, prix_unitaire: 0 }]
    });
  };

  return (
    <div className="container py-4">
      <h2>Factures</h2>

      {view === 'list' ? (
        <>
          <button className="btn btn-primary mb-3" onClick={() => {
            setFormData(initialFormState);
            setIsEditing(false);
            setView('form');
          }}>
            Nouvelle facture
          </button>

          <input className="form-control mb-3" placeholder="Recherche..." onChange={(e) => setSearchTerm(e.target.value)} />

          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Total TTC</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {factures
                .filter(f => f.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(f => (
                  <tr key={f.id}>
                    <td>{f.client?.nom}</td>
                    <td>{f.total_ttc} FCFA</td>
                    <td>
                      <button className="btn btn-sm btn-warning me-2" onClick={() => {
                        setFormData({
                          ...f,
                          items: f.lignes || []
                        });
                        setIsEditing(true);
                        setView('form');
                      }}>
                        Modifier
                      </button>

                      <button className="btn btn-sm btn-danger" onClick={async () => {
                        if (window.confirm("Supprimer ?")) {
                          await api.delete(`/factures/${f.id}`);
                          fetchData();
                        }
                      }}>
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <Select
            options={clients.map(c => ({ value: c.id, label: c.nom }))}
            value={clients.find(c => c.id === formData.client_id)
              ? { value: formData.client_id, label: clients.find(c => c.id === formData.client_id).nom }
              : null}
            onChange={(c) => setFormData({ ...formData, client_id: c?.value || '' })}
          />

          <hr />

          {formData.items.map((item, i) => (
            <div key={i} className="row mb-2">
              <div className="col">
                <input className="form-control" placeholder="Designation"
                  value={item.designation}
                  onChange={(e) => handleItemChange(i, 'designation', e.target.value)} />
              </div>
              <div className="col">
                <input type="number" className="form-control"
                  value={item.quantite}
                  onChange={(e) => handleItemChange(i, 'quantite', e.target.value)} />
              </div>
              <div className="col">
                <input type="number" className="form-control"
                  value={item.prix_unitaire}
                  onChange={(e) => handleItemChange(i, 'prix_unitaire', e.target.value)} />
              </div>
            </div>
          ))}

          <button type="button" onClick={addItem} className="btn btn-secondary">Ajouter ligne</button>

          <h4>Total TTC: {formData.total_ttc} FCFA</h4>

          <button type="submit" className="btn btn-success">Enregistrer</button>
        </form>
      )}
    </div>
  );
};

export default Facture;