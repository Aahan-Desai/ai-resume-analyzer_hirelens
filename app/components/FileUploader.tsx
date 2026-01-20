import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
interface FileUploaderProps {
  onFileSelect: (file: File | null) => void;
}

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const [file, setFile] = useState<File | null>(null)
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0] || null;

    setFile(file);
    onFileSelect?.(file);
  }, [onFileSelect]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    multiple: false,
  })

  return (
    <div className="w-full gradient-border">
      <div {...getRootProps()} className='cursor-pointer'>
        <input {...getInputProps()} />
        {file ? (
          <div className='uploader-selected-file' onClick={(e) => e.stopPropagation()}>
            <img src="/images/pdf.png" alt="pdf" className='size-10' />
            <div className='flex items-center space-x-2'>
              <p className='text-sm font-medium text-gray-700 truncate max-w-[200px]'>
                {file.name}
              </p>
              <p className='text-sm text-gray-500'>
                {formatSize(file.size)}
              </p>
            </div>
            <button className='p-2 cursor-pointer' onClick={(e) => {
              onFileSelect?.(null);
              setFile(null);
            }}>
              <img src="/icons/cross.svg" alt="remove" className='size-4' />
            </button>
          </div>
        ) : (
          <div className='flex flex-col items-center justify-center pb-6 pt-4'>
            <div className='mx-auto flex items-center justify-center w-16 h-16 mb-2'>
              <img src="/icons/info.svg" alt="upload" className='size-10' />
            </div>
            <p className='text-lg text-gray-500'>
              <span className='font-semibold '>
                Upload Resume
              </span> or drag and drop
            </p>
            <p className='text-gray-500'>
              PDF, DOC, DOCX (Max. 5MB)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default FileUploader