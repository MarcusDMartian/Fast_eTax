import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    Space,
    Steps,
    message,
    Result,
} from 'antd';
import {
    UserOutlined,
    LockOutlined,
    MobileOutlined,
    MailOutlined,
    SafetyOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function RegisterPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinishStep1 = async (_values: { email: string; phone: string }) => {
        setLoading(true);
        // Mock OTP send
        await new Promise((resolve) => setTimeout(resolve, 1000));
        message.success('Mã OTP đã được gửi đến số điện thoại');
        setLoading(false);
        setCurrentStep(1);
    };

    const onFinishStep2 = async (_values: { otp: string }) => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoading(false);
        setCurrentStep(2);
    };

    const onFinishStep3 = async (_values: { password: string }) => {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        message.success('Đăng ký thành công!');
        setLoading(false);
        setCurrentStep(3);
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
                    maxWidth: 480,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    borderRadius: 16,
                }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Title level={2} style={{ marginBottom: 8, color: '#667eea' }}>
                            ⚡ Đăng ký E-Tax HKD
                        </Title>
                        <Paragraph type="secondary">
                            Tạo tài khoản miễn phí trong 2 phút
                        </Paragraph>
                    </div>

                    <Steps
                        current={currentStep}
                        size="small"
                        items={[
                            { title: 'Thông tin' },
                            { title: 'Xác thực' },
                            { title: 'Mật khẩu' },
                            { title: 'Hoàn tất' },
                        ]}
                    />

                    {currentStep === 0 && (
                        <Form
                            name="register-step1"
                            onFinish={onFinishStep1}
                            layout="vertical"
                            requiredMark={false}
                        >
                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email' },
                                    { type: 'email', message: 'Email không hợp lệ' },
                                ]}
                            >
                                <Input
                                    prefix={<MailOutlined />}
                                    placeholder="Email"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                                    {
                                        pattern: /^(0[3|5|7|8|9])+([0-9]{8})$/,
                                        message: 'Số điện thoại không hợp lệ',
                                    },
                                ]}
                            >
                                <Input
                                    prefix={<MobileOutlined />}
                                    placeholder="Số điện thoại"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                name="fullName"
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
                            >
                                <Input
                                    prefix={<UserOutlined />}
                                    placeholder="Họ và tên"
                                    size="large"
                                />
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
                                        background:
                                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                    }}
                                >
                                    Tiếp tục
                                </Button>
                            </Form.Item>
                        </Form>
                    )}

                    {currentStep === 1 && (
                        <Form
                            name="register-step2"
                            onFinish={onFinishStep2}
                            layout="vertical"
                            requiredMark={false}
                        >
                            <div
                                style={{
                                    textAlign: 'center',
                                    marginBottom: 24,
                                    padding: 16,
                                    background: '#f0f5ff',
                                    borderRadius: 8,
                                }}
                            >
                                <SafetyOutlined
                                    style={{ fontSize: 32, color: '#667eea', marginBottom: 8 }}
                                />
                                <Paragraph>
                                    Mã xác thực OTP đã được gửi đến số điện thoại của bạn
                                </Paragraph>
                            </div>

                            <Form.Item
                                name="otp"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mã OTP' },
                                    { len: 6, message: 'Mã OTP phải có 6 chữ số' },
                                ]}
                            >
                                <Input.OTP length={6} size="large" />
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
                                        background:
                                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                    }}
                                >
                                    Xác thực
                                </Button>
                            </Form.Item>

                            <Button type="link" block onClick={() => setCurrentStep(0)}>
                                Quay lại
                            </Button>
                        </Form>
                    )}

                    {currentStep === 2 && (
                        <Form
                            name="register-step3"
                            onFinish={onFinishStep3}
                            layout="vertical"
                            requiredMark={false}
                        >
                            <Form.Item
                                name="password"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mật khẩu' },
                                    { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Mật khẩu"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: 'Vui lòng xác nhận mật khẩu' },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu không khớp'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password
                                    prefix={<LockOutlined />}
                                    placeholder="Xác nhận mật khẩu"
                                    size="large"
                                />
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
                                        background:
                                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                    }}
                                >
                                    Tạo tài khoản
                                </Button>
                            </Form.Item>
                        </Form>
                    )}

                    {currentStep === 3 && (
                        <Result
                            status="success"
                            title="Đăng ký thành công!"
                            subTitle="Chào mừng bạn đến với E-Tax HKD. Bước tiếp theo là thiết lập hồ sơ Hộ Kinh Doanh của bạn."
                            extra={[
                                <Button
                                    type="primary"
                                    key="setup"
                                    onClick={() => navigate('/profile-setup')}
                                    style={{
                                        background:
                                            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none',
                                    }}
                                >
                                    Thiết lập hồ sơ HKD
                                </Button>,
                                <Button key="login" onClick={() => navigate('/login')}>
                                    Đăng nhập
                                </Button>,
                            ]}
                        />
                    )}

                    {currentStep < 3 && (
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary">Đã có tài khoản? </Text>
                            <Link to="/login">Đăng nhập</Link>
                        </div>
                    )}
                </Space>
            </Card>
        </div>
    );
}
