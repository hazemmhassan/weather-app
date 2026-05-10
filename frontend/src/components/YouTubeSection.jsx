import React from 'react';

export default function YouTubeSection({ videos }) {
  if (!videos?.length) return null;

  return (
    <section className="youtube-section">
      <h2>🎬 Videos About This Location</h2>
      <div className="videos-grid">
        {videos.map(video => (
          <a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="video-card"
            aria-label={video.title}
          >
            <div className="video-thumb-wrap">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="video-thumb"
                loading="lazy"
              />
              <span className="play-badge">▶</span>
            </div>
            <div className="video-info">
              <h4 className="video-title">{video.title}</h4>
              <p  className="video-channel">{video.channel}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
