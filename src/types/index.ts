// E-Tax Platform Types

// ===== User & Authentication =====
export interface User {
    id: string;
    email: string;
    phone: string;
    fullName: string;
    avatar?: string;
    createdAt: string;
}

// ===== Hộ Kinh Doanh (HKD) =====
export interface HKD {
    id: string;
    mst: string; // Mã số thuế - 10 chữ số
    name: string; // Tên HKD
    address: string;
    ward: string;
    district: string;
    province: string;
    businessSector: BusinessSector; // Ngành nghề
    group: HKDGroup; // Nhóm 1-4
    representative: {
        name: string;
        cccd: string; // Căn cước công dân
        phone: string;
    };
    registrationDate: string;
    status: 'active' | 'suspended' | 'closed';
}

export type HKDGroup = 1 | 2 | 3 | 4;

export interface BusinessSector {
    code: string;
    name: string;
    nameVi: string;
    vatRate: number; // Tỷ lệ VAT (%)
    pitRate: number; // Tỷ lệ PIT (%)
}

// ===== Revenue / Transaction =====
export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    category: string;
    sector?: string; // Ngành nghề áp dụng
    vatAmount: number;
    pitAmount: number;
    attachments?: string[];
    createdAt: string;
    updatedAt: string;
}

export interface MonthlySummary {
    month: number;
    year: number;
    totalRevenue: number;
    totalVAT: number;
    totalPIT: number;
    transactionCount: number;
}

export interface QuarterlySummary {
    quarter: number;
    year: number;
    months: MonthlySummary[];
    totalRevenue: number;
    totalVAT: number;
    totalPIT: number;
}

// ===== Tax Declaration =====
export type DeclarationStatus = 'draft' | 'pending' | 'submitted' | 'confirmed' | 'rejected';
export type DeclarationType = '01/CNKD' | '02/CNKD' | '01TB-ĐĐKD' | '01/TCKT' | '01/XSBHDC';

export interface TaxDeclaration {
    id: string;
    type: DeclarationType;
    period: string; // Q1/2026, 2026, etc.
    status: DeclarationStatus;
    dueDate: string;
    submittedDate?: string;
    revenue: number;
    vatPayable: number;
    pitPayable: number;
    gdtReferenceNumber?: string;
    data: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

// ===== Invoice =====
export type InvoiceStatus = 'valid' | 'cancelled' | 'pending';

export interface Invoice {
    id: string;
    invoiceNumber: string;
    date: string;
    seller: string;
    buyer: string;
    amount: number;
    vat: number;
    total: number;
    status: InvoiceStatus;
    type: 'sale' | 'purchase';
    tvanProvider?: string;
}

// ===== Bank Integration =====
export interface BankAccount {
    id: string;
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
    balance: number;
    linkedAt: string;
    status: 'active' | 'disconnected';
}

export interface BankTransaction {
    id: string;
    accountId: string;
    date: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
    matchedTransactionId?: string;
    status: 'matched' | 'unmatched' | 'ignored';
}

// ===== Notification =====
export type NotificationType = 'deadline' | 'info' | 'warning' | 'success' | 'error';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    link?: string;
}

// ===== Reports =====
export interface Report {
    id: string;
    name: string;
    type: 'revenue' | 'tax' | 'compliance' | 'expense';
    period: string;
    generatedAt: string;
    data: Record<string, unknown>;
}

// ===== Settings =====
export interface UserSettings {
    notifications: {
        email: boolean;
        sms: boolean;
        push: boolean;
        reminderDays: number[]; // [30, 10, 1]
    };
    taxMethod: 'revenue' | 'profit';
    familyDeduction: number;
    twoFactorEnabled: boolean;
}

export interface Subscription {
    plan: 'free' | 'basic' | 'pro' | 'enterprise';
    startDate: string;
    endDate?: string;
    price: number;
    status: 'active' | 'expired' | 'cancelled';
}
