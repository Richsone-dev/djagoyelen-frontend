import { useEffect, useState, useCallback, useMemo } from 'react';
import api from '../api/axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import logo from '../assets/djago-logo.jpeg';
import Select from 'react-select';
import Swal from 'sweetalert2';

const Transactions = () => {

    // --- ÉTATS ---
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [filterType, setFilterType] = useState('tous');
    const [filterCategory, setFilterCategory] = useState('tous');
    const [filterDate, setFilterDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    // --- FETCH DATA ---
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [transRes, catRes] = await Promise.all([
                api.get('/transactions'),
                api.get('/categories')
            ]);

            let data = Array.isArray(transRes.data) ? transRes.data : [];

            // ✅ TRI DU PLUS RÉCENT AU PLUS ANCIEN
            data = data.sort((a, b) => new Date(b.date) - new Date(a.date));

            setTransactions(data);
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

    // --- SOLDE ---
    const soldeActuel = useMemo(() => {
        return transactions.reduce((acc, t) => {
            const montant = Number(t.montant);
            return t.type === 'revenu' ? acc + montant : acc - montant;
        }, 0);
    }, [transactions]);

    // --- FILTRE + TRI ---
    const filteredTransactions = useMemo(() => {
        return transactions
            .filter(t => {
                const matchType = filterType === 'tous' || t.type === filterType;
                const matchCategory = filterCategory === 'tous' || String(t.category_id) === String(filterCategory);
                const matchDate = !filterDate || t.date.startsWith(filterDate);
                const matchSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase());
                return matchType && matchCategory && matchDate && matchSearch;
            })
            // ✅ TRI APRÈS FILTRE AUSSI
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [transactions, filterType, filterCategory, filterDate, searchTerm]);

    // --- AJOUT CATÉGORIE ---
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

    // --- SUBMIT (UNE SEULE VERSION CORRIGÉE) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            const dataToSubmit = {
                ...formData,
                montant: Number(formData.montant)
            };

            if (formData.id) {
                await api.put(`/transactions/${formData.id}`, dataToSubmit);
            } else {
                await api.post('/transactions', dataToSubmit);
            }

            Swal.fire({
                icon: 'success',
                title: 'Enregistré !',
                showConfirmButton: false,
                timer: 1500,
                toast: true,
                position: 'top-end'
            });

            setShowModal(false);
            fetchData();
            resetForm();

        } catch (err) {
            if (err.response?.status === 403) {
                setErrorMsg(err.response.data.message);
                Swal.fire({
                    title: 'Budget atteint !',
                    text: err.response.data.message,
                    icon: 'warning'
                });
            } else if (err.response?.status === 422) {
                setErrorMsg("Veuillez vérifier les informations.");
            } else {
                Swal.fire('Erreur', "Problème lors de l'enregistrement.", 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Action irréversible",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: colors.dangerRed
        });

        if (result.isConfirmed) {
            await api.delete(`/transactions/${id}`);
            fetchData();
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
        setShowModal(true);
    };

    const isSubmitDisabled =
        formData.type === 'depense' &&
        soldeActuel < Number(formData.montant) &&
        !formData.id;

    // --- UI ---
    return (
        <div className="container-fluid py-4">

            <h4 className="fw-bold mb-3">Transactions</h4>

            <div className="card shadow-sm">
                <div className="table-responsive">
                    <table className="table table-hover">
                        <tbody>
                            {loading ? (
                                <tr><td>Chargement...</td></tr>
                            ) : filteredTransactions.length > 0 ? (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id}>
                                        <td>
                                            <b>{t.description}</b><br />
                                            <small>{new Date(t.date).toLocaleDateString()}</small>
                                        </td>
                                        <td className={t.type === 'revenu' ? 'text-success' : 'text-danger'}>
                                            {t.type === 'revenu' ? '+' : '-'} {t.montant}
                                        </td>
                                        <td>
                                            <button onClick={() => handleEdit(t)}>✏️</button>
                                            <button onClick={() => handleDelete(t.id)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td>Aucune transaction</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transactions;