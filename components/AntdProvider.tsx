'use client';

import { ConfigProvider } from 'antd';

export default function AntdProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#ff8000',
          colorBgBase: '#FDFBD4',
          colorBgContainer: '#fffef0',
          colorText: '#1c1a10',
          colorTextSecondary: '#6b6540',
          borderRadius: 12,
          wireframe: false,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
