import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    Layout,
    Menu,
    Avatar,
    Dropdown,
    Badge,
    Button,
    Typography,
    Space,
    theme,
} from 'antd';
import {
    DashboardOutlined,
    BookOutlined,
    CalculatorOutlined,
    FileTextOutlined,
    FileSearchOutlined,
    BankOutlined,
    BarChartOutlined,
    SettingOutlined,
    QuestionCircleOutlined,
    BellOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import { useAppStore } from '../store';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const menuItems = [
    {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: 'Bảng điều khiển',
    },
    {
        key: '/ledger',
        icon: <BookOutlined />,
        label: 'Sổ doanh thu',
    },
    {
        key: '/calculator',
        icon: <CalculatorOutlined />,
        label: 'Máy tính thuế',
    },
    {
        key: '/declarations',
        icon: <FileTextOutlined />,
        label: 'Tờ khai thuế',
    },
    {
        key: '/invoices',
        icon: <FileSearchOutlined />,
        label: 'Hóa đơn',
    },
    {
        key: '/bank',
        icon: <BankOutlined />,
        label: 'Ngân hàng',
    },
    {
        key: '/reports',
        icon: <BarChartOutlined />,
        label: 'Báo cáo',
    },
    {
        key: '/settings',
        icon: <SettingOutlined />,
        label: 'Cài đặt',
    },
    {
        key: '/support',
        icon: <QuestionCircleOutlined />,
        label: 'Hỗ trợ',
    },
];

export default function MainLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = theme.useToken();

    const { user, hkd, logout, notifications, markNotificationRead } = useAppStore();
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMenuClick = (key: string) => {
        navigate(key);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Hồ sơ',
            onClick: () => navigate('/settings'),
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout,
        },
    ];

    const notificationItems = notifications.slice(0, 5).map((n) => ({
        key: n.id,
        label: (
            <div
                style={{ maxWidth: 280, padding: '4px 0' }}
                onClick={() => {
                    markNotificationRead(n.id);
                    if (n.link) navigate(n.link);
                }}
            >
                <Text strong={!n.read} style={{ display: 'block', fontSize: 13 }}>
                    {n.title}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {n.message.substring(0, 60)}...
                </Text>
            </div>
        ),
    }));

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                style={{
                    background: token.colorBgContainer,
                    borderRight: `1px solid ${token.colorBorderSecondary}`,
                }}
                width={240}
            >
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        padding: collapsed ? 0 : '0 24px',
                        borderBottom: `1px solid ${token.colorBorderSecondary}`,
                    }}
                >
                    {collapsed ? (
                        <Text strong style={{ fontSize: 20, color: token.colorPrimary }}>
                            E
                        </Text>
                    ) : (
                        <Text strong style={{ fontSize: 18, color: token.colorPrimary }}>
                            ⚡ E-Tax HKD
                        </Text>
                    )}
                </div>

                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => handleMenuClick(key)}
                    style={{ border: 'none', marginTop: 8 }}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        padding: '0 24px',
                        background: token.colorBgContainer,
                        borderBottom: `1px solid ${token.colorBorderSecondary}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <Space>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                        />
                        {hkd && (
                            <Text type="secondary">
                                MST: {hkd.mst} | {hkd.name}
                            </Text>
                        )}
                    </Space>

                    <Space size="middle">
                        <Dropdown
                            menu={{ items: notificationItems }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Badge count={unreadCount} size="small">
                                <Button type="text" icon={<BellOutlined />} />
                            </Badge>
                        </Dropdown>

                        <Dropdown
                            menu={{ items: userMenuItems }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Space style={{ cursor: 'pointer' }}>
                                <Avatar icon={<UserOutlined />} />
                                <Text>{user?.fullName}</Text>
                            </Space>
                        </Dropdown>
                    </Space>
                </Header>

                <Content
                    style={{
                        margin: 24,
                        padding: 24,
                        background: token.colorBgContainer,
                        borderRadius: token.borderRadiusLG,
                        minHeight: 280,
                        overflow: 'auto',
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}
