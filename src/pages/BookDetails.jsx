import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "../components/home/Footer";

export default function BookDetails() {
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get("id");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <main className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-[#1e3a5f] mb-3">Book Details</h1>
        <p className="text-gray-600 mb-8">
          {bookId
            ? `Book details for ID ${bookId} aren't wired up yet.`
            : "This page isn't wired up yet."}
        </p>
        <Button asChild>
          <Link to="/books">Back to Books</Link>
        </Button>
      </main>
      <Footer />
    </div>
  );
}

