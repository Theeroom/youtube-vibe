
async function addChannel() {
  const url = document.getElementById('channelUrl').value;
  const results = document.getElementById('results');

  if (!url.includes('youtube.com')) {
    alert('유효한 유튜브 채널 URL을 입력하세요.');
    return;
  }

  const dummy = {
    title: "예시 채널",
    subs: "123,456명",
    E: "4.32%",
    V: "87.23%",
    U: "63.12%",
    VIBE: "53.48"
  };

  const el = document.createElement('div');
  el.className = 'channel-card';
  el.innerHTML = `
    <h2>${dummy.title}</h2>
    <p>구독자: ${dummy.subs}</p>
    <p>참여율 (E): ${dummy.E}</p>
    <p>조회수 안정성 (V): ${dummy.V}</p>
    <p>업로드 빈도 (U): ${dummy.U}</p>
    <p><strong>VIBE Index: ${dummy.VIBE}</strong></p>
  `;
  results.appendChild(el);
}
