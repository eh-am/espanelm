import { loadPages } from './_load';
import Link from 'next/link';

export default function ElPais(props: any) {
  return (
    <div>
      <h1>Pt-br {'<->'} Es-es</h1>
      {props.pages.map((p) => (
        <Page p={p} key={p.id}></Page>
      ))}
    </div>
  );
}

function Page(props: any) {
  return (
    <Link href={'/elpais/' + props.p.id}>
      <div>
        <h3>{props.p['pt-br'].title}</h3>
        <h4>{props.p['es-es'].title}</h4>
      </div>
    </Link>
  );
}
export async function getStaticProps() {
  const res = loadPages();

  return {
    props: {
      pages: res,
    }, // will be passed to the page component as props
  };
}
