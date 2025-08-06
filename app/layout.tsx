import '../styles/globals.css';

export const metadata = {
  title: 'Instagram Reel Analyzer',
  description: 'Analyze reels in one click',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  );
}
