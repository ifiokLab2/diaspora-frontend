import { CheckCircle } from "lucide-react";

interface CheckoutSectionProps {
  number: number;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

const CheckoutSection = ({ number, title, children, action }: CheckoutSectionProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between border-b-2 border-border pb-2 mb-0">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-[#6dbd28] fill-[#6dbd28] stroke-card" />
          
          <h2 className="text-sm font-bold text-card-foreground">
            {number}. {title}
          </h2>
        </div>
        {action && action}
      </div>
      <div className="border border-t-0 border-border bg-card p-5">
        {children}
      </div>
    </div>
  );
};

export default CheckoutSection;
