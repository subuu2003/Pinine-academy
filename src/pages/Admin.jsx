import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { booksApi } from "@/api/booksApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Footer from "../components/home/Footer";

export default function Admin() {
  const { isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/");
    }
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isSignedIn) return <div className="min-h-screen flex items-center justify-center">Please sign in</div>;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: 'PINENE ACADEMY',
    price: '',
    category: 'Class 9',
    description: '',
    subject: 'Physics',
    image_url: ''
  });

  const { data: books = [], isLoading } = useQuery({
    queryKey: ['books'],
    queryFn: () => booksApi.getBooks(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => booksApi.createBook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({ 
        title: "Success!",
        description: "Book added successfully!" 
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add book",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => booksApi.deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      toast({ 
        title: "Success!",
        description: "Book deleted successfully!" 
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete book",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    createMutation.mutate({
      ...formData,
      price: parseFloat(formData.price)
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: 'PINENE ACADEMY',
      price: '',
      category: 'Class 9',
      description: '',
      subject: 'Physics',
      image_url: ''
    });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a5f]">Admin Panel - Book Management</h1>
          <Button 
            onClick={() => setShowForm(!showForm)} 
            className="bg-[#0d9488] hover:bg-[#0f766e] text-white"
          >
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? 'Cancel' : 'Add Book'}
          </Button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-[#1e3a5f] mb-6">Add New Book</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Title *</Label>
                  <Input 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    placeholder="Book title"
                    required 
                  />
                </div>
                <div>
                  <Label>Price (₹) *</Label>
                  <Input 
                    type="number" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    placeholder="Price"
                    required 
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <select 
                    className="w-full border rounded-md p-2 bg-white" 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option>Class 9</option>
                    <option>Class 10</option>
                    <option>Class 11</option>
                    <option>Class 12</option>
                    <option>JEE Prep</option>
                  </select>
                </div>
                <div>
                  <Label>Subject</Label>
                  <select 
                    className="w-full border rounded-md p-2 bg-white" 
                    value={formData.subject} 
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  >
                    <option>Physics</option>
                    <option>Chemistry</option>
                    <option>Mathematics</option>
                    <option>Biology</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label>Image URL</Label>
                  <Input 
                    value={formData.image_url} 
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})} 
                    placeholder="/books/image.jpg or https://..."
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Description</Label>
                  <Textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    placeholder="Book description"
                    className="h-24"
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                className="bg-[#1e3a5f] hover:bg-[#152a47] text-white"
              >
                {createMutation.isPending ? 'Adding...' : 'Add Book'}
              </Button>
            </form>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8">Loading books...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1e3a5f] text-white">
                  <tr>
                    <th className="p-4 text-left">Title</th>
                    <th className="p-4 text-left">Category</th>
                    <th className="p-4 text-left">Subject</th>
                    <th className="p-4 text-left">Price</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.length > 0 ? (
                    books.map((book) => (
                      <tr key={book._id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{book.title}</td>
                        <td className="p-4">{book.category}</td>
                        <td className="p-4">{book.subject}</td>
                        <td className="p-4">₹{book.price}</td>
                        <td className="p-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => deleteMutation.mutate(book._id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-4 text-center text-gray-500">
                        No books found. Add your first book!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
