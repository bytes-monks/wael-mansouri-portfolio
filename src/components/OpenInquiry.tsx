import { useInquiry } from './InquiryProvider';

export default function OpenInquiry({
  children,
  className = 'btn',
  pkg,
}: {
  children: React.ReactNode;
  className?: string;
  pkg?: string;
}) {
  const { openInquiry } = useInquiry();
  return (
    <button type="button" className={className} onClick={() => openInquiry(pkg)}>
      {children}
    </button>
  );
}
