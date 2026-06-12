import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider as DataProvider } from 'react-redux';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setGlobalTheme } from '@atlaskit/tokens';
import { ColorModeProvider } from './ui/components/color-mode';
import App from './App';
import { store } from './redux/store';
import { system } from './ui/theme';
import { ErrorPage } from './ui/components/error-page';
import { Toaster } from './ui/components/toaster';
import { I18nProvider } from './utilities/i18n';
import { reportError } from './utilities/error-reporting';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './ui/styles/index.css';

const STALE_TIME_MS = 2 * 60 * 1000;
const GC_TIME_MS = 10 * 60 * 1000;

void setGlobalTheme({ colorMode: 'light', light: 'light', dark: 'light', spacing: 'spacing', typography: 'typography', shape: 'shape' });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const ErrorFallback = ({ error }: FallbackProps) => {
  const message = error instanceof Error ? error.message : String(error);
  reportError(error, { context: 'ErrorBoundary' });
  return <ErrorPage message={message} />;
};

const renderApp = (container: HTMLElement) => {
  createRoot(container).render(
    <StrictMode>
      <ChakraProvider value={system}>
        <ColorModeProvider>
          <DataProvider store={store}>
            <QueryClientProvider client={queryClient}>
              <I18nProvider>
                <ErrorBoundary fallbackRender={ErrorFallback}>
                  <App />
                  <Toaster />
                </ErrorBoundary>
              </I18nProvider>
            </QueryClientProvider>
          </DataProvider>
        </ColorModeProvider>
      </ChakraProvider>
    </StrictMode>,
  );
};

const root = document.getElementById('root');
if (root) {
  renderApp(root);
} else {
  reportError('Root element not found', { context: 'bootstrap' });
}
