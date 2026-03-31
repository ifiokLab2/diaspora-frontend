import { Accessibility, Tag, Lock, Home, Lightbulb, History } from "lucide-react";
import workspaceLaptop from "@/assets/workspace-laptop.jpg";
import Image from "next/image";
import Link from 'next/link';

const features = [
  {
    icon: Accessibility,
    text: "Access 100% genuine products from local and international vendors",
  },
  {
    icon: Tag,
    text: "Buy anything you want online at the best price",
  },
  {
    icon: Lock,
    text: "Search order on all platforms, pay on delivery.",
  },
  {
    icon: Home,
    text: "Assisting our customers for the best shopping experience.",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* About Us Heading */}
      <h1 className="text-center text-2xl sm:text-3xl md:text-4xl font-bold text-primary-yellow pt-8 sm:pt-12 pb-6 sm:pb-8 px-4">
        About us
      </h1>

      {/* Hero Banner */}
      <div className="mx-3 sm:mx-4 md:mx-12 lg:mx-20 rounded-lg overflow-hidden relative">
        <div className="flex flex-col sm:flex-row min-h-[200px] sm:min-h-[240px] md:min-h-[280px]">
          {/* Left - Laptop Image */}
          <div className="sm:w-1/2 h-[180px] sm:h-auto">
            <Image
              src={workspaceLaptop}
              alt="Workspace with laptop showing e-commerce"
              className="w-full h-full object-cover"
              height = {50}
              width = {50}

              unoptimized={true}
            />
          </div>
          {/* Right - Orange overlay with glasses icon */}
          <div className="sm:w-1/2 bg-primary-yellow/90 relative flex items-center justify-center p-8 sm:p-12"
            style={{
              backgroundImage: `url(${workspaceLaptop})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-primary-yellow/85" />
            <div className="relative z-10 border-2 border-primary-foreground/40 rounded-lg p-8 sm:p-12 flex items-center justify-center">
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-full border-2 border-primary-foreground" />
                <div className="w-10 h-10 rounded-full border-2 border-primary-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 px-4 sm:px-8 md:px-20 py-10 sm:py-16">
        {features.map((feature, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary-yellow/10 flex items-center justify-center">
              <feature.icon className="w-7 h-7 text-primary-yellow" />
            </div>
            <p className="text-sm text-foreground leading-relaxed">{feature.text}</p>
          </div>
        ))}
      </div>

      {/* Our Vision */}
      <div className="flex flex-col items-center px-4 sm:px-8 md:px-20 py-8 sm:py-12">
        <div className="w-14 h-14 rounded-full bg-primary-yellow/10 flex items-center justify-center mb-3">
          <Lightbulb className="w-7 h-7 text-primary-yellow" />
        </div>
        <h2 className="text-primary-yellow text-lg font-semibold mb-6">Our Vision</h2>
        <p className="text-foreground text-xs sm:text-sm leading-relaxed max-w-5xl text-center overflow-wrap-break-word">
          Our mission is to create a directory of black Origin owned businesses and products in the UK and to provide a platform for these businesses to showcase their products and services. We also provide an online store for customers to purchase products from these businesses. The directory will offer a range of categories to help customers find the businesses that meet their needs. We will also be adding features to the directory such as customer reviews, business locations, and more. The online store will feature products from the businesses listed in the directory, so customers can easily find and purchase products from the businesses they are looking for. We are committed to supporting the black community in the UK and hope to provide an exceptional platform for black businesses to succeed and thrive.
        </p>
      </div>

      {/* History */}
      <div className="flex flex-col items-center px-4 sm:px-8 md:px-20 py-8 sm:py-12">
        <div className="w-14 h-14 rounded-full bg-primary-yellow/10 flex items-center justify-center mb-3">
          <History className="w-7 h-7 text-primary-yellow" />
        </div>
        <h2 className="text-primary-yellow text-lg font-semibold mb-6">History</h2>
        <p className="text-foreground text-xs sm:text-sm leading-relaxed max-w-5xl text-center overflow-wrap-break-word">
          Diaspora Black is a Black Origin Business Directory and Products Stores in the UK. It is the go-to destination for the best in Black origins and African - British owned businesses and products. With an extensive directory and product store, you'll find what will put a smile on your face.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-8 md:px-20 py-8 sm:py-12">
        {[{link:"/",id:"1",title:"Shop Now"},{link:"/listings",id:"2",title: "View services & listings"},{link:"/seller/dashboard",id:"3",title: "Sell on DiasporaBlacks"}, {link:"/seller/dashboard/listings",id:"4",title:"Post ads"}].map((label) => (
          <Link
            key={label.id}
            href = {label.link}
            className="bg-primary-yellow text-center text-primary-foreground font-semibold py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm hover:opacity-90 active:scale-[0.98] transition-all duration-150"
          >
            {label.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default About;
