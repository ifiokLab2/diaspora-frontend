import Link from 'next/link';
export default function Footer() {
  return (
    <div className="px-4 sm:px-6 md:px-8 mt-12 py-6 border-t border-border/30 text-center">
      <p className="text-xs text-muted-foreground">
      © {new Date().getFullYear()} DBLKS Seller Dashboard. All rights reserved.
      </p>
    </div>
  );
}