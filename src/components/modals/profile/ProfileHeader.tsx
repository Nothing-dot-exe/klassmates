import React from 'react';
import { User, Classroom } from '@/types';
import { getSafeAvatar } from '@/lib/avatarUtils';

interface ProfileHeaderProps {
  user: User;
  isClassRep: boolean;
  isMe: boolean;
  classroom: Classroom;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isClassRep,
  isMe,
  classroom,
}) => {
  const avatarUrl = getSafeAvatar(user.avatar, user.name);
  const isGif = avatarUrl.includes('.gif') || avatarUrl.includes('data:image/gif');
  const hasNickname = Boolean(user.nickname && user.nickname.trim() && user.nickname.trim() !== user.name.trim());

  return (
    <div className="space-y-4">
      {/* Instagram Header: Avatar + 3 Stats */}
      <div className="flex items-center gap-4">
        {/* Avatar with subtle monochrome hairline ring */}
        <div className="relative p-[2px] rounded-full border border-zinc-300 shadow-xs flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt={user.name}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover bg-zinc-100"
          />
          {isGif && (
            <span className="absolute bottom-0 right-0 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-zinc-950 text-white border border-white shadow-xs">
              GIF
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="flex-1 grid grid-cols-3 text-center gap-1.5">
          <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="text-xs sm:text-sm font-extrabold text-zinc-950">
              {user.role === 'admin' || isClassRep ? 'Class Rep' : 'Student'}
            </div>
            <div className="text-[10px] text-zinc-500 font-medium">Role</div>
          </div>

          <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="text-xs sm:text-sm font-extrabold text-emerald-700 flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Active
            </div>
            <div className="text-[10px] text-zinc-500 font-medium">Status</div>
          </div>

          <div className="p-2 rounded-xl bg-zinc-50 border border-zinc-200">
            <div className="text-xs sm:text-sm font-extrabold text-zinc-950 truncate">
              {user.joinedAt ? user.joinedAt.slice(0, 7) : '2026'}
            </div>
            <div className="text-[10px] text-zinc-500 font-medium">Enrolled</div>
          </div>
        </div>
      </div>

      {/* Name & Academic Details */}
      <div className="space-y-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-zinc-950 flex items-center gap-2 flex-wrap">
            {hasNickname ? (
              <>
                <span className="text-zinc-950 font-extrabold">{user.nickname?.trim()}</span>
                <span className="text-xs text-zinc-500 font-normal">({user.name})</span>
              </>
            ) : (
              <span>{user.name}</span>
            )}
          </h3>
          <p className="text-xs text-zinc-600 font-medium">
            {user.designation || (isClassRep ? 'Class Representative (CR)' : `${classroom.name} • ${classroom.section}`)}
          </p>
        </div>

        {/* Bio Box */}
        <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 whitespace-pre-wrap leading-relaxed">
          {user.bio ? (
            user.bio
          ) : (
            <span className="text-zinc-400 italic">
              {isMe ? 'No bio added yet. Tap "Edit Profile & Bio" below to introduce yourself!' : 'No bio provided.'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
