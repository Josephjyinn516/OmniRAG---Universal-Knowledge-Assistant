import React from 'react';

interface LayoutProps {
  sidebar: React.ReactNode;
  content: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ sidebar, content }) => {
  return (
    <div className="flex h-screen w-full bg-slate-50">
      <aside className="flex-shrink-0">
        {sidebar}
      </aside>
      <main className="flex-1 overflow-hidden relative">
        {content}
      </main>
    </div>
  );
};

export default Layout;