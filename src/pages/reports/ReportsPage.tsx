import { useState } from 'react';
import {
    Card,
    Typography,
    Tabs,
    Space,
    Button,
    Row,
    Col,
    Statistic,
    Table,
    Tag,
    Select,
    message,
} from 'antd';
import {
    FilePdfOutlined,
    FileExcelOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Column, Pie } from '@ant-design/charts';
import { useAppStore } from '../../store';
import { formatCurrency } from '../../mock/data';

const { Title, Text } = Typography;

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('revenue');
    const [selectedYear, setSelectedYear] = useState(dayjs().year());
    const { transactions, declarations, getQuarterlySummary } = useAppStore();

    // Revenue by month
    const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
        const monthTxns = transactions.filter(t => {
            const d = dayjs(t.date);
            return d.year() === selectedYear && d.month() === i;
        });
        return {
            month: dayjs().month(i).format('MMM'),
            revenue: monthTxns.reduce((sum, t) => sum + t.amount, 0),
        };
    });

    // Quarterly summaries
    const quarterlySummaries = [1, 2, 3, 4].map(q => getQuarterlySummary(selectedYear, q));
    const annualTotal = quarterlySummaries.reduce((sum, q) => sum + q.totalRevenue, 0);
    const annualVAT = quarterlySummaries.reduce((sum, q) => sum + q.totalVAT, 0);
    const annualPIT = quarterlySummaries.reduce((sum, q) => sum + q.totalPIT, 0);

    // Tax breakdown
    const taxBreakdown = [
        { type: 'Thuế GTGT (VAT)', value: annualVAT },
        { type: 'Thuế TNCN (PIT)', value: annualPIT },
    ];

    // Compliance data
    const complianceData = declarations.map(d => ({
        key: d.id,
        type: d.type,
        period: d.period,
        dueDate: d.dueDate,
        submittedDate: d.submittedDate,
        status: d.status,
        isOnTime: d.submittedDate ? dayjs(d.submittedDate).isBefore(dayjs(d.dueDate)) : null,
    }));

    const revenueChartConfig = {
        data: monthlyRevenue,
        xField: 'month',
        yField: 'revenue',
        color: '#667eea',
        label: {
            position: 'top' as const,
            formatter: (datum: { revenue: number }) =>
                datum.revenue > 0 ? `${(datum.revenue / 1000000).toFixed(0)}M` : '',
        },
        yAxis: {
            label: {
                formatter: (v: string) => `${(Number(v) / 1000000).toFixed(0)}M`,
            },
        },
    };

    const pieConfig = {
        data: taxBreakdown,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        innerRadius: 0.6,
        label: {
            text: (d: { type: string; value: number }) => `${d.type}: ${formatCurrency(d.value)}`,
            position: 'outside' as const,
        },
    };

    const complianceColumns: ColumnsType<typeof complianceData[0]> = [
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
        },
        {
            title: 'Kỳ',
            dataIndex: 'period',
            key: 'period',
        },
        {
            title: 'Hạn nộp',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'submittedDate',
            key: 'submittedDate',
            render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
        },
        {
            title: 'Trạng thái',
            key: 'compliance',
            render: (_, record) => {
                if (!record.submittedDate) {
                    return <Tag color="orange">Chưa nộp</Tag>;
                }
                return record.isOnTime ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>Đúng hạn</Tag>
                ) : (
                    <Tag color="red" icon={<WarningOutlined />}>Trễ hạn</Tag>
                );
            },
        },
    ];

    const handleExport = (format: 'pdf' | 'excel') => {
        message.loading(`Đang xuất báo cáo ${format.toUpperCase()}...`, 1)
            .then(() => message.success(`Đã xuất báo cáo ${format.toUpperCase()} thành công!`));
    };

    return (
        <div>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <Title level={3} style={{ marginBottom: 4 }}>
                        📊 Báo Cáo & Phân Tích
                    </Title>
                    <Text type="secondary">
                        Tổng hợp dữ liệu doanh thu, thuế và tuân thủ
                    </Text>
                </div>
                <Space>
                    <Select
                        value={selectedYear}
                        onChange={setSelectedYear}
                        options={[
                            { value: 2024, label: '2024' },
                            { value: 2025, label: '2025' },
                            { value: 2026, label: '2026' },
                        ]}
                        style={{ width: 100 }}
                    />
                    <Button icon={<FilePdfOutlined />} onClick={() => handleExport('pdf')}>
                        Xuất PDF
                    </Button>
                    <Button icon={<FileExcelOutlined />} onClick={() => handleExport('excel')}>
                        Xuất Excel
                    </Button>
                </Space>
            </div>

            {/* Summary Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title={`Tổng doanh thu ${selectedYear}`}
                            value={annualTotal}
                            formatter={(v) => formatCurrency(Number(v))}
                            prefix={<DollarOutlined style={{ color: '#1890ff' }} />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng thuế GTGT"
                            value={annualVAT}
                            formatter={(v) => formatCurrency(Number(v))}
                            prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
                            valueStyle={{ color: '#fa8c16' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng thuế TNCN"
                            value={annualPIT}
                            formatter={(v) => formatCurrency(Number(v))}
                            prefix={<DollarOutlined style={{ color: '#eb2f96' }} />}
                            valueStyle={{ color: '#eb2f96' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="Tổng thuế phải nộp"
                            value={annualVAT + annualPIT}
                            formatter={(v) => formatCurrency(Number(v))}
                            prefix={<DollarOutlined style={{ color: '#f5222d' }} />}
                            valueStyle={{ color: '#f5222d' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: 'revenue',
                        label: '💰 Báo cáo doanh thu',
                        children: (
                            <Row gutter={[16, 16]}>
                                <Col span={24}>
                                    <Card title={`Doanh thu theo tháng - Năm ${selectedYear}`}>
                                        <Column {...revenueChartConfig} height={350} />
                                    </Card>
                                </Col>
                                <Col span={24}>
                                    <Card title="Doanh thu theo quý">
                                        <Table
                                            dataSource={quarterlySummaries.map((q, i) => ({
                                                key: i,
                                                quarter: `Q${q.quarter}/${q.year}`,
                                                revenue: q.totalRevenue,
                                                vat: q.totalVAT,
                                                pit: q.totalPIT,
                                                total: q.totalVAT + q.totalPIT,
                                            }))}
                                            columns={[
                                                { title: 'Quý', dataIndex: 'quarter', key: 'quarter' },
                                                {
                                                    title: 'Doanh thu',
                                                    dataIndex: 'revenue',
                                                    key: 'revenue',
                                                    align: 'right',
                                                    render: (v: number) => (
                                                        <Text strong>{formatCurrency(v)}</Text>
                                                    ),
                                                },
                                                {
                                                    title: 'Thuế GTGT',
                                                    dataIndex: 'vat',
                                                    key: 'vat',
                                                    align: 'right',
                                                    render: (v: number) => formatCurrency(v),
                                                },
                                                {
                                                    title: 'Thuế TNCN',
                                                    dataIndex: 'pit',
                                                    key: 'pit',
                                                    align: 'right',
                                                    render: (v: number) => formatCurrency(v),
                                                },
                                                {
                                                    title: 'Tổng thuế',
                                                    dataIndex: 'total',
                                                    key: 'total',
                                                    align: 'right',
                                                    render: (v: number) => (
                                                        <Text strong style={{ color: '#fa8c16' }}>
                                                            {formatCurrency(v)}
                                                        </Text>
                                                    ),
                                                },
                                            ]}
                                            pagination={false}
                                            summary={() => (
                                                <Table.Summary.Row style={{ background: '#f0f5ff' }}>
                                                    <Table.Summary.Cell index={0}>
                                                        <Text strong>Cả năm {selectedYear}</Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={1} align="right">
                                                        <Text strong style={{ color: '#1890ff' }}>
                                                            {formatCurrency(annualTotal)}
                                                        </Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={2} align="right">
                                                        <Text strong>{formatCurrency(annualVAT)}</Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={3} align="right">
                                                        <Text strong>{formatCurrency(annualPIT)}</Text>
                                                    </Table.Summary.Cell>
                                                    <Table.Summary.Cell index={4} align="right">
                                                        <Text strong style={{ color: '#f5222d' }}>
                                                            {formatCurrency(annualVAT + annualPIT)}
                                                        </Text>
                                                    </Table.Summary.Cell>
                                                </Table.Summary.Row>
                                            )}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        ),
                    },
                    {
                        key: 'tax',
                        label: '🧾 Báo cáo thuế',
                        children: (
                            <Row gutter={[16, 16]}>
                                <Col xs={24} lg={12}>
                                    <Card title="Phân bổ thuế">
                                        <Pie {...pieConfig} height={300} />
                                    </Card>
                                </Col>
                                <Col xs={24} lg={12}>
                                    <Card title="Chi tiết thuế">
                                        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                            <Statistic
                                                title="Thuế GTGT (VAT)"
                                                value={annualVAT}
                                                formatter={(v) => formatCurrency(Number(v))}
                                                suffix={
                                                    <Text type="secondary" style={{ fontSize: 14 }}>
                                                        ({annualTotal > 0 ? ((annualVAT / annualTotal) * 100).toFixed(2) : 0}% doanh thu)
                                                    </Text>
                                                }
                                            />
                                            <Statistic
                                                title="Thuế TNCN (PIT)"
                                                value={annualPIT}
                                                formatter={(v) => formatCurrency(Number(v))}
                                                suffix={
                                                    <Text type="secondary" style={{ fontSize: 14 }}>
                                                        ({annualTotal > 0 ? ((annualPIT / annualTotal) * 100).toFixed(2) : 0}% doanh thu)
                                                    </Text>
                                                }
                                            />
                                            <Statistic
                                                title="Tổng thuế phải nộp"
                                                value={annualVAT + annualPIT}
                                                formatter={(v) => formatCurrency(Number(v))}
                                                valueStyle={{ color: '#f5222d', fontSize: 28 }}
                                            />
                                        </Space>
                                    </Card>
                                </Col>
                            </Row>
                        ),
                    },
                    {
                        key: 'compliance',
                        label: '✅ Tuân thủ',
                        children: (
                            <Card title="Lịch sử kê khai & tuân thủ">
                                <Table
                                    columns={complianceColumns}
                                    dataSource={complianceData}
                                    pagination={false}
                                />
                            </Card>
                        ),
                    },
                ]}
            />
        </div>
    );
}
