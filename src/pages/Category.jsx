import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

// Importation de votre hook de contexte (Ajustez le chemin selon votre structure)
import { useTheme } from '../context/ThemeContext'; 

import {
    Tag, ShoppingBag, CreditCard, Wrench, HelpCircle, Car, Utensils, 
    HeartPulse, Tv, Coffee, Zap, Home, Plane, Briefcase, 
    GraduationCap, Plus, Edit, Trash2, Loader2, Bike, 
    Motorbike, TrendingUp, TrendingDown, LayoutGrid, X, Music, Film, Book, Gamepad, Camera, Gift, Heart, Star, User, Users,
    PiggyBank, Banknote, Receipt, Wallet, Landmark, Smartphone, Wifi, Droplets, Flame, Truck, ShieldCheck, Stethoscope, ShoppingCart, 
    Shirt, Dumbbell, Wine, Brush, Hammer, Globe, Coins, Computer, SquareCenterlineDashedVertical, Phone, Sword, SquareRoundCorner
} from 'lucide-react';

const Category = () => {
    // =========================
    // THEME CONTEXT
    // =========================
    // On récupère l'état du thème (ex: true pour sombre, false pour clair)
    const { isDarkMode } = useTheme(); 

    // =========================
    // STATES
    // =========================
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const [formData, setFormData] = useState({
        nom: '',
        type: 'depense',
        icone: 'Tag'
    });

    // Écouteur du redimensionnement d'écran
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // =========================
    // COLORS & THEME CONFIG
    // =========================
    const colors = useMemo(() => {
        return {
            primary: '#0A3B2F',
            secondary: '#146551',
            successGreen: '#28a745',
            dangerRed: '#dc3545',
            orange: '#E97223',
            // Changements dynamiques basés sur le mode
            bg: isDarkMode ? '#111827' : '#F5F7F9',
            cardBg: isDarkMode ? '#1F2937' : '#FFFFFF',
            text: isDarkMode ? '#F9FAFB' : '#1F2937',
            muted: isDarkMode ? '#9CA3AF' : '#6B7280',
            border: isDarkMode ? '#374151' : '#E5E7EB',
            inputBg: isDarkMode ? '#374151' : '#F3F4F6',
            lightOrange: isDarkMode ? 'rgba(233, 114, 35, 0.15)' : '#FFF3EB',
            lightGreen: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#ECFDF5',
        };
    }, [isDarkMode]);

    const availableIcons = {
        Tag, Alimentation: Utensils, Shopping: ShoppingBag, Cafe: Coffee,
        Transport: Car, Voyage: Plane, Moto: Motorbike, Velo: Bike,
        Logement: Home, Energie: Zap, Services: Wrench, Sante: HeartPulse,
        Loisirs: Tv, Education: GraduationCap, Banque: CreditCard,
        Travail: Briefcase, Autre: HelpCircle, Musique: Music, Film: Film, 
        Livre: Book, Jeux: Gamepad, Photo: Camera, Cadeau: Gift, Amour: Heart, 
        Etoile: Star, Personne: User, Groupe: Users,
        Economie: PiggyBank, Argent: Banknote, Facture: Receipt, Portefeuille: Wallet,
        Landmark: Landmark, Mobile: Smartphone, Internet: Wifi, Eau: Droplets, Gaz: Flame,
        Livraison: Truck, Assurance: ShieldCheck, Soin: Stethoscope, Courses: ShoppingCart,
        Vetements: Shirt, Sport: Dumbbell, Sorties: Wine, Maison: Brush, Travaux: Hammer,
        International: Globe, Passif: Coins, Informatique: Computer, AutreModerne: SquareCenterlineDashedVertical,
        Phone: Phone, Sword: Sword, SquareRoundCorner: SquareRoundCorner
    };

    const api = useMemo(() => axios.create({
        baseURL: 'https://djagoyelen-backend.onrender.com/api',
        //baseURL: 'http://localhost:8000/api',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    }), []);

    const fetchCategories = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/categories');
            const data = Array.isArray(response.data) ? response.data : response.data.categories || [];
            setCategories(data);
        } catch (error) {
            Swal.fire({ 
                icon: 'error', 
                title: 'Erreur', 
                text: "Impossible de charger les catégories.",
                background: colors.cardBg,
                color: colors.text
            });
        } finally {
            setLoading(false);
        }
    }, [api, colors.cardBg, colors.text]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nom.trim()) return;
        try {
            Swal.fire({ 
                title: editingCategory ? 'Enregistrement...' : 'Création...', 
                allowOutsideClick: false, 
                background: colors.cardBg,
                color: colors.text,
                didOpen: () => Swal.showLoading() 
            });
            setIsSubmitting(true);
            const payload = { ...formData, nom: formData.nom.trim() };
            if (editingCategory) {
                const res = await api.put(`/categories/${editingCategory.id}`, payload);
                const updated = res.data.category || res.data;
                setCategories(prev => prev.map(c => c.id === editingCategory.id ? updated : c));
            } else {
                const res = await api.post('/categories', payload);
                const newCat = res.data.category || res.data;
                setCategories(prev => [newCat, ...prev]);
            }
            closeModal();
            Swal.fire({ icon: 'success', title: 'Succès', timer: 1500, showConfirmButton: false, background: colors.cardBg, color: colors.text });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Erreur', text: "Action échouée", background: colors.cardBg, color: colors.text });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Supprimer ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: colors.dangerRed,
            confirmButtonText: 'Oui',
            background: colors.cardBg,
            color: colors.text
        });
        if (result.isConfirmed) {
            try {
                Swal.fire({ title: 'Suppression...', allowOutsideClick: false, background: colors.cardBg, color: colors.text, didOpen: () => Swal.showLoading() });
                await api.delete(`/categories/${id}`);
                setCategories(prev => prev.filter(c => c.id !== id));
                Swal.close();
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Erreur', background: colors.cardBg, color: colors.text });
            }
        }
    };

    const openCreateModal = () => {
        setEditingCategory(null);
        setFormData({ nom: '', type: 'depense', icone: 'Tag' });
        setIsModalOpen(true);
    };

    const openEditModal = (cat) => {
        setEditingCategory(cat);
        setFormData({ nom: cat.nom, type: cat.type, icone: cat.icone });
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const revenusCount = categories.filter(c => c.type === 'revenu').length;
    const depensesCount = categories.filter(c => c.type === 'depense').length;

    return (
        <div className="min-vh-100 py-1 mb-5 py-md-1 px-md-1 transition-all" >
            <div className="container-fluid" style={{ maxWidth: '1200px' }}>
                
                {/* HEADER RESPONSIVE */}
                <div className="rounded-4 rounded-md-5 p-4 mb-4 shadow-lg text-white" 
                     style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                    <div className="row align-items-center g-3">
                        <div className="col-12 col-md-8 text-center text-md-start">
                            <div className="d-flex flex-column flex-md-row align-items-center gap-3">
                                <div className="p-3 m-2 rounded-4 bg-white bg-opacity-10 backdrop-blur d-sm-block">
                                    <LayoutGrid size={isMobile ? 20 : 28} />
                                </div>
                                <div className='m-1'>
                                    <h1 className="fw-bold mb-1 h3 h1-md">Mes Catégories</h1>
                                    <p className="opacity-75 mb-0 small">Gérez vos revenus et dépenses sur DjagoYelen</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <button onClick={openCreateModal} className="btn btn-lg rounded-pill w-100 w-md-auto px-4 shadow border-0 fw-bold float-md-end transition-all"
                                    style={{ backgroundColor: colors.orange, color: 'white' }}>
                                <Plus size={20} className="me-2" /> Nouvelle
                            </button>
                        </div>
                    </div>
                </div>

                {/* STATS QUICK VIEW */}
                <div className="row g-2 g-md-3 mb-4">
                    {[
                        { label: 'Total', count: categories.length, icon: Tag, color: '#4F46E5', bg: isDarkMode ? 'rgba(79, 70, 229, 0.15)' : '#EEF2FF' },
                        { label: 'Revenus', count: revenusCount, icon: TrendingUp, color: '#10B981', bg: colors.lightGreen },
                        { label: 'Dépenses', count: depensesCount, icon: TrendingDown, color: '#EF4444', bg: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2' }
                    ].map((stat, i) => (
                        <div key={i} className="col-4">
                            <motion.div 
                                whileHover={{ y: -2 }}
                                className="card border-0 shadow-sm rounded-4 p-2 p-md-3 h-100 border-start border-4"
                                style={{  
                                    borderLeftColor: stat.color,
                                    borderColor: colors.border
                                }}
                            >
                                <div className="d-flex flex-column flex-md-row align-items-center justify-content-md-between gap-2">
                                    <div className="text-md-start">
                                        <div className="text-uppercase fw-bold mb-1 d-none d-md-block" 
                                             style={{ fontSize: '0.80rem', letterSpacing: '0.5px', color: colors.muted }}>
                                            {stat.label}
                                        </div>
                                        <div className="h4 fw-bold mb-0" >
                                            {stat.count}
                                        </div>
                                        <div className="fw-medium d-md-none" style={{ fontSize: '0.75rem' }}>
                                            {stat.label}
                                        </div>
                                    </div>
                                    
                                    <div className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                                         style={{ 
                                             width: '38px', 
                                             height: '38px', 
                                             backgroundColor: stat.bg,
                                             color: stat.color,
                                             marginTop: '4px'
                                         }}
                                    >
                                        <stat.icon size={18} strokeWidth={2.5} />
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>

                {/* CONTENT */}
                {loading ? (
                    <div className="row g-3 g-md-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="col-12 col-sm-6 col-lg-4">
                                <div className="card border-0 shadow-sm rounded-4 overflow-hidden animate-pulse" style={{ height: '100px'}}>
                                    <div className="card-body d-flex align-items-center">
                                        <div className="rounded-4 me-3" style={{ width: '50px', height: '50px', backgroundColor: colors.inputBg }} />
                                        <div className="flex-grow-1">
                                            <div className="rounded mb-2" style={{ width: '60%', height: '15px', backgroundColor: colors.inputBg }} />
                                            <div className="rounded" style={{ width: '30%', height: '10px', backgroundColor: colors.inputBg }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="row g-3 g-md-4">
                        {categories.map((cat) => {
                            const Icon = availableIcons[cat.icone] || Tag;
                            const isRevenu = cat.type === 'revenu';
                            const themeColor = isRevenu ? '#10B981' : colors.orange;
                            const bgColor = isRevenu ? colors.lightGreen : colors.lightOrange;

                            return (
                                <motion.div 
                                    key={cat.id} 
                                    className="col-12 col-sm-6 col-lg-4"
                                    whileHover={{ y: -5 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 transition-all hover-shadow" style={{ border: `1px solid ${colors.border}` }}>
                                        <div className="d-flex align-items-center p-3 p-md-3 justify-content-between">
                                            <div className="d-flex align-items-center overflow-hidden">
                                                <div className="rounded-4 d-flex align-items-center justify-content-center me-3 shadow-sm flex-shrink-0" 
                                                     style={{ 
                                                         width: '56px', 
                                                         height: '56px', 
                                                         background: bgColor,
                                                         color: themeColor,
                                                     }}
                                                >
                                                    <Icon size={20} strokeWidth={2} />
                                                </div>
                                                
                                                <div className="overflow-hidden">
                                                    <h6 className="fw-bold mb-1 text-truncate" style={{ fontSize: '1.25rem' }}>
                                                        {cat.nom}
                                                    </h6>
                                                    <span className="badge rounded-pill fw-medium" 
                                                          style={{ 
                                                              fontSize: '0.65rem', 
                                                              backgroundColor: bgColor, 
                                                              color: themeColor,
                                                              letterSpacing: '0.5px',
                                                              textTransform: 'uppercase',
                                                          }}
                                                    >
                                                        {cat.type}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="btn-group flex-shrink-0">
                                                <button onClick={() => openEditModal(cat)} 
                                                        className="btn btn-link p-2 rounded-circle hover-primary transition-all"
                                                        style={{ color: colors.muted }}
                                                        title="Modifier">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(cat.id)} 
                                                        className="btn btn-link p-2 rounded-circle hover-danger transition-all"
                                                        style={{ color: colors.dangerRed }}
                                                        title="Supprimer">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* MODAL / BOTTOM SHEET RESPONSIVE */}
                <AnimatePresence>
                {isModalOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div 
                            className="fixed inset-0" 
                            style={{ 
                                backgroundColor: 'rgba(0,0,0,0.6)', 
                                position: 'fixed', 
                                top: 0, left: 0, right: 0, bottom: 0, 
                                backdropFilter: 'blur(4px)',
                                zIndex: 999
                            }}
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={closeModal} 
                        />

                        {/* Form Container */}
                        <motion.div 
                            className="fixed shadow-2xl"
                            style={{ 
                                position: 'fixed',
                                zIndex: 1000,
                                display: 'flex',
                                backgroundColor: colors.bg,
                                color: colors.text, // Assure la couleur de texte par défaut du conteneur
                                flexDirection: 'column',
                                border: `1px solid ${colors.border}`,
                                ...(window.innerWidth > 768 ? {
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '500px',
                                    maxHeight: '80vh',
                                    borderRadius: '1.5rem',
                                } : {
                                    bottom: 0, left: 0, right: 0,
                                    borderTopLeftRadius: '2rem',
                                    borderTopRightRadius: '2rem',
                                    maxHeight: '92vh',
                                })
                            }}
                            initial={window.innerWidth > 768 ? { opacity: 0, scale: 0.9, x: "-50%", y: "-45%" } : { y: "100%" }}
                            animate={window.innerWidth > 768 ? { opacity: 1, scale: 1, x: "-50%", y: "-50%" } : { y: 0 }}
                            exit={window.innerWidth > 768 ? { opacity: 0, scale: 0.9 } : { y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 250 }}
                        >
                            
                            {/* Mobile Handle Bar */}
                            <div className="p-1 d-md-none" onClick={closeModal} style={{ cursor: 'pointer' }}>
                                <div className="mx-auto my-2" style={{ width: '40px', height: '5px', backgroundColor: colors.border, borderRadius: '10px' }} />
                            </div>

                            <form onSubmit={handleSubmit} className="d-flex flex-column h-100 overflow-hidden">
                                <div className="px-4 py-4 overflow-auto" style={{ flex: 1 }}>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h2 className="fw-bold h5 mb-0" style={{ color: colors.text }}>
                                            {editingCategory ? 'Modifier la catégorie' : 'Nouvelle Catégorie'}
                                        </h2>
                                        <button 
                                            type="button" 
                                            onClick={closeModal} 
                                            className={`btn-close ${isDarkMode ? 'btn-close-white' : ''} shadow-none`}
                                        ></button>
                                    </div>

                                    {/* Form Fields */}
                                    <div className="mb-3 text-start">
                                        <label className="form-label small fw-bold" style={{ color: colors.muted }}>NOM</label>
                                        <input 
                                            type="text" 
                                            className="form-control form-control-lg border-0 shadow-none"
                                            style={{ backgroundColor: colors.inputBg, color: colors.text }}
                                            value={formData.nom} 
                                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })} 
                                            required 
                                        />
                                    </div>

                                    <div className="mb-3 text-start">
                                        <label className="form-label small fw-bold" style={{ color: colors.muted }}>TYPE</label>
                                        <select 
                                            className="form-select form-select-lg border-0 shadow-none" 
                                            style={{ backgroundColor: colors.inputBg, color: colors.text }}
                                            value={formData.type} 
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="depense" style={{ backgroundColor: colors.inputBg, color: colors.text }}>Dépense</option>
                                            <option value="revenu" style={{ backgroundColor: colors.inputBg, color: colors.text }}>Revenu</option>
                                        </select>
                                    </div>

                                    <div className="text-start mb-2">
                                        <label className="form-label small fw-bold" style={{ color: colors.muted }}>ICÔNE</label>
                                    </div>
                                    <div className="row g-2 overflow-auto mb-2" style={{ maxHeight: '200px' }}>
                                        {Object.entries(availableIcons).map(([name, Icon]) => (
                                            <div key={name} className="col-3 col-md-2">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setFormData({ ...formData, icone: name })}
                                                    className="btn w-100 py-3 rounded-3 border-0 transition-all d-flex align-items-center justify-content-center"
                                                    style={{ 
                                                        backgroundColor: formData.icone === name ? colors.orange : colors.inputBg,
                                                        color: formData.icone === name ? '#FFFFFF' : colors.text
                                                    }}
                                                >
                                                    <Icon size={20} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Form Footer */}
                                <div className="p-3 border-top d-flex gap-2" style={{ borderColor: colors.border, backgroundColor: colors.cardBg || colors.bg }}>
                                    <button 
                                        type="button" 
                                        onClick={closeModal} 
                                        className="btn rounded-pill flex-grow-1 py-2 fw-bold border-0" 
                                        style={{ backgroundColor: colors.inputBg, color: colors.text }}
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting} 
                                        className="btn rounded-pill flex-grow-1 py-2 text-white fw-bold border-0"
                                        style={{ backgroundColor: colors.orange }}
                                    >
                                        {isSubmitting ? 'Chargement...' : (editingCategory ? 'Enregistrer' : 'Créer')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
                </AnimatePresence>
            </div>

            {/* CSS additionnel dynamique */}
            <style>{`
                .hover-shadow:hover {
                    box-shadow: ${isDarkMode ? '0 10px 25px -5px rgba(0, 0, 0, 0.5)' : '0 10px 25px -5px rgba(0, 0, 0, 0.1)'} !important;
                }
                .hover-primary:hover {
                    background-color: ${isDarkMode ? 'rgba(59, 130, 246, 0.15)' : '#f0f7ff'} !important;
                    color: #3b82f6 !important;
                }
                .hover-danger:hover {
                    background-color: ${isDarkMode ? 'rgba(220, 53, 69, 0.15)' : '#fff5f5'} !important;
                    color: #dc3545 !important;
                }
                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: .4; }
                }
                .backdrop-blur { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
                @media (max-width: 576px) {
                    h1 { font-size: 1.5rem !important; }
                }
            `}</style>
        </div>
    );
};

export default Category;