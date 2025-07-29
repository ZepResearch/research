"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, MessageCircle, Download, Calendar, User, ExternalLink, FileText } from "lucide-react"
import { getImageUrl } from "@/lib/pocketbase"

export const PublicationCard = ({ publication }) => {
  const [imageError, setImageError] = useState(false)

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getTypeColor = (type) => {
    const colors = {
      Article: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Book: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      "Conference Paper": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Thesis: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      Preprint: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    }
    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {publication.type && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(publication.type)}`}>
                  {publication.type}
                </span>
              )}
              {publication.publication_date && (
                <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar size={12} />
                  {formatDate(publication.publication_date)}
                </span>
              )}
            </div>

            <Link href={`/publication/${publication.id}`} className="block group">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2">
                {publication.title}
              </h3>
            </Link>
          </div>

          {/* Preview Image */}
          {publication.preview_img && publication.preview_img.length > 0 && !imageError && (
            <div className="ml-4 flex-shrink-0">
              <img
                src={getImageUrl(publication, publication.preview_img[0]) || "/placeholder.svg"}
                alt={publication.title}
                className="w-16 h-16 object-cover rounded-lg"
                onError={() => setImageError(true)}
              />
            </div>
          )}
        </div>

        {/* Authors */}
        <div className="flex items-center gap-2 mb-3">
          <User size={14} className="text-gray-400" />
          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
            <Link
              href={`/user/${publication.expand?.user?.id}`}
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              {publication.expand?.user?.name || publication.expand?.user?.email}
            </Link>
            {publication.expand?.co_authors_list && publication.expand.co_authors_list.length > 0 && (
              <>
                <span>, </span>
                <span>+{publication.expand.co_authors_list.length} co-authors</span>
              </>
            )}
          </div>
        </div>

        {/* Abstract */}
        {publication.abstract && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">{publication.abstract}</p>
        )}

        {/* Publication Details */}
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
          {publication.journal && (
            <span className="flex items-center gap-1">
              <FileText size={12} />
              {publication.journal}
            </span>
          )}
          {publication.conference && (
            <span className="flex items-center gap-1">
              <FileText size={12} />
              {publication.conference}
            </span>
          )}
          {publication.doi && (
            <a
              href={`https://doi.org/${publication.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              <ExternalLink size={12} />
              DOI: {publication.doi}
            </a>
          )}
        </div>

        {/* Keywords */}
        {publication.keywords && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {publication.keywords
                .split(",")
                .slice(0, 5)
                .map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded"
                  >
                    {keyword.trim()}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {publication.views_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <Download size={14} />
              {publication.downloads_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={14} />
              {publication.comments_count || 0}
            </span>
          </div>

          <Link
            href={`/publication/${publication.id}`}
            className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium transition-colors"
          >
            Read more →
          </Link>
        </div>
      </div>
    </div>
  )
}
