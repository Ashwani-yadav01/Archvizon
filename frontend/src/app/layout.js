import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export const metadata = {
  title: 'Archvizon — Architectural Visualization Platform',
  description: 'Client and production-management platform for photorealistic CGI rendering, virtual staging, and virtual walkthroughs.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
