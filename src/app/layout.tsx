import type { Metadata } from "next";
import "./globals.css";
import SearchBar from "../components/SearchBar";

export const metadata: Metadata = {
  title: "BlogNetwork",
  description: "A modern blog platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-brand">
              <a href="/" className="brand-link">
                <h1>BlogNetwork</h1>
              </a>
            </div>
            <SearchBar />
            <div className="nav-menu">
              <a href="/create" className="nav-link">Create An Article</a>
            </div>
          </div>
        </nav>
        
        <main className="main-content">
          {children}
        </main>
        
        <footer className="footer">
          <div className="footer-container">
            <div className="footer-content">
              <div className="footer-section">
                <h3>BlogNetwork</h3>
                <p>Making the blog great again.</p>
              </div>
              <div className="footer-section">
                <h4>Quick Links</h4>
                <ul>
                  <li><a href="/">Home</a></li>
                  <li><a href="/create">Create Article</a></li>
                </ul>
              </div>
              <div className="footer-section">
                <h4>Connect</h4>
                <ul>
                  <li><a href="#twitter">Twitter</a></li>
                  <li><a href="#linkedin">LinkedIn</a></li>
                  <li><a href="#github">GitHub</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2024 BlogNetwork. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
