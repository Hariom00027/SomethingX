const DashboardLayout = ({ children, sidebar }) => {
  return (
    <div>
      <div className="flex">
        <aside className="w-64 bg-gray-50 p-4 border-r">
          {sidebar}
        </aside>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
