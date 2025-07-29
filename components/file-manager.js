"use client"

import { useState } from "react"
import { Upload, X, FileText } from "lucide-react"

export const FileManager = ({ files, setFiles }) => {
  const [newFile, setNewFile] = useState({
    file: null,
    file_type: "Main file",
    visibility: "Public",
    version: "1.0",
    description: "",
  })

  const fileTypes = ["Main file", "supplementary material", "dataset"]
  const visibilityOptions = ["Public", "private", "both"]

  const addFile = () => {
    if (!newFile.file) return

    const file = {
      ...newFile,
      id: Date.now(), // Temporary ID for frontend
      fileName: newFile.file.name,
      fileSize: newFile.file.size,
    }

    setFiles([...files, file])
    setNewFile({
      file: null,
      file_type: "Main file",
      visibility: "Public",
      version: "1.0",
      description: "",
    })
  }

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index)
    setFiles(updated)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
        <FileText size={20} />
        Publication Files
      </h3>

      {/* Existing Files */}
      {files.map((file, index) => (
        <div key={file.id || index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-gray-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{file.fileName || file.file?.name}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{file.file_type}</span>
                  <span>{file.visibility}</span>
                  <span>v{file.version}</span>
                  {file.fileSize && <span>{formatFileSize(file.fileSize)}</span>}
                </div>
              </div>
            </div>
            <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700 transition-colors">
              <X size={16} />
            </button>
          </div>

          {file.description && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{file.description}</p>}
        </div>
      ))}

      {/* Add New File */}
      <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select File</label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <input
                type="file"
                onChange={(e) => setNewFile({ ...newFile, file: e.target.files[0] })}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer text-sm text-gray-600 dark:text-gray-400">
                Click to upload or drag and drop
                <br />
                <span className="text-xs">PDF, DOC, DOCX, TXT up to 5MB</span>
              </label>
              {newFile.file && (
                <p className="mt-2 text-sm text-gray-900 dark:text-white">
                  Selected: {newFile.file.name} ({formatFileSize(newFile.file.size)})
                </p>
              )}
            </div>
          </div>

          {/* File Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File Type</label>
              <select
                value={newFile.file_type}
                onChange={(e) => setNewFile({ ...newFile, file_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {fileTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visibility</label>
              <select
                value={newFile.visibility}
                onChange={(e) => setNewFile({ ...newFile, visibility: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {visibilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Version</label>
              <input
                type="text"
                value={newFile.version}
                onChange={(e) => setNewFile({ ...newFile, version: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="1.0"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={newFile.description}
              onChange={(e) => setNewFile({ ...newFile, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Brief description of the file..."
            />
          </div>

          {/* Add Button */}
          <div className="flex justify-end">
            <button
              onClick={addFile}
              disabled={!newFile.file}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Upload size={16} />
              Add File
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
