// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body style={{ margin: 0, backgroundColor: '#f0f0f0' }}>
        {children}
      </body>
    </html>
  );
}
