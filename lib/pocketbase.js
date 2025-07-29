import PocketBase from "pocketbase"

const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL).autoCancellation(false)

export default pb

export const getImageUrl = (record, filename) => {
  return pb.files.getUrl(record, filename)
}

export const authWithGoogle = async () => {
  try {
    const authData = await pb.collection("users").authWithOAuth2({ provider: "google" })
    return { success: true, data: authData }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const loginWithEmail = async (email, password) => {
  try {
    const authData = await pb.collection("users").authWithPassword(email, password)
    return { success: true, data: authData }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const signupWithEmail = async (userData) => {
  try {
    const record = await pb.collection("users").create(userData)
    await pb.collection("users").authWithPassword(userData.email, userData.password)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const logout = () => {
  pb.authStore.clear()
}

export const getCurrentUser = () => {
  return pb.authStore.model
}

export const isAuthenticated = () => {
  return pb.authStore.isValid
}

// Publications
export const getPublications = async (page = 1, perPage = 20) => {
  try {
    const records = await pb.collection("publications").getList(page, perPage, {
      expand: "user,co_authors_list,co_authors_list.user",
      sort: "-created",
      filter: "public = true",
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const searchPublications = async (query, page = 1, perPage = 20) => {
  try {
    const filter = `(title ~ "${query}" || abstract ~ "${query}" || keywords ~ "${query}") && public = true`
    const records = await pb.collection("publications").getList(page, perPage, {
      expand: "user,co_authors_list,co_authors_list.user",
      sort: "-created",
      filter: filter,
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getPublicationById = async (id) => {
  try {
    const record = await pb.collection("publications").getOne(id, {
      expand: "user,co_authors_list,co_authors_list.user",
    })
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const createPublication = async (publicationData) => {
  try {
    const record = await pb.collection("publications").create(publicationData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const updatePublication = async (id, publicationData) => {
  try {
    const record = await pb.collection("publications").update(id, publicationData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const deletePublication = async (id) => {
  try {
    await pb.collection("publications").delete(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const getUserPublications = async (userId, page = 1, perPage = 20) => {
  try {
    const records = await pb.collection("publications").getList(page, perPage, {
      expand: "user,co_authors_list,co_authors_list.user",
      sort: "-created",
      filter: `user = "${userId}"`,
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Co-authors
export const createCoAuthor = async (coAuthorData) => {
  try {
    const record = await pb.collection("co_authors").create(coAuthorData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const getCoAuthors = async (publicationId) => {
  try {
    const records = await pb.collection("co_authors").getList(1, 50, {
      expand: "user",
      sort: "order",
      filter: `publication = "${publicationId}"`,
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const deleteCoAuthor = async (id) => {
  try {
    await pb.collection("co_authors").delete(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Publication Files
export const createPublicationFile = async (fileData) => {
  try {
    const record = await pb.collection("publication_files").create(fileData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

export const getPublicationFiles = async (publicationId) => {
  try {
    const records = await pb.collection("publication_files").getList(1, 50, {
      sort: "created",
      filter: `publication = "${publicationId}"`,
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const deletePublicationFile = async (id) => {
  try {
    await pb.collection("publication_files").delete(id)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Comments
export const getComments = async (publicationId) => {
  try {
    const records = await pb.collection("comments").getList(1, 50, {
      expand: "user",
      sort: "created",
      filter: `publication = "${publicationId}"`,
    })
    return { success: true, data: records }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const createComment = async (commentData) => {
  try {
    const record = await pb.collection("comments").create(commentData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

// User Profile
export const getUserById = async (id) => {
  try {
    const record = await pb.collection("users").getOne(id)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export const updateUserProfile = async (id, userData) => {
  try {
    const record = await pb.collection("users").update(id, userData)
    return { success: true, data: record }
  } catch (error) {
    return { success: false, error: error.message, details: error.data }
  }
}

// Increment view count
export const incrementViewCount = async (publicationId) => {
  try {
    const publication = await pb.collection("publications").getOne(publicationId)
    const newCount = (publication.views_count || 0) + 1
    await pb.collection("publications").update(publicationId, { views_count: newCount })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Increment download count
export const incrementDownloadCount = async (publicationId) => {
  try {
    const publication = await pb.collection("publications").getOne(publicationId)
    const newCount = (publication.downloads_count || 0) + 1
    await pb.collection("publications").update(publicationId, { downloads_count: newCount })
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
