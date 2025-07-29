"use client"

import { useState } from "react"
import { Plus, X, User } from "lucide-react"

export const CoAuthorManager = ({ coAuthors, setCoAuthors }) => {
  const [newCoAuthor, setNewCoAuthor] = useState({
    name: "",
    email: "",
    institution: "",
    order: "",
    is_corresponding: false,
  })

  const addCoAuthor = () => {
    if (!newCoAuthor.name.trim()) return

    const coAuthor = {
      ...newCoAuthor,
      id: Date.now(), // Temporary ID for frontend
      order: coAuthors.length + 1,
    }

    setCoAuthors([...coAuthors, coAuthor])
    setNewCoAuthor({
      name: "",
      email: "",
      institution: "",
      order: "",
      is_corresponding: false,
    })
  }

  const removeCoAuthor = (index) => {
    const updated = coAuthors.filter((_, i) => i !== index)
    setCoAuthors(updated)
  }

  const updateCoAuthor = (index, field, value) => {
    const updated = coAuthors.map((author, i) => (i === index ? { ...author, [field]: value } : author))
    setCoAuthors(updated)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
        <User size={20} />
        Co-Authors
      </h3>

      {/* Existing Co-Authors */}
      {coAuthors.map((author, index) => (
        <div key={author.id || index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{index + 1}</span>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={author.is_corresponding}
                  onChange={(e) => updateCoAuthor(index, "is_corresponding", e.target.checked)}
                  className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Corresponding Author</span>
              </label>
            </div>
            <button onClick={() => removeCoAuthor(index)} className="text-red-500 hover:text-red-700 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
              <input
                type="text"
                value={author.name}
                onChange={(e) => updateCoAuthor(index, "name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={author.email}
                onChange={(e) => updateCoAuthor(index, "email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institution</label>
              <input
                type="text"
                value={author.institution}
                onChange={(e) => updateCoAuthor(index, "institution", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Institution name"
              />
            </div>
          </div>
        </div>
      ))}

      {/* Add New Co-Author */}
      <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
            <input
              type="text"
              value={newCoAuthor.name}
              onChange={(e) => setNewCoAuthor({ ...newCoAuthor, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={newCoAuthor.email}
              onChange={(e) => setNewCoAuthor({ ...newCoAuthor, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Institution</label>
            <input
              type="text"
              value={newCoAuthor.institution}
              onChange={(e) => setNewCoAuthor({ ...newCoAuthor, institution: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Institution name"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={newCoAuthor.is_corresponding}
              onChange={(e) => setNewCoAuthor({ ...newCoAuthor, is_corresponding: e.target.checked })}
              className="w-4 h-4 text-cyan-600 bg-gray-100 border-gray-300 rounded focus:ring-cyan-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Corresponding Author</span>
          </label>

          <button
            onClick={addCoAuthor}
            disabled={!newCoAuthor.name.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus size={16} />
            Add Co-Author
          </button>
        </div>
      </div>
    </div>
  )
}
