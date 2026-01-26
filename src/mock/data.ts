import dayjs from 'dayjs';
import type {
    User,
    HKD,
    BusinessSector,
    Transaction,
    TaxDeclaration,
    Invoice,
    BankAccount,
    BankTransaction,
    Notification,
    UserSettings,
    Subscription,
} from '../types';

// ===== Business Sectors & Tax Rates =====
export const businessSectors: BusinessSector[] = [
    { code: 'RETAIL', name: 'Retail/Trading', nameVi: 'Bán hàng', vatRate: 1, pitRate: 0.5 },
    { code: 'CONSTRUCTION', name: 'Construction with materials', nameVi: 'Xây dựng có VL', vatRate: 4.5, pitRate: 2.25 },
    { code: 'SERVICE', name: 'Services', nameVi: 'Dịch vụ', vatRate: 7, pitRate: 3.5 },
    { code: 'RENTAL', name: 'Rental', nameVi: 'Cho thuê', vatRate: 10, pitRate: 5 },
    { code: 'OTHER_SERVICE', name: 'Other services', nameVi: 'Dịch vụ khác', vatRate: 3, pitRate: 1.5 },
    { code: 'TRANSPORT', name: 'Transportation', nameVi: 'Vận tải', vatRate: 3, pitRate: 1.5 },
    { code: 'FOOD', name: 'Food & Beverage', nameVi: 'Ăn uống', vatRate: 5, pitRate: 2 },
    { code: 'HEALTHCARE', name: 'Healthcare', nameVi: 'Y tế', vatRate: 5, pitRate: 2 },
];

// ===== Mock User =====
export const mockUser: User = {
    id: 'user-001',
    email: 'nguyen.van.a@email.com',
    phone: '0912345678',
    fullName: 'Nguyễn Văn A',
    avatar: undefined,
    createdAt: '2025-12-01T00:00:00Z',
};

// ===== Mock HKD =====
export const mockHKD: HKD = {
    id: 'hkd-001',
    mst: '0123456789',
    name: 'Cửa Hàng Tạp Hóa Nguyễn Văn A',
    address: '123 Đường Lê Lợi',
    ward: 'Phường Bến Thành',
    district: 'Quận 1',
    province: 'TP. Hồ Chí Minh',
    businessSector: businessSectors[0], // Bán hàng
    group: 2,
    representative: {
        name: 'Nguyễn Văn A',
        cccd: '012345678901',
        phone: '0912345678',
    },
    registrationDate: '2020-05-15',
    status: 'active',
};

// ===== Generate Mock Transactions =====
function generateTransactions(): Transaction[] {
    const transactions: Transaction[] = [];
    const descriptions = [
        'Bán hàng gia dụng',
        'Bán quần áo',
        'Bán thực phẩm',
        'Bán đồ điện tử',
        'Bán vật liệu xây dựng',
        'Dịch vụ sửa chữa',
        'Bán mỹ phẩm',
        'Bán văn phòng phẩm',
    ];

    const sector = businessSectors[0]; // Bán hàng - VAT 1%, PIT 0.5%

    // Generate transactions for last 6 months
    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
        const month = dayjs().subtract(monthOffset, 'month');
        const numTransactions = Math.floor(Math.random() * 10) + 15; // 15-25 per month

        for (let i = 0; i < numTransactions; i++) {
            const day = Math.floor(Math.random() * 28) + 1;
            const date = month.date(day);
            const amount = Math.floor(Math.random() * 50000000) + 5000000; // 5M - 55M VND

            transactions.push({
                id: `txn-${month.format('YYYYMM')}-${String(i + 1).padStart(3, '0')}`,
                date: date.format('YYYY-MM-DD'),
                description: descriptions[Math.floor(Math.random() * descriptions.length)],
                amount,
                category: 'Bán hàng',
                sector: sector.code,
                vatAmount: Math.round(amount * sector.vatRate / 100),
                pitAmount: Math.round(amount * sector.pitRate / 100),
                createdAt: date.toISOString(),
                updatedAt: date.toISOString(),
            });
        }
    }

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const mockTransactions: Transaction[] = generateTransactions();

// ===== Mock Tax Declarations =====
export const mockDeclarations: TaxDeclaration[] = [
    {
        id: 'decl-001',
        type: '01/CNKD',
        period: 'Q4/2025',
        status: 'confirmed',
        dueDate: '2026-01-31',
        submittedDate: '2026-01-15',
        revenue: 450000000,
        vatPayable: 4500000,
        pitPayable: 2250000,
        gdtReferenceNumber: 'GDT-2026-001234',
        data: {},
        createdAt: '2025-12-01T00:00:00Z',
        updatedAt: '2026-01-15T10:30:00Z',
    },
    {
        id: 'decl-002',
        type: '01/CNKD',
        period: 'Q1/2026',
        status: 'pending',
        dueDate: '2026-04-30',
        revenue: 0,
        vatPayable: 0,
        pitPayable: 0,
        data: {},
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
    },
    {
        id: 'decl-003',
        type: '02/CNKD',
        period: '2025',
        status: 'submitted',
        dueDate: '2026-01-31',
        submittedDate: '2026-01-20',
        revenue: 1800000000,
        vatPayable: 18000000,
        pitPayable: 9000000,
        data: {},
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-20T14:00:00Z',
    },
];

// ===== Mock Invoices =====
export const mockInvoices: Invoice[] = [
    {
        id: 'inv-001',
        invoiceNumber: 'HD-2026-00001',
        date: '2026-01-15',
        seller: 'Cửa Hàng Tạp Hóa Nguyễn Văn A',
        buyer: 'Công ty TNHH ABC',
        amount: 25000000,
        vat: 250000,
        total: 25250000,
        status: 'valid',
        type: 'sale',
        tvanProvider: 'VNPT',
    },
    {
        id: 'inv-002',
        invoiceNumber: 'HD-2026-00002',
        date: '2026-01-18',
        seller: 'Cửa Hàng Tạp Hóa Nguyễn Văn A',
        buyer: 'Cửa hàng XYZ',
        amount: 15000000,
        vat: 150000,
        total: 15150000,
        status: 'valid',
        type: 'sale',
        tvanProvider: 'VNPT',
    },
    {
        id: 'inv-003',
        invoiceNumber: 'MH-2026-00015',
        date: '2026-01-10',
        seller: 'Nhà Cung cấp ABC',
        buyer: 'Cửa Hàng Tạp Hóa Nguyễn Văn A',
        amount: 80000000,
        vat: 8000000,
        total: 88000000,
        status: 'valid',
        type: 'purchase',
        tvanProvider: 'Viettel',
    },
];

// ===== Mock Bank Accounts =====
export const mockBankAccounts: BankAccount[] = [
    {
        id: 'bank-001',
        bankName: 'Vietcombank',
        bankCode: 'VCB',
        accountNumber: '1234567890',
        accountName: 'NGUYEN VAN A',
        balance: 125000000,
        linkedAt: '2025-06-01T00:00:00Z',
        status: 'active',
    },
    {
        id: 'bank-002',
        bankName: 'Techcombank',
        bankCode: 'TCB',
        accountNumber: '9876543210',
        accountName: 'NGUYEN VAN A',
        balance: 45000000,
        linkedAt: '2025-08-15T00:00:00Z',
        status: 'active',
    },
];

// ===== Mock Bank Transactions =====
export const mockBankTransactions: BankTransaction[] = [
    {
        id: 'btxn-001',
        accountId: 'bank-001',
        date: '2026-01-20',
        description: 'CK TU CONG TY ABC',
        amount: 25250000,
        type: 'credit',
        matchedTransactionId: 'txn-202601-001',
        status: 'matched',
    },
    {
        id: 'btxn-002',
        accountId: 'bank-001',
        date: '2026-01-19',
        description: 'THANH TOAN HOA DON DIEN',
        amount: 2500000,
        type: 'debit',
        status: 'ignored',
    },
    {
        id: 'btxn-003',
        accountId: 'bank-001',
        date: '2026-01-18',
        description: 'CK TU CUA HANG XYZ',
        amount: 15150000,
        type: 'credit',
        status: 'unmatched',
    },
];

// ===== Mock Notifications =====
export const mockNotifications: Notification[] = [
    {
        id: 'notif-001',
        type: 'deadline',
        title: 'Hạn kê khai Q1/2026',
        message: 'Còn 99 ngày để nộp tờ khai thuế Quý 1/2026. Hạn cuối: 30/04/2026',
        read: false,
        createdAt: dayjs().toISOString(),
        link: '/declarations',
    },
    {
        id: 'notif-002',
        type: 'success',
        title: 'Tờ khai đã được xác nhận',
        message: 'Tờ khai Q4/2025 đã được cơ quan thuế xác nhận. Mã tham chiếu: GDT-2026-001234',
        read: false,
        createdAt: dayjs().subtract(2, 'day').toISOString(),
        link: '/declarations',
    },
    {
        id: 'notif-003',
        type: 'info',
        title: 'Cập nhật pháp luật thuế',
        message: 'Thông tư mới về miễn thuế cho HKD có doanh thu dưới 500 triệu/năm đã có hiệu lực từ 01/01/2026',
        read: true,
        createdAt: dayjs().subtract(10, 'day').toISOString(),
    },
    {
        id: 'notif-004',
        type: 'warning',
        title: 'Cảnh báo doanh thu',
        message: 'Doanh thu tháng này cao hơn 50% so với tháng trước. Vui lòng kiểm tra lại dữ liệu.',
        read: true,
        createdAt: dayjs().subtract(5, 'day').toISOString(),
        link: '/ledger',
    },
];

// ===== Mock Settings =====
export const mockSettings: UserSettings = {
    notifications: {
        email: true,
        sms: true,
        push: true,
        reminderDays: [30, 10, 1],
    },
    taxMethod: 'revenue',
    familyDeduction: 15500000, // 15.5M VND/tháng (quy định 2026)
    twoFactorEnabled: false,
};

// ===== Mock Subscription =====
export const mockSubscription: Subscription = {
    plan: 'basic',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    price: 1990000, // 199K/tháng x 10 tháng (ưu đãi)
    status: 'active',
};

// ===== Tax Deadlines 2026 =====
export const taxDeadlines = [
    { period: 'Q1/2026', type: '01/CNKD', dueDate: '2026-04-30', description: 'Kê khai VAT+PIT Quý 1' },
    { period: 'Q2/2026', type: '01/CNKD', dueDate: '2026-07-31', description: 'Kê khai VAT+PIT Quý 2' },
    { period: 'Q3/2026', type: '01/CNKD', dueDate: '2026-11-02', description: 'Kê khai VAT+PIT Quý 3' },
    { period: 'Q4/2026', type: '01/CNKD', dueDate: '2027-01-31', description: 'Kê khai VAT+PIT Quý 4' },
    { period: '2026', type: '02/CNKD', dueDate: '2027-01-31', description: 'Quyết toán thuế năm 2026' },
];

// ===== Helper Functions =====
export function calculateTax(amount: number, sector: BusinessSector, annualRevenue: number = 0, isGroup2: boolean = false) {
    // 100M threshold (Group 1 check) - Exempt completely
    if (annualRevenue > 0 && annualRevenue <= 100000000) {
        return { vat: 0, pit: 0, total: 0 };
    }

    // Circular 152/2025 for Group 2: Tax only on portion exceeding 500M
    // For specific calculations in the Tax Calculator (where amount IS the annual volume)
    const taxableRevenue = isGroup2 ? Math.max(0, amount - 500000000) : amount;

    return {
        vat: Math.round(taxableRevenue * sector.vatRate / 100),
        pit: Math.round(taxableRevenue * sector.pitRate / 100),
        total: Math.round(taxableRevenue * (sector.vatRate + sector.pitRate) / 100),
    };
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function getQuarterFromDate(date: string): number {
    const month = dayjs(date).month() + 1;
    return Math.ceil(month / 3);
}
