import Link from 'next/link';

import rt from 'reading-time';
import { loadPages } from '../../../../utils/load';
function readingTime(text: string) {
  return Math.round(rt(text).minutes);
}

export default function ElPais(props: any) {
  return (
    <div className="container mx-auto">
      <div className="mx-2">
        <h1 className="text-4xl font-bold">El Pais</h1>
        <h2 className="text-xl">Brazilian portuguese to Spain Spanish</h2>
        <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
          {props.pages.map((p: any) => (
            <Page p={p} key={p.id}></Page>
          ))}
        </div>
      </div>
    </div>
  );
}

function Preview(props: any) {
  return (
    <div className="flex-1 flex flex-col justify-between">
      <div>
        <h3 className="text-base text-gray-800 font-semibold">
          {props.p1.title}
        </h3>
        <h4 className="text-sm text-gray-800">
          Reading Time: {readingTime(props.p1.textContent)} minutes
        </h4>
      </div>

      <div>
        <Link href={`/elpais/${props.id}`} passHref>
          <a className="bg-lime-500 hover:bg-lime-700 mt-8 float-right py-2 px-8 rounded">
            Read
          </a>
        </Link>
      </div>
    </div>
  );
}

function Page(props: any) {
  // max-w-md py-4 px-8 bg-white shadow-lg rounded-lg my-20
  return (
    <div className="shadow-lg rounded-lg my-8 flex flex-col bg-white bg-gray-50 overflow-hidden">
      <img className="w-full h-64 object-cover" src={props.p['pt-br'].image} />
      <div className="flex flex-1 space-x-4 p-4 bg-gray-50">
        <Preview id={props.p.id} p1={props.p['pt-br']} p2={props.p['es-es']} />
      </div>
    </div>
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
