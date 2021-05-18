import Link from 'next/link';

export default function SiteLayout(props: any) {
  // TODO
  // landing should have a diff layout
  return (
    <div>
      <div className="bg-black">
        <Navbar></Navbar>
      </div>
      {props.children}
    </div>
  );
}

function Navbar() {
  return (
    <div className="container mx-auto">
      <nav className="flex items-center justify-between flex-wrap bg-teal-500 p-4">
        <div className="flex items-center flex-shrink-0 text-white mr-6">
          <Link href="/" passHref>
            <a className="font-semibold text-xl tracking-tight">espanelm</a>
          </Link>
        </div>
        <div className="block flex-grow flex justify-end lg:items-center lg:w-auto">
          <div className="text-sm lg:flex-grow"></div>
          <div>
            <Link href="/providers" passHref>
              <a
                href="#"
                className="inline-block text-sm px-4 py-2 leading-none text-white border border-white rounded"
              >
                Providers
              </a>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
