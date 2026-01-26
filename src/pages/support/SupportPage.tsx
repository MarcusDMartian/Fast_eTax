import { useState } from 'react';
import {
    Card,
    Typography,
    Tabs,
    Input,
    List,
    Avatar,
    Space,
    Button,
    Collapse,
    Tag,
    Row,
    Col,
} from 'antd';
import {
    QuestionCircleOutlined,
    MessageOutlined,
    VideoCameraOutlined,
    RobotOutlined,
    SendOutlined,
    SearchOutlined,
    BookOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const faqData = [
    {
        key: '1',
        label: 'HKD có doanh thu dưới 500 triệu/năm có phải nộp thuế không?',
        children: 'Không. Theo quy định từ 01/01/2026, HKD có doanh thu dưới 500 triệu VND/năm được miễn hoàn toàn thuế GTGT và TNCN.',
    },
    {
        key: '2',
        label: 'Làm sao để biết HKD của tôi thuộc Nhóm mấy?',
        children: 'Dựa vào doanh thu năm: Nhóm 1 (<500M), Nhóm 2 (500M-3B), Nhóm 3 (3B-50B), Nhóm 4 (>50B).',
    },
    {
        key: '3',
        label: 'Hạn nộp tờ khai thuế quý là khi nào?',
        children: 'Q1: 30/04, Q2: 31/07, Q3: 02/11, Q4: 31/01 năm sau.',
    },
    {
        key: '4',
        label: 'Tỷ lệ thuế GTGT và TNCN của ngành bán hàng là bao nhiêu?',
        children: 'Ngành bán hàng: VAT 1%, TNCN 0.5%, tổng 1.5% trên doanh thu.',
    },
    {
        key: '5',
        label: 'Sổ S2a-HKD là gì và phải lưu trữ bao lâu?',
        children: 'Sổ S2a-HKD là sổ theo dõi doanh thu theo quy định. HKD Nhóm 2 bắt buộc lập và lưu trữ 5 năm.',
    },
];

const chatMessages = [
    { role: 'bot', content: 'Xin chào! Tôi là trợ lý thuế AI. Tôi có thể giúp gì cho bạn?' },
];

export default function SupportPage() {
    const [activeTab, setActiveTab] = useState('faq');
    const [messages, setMessages] = useState(chatMessages);
    const [inputValue, setInputValue] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredFaq = faqData.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.children.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = () => {
        if (!inputValue.trim()) return;

        setMessages([
            ...messages,
            { role: 'user', content: inputValue },
            { role: 'bot', content: 'Cảm ơn bạn đã hỏi! Đây là chế độ demo. Trong phiên bản thực, AI sẽ trả lời câu hỏi về thuế HKD.' },
        ]);
        setInputValue('');
    };

    return (
        <div>
            <div style={{ marginBottom: 24 }}>
                <Title level={3} style={{ marginBottom: 4 }}>❓ Hỗ Trợ & Trợ Giúp</Title>
                <Text type="secondary">Câu hỏi thường gặp, hướng dẫn và trợ lý AI</Text>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: 'faq',
                        label: <Space><QuestionCircleOutlined />FAQ</Space>,
                        children: (
                            <Card>
                                <Input
                                    placeholder="Tìm kiếm câu hỏi..."
                                    prefix={<SearchOutlined />}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ marginBottom: 24, maxWidth: 400 }}
                                    allowClear
                                />
                                <Collapse items={filteredFaq} />
                            </Card>
                        ),
                    },
                    {
                        key: 'guides',
                        label: <Space><BookOutlined />Hướng dẫn</Space>,
                        children: (
                            <Row gutter={[16, 16]}>
                                {[
                                    { title: 'Bắt đầu với E-Tax', desc: 'Hướng dẫn đăng ký và thiết lập hồ sơ HKD' },
                                    { title: 'Nhập doanh thu', desc: 'Cách ghi nhận doanh thu hàng ngày' },
                                    { title: 'Kê khai thuế quý', desc: 'Quy trình kê khai và nộp tờ khai' },
                                    { title: 'Liên kết ngân hàng', desc: 'Đồng bộ giao dịch tự động' },
                                ].map((guide, i) => (
                                    <Col xs={24} md={12} key={i}>
                                        <Card hoverable>
                                            <Space>
                                                <Avatar style={{ backgroundColor: '#667eea' }}>{i + 1}</Avatar>
                                                <div>
                                                    <Text strong>{guide.title}</Text>
                                                    <br />
                                                    <Text type="secondary">{guide.desc}</Text>
                                                </div>
                                            </Space>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        ),
                    },
                    {
                        key: 'videos',
                        label: <Space><VideoCameraOutlined />Video</Space>,
                        children: (
                            <List
                                grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                                dataSource={[
                                    { title: 'Giới thiệu E-Tax HKD', duration: '5:30' },
                                    { title: 'Cách tính thuế VAT và TNCN', duration: '8:15' },
                                    { title: 'Hướng dẫn kê khai thuế quý', duration: '12:00' },
                                ]}
                                renderItem={(item) => (
                                    <List.Item>
                                        <Card hoverable style={{ textAlign: 'center' }}>
                                            <VideoCameraOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 16 }} />
                                            <Title level={5}>{item.title}</Title>
                                            <Tag>{item.duration}</Tag>
                                            <Button type="primary" block style={{ marginTop: 16 }}>Xem video</Button>
                                        </Card>
                                    </List.Item>
                                )}
                            />
                        ),
                    },
                    {
                        key: 'ai',
                        label: <Space><RobotOutlined />Trợ lý AI</Space>,
                        children: (
                            <Card title="🤖 Trợ lý Thuế AI" style={{ maxWidth: 600 }}>
                                <div style={{ height: 300, overflowY: 'auto', marginBottom: 16, padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
                                    {messages.map((msg, i) => (
                                        <div key={i} style={{ marginBottom: 12, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                                            <Tag color={msg.role === 'user' ? 'blue' : 'green'}>
                                                {msg.role === 'user' ? 'Bạn' : 'AI'}
                                            </Tag>
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '8px 16px',
                                                borderRadius: 16,
                                                background: msg.role === 'user' ? '#1890ff' : '#fff',
                                                color: msg.role === 'user' ? '#fff' : '#000',
                                                marginTop: 4,
                                                maxWidth: '80%',
                                            }}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Space.Compact style={{ width: '100%' }}>
                                    <TextArea
                                        rows={2}
                                        placeholder="Hỏi về thuế HKD..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                                    />
                                    <Button type="primary" icon={<SendOutlined />} onClick={handleSendMessage} style={{ height: 'auto' }}>
                                        Gửi
                                    </Button>
                                </Space.Compact>
                            </Card>
                        ),
                    },
                    {
                        key: 'contact',
                        label: <Space><MessageOutlined />Liên hệ</Space>,
                        children: (
                            <Row gutter={[24, 24]}>
                                <Col xs={24} md={8}>
                                    <Card style={{ textAlign: 'center' }}>
                                        <MessageOutlined style={{ fontSize: 40, color: '#1890ff', marginBottom: 16 }} />
                                        <Title level={5}>Chat trực tiếp</Title>
                                        <Paragraph type="secondary">9:00 - 17:00, T2-T6</Paragraph>
                                        <Button type="primary">Bắt đầu chat</Button>
                                    </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Card style={{ textAlign: 'center' }}>
                                        <span style={{ fontSize: 40, marginBottom: 16, display: 'block' }}>📧</span>
                                        <Title level={5}>Email</Title>
                                        <Paragraph type="secondary">support@etax.vn</Paragraph>
                                        <Button>Gửi email</Button>
                                    </Card>
                                </Col>
                                <Col xs={24} md={8}>
                                    <Card style={{ textAlign: 'center' }}>
                                        <span style={{ fontSize: 40, marginBottom: 16, display: 'block' }}>📞</span>
                                        <Title level={5}>Hotline</Title>
                                        <Paragraph type="secondary">1900 xxxx</Paragraph>
                                        <Button>Gọi ngay</Button>
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
