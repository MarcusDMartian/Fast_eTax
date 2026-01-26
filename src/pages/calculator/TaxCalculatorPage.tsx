import { useState, useMemo } from 'react';
import {
    Card,
    Row,
    Col,
    Form,
    InputNumber,
    Select,
    Typography,
    Statistic,
    Divider,
    Table,
    Tabs,
    Space,
    Tag,
    Alert,
    Slider,
} from 'antd';
import {
    DollarOutlined,
    PercentageOutlined,
    BulbOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import { businessSectors, formatCurrency, calculateTax } from '../../mock/data';
import type { BusinessSector } from '../../types';

const { Title, Text, Paragraph } = Typography;

export default function TaxCalculatorPage() {
    const [revenue, setRevenue] = useState<number>(500000000);
    const [sector, setSector] = useState<BusinessSector>(businessSectors[0]);
    const [expenses, setExpenses] = useState<number>(300000000);
    const [projectedMonthlyRevenue, setProjectedMonthlyRevenue] = useState<number>(50000000);

    // Method 1: Direct on revenue (Circular 152/2025: Deduct 500M threshold for Group 2)
    const method1 = useMemo(() => calculateTax(revenue, sector, 0, true), [revenue, sector]);

    // Method 2: Profit-based (for Group 3-4)
    const method2 = useMemo(() => {
        const profit = revenue - expenses;
        const pitRate = revenue > 50000000000 ? 0.20 : revenue > 3000000000 ? 0.17 : 0.15;
        return {
            profit,
            pit: Math.max(0, profit * pitRate),
            pitRate: pitRate * 100,
        };
    }, [revenue, expenses]);

    // Best method recommendation
    const recommendation = method1.total < method2.pit ? 'method1' : 'method2';

    // Projection data for next 12 months
    const projectionData = useMemo(() => {
        const data = [];
        let cumRevenue = 0;
        for (let i = 1; i <= 12; i++) {
            cumRevenue += projectedMonthlyRevenue;
            const tax = calculateTax(cumRevenue, sector, 0, true);
            data.push({
                month: `T${i}`,
                revenue: cumRevenue,
                tax: tax.total,
            });
        }
        return data;
    }, [projectedMonthlyRevenue, sector]);

    const taxRateTableData = businessSectors.map((s) => ({
        key: s.code,
        ...s,
        totalRate: s.vatRate + s.pitRate,
    }));

    const taxRateColumns = [
        {
            title: 'Ngành nghề',
            dataIndex: 'nameVi',
            key: 'nameVi',
        },
        {
            title: 'Thuế GTGT (%)',
            dataIndex: 'vatRate',
            key: 'vatRate',
            align: 'center' as const,
            render: (rate: number) => <Tag color="blue">{rate}%</Tag>,
        },
        {
            title: 'Thuế TNCN (%)',
            dataIndex: 'pitRate',
            key: 'pitRate',
            align: 'center' as const,
            render: (rate: number) => <Tag color="orange">{rate}%</Tag>,
        },
        {
            title: 'Tổng (%)',
            dataIndex: 'totalRate',
            key: 'totalRate',
            align: 'center' as const,
            render: (rate: number) => <Tag color="red">{rate}%</Tag>,
        },
    ];

    const projectionConfig = {
        data: projectionData,
        xField: 'month',
        yField: 'tax',
        smooth: true,
        point: { size: 4 },
        color: '#fa8c16',
        tooltip: {
            formatter: (datum: { tax: number }) => ({
                name: 'Thuế lũy kế',
                value: formatCurrency(datum.tax),
            }),
        },
        yAxis: {
            label: {
                formatter: (v: string) => `${(Number(v) / 1000000).toFixed(0)}M`,
            },
        },
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 4 }}>
                    🧮 Máy Tính Thuế HKD
                </Title>
                <Text type="secondary">
                    Tính thuế VAT và TNCN theo tỷ lệ ngành nghề hoặc phương pháp lợi nhuận
                </Text>
            </div>

            <Tabs
                items={[
                    {
                        key: 'quick',
                        label: '⚡ Tính nhanh',
                        children: (
                            <Row gutter={[24, 24]}>
                                <Col xs={24} lg={10}>
                                    <Alert
                                        message="Thông tư 152/2025"
                                        description="Thuế Nhóm 2 hiện được tính trên phần doanh thu vượt ngưỡng 500 triệu VND/năm."
                                        type="warning"
                                        showIcon
                                        style={{ marginBottom: 16 }}
                                    />
                                    <Card title="Nhập thông tin">
                                        <Form layout="vertical">
                                            <Form.Item label="Doanh thu (VND)">
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    size="large"
                                                    min={0}
                                                    step={10000000}
                                                    value={revenue}
                                                    onChange={(v) => setRevenue(v || 0)}
                                                    formatter={(value) =>
                                                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                                    }
                                                    parser={(value) =>
                                                        value?.replace(/,/g, '') as unknown as number
                                                    }
                                                />
                                            </Form.Item>

                                            <Form.Item label="Ngành nghề">
                                                <Select
                                                    size="large"
                                                    value={sector.code}
                                                    onChange={(code) => {
                                                        const s = businessSectors.find((x) => x.code === code);
                                                        if (s) setSector(s);
                                                    }}
                                                    options={businessSectors.map((s) => ({
                                                        value: s.code,
                                                        label: `${s.nameVi} (VAT ${s.vatRate}%, TNCN ${s.pitRate}%)`,
                                                    }))}
                                                />
                                            </Form.Item>

                                            <Divider />

                                            <div
                                                style={{
                                                    background: '#f6ffed',
                                                    padding: 16,
                                                    borderRadius: 8,
                                                    marginBottom: 16,
                                                }}
                                            >
                                                <Space>
                                                    <BulbOutlined style={{ color: '#52c41a', fontSize: 20 }} />
                                                    <Text>
                                                        Tỷ lệ thuế áp dụng: <Text strong>{sector.vatRate + sector.pitRate}%</Text>
                                                    </Text>
                                                </Space>
                                            </div>
                                        </Form>
                                    </Card>
                                </Col>

                                <Col xs={24} lg={14}>
                                    <Card title="Kết quả tính thuế">
                                        <Row gutter={[16, 24]}>
                                            <Col xs={24} sm={8}>
                                                <Statistic
                                                    title="Thuế GTGT (VAT)"
                                                    value={method1.vat}
                                                    formatter={(v) => formatCurrency(Number(v))}
                                                    valueStyle={{ color: '#1890ff' }}
                                                    prefix={<DollarOutlined />}
                                                />
                                                <Tag color="blue" style={{ marginTop: 8 }}>
                                                    {sector.vatRate}% × (Doanh thu - 500M)
                                                </Tag>
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <Statistic
                                                    title="Thuế TNCN (PIT)"
                                                    value={method1.pit}
                                                    formatter={(v) => formatCurrency(Number(v))}
                                                    valueStyle={{ color: '#fa8c16' }}
                                                    prefix={<DollarOutlined />}
                                                />
                                                <Tag color="orange" style={{ marginTop: 8 }}>
                                                    {sector.pitRate}% × (Doanh thu - 500M)
                                                </Tag>
                                            </Col>
                                            <Col xs={24} sm={8}>
                                                <Statistic
                                                    title="Tổng thuế phải nộp"
                                                    value={method1.total}
                                                    formatter={(v) => formatCurrency(Number(v))}
                                                    valueStyle={{ color: '#f5222d', fontSize: 28 }}
                                                    prefix={<DollarOutlined />}
                                                />
                                                <Tag color="red" style={{ marginTop: 8 }}>
                                                    {sector.vatRate + sector.pitRate}% × (Doanh thu - 500M)
                                                </Tag>
                                            </Col>
                                        </Row>

                                        <Divider />

                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Card size="small" style={{ background: '#f0f5ff' }}>
                                                    <Statistic
                                                        title="Thực nhận sau thuế"
                                                        value={revenue - method1.total}
                                                        formatter={(v) => formatCurrency(Number(v))}
                                                        valueStyle={{ color: '#52c41a' }}
                                                    />
                                                </Card>
                                            </Col>
                                            <Col span={12}>
                                                <Card size="small" style={{ background: '#fff7e6' }}>
                                                    <Statistic
                                                        title="Tỷ lệ thuế/Doanh thu"
                                                        value={revenue > 0 ? (method1.total / revenue) * 100 : 0}
                                                        precision={2}
                                                        suffix="%"
                                                        prefix={<PercentageOutlined />}
                                                    />
                                                </Card>
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                            </Row>
                        ),
                    },
                    {
                        key: 'advanced',
                        label: '📊 So sánh phương pháp',
                        children: (
                            <Row gutter={[24, 24]}>
                                <Col xs={24} lg={12}>
                                    <Card
                                        title="Phương pháp 1: Tính trên doanh thu"
                                        extra={
                                            recommendation === 'method1' && (
                                                <Tag color="green">✓ Khuyến nghị</Tag>
                                            )
                                        }
                                    >
                                        <Form layout="vertical">
                                            <Form.Item label="Doanh thu">
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    value={revenue}
                                                    onChange={(v) => setRevenue(v || 0)}
                                                    formatter={(value) =>
                                                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                                    }
                                                    parser={(value) =>
                                                        value?.replace(/,/g, '') as unknown as number
                                                    }
                                                />
                                            </Form.Item>
                                        </Form>

                                        <Divider />

                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Thuế GTGT"
                                                    value={method1.vat}
                                                    formatter={(v) => formatCurrency(Number(v))}
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Thuế TNCN"
                                                    value={method1.pit}
                                                    formatter={(v) => formatCurrency(Number(v))}
                                                />
                                            </Col>
                                        </Row>

                                        <Divider />

                                        <Statistic
                                            title="Tổng thuế"
                                            value={method1.total}
                                            formatter={(v) => formatCurrency(Number(v))}
                                            valueStyle={{
                                                color: recommendation === 'method1' ? '#52c41a' : '#fa8c16',
                                                fontSize: 28,
                                            }}
                                        />
                                    </Card>
                                </Col>

                                <Col xs={24} lg={12}>
                                    <Card
                                        title="Phương pháp 2: Tính trên lợi nhuận"
                                        extra={
                                            recommendation === 'method2' && (
                                                <Tag color="green">✓ Khuyến nghị</Tag>
                                            )
                                        }
                                    >
                                        <Form layout="vertical">
                                            <Form.Item label="Chi phí hợp lệ">
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    value={expenses}
                                                    onChange={(v) => setExpenses(v || 0)}
                                                    formatter={(value) =>
                                                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                                    }
                                                    parser={(value) =>
                                                        value?.replace(/,/g, '') as unknown as number
                                                    }
                                                />
                                            </Form.Item>
                                        </Form>

                                        <Divider />

                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Lợi nhuận"
                                                    value={method2.profit}
                                                    formatter={(v) => formatCurrency(Number(v))}
                                                    valueStyle={{
                                                        color: method2.profit < 0 ? '#f5222d' : undefined,
                                                    }}
                                                />
                                            </Col>
                                            <Col span={12}>
                                                <Statistic
                                                    title="Thuế suất áp dụng"
                                                    value={method2.pitRate}
                                                    suffix="%"
                                                />
                                            </Col>
                                        </Row>

                                        <Divider />

                                        <Statistic
                                            title="Tổng thuế TNCN"
                                            value={method2.pit}
                                            formatter={(v) => formatCurrency(Number(v))}
                                            valueStyle={{
                                                color: recommendation === 'method2' ? '#52c41a' : '#fa8c16',
                                                fontSize: 28,
                                            }}
                                        />
                                    </Card>
                                </Col>

                                <Col span={24}>
                                    <Alert
                                        message={
                                            recommendation === 'method1'
                                                ? `Khuyến nghị: Phương pháp tính trên doanh thu tiết kiệm ${formatCurrency(method2.pit - method1.total)}`
                                                : `Khuyến nghị: Phương pháp tính lợi nhuận tiết kiệm ${formatCurrency(method1.total - method2.pit)}`
                                        }
                                        type="success"
                                        showIcon
                                        icon={<BulbOutlined />}
                                    />
                                </Col>
                            </Row>
                        ),
                    },
                    {
                        key: 'projection',
                        label: '🔮 Dự báo thuế',
                        children: (
                            <Row gutter={[24, 24]}>
                                <Col xs={24} lg={8}>
                                    <Card title="Nhập dự báo">
                                        <Form layout="vertical">
                                            <Form.Item label="Doanh thu dự kiến /tháng">
                                                <InputNumber
                                                    style={{ width: '100%' }}
                                                    value={projectedMonthlyRevenue}
                                                    onChange={(v) => setProjectedMonthlyRevenue(v || 0)}
                                                    formatter={(value) =>
                                                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                                    }
                                                    parser={(value) =>
                                                        value?.replace(/,/g, '') as unknown as number
                                                    }
                                                />
                                            </Form.Item>

                                            <Form.Item label="Điều chỉnh nhanh">
                                                <Slider
                                                    min={10000000}
                                                    max={200000000}
                                                    step={5000000}
                                                    value={projectedMonthlyRevenue}
                                                    onChange={setProjectedMonthlyRevenue}
                                                    marks={{
                                                        10000000: '10M',
                                                        100000000: '100M',
                                                        200000000: '200M',
                                                    }}
                                                />
                                            </Form.Item>
                                        </Form>

                                        <Divider />

                                        <Statistic
                                            title="Doanh thu dự kiến cả năm"
                                            value={projectedMonthlyRevenue * 12}
                                            formatter={(v) => formatCurrency(Number(v))}
                                            valueStyle={{ color: '#1890ff' }}
                                        />

                                        <Statistic
                                            title="Thuế dự kiến cả năm"
                                            value={calculateTax(projectedMonthlyRevenue * 12, sector, 0, true).total}
                                            formatter={(v) => formatCurrency(Number(v))}
                                            valueStyle={{ color: '#fa8c16' }}
                                            style={{ marginTop: 16 }}
                                        />
                                    </Card>
                                </Col>

                                <Col xs={24} lg={16}>
                                    <Card title="Biểu đồ thuế lũy kế theo tháng">
                                        <Line {...projectionConfig} height={350} />
                                    </Card>
                                </Col>
                            </Row>
                        ),
                    },
                    {
                        key: 'rates',
                        label: '📋 Bảng thuế suất',
                        children: (
                            <Card title="Bảng thuế suất theo ngành nghề (HKD Nhóm 2: 500M - 3B)">
                                <Alert
                                    message="Áp dụng từ 01/01/2026"
                                    description="Tỷ lệ thuế trực tiếp trên doanh thu cho Hộ Kinh Doanh có doanh thu 500 triệu - 3 tỷ VND/năm"
                                    type="info"
                                    showIcon
                                    style={{ marginBottom: 24 }}
                                />

                                <Table
                                    columns={taxRateColumns}
                                    dataSource={taxRateTableData}
                                    pagination={false}
                                />

                                <Divider />

                                <Paragraph>
                                    <Text strong>Chú ý:</Text>
                                    <ul>
                                        <li>HKD Nhóm 1 (dưới 500 triệu/năm): <Tag color="green">Miễn thuế hoàn toàn</Tag></li>
                                        <li>HKD Nhóm 3 (3 - 50 tỷ/năm): Tính thuế TNCN 17% trên lợi nhuận</li>
                                        <li>HKD Nhóm 4 (trên 50 tỷ/năm): Tính thuế TNCN 20% trên lợi nhuận</li>
                                    </ul>
                                </Paragraph>
                            </Card>
                        ),
                    },
                ]}
            />
        </div>
    );
}
