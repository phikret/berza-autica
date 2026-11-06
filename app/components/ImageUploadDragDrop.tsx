'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'

interface ImageUploadDragDropProps {
  maxFiles?: number
  onFilesSelected: (files: File[]) => void
  selectedFiles?: File[]
  previewUrls?: string[]
  onClearAll?: () => void
}

// Compress image on client side
async function compressImage(file: File, maxWidth: number = 1200, maxHeight: number = 1200, quality: number = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new window.Image()
      img.src = event.target?.result as string
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
    }
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
  })
}

export default function ImageUploadDragDrop({
  maxFiles = 5,
  onFilesSelected,
  selectedFiles = [],
  previewUrls = [],
  onClearAll,
}: ImageUploadDragDropProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isCompressing, setIsCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const processFiles = async (files: File[]) => {
    setIsCompressing(true)
    try {
      const imageFiles = files.filter((file) => file.type.startsWith('image/'))
      
      if (imageFiles.length === 0) {
        alert('Molim vas izaberite samo slike.')
        setIsCompressing(false)
        return
      }

      const filesToAdd = imageFiles.slice(0, maxFiles - selectedFiles.length)
      
      // Compress all images
      const compressedFiles = await Promise.all(
        filesToAdd.map((file) => compressImage(file))
      )

      onFilesSelected([...selectedFiles, ...compressedFiles])
    } catch (error) {
      console.error('Error compressing images:', error)
      alert('Greška pri obradi slika. Molim vas pokušajte ponovo.')
    } finally {
      setIsCompressing(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files) {
      processFiles(Array.from(files))
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    processFiles(Array.from(files))
  }

  const handleClick = () => {
    if (selectedFiles.length < maxFiles && !isCompressing) {
      fileInputRef.current?.click()
    }
  }

  const removeFile = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    onFilesSelected(newFiles)
  }

  return (
    <div className="space-y-4">
      {/* Drag and Drop Area */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-3xl border-2 border-dashed px-6 py-12 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-blue-600 bg-blue-50'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
        } ${isCompressing ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isCompressing}
        />

        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="rounded-full bg-blue-100 p-4">
              {isCompressing ? (
                <div className="h-8 w-8 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-slate-300"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 animate-spin"></div>
                </div>
              ) : (
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              )}
            </div>
          </div>

          <div>
            <p className="text-base font-semibold text-slate-900">
              {isCompressing ? 'Obrada slika...' : 'Prevucite slike ovde ili kliknite da izaberete'}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Podržani formati: JPEG, PNG, WebP (do {maxFiles} slika)
            </p>
          </div>

          {!isCompressing && selectedFiles.length < maxFiles && (
            <p className="text-xs text-slate-500">
              {maxFiles - selectedFiles.length} ostalih slika može biti dostavljeno
            </p>
          )}
        </div>
      </div>

      {/* File Preview Grid */}
      {selectedFiles.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium text-slate-700">
              Učitane slike ({selectedFiles.length}/{maxFiles})
            </p>
            {onClearAll && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  onClearAll()
                }}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Obriši sve
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition-all hover:shadow-md"
              >
                <div className="relative h-40 w-full bg-slate-100">
                  {previewUrls[index] ? (
                    <img
                      src={previewUrls[index]}
                      alt={file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={(e) => removeFile(index, e)}
                    className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100 rounded-full bg-red-600 p-1.5 text-white shadow-md hover:bg-red-700"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="p-3 text-sm text-slate-700">
                  <div className="truncate font-medium text-slate-900">{file.name}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {Math.round(file.size / 1024)} KB
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
