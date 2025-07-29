"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { PublicationCard } from "@/components/publication-card"
import { getUserById, getUserPublications, getImageUrl } from "@/lib/pocketbase"
import { Mail, Globe, Building, MapPin, BookOpen, Eye, Users, Award, Loader2 } from "lucide-react"

export default function UserProfilePage() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const [publicationsLoading, setPublicationsLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (id) {
      loadUserProfile()
      loadUserPublications()
    }
  }, [id])

  const loadUserProfile = async () => {
    setLoading(true)
    const result = await getUserById(id)

    if (result.success) {
      setUser(result.data)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }

  const loadUserPublications = async () => {
    setPublicationsLoading(true)
    const result = await getUserPublications(id)

    if (result.success) {
      setPublications(result.data.items)
    }
    setPublicationsLoading(false)
  }

  const stats = {
    publications: publications.length,
    totalViews: publications.reduce((sum, pub) => sum + (pub.views_count || 0), 0),
    totalCitations: publications.reduce((sum, pub) => sum + (pub.citations_count || 0), 0),
    totalDownloads: publications.reduce((sum, pub) => sum + (pub.downloads_count || 0), 0),
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading profile...</span>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">User Not Found</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                {error || "The user profile you're looking for doesn't exist."}
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <div className="p-6">
              <div className="flex items-start gap-6 mb-6">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {user.avatar ? (
                    <img
                      src={getImageUrl(user, user.avatar) || "/placeholder.svg"}
                      alt={user.name}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {(user.name || user.email || "U").charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Basic Info */}
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{user.name || user.email}</h1>

                  {user.position && user.institution && (
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">
                      {user.position} at {user.institution}
                    </p>
                  )}

                  {user.bio && <p className="text-gray-600 dark:text-gray-400 mb-4">{user.bio}</p>}

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Mail size={14} />
                      {user.email}
                    </span>
                    {user.institution && (
                      <span className="flex items-center gap-1">
                        <Building size={14} />
                        {user.institution}
                      </span>
                    )}
                    {user.department && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {user.department}
                      </span>
                    )}
                    {user.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                      >
                        <Globe size={14} />
                        Website
                      </a>
                    )}
                  </div>

                  {/* Researcher Type */}
                  {user.researcher_type && (
                    <div className="mt-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300">
                        {user.researcher_type.charAt(0).toUpperCase() + user.researcher_type.slice(1)} Researcher
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-2">
                    <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.publications}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Publications</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-2">
                    <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-2">
                    <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalCitations}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Citations</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg mx-auto mb-2">
                    <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDownloads}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Downloads</div>
                </div>
              </div>
            </div>
          </div>

          {/* Publications Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Publications</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {publications.length} publication{publications.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="p-6">
              {publicationsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading publications...</span>
                </div>
              ) : publications.length > 0 ? (
                <div className="space-y-6">
                  {publications.map((publication) => (
                    <PublicationCard key={publication.id} publication={publication} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No publications yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">This researcher hasn't published any work yet.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
