import './globals.css';

export const metadata = {
  title: 'Benner Observatory',
  description: 'Track sourced market facts alongside Benner cycle hypotheses.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
