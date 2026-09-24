"use client";

import { Layout } from "antd";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { RequireAuth } from "@/components/auth/require-auth";

const { Content } = Layout;

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <Layout style={{ minHeight: "100vh" }}>
        <AppSidebar />
        <Layout>
          <AppTopbar />
          <Content
            className="scrollbar-thin"
            style={{
              padding: 24,
              background: "var(--brand-bg)",
              overflowY: "auto",
            }}
          >
            <div className="max-w-[1400px] mx-auto">{children}</div>
          </Content>
        </Layout>
      </Layout>
    </RequireAuth>
  );
}
