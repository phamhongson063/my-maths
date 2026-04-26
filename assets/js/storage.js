const AppStorage = {
  KEY: 'sansu_progress',

  _load() {
    try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; } catch { return {}; }
  },

  _save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  completeLesson(grade, lessonId, stars) {
    const data = this._load();
    if (!data[grade]) data[grade] = { completed: {}, stars: {} };
    if (!data[grade].completed) data[grade].completed = {};
    data[grade].completed[lessonId] = true;
    if (stars !== undefined) {
      if (!data[grade].stars) data[grade].stars = {};
      data[grade].stars[lessonId] = stars;
    }
    this._save(data);
  },

  isCompleted(grade, lessonId) {
    const data = this._load();
    return !!(data[grade]?.completed?.[lessonId]);
  },

  getCompleted(grade) {
    const data = this._load();
    return Object.keys(data[grade]?.completed || {});
  },

  getStars(grade, lessonId) {
    return this._load()[grade]?.stars?.[lessonId] || 0;
  },

  getGradeProgress(grade, total) {
    if (!total) return 0;
    const done = this.getCompleted(grade).length;
    return Math.round((done / total) * 100);
  }
};
