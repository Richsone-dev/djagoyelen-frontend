import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { motion, AnimatePresence } from 'framer-motion';

import {
    // --- Vos icônes actuelles ---
    Tag, ShoppingBag, CreditCard, Wrench, HelpCircle, Car, Utensils, 
    HeartPulse, Tv, Coffee, Zap, Home, Plane, Briefcase, 
    GraduationCap, Plus, Edit, Trash2, Loader2, Bike, 
    Motorbike, TrendingUp, TrendingDown, LayoutGrid, X, Music, Film, Book, Gamepad, Camera, Gift, Heart, Star, User, Users,

    // --- 20 nouvelles icônes utiles ---
    PiggyBank,      // Épargne / Économies
    Banknote,       // Argent liquide / Cash
    Receipt,        // Factures / Reçus
    Wallet,         // Portefeuille / Budget personnel
    Landmark,       // Banque / Institutions / État
    Smartphone,     // Forfait mobile / Abonnements tech
    Wifi,           // Internet / Télécoms
    Droplets,       // Eau / Services publics
    Flame,          // Gaz / Chauffage
    Truck,          // Livraison / Logistique
    ShieldCheck,    // Assurances / Sécurité
    Stethoscope,    // Consultations médicales / Soins
    ShoppingCart,   // Courses / Supermarché
    Shirt,          // Vêtements / Mode
    Dumbbell,       // Sport / Salle de gym
    Wine,           // Sorties / Restaurants / Alcool
    Brush,          // Décoration / Entretien maison
    Hammer,         // Travaux / Réparations lourdes
    Globe,          // Services en ligne / International
    Coins,           // Revenus passifs / Dividendes / Monnaie
    Computer,   // Matériel informatique / Logiciels
    SquareCenterlineDashedVertical, // Catégorie "Autre" moderne
} from 'lucide-react';
import { Colors } from 'chart.js';

const Category = () => {
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

    // =========================
    // COLORS & THEME
    // =========================
    const colors = {
        primary: '#0A3B2F',
        secondary: '#146551',
        successGreen: '#28a745',
        dangerRed: '#dc3545',
        orange: '#E97223',
        lightOrange: '#FFF3EB',
        bg: '#F5F7F9',
        white: '#FFFFFF',
        text: '#1F2937',
        muted: '#6B7280'
    };

    const availableIcons = {
        Tag, Alimentation: Utensils, Shopping: ShoppingBag, Cafe: Coffee,
        Transport: Car, Voyage: Plane, Moto: Motorbike, Velo: Bike,
        Logement: Home, Energie: Zap, Services: Wrench, Sante: HeartPulse,
        Loisirs: Tv, Education: GraduationCap, Banque: CreditCard,
        Travail: Briefcase, Autre: HelpCircle, Musique: Music, Film: Film, 
        Livre: Book, Jeux: Gamepad, Photo: Camera, Cadeau: Gift, Amour: Heart, 
        Etoile: Star, Personne: User, Groupe: Users,
        Economie: PiggyBank, Argent: Banknote, Facture: Receipt, Portefeuille: Wallet,
        Banque: Landmark, Mobile: Smartphone, Internet: Wifi, Eau: Droplets, Gaz: Flame,
        Livraison: Truck, Assurance: ShieldCheck, Soin: Stethoscope, Courses: ShoppingCart,
        Vetements: Shirt, Sport: Dumbbell, Sorties: Wine, Maison: Brush, Travaux: Hammer,
        International: Globe, Passif: Coins, Informatique: Computer, AutreModerne: SquareCenterlineDashedVertical
    };

    const api = useMemo(() => axios.create({
        baseURL: 'https://djagoyelen-backend.onrender.com/api' || 'http://localhost:8000/api',
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
            Swal.fire({ icon: 'error', title: 'Erreur', text: "Impossible de charger les catégories." });
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nom.trim()) return;
        try {
            Swal.fire({ title: editingCategory ? 'Enregistrement...' : 'Création...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
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
            Swal.fire({ icon: 'success', title: 'Succès', timer: 1500, showConfirmButton: false });
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Erreur', text: "Action échouée" });
        } finally {
            setIsSubmitting(false);
        }
        await Swal.close();
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Supprimer ?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            confirmButtonText: 'Oui'
        });
        if (result.isConfirmed) {
            try {
                Swal.fire({ title: 'Suppression...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
                await api.delete(`/categories/${id}`);
                setCategories(prev => prev.filter(c => c.id !== id));
            } catch (error) {
                Swal.fire({ icon: 'error', title: 'Erreur' });
            }
            await Swal.close();
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
        <div className="min-vh-100 py-3 mb-5 py-md-2 px-md-1" style={{ backgroundColor: colors.bg }}>
            <div className="container-fluid" style={{ maxWidth: '1200px' }}>
                
                {/* HEADER RESPONSIVE */}
                <div className="rounded-4 rounded-md-5 p-4 mb-4 shadow-lg text-white" 
                     style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}>
                    <div className="row align-items-center g-3">
                        <div className="col-12 col-md-8 text-center text-md-start">
                            <div className="d-flex flex-column flex-md-row align-items-center gap-3">
                                <div className="p-3 m-2 rounded-4 bg-white bg-opacity-10 backdrop-blur d-sm-block">
                                    <LayoutGrid  size={isMobile? 20: 28} padding={isMobile? 1: 3}/>
                                </div>
                                <div className='m-1'>
                                    <h1 className="fw-bold mb-1 h3 h1-md">Mes Catégories</h1>
                                    <p className="opacity-75 mb-0 small">Gérez vos revenus et dépenses</p>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <button onClick={openCreateModal} className="btn btn-lg rounded-pill w-100 w-md-auto px-4 shadow border-0 fw-bold float-md-end"
                                    style={{ backgroundColor: colors.orange, color: 'white' }}>
                                <Plus size={20} className="me-2" /> Nouvelle
                            </button>
                        </div>
                    </div>
                </div>

                {/* STATS QUICK VIEW - Design Modernisé */}
<div className="row g-2 g-md-3 mb-4">
    {[
        { label: 'Total', count: categories.length, icon: Tag, color: '#4F46E5', bg: '#EEF2FF' },
        { label: 'Revenus', count: revenusCount, icon: TrendingUp, color: '#10B981', bg: '#ECFDF5' },
        { label: 'Dépenses', count: depensesCount, icon: TrendingDown, color: '#EF4444', bg: '#FEF2F2' }
    ].map((stat, i) => (
        <div key={i} className="col-4">
            <motion.div 
                whileHover={{ y: -2 }}
                className="card border-0 shadow-sm rounded-4 p-2 p-md-3 h-100 border-start border-4"
                style={{ borderLeftColor: stat.color + ' !important' }}
            >
                <div className="d-flex flex-column flex-md-row align-items-center justify-content-md-between gap-2">
                    <div className="text-md-start">
                        <div 
                            className="text-muted text-uppercase fw-bold mb-1 d-none d-md-block" 
                            style={{ fontSize: '0.80rem', letterSpacing: '0.5px' }}
                        >
                            {stat.label}
                            
                        </div>
                        <div className="h4 fw-bold mb-0" style={{ color: '#1F2937' }}>
                            {stat.count}
                        </div>
                        {/* Label version mobile (plus petit) */}
                        <div className="text-muted fw-medium d-md-none" style={{ fontSize: '0.55rem' }}>
                            {stat.label}
                        </div>
                    </div>
                    
                    <div 
                        className="rounded-circle d-flex align-items-center justify-content-center shadow-sm" 
                        style={{ 
                            width: '38px', 
                            height: '38px', 
                            backgroundColor: stat.bg,
                            color: stat.color 
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
                                <div className="card border-0 shadow-sm rounded-4 overflow-hidden animate-pulse" style={{ height: '100px', backgroundColor: '#eee' }}>
                                    <div className="card-body d-flex align-items-center">
                                        <div className="rounded-4 bg-light me-3" style={{ width: '50px', height: '50px' }} />
                                        <div className="flex-grow-1">
                                            <div className="bg-light rounded mb-2" style={{ width: '60%', height: '15px' }} />
                                            <div className="bg-light rounded" style={{ width: '30%', height: '10px' }} />
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
                            const themeColor = isRevenu ? '#198754' : colors.orange;
                            const bgColor = isRevenu ? '#ECFDF3' : colors.lightOrange;

                            return (
                                <motion.div 
                                    key={cat.id} 
                                    className="col-12 col-sm-6 col-lg-4"
                                    whileHover={{ y: -5 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100 transition-all hover-shadow">
                                        {/* Barre latérale de type au lieu d'une barre supérieure fine */}
                                        <div className="d-flex align-items-center p-3 p-md-3">
                                            <div 
                                                className="rounded-4 d-flex align-items-center justify-content-center me-3 shadow-sm" 
                                                style={{ 
                                                    width: '56px', 
                                                    height: '56px', 
                                                    background: `linear-gradient(135deg, ${bgColor} 0%, #FFFFFF 100%)`,
                                                    color: themeColor,
                                                    border: `1px solid ${bgColor}`
                                                }}
                                            >
                                                <Icon size={20} strokeWidth={2} />
                                            </div>
                                            
                                            <div className="flex-grow-1 overflow-hidden">
                                                <div className="d-flex align-items-center gap-2 mb-1">
                                                    <h6 className="fw-bold mb-0 text-truncate" style={{ color: colors.text, fontSize: '0.80rem' }}>
                                                        {cat.nom}
                                                    </h6>
                                                    
                                                </div>
                                                <span 
                                                    className="badge rounded-pill fw-medium" 
                                                    style={{ 
                                                        fontSize: '0.65rem', 
                                                        backgroundColor: bgColor, 
                                                        color: themeColor,
                                                        letterSpacing: '0.5px',
                                                        textTransform: 'uppercase'
                                                    }}
                                                >
                                                    {cat.type}
                                                </span>
                                            </div>

                                            {/* Actions stylisées */}
                                            <div className="btn-group flex-wrap">
                                                <button 
                                                    onClick={() => openEditModal(cat)} 
                                                    className="btn btn-link p-2 text-muted hover-primary rounded-circle transition-all color: #0d6efd !important;"
                                                    title="Modifier"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(cat.id)} 
                                                    className="btn btn-link p-2 text-muted hover-danger rounded-circle transition-all"
                                                    style={{color: colors.dangerRed}}
                                                    title="Supprimer"
                                                >
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

                {/* CSS additionnel à ajouter dans vos balises <style> */}
                <style>{`
                    .hover-shadow:hover {
                        shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
                    }
                    .hover-primary:hover {
                        background-color: #f0f7ff !important;
                        color: #0d6efd !important;
                    }
                    .hover-danger:hover {
                        background-color: #fff5f5 !important;
                        color: #dc3545 !important;
                    }
                    .animate-pulse {
                        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: .5; }
                    }
                `}</style>

                {/* MODAL / BOTTOM SHEET RESPONSIVE */}
                <AnimatePresence>
                {isModalOpen && (
                    <>
                        {/* Overlay : z-index maximal pour bloquer tout l'arrière-plan */}
                        <motion.div 
                            className="fixed inset-0" 
                            style={{ 
                                backgroundColor: 'rgba(0,0,0,0.6)', 
                                position: 'fixed', 
                                top: 0, 
                                left: 0, 
                                right: 0, 
                                bottom: 0, 
                                backdropFilter: 'blur(4px)',
                                zIndex: 9999 
                            }}
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            onClick={closeModal} 
                        />

                        {/* Conteneur du formulaire : Adaptatif (Bottom Sheet sur Mobile, Modal Centré sur PC) */}
                        <motion.div 
                            className="fixed bg-white shadow-2xl"
                            style={{ 
                                position: 'fixed',
                                zIndex: 10000,
                                display: 'flex',
                                flexDirection: 'column',
                                // Logique responsive via des variables CSS ou calculs simples
                                ...(window.innerWidth > 768 ? {
                                    // Style PC : Centré au milieu
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '500px',
                                    maxHeight: '80vh',
                                    borderRadius: '1.5rem',
                                } : {
                                    // Style Mobile : Bottom Sheet
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    borderTopLeftRadius: '2rem',
                                    borderTopRightRadius: '2rem',
                                    maxHeight: '92vh',
                                })
                            }}
                            // Animation adaptée au contexte : Slide up sur mobile, Fade in/Scale sur PC
                            initial={window.innerWidth > 768 ? { opacity: 0, scale: 0.9, x: "-50%", y: "-45%" } : { y: "100%" }}
                            animate={window.innerWidth > 768 ? { opacity: 1, scale: 1, x: "-50%", y: "-50%" } : { y: 0 }}
                            exit={window.innerWidth > 768 ? { opacity: 0, scale: 0.9 } : { y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 250 }}
                        >
                            
                            {/* Indicateur visuel (uniquement utile sur mobile) */}
                            <div className="p-1 d-md-none" onClick={closeModal} style={{ cursor: 'pointer' }}>
                                <div className="mx-auto my-3" style={{ width: '40px', height: '5px', backgroundColor: '#e0e0e0', borderRadius: '10px' }} />
                            </div>

                            <form onSubmit={handleSubmit} className="d-flex flex-column h-100 overflow-hidden">
                                <div className="px-4 py-4 overflow-auto" style={{ flex: 1 }}>
                                    <div className="d-flex justify-content-between align-items-center mb-4">
                                        <h2 className="fw-bold h5 mb-0">
                                            {editingCategory ? 'Modifier la catégorie' : 'Nouvelle Catégorie'}
                                        </h2>
                                        <button type="button" onClick={closeModal} className="btn-close shadow-none"></button>
                                    </div>

                                    {/* Champs du formulaire */}
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">NOM</label>
                                        <input 
                                            type="text" 
                                            className="form-control form-control-lg border-0 bg-light rounded-3 shadow-none"
                                            value={formData.nom} 
                                            onChange={(e) => setFormData({ ...formData, nom: e.target.value })} 
                                            required 
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">TYPE</label>
                                        <select 
                                            className="form-select form-select-lg border-0 bg-light rounded-3 shadow-none"
                                            value={formData.type} 
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        >
                                            <option value="depense">Dépense</option>
                                            <option value="revenu">Revenu</option>
                                        </select>
                                    </div>

                                    <label className="form-label small fw-bold text-muted mb-2">ICÔNE</label>
                                    <div className="row g-2 overflow-auto" style={{ maxHeight: '200px' }}>
                                        {Object.entries(availableIcons).map(([name, Icon]) => (
                                            <div key={name} className="col-3 col-md-2">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setFormData({ ...formData, icone: name })}
                                                    className={`btn w-100 py-3 rounded-3 border-0 transition-all ${formData.icone === name ? 'text-white' : 'bg-light text-muted'}`}
                                                    style={{ backgroundColor: formData.icone === name ? colors.orange : '' }}
                                                >
                                                    <Icon size={20} className="mx-auto color-success" style={{color: Colors.successGreen}} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pied du formulaire avec boutons */}
                                <div className="p-2 bg-white border-top d-flex gap-2 borderrounded-4">
                                    <button type="button" onClick={closeModal} className="btn btn-light rounded-pill flex-grow-1 py-1 fw-bold">
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isSubmitting} 
                                        className="btn rounded-pill flex-grow-1 py-1 text-white fw-bold"
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
            
            <style>{`
                .fw-black { font-weight: 900; }
                .backdrop-blur { backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); }
                @media (max-width: 576px) {
                    h1 { font-size: 1.5rem !important; }
                    .card-body { padding: 1rem !important; }
                }
            `}</style>
        </div>
    );
};

export default Category;