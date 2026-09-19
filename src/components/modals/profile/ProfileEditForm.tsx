'use client';

import React, { useState } from 'react';
import { ShieldCheck, Check, Lock } from 'lucide-react';
import { User } from '@/types';
import { AvatarPickerSection } from './AvatarPickerSection';

interface ProfileEditFormProps {
  currentUser: User;
  onSave: (updated: Partial<User>) => void;
  onCancel: () => void;
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  currentUser,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(currentUser.name || '');
  const [nickname, setNickname] = useState(currentUser.nickname || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [showPhone, setShowPhone] = useState(currentUser.showPhone !== false);
  const [showEmail, setShowEmail] = useState(currentUser.showEmail !== false);

  const isClassRep = currentUser.role === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: name.trim() || currentUser.name,
      nickname: nickname.trim() || undefined,
      avatar: avatar.trim() || currentUser.avatar,
      bio: bio.trim(),
      showPhone: isClassRep ? true : showPhone,
      showEmail: isClassRep ? true : showEmail,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in">
      {/* Avatar & GIF Customizer Section */}
      <AvatarPickerSection
        avatar={avatar}
        setAvatar={setAvatar}
        name={name}
        currentUser={currentUser}
      />

      {/* Name and Nickname Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
            Display Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-[#161F36] transition shadow-xs"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
              Nickname <span className="text-zinc-400 font-normal">(Optional)</span>
            </label>
          </div>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={name ? `e.g. KD, ${name.split(' ')[0]}` : 'e.g. Alex'}
            maxLength={30}
            className="w-full bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-[#161F36] transition shadow-xs"
          />
        </div>
      </div>
      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 -mt-2">
        💡 If nickname is set, it will be shown across chats and sidebars. If empty, your real name is displayed.
      </p>

      {/* Instagram-Style Bio */}
      <div>
        <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Instagram-Style Bio</label>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell your classmates about yourself, hobbies, or study focus..."
          className="w-full bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-[#161F36] resize-none leading-relaxed transition shadow-xs"
        />
      </div>

      {/* Read-Only Locked Contact Details (Phone & Email cannot be changed) */}
      <div className="space-y-1.5">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Mobile / WhatsApp</label>
              <span className="flex items-center gap-0.5 text-[9px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-[#161F36] px-1.5 py-0.2 rounded border border-zinc-200 dark:border-[#1F2A44]">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            </div>
            <input
              type="text"
              readOnly
              disabled
              value={currentUser.phone || 'Not provided'}
              className="w-full bg-zinc-100 dark:bg-[#161F36] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono cursor-not-allowed select-none opacity-80"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Email Address</label>
              <span className="flex items-center gap-0.5 text-[9px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-[#161F36] px-1.5 py-0.2 rounded border border-zinc-200 dark:border-[#1F2A44]">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            </div>
            <input
              type="email"
              readOnly
              disabled
              value={currentUser.email || 'Not provided'}
              className="w-full bg-zinc-100 dark:bg-[#161F36] border border-zinc-200 dark:border-[#1F2A44] rounded-xl px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400 cursor-not-allowed select-none opacity-80 truncate"
            />
          </div>
        </div>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
          <Lock className="w-3 h-3 text-zinc-500 flex-shrink-0" />
          Registered mobile number and email cannot be changed once signed up.
        </p>
      </div>

      {/* Privacy Visibility Toggles */}
      {isClassRep ? (
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] space-y-1.5 shadow-xs">
          <div className="text-[11px] font-bold text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Classroom Contact: Public</span>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
            As the Class Representative / Student Admin, your contact details (name, email, and mobile number) are permanently visible to all classmates for classroom coordination.
          </p>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#121A2D] border border-zinc-200 dark:border-[#1F2A44] space-y-3 shadow-xs">
          <div className="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Privacy & Visibility</span>
          </div>

          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex flex-col pr-2">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition">
                Show Phone to Classmates
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {showPhone ? 'Visible to classmates' : 'Hidden from classmates (Private 🔒)'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={showPhone}
              onChange={(e) => setShowPhone(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer group pt-1 border-t border-zinc-200 dark:border-[#1F2A44]">
            <div className="flex flex-col pr-2">
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition">
                Show Email to Classmates
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {showEmail ? 'Visible to classmates' : 'Hidden from classmates (Private 🔒)'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={showEmail}
              onChange={(e) => setShowEmail(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </label>
        </div>
      )}

      {/* Action Buttons: Cancel and Explicit Save Changes */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 bg-zinc-100 dark:bg-[#161F36] hover:bg-zinc-200 dark:hover:bg-[#1F2A44] text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded-xl transition cursor-pointer border border-zinc-200 dark:border-[#1F2A44]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-950/20 transition flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </form>
  );
};
