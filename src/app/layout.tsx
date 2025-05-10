import '../styles/globals.css';

export const metadata = {
    title: 'Frushion',
  };
  
  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body className="bg-gradient-to-br from-red-800 to-black text-white min-h-screen">
          {children}
        </body>
      </html>
    );
  }
  