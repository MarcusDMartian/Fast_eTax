import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import dayjs from 'dayjs';
import type {
    User,
    HKD,
    Transaction,
    TaxDeclaration,
    Invoice,
    BankAccount,
    BankTransaction,
    Notification,
    UserSettings,
    Subscription,
    BusinessSector,
    MonthlySummary,
    QuarterlySummary,
} from '../types';
import {
    mockUser,
    mockHKD,
    mockTransactions,
    mockDeclarations,
    mockInvoices,
    mockBankAccounts,
    mockBankTransactions,
    mockNotifications,
    mockSettings,
    mockSubscription,
    businessSectors,
} from '../mock/data';

interface AppState {
    // Auth
    isAuthenticated: boolean;
    user: User | null;
    hkd: HKD | null;

    // Data
    transactions: Transaction[];
    declarations: TaxDeclaration[];
    invoices: Invoice[];
    bankAccounts: BankAccount[];
    bankTransactions: BankTransaction[];
    notifications: Notification[];

    // Settings
    settings: UserSettings;
    subscription: Subscription | null;

    // Reference data
    businessSectors: BusinessSector[];

    // Actions
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;

    // Transaction actions
    addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateTransaction: (id: string, data: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;

    // Declaration actions
    updateDeclaration: (id: string, data: Partial<TaxDeclaration>) => void;
    submitDeclaration: (id: string) => void;

    // Notification actions
    markNotificationRead: (id: string) => void;
    markAllNotificationsRead: () => void;

    // Settings & HKD actions
    updateSettings: (settings: Partial<UserSettings>) => void;
    updateHKD: (data: Partial<HKD>) => void;
    updateSubscription: (data: Partial<Subscription>) => void;

    // Computed getters
    getMonthlySummary: (year: number, month: number) => MonthlySummary;
    getQuarterlySummary: (year: number, quarter: number) => QuarterlySummary;
    getAnnualSummary: (year: number) => { totalRevenue: number; totalVAT: number; totalPIT: number };
    getUnreadNotificationCount: () => number;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial state
            isAuthenticated: false,
            user: null,
            hkd: null,

            transactions: [],
            declarations: [],
            invoices: [],
            bankAccounts: [],
            bankTransactions: [],
            notifications: [],

            settings: mockSettings,
            subscription: null,

            businessSectors: businessSectors,

            // Auth actions
            login: async (email: string, _password: string) => {
                // Mock login - in real app would call API
                await new Promise(resolve => setTimeout(resolve, 500));

                if (email) {
                    set({
                        isAuthenticated: true,
                        user: mockUser,
                        hkd: mockHKD,
                        transactions: mockTransactions,
                        declarations: mockDeclarations,
                        invoices: mockInvoices,
                        bankAccounts: mockBankAccounts,
                        bankTransactions: mockBankTransactions,
                        notifications: mockNotifications,
                        subscription: mockSubscription,
                    });
                    return true;
                }
                return false;
            },

            logout: () => {
                set({
                    isAuthenticated: false,
                    user: null,
                    hkd: null,
                    transactions: [],
                    declarations: [],
                    invoices: [],
                    bankAccounts: [],
                    bankTransactions: [],
                    notifications: [],
                    subscription: null,
                });
            },

            // Transaction actions
            addTransaction: (transactionData) => {
                const newTransaction: Transaction = {
                    ...transactionData,
                    id: `txn-${Date.now()}`,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };

                set(state => ({
                    transactions: [newTransaction, ...state.transactions],
                }));
            },

            updateTransaction: (id, data) => {
                set(state => ({
                    transactions: state.transactions.map(t =>
                        t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
                    ),
                }));
            },

            deleteTransaction: (id) => {
                set(state => ({
                    transactions: state.transactions.filter(t => t.id !== id),
                }));
            },

            // Declaration actions
            updateDeclaration: (id, data) => {
                set(state => ({
                    declarations: state.declarations.map(d =>
                        d.id === id ? { ...d, ...data, updatedAt: new Date().toISOString() } : d
                    ),
                }));
            },

            submitDeclaration: (id) => {
                set(state => ({
                    declarations: state.declarations.map(d =>
                        d.id === id
                            ? {
                                ...d,
                                status: 'submitted' as const,
                                submittedDate: new Date().toISOString(),
                                gdtReferenceNumber: `GDT-${dayjs().format('YYYY')}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
                                updatedAt: new Date().toISOString(),
                            }
                            : d
                    ),
                }));
            },

            // Notification actions
            markNotificationRead: (id) => {
                set(state => ({
                    notifications: state.notifications.map(n =>
                        n.id === id ? { ...n, read: true } : n
                    ),
                }));
            },

            markAllNotificationsRead: () => {
                set(state => ({
                    notifications: state.notifications.map(n => ({ ...n, read: true })),
                }));
            },

            // Settings & HKD actions
            updateSettings: (newSettings) => {
                set(state => ({
                    settings: { ...state.settings, ...newSettings },
                }));
            },

            updateHKD: (data) => {
                set(state => ({
                    hkd: state.hkd ? { ...state.hkd, ...data } : null,
                }));
            },

            updateSubscription: (data) => {
                set(state => ({
                    subscription: state.subscription ? { ...state.subscription, ...data } : null,
                }));
            },

            // Computed getters
            getMonthlySummary: (year, month) => {
                const transactions = get().transactions.filter(t => {
                    const d = dayjs(t.date);
                    return d.year() === year && d.month() + 1 === month;
                });

                const annualRevenue = get().getAnnualSummary(year).totalRevenue;
                const isExempt = annualRevenue <= 100000000;

                return {
                    month,
                    year,
                    totalRevenue: transactions.reduce((sum, t) => sum + t.amount, 0),
                    totalVAT: isExempt ? 0 : transactions.reduce((sum, t) => sum + t.vatAmount, 0),
                    totalPIT: isExempt ? 0 : transactions.reduce((sum, t) => sum + t.pitAmount, 0),
                    transactionCount: transactions.length,
                };
            },

            getQuarterlySummary: (year, quarter) => {
                const startMonth = (quarter - 1) * 3 + 1;
                const months: MonthlySummary[] = [];

                for (let i = 0; i < 3; i++) {
                    months.push(get().getMonthlySummary(year, startMonth + i));
                }

                return {
                    quarter,
                    year,
                    months,
                    totalRevenue: months.reduce((sum, m) => sum + m.totalRevenue, 0),
                    totalVAT: months.reduce((sum, m) => sum + m.totalVAT, 0),
                    totalPIT: months.reduce((sum, m) => sum + m.totalPIT, 0),
                };
            },

            getAnnualSummary: (year) => {
                const transactions = get().transactions.filter(t =>
                    dayjs(t.date).year() === year
                );

                const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
                const isExempt = totalRevenue <= 100000000;

                return {
                    totalRevenue,
                    totalVAT: isExempt ? 0 : transactions.reduce((sum, t) => sum + t.vatAmount, 0),
                    totalPIT: isExempt ? 0 : transactions.reduce((sum, t) => sum + t.pitAmount, 0),
                };
            },

            getUnreadNotificationCount: () => {
                return get().notifications.filter(n => !n.read).length;
            },
        }),
        {
            name: 'etax-hkd-storage',
            storage: createJSONStorage(() => localStorage),
            // Only persist these fields
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                user: state.user,
                hkd: state.hkd,
                transactions: state.transactions,
                declarations: state.declarations,
                invoices: state.invoices,
                bankAccounts: state.bankAccounts,
                settings: state.settings,
                subscription: state.subscription,
            }),
        }
    )
);
