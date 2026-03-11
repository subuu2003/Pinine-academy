import { SignUp } from "@clerk/clerk-react";
import Footer from "../components/home/Footer";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "mx-auto",
                card: "shadow-lg rounded-xl"
              }
            }}
            redirectUrl="/"
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
