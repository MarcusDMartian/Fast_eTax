import { useState } from 'react';
import {
    Card,
    Table,
    Typography,
    Tabs,
    Tag,
    Space,
    Button,
    DatePicker,
    Row,
    Col,
    Statistic,
    Alert,
    Progress,
} from 'antd';
import {
    FileSearchOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    SyncOutlined,
    DownloadOutlined,
    LinkOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useAppStore } from '../../store';
import { formatCurrency } from '../../mock/data';
import type { Invoice } from '../../types';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

export default function InvoicesPage() {
    const [activeTab, setActiveTab] = useState('all');
    const { invoices, transactions } = useAppStore();

    // Calculate totals
    const saleInvoices = invoices.filter(i => i.type === 'sale');
    const purchaseInvoices = invoices.filter(i => i.type === 'purchase');
    const totalSales = saleInvoices.reduce((sum, i) => sum + i.total, 0);
    const totalPurchases = purchaseInvoices.reduce((sum, i) => sum + i.total, 0);

    // Compare with ledger
    const ledgerTotal = transactions.reduce((sum, t) => sum + t.amount, 0);
    const invoiceTotal = totalSales;
    const difference = ledgerTotal - invoiceTotal;
    const matchRate = ledgerTotal > 0 ? Math.round((Math.min(invoiceTotal, ledgerTotal) / ledgerTotal) * 100) : 0;

    const columns: ColumnsType<Invoice> = [
        {
            title: 'Số hóa đơn',
            dataIndex: 'invoiceNumber',
            key: 'invoiceNumber',
            render: (num: string) => <Text strong>{num}</Text>,
        },
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
            sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => (
                <Tag color={type === 'sale' ? 'green' : 'blue'}>
                    {type === 'sale' ? 'Bán ra' : 'Mua vào'}
                </Tag>
            ),
            filters: [
                { text: 'Bán ra', value: 'sale' },
                { text: 'Mua vào', value: 'purchase' },
            ],
            onFilter: (value, record) => record.type === value,
        },
        {
            title: 'Đối tác',
            key: 'partner',
            render: (_, record) => (
                <Text ellipsis style={{ maxWidth: 200 }}>
                    {record.type === 'sale' ? record.buyer : record.seller}
                </Text>
            ),
        },
        {
            title: 'Giá trị',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            render: (amount: number) => formatCurrency(amount),
            sorter: (a, b) => a.amount - b.amount,
        },
        {
            title: 'VAT',
            dataIndex: 'vat',
            key: 'vat',
            align: 'right',
            render: (vat: number) => formatCurrency(vat),
        },
        {
            title: 'Tổng cộng',
            dataIndex: 'total',
            key: 'total',
            align: 'right',
            render: (total: number) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {formatCurrency(total)}
                </Text>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const config: Record<string, { color: string; text: string }> = {
                    valid: { color: 'green', text: 'Hợp lệ' },
                    cancelled: { color: 'red', text: 'Đã hủy' },
                    pending: { color: 'orange', text: 'Chờ xác nhận' },
                };
                const { color, text } = config[status] || config.pending;
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'T-VAN',
            dataIndex: 'tvanProvider',
            key: 'tvan',
            render: (provider: string) => provider ? <Tag>{provider}</Tag> : '-',
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <Title level={3} style={{ marginBottom: 4 }}>
                        🧾 Hóa Đơn Điện Tử
                    </Title>
                    <Text type="secondary">
                        Quản lý hóa đơn từ T-VAN và đối chiếu với sổ doanh thu
                    </Text>
                </div>
                <Space>
                    <Button icon={<SyncOutlined />}>Đồng bộ T-VAN</Button>
                    <Button icon={<LinkOutlined />}>Liên kết T-VAN</Button>
                    <Button icon={<DownloadOutlined />}>Xuất Excel</Button>
                </Space>
            </div>

            {/* Summary Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng HĐ bán ra"
                            value={saleInvoices.length}
                            suffix="hóa đơn"
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Giá trị bán ra"
                            value={totalSales}
                            formatter={(v) => formatCurrency(Number(v))}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng HĐ mua vào"
                            value={purchaseInvoices.length}
                            suffix="hóa đơn"
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Giá trị mua vào"
                            value={totalPurchases}
                            formatter={(v) => formatCurrency(Number(v))}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: 'all',
                        label: `📋 Tất cả (${invoices.length})`,
                        children: (
                            <Card>
                                <div style={{ marginBottom: 16 }}>
                                    <Space>
                                        <Text>Lọc theo ngày:</Text>
                                        <RangePicker format="DD/MM/YYYY" />
                                    </Space>
                                </div>
                                <Table
                                    columns={columns}
                                    dataSource={invoices}
                                    rowKey="id"
                                    pagination={{ pageSize: 10 }}
                                />
                            </Card>
                        ),
                    },
                    {
                        key: 'sale',
                        label: `🏷️ Bán ra (${saleInvoices.length})`,
                        children: (
                            <Card>
                                <Table
                                    columns={columns}
                                    dataSource={saleInvoices}
                                    rowKey="id"
                                    pagination={{ pageSize: 10 }}
                                />
                            </Card>
                        ),
                    },
                    {
                        key: 'purchase',
                        label: `🛒 Mua vào (${purchaseInvoices.length})`,
                        children: (
                            <Card>
                                <Table
                                    columns={columns}
                                    dataSource={purchaseInvoices}
                                    rowKey="id"
                                    pagination={{ pageSize: 10 }}
                                />
                            </Card>
                        ),
                    },
                    {
                        key: 'reconciliation',
                        label: '⚖️ Đối chiếu',
                        children: (
                            <Row gutter={[24, 24]}>
                                <Col xs={24} lg={12}>
                                    <Card title="📊 So sánh Hóa đơn vs Sổ Doanh thu">
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Tổng HĐ bán ra"
                                                    value={invoiceTotal}
                                                    formatter={(v) => formatCurrency(Number(v))}
                                                    valueStyle={{ color: '#52c41a' }}
                                                    prefix={<FileSearchOutlined />}
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Tổng sổ doanh thu"
                                                    value={ledgerTotal}
                                                    formatter={(v) => formatCurrency(Number(v))}
                                                    valueStyle={{ color: '#1890ff' }}
                                                    prefix={<FileSearchOutlined />}
                                                />
                                            </Col>
                                        </Row>

                                        <div style={{ marginTop: 24 }}>
                                            <Text>Tỷ lệ khớp:</Text>
                                            <Progress
                                                percent={matchRate}
                                                status={matchRate >= 90 ? 'success' : matchRate >= 70 ? 'normal' : 'exception'}
                                                strokeColor={matchRate >= 90 ? '#52c41a' : matchRate >= 70 ? '#1890ff' : '#f5222d'}
                                            />
                                        </div>

                                        <Statistic
                                            title="Chênh lệch"
                                            value={Math.abs(difference)}
                                            formatter={(v) => formatCurrency(Number(v))}
                                            valueStyle={{
                                                color: difference === 0 ? '#52c41a' : '#fa8c16',
                                            }}
                                            prefix={difference > 0 ? '+' : difference < 0 ? '-' : ''}
                                            style={{ marginTop: 16 }}
                                        />
                                    </Card>
                                </Col>

                                <Col xs={24} lg={12}>
                                    <Card title="⚠️ Cảnh báo & Gợi ý">
                                        {difference > 0 && (
                                            <Alert
                                                message="Doanh thu sổ cao hơn hóa đơn"
                                                description={`Có ${formatCurrency(difference)} doanh thu trong sổ không có hóa đơn tương ứng. Đây có thể là doanh thu tiền mặt không xuất hóa đơn.`}
                                                type="warning"
                                                showIcon
                                                icon={<WarningOutlined />}
                                                style={{ marginBottom: 16 }}
                                            />
                                        )}

                                        {difference < 0 && (
                                            <Alert
                                                message="Hóa đơn cao hơn doanh thu sổ"
                                                description={`Có ${formatCurrency(Math.abs(difference))} hóa đơn chưa được ghi nhận vào sổ doanh thu. Vui lòng kiểm tra và bổ sung.`}
                                                type="error"
                                                showIcon
                                                icon={<WarningOutlined />}
                                                style={{ marginBottom: 16 }}
                                            />
                                        )}

                                        {difference === 0 && (
                                            <Alert
                                                message="Dữ liệu khớp hoàn toàn"
                                                description="Tổng hóa đơn bán ra khớp với tổng doanh thu trong sổ. Tuyệt vời!"
                                                type="success"
                                                showIcon
                                                icon={<CheckCircleOutlined />}
                                                style={{ marginBottom: 16 }}
                                            />
                                        )}

                                        <Alert
                                            message="Lưu ý"
                                            description="Cơ quan thuế có thể đối chiếu dữ liệu hóa đơn điện tử với tờ khai thuế. Đảm bảo doanh thu kê khai không thấp hơn tổng hóa đơn đã xuất."
                                            type="info"
                                            showIcon
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        ),
                    },
                ]}
            />
        </div>
    );
}
