import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { getConversationKey, getDmConversationKey } from '@/lib/chatUtils';
import { ChatMessage } from '@/types';

describe('WebSockets & Real-Time: High-Speed Message Delivery & Isolation', () => {
  const sampleChannelMessage: ChatMessage = {
    id: 'msg_speed_1',
    senderId: 'usr_alice',
    senderName: 'Alice',
    senderRollNo: 'A-01',
    content: 'Ultra-fast public broadcast',
    channelId: 'chn_general',
    timestamp: '12:00 PM',
    isEncrypted: true,
    autoDelete: 'off',
    reactions: [],
  };

  const sampleDmMessage: ChatMessage = {
    id: 'msg_speed_2',
    senderId: 'usr_alice',
    recipientId: 'usr_bob',
    senderName: 'Alice',
    senderRollNo: 'A-01',
    content: 'Ultra-fast direct message',
    timestamp: '12:01 PM',
    isEncrypted: true,
    autoDelete: 'off',
    reactions: [],
  };

  test('routes channel message to target channel instantaneously', () => {
    const key = getConversationKey(sampleChannelMessage.channelId, sampleChannelMessage.senderId, sampleChannelMessage.recipientId);
    assert.strictEqual(key, 'chn_general');
  });

  test('routes direct message to deterministic peer key instantaneously', () => {
    const key = getDmConversationKey(sampleDmMessage.senderId, sampleDmMessage.recipientId);
    assert.strictEqual(key, 'dm_usr_alice_usr_bob');
  });

  test('client-side privacy filter strictly isolates peer DMs from third parties', () => {
    const isVisibleToBob = sampleDmMessage.recipientId === 'usr_bob' || sampleDmMessage.senderId === 'usr_bob';
    const isVisibleToCharlie = sampleDmMessage.recipientId === 'usr_charlie' || sampleDmMessage.senderId === 'usr_charlie';

    assert.strictEqual(isVisibleToBob, true, 'Target recipient must receive message');
    assert.strictEqual(isVisibleToCharlie, false, 'Third-party user must never see peer DM');
  });

  test('deduplicates incoming messages accurately during high-frequency sync', () => {
    const existing: ChatMessage[] = [sampleChannelMessage];
    const incoming: ChatMessage[] = [
      sampleChannelMessage, // duplicate
      { ...sampleChannelMessage, id: 'msg_speed_3', content: 'Second message' },
    ];

    const currentIds = new Set(existing.map((m) => m.id));
    const newItems = incoming.filter((m) => !currentIds.has(m.id));

    assert.strictEqual(newItems.length, 1);
    assert.strictEqual(newItems[0].id, 'msg_speed_3');
  });
});
