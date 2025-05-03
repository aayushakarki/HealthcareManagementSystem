"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Heart, Share2, Send } from "lucide-react"

const Community = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newPost, setNewPost] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  useEffect(() => {
    const fetchCommunityPosts = async () => {
      try {
        setLoading(true)
        // Replace with your actual API endpoint
        // const response = await axios.get("http://localhost:4000/api/v1/community/posts", {
        //   withCredentials: true,
        // })

        // Mock data since we don't have an actual API endpoint yet
        const mockPosts = [
          {
            id: 1,
            author: {
              name: "Jane Smith",
              avatar: "/placeholder.svg?height=50&width=50",
              role: "Patient",
            },
            content: "Just had my first telehealth appointment and it was so convenient! Has anyone else tried this?",
            date: "2025-04-26T14:30:00",
            likes: 12,
            comments: 5,
            category: "general",
          },
          {
            id: 2,
            author: {
              name: "Dr. Robert Johnson",
              avatar: "/placeholder.svg?height=50&width=50",
              role: "Cardiologist",
            },
            content:
              "Remember to check your blood pressure regularly if you have hypertension. Here are some tips for accurate readings at home...",
            date: "2025-04-25T10:15:00",
            likes: 24,
            comments: 8,
            category: "health-tips",
          },
          {
            id: 3,
            author: {
              name: "Michael Brown",
              avatar: "/placeholder.svg?height=50&width=50",
              role: "Patient",
            },
            content: "Looking for recommendations for a good nutritionist in the Boston area. Any suggestions?",
            date: "2025-04-24T16:45:00",
            likes: 3,
            comments: 7,
            category: "questions",
          },
          {
            id: 4,
            author: {
              name: "Sarah Williams",
              avatar: "/placeholder.svg?height=50&width=50",
              role: "Dietitian",
            },
            content:
              "Just published a new article on healthy eating habits for diabetic patients. Check it out on the resources page!",
            date: "2025-04-23T09:20:00",
            likes: 18,
            comments: 2,
            category: "resources",
          },
        ]

        setPosts(mockPosts)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching community posts:", error)
        setLoading(false)
      }
    }

    fetchCommunityPosts()
  }, [])

  // Filter posts based on selected category
  const filteredPosts = activeCategory === "all" ? posts : posts.filter((post) => post.category === activeCategory)

  const handlePostSubmit = (e) => {
    e.preventDefault()
    if (!newPost.trim()) return

    // Create a new post object
    const newPostObj = {
      id: Date.now(),
      author: {
        name: "You",
        avatar: "/placeholder.svg?height=50&width=50",
        role: "Patient",
      },
      content: newPost,
      date: new Date().toISOString(),
      likes: 0,
      comments: 0,
      category: "general",
    }

    // Add the new post to the posts array
    setPosts([newPostObj, ...posts])

    // Clear the input field
    setNewPost("")
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return "Today"
    } else if (diffDays === 1) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  const categories = [
    { id: "all", name: "All Posts" },
    { id: "general", name: "General" },
    { id: "health-tips", name: "Health Tips" },
    { id: "questions", name: "Questions" },
    { id: "resources", name: "Resources" },
  ]

  if (loading) {
    return <div className="loading">Loading community posts...</div>
  }

  return (
    <div className="community-container">
      <div className="community-header">
        <h2>Community</h2>
        <p>Connect with other patients and healthcare professionals</p>
      </div>

      <div className="post-form-container">
        <form onSubmit={handlePostSubmit} className="post-form">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share something with the community..."
            rows={3}
          />
          <div className="post-form-actions">
            <button type="submit" className="post-btn">
              <Send className="w-4 h-4" />
              <span>Post</span>
            </button>
          </div>
        </form>
      </div>

      <div className="categories-tabs">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-tab ${activeCategory === category.id ? "active" : ""}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="posts-container">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <div className="post-author">
                  <img
                    src={post.author.avatar || "/placeholder.svg"}
                    alt={post.author.name}
                    className="author-avatar"
                  />
                  <div className="author-info">
                    <h4>{post.author.name}</h4>
                    <span className="author-role">{post.author.role}</span>
                  </div>
                </div>
                <div className="post-date">{formatDate(post.date)}</div>
              </div>

              <div className="post-content">{post.content}</div>

              <div className="post-actions">
                <button className="action-btn like-btn">
                  <Heart className="w-4 h-4" />
                  <span>{post.likes}</span>
                </button>
                <button className="action-btn comment-btn">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments}</span>
                </button>
                <button className="action-btn share-btn">
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-posts">
            <p>No posts found in this category</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Community
