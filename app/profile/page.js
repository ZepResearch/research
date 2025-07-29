"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"
import { PublicationCard } from "@/components/publication-card"
import { useAuth } from "@/contexts/auth-context"
import { getUserPublications, updateUserProfile, getImageUrl, deletePublication } from "@/lib/pocketbase"
import { Edit3, Save, X, Camera, Building, Mail, Globe, BookOpen, Eye, Users, Award, Trash2 } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { user } = useAuth()
  const [publications, setPublications] = useState([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    institution: "",
    department: "",
    company: "",
    position: "",
    website: "",
    orcid_id: "",
    researcher_type: "",
    avatar: null,
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        bio: user.bio || "",
        institution: user.institution || "",
        department: user.department || "",
        company: user.company || "",
        position: user.position || "",
        website: user.website || "",
        orcid_id: user.orcid_id || "",
        researcher_type: user.researcher_type || "",
        avatar: null,
      })
      loadUserPublications()
    }
  }, [user])

  const loadUserPublications = async () => {
    if (!user) return

    setLoading(true)
    const result = await getUserPublications(user.id)

    if (result.success) {
      setPublications(result.data.items)
    }
    setLoading(false)
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target

    if (name === "avatar" && files[0]) {
      setProfileData((prev) => ({ ...prev, avatar: files[0] }))
    } else {
      setProfileData((prev) => ({ ...prev, [name]: value }))
    }
    setError("")
  }

  const handleSave = async () => {
    setSaving(true)
    setError("")

    try {
      const updateData = new FormData()

      Object.keys(profileData).forEach((key) => {
        if (key === "avatar" && profileData[key]) {
          updateData.append(key, profileData[key])
        } else if (key !== "avatar" && profileData[key] !== "") {
          updateData.append(key, profileData[key])
        }
      })

      const result = await updateUserProfile(user.id, updateData)

      if (result.success) {
        setEditMode(false)
        // Refresh the page to get updated user data
        window.location.reload()
      } else {
        let errorMessage = result.error
        if (result.details?.data) {
          const fieldErrors = Object.entries(result.details.data)
            .map(([field, error]) => `${field}: ${error.message || error}`)
            .join(", ")
          errorMessage = `${result.error}. Details: ${fieldErrors}`
        }
        setError(errorMessage)
      }
    } catch (err) {
      setError("An unexpected error occurred")
    }

    setSaving(false)
  }

  const stats = {
    publications: publications.length,
    totalViews: publications.reduce((sum, pub) => sum + (pub.views_count || 0), 0),
    totalCitations: publications.reduce((sum, pub) => sum + (pub.citations_count || 0), 0),
    totalDownloads: publications.reduce((sum, pub) => sum + (pub.downloads_count || 0), 0),
  }

  const handleDeletePublication = async (publicationId) => {
    if (!confirm("Are you sure you want to delete this publication? This action cannot be undone.")) {
      return
    }

    const result = await deletePublication(publicationId)
    if (result.success) {
      setPublications(publications.filter((pub) => pub.id !== publicationId))
    } else {
      setError("Failed to delete publication")
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <div className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    {user?.avatar ? (
                      <img
                        src={getImageUrl(user, user.avatar) || "/placeholder.svg"}
                        alt={user.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {editMode && (
                      <label className="absolute bottom-0 right-0 bg-cyan-500 text-white p-2 rounded-full cursor-pointer hover:bg-cyan-600 transition-colors">
                        <Camera size={16} />
                        <input type="file" name="avatar" onChange={handleChange} accept="image/*" className="hidden" />
                      </label>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1">
                    {editMode ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleChange}
                          placeholder="Full Name"
                          className="text-2xl font-bold bg-transparent border-b-2 border-cyan-500 focus:outline-none text-gray-900 dark:text-white w-full"
                        />
                        <textarea
                          name="bio"
                          value={profileData.bio}
                          onChange={handleChange}
                          placeholder="Tell us about yourself..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    ) : (
                      <>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          {user?.name || user?.email}
                        </h1>
                        {user?.bio && <p className="text-gray-600 dark:text-gray-400 mb-4">{user.bio}</p>}
                      </>
                    )}

                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Mail size={14} />
                        {user?.email}
                      </span>
                      {user?.institution && (
                        <span className="flex items-center gap-1">
                          <Building size={14} />
                          {user.institution}
                        </span>
                      )}
                      {user?.website && (
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
                  </div>
                </div>

                {/* Edit Button */}
                <div className="flex gap-2">
                  {editMode ? (
                    <>
                      <button
                        onClick={() => setEditMode(false)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Save
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Edit3 size={16} />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Edit Form Fields */}
              {editMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Researcher Type
                    </label>
                    <select
                      name="researcher_type"
                      value={profileData.researcher_type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select type</option>
                      <option value="academic">Academic</option>
                      <option value="corporate">Corporate</option>
                      <option value="medical">Medical</option>
                      <option value="non_researcher">Non-researcher</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Position</label>
                    <input
                      type="text"
                      name="position"
                      value={profileData.position}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Your position/title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Institution
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={profileData.institution}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Your institution"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={profileData.department}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Your department"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
                    <input
                      type="text"
                      name="company"
                      value={profileData.company}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Your company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website</label>
                    <input
                      type="url"
                      name="website"
                      value={profileData.website}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="https://your-website.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ORCID ID</label>
                    <input
                      type="text"
                      name="orcid_id"
                      value={profileData.orcid_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0000-0000-0000-0000"
                    />
                  </div>
                </div>
              )}

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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Publications</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {publications.length} publication{publications.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">Loading publications...</span>
                </div>
              ) : publications.length > 0 ? (
                <div className="space-y-6">
                  {publications.map((publication) => (
                    <div key={publication.id} className="relative">
                      <PublicationCard publication={publication} />
                      {/* Edit/Delete Controls */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Link
                          href={`/edit-publication/${publication.id}`}
                          className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          title="Edit Publication"
                        >
                          <Edit3 size={16} className="text-gray-600 dark:text-gray-400" />
                        </Link>
                        <button
                          onClick={() => handleDeletePublication(publication.id)}
                          className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete Publication"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No publications yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Share your research with the community by creating your first publication.
                  </p>
                  <a
                    href="/create-publication"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                  >
                    <BookOpen size={16} />
                    Create Publication
                  </a>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
