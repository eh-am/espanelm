import Link from 'next/link';

export default function Providers() {
  return (
    <div className="container mx-auto mt-4">
      <h1>El Pais</h1>
      <p>El País is a Spanish-language daily newspaper in Spain</p>
      <p>We currently support the following languages:</p>
      <ul>
        <li>
          <Link href="/providers/elpais/pt-br/es-es" passHref>
            pt-br to es-es
          </Link>
        </li>
      </ul>
    </div>
  );
}
