function animateProgressBars() {
  document.querySelectorAll('.progress-bar-fill[data-target]').forEach(bar => {
    const target = parseFloat(bar.dataset.target) || 0;
    requestAnimationFrame(() => { bar.style.width = target + '%'; });
  });
}

// Detect base path (root vs grade/ subfolder)
function basePath() {
  return location.pathname.includes('/grade/') ? '../' : '';
}

function renderGradePage(data) {
  const container = document.getElementById('chaptersContainer');
  if (!container || !data) return;

  const grade = String(data.grade);
  const completed = AppStorage.getCompleted(grade);

  let totalLessons = 0;
  data.chapters.forEach(ch => { totalLessons += ch.lessons.length; });

  const doneLessons = completed.length;
  const pct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

  const heroFill = document.getElementById('heroProgressFill');
  const heroText = document.getElementById('heroProgressText');
  if (heroFill) heroFill.style.width = pct + '%';
  if (heroText) heroText.textContent = `${doneLessons} / ${totalLessons} レッスン (${pct}%)`;

  const base = basePath();
  let html = '';

  data.chapters.forEach((ch, ci) => {
    html += `
      <div class="chapter-block">
        <div class="chapter-header">
          <span class="chapter-icon">${ch.icon}</span>
          <div class="chapter-info">
            <div class="chapter-num">だい ${ci + 1} しょう</div>
            <div class="chapter-name">${ch.title}</div>
          </div>
          <span class="chapter-count">${ch.lessons.length} レッスン</span>
        </div>
        <div class="lesson-list">
          ${ch.lessons.map(lesson => {
            const isDone = AppStorage.isCompleted(grade, lesson.id);
            const isQuiz = lesson.type === 'quiz';
            const statusIcon = isDone ? '✅' : isQuiz ? '📝' : '📖';
            const extraClass = [isQuiz ? 'quiz-item' : '', isDone ? 'completed' : ''].join(' ').trim();
            const typeLabel = isQuiz ? 'かくにんテスト' : 'レッスン';
            const typeClass = isQuiz ? 'quiz-type' : '';
            const href = isQuiz
              ? `${base}quiz/quiz.html?grade=${grade}&qid=${lesson.id}`
              : `${base}lesson/lesson.html?grade=${grade}&lid=${lesson.id}`;
            return `
              <a class="lesson-item ${extraClass}" href="${href}">
                <span class="lesson-status-icon">${statusIcon}</span>
                <div class="lesson-info">
                  <div class="lesson-title">${lesson.title}</div>
                  <div class="lesson-type ${typeClass}">${typeLabel}</div>
                </div>
                <div class="lesson-meta">
                  <span class="lesson-duration">⏱ ${lesson.duration}ふん</span>
                  <span class="lesson-stars">${isDone ? '⭐⭐⭐' : '☆☆☆'}</span>
                </div>
              </a>`;
          }).join('')}
        </div>
      </div>`;
  });

  container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', animateProgressBars);
