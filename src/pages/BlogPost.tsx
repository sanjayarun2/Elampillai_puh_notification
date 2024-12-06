import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, Trash2 } from 'lucide-react';
import { useSupabaseQuery } from '../hooks/useSupabaseQuery';
import { blogService } from '../services/blogService';
import type { BlogPost as BlogPostType } from '../types';
import SEOHead from '../components/SEOHead';
import WhatsAppButton from '../components/ui/WhatsAppButton';
import ShareButton from '../components/ui/ShareButton';

interface Comment {
  id: string;
  text: string;
  author: string;
  date: string;
}

export default function BlogPost() {
  const { id } = useParams();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');

  const { data: post, loading, error } = useSupabaseQuery<BlogPostType>(
    () => blogService.getById(id!),
    [id]
  );

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && commentAuthor.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        text: newComment,
        author: commentAuthor,
        date: new Date().toLocaleDateString()
      };
      setComments([...comments, comment]);
      setNewComment('');
      setCommentAuthor('');
    }
  };

  const deleteComment = (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Loading post...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-red-600">Error loading post. Please try again later.</p>
        <Link to="/blog" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
          Return to Blog
        </Link>
      </div>
    );
  }

  const canonicalUrl = `${window.location.origin}/blog/${id}`;
  const schema = {
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.image,
    "articleBody": post.content,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Elampillai Community",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/icon-192x192.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  };

  return (
    <>
      <SEOHead
        title={post.title}
        description={post.content.substring(0, 155)}
        image={post.image}
        url={canonicalUrl}
        type="article"
        author={post.author}
        publishedTime={post.date}
        modifiedTime={post.date}
        schema={schema}
        keywords={`${post.title}, Elampillai news, community updates, ${post.author}`}
      />

      {/* Rest of the component remains unchanged */}
      {/* ... */}
    </>
  );
}