import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../api/axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../assets/djago-logo.jpeg';
import Select from 'react-select';
import Swal from 'sweetalert2'; // Ajout de SweetAlert2

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
            
            // Succès
            Swal.fire({
                icon: 'success',
                title: 'Enregistré !',
                showConfirmButton: false,
                timer: 1500,
                position: 'top-end',
                toast: true
            });

            setShowModal(false);
            fetchData();
            resetForm();
        } catch (err) {
            if (err.response?.status === 403) {
                // ALERTE DE BLOCAGE DE BUDGET
                setErrorMsg(err.response.data.message);
                Swal.fire({
                    title: 'Budget atteint !',
                    text: err.response.data.message,
                    icon: 'warning',
                    confirmButtonColor: colors.orange,
                    confirmButtonText: 'Compris'
                });
            } else if (err.response?.status === 422) {
                setErrorMsg("Veuillez vérifier les informations saisies.");
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
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler'
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
        setFormData({ 
            type: 'depense', 
            montant: '', 
            description: '', 
            category_id: '', 
            date: new Date().toISOString().split('T')[0] 
        });
        setIsAddingCategory(false);
        setNewCategoryName('');
        setErrorMsg('');
    };

    const handleEdit = (t) => {
        setFormData({ 
            id: t.id, 
            type: t.type, 
            montant: t.montant, 
            description: t.description || '', 
            category_id: t.category_id, 
            date: t.date.split('T')[0] 
        });
        setErrorMsg('');
        setShowModal(true);
    };

    const isSubmitDisabled = formData.type === 'depense' && soldeActuel < Number(formData.montant) && !formData.id;

    return (
        <div className="container-fluid px-2 px-md-4 py-4">
            
            {/* --- MODAL AJOUT/EDIT --- */}
            {showModal && (
                <>
                    <div className="modal-backdrop mb-5 fade show" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050 }}></div>
                    <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1051, overflowY: 'auto' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg px-2">
                            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                                <div className="modal-header border-0 pt-4 px-4 pb-0">
                                    <div className="d-flex align-items-center text-start">
                                        <img src={logo} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '10px', marginRight: '12px' }} />
                                        <div>
                                            <h5 className="fw-bold mb-0">
                                                <span style={{ color: colors.successGreen }}>Djago</span><span style={{ color: colors.orange }}>Yelen</span>
                                            </h5>
                                            <small className="text-muted">Solde disponible: <b className="text-dark">{soldeActuel.toLocaleString()} F</b></small>
                                        </div>
                                    </div>
                                    <button className="btn-close shadow-none" onClick={() => setShowModal(false)}></button>
                                </div>

                                <form onSubmit={handleSubmit} className="modal-body p-4 text-start">
                                    {errorMsg && (
                                        <div className="alert alert-danger border-0 small py-2 mb-3 rounded-3 d-flex align-items-center">
                                            <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                            <div>{errorMsg}</div>
                                        </div>
                                    )}

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
                                            <input type="number" className="form-control rounded-pill shadow-none" required placeholder="0" value={formData.montant} onChange={(e) => setFormData({...formData, montant: e.target.value})} />
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label small fw-bold text-muted">CATÉGORIE</label>
                                            {!isAddingCategory ? (
                                                <div className="input-group">
                                                    <div style={{ flex: 1 }}>
                                                        <Select
                                                            options={categories.map(c => ({ value: c.id, label: c.nom || c.name }))}
                                                            onChange={(selected) => setFormData({...formData, category_id: selected?.value})}
                                                            placeholder="-Selectionner-"
                                                            styles={{
                                                                control: (base) => ({ ...base, borderRadius: '25px', paddingLeft: '10px' })
                                                            }}
                                                            value={categories.find(c => c.id === formData.category_id) ? { value: formData.category_id, label: categories.find(c => c.id === formData.category_id).nom || categories.find(c => c.id === formData.category_id).name } : null}
                                                        />
                                                    </div>
                                                    <button type="button" className="btn btn-outline-success rounded-circle ms-2" style={{ width: '38px', height: '38px', padding: 0 }} onClick={() => setIsAddingCategory(true)} title="Nouvelle catégorie">
                                                        <i className="bi bi-plus-lg"></i>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="input-group">
                                                    <input type="text" className="form-control rounded-start-pill shadow-none" placeholder="Nom catégorie..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} autoFocus />
                                                    <button type="button" className="btn btn-success" onClick={handleQuickCategoryAdd}><i className="bi bi-check-lg"></i></button>
                                                    <button type="button" className="btn btn-danger rounded-end-pill" onClick={() => setIsAddingCategory(false)}><i className="bi bi-x-lg"></i></button>
                                                </div>
                                            )}
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-bold text-muted">DATE</label>
                                            <input type="date" className="form-control rounded-pill shadow-none" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label className="form-label small fw-bold text-muted">DESCRIPTION</label>
                                            <input type="text" className="form-control rounded-pill shadow-none" placeholder="Ex: Achat fournitures..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                                        </div>
                                    </div>

                                    {/* --- ALERTE SOLDE --- */}
                                    {isSubmitDisabled && (
                                        <div className="alert alert-warning border-0 small py-2 mt-4 mb-0 rounded-3 shadow-sm">
                                            <i className="bi bi-exclamation-circle-fill me-2"></i>
                                            Solde insuffisant pour cette dépense.
                                        </div>
                                    )}

                                    <div className="d-flex gap-2 mt-4">
                                        <button type="button" className="btn btn-light flex-grow-1 fw-bold py-2 rounded-pill" onClick={() => setShowModal(false)}>Annuler</button>
                                        <button 
                                            type="submit" 
                                            disabled={isSubmitDisabled}
                                            className="btn flex-grow-1 text-white fw-bold py-2 shadow rounded-pill" 
                                            style={{ backgroundColor: isSubmitDisabled ? '#ccc' : colors.orange, border: 'none' }}
                                        >
                                            {isSubmitDisabled ? 'Solde insuffisant' : (formData.id ? 'Mettre à jour' : 'Valider la transaction')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* --- LE RESTE DU CODE (ENTÊTE, FILTRES, TABLEAU) RESTE IDENTIQUE --- */}
            <div className="row align-items-center mb-4 g-3 text-start">
                <div className="col-12 col-md-6">
                    <h4 className="fw-bold mb-0" style={{ color: colors.darkGreen }}>
                        <i className="bi bi-receipt me-2"></i>Transactions
                    </h4>
                    <p className="small text-muted mb-0">Solde actuel: <span className={soldeActuel <= 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>{soldeActuel.toLocaleString()} FCFA</span></p>
                </div>
                <div className="col-12 col-md-6 text-md-end">
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="btn text-white fw-bold shadow-sm w-100 w-md-auto" style={{ backgroundColor: colors.orange, borderRadius: '12px', padding: '10px 20px' }}>
                        <i className="bi bi-plus-lg me-2"></i>Nouvelle Transaction
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
                <div className="card-body p-3">
                    <div className="row g-3 align-items-end text-start">
                        <div className="col-12 col-md-3">
                            <label className="form-label small fw-bold text-muted">Type</label>
                            <select className="form-select rounded-pill shadow-none" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                                <option value="tous">Tous les types</option>
                                <option value="revenu">Revenus (+)</option>
                                <option value="depense">Dépenses (-)</option>
                            </select>
                        </div>
                        <div className="col-12 col-md-3">
                            <label className="form-label small fw-bold text-muted">Catégorie</label>
                            <select className="form-select rounded-pill shadow-none" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                                <option value="tous">Toutes les catégories</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.nom || c.name}</option>)}
                            </select>
                        </div>
                        <div className="col-12 col-md-4">
                            <label className="form-label small fw-bold text-muted">Rechercher</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 rounded-start-pill"><i className="bi bi-search"></i></span>
                                <input type="text" className="form-control border-start-0 rounded-end-pill shadow-none" placeholder="Description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>
                        <div className="col-12 col-md-2">
                            <button className="btn w-100 rounded-pill fw-bold" style={{backgroundColor: colors.primaryBlue, color: 'white', fontSize: '12px'}} onClick={fetchData}>
                                <i className="bi bi-arrow-clockwise me-2"></i>Actualiser
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0 text-start">
                        <thead className="table-light">
                            <tr>
                                <th className="ps-4 border-0">Détails</th>
                                <th className="d-none d-md-table-cell border-0">Catégorie</th>
                                <th className="text-end pe-4 border-0">Montant</th>
                                <th className="text-center border-0">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-4 text-muted">Chargement...</td></tr>
                            ) : filteredTransactions.length > 0 ? (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id}>
                                        <td className="ps-4">
                                            <div className="fw-bold">{t.description || 'Sans titre'}</div>
                                            <div className="text-muted small">
                                                {new Date(t.date).toLocaleDateString('fr-FR')} 
                                                <span className="d-md-none"> • {t.category?.nom || t.category?.name}</span>
                                            </div>
                                        </td>
                                        <td className="d-none d-md-table-cell">
                                            <span className="badge bg-light text-dark border rounded-pill px-3">
                                                {t.category?.nom || t.category?.name || 'Général'}
                                            </span>
                                        </td>
                                        <td className={`text-end pe-4 fw-bold ${t.type === 'revenu' ? 'text-success' : 'text-danger'}`}>
                                            {t.type === 'revenu' ? '+' : '-'} {Number(t.montant).toLocaleString()} <small>F</small>
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-1">
                                                <button className="btn btn-sm btn-light text-primary rounded-circle" onClick={() => handleEdit(t)}><i className="bi bi-pencil"></i></button>
                                                <button className="btn btn-sm btn-light text-danger rounded-circle" onClick={() => handleDelete(t.id)}><i className="bi bi-trash"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="text-center py-4 text-muted">Aucune transaction trouvée.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;