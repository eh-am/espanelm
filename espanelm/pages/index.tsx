import Link from 'next/link';
export default function Home() {
  return (
    <div>
      <Link href="/elpais/pt-br/es-es" passHref>
        <a>EL PAIS pt-br to es-es</a>
      </Link>
    </div>
  );
}
