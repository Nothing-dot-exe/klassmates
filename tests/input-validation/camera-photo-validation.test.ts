import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { validateCameraPhotoFile } from '@/lib/security/inputSanitizer';

describe('Input Validation: Camera Photo Validation (Photos Only)', () => {
  test('accepts valid photo image types', () => {
    const validPhotos = [
      { name: 'whiteboard_notes.jpg', type: 'image/jpeg' },
      { name: 'lecture_diagram.png', type: 'image/png' },
      { name: 'formula_sheet.webp', type: 'image/webp' },
      { name: 'snapshot.heic', type: 'image/heic' },
      { name: 'quick_snap.HEIF', type: 'image/heif' },
      { name: 'notes.gif', type: 'image/gif' },
      { name: 'graph.svg', type: 'image/svg+xml' },
    ];

    for (const file of validPhotos) {
      const result = validateCameraPhotoFile(file);
      assert.strictEqual(result.isValidPhoto, true, `Expected ${file.name} to be valid photo`);
    }
  });

  test('strictly rejects video files via camera button', () => {
    const videoFiles = [
      { name: 'recorded_lecture.mp4', type: 'video/mp4' },
      { name: 'screen_recording.mov', type: 'video/quicktime' },
      { name: 'clip.webm', type: 'video/webm' },
      { name: 'demo.mkv', type: 'video/x-matroska' },
      { name: 'lecture.avi', type: 'video/x-msvideo' },
      { name: 'session.m4v', type: 'video/x-m4v' },
    ];

    for (const file of videoFiles) {
      const result = validateCameraPhotoFile(file);
      assert.strictEqual(result.isValidPhoto, false, `Expected video ${file.name} to be rejected`);
      assert.ok(result.errorMessage?.includes('strictly for photos'), 'Must notify user camera is strictly for photos');
      assert.ok(result.errorMessage?.includes('paperclip'), 'Must direct user to paperclip for video files');
    }
  });

  test('strictly rejects documents, PDFs, audio, and executables via camera button', () => {
    const nonPhotos = [
      { name: 'syllabus.pdf', type: 'application/pdf' },
      { name: 'notes.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
      { name: 'lecture_audio.mp3', type: 'audio/mpeg' },
      { name: 'archive.zip', type: 'application/zip' },
      { name: 'script.js', type: 'application/javascript' },
      { name: 'malicious.exe', type: 'application/x-msdownload' },
    ];

    for (const file of nonPhotos) {
      const result = validateCameraPhotoFile(file);
      assert.strictEqual(result.isValidPhoto, false, `Expected non-photo ${file.name} to be rejected`);
      assert.ok(result.errorMessage?.includes('strictly for photos'), 'Must notify user camera is strictly for photos');
    }
  });

  test('handles null or missing file safely', () => {
    assert.strictEqual(validateCameraPhotoFile(null).isValidPhoto, false);
    assert.strictEqual(validateCameraPhotoFile(undefined).isValidPhoto, false);
  });
});
