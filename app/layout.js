export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body style={{ margin: 0, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
