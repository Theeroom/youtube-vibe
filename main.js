
const API_KEY = "AIzaSyBnzGv5joUq8cFftHTyGeTJECTLQzYxNf8";

async function fetchData() {
  const url = document.getElementById("channelUrl").value;
  const result = document.getElementById("result");
  result.innerHTML = "불러오는 중...";

  const channelId = await getChannelId(url);
  if (!channelId) {
    result.innerHTML = "채널 ID를 찾을 수 없습니다.";
    return;
  }

  const videos = await getVideos(channelId);
  const stats = await getStats(videos.map(v => v.id.videoId));
  const E = calculateEngagementRate(stats);
  const V = calculateViewStability(stats);
  const U = calculateUploadFrequency(videos);
  const VIBE = (E * 0.5 + V * 0.3 + U * 0.2).toFixed(2);

  result.innerHTML = `
    <div class="card">
      <p>참여율 (E): ${E.toFixed(2)}%</p>
      <p>조회수 안정성 (V): ${(V * 100).toFixed(2)}%</p>
      <p>업로드 빈도 (U): ${U.toFixed(2)}%</p>
      <p><strong>VIBE Index: ${VIBE}</strong></p>
    </div>
  `;
}

async function getChannelId(url) {
  if (url.includes('/channel/')) {
    return url.split('/channel/')[1].split(/[/?]/)[0];
  } else if (url.includes('@')) {
    const username = url.split('@')[1].split(/[/?]/)[0];
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${username}&key=${API_KEY}`);
    const data = await res.json();
    return data.items?.[0]?.snippet?.channelId || null;
  }
  return null;
}

async function getVideos(channelId) {
  const res = await fetch(\`https://www.googleapis.com/youtube/v3/search?key=\${API_KEY}&channelId=\${channelId}&part=snippet,id&order=date&maxResults=50\`);
  const data = await res.json();
  return data.items.filter(i => i.id.videoId);
}

async function getStats(videoIds) {
  const chunks = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    chunks.push(videoIds.slice(i, i + 50));
  }
  let stats = [];
  for (const chunk of chunks) {
    const res = await fetch(\`https://www.googleapis.com/youtube/v3/videos?key=\${API_KEY}&id=\${chunk.join(',')}&part=statistics\`);
    const data = await res.json();
    stats.push(...data.items);
  }
  return stats;
}

function calculateEngagementRate(videos) {
  let likes = 0, comments = 0, views = 0;
  videos.forEach(v => {
    likes += parseInt(v.statistics.likeCount || 0);
    comments += parseInt(v.statistics.commentCount || 0);
    views += parseInt(v.statistics.viewCount || 1);
  });
  return ((likes + comments) / views) * 100;
}

function calculateViewStability(videos) {
  const viewCounts = videos.slice(0, 10).map(v => parseInt(v.statistics.viewCount || 0));
  const avg = viewCounts.reduce((a, b) => a + b, 0) / viewCounts.length;
  const stdDev = Math.sqrt(viewCounts.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / viewCounts.length);
  return 1 - stdDev / avg;
}

function calculateUploadFrequency(videos) {
  const now = new Date();
  const recent = videos.filter(v => {
    const published = new Date(v.snippet.publishedAt);
    return (now - published) / (1000 * 60 * 60 * 24) <= 60;
  });
  return (recent.length / 60) * 100;
}
