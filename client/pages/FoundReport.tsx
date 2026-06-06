import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';

export default function FoundReport() {
  const [photo, setPhoto] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pt-24 pb-24 flex justify-center items-center font-roboto">
      <Card className="w-full max-w-xl bg-card border-border text-card-foreground">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-6 font-satoshi uppercase tracking-wider text-foreground">Report Found Item</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-foreground">Item Name</label>
              <Input placeholder="e.g., Metal Flask" className="bg-background border-border focus:border-primary text-foreground" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-foreground">Description</label>
              <Textarea placeholder="Condition, identifying features..." rows={3} className="bg-background border-border focus:border-primary text-foreground" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 text-foreground">Location Found</label>
                <Input placeholder="e.g., Library 2nd Floor" className="bg-background border-border focus:border-primary text-foreground" />
              </div>
              <div>
                <label className="block text-sm mb-1 text-foreground">Date</label>
                <Input type="date" className="bg-background border-border focus:border-primary text-foreground" />
              </div>
            </div>

            {/* SVG Campus Mini-Map Mock */}
            <div>
              <label className="block text-sm mb-1 text-foreground">Pin Location</label>
              <div className="w-full h-32 bg-background border border-border rounded flex items-center justify-center relative cursor-pointer hover:border-primary transition-colors">
                <span className="text-muted-foreground">Tap to pin on campus map</span>
                {/* A simple mock pin */}
                <div className="absolute w-4 h-4 bg-destructive rounded-full top-10 left-1/2"></div>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1 text-foreground">Photo</label>
              <Input type="file" accept="image/*" onChange={handlePhotoUpload} className="bg-background border-border file:text-foreground text-foreground" />
              {photo && (
                <div className="mt-4">
                  <img src={photo} alt="Preview" className="w-full h-48 object-cover rounded border border-border" />
                </div>
              )}
            </div>
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-satoshi uppercase tracking-wider">Submit Report</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
