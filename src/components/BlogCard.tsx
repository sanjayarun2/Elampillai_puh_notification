import React from 'react';
import { Calendar, User } from 'lucide-react';
import type { BlogPost } from '../types';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition h-full">
      {post.image && (
        <img 
          src={post.image} 
          alt={post.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h2>
        
        <div className="flex items-center space-x-4 text-gray-600 mb-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2" />
            <span>{post.author}</span>
          </div>
        </div>
        
        <p className="text-gray-600 line-clamp-3 mb-4">{post.content}</p>
        
        <div className="mt-auto">
          <span className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center">
            Read More <span className="ml-1">→</span>
          </span>
        </div>
      </div>
    </article>
  );
}