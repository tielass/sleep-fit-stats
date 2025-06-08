import '../styles/globals.css';
import { QueryProvider } from './providers/QueryProvider';

export const metadata = {
  title: 'Sleep-Fit-Stats',
  description: 'Track your sleep and fitness data for better health insights',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
