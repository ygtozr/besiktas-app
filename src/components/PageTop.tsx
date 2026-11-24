import { Link } from 'react-router';
import { IconGear } from './Icons';

/** Sayfa başlığı + sağda ayarlar düğmesi. */
export function PageTop({
  children,
  wordmark = false,
}: {
  children: React.ReactNode;
  wordmark?: boolean;
}) {
  return (
    <div className="topline">
      <h1 className={wordmark ? 'wordmark' : 'page-h'}>{children}</h1>
      <Link to="/ayarlar" className="icon-btn" aria-label="Ayarlar">
        <IconGear />
      </Link>
    </div>
  );
}
