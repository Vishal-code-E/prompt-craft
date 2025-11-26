'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Member {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

export default function MembersSettings() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [workspaceId, setWorkspaceId] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      // TODO: Get workspace ID from context
      const response = await fetch(`/api/workspaces/${workspaceId}/members`);
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members);
      }
    } catch (error) {
      console.error('Failed to fetch members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: 'MEMBER' }),
      });

      if (response.ok) {
        setInviteEmail('');
        fetchMembers();
      }
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });

      if (response.ok) {
        fetchMembers();
      }
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Team Members</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Team Members</h1>

        {/* Invite Form */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Invite New Member</h2>
          <form onSubmit={handleInvite} className="flex gap-4">
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="flex-1"
            />
            <Button type="submit">Invite</Button>
          </form>
        </Card>

        {/* Members List */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Current Members</h2>
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {member.user.image && (
                    <img
                      src={member.user.image}
                      alt={member.user.name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium">{member.user.name}</p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {member.role}
                  </span>
                  {member.role !== 'OWNER' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(member.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
