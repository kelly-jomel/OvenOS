export function generateStaticParams() {
  return [{ bakery_id: '1' }];
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
