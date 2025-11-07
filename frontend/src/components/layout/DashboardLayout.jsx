const DashboardLayout = ({ children, sidebar }) => {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        {sidebar && (
          <aside className="w-80 bg-gray-50 p-4 border-r overflow-y-auto">
            {sidebar}
          </aside>
        )}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
