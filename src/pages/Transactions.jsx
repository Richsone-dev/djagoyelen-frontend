import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../api/axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../assets/djago-logo.jpeg';
import Select from 'react-select';
import Swal from 'sweetalert2'; 

const Transactions = () => {
    // --- ÉTATS DES DONNÉES ---
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // --- ÉTATS DES FILTRES ---
    const [filterType, setFilterType] = useState('tous');
    const [filterCategory, setFilterCategory] = useState('tous');
    const [filterDate, setFilterDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // --- ÉTATS MODALE & FORMULAIRE ---
    const [showModal, setShowModal] = useState(false);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [formData, setFormData] = useState({
        type: 'depense',
        montant: '',
        description: '',
        category_id: '',
        date: new Date().toISOString().split('T')[0]
    });

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        successGreen: '#198754',
        dangerRed: '#dc3545',
        primaryBlue: '#0d6efd' 
    };

    // --- RÉCUPÉRATION DES DONNÉES ---
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [transRes, catRes] = await Promise.all([
                api.get('/transactions'),
                api.get('/categories')
            ]);
            setTransactions(Array.isArray(transRes.data) ? transRes.data : []);
            setCategories(catRes.data);
        } catch (err) {
            console.error("Erreur de chargement:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- LOGIQUE D'AFFICHAGE DES CATÉGORIES ---
    const handleViewCategories = () => {
        const listHtml = categories.map(c => `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${c.nom || c.name}
                <span class="badge ${c.type === 'revenu' ? 'bg-success' : 'bg-danger'} rounded-pill">${c.type}</span>
            </li>
        `).join('');

        Swal.fire({
            title: 'Vos Catégories',
            html: `<ul class="list-group text-start shadow-sm">${listHtml}</ul>`,
            confirmButtonColor: colors.orange,
            confirmButtonText: 'Fermer',
            width: '400px'
        });
    };

    // --- LOGIQUE DE CALCUL DU SOLDE ---
    const soldeActuel = useMemo(() => {
        return transactions.reduce((acc, t) => {
            const montant = Number(t.montant);
            return t.type === 'revenu' ? acc + montant : acc - montant;
        }, 0);
    }, [transactions]);

    // --- LOGIQUE DE FILTRAGE ---
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const matchType = filterType === 'tous' || t.type === filterType;
            const matchCategory = filterCategory === 'tous' || String(t.category_id) === String(filterCategory);
            const matchDate = !filterDate || t.date.startsWith(filterDate);
            const matchSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchType && matchCategory && matchDate && matchSearch;
        });
    }, [transactions, filterType, filterCategory, filterDate, searchTerm]);

    // --- GESTION DES ACTIONS ---
    const handleQuickCategoryAdd = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const res = await api.post('/categories', { 
                nom: newCategoryName, 
                type: formData.type 
            });
            
            setCategories([...categories, res.data]);
            setFormData({ ...formData, category_id: res.data.id });
            setNewCategoryName('');
            setIsAddingCategory(false);
        } catch (err) {
            if (err.response?.status === 422) {
                setErrorMsg("Cette catégorie existe déjà.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        try {
            const dataToSubmit = { ...formData, montant: Number(formData.montant) };
            if (formData.id) {
                await api.put(`/transactions/${formData.id}`, dataToSubmit);
            } else {
                await api.post('/transactions', dataToSubmit);
            }
            
            Swal.fire({ icon: 'success', title: 'Enregistré !', showConfirmButton: false, timer: 1500, position: 'top-end', toast: true });
            setShowModal(false);
            fetchData();
            resetForm();
        } catch (err) {
            if (err.response?.status === 403) {
                setErrorMsg(err.response.data.message);
                Swal.fire({ title: 'Budget atteint !', text: err.response.data.message, icon: 'warning', confirmButtonColor: colors.orange });
            } else {
                Swal.fire('Erreur', "Un problème est survenu lors de l'enregistrement.", 'error');
            }
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Cette action est irréversible !",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: colors.dangerRed,
            confirmButtonText: 'Oui, supprimer'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/transactions/${id}`);
                fetchData();
                Swal.fire('Supprimé !', 'La transaction a été retirée.', 'success');
            } catch (err) {
                Swal.fire('Erreur', "Impossible de supprimer.", 'error');
            }
        }
    };

    const resetForm = () => {
        setFormData({ type: 'depense', montant: '', description: '', category_id: '', date: new Date().toISOString().split('T')[0] });
        setIsAddingCategory(false);
        setNewCategoryName('');
        setErrorMsg('');
    };

    const handleEdit = (t) => {
        setFormData({ id: t.id, type: t.type, montant: t.montant, description: t.description || '', category_id: t.category_id, date: t.date.split('T')[0] });
        setShowModal(true);
    };

    const isSubmitDisabled = formData.type === 'depense' && soldeActuel < Number(formData.montant) && !formData.id;

    return (
        <div className="container-fluid px-2 px-md-4 py-4 mb-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            
            {/* --- MODAL AJOUT/EDIT --- */}
            {showModal && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg px-2">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                            <div className="modal-header border-0 pt-4 px-4 pb-0">
                                <div className="d-flex align-items-center text-start">
                                    <img src={logo} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '10px', marginRight: '12px' }} />
                                    <div>
                                        <h5 className="fw-bold mb-0"><span style={{ color: colors.successGreen }}>Djago</span><span style={{ color: colors.orange }}>Yelen</span></h5>
                                        <small className="text-muted">Solde: <b>{soldeActuel.toLocaleString()} F</b></small>
                                    </div>
                                </div>
                                <button className="btn-close shadow-none" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-body p-4 text-start">
                                {errorMsg && <div className="alert alert-danger border-0 small py-2 mb-3 rounded-3"><i className="bi bi-exclamation-triangle-fill me-2"></i>{errorMsg}</div>}
                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-bold text-muted">TYPE</label>
                                        <select className="form-select rounded-pill shadow-none" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                                            <option value="depense">Dépense (-)</option>
                                            <option value="revenu">Revenu (+)</option>
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label small fw-bold text-muted">MONTANT (FCFA)</label>
                                        <input type="number" className="form-control rounded-pill shadow-none" required value={formData.montant} onChange={(e) => setFormData({...formData, montant: e.target.value})} />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small fw-bold text-muted">CATÉGORIE</label>
                                        {!isAddingCategory ? (
                                            <div className="input-group">
                                                <div style={{ flex: 1 }}>
                                                    <Select
                                                        options={categories.map(c => ({ value: c.id, label: c.nom || c.name }))}
                                                        onChange={(selected) => setFormData({...formData, category_id: selected?.value})}
                                                        placeholder="-Sélectionner-"
                                                        value={categories.find(c => c.id === formData.category_id) ? { value: formData.category_id, label: categories.find(c => c.id === formData.category_id).nom || categories.find(c => c.id === formData.category_id).name } : null}
                                                    />
                                                </div>
                                                <button type="button" className="btn btn-outline-success rounded-circle ms-2" style={{ width: '38px', height: '38px', padding: 0 }} onClick={() => setIsAddingCategory(true)}><i className="bi bi-plus-lg"></i></button>
                                            </div>
                                        ) : (
                                            <div className="input-group">
                                                <input type="text" className="form-control rounded-start-pill" placeholder="Nouvelle catégorie..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} autoFocus />
                                                <button type="button" className="btn btn-success" onClick={handleQuickCategoryAdd}><i className="bi bi-check-lg"></i></button>
                                                <button type="button" className="btn btn-danger rounded-end-pill" onClick={() => setIsAddingCategory(false)}><i className="bi bi-x-lg"></i></button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button type="submit" disabled={isSubmitDisabled} className="btn w-100 mt-4 text-white fw-bold py-2 shadow rounded-pill" style={{ backgroundColor: isSubmitDisabled ? '#ccc' : colors.orange }}>
                                    {isSubmitDisabled ? 'Solde insuffisant' : (formData.id ? 'Mettre à jour' : 'Valider la transaction')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* --- EN-TÊTE --- */}
            <div className="row align-items-center mb-4 g-3 text-start">
                <div className="col-12 col-md-6">
                    <h4 className="fw-bold mb-0" style={{ color: colors.darkGreen }}><i className="bi bi-receipt me-2"></i>Transactions</h4>
                    <p className="small text-muted mb-0">Solde: <span className={soldeActuel <= 0 ? 'text-danger' : 'text-success'}>{soldeActuel.toLocaleString()} FCFA</span></p>
                </div>
                <div className="col-12 col-md-6 text-md-end d-flex justify-content-md-end gap-2">
                    <button onClick={handleViewCategories} className="btn btn-outline-secondary fw-bold shadow-sm" style={{ borderRadius: '12px', padding: '10px 20px' }}>
                        <i className="bi bi-tags me-2"></i>Catégories
                    </button>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="btn text-white fw-bold shadow-sm" style={{ backgroundColor: colors.orange, borderRadius: '12px', padding: '10px 20px' }}>
                        <i className="bi bi-plus-lg me-2"></i>Nouvelle Transaction
                    </button>
                </div>
            </div>

            {/* --- TABLEAU (Reste identique) --- */}
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-start">
                        <thead className="table-light">
                            <tr><th className="ps-4">Détails</th><th>Catégorie</th><th className="text-end pe-4">Montant</th><th className="text-center">Actions</th></tr>
                        </thead>
                        <tbody>
                            {loading ? <tr><td colSpan="4" className="text-center py-4">Chargement...</td></tr> : filteredTransactions.map((t) => (
                                <tr key={t.id}>
                                    <td className="ps-4"><div>{t.description}</div><div className="text-muted small">{new Date(t.date).toLocaleDateString()}</div></td>
                                    <td><span className="badge bg-light text-dark border rounded-pill px-3">{t.category?.nom || t.category?.name || 'Général'}</span></td>
                                    <td className={`text-end pe-4 fw-bold ${t.type === 'revenu' ? 'text-success' : 'text-danger'}`}>{t.type === 'revenu' ? '+' : '-'} {Number(t.montant).toLocaleString()} F</td>
                                    <td className="text-center"><button className="btn btn-sm btn-light text-primary" onClick={() => handleEdit(t)}><i className="bi bi-pencil"></i></button> <button className="btn btn-sm btn-light text-danger" onClick={() => handleDelete(t.id)}><i className="bi bi-trash"></i></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;