import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const SkeletonCard = () => (
    <div className="col-12 col-md-6 col-xl-4">
        <div
            className="card border-0 shadow-sm p-3 h-100 placeholder-glow"
            style={{ borderRadius: '20px' }}
        >
            <div className="d-flex justify-content-between mb-4">
                <span className="placeholder col-4 py-2 rounded"></span>
                <span className="placeholder col-2 py-2 rounded-circle"></span>
            </div>

            <div className="placeholder col-10 mb-3 py-2 rounded"></div>
            <div className="placeholder col-7 mb-4 py-2 rounded"></div>

            <div className="placeholder col-12 py-4 rounded-4"></div>
        </div>
    </div>
);

const Rapports = () => {
    const [reports, setReports] = useState({
        daily: [],
        weekly: [],
        monthly: [],
    });

    const [loading, setLoading] = useState(true);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [detailData, setDetailData] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [showModal, setShowModal] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const colors = {
        darkGreen: '#0A3B2F',
        orange: '#E97223',
        successGreen: '#198754',
        danger: '#dc3545',
        lightGray: '#f5f7fb',
    };

    const periodLabels = {
        daily: 'Journalier',
        weekly: 'Hebdomadaire',
        monthly: 'Mensuel',
    };

    const periodColors = {
        daily: colors.darkGreen,
        weekly: colors.orange,
        monthly: colors.successGreen,
    };

    const fetchReports = useCallback(async () => {
        try {
            setLoading(true);

            const response = await api.get('/reports/summary');

            setReports({
                daily: response.data.daily || [],
                weekly: response.data.weekly || [],
                monthly: response.data.monthly || [],
            });
        } catch (error) {
            console.error(error);

            alert(
                error?.response?.data?.message ||
                    'Erreur lors du chargement des rapports.'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const formatPrix = (value, separator = ' ') => {
        if (isNaN(value)) return '0';

        return Number(value)
            .toFixed(0)
            .replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    };

    const handleViewDetails = async (period) => {
        try {
            setSelectedPeriod(period);
            setLoadingDetails(true);
            setShowModal(true);

            const res = await api.get(
                `/reports/details?period=${period}`
            );

            setDetailData(res.data.transactions || []);
        } catch (error) {
            console.error(error);

            alert(
                error?.response?.data?.message ||
                    'Erreur lors du chargement des détails.'
            );
        } finally {
            setLoadingDetails(false);
        }
    };

    const calculateTotal = (data) => {
        if (!Array.isArray(data)) return 0;

        return data.reduce(
            (sum, item) => sum + Number(item.total || 0),
            0
        );
    };

    const globalStats = useMemo(() => {
        const all = [...detailData];

        const recettes = all
            .filter((i) => i.type !== 'depense')
            .reduce((s, i) => s + Number(i.montant || 0), 0);

        const depenses = all
            .filter((i) => i.type === 'depense')
            .reduce((s, i) => s + Number(i.montant || 0), 0);

        return {
            recettes,
            depenses,
            balance: recettes - depenses,
        };
    }, [detailData]);

    const filteredData = useMemo(() => {
        return detailData.filter((item) => {
            const matchesSearch =
                item.description
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                item.category?.nom
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase());

            const matchesType =
                filterType === 'all'
                    ? true
                    : item.type === filterType;

            return matchesSearch && matchesType;
        });
    }, [detailData, searchTerm, filterType]);

    const exportExcel = () => {
        if (!filteredData.length) return;

        const data = filteredData.map((t) => ({
            Date: new Date(t.created_at).toLocaleDateString(
                'fr-FR'
            ),
            Description: t.description || 'N/A',
            Catégorie: t.category?.nom || 'Autre',
            Type:
                t.type === 'depense'
                    ? 'Dépense'
                    : 'Recette',
            Montant: t.montant,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            'Rapport'
        );

        XLSX.writeFile(
            workbook,
            `rapport_${selectedPeriod}.xlsx`
        );
    };

    const downloadPDF = () => {
        const doc = new jsPDF();

        const periodTitle =
            periodLabels[selectedPeriod] || 'Financier';

        doc.setFontSize(20);

        doc.setTextColor(10, 59, 47);

        doc.text(
            `DjagoYelen - Rapport ${periodTitle}`,
            14,
            20
        );

        doc.setFontSize(10);

        doc.setTextColor(120);

        doc.text(
            `Date : ${new Date().toLocaleString('fr-FR')}`,
            14,
            28
        );

        doc.setFontSize(12);

        doc.setTextColor(0);

        doc.text(
            `Recettes : ${formatPrix(
                globalStats.recettes
            )} FCFA`,
            14,
            40
        );

        doc.text(
            `Dépenses : ${formatPrix(
                globalStats.depenses
            )} FCFA`,
            14,
            48
        );

        doc.text(
            `Balance : ${formatPrix(
                globalStats.balance
            )} FCFA`,
            14,
            56
        );

        const tableColumn = [
            'Date',
            'Description',
            'Catégorie',
            'Type',
            'Montant',
        ];

        const tableRows = filteredData.map((t) => [
            new Date(t.created_at).toLocaleDateString(
                'fr-FR'
            ),
            t.description || 'N/A',
            t.category?.nom || 'Autre',
            t.type === 'depense'
                ? 'DÉPENSE'
                : 'RECETTE',
            `${formatPrix(t.montant)} FCFA`,
        ]);

        autoTable(doc, {
            startY: 65,
            head: [tableColumn],
            body: tableRows,

            theme: 'striped',

            headStyles: {
                fillColor: [10, 59, 47],
                halign: 'center',
            },

            bodyStyles: {
                fontSize: 9,
            },

            styles: {
                cellPadding: 3,
            },

            columnStyles: {
                4: {
                    halign: 'right',
                },
            },
        });

        doc.save(
            `rapport_${selectedPeriod}_${Date.now()}.pdf`
        );
    };

    return (
        <div
            style={{
                minHeight: '100vh',
            }}
        >
            <div className="container-fluid py-4 px-3 px-md-4">
                {/* HEADER */}
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                    <div>
                        <h2
                            className="fw-bold mb-2"
                            style={{ color: colors.darkGreen }}
                        >
                            <i className="bi bi-bar-chart-fill me-2"></i>
                            Rapports Financiers
                        </h2>

                        <p className="text-muted mb-0">
                            Analyse complète des revenus et
                            dépenses.
                        </p>
                    </div>

                    <button
                        className="btn text-white fw-bold px-4 py-3 shadow-sm"
                        style={{
                            backgroundColor:
                                colors.darkGreen,
                            borderRadius: '14px',
                        }}
                        onClick={fetchReports}
                        disabled={loading}
                    >
                        <i
                            className={`bi bi-arrow-clockwise me-2 ${
                                loading ? 'spin' : ''
                            }`}
                        ></i>

                        Actualiser
                    </button>
                </div>

                {/* CARDS */}
                <div className="row g-4 mb-4">
                    {loading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : (
                        ['daily', 'weekly', 'monthly'].map(
                            (period) => (
                                <div
                                    className="col-12 col-md-6 col-xl-4"
                                    key={period}
                                >
                                    <div
                                        className="card border-0 shadow-sm h-100 report-card"
                                        style={{
                                            borderRadius:
                                                '22px',
                                            overflow:
                                                'hidden',
                                        }}
                                    >
                                        <div
                                            className="p-4 text-white"
                                            style={{
                                                background:
                                                    periodColors[
                                                        period
                                                    ],
                                            }}
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h5 className="fw-bold mb-1">
                                                        {
                                                            periodLabels[
                                                                period
                                                            ]
                                                        }
                                                    </h5>

                                                    <small className="opacity-75">
                                                        Vue
                                                        synthétique
                                                    </small>
                                                </div>

                                                <i className="bi bi-calendar-check fs-2"></i>
                                            </div>
                                        </div>

                                        <div className="p-4">
                                            {reports[
                                                period
                                            ]?.length >
                                            0 ? (
                                                reports[
                                                    period
                                                ].map(
                                                    (
                                                        item,
                                                        idx
                                                    ) => (
                                                        <div
                                                            key={
                                                                idx
                                                            }
                                                            className="d-flex justify-content-between align-items-center border rounded-4 p-3 mb-3"
                                                        >
                                                            <div>
                                                                <div
                                                                    className={`fw-bold small ${
                                                                        item.type ===
                                                                        'depense'
                                                                            ? 'text-danger'
                                                                            : 'text-success'
                                                                    }`}
                                                                >
                                                                    {item.type ===
                                                                    'depense'
                                                                        ? 'Dépenses'
                                                                        : 'Recettes'}
                                                                </div>
                                                            </div>

                                                            <div className="fw-bold">
                                                                {formatPrix(
                                                                    item.total
                                                                )}{' '}
                                                                F
                                                            </div>
                                                        </div>
                                                    )
                                                )
                                            ) : (
                                                <div className="text-center py-4 text-muted">
                                                    Aucune
                                                    donnée
                                                </div>
                                            )}

                                            <div className="d-grid gap-2 mt-4">
                                                <button
                                                    className="btn text-white fw-bold py-2"
                                                    style={{
                                                        backgroundColor:
                                                            periodColors[
                                                                period
                                                            ],
                                                        borderRadius:
                                                            '12px',
                                                    }}
                                                    onClick={() =>
                                                        handleViewDetails(
                                                            period
                                                        )
                                                    }
                                                >
                                                    <i className="bi bi-eye me-2"></i>
                                                    Voir
                                                    détails
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        )
                    )}
                </div>

                {/* RESUME */}
                <div
                    className="card border-0 shadow-sm p-4 mb-4"
                    style={{ borderRadius: '24px' }}
                >
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                        <h4
                            className="fw-bold mb-0"
                            style={{
                                color: colors.darkGreen,
                            }}
                        >
                            <i className="bi bi-graph-up-arrow me-2"></i>
                            Résumé Global
                        </h4>
                    </div>

                    <div className="row g-4">
                        {[
                            {
                                title: "Aujourd'hui",
                                key: 'daily',
                                color: colors.orange,
                            },
                            {
                                title: 'Cette semaine',
                                key: 'weekly',
                                color: colors.darkGreen,
                            },
                            {
                                title: 'Ce mois',
                                key: 'monthly',
                                color: colors.successGreen,
                            },
                        ].map((item, idx) => (
                            <div
                                className="col-12 col-md-4"
                                key={idx}
                            >
                                <div
                                    className="rounded-4 p-4 text-center h-100"
                                    style={{
                                        backgroundColor:
                                            `${item.color}10`,
                                    }}
                                >
                                    <div className=" small mb-2">
                                        {item.title}
                                    </div>

                                    <h3
                                        className="fw-bold mb-0"
                                        style={{
                                            color: item.color,
                                        }}
                                    >
                                        {formatPrix(
                                            calculateTotal(
                                                reports[
                                                    item.key
                                                ]
                                            )
                                        )}{' '}
                                        F
                                    </h3>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* MODAL */}
                {showModal && (
                    <div
                        className="modal d-block"
                        style={{
                            background:
                                'rgba(0,0,0,0.45)',
                            backdropFilter:
                                'blur(5px)',
                            zIndex: 9999,
                        }}
                    >
                        <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                            <div
                                className="modal-content border-0"
                                style={{
                                    borderRadius: '25px',
                                    overflow: 'hidden',
                                }}
                            >
                                {/* HEADER */}
                                <div
                                    className="modal-header border-0 p-4"
                                    style={{
                                        backgroundColor:
                                            colors.darkGreen,
                                    }}
                                >
                                    <div>
                                        <h4 className="fw-bold mb-1">
                                            {
                                                periodLabels[
                                                    selectedPeriod
                                                ]
                                            }
                                        </h4>

                                        <small className="opacity-75">
                                            Détails des
                                            transactions
                                        </small>
                                    </div>

                                    <button
                                        className="btn-close btn-close-white"
                                        onClick={() =>
                                            setShowModal(
                                                false
                                            )
                                        }
                                    ></button>
                                </div>

                                {/* BODY */}
                                <div className="modal-body p-4">
                                    {/* STATS */}
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-4">
                                            <div className="bg-success-subtle rounded-4 p-3 h-100">
                                                <div className="small text-muted">
                                                    Recettes
                                                </div>

                                                <h4 className="text-success fw-bold mb-0">
                                                    {formatPrix(
                                                        globalStats.recettes
                                                    )}{' '}
                                                    F
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="bg-danger-subtle rounded-4 p-3 h-100">
                                                <div className="small text-muted">
                                                    Dépenses
                                                </div>

                                                <h4 className="text-danger fw-bold mb-0">
                                                    {formatPrix(
                                                        globalStats.depenses
                                                    )}{' '}
                                                    F
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <div className="bg-primary-subtle rounded-4 p-3 h-100">
                                                <div className="small text-muted">
                                                    Balance
                                                </div>

                                                <h4 className="fw-bold mb-0">
                                                    {formatPrix(
                                                        globalStats.balance
                                                    )}{' '}
                                                    F
                                                </h4>
                                            </div>
                                        </div>
                                    </div>

                                    {/* FILTRES */}
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-8">
                                            <input
                                                type="text"
                                                className="form-control rounded-4 py-3"
                                                placeholder="Rechercher une transaction..."
                                                value={
                                                    searchTerm
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setSearchTerm(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="col-md-4">
                                            <select
                                                className="form-select rounded-4 py-3"
                                                value={
                                                    filterType
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setFilterType(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                            >
                                                <option value="all">
                                                    Tous
                                                </option>

                                                <option value="recette">
                                                    Recettes
                                                </option>

                                                <option value="depense">
                                                    Dépenses
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* TABLE */}
                                    <div className="table-responsive">
                                        <table className="table align-middle">
                                            <thead className=''>
                                                <tr>
                                                    <th>
                                                        Date
                                                    </th>

                                                    <th>
                                                        Description
                                                    </th>

                                                    <th>
                                                        Catégorie
                                                    </th>

                                                    <th>
                                                        Type
                                                    </th>

                                                    <th className="text-end">
                                                        Montant
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {loadingDetails ? (
                                                    <tr>
                                                        <td
                                                            colSpan="5"
                                                            className="text-center py-5"
                                                        >
                                                            <div className="spinner-border text-success"></div>
                                                        </td>
                                                    </tr>
                                                ) : filteredData.length >
                                                  0 ? (
                                                    filteredData.map(
                                                        (
                                                            t,
                                                            i
                                                        ) => (
                                                            <tr
                                                                key={
                                                                    i
                                                                }
                                                            >
                                                                <td>
                                                                    {new Date(
                                                                        t.created_at
                                                                    ).toLocaleDateString(
                                                                        'fr-FR'
                                                                    )}
                                                                </td>

                                                                <td className="fw-semibold">
                                                                    {t.description ||
                                                                        'N/A'}
                                                                </td>

                                                                <td>
                                                                    {t
                                                                        .category
                                                                        ?.nom ||
                                                                        'Autre'}
                                                                </td>

                                                                <td>
                                                                    <span
                                                                        className={`badge rounded-pill px-3 py-2 ${
                                                                            t.type ===
                                                                            'depense'
                                                                                ? 'bg-danger-subtle text-danger'
                                                                                : 'bg-success-subtle text-success'
                                                                        }`}
                                                                    >
                                                                        {t.type ===
                                                                        'depense'
                                                                            ? 'Dépense'
                                                                            : 'Recette'}
                                                                    </span>
                                                                </td>

                                                                <td
                                                                    className={`text-end fw-bold ${
                                                                        t.type ===
                                                                        'depense'
                                                                            ? 'text-danger'
                                                                            : 'text-success'
                                                                    }`}
                                                                >
                                                                    {formatPrix(
                                                                        t.montant
                                                                    )}{' '}
                                                                    F
                                                                </td>
                                                            </tr>
                                                        )
                                                    )
                                                ) : (
                                                    <tr>
                                                        <td
                                                            colSpan="5"
                                                            className="text-center py-5 text-muted"
                                                        >
                                                            Aucune
                                                            transaction.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* FOOTER */}
                                <div className="modal-footer border-0 p-4">
                                    <div className="d-flex flex-wrap gap-2 w-100 justify-content-between">
                                        <button
                                            className="btn btn-outline-secondary rounded-pill px-4"
                                            onClick={() =>
                                                setShowModal(
                                                    false
                                                )
                                            }
                                        >
                                            Fermer
                                        </button>

                                        <div className="d-flex gap-2 flex-wrap">
                                            <button
                                                className="btn btn-success rounded-pill px-4 fw-bold"
                                                onClick={
                                                    exportExcel
                                                }
                                                disabled={
                                                    !filteredData.length
                                                }
                                            >
                                                <i className="bi bi-file-earmark-excel me-2"></i>
                                                Excel
                                            </button>

                                            <button
                                                className="btn btn-danger rounded-pill px-4 fw-bold"
                                                onClick={
                                                    downloadPDF
                                                }
                                                disabled={
                                                    !filteredData.length
                                                }
                                            >
                                                <i className="bi bi-file-earmark-pdf me-2"></i>
                                                PDF
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .report-card {
                    transition: all 0.3s ease;
                }

                .report-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 30px rgba(0,0,0,0.08) !important;
                }

                .spin {
                    animation: spin 1s linear infinite;
                    display: inline-block;
                }

                @keyframes spin {
                    100% {
                        transform: rotate(360deg);
                    }
                }

                table thead th {
                    background: #f8f9fa !important;
                    font-size: 13px;
                    text-transform: uppercase;
                    color: #6c757d;
                    border: none !important;
                    padding: 15px !important;
                }

                table tbody td {
                    padding: 15px !important;
                    vertical-align: middle;
                }

                @media (max-width: 768px) {
                    .modal-dialog {
                        margin: 0.5rem;
                    }

                    .modal-content {
                        border-radius: 18px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default Rapports;