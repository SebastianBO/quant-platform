'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#0a0a0a',
          color: '#fff',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Something went wrong</h2>
          <p style={{ color: '#888', marginBottom: '2rem' }}>
            We apologize for the inconvenience. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.75rem 2rem',
              fontSize: '1rem',
              backgroundColor: '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
