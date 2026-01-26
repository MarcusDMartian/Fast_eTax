import { useState, useMemo } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Typography,
    Tabs,
    Tag,
    DatePicker,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Row,
    Col,
    Statistic,
    message,
    Popconfirm,
    Tooltip,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useAppStore } from '../../store';
import { formatCurrency, businessSectors, calculateTax } from '../../mock/data';
import type { Transaction } from '../../types';

const { Title, Text } = Typography;

export default function LedgerPage() {
    const [activeTab, setActiveTab] = useState('monthly');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [form] = Form.useForm();

    const { transactions, addTransaction, updateTransaction, deleteTransaction, hkd, getMonthlySummary, getQuarterlySummary, getAnnualSummary } = useAppStore();

    // Current month transactions
    const monthlyTransactions = useMemo(() => {
        return transactions.filter(t =>
            dayjs(t.date).format('YYYY-MM') === selectedMonth.format('YYYY-MM')
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, selectedMonth]);

    const currentSummary = getMonthlySummary(selectedMonth.year(), selectedMonth.month() + 1);

    // Quarterly summaries
    const quarterlySummaries = useMemo(() => {
        const year = selectedMonth.year();
        return [1, 2, 3, 4].map(q => getQuarterlySummary(year, q));
    }, [selectedMonth, getQuarterlySummary]);

    // Annual summary
    const annualSummary = getAnnualSummary(selectedMonth.year());

    const handleAddTransaction = () => {
        setEditingTransaction(null);
        form.resetFields();
        form.setFieldsValue({
            date: dayjs(),
            sector: hkd?.businessSector.code || 'RETAIL',
        });
        setIsModalOpen(true);
    };

    const handleEditTransaction = (record: Transaction) => {
        setEditingTransaction(record);
        form.setFieldsValue({
            ...record,
            date: dayjs(record.date),
        });
        setIsModalOpen(true);
    };

    const handleDeleteTransaction = (id: string) => {
        deleteTransaction(id);
        message.success('Đã xóa giao dịch');
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const sector = businessSectors.find(s => s.code === values.sector) || businessSectors[0];
            const tax = calculateTax(values.amount, sector);

            const transactionData = {
                date: values.date.format('YYYY-MM-DD'),
                description: values.description,
                amount: values.amount,
                category: sector.nameVi,
                sector: sector.code,
                vatAmount: tax.vat,
                pitAmount: tax.pit,
            };

            if (editingTransaction) {
                updateTransaction(editingTransaction.id, transactionData);
                message.success('Đã cập nhật giao dịch');
            } else {
                addTransaction(transactionData);
                message.success('Đã thêm giao dịch mới');
            }

            setIsModalOpen(false);
            form.resetFields();
        } catch (error) {
            console.error('Form validation failed:', error);
        }
    };

    const handleExportPDF = () => {
        message.info('Tính năng xuất PDF đang được phát triển. Vui lòng dùng xuất Excel/CSV.');
    };

    const handleExportExcel = () => {
        try {
            const headers = ['Ngày', 'Diễn giải', 'Doanh thu', 'Thuế GTGT', 'Thuế TNCN', 'Ngành nghề'];
            const rows = monthlyTransactions.map(t => [
                t.date,
                `"${t.description.replace(/"/g, '""')}"`,
                t.amount,
                t.vatAmount,
                t.pitAmount,
                t.category
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(r => r.join(','))
            ].join('\n');

            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `So-S2a-HKD-${selectedMonth.format('MM-YYYY')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            message.success('Đã xuất file CSV thành công!');
        } catch (error) {
            message.error('Lỗi khi xuất file');
            console.error(error);
        }
    };

    const columns: ColumnsType<Transaction> = [
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            width: 110,
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        },
        {
            title: 'Diễn giải',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            width: 150,
            align: 'right',
            render: (amount: number) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {formatCurrency(amount)}
                </Text>
            ),
            sorter: (a, b) => a.amount - b.amount,
        },
        {
            title: 'Thuế GTGT',
            dataIndex: 'vatAmount',
            key: 'vatAmount',
            width: 120,
            align: 'right',
            render: (amount: number) => formatCurrency(amount),
        },
        {
            title: 'Thuế TNCN',
            dataIndex: 'pitAmount',
            key: 'pitAmount',
            width: 120,
            align: 'right',
            render: (amount: number) => formatCurrency(amount),
        },
        {
            title: 'Ngành',
            dataIndex: 'category',
            key: 'category',
            width: 100,
            render: (category: string) => <Tag color="blue">{category}</Tag>,
        },
        {
            title: '',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Sửa">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleEditTransaction(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Xác nhận xóa giao dịch này?"
                        onConfirm={() => handleDeleteTransaction(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Xóa">
                            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const quarterColumns: ColumnsType<typeof quarterlySummaries[0]> = [
        {
            title: 'Quý',
            dataIndex: 'quarter',
            key: 'quarter',
            render: (q: number, record) => `Q${q}/${record.year}`,
        },
        {
            title: 'Tổng doanh thu',
            dataIndex: 'totalRevenue',
            key: 'totalRevenue',
            align: 'right',
            render: (value: number) => <Text strong>{formatCurrency(value)}</Text>,
        },
        {
            title: 'Thuế GTGT',
            dataIndex: 'totalVAT',
            key: 'totalVAT',
            align: 'right',
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Thuế TNCN',
            dataIndex: 'totalPIT',
            key: 'totalPIT',
            align: 'right',
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Tổng thuế',
            key: 'totalTax',
            align: 'right',
            render: (_, record) => (
                <Text strong style={{ color: '#fa8c16' }}>
                    {formatCurrency(record.totalVAT + record.totalPIT)}
                </Text>
            ),
        },
        {
            title: '',
            key: 'actions',
            width: 100,
            render: () => (
                <Button type="link" size="small">Chi tiết</Button>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <Title level={3} style={{ marginBottom: 4 }}>📒 Sổ Doanh Thu (S2a-HKD)</Title>
                    <Text type="secondary">
                        Quản lý doanh thu và tính thuế tự động theo quy định
                    </Text>
                </div>
                <Space wrap>
                    <Button icon={<UploadOutlined />}>Nhập Excel</Button>
                    <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>Xuất Excel</Button>
                    <Button icon={<FilePdfOutlined />} onClick={handleExportPDF}>Xuất S2a PDF</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTransaction}>
                        Thêm doanh thu
                    </Button>
                </Space>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: 'monthly',
                        label: '📅 Theo tháng',
                        children: (
                            <>
                                {/* Month Selector & Summary */}
                                <Row gutter={16} style={{ marginBottom: 24 }}>
                                    <Col xs={24} md={6}>
                                        <Card>
                                            <div style={{ marginBottom: 12 }}>
                                                <Text type="secondary">Chọn tháng</Text>
                                            </div>
                                            <DatePicker
                                                picker="month"
                                                value={selectedMonth}
                                                onChange={(date) => date && setSelectedMonth(date)}
                                                style={{ width: '100%' }}
                                                format="MM/YYYY"
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={8} md={6}>
                                        <Card>
                                            <Statistic
                                                title="Tổng doanh thu"
                                                value={currentSummary.totalRevenue}
                                                formatter={(v) => formatCurrency(Number(v))}
                                                valueStyle={{ color: '#1890ff' }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={8} md={6}>
                                        <Card>
                                            <Statistic
                                                title="Thuế GTGT"
                                                value={currentSummary.totalVAT}
                                                formatter={(v) => formatCurrency(Number(v))}
                                                valueStyle={{ color: '#fa8c16' }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col xs={24} sm={8} md={6}>
                                        <Card>
                                            <Statistic
                                                title="Thuế TNCN"
                                                value={currentSummary.totalPIT}
                                                formatter={(v) => formatCurrency(Number(v))}
                                                valueStyle={{ color: '#eb2f96' }}
                                            />
                                        </Card>
                                    </Col>
                                </Row>

                                {/* Transaction Table */}
                                <Card>
                                    <Table
                                        columns={columns}
                                        dataSource={monthlyTransactions}
                                        rowKey="id"
                                        pagination={{ pageSize: 10, showSizeChanger: true }}
                                        summary={() => (
                                            <Table.Summary fixed>
                                                <Table.Summary.Row style={{ background: '#fafafa' }}>
                                                    <Table.Summary.Cell index={0} colSpan={2}>
                                                        <Text strong>Tổng cộng ({monthlyTransactions.length} giao dịch)</Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={2} align="right">
                                                        <Text strong style={{ color: '#1890ff' }}>
                                                            {formatCurrency(currentSummary.totalRevenue)}
                                                        </Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={3} align="right">
                                                        <Text strong>{formatCurrency(currentSummary.totalVAT)}</Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={4} align="right">
                                                        <Text strong>{formatCurrency(currentSummary.totalPIT)}</Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={5} colSpan={2} />
                                                </Table.Summary.Row>
                                            </Table.Summary>
                                        )}
                                    />
                                </Card>
                            </>
                        ),
                    },
                    {
                        key: 'quarterly',
                        label: '📊 Theo quý',
                        children: (
                            <Card>
                                <Table
                                    columns={quarterColumns}
                                    dataSource={quarterlySummaries}
                                    rowKey={(record) => `Q${record.quarter}`}
                                    pagination={false}
                                    summary={() => (
                                        <Table.Summary fixed>
                                            <Table.Summary.Row style={{ background: '#e6f7ff' }}>
                                                <Table.Summary.Cell index={0}>
                                                    <Text strong>Năm {selectedMonth.year()}</Text>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell index={1} align="right">
                                                    <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                                                        {formatCurrency(annualSummary.totalRevenue)}
                                                    </Text>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell index={2} align="right">
                                                    <Text strong>{formatCurrency(annualSummary.totalVAT)}</Text>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell index={3} align="right">
                                                    <Text strong>{formatCurrency(annualSummary.totalPIT)}</Text>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell index={4} align="right">
                                                    <Text strong style={{ color: '#fa8c16', fontSize: 16 }}>
                                                        {formatCurrency(annualSummary.totalVAT + annualSummary.totalPIT)}
                                                    </Text>
                                                </Table.Summary.Cell>
                                                <Table.Summary.Cell index={5} />
                                            </Table.Summary.Row>
                                        </Table.Summary>
                                    )}
                                />
                            </Card>
                        ),
                    },
                    {
                        key: 'annual',
                        label: '📆 Theo năm',
                        children: (
                            <Row gutter={[16, 16]}>
                                <Col xs={24} md={8}>
                                    <Card>
                                        <Statistic
                                            title={`Tổng doanh thu năm ${selectedMonth.year()}`}
                                            value={annualSummary.totalRevenue}
                                            formatter={(v) => formatCurrency(Number(v))}
                                            valueStyle={{ color: '#1890ff', fontSize: 28 }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Card>
                                        <Statistic
                                            title="Tổng thuế GTGT"
                                            value={annualSummary.totalVAT}
                                            formatter={(v) => formatCurrency(Number(v))}
                                            valueStyle={{ color: '#fa8c16', fontSize: 28 }}
                                        />
                                    </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Card>
                                        <Statistic
                                            title="Tổng thuế TNCN"
                                            value={annualSummary.totalPIT}
                                            formatter={(v) => formatCurrency(Number(v))}
                                            valueStyle={{ color: '#eb2f96', fontSize: 28 }}
                                        />
                                    </Card>
                                </Col>
                                <Col span={24}>
                                    <Card title="Phân tích theo quý">
                                        <Table
                                            columns={quarterColumns}
                                            dataSource={quarterlySummaries}
                                            rowKey={(record) => `Q${record.quarter}`}
                                            pagination={false}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        ),
                    },
                ]}
            />

            {/* Add/Edit Transaction Modal */}
            <Modal
                title={editingTransaction ? 'Sửa giao dịch' : 'Thêm doanh thu mới'}
                open={isModalOpen}
                onOk={handleSubmit}
                onCancel={() => setIsModalOpen(false)}
                okText={editingTransaction ? 'Cập nhật' : 'Thêm'}
                cancelText="Hủy"
                width={500}
            >
                <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
                    <Form.Item
                        name="date"
                        label="Ngày"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
                    >
                        <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Diễn giải"
                        rules={[{ required: true, message: 'Vui lòng nhập diễn giải' }]}
                    >
                        <Input placeholder="VD: Bán hàng gia dụng" />
                    </Form.Item>

                    <Form.Item
                        name="amount"
                        label="Số tiền (VND)"
                        rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            min={0}
                            step={100000}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => (value?.replace(/,/g, '') || '0') as unknown as 0}
                            placeholder="10,000,000"
                        />
                    </Form.Item>

                    <Form.Item
                        name="sector"
                        label="Ngành nghề"
                        rules={[{ required: true, message: 'Vui lòng chọn ngành nghề' }]}
                    >
                        <Select
                            options={businessSectors.map(s => ({
                                value: s.code,
                                label: `${s.nameVi} (VAT ${s.vatRate}%, TNCN ${s.pitRate}%)`,
                            }))}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
