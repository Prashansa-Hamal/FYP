import { useEdgeStore } from "@/lib/edgestore";
import { useState } from "react";
import { SingleImageDropzone } from "../image-drop-components/single-image-dropzone";
import { Button } from "../ui/button";
import { Upload } from "lucide-react";

interface ImageInputProps {
  value?: string;
  onChange: (url: string | undefined) => void;
  imageUrl?: string;
  isEditing?: boolean;
}

export const ImageInput = ({
  value,
  onChange,
  imageUrl,
  isEditing,
}: ImageInputProps) => {
  const [file, setFile] = useState<File | undefined>();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const { edgestore } = useEdgeStore();

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setProgress(0);

    const res = await edgestore.dineEase.upload({
      file,
      onProgressChange: setProgress,
    });

    onChange(res.url);
    setIsUploading(false);
  };

  return (
    <div className="relative w-fit">
      <SingleImageDropzone
        width={150}
        height={imageUrl ? 300 : 150}
        value={file}
        onChange={(file) => {
          if (!file) {
            setFile(undefined);
            onChange(undefined);
            return;
          }
          setFile(file);
          handleUpload(file);
        }}
        imgUrl={imageUrl}
      />

      {!file && isEditing && (
        <div className="absolute top-4 right-4">
          <Button variant="secondary" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Change Image
          </Button>
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
          <span className="text-white text-sm">{progress}%</span>
        </div>
      )}
    </div>
  );
};
