import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { Edit, Box, Heart, Clock } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-44px)] bg-[#0a0a0b] py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-[#121214] border border-[#242429] rounded-lg p-8 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-3xl font-bold">
                {user.email?.[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2">{user.email}</h1>
                <p className="text-gray-400">Member since {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#242429] rounded-lg hover:bg-[#2a2a2f] transition-colors">
              <Edit className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 3D Content */}
          <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Box className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold">Your Content</h2>
            </div>
            <div className="space-y-4">
              <div className="aspect-video bg-[#242429] rounded-lg" />
              <p className="text-center text-gray-400">No content yet</p>
            </div>
          </div>

          {/* Favorites */}
          <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold">Favorites</h2>
            </div>
            <div className="space-y-4">
              <div className="aspect-video bg-[#242429] rounded-lg" />
              <p className="text-center text-gray-400">No favorites yet</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#121214] border border-[#242429] rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-bold">Recent Activity</h2>
            </div>
            <div className="space-y-4">
              <p className="text-center text-gray-400">No recent activity</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;