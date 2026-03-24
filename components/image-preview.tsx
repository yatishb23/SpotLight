'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Upload } from 'lucide-react';
import Image from 'next/image';

interface ImagePreviewProps {
  onImageSelect: (file: File, preview: string) => void;
  previewUrl?: string;
  onRemove?: () => void;
  label?: string;
  accept?: string;
}

export function ImagePreview({
  onImageSelect,
  previewUrl,
  onRemove,
  label = 'Upload Image',
  accept = 'image/*',
}: ImagePreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageSelect(file, reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  if (previewUrl) {
    return (
      <div className="space-y-2">
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-secondary">
          <Image
            src={previewUrl}
            alt="Preview"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Change Image
          </Button>
          {onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onRemove}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-full space-y-2 focus:outline-none"
      >
        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">or drag and drop</p>
      </button>
    </div>
  );
}
