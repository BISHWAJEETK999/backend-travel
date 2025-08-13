import { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Hero from "@/components/Hero";
import { Progress } from "@/components/ui/progress";

interface GalleryImage {
  id: string;
  imageUrl: string;
  title: string;
  review: string;
  uploaderName: string;
  uploaderEmail: string;
  isApproved: boolean;
  createdAt: string;
}

export default function Gallery() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadData, setUploadData] = useState({
    imageUrl: "",
    title: "",
    review: "",
    uploaderName: "",
    uploaderEmail: "",
  });

  const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });

  const uploadMutation = useMutation({
    mutationFn: (data: typeof uploadData) => apiRequest("POST", "/api/gallery", data),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your image has been submitted for review. It will appear in the gallery once approved.",
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  const resetForm = () => {
    setShowUploadForm(false);
    setUploadData({
      imageUrl: "",
      title: "",
      review: "",
      uploaderName: "",
      uploaderEmail: "",
    });
    setSelectedFile(null);
    setImagePreview(null);
    setUploadProgress(0);
    setIsProcessingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setIsProcessingImage(true);

    // Create preview and convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setImagePreview(base64String);
      setUploadData(prev => ({
        ...prev,
        imageUrl: base64String
      }));
      setIsProcessingImage(false);
    };

    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
      setIsProcessingImage(false);
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploadMode === 'url') {
      // Validate image URL
      const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      if (!urlPattern.test(uploadData.imageUrl)) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid image URL",
          variant: "destructive",
        });
        return;
      }
    } else {
      // Validate file upload
      if (!uploadData.imageUrl) {
        toast({
          title: "No image selected",
          description: "Please select an image file to upload",
          variant: "destructive",
        });
        return;
      }
    }

    setUploadProgress(25);
    uploadMutation.mutate(uploadData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUploadData({
      ...uploadData,
      [e.target.id]: e.target.value,
    });
  };

  if (isLoading) {
    return (
      <>
        <Hero title="Travel Gallery" subtitle="Share your travel experiences with us!" />
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-center">
              <div className="text-center">Loading gallery...</div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Hero title="Travel Gallery" subtitle="Share your travel experiences with us!" />
      
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            
            {/* Upload Button */}
            <div className="text-center mb-12">
              <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
                <DialogTrigger asChild>
                  <Button className="btn-primary-ttrave" data-testid="upload-image-button">
                    <i className="bi bi-camera me-2"></i>
                    Share Your Travel Photo
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Upload Your Travel Photo</DialogTitle>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Upload Mode Toggle */}
                    <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Upload method:</span>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant={uploadMode === 'file' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setUploadMode('file')}
                          className={uploadMode === 'file' ? 'btn-primary-ttrave' : ''}
                        >
                          <i className="bi bi-upload me-2"></i>
                          Upload File
                        </Button>
                        <Button
                          type="button"
                          variant={uploadMode === 'url' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setUploadMode('url')}
                          className={uploadMode === 'url' ? 'btn-primary-ttrave' : ''}
                        >
                          <i className="bi bi-link-45deg me-2"></i>
                          Image URL
                        </Button>
                      </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="space-y-4">
                      {uploadMode === 'file' ? (
                        <div>
                          <Label className="text-gray-700 block mb-2">
                            Select Image File *
                          </Label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-ttrave-primary transition-colors">
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="hidden"
                              data-testid="upload-file-input"
                            />
                            {!imagePreview ? (
                              <div>
                                <i className="bi bi-cloud-upload text-4xl text-gray-400 mb-3"></i>
                                <p className="text-gray-600 mb-2">
                                  Drag and drop your image here, or click to select
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={isProcessingImage}
                                  data-testid="select-file-button"
                                >
                                  {isProcessingImage ? 'Processing...' : 'Choose Image'}
                                </Button>
                                <p className="text-xs text-gray-500 mt-2">
                                  Supports JPG, PNG, GIF up to 5MB
                                </p>
                              </div>
                            ) : (
                              <div>
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="max-w-full h-48 mx-auto object-cover rounded-lg mb-3"
                                />
                                <p className="text-sm text-gray-600 mb-2">
                                  {selectedFile?.name} ({(selectedFile?.size! / 1024).toFixed(1)} KB)
                                </p>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setImagePreview(null);
                                    setSelectedFile(null);
                                    setUploadData(prev => ({ ...prev, imageUrl: '' }));
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                  }}
                                >
                                  Change Image
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <Label htmlFor="imageUrl" className="text-gray-700">
                            Image URL *
                          </Label>
                          <Input
                            id="imageUrl"
                            type="url"
                            value={uploadData.imageUrl}
                            onChange={handleChange}
                            placeholder="https://example.com/your-image.jpg"
                            required={uploadMode === 'url'}
                            data-testid="upload-image-url"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Paste a direct link to your image from any online source
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="title" className="text-gray-700">
                        Photo Title *
                      </Label>
                      <Input
                        id="title"
                        value={uploadData.title}
                        onChange={handleChange}
                        placeholder="e.g., Sunset at Goa Beach"
                        required
                        data-testid="upload-image-title"
                      />
                    </div>
                    <div>
                      <Label htmlFor="review" className="text-gray-700">
                        Your Travel Experience *
                      </Label>
                      <Textarea
                        id="review"
                        rows={4}
                        value={uploadData.review}
                        onChange={handleChange}
                        placeholder="Share your travel experience, what made this place special..."
                        required
                        data-testid="upload-image-review"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="uploaderName" className="text-gray-700">
                          Your Name *
                        </Label>
                        <Input
                          id="uploaderName"
                          value={uploadData.uploaderName}
                          onChange={handleChange}
                          placeholder="Your full name"
                          required
                          data-testid="upload-uploader-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="uploaderEmail" className="text-gray-700">
                          Your Email *
                        </Label>
                        <Input
                          id="uploaderEmail"
                          type="email"
                          value={uploadData.uploaderEmail}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                          required
                          data-testid="upload-uploader-email"
                        />
                      </div>
                    </div>
                    {/* Upload Progress */}
                    {uploadProgress > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="w-full" />
                      </div>
                    )}

                    <div className="flex space-x-2 pt-4">
                      <Button
                        type="submit"
                        className="btn-primary-ttrave flex-1"
                        disabled={uploadMutation.isPending || isProcessingImage || (uploadMode === 'file' && !uploadData.imageUrl)}
                        data-testid="upload-submit-button"
                      >
                        {uploadMutation.isPending ? "Uploading..." : 
                         isProcessingImage ? "Processing..." : 
                         "Submit for Review"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        className="flex-1"
                        disabled={uploadMutation.isPending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Gallery Grid */}
            {images.length === 0 ? (
              <div className="text-center py-12">
                <i className="bi bi-images text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No photos yet</h3>
                <p className="text-gray-500 mb-6">Be the first to share your travel experience!</p>
                <Button 
                  onClick={() => setShowUploadForm(true)}
                  className="btn-primary-ttrave"
                >
                  Upload First Photo
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {images.map((image) => (
                  <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative">
                      <img
                        src={image.imageUrl}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop";
                        }}
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-lg">{image.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                        {image.review}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>By {image.uploaderName}</span>
                        <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Upload Instructions */}
            <div className="mt-16 bg-white rounded-lg p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">How to Share Your Photos</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <i className="bi bi-cloud-upload text-3xl text-ttrave-blue mb-3"></i>
                  <h4 className="font-semibold mb-2">1. Upload Your Photo</h4>
                  <p className="text-sm text-gray-600">Upload your travel photo to a service like Imgur, Google Drive, or Dropbox</p>
                </div>
                <div className="text-center">
                  <i className="bi bi-link-45deg text-3xl text-ttrave-blue mb-3"></i>
                  <h4 className="font-semibold mb-2">2. Get the Link</h4>
                  <p className="text-sm text-gray-600">Copy the direct image URL and paste it in our form</p>
                </div>
                <div className="text-center">
                  <i className="bi bi-check-circle text-3xl text-ttrave-blue mb-3"></i>
                  <h4 className="font-semibold mb-2">3. Share Your Story</h4>
                  <p className="text-sm text-gray-600">Add your travel experience and submit for review</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}