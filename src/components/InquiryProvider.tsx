import { createContext, useCallback, useContext, useState } from 'react';
import InquiryDrawer from './InquiryDrawer';

type Ctx = { openInquiry: (pkg?: string) => void };
const InquiryContext = createContext<Ctx>({ openInquiry: () => {} });

export const useInquiry = () => useContext(InquiryContext);

export function InquiryProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pkg, setPkg] = useState<string | undefined>();
  const openInquiry = useCallback((p?: string) => {
    setPkg(p);
    setOpen(true);
  }, []);

  return (
    <InquiryContext.Provider value={{ openInquiry }}>
      {children}
      <InquiryDrawer open={open} pkg={pkg} onClose={() => setOpen(false)} />
    </InquiryContext.Provider>
  );
}
