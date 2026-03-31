import Link from 'next/link';
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 border-t">
      <div className="container mx-auto px-4 pb-20 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <h4 className="text-white font-bold mb-4">Support</h4>
          <ul className="space-y-2 text-sm">
            <Link href = "/contact" className="cursor-pointer">Contact us</Link>
            
          </ul>
        </div>
        <div>
          <h4 className="text-white font-bold mb-4">About DiasporaBlack</h4>
          <ul className="space-y-2 text-sm">
            <Link href = "/about" className="cursor-pointer">About us</Link>
            
          </ul>
        </div>
        <div className="col-span-2">
          <h4 className="text-white font-bold mb-4">MAKE MONEY WITH DiasporaBlack</h4>
          <Link href = "/signup/seller" className="cursor-pointer">Become a seller</Link>
          
        </div>
      </div>
    </footer>
  );
}