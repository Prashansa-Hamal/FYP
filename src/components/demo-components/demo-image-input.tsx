// "use client";

import { useEdgeStore } from "@/lib/edgestore";
import { useState } from "react";
import { SingleImageDropzone } from "../image-drop-components/single-image-dropzone";

// import { useState } from "react";
// import { SingleImageDropzone } from "../image-drop-components/single-image-dropzone";
// import { useEdgeStore } from "@/lib/edgestore";

// export const ImageInput = () => {
//   const [file, setFile] = useState<File | undefined>();
//   const [url, setUrl] = useState<string | undefined>();
//   const [progress, setProgress] = useState<number>(0);
//   const [isUploading, setIsUploading] = useState(false);

//   const { edgestore } = useEdgeStore();

//   const handleUpload = async (file: File) => {
//     setIsUploading(true);
//     setProgress(0);

//     const res = await edgestore.dineEase.upload({
//       file,
//       onProgressChange: (progress) => {
//         setProgress(progress);
//       },
//     });

//     setUrl(res.url);
//     setIsUploading(false);
//   };

//   return (
//     <div className="relative w-fit">
//       <SingleImageDropzone
//         width={150}
//         height={150}
//         value={file}
//         onChange={(file) => {
//           if (!file) {
//             // ❌ icon clicked → reset everything
//             setFile(undefined);
//             setUrl(undefined);
//             setProgress(0);
//             return;
//           }

//           setFile(file);
//           handleUpload(file);
//         }}
//       />

//       {/* 🔄 Circular progress overlay */}
//       {isUploading && (
//         <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40">
//           <div className="relative h-16 w-16">
//             <svg className="h-full w-full -rotate-90">
//               <circle
//                 cx="32"
//                 cy="32"
//                 r="28"
//                 stroke="white"
//                 strokeWidth="4"
//                 fill="transparent"
//                 className="opacity-30"
//               />
//               <circle
//                 cx="32"
//                 cy="32"
//                 r="28"
//                 stroke="white"
//                 strokeWidth="4"
//                 fill="transparent"
//                 strokeDasharray={2 * Math.PI * 28}
//                 strokeDashoffset={2 * Math.PI * 28 * (1 - progress / 100)}
//                 className="transition-all duration-150"
//               />
//             </svg>

//             <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
//               {progress}%
//             </span>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

interface ImageInputProps {
  value?: string;
  onChange: (url: string | undefined) => void;
}

export const ImageInput = ({ value, onChange }: ImageInputProps) => {
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
        height={150}
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
      />

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
          <span className="text-white text-sm">{progress}%</span>
        </div>
      )}
    </div>
  );
};
