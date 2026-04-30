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

    // --- AFFICHAGE DES CATÉGORIES ---
    const handleViewCategories = () => {
        const listRows = categories.map(c => `
            <tr>
                <td class="text-start">${c.nom || c.name}</td>
                <td class="text-end">
                    <span class="badge ${c.type === 'revenu' ? 'bg-success' : 'bg-danger'}">
                        ${c.type}
                    </span>
                </td>
            </tr>
        `).join('');

        Swal.fire({
            title: 'Gestion des Catégories',
            html: `
                <div class="table-responsive">
                    <table class="table table-striped table-sm">
                        <thead>
                            <tr><th class="text-start">Nom</th><th class="text-end">Type</th></tr>
                        </thead>
                        <tbody>${listRows}</tbody>
                    </table>
                </div>
            `,
            confirmButtonColor: colors.orange,
            confirmButtonText: 'Fermer',
            width: '500px'
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
            const matchSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase());
            return matchType && matchCategory && matchSearch;
        });
    }, [transactions, filterType, filterCategory, searchTerm]);

    // --- GESTION DES ACTIONS ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSubmit = { ...formData, montant: Number(formData.montant) };
            if (formData.id) await api.put(`/transactions/${formData.id}`, dataToSubmit);
            else await api.post('/transactions', dataToSubmit);
            
            Swal.fire({ icon: 'success', title: 'Enregistré !', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
            setShowModal(false);
            fetchData();
            resetForm();
        } catch (err) {
            Swal.fire('Erreur', "Impossible d'enregistrer.", 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Supprimer ?', icon: 'warning', showCancelButton: true, confirmButtonColor: colors.dangerRed });
        if (result.isConfirmed) {
            await api.delete(`/transactions/${id}`);
            fetchData();
        }
    };

    const resetForm = () => {
        setFormData({ type: 'depense', montant: '', description: '', category_id: '', date: new Date().toISOString().split('T')[0] });
        setIsAddingCategory(false);
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
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg px-2">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                            <div className="modal-header border-0 pt-4 px-4"><h5 className="fw-bold">Transaction</h5><button className="btn-close" onClick={() => setShowModal(false)}></button></div>
                            <form onSubmit={handleSubmit} className="modal-body p-4">
                                {/* Vos champs de formulaire restent ici */}
                                <div className="row g-3">
                                    <div className="col-12 col-md-6"><label>TYPE</label><select className="form-select rounded-pill" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}><option value="depense">Dépense</option><option value="revenu">Revenu</option></select></div>
                                    <div className="col-12 col-md-6"><label>MONTANT</label><input type="number" className="form-control rounded-pill" value={formData.montant} onChange={(e) => setFormData({...formData, montant: e.target.value})} /></div>
                                </div>
                                <button type="submit" disabled={isSubmitDisabled} className="btn w-100 mt-4 text-white rounded-pill" style={{ backgroundColor: colors.orange }}>Valider</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* --- EN-TÊTE --- */}
            <div className="row align-items-center mb-4">
                <div className="col-12 col-md-6">
                    <h4 className="fw-bold" style={{ color: colors.darkGreen }}><i className="bi bi-receipt me-2"></i>Transactions</h4>
                    <p>Solde: <span className={soldeActuel <= 0 ? 'text-danger' : 'text-success'}>{soldeActuel.toLocaleString()} FCFA</span></p>
                </div>
                <div className="col-12 col-md-6 text-md-end d-flex justify-content-md-end gap-2">
                    <button onClick={handleViewCategories} className="btn btn-outline-secondary fw-bold rounded-pill"><i className="bi bi-tags me-2"></i>Catégories</button>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="btn text-white fw-bold rounded-pill" style={{ backgroundColor: colors.orange }}><i className="bi bi-plus-lg me-2"></i>Nouvelle</button>
                </div>
            </div>

            {/* --- TABLEAU --- */}
            <div className="card shadow-sm border-0" style={{ borderRadius: '15px' }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light"><tr><th className="ps-4">Détails</th><th>Catégorie</th><th className="text-end pe-4">Montant</th><th className="text-center">Actions</th></tr></thead>
                        <tbody>
                            {filteredTransactions.map((t) => (
                                <tr key={t.id}>
                                    <td className="ps-4">{t.description}</td>
                                    <td><span className="badge bg-light text-dark border rounded-pill">{t.category?.nom || 'Général'}</span></td>
                                    <td className="text-end pe-4 fw-bold">{Number(t.montant).toLocaleString()} F</td>
                                    <td className="text-center"><button className="btn btn-sm text-primary" onClick={() => handleEdit(t)}><i className="bi bi-pencil"></i></button> <button className="btn btn-sm text-danger" onClick={() => handleDelete(t.id)}><i className="bi bi-trash"></i></button></td>
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