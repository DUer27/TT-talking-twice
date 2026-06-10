const topics = [
  { pinned: true, title: '关于校园反馈社区试运行与文明发言说明', tags: ['公告', '社区规则'], category: '公告', replies: 18, views: 1260, activity: '置顶', posters: ['校', '师', 'AI'] },
  { title: '高数早八课程连续三周调课，希望能提前通知', tags: ['课程吐槽', '待回应', '匿名'], replies: 24, views: 438, activity: '5分钟前', posters: ['匿', '陈', '王'] },
  { title: '食堂二楼晚饭排队太久，热门窗口能不能多开一个', tags: ['食堂吐槽', '高频问题'], replies: 46, views: 982, activity: '12分钟前', posters: ['李', '匿', '周'] },
  { title: '宿舍热水晚上十点后不稳定，最近很多人遇到', tags: ['宿舍生活', '急需处理'], replies: 37, views: 756, activity: '21分钟前', posters: ['匿', '赵', '孙'] },
  { title: '图书馆自习区插座数量不够，考试周特别明显', tags: ['校园设施', '建议类'], replies: 19, views: 502, activity: '34分钟前', posters: ['刘', '匿'] },
  { title: '选课系统高峰期很卡，提交后经常没有反馈', tags: ['行政服务', '体验问题'], replies: 31, views: 689, activity: '46分钟前', posters: ['张', 'AI', '匿'] },
  { title: '希望社团活动通知能集中展示，不要分散在多个群里', tags: ['活动社团', '建议类'], replies: 12, views: 241, activity: '1小时前', posters: ['吴', '郑'] },
  { title: '操场夜间照明有几盏灯坏了，跑步区域比较暗', tags: ['校园设施', '已收集'], replies: 8, views: 198, activity: '2小时前', posters: ['匿', '何'] },
  { title: '部分公共课作业截止时间集中，希望老师之间能协调一下', tags: ['课程吐槽', '情绪较强'], replies: 53, views: 1118, activity: '3小时前', posters: ['匿', '马', '许'] },
  { title: '北门快递点雨天排队区域没有遮挡，取件不太方便', tags: ['生活吐槽', '建议类'], replies: 15, views: 326, activity: '昨天', posters: ['黄', '匿'] },
];

const tagClass = (tag) => {
  if (tag.includes('课程') || tag.includes('公告')) return 'blue';
  if (tag.includes('食堂') || tag.includes('高频')) return 'orange';
  if (tag.includes('宿舍') || tag.includes('急需') || tag.includes('情绪')) return 'red';
  if (tag.includes('设施') || tag.includes('已')) return 'green';
  if (tag.includes('活动')) return 'purple';
  return '';
};

const colors = ['#2563eb', '#f97316', '#7c3aed', '#16a34a', '#dc2626', '#0891b2', '#475569'];
const topicBody = document.getElementById('topicBody');

topicBody.innerHTML = topics.map((topic, index) => `
  <tr class="topic-row">
    <td class="topic-main">
      <div class="topic-title-line">
        ${topic.pinned ? '<span class="pin">📌</span>' : ''}
        <a class="topic-title" href="#">${topic.title}</a>
      </div>
      <div class="topic-meta">
        ${topic.tags.map(tag => `<span class="tag ${tagClass(tag)}">${tag}</span>`).join('')}
      </div>
    </td>
    <td class="posters-cell">
      <div class="posters">
        ${topic.posters.map((p, i) => `<span class="mini-avatar" style="background:${colors[(index + i) % colors.length]}">${p}</span>`).join('')}
      </div>
    </td>
    <td class="num">${topic.replies}<small>回复</small></td>
    <td class="num">${topic.views}<small>浏览</small></td>
    <td class="num activity">${topic.activity}<small>活动</small></td>
  </tr>
`).join('');

document.getElementById('sidebarToggle').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  if (window.innerWidth <= 980) sidebar.classList.toggle('open');
  else sidebar.classList.toggle('collapsed');
});

document.getElementById('userMenuBtn').addEventListener('click', () => {
  document.getElementById('userMenu').classList.toggle('open');
});

document.addEventListener('click', (event) => {
  const menu = document.getElementById('userMenu');
  const btn = document.getElementById('userMenuBtn');
  if (!menu.contains(event.target) && !btn.contains(event.target)) menu.classList.remove('open');
});
