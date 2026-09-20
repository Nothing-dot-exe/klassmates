import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getDmConversationKey, getConversationKey } from '@/lib/chatUtils';
import { ChatMessage } from '@/types';

describe('IDOR & Privacy Isolation: Direct Message (DM) Boundaries', () => {
  test('generates strictly deterministic and symmetric DM conversation keys', () => {
    const key1 = getDmConversationKey('usr_alice', 'usr_bob');
    const key2 = getDmConversationKey('usr_bob', 'usr_alice');

    assert.strictEqual(key1, key2, 'DM conversation keys must be identical regardless of sender/recipient order');
    assert.strictEqual(key1, 'dm_usr_alice_usr_bob');
  });

  test('correctly routes channel messages vs DM messages', () => {
    const channelKey = getConversationKey('chn_general', 'usr_alice', 'usr_bob');
    assert.strictEqual(channelKey, 'chn_general', 'Channel messages must route by channelId');

    const dmKey = getConversationKey(undefined, 'usr_alice', 'usr_bob');
    assert.strictEqual(dmKey, 'dm_usr_alice_usr_bob', 'DM messages must route by deterministic DM key');
  });

  test('filters out private DMs belonging to third parties (Zero Eavesdropping)', () => {
    const allMessages: ChatMessage[] = [
      {
        id: 'msg_1',
        senderId: 'usr_alice',
        senderName: 'Alice',
        senderRollNo: 'A-01',
        senderAvatar: '',
        content: 'Public announcement',
        channelId: 'chn_general',
        timestamp: '10:00 AM',
        isEncrypted: true,
        autoDelete: 'off',
        reactions: [],
      },
      {
        id: 'msg_2',
        senderId: 'usr_alice',
        recipientId: 'usr_bob',
        senderName: 'Alice',
        senderRollNo: 'A-01',
        senderAvatar: '',
        content: 'Private note to Bob',
        timestamp: '10:05 AM',
        isEncrypted: true,
        autoDelete: 'off',
        reactions: [],
      },
      {
        id: 'msg_3',
        senderId: 'usr_charlie',
        recipientId: 'usr_dave',
        senderName: 'Charlie',
        senderRollNo: 'C-01',
        senderAvatar: '',
        content: 'Secret chat between Charlie and Dave',
        timestamp: '10:10 AM',
        isEncrypted: true,
        autoDelete: 'off',
        reactions: [],
      },
    ];

    // Simulate Alice querying messages with sessionUserId = 'usr_alice'
    const sessionUserId = 'usr_alice';
    const aliceVisible = allMessages.filter((msg) => {
      // Group channel messages are visible
      if (msg.channelId) return true;
      // DMs are only visible if the user is sender or recipient
      return msg.senderId === sessionUserId || msg.recipientId === sessionUserId;
    });

    assert.strictEqual(aliceVisible.length, 2, 'Alice must see exactly 2 messages');
    assert.ok(aliceVisible.some((m) => m.id === 'msg_1'), 'Alice can see public channel message');
    assert.ok(aliceVisible.some((m) => m.id === 'msg_2'), 'Alice can see her own DM to Bob');
    assert.ok(!aliceVisible.some((m) => m.id === 'msg_3'), 'Alice must NEVER see Charlie & Dave private DM');
  });
});
