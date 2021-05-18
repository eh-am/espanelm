import Link from 'next/link';
import { loadPages } from '../utils/load';

import ElPais from './elpais/pt-br/es-es';

export default ElPais;
//export default function Home() {
//  return (
//    <div>
//      <Link href="/elpais/pt-br/es-es" passHref>
//        <a>EL PAIS pt-br to es-es</a>
//      </Link>
//    </div>
//  );
//}
//
export async function getStaticProps() {
  const res = loadPages();

  return {
    props: {
      pages: res,
    }, // will be passed to the page component as props
  };
}
