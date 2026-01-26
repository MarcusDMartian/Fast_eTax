import { useState } from 'react';
import {
    Card,
    Table,
    Typography,
    Tabs,
    Tag,
    Space,
    Button,
    Row,
    Col,
    Statistic,
    Avatar,
    Modal,
    Form,
    Select,
    message,
    Empty,
} from 'antd';
import {
    BankOutlined,
    PlusOutlined,
    SyncOutlined,
    LinkOutlined,
    CheckCircleOutlined,
    SwapOutlined,
    WalletOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Line } from '@ant-design/charts';
import { useAppStore } from '../../store';
import { formatCurrency } from '../../mock/data';
import type { BankTransaction } from '../../types';

const { Title, Text } = Typography;

const bankLogos: Record<string, string> = {
    VCB: '🏦',
    TCB: '🏛️',
    BIDV: '🏢',
    ACB: '🏧',
};

export default function BankIntegrationPage() {
    const [activeTab, setActiveTab] = useState('accounts');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { bankAccounts, bankTransactions } = useAppStore();

    const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const matchedTransactions = bankTransactions.filter(t => t.status === 'matched');
    const unmatchedTransactions = bankTransactions.filter(t => t.status === 'unmatched');

    // Cash flow data for chart
    const cashFlowData = [
        { date: dayjs().subtract(6, 'day').format('DD/MM'), balance: 85000000 },
        { date: dayjs().subtract(5, 'day').format('DD/MM'), balance: 92000000 },
        { date: dayjs().subtract(4, 'day').format('DD/MM'), balance: 110000000 },
        { date: dayjs().subtract(3, 'day').format('DD/MM'), balance: 105000000 },
        { date: dayjs().subtract(2, 'day').format('DD/MM'), balance: 125000000 },
        { date: dayjs().subtract(1, 'day').format('DD/MM'), balance: 140000000 },
        { date: dayjs().format('DD/MM'), balance: totalBalance },
    ];

    const cashFlowConfig = {
        data: cashFlowData,
        xField: 'date',
        yField: 'balance',
        smooth: true,
        point: { size: 4 },
        color: '#52c41a',
        areaStyle: {
            fill: 'l(270) 0:#ffffff 1:#52c41a',
            fillOpacity: 0.3,
        },
        yAxis: {
            label: {
                formatter: (v: string) => `${(Number(v) / 1000000).toFixed(0)}M`,
            },
        },
    };

    const transactionColumns: ColumnsType<BankTransaction> = [
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Diễn giải',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => (
                <Tag color={type === 'credit' ? 'green' : 'red'}>
                    {type === 'credit' ? 'Tiền vào' : 'Tiền ra'}
                </Tag>
            ),
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            align: 'right',
            render: (amount: number, record) => (
                <Text strong style={{ color: record.type === 'credit' ? '#52c41a' : '#f5222d' }}>
                    {record.type === 'credit' ? '+' : '-'}{formatCurrency(amount)}
                </Text>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                const config: Record<string, { color: string; text: string }> = {
                    matched: { color: 'green', text: 'Đã khớp' },
                    unmatched: { color: 'orange', text: 'Chưa khớp' },
                    ignored: { color: 'default', text: 'Bỏ qua' },
                };
                const { color, text } = config[status];
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: '',
            key: 'actions',
            width: 100,
            render: (_, record) =>
                record.status === 'unmatched' ? (
                    <Button size="small" onClick={() => message.info('Đang khớp giao dịch...')}>
                        Khớp
                    </Button>
                ) : null,
        },
    ];

    const handleAddBank = () => {
        message.info('Đang chuyển đến trang liên kết ngân hàng... (Demo)');
        setIsModalOpen(false);
    };

    return (
        <div>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <Title level={3} style={{ marginBottom: 4 }}>
                        🏦 Liên Kết Ngân Hàng
                    </Title>
                    <Text type="secondary">
                        Tự động đồng bộ giao dịch và theo dõi dòng tiền
                    </Text>
                </div>
                <Space>
                    <Button icon={<SyncOutlined />}>Đồng bộ</Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
                        Thêm ngân hàng
                    </Button>
                </Space>
            </div>

            {/* Summary Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng số dư"
                            value={totalBalance}
                            formatter={(v) => formatCurrency(Number(v))}
                            prefix={<WalletOutlined style={{ color: '#52c41a' }} />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tài khoản liên kết"
                            value={bankAccounts.length}
                            suffix="tài khoản"
                            prefix={<BankOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="GD đã khớp"
                            value={matchedTransactions.length}
                            suffix="giao dịch"
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="GD chờ khớp"
                            value={unmatchedTransactions.length}
                            suffix="giao dịch"
                            prefix={<SwapOutlined style={{ color: '#fa8c16' }} />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: 'accounts',
                        label: '🏦 Tài khoản',
                        children: (
                            <Row gutter={[16, 16]}>
                                {bankAccounts.map((account) => (
                                    <Col xs={24} md={12} key={account.id}>
                                        <Card
                                            actions={[
                                                <Button type="link" icon={<SyncOutlined />}>Đồng bộ</Button>,
                                                <Button type="link" icon={<LinkOutlined />}>Chi tiết</Button>,
                                            ]}
                                        >
                                            <Card.Meta
                                                avatar={
                                                    <Avatar size={48} style={{ backgroundColor: '#1890ff' }}>
                                                        {bankLogos[account.bankCode] || '🏦'}
                                                    </Avatar>
                                                }
                                                title={
                                                    <Space>
                                                        <Text strong>{account.bankName}</Text>
                                                        <Tag color="green">Đang hoạt động</Tag>
                                                    </Space>
                                                }
                                                description={
                                                    <Space direction="vertical" size={0}>
                                                        <Text>STK: {account.accountNumber}</Text>
                                                        <Text>Chủ TK: {account.accountName}</Text>
                                                    </Space>
                                                }
                                            />
                                            <div style={{ marginTop: 16 }}>
                                                <Statistic
                                                    title="Số dư hiện tại"
                                                    value={account.balance}
                                                    formatter={(v) => formatCurrency(Number(v))}
                                                    valueStyle={{ color: '#52c41a', fontSize: 24 }}
                                                />
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    Cập nhật: {dayjs(account.linkedAt).format('DD/MM/YYYY')}
                                                </Text>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                                <Col xs={24} md={12}>
                                    <Card
                                        style={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            minHeight: 200,
                                            border: '2px dashed #d9d9d9',
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => setIsModalOpen(true)}
                                    >
                                        <Empty
                                            image={<PlusOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
                                            description={
                                                <Text type="secondary">Thêm tài khoản ngân hàng</Text>
                                            }
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        ),
                    },
                    {
                        key: 'transactions',
                        label: '📝 Giao dịch',
                        children: (
                            <Card>
                                <Table
                                    columns={transactionColumns}
                                    dataSource={bankTransactions}
                                    rowKey="id"
                                    pagination={{ pageSize: 10 }}
                                />
                            </Card>
                        ),
                    },
                    {
                        key: 'cashflow',
                        label: '📊 Dòng tiền',
                        children: (
                            <Card title="Biểu đồ số dư 7 ngày gần nhất">
                                <Line {...cashFlowConfig} height={350} />
                            </Card>
                        ),
                    },
                ]}
            />

            {/* Add Bank Modal */}
            <Modal
                title="Thêm tài khoản ngân hàng"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleAddBank}
                okText="Liên kết"
                cancelText="Hủy"
            >
                <Form layout="vertical">
                    <Form.Item label="Chọn ngân hàng" name="bank">
                        <Select
                            placeholder="Chọn ngân hàng"
                            options={[
                                { value: 'vcb', label: '🏦 Vietcombank' },
                                { value: 'tcb', label: '🏛️ Techcombank' },
                                { value: 'bidv', label: '🏢 BIDV' },
                                { value: 'acb', label: '🏧 ACB' },
                                { value: 'mbbank', label: '💳 MB Bank' },
                                { value: 'vpbank', label: '💰 VPBank' },
                            ]}
                        />
                    </Form.Item>
                    <Text type="secondary">
                        Sau khi chọn ngân hàng, bạn sẽ được chuyển đến trang xác thực của ngân hàng để hoàn tất liên kết.
                    </Text>
                </Form>
            </Modal>
        </div>
    );
}
