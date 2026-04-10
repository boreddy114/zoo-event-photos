import './globals.css';

export const metadata = {
  title: 'CO4Kids Events - Zoo Photo Gallery',
  description: 'Share your wonderful zoo moments with your family!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
