'use client';

import { useState } from 'react';

export default function ShareButton() {
  const [link, setLink] = useState<string | null>(null);

  const handleGenerateLink = async () => {
    try {
      const response = await fetch('/api/create-share', { method: 'POST' });
      const data = await response.json();
      if (data.id) {
        const shareLink = `http://localhost:3000/share/${data.id}`;
        setLink(shareLink);
      } else {
        console.error('Failed to create share');
      }
    } catch (error) {
      console.error('Error generating link:', error);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleGenerateLink}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Generate Share Link
      </button>
      {link && (
        <div className="mt-4">
          <p className="mb-2">
            Share this link:{' '}
            <span className="text-blue-500 break-all">{link}</span>
          </p>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
              link
            )}&text=Check%20out%20this%20shared%20content!`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          >
            Post on X
          </a>
        </div>
      )}
    </div>
  );
}