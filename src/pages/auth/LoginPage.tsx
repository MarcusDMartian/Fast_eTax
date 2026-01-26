import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Space,
    Divider,
    message,
    Checkbox,
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    MobileOutlined,
    SafetyOutlined,
    BankOutlined,
    IdcardOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../../store';

const { Title, Text, Paragraph } = Typography;

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const login = useAppStore((state) => state.login);

    const onFinish = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            const success = await login(values.email, values.password);
            if (success) {
                message.success('Đăng nhập thành công!');
                navigate('/dashboard');
            } else {
                message.error('Email hoặc mật khẩu không đúng');
            }
        } catch {
            message.error('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
            }}
        >
            <Card
                style={{
                    width: '100%',
                    maxWidth: 420,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    borderRadius: 16,
                }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Title level={2} style={{ marginBottom: 8, color: '#667eea' }}>
                            ⚡ E-Tax HKD
                        </Title>
                        <Paragraph type="secondary">
                            Nền tảng quản lý thuế cho Hộ Kinh Doanh
                        </Paragraph>
                    </div>

                    <Form
                        name="login"
                        onFinish={onFinish}
                        layout="vertical"
                        requiredMark={false}
                        initialValues={{ email: 'demo@etax.vn' }}
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Vui lòng nhập email hoặc SĐT' },
                            ]}
                        >
                            <Input
                                prefix={<UserOutlined />}
                                placeholder="Email hoặc số điện thoại"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined />}
                                placeholder="Mật khẩu"
                                size="large"
                            />
                        </Form.Item>

                        <Form.Item>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
                                <Link to="/forgot-password">Quên mật khẩu?</Link>
                            </div>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                loading={loading}
                                block
                                style={{
                                    height: 48,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                }}
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>
                    </Form>

                    <Divider>Hoặc đăng nhập bằng</Divider>

                    <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Button
                            icon={<IdcardOutlined />}
                            size="large"
                            block
                            style={{ height: 44 }}
                        >
                            VNeID - Định danh điện tử
                        </Button>
                        <Button
                            icon={<BankOutlined />}
                            size="large"
                            block
                            style={{ height: 44 }}
                        >
                            Bank ID - Tài khoản ngân hàng
                        </Button>
                        <Button
                            icon={<MobileOutlined />}
                            size="large"
                            block
                            style={{ height: 44 }}
                        >
                            OTP - Số điện thoại
                        </Button>
                    </Space>

                    <div style={{ textAlign: 'center' }}>
                        <Text type="secondary">Chưa có tài khoản? </Text>
                        <Link to="/register">Đăng ký ngay</Link>
                    </div>

                    <div
                        style={{
                            textAlign: 'center',
                            padding: 16,
                            background: '#f6ffed',
                            borderRadius: 8,
                        }}
                    >
                        <SafetyOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                        <Text style={{ color: '#52c41a' }}>
                            Demo: Nhập bất kỳ email nào để đăng nhập
                        </Text>
                    </div>
                </Space>
            </Card>
        </div>
    );
}
