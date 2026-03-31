"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Crop } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { uploadImage, StorageBucket } from "@/app/image-actions";
import { toast } from "sonner";
import Image from "next/image";
import { ImageCropper } from "./image-cropper";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove: (url: string) => void;
  bucket: StorageBucket;
  className?: string;
  label?: string;
  aspectRatio?: "square" | "video" | "portrait" | "any";
  enableCrop?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  bucket,
  className,
  label = "Upload Image",
  aspectRatio = "any",
  enableCrop = true,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatios = {
    square: 1,
    video: 16 / 9,
    portrait: 3 / 4,
    any: undefined,
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.");
      return;
    }

    if (enableCrop) {
      const reader = new FileReader();
      reader.onload = () => setCropImage(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      await performUpload(file);
    }
  };

  const performUpload = async (file: File | Blob) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file instanceof File ? file : new File([file], "image.webp", { type: "image/webp" }));
      formData.append("bucket", bucket);

      const { data, error } = await uploadImage(formData);

      if (error) {
        toast.error(error);
      } else if (data) {
        onChange(data);
        toast.success("Image uploaded successfully.");
      }
    } catch (err) {
      toast.error("Something went wrong during upload.");
      console.error(err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCropComplete = async (blob: Blob) => {
    setCropImage(null);
    await performUpload(blob);
  };

  const aspectClasses = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    any: "aspect-auto min-h-[200px]",
  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed border-[#E2E8F0] hover:border-[#0D9488] transition-all flex items-center justify-center bg-[#F8FAFC]",
          aspectClasses[aspectRatio],
          value && "border-none"
        )}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="bg-white/90 hover:bg-white text-[#0F172A]"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Change
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(value);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            {isUploading ? (
              <Loader2 className="w-10 h-10 text-[#0D9488] animate-spin" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#F0FDFA] flex items-center justify-center text-[#0D9488] mb-2">
                <Upload className="w-6 h-6" />
              </div>
            )}
            <p className="font-semibold text-[#0F172A]">{isUploading ? "Uploading..." : label}</p>
            <p className="text-xs text-[#64748B]">JPG, PNG or WEBP (Max. 5MB)</p>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        className="hidden"
      />

      {cropImage && (
        <ImageCropper
          image={cropImage}
          onCropComplete={handleCropComplete}
          onCancel={() => {
            setCropImage(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
          aspectRatio={aspectRatios[aspectRatio]}
        />
      )}
    </div>
  );
}
