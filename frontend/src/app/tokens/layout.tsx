import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function TokensLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark-900">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 bg-dark-900">{children}</main>
        </div>
      </div>
    </div>
  );
}
