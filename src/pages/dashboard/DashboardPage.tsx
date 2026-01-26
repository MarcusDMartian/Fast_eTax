import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Row,
    Col,
    Card,
    Statistic,
    Typography,
    Button,
    Space,
    List,
    Tag,
    Progress,
    Alert,
} from 'antd';
import {
    DollarOutlined,
    PercentageOutlined,
    CalendarOutlined,
    PlusOutlined,
    BookOutlined,
    FileTextOutlined,
    DownloadOutlined,
    RiseOutlined,
    ClockCircleOutlined,
    BellOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { Line, Pie } from '@ant-design/charts';
import { useAppStore } from '../../store';
import { formatCurrency } from '../../mock/data';

const { Title, Text } = Typography;

export default function DashboardPage() {
    const navigate = useNavigate();
    const { getAnnualSummary, getQuarterlySummary, transactions, declarations, notifications, hkd } = useAppStore();
    const currentQuarter = Math.ceil((dayjs().month() + 1) / 3);
    const currentYear = dayjs().year();

    const annualSummary = useMemo(() => getAnnualSummary(currentYear), [currentYear, getAnnualSummary, transactions]);
    const isExempt = annualSummary.totalRevenue <= 100000000;

    const quarterSummary = useMemo(() => getQuarterlySummary(currentYear, currentQuarter), [currentYear, currentQuarter, getQuarterlySummary, transactions]);

    // Monthly revenue trend
    const monthlyData = useMemo(() => {
        const data: { month: string; revenue: number }[] = [];
        for (let i = 5; i >= 0; i--) {
            const month = dayjs().subtract(i, 'month');
            const monthTransactions = transactions.filter(t =>
                dayjs(t.date).format('YYYY-MM') === month.format('YYYY-MM')
            );
            data.push({
                month: month.format('MM/YYYY'),
                revenue: monthTransactions.reduce((sum, t) => sum + t.amount, 0),
            });
        }
        return data;
    }, [transactions]);

    // Next deadline
    const nextDeadline = useMemo(() => {
        const pending = declarations.find(d => d.status === 'pending');
        if (pending) {
            const daysLeft = dayjs(pending.dueDate).diff(dayjs(), 'day');
            return { ...pending, daysLeft };
        }
        return null;
    }, [declarations]);

    // Tax rate
    const taxRate = hkd ? (hkd.businessSector.vatRate + hkd.businessSector.pitRate) : 1.5;

    // Pie chart data
    const pieData = [
        { type: 'Thuế GTGT (VAT)', value: quarterSummary.totalVAT },
        { type: 'Thuế TNCN (PIT)', value: quarterSummary.totalPIT },
    ];

    const lineConfig = {
        data: monthlyData,
        xField: 'month',
        yField: 'revenue',
        smooth: true,
        point: { size: 4 },
        color: '#667eea',
        tooltip: {
            formatter: (datum: { revenue: number }) => ({
                name: 'Doanh thu',
                value: formatCurrency(datum.revenue),
            }),
        },
        yAxis: {
            label: {
                formatter: (v: string) => `${(Number(v) / 1000000).toFixed(0)}M`,
            },
        },
    };

    const pieConfig = {
        data: pieData,
        angleField: 'value',
        colorField: 'type',
        radius: 0.8,
        innerRadius: 0.6,
        label: {
            text: 'type',
            position: 'outside' as const,
        },
        legend: {
            position: 'bottom' as const,
        },
        tooltip: {
            formatter: (datum: { type: string; value: number }) => ({
                name: datum.type,
                value: formatCurrency(datum.value),
            }),
        },
    };

    const unreadNotifications = notifications.filter(n => !n.read).slice(0, 3);

    return (
        <div>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={3} style={{ marginBottom: 4 }}>
                        Xin chào, {hkd?.representative.name || 'Chủ HKD'}! 👋
                    </Title>
                    <Text type="secondary">
                        Tổng quan tình hình kinh doanh Quý {currentQuarter}/{currentYear}
                    </Text>
                    {isExempt && (
                        <Tag color="green" style={{ marginLeft: 12 }}>
                            🌿 HKD Miễn Thuế (Doanh thu năm $\le$ 100M)
                        </Tag>
                    )}
                </div>
                <Space>
                    <Button icon={<PlusOutlined />} type="primary" onClick={() => navigate('/ledger')}>
                        Thêm doanh thu
                    </Button>
                </Space>
            </div>

            {/* Stat Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Doanh thu quý này"
                            value={quarterSummary.totalRevenue}
                            formatter={(value) => formatCurrency(Number(value))}
                            prefix={<DollarOutlined style={{ color: '#667eea' }} />}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary">{transactions.filter(t => dayjs(t.date).year() === currentYear).length} giao dịch năm {currentYear}</Text>
                            <RiseOutlined style={{ color: '#52c41a', marginLeft: 8 }} />
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Thuế phải nộp"
                            value={quarterSummary.totalVAT + quarterSummary.totalPIT}
                            formatter={(value) => formatCurrency(Number(value))}
                            prefix={<DollarOutlined style={{ color: isExempt ? '#52c41a' : '#fa8c16' }} />}
                            valueStyle={{ color: isExempt ? '#52c41a' : '#fa8c16' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary">
                                {isExempt ? 'Không phát sinh thuế (Miễn thuế)' : `VAT: ${formatCurrency(quarterSummary.totalVAT)}`}
                            </Text>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Tỷ lệ thuế"
                            value={taxRate}
                            suffix="%"
                            prefix={<PercentageOutlined style={{ color: '#1890ff' }} />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary">
                                {hkd?.businessSector.nameVi || 'Bán hàng'}
                            </Text>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Hạn kê khai"
                            value={nextDeadline?.daysLeft || 0}
                            suffix="ngày"
                            prefix={<CalendarOutlined style={{ color: nextDeadline && nextDeadline.daysLeft < 30 ? '#f5222d' : '#52c41a' }} />}
                            valueStyle={{ color: nextDeadline && nextDeadline.daysLeft < 30 ? '#f5222d' : '#52c41a' }}
                        />
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary">
                                {nextDeadline ? dayjs(nextDeadline.dueDate).format('DD/MM/YYYY') : 'N/A'}
                            </Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Alert for pending declarations */}
            {nextDeadline && nextDeadline.daysLeft < 30 && (
                <Alert
                    message={`Chú ý: Còn ${nextDeadline.daysLeft} ngày để nộp ${nextDeadline.type} ${nextDeadline.period}`}
                    type="warning"
                    showIcon
                    icon={<ClockCircleOutlined />}
                    action={
                        <Button size="small" onClick={() => navigate('/declarations')}>
                            Kê khai ngay
                        </Button>
                    }
                    style={{ marginBottom: 24 }}
                />
            )}

            {/* Charts */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={16}>
                    <Card title="📈 Xu hướng doanh thu 6 tháng" extra={<Button type="link">Xem chi tiết</Button>}>
                        <Line {...lineConfig} height={280} />
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="🍕 Phân chia thuế quý này">
                        <Pie {...pieConfig} height={280} />
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <Text strong>Tổng thuế: {formatCurrency(quarterSummary.totalVAT + quarterSummary.totalPIT)}</Text>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Quick Actions & Notifications */}
            <Row gutter={[16, 16]}>
                <Col xs={24} lg={12}>
                    <Card title="⚡ Thao tác nhanh">
                        <Row gutter={[12, 12]}>
                            <Col span={12}>
                                <Button
                                    block
                                    size="large"
                                    icon={<PlusOutlined />}
                                    onClick={() => navigate('/ledger')}
                                    style={{ height: 60 }}
                                >
                                    Thêm doanh thu
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button
                                    block
                                    size="large"
                                    icon={<BookOutlined />}
                                    onClick={() => navigate('/ledger')}
                                    style={{ height: 60 }}
                                >
                                    Xem sổ S2a
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button
                                    block
                                    size="large"
                                    icon={<FileTextOutlined />}
                                    onClick={() => navigate('/declarations')}
                                    style={{ height: 60 }}
                                >
                                    Kê khai thuế
                                </Button>
                            </Col>
                            <Col span={12}>
                                <Button
                                    block
                                    size="large"
                                    icon={<DownloadOutlined />}
                                    onClick={() => navigate('/reports')}
                                    style={{ height: 60 }}
                                >
                                    Tải báo cáo
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        title={<><BellOutlined /> Thông báo mới</>}
                        extra={<Button type="link" onClick={() => navigate('/notifications')}>Xem tất cả</Button>}
                    >
                        <List
                            dataSource={unreadNotifications}
                            renderItem={(item) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={
                                            <Space>
                                                <Tag color={
                                                    item.type === 'deadline' ? 'orange' :
                                                        item.type === 'success' ? 'green' :
                                                            item.type === 'warning' ? 'red' : 'blue'
                                                }>
                                                    {item.type === 'deadline' ? 'Hạn nộp' :
                                                        item.type === 'success' ? 'Thành công' :
                                                            item.type === 'warning' ? 'Cảnh báo' : 'Thông tin'}
                                                </Tag>
                                                <Text>{item.title}</Text>
                                            </Space>
                                        }
                                        description={item.message.substring(0, 80) + '...'}
                                    />
                                </List.Item>
                            )}
                            locale={{ emptyText: 'Không có thông báo mới' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Tax Payment Progress */}
            <Card title="📊 Tiến độ nộp thuế năm 2026" style={{ marginTop: 16 }}>
                <Row gutter={[32, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <div style={{ textAlign: 'center' }}>
                            <Progress type="circle" percent={100} size={80} strokeColor="#52c41a" />
                            <div style={{ marginTop: 8 }}>
                                <Text strong>Q4/2025</Text>
                                <br />
                                <Tag color="green">Đã nộp</Tag>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div style={{ textAlign: 'center' }}>
                            <Progress type="circle" percent={30} size={80} strokeColor="#1890ff" />
                            <div style={{ marginTop: 8 }}>
                                <Text strong>Q1/2026</Text>
                                <br />
                                <Tag color="blue">Đang thực hiện</Tag>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div style={{ textAlign: 'center' }}>
                            <Progress type="circle" percent={0} size={80} />
                            <div style={{ marginTop: 8 }}>
                                <Text strong>Q2/2026</Text>
                                <br />
                                <Tag>Chưa đến hạn</Tag>
                            </div>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <div style={{ textAlign: 'center' }}>
                            <Progress type="circle" percent={0} size={80} />
                            <div style={{ marginTop: 8 }}>
                                <Text strong>Q3/2026</Text>
                                <br />
                                <Tag>Chưa đến hạn</Tag>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}
