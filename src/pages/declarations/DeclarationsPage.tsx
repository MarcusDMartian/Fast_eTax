import { useState, useMemo } from 'react';
import {
    Card,
    Table,
    Button,
    Space,
    Typography,
    Tabs,
    Tag,
    Modal,
    Row,
    Col,
    Statistic,
    Steps,
    Divider,
    Alert,
    Descriptions,
    message,
    Timeline,
} from 'antd';
import {
    FileTextOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    SendOutlined,
    EyeOutlined,
    EditOutlined,
    DownloadOutlined,
    SafetyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useAppStore } from '../../store';
import { formatCurrency, taxDeadlines } from '../../mock/data';
import type { TaxDeclaration } from '../../types';

const { Title, Text } = Typography;

export default function DeclarationsPage() {
    const [activeTab, setActiveTab] = useState('pending');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDeclaration, setSelectedDeclaration] = useState<TaxDeclaration | null>(null);
    const [currentStep, setCurrentStep] = useState(0);

    const { declarations, submitDeclaration, getQuarterlySummary, hkd } = useAppStore();

    const pendingDeclarations = declarations.filter(d => d.status === 'pending' || d.status === 'draft');
    const submittedDeclarations = declarations.filter(d => d.status === 'submitted' || d.status === 'confirmed');

    const handleViewDeclaration = (record: TaxDeclaration) => {
        setSelectedDeclaration(record);
        setCurrentStep(0);
        setIsModalOpen(true);
    };

    const handleSubmitDeclaration = () => {
        if (selectedDeclaration) {
            submitDeclaration(selectedDeclaration.id);
            message.success('Tờ khai đã được gửi thành công!');
            setIsModalOpen(false);
        }
    };

    const getStatusTag = (status: string) => {
        const config: Record<string, { color: string; icon: React.ReactNode; text: string }> = {
            draft: { color: 'default', icon: <EditOutlined />, text: 'Nháp' },
            pending: { color: 'orange', icon: <ClockCircleOutlined />, text: 'Chờ nộp' },
            submitted: { color: 'blue', icon: <SendOutlined />, text: 'Đã nộp' },
            confirmed: { color: 'green', icon: <CheckCircleOutlined />, text: 'Đã xác nhận' },
            rejected: { color: 'red', icon: <ExclamationCircleOutlined />, text: 'Từ chối' },
        };
        const { color, icon, text } = config[status] || config.draft;
        return <Tag color={color} icon={icon}>{text}</Tag>;
    };

    const columns: ColumnsType<TaxDeclaration> = [
        {
            title: 'Loại tờ khai',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => (
                <Space>
                    <FileTextOutlined />
                    <Text strong>{type}</Text>
                </Space>
            ),
        },
        {
            title: 'Kỳ',
            dataIndex: 'period',
            key: 'period',
            render: (period: string) => <Tag color="purple">{period}</Tag>,
        },
        {
            title: 'Hạn nộp',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date: string) => {
                const daysLeft = dayjs(date).diff(dayjs(), 'day');
                return (
                    <Space direction="vertical" size={0}>
                        <Text>{dayjs(date).format('DD/MM/YYYY')}</Text>
                        {daysLeft > 0 && daysLeft <= 30 && (
                            <Text type="warning" style={{ fontSize: 12 }}>
                                Còn {daysLeft} ngày
                            </Text>
                        )}
                    </Space>
                );
            },
        },
        {
            title: 'Doanh thu',
            dataIndex: 'revenue',
            key: 'revenue',
            align: 'right',
            render: (value: number) => formatCurrency(value),
        },
        {
            title: 'Thuế phải nộp',
            key: 'tax',
            align: 'right',
            render: (_, record) => (
                <Text strong style={{ color: '#fa8c16' }}>
                    {formatCurrency(record.vatPayable + record.pitPayable)}
                </Text>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => getStatusTag(status),
        },
        {
            title: '',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDeclaration(record)}
                    >
                        {record.status === 'pending' ? 'Kê khai' : 'Xem'}
                    </Button>
                </Space>
            ),
        },
    ];

    // Get summary for the selected declaration's period
    const currentSummary = useMemo(() => {
        if (!selectedDeclaration) return null;

        // Parse period like "Q1/2026" or "2025"
        const period = selectedDeclaration.period;
        if (period.startsWith('Q')) {
            const quarter = parseInt(period.substring(1, 2));
            const year = parseInt(period.split('/')[1]);
            return getQuarterlySummary(year, quarter);
        } else {
            // Annual or other
            return null; // Handle if needed
        }
    }, [selectedDeclaration, getQuarterlySummary]);

    const displayRevenue = currentSummary?.totalRevenue || selectedDeclaration?.revenue || 0;
    const displayVAT = currentSummary?.totalVAT || selectedDeclaration?.vatPayable || 0;
    const displayPIT = currentSummary?.totalPIT || selectedDeclaration?.pitPayable || 0;

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 4 }}>
                    📝 Tờ Khai Thuế
                </Title>
                <Text type="secondary">
                    Quản lý và nộp tờ khai thuế VAT, TNCN theo quý/năm
                </Text>
            </div>

            {/* Deadline Alert */}
            {pendingDeclarations.length > 0 && (
                <Alert
                    message={`Bạn có ${pendingDeclarations.length} tờ khai cần hoàn thành`}
                    description={
                        <Space direction="vertical">
                            {pendingDeclarations.map(d => (
                                <Text key={d.id}>
                                    • {d.type} {d.period} - Hạn: {dayjs(d.dueDate).format('DD/MM/YYYY')}
                                </Text>
                            ))}
                        </Space>
                    }
                    type="warning"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: 'pending',
                        label: `📋 Chờ nộp (${pendingDeclarations.length})`,
                        children: (
                            <Card>
                                <Table
                                    columns={columns}
                                    dataSource={pendingDeclarations}
                                    rowKey="id"
                                    pagination={false}
                                    locale={{ emptyText: 'Không có tờ khai nào đang chờ nộp' }}
                                />
                            </Card>
                        ),
                    },
                    {
                        key: 'submitted',
                        label: `✅ Đã nộp (${submittedDeclarations.length})`,
                        children: (
                            <Card>
                                <Table
                                    columns={[
                                        ...columns.slice(0, -1),
                                        {
                                            title: 'Mã GDT',
                                            dataIndex: 'gdtReferenceNumber',
                                            key: 'gdtRef',
                                            render: (ref: string) => ref ? <Tag color="cyan">{ref}</Tag> : '-',
                                        },
                                        {
                                            title: '',
                                            key: 'actions',
                                            width: 100,
                                            render: () => (
                                                <Button size="small" icon={<DownloadOutlined />}>
                                                    Tải về
                                                </Button>
                                            ),
                                        },
                                    ]}
                                    dataSource={submittedDeclarations}
                                    rowKey="id"
                                    pagination={false}
                                />
                            </Card>
                        ),
                    },
                    {
                        key: 'deadlines',
                        label: '📅 Lịch kê khai',
                        children: (
                            <Card title="Lịch kê khai thuế năm 2026">
                                <Timeline
                                    items={taxDeadlines.map((d, index) => ({
                                        color: index === 0 ? 'blue' : 'gray',
                                        children: (
                                            <div key={d.period}>
                                                <Text strong>{d.type} - {d.period}</Text>
                                                <br />
                                                <Text type="secondary">{d.description}</Text>
                                                <br />
                                                <Tag color={dayjs(d.dueDate).isBefore(dayjs()) ? 'red' : 'green'}>
                                                    Hạn: {dayjs(d.dueDate).format('DD/MM/YYYY')}
                                                </Tag>
                                            </div>
                                        ),
                                    }))}
                                />
                            </Card>
                        ),
                    },
                ]}
            />

            {/* Declaration Form Modal */}
            <Modal
                title={
                    <Space>
                        <FileTextOutlined />
                        <span>Tờ Khai {selectedDeclaration?.type} - {selectedDeclaration?.period}</span>
                    </Space>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                width={800}
                footer={
                    selectedDeclaration?.status === 'pending' ? [
                        <Button key="save" onClick={() => message.info('Đã lưu nháp')}>
                            Lưu nháp
                        </Button>,
                        <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                            Đóng
                        </Button>,
                        <Button
                            key="submit"
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleSubmitDeclaration}
                            disabled={currentStep < 2}
                        >
                            Ký số & Nộp
                        </Button>,
                    ] : [
                        <Button key="download" icon={<DownloadOutlined />}>
                            Tải PDF
                        </Button>,
                        <Button key="close" onClick={() => setIsModalOpen(false)}>
                            Đóng
                        </Button>,
                    ]
                }
            >
                {selectedDeclaration && (
                    <>
                        <Steps
                            current={currentStep}
                            style={{ marginBottom: 32 }}
                            items={[
                                { title: 'Xem dữ liệu', icon: <EyeOutlined /> },
                                { title: 'Xác nhận', icon: <CheckCircleOutlined /> },
                                { title: 'Ký số', icon: <SafetyOutlined /> },
                            ]}
                        />

                        {currentStep === 0 && (
                            <>
                                <Alert
                                    message="Dữ liệu được tự động lấy từ Sổ Doanh Thu S2a-HKD"
                                    type="info"
                                    showIcon
                                    style={{ marginBottom: 24 }}
                                />

                                <Descriptions title="Thông tin Hộ Kinh Doanh" bordered column={2}>
                                    <Descriptions.Item label="Mã số thuế">{hkd?.mst}</Descriptions.Item>
                                    <Descriptions.Item label="Tên HKD">{hkd?.name}</Descriptions.Item>
                                    <Descriptions.Item label="Ngành nghề" span={2}>
                                        {hkd?.businessSector.nameVi}
                                    </Descriptions.Item>
                                </Descriptions>

                                <Divider />

                                <Descriptions title="Dữ liệu kỳ kê khai" bordered column={2}>
                                    <Descriptions.Item label="Kỳ kê khai">
                                        {selectedDeclaration.period}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Hạn nộp">
                                        {dayjs(selectedDeclaration.dueDate).format('DD/MM/YYYY')}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Tổng doanh thu" span={2}>
                                        <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                                            {formatCurrency(displayRevenue)}
                                        </Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Thuế GTGT">
                                        {formatCurrency(displayVAT)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Thuế TNCN">
                                        {formatCurrency(displayPIT)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Tổng thuế phải nộp" span={2}>
                                        <Text strong style={{ fontSize: 18, color: '#fa8c16' }}>
                                            {formatCurrency(displayVAT + displayPIT)}
                                        </Text>
                                    </Descriptions.Item>
                                </Descriptions>

                                <div style={{ marginTop: 24, textAlign: 'center' }}>
                                    <Button type="primary" onClick={() => setCurrentStep(1)}>
                                        Xác nhận dữ liệu →
                                    </Button>
                                </div>
                            </>
                        )}

                        {currentStep === 1 && (
                            <>
                                <Alert
                                    message="Vui lòng kiểm tra lại thông tin trước khi tiếp tục"
                                    type="warning"
                                    showIcon
                                    style={{ marginBottom: 24 }}
                                />

                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Card>
                                            <Statistic
                                                title="Doanh thu kê khai"
                                                value={displayRevenue}
                                                formatter={(v) => formatCurrency(Number(v))}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card>
                                            <Statistic
                                                title="Thuế GTGT"
                                                value={displayVAT}
                                                formatter={(v) => formatCurrency(Number(v))}
                                                valueStyle={{ color: '#1890ff' }}
                                            />
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card>
                                            <Statistic
                                                title="Thuế TNCN"
                                                value={displayPIT}
                                                formatter={(v) => formatCurrency(Number(v))}
                                                valueStyle={{ color: '#fa8c16' }}
                                            />
                                        </Card>
                                    </Col>
                                </Row>

                                <div style={{ marginTop: 24, textAlign: 'center' }}>
                                    <Space>
                                        <Button onClick={() => setCurrentStep(0)}>← Quay lại</Button>
                                        <Button type="primary" onClick={() => setCurrentStep(2)}>
                                            Tiếp tục ký số →
                                        </Button>
                                    </Space>
                                </div>
                            </>
                        )}

                        {currentStep === 2 && (
                            <>
                                <Alert
                                    message="Chọn phương thức ký số để hoàn tất tờ khai"
                                    type="info"
                                    showIcon
                                    style={{ marginBottom: 24 }}
                                />

                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Card
                                            hoverable
                                            style={{ textAlign: 'center', minHeight: 150 }}
                                            onClick={() => message.info('Đang kết nối VNeID...')}
                                        >
                                            <SafetyOutlined style={{ fontSize: 40, color: '#1890ff', marginBottom: 16 }} />
                                            <Title level={5}>VNeID</Title>
                                            <Text type="secondary">Định danh điện tử</Text>
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card
                                            hoverable
                                            style={{ textAlign: 'center', minHeight: 150 }}
                                            onClick={() => message.info('Đang kết nối USB Token...')}
                                        >
                                            <SafetyOutlined style={{ fontSize: 40, color: '#52c41a', marginBottom: 16 }} />
                                            <Title level={5}>Chữ ký số</Title>
                                            <Text type="secondary">USB Token / HSM</Text>
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card
                                            hoverable
                                            style={{ textAlign: 'center', minHeight: 150 }}
                                            onClick={() => message.info('Đang gửi OTP...')}
                                        >
                                            <SafetyOutlined style={{ fontSize: 40, color: '#fa8c16', marginBottom: 16 }} />
                                            <Title level={5}>OTP</Title>
                                            <Text type="secondary">Xác thực SMS</Text>
                                        </Card>
                                    </Col>
                                </Row>

                                <div style={{ marginTop: 24, textAlign: 'center' }}>
                                    <Button onClick={() => setCurrentStep(1)}>← Quay lại</Button>
                                </div>
                            </>
                        )}
                    </>
                )}
            </Modal>
        </div>
    );
}
