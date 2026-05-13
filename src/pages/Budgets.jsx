import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Swal from 'sweetalert2'; 
import Select from 'react-select';

// --- COMPOSANT DE CHARGEMENT RÉUTILISABLE ---
const LoaderOverlay = ({ message = "Chargement..." }) => (
    <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center" 
         style={{ backgroundColor: 'rgba(255,255,255,0.7)', zIndex: 10, borderRadius: '20px', backdropFilter: 'blur(2px)' }}>
        <div className="spinner-border text-success mb-2" role="status" style={{ width: '1.5rem', height: '1.5rem' }}></div>
        <span className="small fw-bold text-muted">{message}</span>
    </div>
);

const Budgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFormModal, setShowFormModal] = useState(false);

    const [notification, setNotification] = useState({ show: false, msg: '', type: 'success' });
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const [formData, setFormData] = useState({
        category_id: '',
        amount_limit: '',
        period: 'mensuel',
        start_date: new Date().toISOString().split('T')[0]
    });

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        successGreen: '#198754',
        dangerRed: '#dc3545',
        warningYellow: '#ffc107'
    };

    const showToast = (msg, type = 'success') => {
        setNotification({ show: true, msg, type });
        setTimeout(() => setNotification({ show: false, msg: '', type: 'success' }), 4000);
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [budgetsRes, categoriesRes] = await Promise.all([
                api.get('/budgets'),
                api.get('/categories')
            ]);
            setBudgets(budgetsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            showToast("Erreur lors du chargement des données", "danger");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleQuickCategoryAdd = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const res = await api.post('/categories', { 
                nom: newCategoryName,
                type: 'depense' 
            });
            setCategories([...categories, res.data]);
            setFormData({ ...formData, category_id: res.data.id });
            setNewCategoryName('');
            setIsAddingCategory(false);
            showToast(`Catégorie "${res.data.nom}" créée !`);
        } catch (err) {
            showToast("Impossible de créer la catégorie", "danger");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/budgets', formData);
            fetchData();
            setFormData({ 
                category_id: '', 
                amount_limit: '', 
                period: 'mensuel',
                start_date: new Date().toISOString().split('T')[0]
            });
            setShowFormModal(false);
            showToast("Objectif de budget défini avec succès !");
        } catch (error) {
            showToast("Erreur lors de la création du budget", "danger");
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Supprimer ce budget ?',
            text: "Cette action est irréversible.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: colors.orange,
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            customClass: { popup: 'rounded-4 shadow-lg border-0' }
        });

        if (result.isConfirmed) {
            const previousBudgets = [...budgets];
            setBudgets(budgets.filter(b => b.id !== id));
            try {
                await api.delete(`/budgets/${id}`);
                Swal.fire({ title: 'Supprimé !', icon: 'success', timer: 1500, showConfirmButton: false });
            } catch (error) {
                setBudgets(previousBudgets);
                showToast("Échec de la suppression.", "danger");
            }
        }
    };

    const calculateProgress = (spent, limit) => {
        const percentage = (spent / limit) * 100;
        return Math.min(percentage, 100).toFixed(0);
    };

    return (
        <div className="container-fluid px-0 px-md-1 py-3 position-relative mb-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            {notification.show && (
                <div className={`alert alert-${notification.type} border-0 shadow-lg position-fixed top-0 start-50 translate-middle-x mt-4`} 
                     style={{ zIndex: 9999, borderRadius: '50px', padding: '10px 25px' }}>
                    <i className={`bi bi-${notification.type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'} me-2`}></i>
                    {notification.msg}
                </div>
            )}

            {/* HEADER - Toujours visible */}
            <div className="row mb-4 align-items-center">
                <div className="col-md-8 text-start">
                    <h2 className="fw-bold h-auto mb-4" style={{ color: colors.darkGreen }}>
                        <i className="bi bi-piggy-bank fs-3 me-2"></i>Budgets & Objectifs
                    </h2>
                    <p className="text-muted small">Contrôlez vos dépenses pour mieux épargner.</p>
                </div>
                <div className="col-md-4 text-md-end text-start">
                    <button 
                        className="btn text-white fw-bold px-4 py-2 shadow-sm rounded-pill transition-all" 
                        style={{ backgroundColor: colors.orange }}
                        onClick={() => setShowFormModal(true)}
                    >
                        <i className="bi bi-plus-lg me-2"></i>Nouveau Budget
                    </button>
                </div>
            </div>

            {/* MODAL FORMULAIRE */}
            {showFormModal && (
                <div className="modal d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
                            <div className="modal-header border-0 pt-4 px-4">
                                <h5 className="fw-bold mb-0">Définir une limite</h5>
                                <button type="button" className="btn-close" onClick={() => setShowFormModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    <div className="mb-3 text-start">
                                        <label className="form-label small fw-bold text-muted">Catégorie</label>
                                        {!isAddingCategory ? (
                                            <div className="input-group">
                                                <Select
                                                    options={categories.map(c => ({ value: c.id, label: c.nom || c.name }))}
                                                    onChange={(selected) => setFormData({...formData, category_id: selected.value})}
                                                    placeholder="Sélectionner..."
                                                    className="flex-grow-1"
                                                    value={categories.find(c => c.id === formData.category_id) ? { value: formData.category_id, label: categories.find(c => c.id === formData.category_id).nom } : null}
                                                />
                                                <button type="button" className="btn btn-light border" onClick={() => setIsAddingCategory(true)}>
                                                    <i className="bi bi-plus-lg text-success"></i>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="input-group">
                                                <input type="text" className="form-control" placeholder="Nom..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} autoFocus />
                                                <button type="button" className="btn btn-success" onClick={handleQuickCategoryAdd}><i className="bi bi-check"></i></button>
                                                <button type="button" className="btn btn-danger" onClick={() => setIsAddingCategory(false)}><i className="bi bi-x"></i></button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mb-3 text-start">
                                        <label className="form-label small fw-bold text-muted">Montant Limite (FCFA)</label>
                                        <input type="number" className="form-control rounded-3 bg-light border-0 shadow-none" placeholder="Ex: 50000" value={formData.amount_limit} onChange={(e) => setFormData({...formData, amount_limit: e.target.value})} required />
                                    </div>
                                    <div className="mb-3 text-start">
                                        <label className="form-label small fw-bold text-muted">Fréquence</label>
                                        <select className="form-select rounded-3 bg-light border-0 shadow-none" value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})}>
                                            <option value="hebdomadaire">Hebdomadaire</option>
                                            <option value="mensuel">Mensuel</option>
                                            <option value="annuel">Annuel</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 p-4 pt-0">
                                    <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setShowFormModal(false)}>Annuler</button>
                                    <button type="submit" className="btn text-white fw-bold px-4 rounded-pill" style={{ backgroundColor: colors.orange }}>Enregistrer</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENU PRINCIPAL */}
            <div className="col-12 position-relative" style={{ minHeight: '400px' }}>
                <h5 className="fw-bold text-start mb-3">Suivi en temps réel</h5>
                
                {/* Loader spécifique à la liste des budgets */}
                {loading && <LoaderOverlay message="Chargement de vos objectifs..." />}

                {/* État vide (affiché uniquement si non chargement) */}
                {!loading && budgets.length === 0 ? (
                    <div className="card border-0 shadow-sm py-5 text-center" style={{ borderRadius: '20px' }}>
                        <i className="bi bi-shield-lock fs-1 text-muted opacity-25"></i>
                        <p className="text-muted mt-3">Aucun budget défini.</p>
                    </div>
                ) : (
                    <div className="row g-3">
                        {(loading && budgets.length === 0 ? [1, 2] : budgets).map((budget, index) => {
                            // Si on charge et qu'on n'a pas encore de données, on affiche des cartes vides "Skeleton"
                            if (loading && budgets.length === 0) return (
                                <div className="col-12 col-md-6" key={index}>
                                    <div className="card border-0 shadow-sm h-100 p-4" style={{ borderRadius: '18px', height: '200px', backgroundColor: '#fff', opacity: 0.6 }}></div>
                                </div>
                            );

                            const progress = calculateProgress(budget.current_spent, budget.amount_limit);
                            const isOver = progress >= 100;
                            return (
                                <div className="col-12 col-md-6 text-start" key={budget.id}>
                                    <div className="card border-0 shadow-sm h-100 transition-hover" style={{ borderRadius: '18px' }}>
                                        <div className="card-body p-4">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div>
                                                    <h6 className="fw-bold mb-0">{budget.category?.nom || 'Général'}</h6>
                                                    <span className="badge rounded-pill bg-light text-muted fw-normal" style={{ fontSize: '0.7rem' }}>
                                                        <i className="bi bi-calendar3 me-1"></i>{budget.period.toUpperCase()}
                                                    </span>
                                                </div>
                                                <button className="btn btn-sm btn-light text-danger rounded-circle" onClick={() => handleDelete(budget.id)}>
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>

                                            <div className="mt-4 mb-2 d-flex justify-content-between align-items-end">
                                                <div className="small">
                                                    <span className="fw-bold fs-5">{Number(budget.current_spent).toLocaleString()}</span>
                                                    <span className="text-muted"> / {Number(budget.amount_limit).toLocaleString()} F</span>
                                                </div>
                                                <span className={`fw-bold ${isOver ? 'text-danger' : 'text-success'}`}>{progress}%</span>
                                            </div>

                                            <div className="progress mb-4" style={{ height: '10px', borderRadius: '10px', backgroundColor: '#f0f0f0', position: 'relative', overflow: 'visible' }}>
                                                <div 
                                                    className={`progress-bar progress-bar-striped progress-bar-animated ${progress > 90 ? 'bg-danger' : progress > 70 ? 'bg-warning' : 'bg-success'}`} 
                                                    style={{ width: `${progress}%`, borderRadius: '10px', zIndex: 2 }}
                                                ></div>
                                                
                                                {[25, 50, 75].map((mark) => (
                                                    <div 
                                                        key={mark}
                                                        style={{
                                                            position: 'absolute',
                                                            left: `${mark}%`,
                                                            top: '0',
                                                            width: '2px',
                                                            height: '100%',
                                                            backgroundColor: 'rgba(0,0,0,0.1)',
                                                            zIndex: 3,
                                                            pointerEvents: 'none'
                                                        }}
                                                    >
                                                        <span style={{ 
                                                            position: 'absolute', 
                                                            top: '12px', 
                                                            left: '-10px', 
                                                            fontSize: '8px', 
                                                            color: '#aaa',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {mark}%
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-3 p-2 rounded-3 bg-light d-flex align-items-center">
                                                <i className={`bi bi-${isOver ? 'exclamation-circle-fill text-danger' : 'check-circle-fill text-success'} me-2`}></i>
                                                <span className="small fw-medium">
                                                    {isOver ? 'Budget limite atteint !' : `Encore ${Number(budget.amount_limit - budget.current_spent).toLocaleString()} F disponible`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style>{`
                .transition-all { transition: all 0.3s ease; }
                .transition-hover:hover { transform: translateY(-5px); transition: all 0.3s ease; }
                .btn:active { transform: scale(0.95); }
            `}</style>
        </div>
    );
};

export default Budgets;