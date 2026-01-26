import { useState } from 'react';
import {
    Card,
    Typography,
    Tabs,
    Form,
    Input,
    Button,
    Switch,
    Select,
    Space,
    Divider,
    Tag,
    Row,
    Col,
    Statistic,
    Avatar,
    message,
    Descriptions,
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    BellOutlined,
    CrownOutlined,
    SaveOutlined,
    EditOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../../store';
import { formatCurrency, businessSectors } from '../../mock/data';

const { Title, Text, Paragraph } = Typography;

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const { user, hkd, settings, subscription, updateSettings, updateHKD } = useAppStore();
    const [form] = Form.useForm();
    const [accountForm] = Form.useForm();

    const handleSaveProfile = async () => {
        try {
            const values = await form.validateFields();
            const sector = businessSectors.find(s => s.code === values.sector);
            updateHKD({
                ...values,
                businessSector: sector
            });
            message.success('Đã lưu thông tin hồ sơ HKD');
        } catch (error) {
            message.error('Vui lòng kiểm tra lại thông tin');
        }
    };

    const handleSaveAccount = async () => {
        try {
            await accountForm.validateFields();
            // In a real app, we would update user info here
            message.success('Đã cập nhật thông tin tài khoản');
        } catch (error) {
            message.error('Vui lòng kiểm tra lại thông tin');
        }
    };

    const handleSaveNotifications = (values: typeof settings.notifications) => {
        updateSettings({ notifications: values });
        message.success('Đã cập nhật cài đặt thông báo');
    };

    const planNames: Record<string, string> = {
        free: 'Miễn phí',
        basic: 'Cơ bản',
        pro: 'Chuyên nghiệp',
        enterprise: 'Doanh nghiệp',
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 4 }}>⚙️ Cài Đặt</Title>
                <Text type="secondary">Quản lý hồ sơ, tài khoản và tùy chọn</Text>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                tabPosition="left"
                items={[
                    {
                        key: 'profile',
                        label: <Space><UserOutlined />Hồ sơ HKD</Space>,
                        children: (
                            <Card title="Thông tin Hộ Kinh Doanh">
                                <Descriptions bordered column={2}>
                                    <Descriptions.Item label="Mã số thuế">
                                        <Text strong style={{ color: '#1890ff' }}>{hkd?.mst}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Nhóm HKD">
                                        <Tag color="blue">Nhóm {hkd?.group}</Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Tên HKD" span={2}>{hkd?.name}</Descriptions.Item>
                                    <Descriptions.Item label="Địa chỉ" span={2}>
                                        {hkd?.address}, {hkd?.ward}, {hkd?.district}, {hkd?.province}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Ngành nghề">{hkd?.businessSector.nameVi}</Descriptions.Item>
                                    <Descriptions.Item label="Tỷ lệ thuế">
                                        VAT {hkd?.businessSector.vatRate}% + PIT {hkd?.businessSector.pitRate}%
                                    </Descriptions.Item>
                                </Descriptions>
                                <Divider />
                                <Form
                                    form={form}
                                    layout="vertical"
                                    style={{ maxWidth: 500 }}
                                    initialValues={{
                                        name: hkd?.name,
                                        address: hkd?.address,
                                        sector: hkd?.businessSector.code
                                    }}
                                >
                                    <Form.Item name="name" label="Tên Hộ Kinh Doanh">
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="address" label="Địa chỉ">
                                        <Input />
                                    </Form.Item>
                                    <Form.Item name="sector" label="Ngành nghề kinh doanh">
                                        <Select
                                            options={businessSectors.map(s => ({
                                                value: s.code,
                                                label: `${s.nameVi} (VAT ${s.vatRate}%, TNCN ${s.pitRate}%)`,
                                            }))}
                                        />
                                    </Form.Item>
                                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveProfile}>
                                        Lưu thay đổi
                                    </Button>
                                </Form>
                            </Card>
                        ),
                    },
                    {
                        key: 'account',
                        label: <Space><LockOutlined />Tài khoản</Space>,
                        children: (
                            <Card title="Cài đặt tài khoản">
                                <Form
                                    form={accountForm}
                                    layout="vertical"
                                    style={{ maxWidth: 400 }}
                                    initialValues={{
                                        email: user?.email,
                                        phone: user?.phone
                                    }}
                                >
                                    <Form.Item name="email" label="Email">
                                        <Input suffix={<EditOutlined />} />
                                    </Form.Item>
                                    <Form.Item name="phone" label="Số điện thoại">
                                        <Input suffix={<EditOutlined />} />
                                    </Form.Item>
                                    <Divider />
                                    <Form.Item label="Đổi mật khẩu">
                                        <Input.Password placeholder="Mật khẩu hiện tại" style={{ marginBottom: 8 }} />
                                        <Input.Password placeholder="Mật khẩu mới" style={{ marginBottom: 8 }} />
                                        <Input.Password placeholder="Xác nhận mật khẩu mới" />
                                    </Form.Item>
                                    <Form.Item label="Xác thực hai lớp (2FA)">
                                        <Switch
                                            checked={settings.twoFactorEnabled}
                                            onChange={(checked) => updateSettings({ twoFactorEnabled: checked })}
                                        />
                                    </Form.Item>
                                    <Button type="primary" icon={<SaveOutlined />} onClick={handleSaveAccount}>Lưu thay đổi</Button>
                                </Form>
                            </Card>
                        ),
                    },
                    {
                        key: 'notifications',
                        label: <Space><BellOutlined />Thông báo</Space>,
                        children: (
                            <Card title="Cài đặt thông báo">
                                <Form layout="vertical" initialValues={settings.notifications} onFinish={handleSaveNotifications} style={{ maxWidth: 500 }}>
                                    <Form.Item name="email" label="Email" valuePropName="checked"><Switch /></Form.Item>
                                    <Form.Item name="sms" label="SMS" valuePropName="checked"><Switch /></Form.Item>
                                    <Form.Item name="push" label="Push notification" valuePropName="checked"><Switch /></Form.Item>
                                    <Divider />
                                    <Form.Item name="reminderDays" label="Nhắc nhở trước deadline">
                                        <Select mode="multiple" options={[
                                            { value: 30, label: '30 ngày' },
                                            { value: 10, label: '10 ngày' },
                                            { value: 1, label: '1 ngày' },
                                        ]} />
                                    </Form.Item>
                                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>Lưu cài đặt</Button>
                                </Form>
                            </Card>
                        ),
                    },
                    {
                        key: 'subscription',
                        label: <Space><CrownOutlined />Gói dịch vụ</Space>,
                        children: (
                            <Row gutter={[24, 24]}>
                                <Col span={24}>
                                    <Card>
                                        <Row gutter={24} align="middle">
                                            <Col>
                                                <Avatar size={64} style={{ backgroundColor: '#1890ff' }} icon={<CrownOutlined />} />
                                            </Col>
                                            <Col flex="auto">
                                                <Title level={4} style={{ marginBottom: 4 }}>
                                                    Gói {planNames[subscription?.plan || 'basic']}
                                                    <Tag color="blue" style={{ marginLeft: 12 }}>Đang sử dụng</Tag>
                                                </Title>
                                                <Text type="secondary">Hết hạn: {subscription?.endDate || 'N/A'}</Text>
                                            </Col>
                                            <Col>
                                                <Statistic title="Chi phí" value={subscription?.price || 0} formatter={(v) => formatCurrency(Number(v))} suffix="/năm" />
                                            </Col>
                                        </Row>
                                    </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Card title="Gói Miễn phí" extra={<Tag>FREE</Tag>}>
                                        <Paragraph>Dành cho HKD dưới 500M</Paragraph>
                                        <Statistic value={0} prefix="₫" suffix="/tháng" />
                                    </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Card title="Gói Cơ bản" extra={<Tag color="blue">BASIC</Tag>} style={{ borderColor: '#1890ff' }}>
                                        <Paragraph>Dành cho HKD Nhóm 2</Paragraph>
                                        <Statistic value={199000} prefix="₫" suffix="/tháng" />
                                        <Button type="primary" block style={{ marginTop: 16 }}>Nâng cấp</Button>
                                    </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Card title="Gói Pro" extra={<Tag color="gold">PRO</Tag>} style={{ borderColor: '#ffd700' }}>
                                        <Paragraph>Dành cho Kế toán viên</Paragraph>
                                        <Statistic value={699000} prefix="₫" suffix="/tháng" />
                                        <Button type="primary" block style={{ marginTop: 16 }}>Nâng cấp</Button>
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
