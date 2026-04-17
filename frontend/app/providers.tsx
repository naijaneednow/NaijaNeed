'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useMemo } from 'react';
import { ThemeProvider } from 'next-themes';
import { NextIntlClientProvider } from 'next-intl';
import { LocaleProvider, useLocale } from '@/hooks/useLocale';

// Import messages
import en from '@/messages/en.json';
import pcm from '@/messages/pcm.json';
import yo from '@/messages/yo.json';
import ha from '@/messages/ha.json';
import ig from '@/messages/ig.json';

const messagesMap = { en, pcm, yo, ha, ig };

import ScrollingBanner from '@/components/ScrollingBanner';

function IntlWrapper({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const messages = useMemo(() => messagesMap[locale] || en, [locale]);

  // Safely extract banner messages
  const bannerMessages = (messages as any).Banner?.messages || [];

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ScrollingBanner messages={bannerMessages} speed={80} />
      {children}
    </NextIntlClientProvider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60,  // 1 minute global default
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false, 
      }
    }
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LocaleProvider>
          <IntlWrapper>
            {children}
          </IntlWrapper>
        </LocaleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
