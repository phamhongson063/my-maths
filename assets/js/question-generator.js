/**
 * Question Generator — sinh câu hỏi tự động cho từng chương
 * Mỗi lần gọi generate() sẽ trả về bộ câu ngẫu nhiên + đáp án đã đảo
 */
const QuestionGenerator = {

  /* ── Utilities ── */

  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  // Sinh số sai gần đúng (trông hợp lý với trẻ nhỏ)
  wrongNums(correct, count = 3, min = 0, max = 99) {
    const nearby = [];
    for (let d = 1; d <= 30 && nearby.length < count * 3; d++) {
      if (correct - d >= min) nearby.push(correct - d);
      if (correct + d <= max) nearby.push(correct + d);
    }
    return this.shuffle(nearby).slice(0, count).map(String);
  },

  // Đảo đáp án, track đáp án đúng
  shuffleChoices(q) {
    const correct = q.choices[q.answer];
    const shuffled = this.shuffle([...q.choices]);
    return { ...q, choices: shuffled, answer: shuffled.indexOf(correct) };
  },

  // Entry point: sinh `perSession` câu từ pool của chương
  generate(grade, qid, perSession = 15) {
    const chapterNum = parseInt((qid || '1-1-q').split('-')[1]) || 1;
    const builderKey = `g${grade}c${chapterNum}`;
    const builder = this[builderKey];
    if (!builder) return [];
    const pool = builder.call(this);
    return this.shuffle(pool)
      .slice(0, Math.min(perSession, pool.length))
      .map(q => this.shuffleChoices(q));
  },

  /* ══════════════════════════════════════
     GRADE 1 — Chapter 1: かずとすうじ
  ══════════════════════════════════════ */
  g1c1() {
    const pool = [];
    const EMOJI = ['🍎','🌟','🐶','🐱','🐰','🐸','🌸','🍌','🎈','⭐','🦋','🐣','🍭','🎀','🐥','🍓','🐼','🦊','🐮','🎵'];

    // かずをかぞえよう (1〜20)
    for (let n = 1; n <= 20; n++) {
      const em = EMOJI[n % EMOJI.length];
      const visual = n <= 10 ? em.repeat(n) : `${em.repeat(10)}（${n}こ）`;
      pool.push({
        text: `${visual}\nいくつ？`,
        choices: [String(n), ...this.wrongNums(n, 3, 1, 20)],
        answer: 0
      });
    }

    // つぎのかずは？(1〜29)
    for (let n = 1; n <= 29; n++) {
      pool.push({
        text: `${n} の つぎの かずは？`,
        choices: [String(n + 1), ...this.wrongNums(n + 1, 3, 1, 30)],
        answer: 0
      });
    }

    // まえのかずは？(2〜20)
    for (let n = 2; n <= 20; n++) {
      pool.push({
        text: `${n} の まえの かずは？`,
        choices: [String(n - 1), ...this.wrongNums(n - 1, 3, 0, 20)],
        answer: 0
      });
    }

    // どちらがおおきい？
    const pairsB = [];
    for (let a = 1; a <= 20; a++)
      for (let b = a + 1; b <= 20; b++)
        pairsB.push([a, b]);
    this.shuffle(pairsB).slice(0, 60).forEach(([a, b]) => {
      pool.push({
        text: `${a} と ${b}、どちらが おおきい？`,
        choices: [String(b), String(a), String(b + 1), String(Math.max(1, a - 1))],
        answer: 0
      });
    });

    // どちらがちいさい？
    this.shuffle(pairsB).slice(0, 50).forEach(([a, b]) => {
      pool.push({
        text: `${a} と ${b}、どちらが ちいさい？`,
        choices: [String(a), String(b), String(a + 1), String(b + 1)],
        answer: 0
      });
    });

    // □にあてはまる数
    for (let n = 2; n <= 18; n++) {
      pool.push({
        text: `1、2、…、${n - 1}、□、${n + 1} の □は？`,
        choices: [String(n), ...this.wrongNums(n, 3, 1, 20)],
        answer: 0
      });
    }

    // 10はなんとなん？
    for (let a = 1; a <= 9; a++) {
      const b = 10 - a;
      pool.push({
        text: `10 は ${a} と なん を あわせた かず？`,
        choices: [String(b), ...this.wrongNums(b, 3, 1, 9)],
        answer: 0
      });
    }

    return pool;
  },

  /* ══════════════════════════════════════
     GRADE 1 — Chapter 2: たしざん
  ══════════════════════════════════════ */
  g1c2() {
    const pool = [];
    const THINGS = [
      ['りんご','こ'], ['あめ','こ'], ['ほん','さつ'], ['えんぴつ','ぽん'],
      ['きって','まい'], ['たまご','こ'], ['ふうせん','こ'], ['はな','ほん'],
      ['おかし','こ'], ['さかな','ひき'], ['とり','わ'], ['こども','にん']
    ];
    const ACTIONS = ['もらいました','きました','ふえました','かいました'];

    // a + b = ? (全組み合わせ, 結果≤18)
    for (let a = 0; a <= 9; a++) {
      for (let b = 0; b <= 9; b++) {
        const r = a + b;
        if (r === 0) continue;
        pool.push({
          text: `${a} ＋ ${b} ＝ ？`,
          choices: [String(r), ...this.wrongNums(r, 3, 0, 18)],
          answer: 0
        });
      }
    }

    // □ + b = r (穴埋め)
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        const r = a + b;
        if (r > 18) continue;
        pool.push({
          text: `□ ＋ ${b} ＝ ${r}`,
          choices: [String(a), ...this.wrongNums(a, 3, 0, 9)],
          answer: 0
        });
        pool.push({
          text: `${a} ＋ □ ＝ ${r}`,
          choices: [String(b), ...this.wrongNums(b, 3, 0, 9)],
          answer: 0
        });
      }
    }

    // ぶんしょうもんだい
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        const r = a + b;
        if (r > 18) continue;
        const [thing, counter] = THINGS[Math.floor(Math.random() * THINGS.length)];
        const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        pool.push({
          text: `${thing}が ${a}${counter} あります。${b}${counter} ${action}。\nぜんぶで なん${counter}？`,
          choices: [String(r), ...this.wrongNums(r, 3, 1, 18)],
          answer: 0
        });
      }
    }

    // a + b + c (3つのたし算)
    for (let a = 1; a <= 5; a++) {
      for (let b = 1; b <= 5; b++) {
        for (let c = 1; c <= 5; c++) {
          const r = a + b + c;
          if (r > 15) continue;
          pool.push({
            text: `${a} ＋ ${b} ＋ ${c} ＝ ？`,
            choices: [String(r), ...this.wrongNums(r, 3, 1, 15)],
            answer: 0
          });
        }
      }
    }

    return pool;
  },

  /* ══════════════════════════════════════
     GRADE 1 — Chapter 3: ひきざん
  ══════════════════════════════════════ */
  g1c3() {
    const pool = [];
    const THINGS = [
      ['りんご','こ'], ['あめ','こ'], ['クッキー','まい'], ['えんぴつ','ぽん'],
      ['ほん','さつ'], ['たまご','こ'], ['ふうせん','こ'], ['はな','ほん'],
      ['さかな','ひき'], ['こども','にん'], ['とり','わ'], ['おかし','こ']
    ];
    const ACTIONS = ['たべました','あげました','なくなりました','つかいました','こわれました'];

    // a - b = ? (全組み合わせ)
    for (let a = 0; a <= 18; a++) {
      for (let b = 0; b <= a; b++) {
        const r = a - b;
        pool.push({
          text: `${a} ー ${b} ＝ ？`,
          choices: [String(r), ...this.wrongNums(r, 3, 0, a)],
          answer: 0
        });
      }
    }

    // □ - b = r (穴埋め)
    for (let a = 2; a <= 10; a++) {
      for (let b = 1; b < a; b++) {
        const r = a - b;
        pool.push({
          text: `□ ー ${b} ＝ ${r}`,
          choices: [String(a), ...this.wrongNums(a, 3, b + 1, 10)],
          answer: 0
        });
        pool.push({
          text: `${a} ー □ ＝ ${r}`,
          choices: [String(b), ...this.wrongNums(b, 3, 0, a - 1)],
          answer: 0
        });
      }
    }

    // のこりはなんこ？(ぶんしょうもんだい)
    for (let a = 2; a <= 10; a++) {
      for (let b = 1; b < a; b++) {
        const r = a - b;
        const [thing, counter] = THINGS[Math.floor(Math.random() * THINGS.length)];
        const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
        pool.push({
          text: `${thing}が ${a}${counter} あります。${b}${counter} ${action}。\nのこりは なん${counter}？`,
          choices: [String(r), ...this.wrongNums(r, 3, 0, a)],
          answer: 0
        });
      }
    }

    // ちがいはなんこ？
    for (let a = 2; a <= 10; a++) {
      for (let b = 1; b < a; b++) {
        const diff = a - b;
        const [thing1] = THINGS[Math.floor(Math.random() * THINGS.length)];
        const [thing2] = THINGS[Math.floor(Math.random() * THINGS.length)];
        pool.push({
          text: `${thing1}が ${a}こ、${thing2}が ${b}こ。\nちがいは なんこ？`,
          choices: [String(diff), ...this.wrongNums(diff, 3, 0, a)],
          answer: 0
        });
      }
    }

    return pool;
  },

  /* ══════════════════════════════════════
     GRADE 1 — Chapter 4: かたちとながさ
  ══════════════════════════════════════ */
  g1c4() {
    const pool = [
      { text: '🔺 このかたちは なに？', choices: ['さんかく','まる','しかく','ながしかく'], answer: 0 },
      { text: '🔵 このかたちは なに？', choices: ['まる','さんかく','しかく','ほし'], answer: 0 },
      { text: '🟥 このかたちは なに？', choices: ['しかく','まる','さんかく','ながしかく'], answer: 0 },
      { text: '⬜ このかたちは なに？', choices: ['しかく','まる','さんかく','ほし'], answer: 0 },
      { text: 'さんかくけいの かどは いくつ？', choices: ['3つ','2つ','4つ','5つ'], answer: 0 },
      { text: 'しかくけいの かどは いくつ？', choices: ['4つ','3つ','5つ','2つ'], answer: 0 },
      { text: 'まるの かどは いくつ？', choices: ['0こ','1こ','2こ','4こ'], answer: 0 },
      { text: 'ボールは どの かたち？', choices: ['まる','しかく','さんかく','ほし'], answer: 0 },
      { text: 'おにぎりは どの かたち？', choices: ['さんかく','まる','しかく','ほし'], answer: 0 },
      { text: 'はこは どの かたち？', choices: ['しかく','まる','さんかく','ほし'], answer: 0 },
      { text: 'とけいは どの かたち？', choices: ['まる','しかく','さんかく','ほし'], answer: 0 },
      { text: 'まどは どの かたち？', choices: ['しかく','まる','さんかく','ほし'], answer: 0 },
      { text: 'ながさを はかる きごうは？', choices: ['cm','kg','L','g'], answer: 0 },
      { text: 'おもさを はかる きごうは？', choices: ['kg','cm','L','m'], answer: 0 },
      { text: '1メートルは なんセンチ？', choices: ['100cm','10cm','50cm','1000cm'], answer: 0 },
      { text: 'てんびんで おもいほうは どうなる？', choices: ['したにさがる','うえにあがる','かわらない','よこにうごく'], answer: 0 },
      { text: '1キログラムは なんグラム？', choices: ['1000g','100g','10g','500g'], answer: 0 },
      { text: 'えんぴつと けしごま、ながいのは？', choices: ['えんぴつ','けしごま','おなじ','わからない'], answer: 0 },
      { text: 'つくえと いす、たかいのは？', choices: ['つくえ','いす','おなじ','わからない'], answer: 0 },
      { text: '三角形の辺(へん)は いくつ？', choices: ['3つ','2つ','4つ','5つ'], answer: 0 },
    ];

    // ながさくらべ
    const lengths = [
      [8, 5, 'えんぴつ', 'けしごま'], [12, 7, 'つくえ', 'いす'],
      [3, 9, 'リボン A', 'リボン B'], [15, 10, 'ひも A', 'ひも B'],
      [6, 11, 'ぼう A', 'ぼう B'], [20, 14, 'ロープ A', 'ロープ B'],
      [4, 4, 'テープ A', 'テープ B'],
    ];
    lengths.forEach(([a, b, nameA, nameB]) => {
      if (a !== b) {
        const longer = a > b ? nameA : nameB;
        pool.push({
          text: `${nameA}は ${a}cm、${nameB}は ${b}cm。\nながいのは どちら？`,
          choices: [longer, a > b ? nameB : nameA, 'おなじ', 'わからない'],
          answer: 0
        });
      } else {
        pool.push({
          text: `${nameA}は ${a}cm、${nameB}は ${b}cm。\nどちらが ながい？`,
          choices: ['おなじ', nameA, nameB, 'わからない'],
          answer: 0
        });
      }
    });

    // おもさくらべ
    const weights = [
      [500, 300, 'スイカ', 'りんご'], [200, 800, 'バナナ', 'メロン'],
      [50, 150, 'みかん', 'ぶどう'], [1000, 600, 'かぼちゃ', 'もも'],
    ];
    weights.forEach(([a, b, nameA, nameB]) => {
      const heavier = a > b ? nameA : nameB;
      pool.push({
        text: `${nameA}は ${a}g、${nameB}は ${b}g。\nおもいのは どちら？`,
        choices: [heavier, a > b ? nameB : nameA, 'おなじ', 'わからない'],
        answer: 0
      });
    });

    return pool;
  },

  /* ══════════════════════════════════════
     GRADE 2 — Chapter 1: 大きなかず
  ══════════════════════════════════════ */
  g2c1() {
    const pool = [];
    // 100までのかず
    for (let n = 10; n <= 100; n += 5) {
      pool.push({
        text: `${n - 1} の つぎは？`,
        choices: [String(n), ...this.wrongNums(n, 3, n - 5, n + 5)],
        answer: 0
      });
    }
    // 位の問題
    for (let tens = 1; tens <= 9; tens++) {
      for (let ones = 1; ones <= 9; ones++) {
        const n = tens * 10 + ones;
        pool.push({
          text: `${tens}と${ones}をあわせると？（十のくらいが${tens}）`,
          choices: [String(n), ...this.wrongNums(n, 3, n - 5, n + 5)],
          answer: 0
        });
      }
    }
    return pool;
  },

  /* ══════════════════════════════════════
     GRADE 2 — Chapter 2: かけざん（九九）
  ══════════════════════════════════════ */
  g2c2() {
    const pool = [];
    for (let a = 1; a <= 9; a++) {
      for (let b = 1; b <= 9; b++) {
        const r = a * b;
        pool.push({
          text: `${a} × ${b} ＝ ？`,
          choices: [String(r), ...this.wrongNums(r, 3, 1, 81)],
          answer: 0
        });
        // 穴埋め
        pool.push({
          text: `${a} × □ ＝ ${r}`,
          choices: [String(b), ...this.wrongNums(b, 3, 1, 9)],
          answer: 0
        });
      }
    }
    // 九九ぶんしょう
    const items = [['えんぴつ','本'],['りんご','個'],['あめ','個'],['クッキー','枚']];
    for (let a = 2; a <= 9; a++) {
      for (let b = 2; b <= 9; b++) {
        const [thing, counter] = items[Math.floor(Math.random() * items.length)];
        const r = a * b;
        pool.push({
          text: `${thing}が ${a}${counter}ずつ ${b}ふくろ あります。\nぜんぶで なん${counter}？`,
          choices: [String(r), ...this.wrongNums(r, 3, 1, 81)],
          answer: 0
        });
      }
    }
    return pool;
  },

  /* ══════════════════════════════════════
     GRADE 2 — Chapter 3: 長さとかさ
  ══════════════════════════════════════ */
  g2c3() {
    const pool = [];
    // cm → mm
    for (let cm = 1; cm <= 20; cm++) {
      pool.push({
        text: `${cm}cm は なんmm？`,
        choices: [String(cm * 10), ...this.wrongNums(cm * 10, 3, cm * 5, cm * 15)],
        answer: 0
      });
    }
    // mm → cm
    for (let mm of [10,20,30,40,50,60,70,80,90,100]) {
      pool.push({
        text: `${mm}mm は なんcm？`,
        choices: [String(mm / 10), ...this.wrongNums(mm / 10, 3, 0, 15)],
        answer: 0
      });
    }
    // L → dL
    for (let l = 1; l <= 5; l++) {
      pool.push({
        text: `${l}L は なんdL？`,
        choices: [String(l * 10), ...this.wrongNums(l * 10, 3, l * 5, l * 15)],
        answer: 0
      });
    }
    return pool;
  },

  /* ══════════════════════════════════════
     GRADE 2 — Chapter 4: 図形と時計
  ══════════════════════════════════════ */
  g2c4() {
    const pool = [];
    // 時計
    const times = [
      ['1:00','いちじ'],['2:30','にじはん'],['3:15','さんじじゅうごふん'],
      ['4:45','よじよんじゅうごふん'],['6:00','ろくじ'],['12:00','じゅうにじ'],
      ['7:30','しちじはん'],['9:15','くじじゅうごふん'],
    ];
    times.forEach(([time, reading]) => {
      pool.push({
        text: `${time} は なんじ なんぷん？`,
        choices: [reading, ...['にじ','さんじ','よじ','ごじ'].filter(r => r !== reading).slice(0, 3)],
        answer: 0
      });
    });
    // 時間の計算
    for (let start = 1; start <= 10; start++) {
      for (let dur = 1; dur <= 5; dur++) {
        const end = start + dur;
        pool.push({
          text: `${start}じに はじまって ${dur}じかん ごの じこくは？`,
          choices: [String(end) + 'じ', ...this.wrongNums(end, 3, 1, 12).map(n => n + 'じ')],
          answer: 0
        });
      }
    }
    // 図形
    const shapes = [
      ['三角形(さんかくけい)','3','辺(へん)'],
      ['四角形(しかくけい)','4','辺'],
      ['五角形(ごかくけい)','5','辺'],
      ['三角形','3','角(かど)'],
      ['四角形','4','角'],
    ];
    shapes.forEach(([shape, count, part]) => {
      pool.push({
        text: `${shape}の ${part}は いくつ？`,
        choices: [count, ...['2','5','6','8'].filter(n => n !== count).slice(0, 3)],
        answer: 0
      });
    });
    return pool;
  },
};
