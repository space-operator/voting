'use client';
import { FallbackProps } from 'react-error-boundary';

export const GlobalError = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
        <button onClick={() => resetErrorBoundary()}>Try again</button>
      </body>
    </html>
  );
};
