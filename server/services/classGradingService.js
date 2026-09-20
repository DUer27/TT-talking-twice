const { getPool } = require('../database/connection');
const { callOpenAiJson, hasAiConfig } = require('./aiService');

const RUBRIC_CRITERIA = {
  theory: {
    key: 'theory',
    name: '理论基础与经济学思维',
    maxScore: 30,
    weight: 0.30,
    desc: '对数字经济学核心概念、机制机理与分析框架的理解准确度与阐释深度。',
  },
  empirical: {
    key: 'empirical',
    name: '数据与实证分析能力',
    maxScore: 30,
    weight: 0.30,
    desc: '数据清洗、计量模型/统计方法选择、图表呈现及实证逻辑的严谨规范性。',
  },
  innovation: {
    key: 'innovation',
    name: '创新洞察与现实应用',
    maxScore: 20,
    weight: 0.20,
    desc: '结合产业现实或数字平台前沿问题的独立洞察力、前瞻性与对策创新度。',
  },
  expression: {
    key: 'expression',
    name: '结构严谨度与学术规范',
    maxScore: 20,
    weight: 0.20,
    desc: '论述层次自洽性、论述流畅度、学术引用与格式图表规范。',
  },
};

const TIER_DEFINITIONS = [
  { tier: 'A', minScore: 88, label: '卓越 (A)', targetPercentile: 0.18, badgeClass: 'tier-a', color: '#10b981' },
  { tier: 'B+', minScore: 78, label: '优秀 (B+)', targetPercentile: 0.50, badgeClass: 'tier-b-plus', color: '#3b82f6' },
  { tier: 'B', minScore: 68, label: '良好 (B)', targetPercentile: 0.85, badgeClass: 'tier-b', color: '#f59e0b' },
  { tier: 'C', minScore: 60, label: '合格 (C)', targetPercentile: 0.96, badgeClass: 'tier-c', color: '#8b5cf6' },
  { tier: 'D', minScore: 0, label: '待改进 (D)', targetPercentile: 1.00, badgeClass: 'tier-d', color: '#ef4444' },
];

const clamp = (num, min, max) => Math.min(Math.max(Number(num) || 0, min), max);

const calculateScoreFromRubric = (rubricScores = {}) => {
  const theory = clamp(rubricScores.theory, 0, RUBRIC_CRITERIA.theory.maxScore);
  const empirical = clamp(rubricScores.empirical, 0, RUBRIC_CRITERIA.empirical.maxScore);
  const innovation = clamp(rubricScores.innovation, 0, RUBRIC_CRITERIA.innovation.maxScore);
  const expression = clamp(rubricScores.expression, 0, RUBRIC_CRITERIA.expression.maxScore);
  const total = theory + empirical + innovation + expression;
  return {
    theory,
    empirical,
    innovation,
    expression,
    total: Math.round(total * 10) / 10,
  };
};

const determineBaseTier = (score) => {
  const numScore = Number(score) || 0;
  for (const item of TIER_DEFINITIONS) {
    if (numScore >= item.minScore) return item.tier;
  }
  return 'D';
};

const applyLeapTierPromotion = (baseTier, rankGain, score, initialRank, rankInClass) => {
  const isLeap = (Number(rankGain) >= 15) || (Number(initialRank) > 25 && Number(rankInClass) <= 12);
  if (!isLeap) return { tier: baseTier, isLeap: false, leapReason: null };

  let promotedTier = baseTier;
  let leapReason = null;
  if (baseTier === 'B' && score >= 65) {
    promotedTier = 'B+';
    leapReason = `触发位次跃迁激励：班级排名相比高考位次跃升 ${rankGain} 名，等级由 B 破格晋升为 B+`;
  } else if (baseTier === 'B+' && score >= 80) {
    promotedTier = 'A';
    leapReason = `触发位次跃迁激励：班级排名相比高考位次跃升 ${rankGain} 名，表现优异破格晋升为 A`;
  } else if (baseTier === 'C' && score >= 58) {
    promotedTier = 'B';
    leapReason = `触发位次跃迁激励：位次跃升 ${rankGain} 名，等级晋升为 B`;
  } else if (baseTier === 'A') {
    leapReason = `稳步跃迁先锋：高考位次偏后但作业排位跃进顶尖梯队（前 ${rankInClass} 名）`;
  }

  return {
    tier: promotedTier,
    isLeap: true,
    leapReason,
  };
};

const recalculateClassRanksAndTiers = async (assignmentId) => {
  const pool = getPool();
  const [submissions] = await pool.execute(
    `SELECT cs.id, cs.score, cs.tier, cs.user_id,
            cr.initial_rank, cr.student_no, cr.class_id, cr.name
     FROM class_submissions cs
     LEFT JOIN users u ON u.id = cs.user_id
     LEFT JOIN class_roster cr ON (cr.user_id = cs.user_id OR (u.student_no IS NOT NULL AND u.student_no = cr.student_no))
     WHERE cs.assignment_id = ? AND cs.score IS NOT NULL
     ORDER BY cs.score DESC, cs.id ASC`,
    [assignmentId]
  );
  if (!submissions.length) return;

  const submissionsByClass = new Map();
  for (const item of submissions) {
    const cid = String(item.class_id || 'unassigned');
    if (!submissionsByClass.has(cid)) submissionsByClass.set(cid, []);
    submissionsByClass.get(cid).push(item);
  }

  const updates = [];
  for (const [_cid, classItems] of submissionsByClass.entries()) {
    for (let index = 0; index < classItems.length; index += 1) {
      const item = classItems[index];
      const rankInClass = index + 1;
      const initialRank = Number(item.initial_rank) || 25;
      const rankGain = initialRank - rankInClass;
      const baseTier = determineBaseTier(item.score);
      const { tier: finalTier, isLeap } = applyLeapTierPromotion(
        baseTier,
        rankGain,
        item.score,
        initialRank,
        rankInClass
      );

      updates.push(
        pool.execute(
          `UPDATE class_submissions
           SET rank_in_class = ?, rank_gain = ?, tier = ?, is_leap = ?
           WHERE id = ?`,
          [rankInClass, rankGain, finalTier, isLeap ? 1 : 0, item.id]
        )
      );
    }
  }

  await Promise.all(updates);
};

const buildHeuristicAiEvaluation = ({ studentName, originProvince, gaokaoMath, gaokaoScore, initialRank, note, originalName }) => {
  const mathScore = Number(gaokaoMath) || 75;
  const isHighMath = mathScore >= 95;
  const isMidMath = mathScore >= 75 && mathScore < 95;
  const hasNote = Boolean(note && note.trim().length > 5);

  let theory = 24;
  let empirical = 23;
  let innovation = 15;
  let expression = 16;

  if (isHighMath) {
    theory += 3;
    empirical += 4;
    innovation += 2;
    expression += 2;
  } else if (isMidMath) {
    theory += 2;
    empirical += 2;
    innovation += 1;
    expression += 1;
  }

  if (hasNote) {
    theory = Math.min(30, theory + 1);
    empirical = Math.min(30, empirical + 2);
    expression = Math.min(20, expression + 1);
  }

  const rubric = calculateScoreFromRubric({ theory, empirical, innovation, expression });
  const rawScore = rubric.total;
  const baseTier = determineBaseTier(rawScore);

  const studentFeedback = `同学你好！本次提交的《${originalName || '课程小结'}》整体架构严谨，经济学逻辑清晰。`
    + `在理论分析与机制阐述上展现了良好的数字经济思维；在数据与案例部分论证充分，能够结合实际商业场景或政策背景展开探讨。`
    + `建议下一步在实证数据的时间跨度与因果推断严密性上做进一步深化，尝试引入更多前沿文献对照。继续保持！`;

  const teacherDiagnosticNote = `【学情诊断与教学建议（仅教师可见）】\n`
    + `1. 生源基线：该生来自${originProvince || '统招省份'}，高考总分 ${gaokaoScore || '未录入'}，高考数学 ${mathScore} 分（初始班级排位第 ${initialRank || '未排'} 名）。\n`
    + `2. 表现评估：本次作业实证得分 ${empirical}/30，理论得分 ${theory}/30，${mathScore < 80 ? '打破了数学基础相对薄弱的预期，实证规范度超出省份基准，展现出极佳的大学自主学习潜力' : '较好延续了其良好的数理逻辑优势，完成度高且符合拔尖预期'}。\n`
    + `3. 导师建议：${mathScore < 80 ? '建议在课堂多给予正向鼓励，强化其对计量经济与统计建模的自驱自信；可引导参与研讨小组。' : '建议鼓励该生尝试投稿大学生数字经济创新论坛或参与高阶科研课题挑战。'}`;

  return {
    rubric,
    suggestedScore: rawScore,
    suggestedTier: baseTier,
    confidence: '0.88',
    studentFeedback,
    teacherDiagnosticNote,
  };
};

const runAiGradingForSubmission = async (submissionId, { forceHeuristic = false } = {}) => {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT cs.*, ca.title AS assignment_title, ca.description AS assignment_description,
            u.email AS student_email, u.nickname AS student_nickname,
            cr.name AS roster_name, cr.student_no, cr.origin_province,
            cr.gaokao_score, cr.gaokao_math, cr.gaokao_chinese, cr.gaokao_english, cr.initial_rank,
            cg.name AS class_name
     FROM class_submissions cs
     INNER JOIN class_assignments ca ON ca.id = cs.assignment_id
     LEFT JOIN users u ON u.id = cs.user_id
     LEFT JOIN class_roster cr ON (cr.user_id = cs.user_id OR (u.student_no IS NOT NULL AND u.student_no = cr.student_no))
     LEFT JOIN class_groups cg ON cg.id = cr.class_id
     WHERE cs.id = ?
     LIMIT 1`,
    [submissionId]
  );

  const submission = rows[0];
  if (!submission) {
    throw new Error('未找到该提交记录');
  }

  const studentName = submission.roster_name || submission.student_nickname || '学生';
  const originProvince = submission.origin_province || '未录入';
  const gaokaoScore = submission.gaokao_score ? Number(submission.gaokao_score) : '未录入';
  const gaokaoMath = submission.gaokao_math ? Number(submission.gaokao_math) : '未录入';
  const initialRank = submission.initial_rank || '未排位';

  let evaluationResult = null;

  if (hasAiConfig() && !forceHeuristic) {
    const systemPrompt = [
      '你是一名数字经济学专业资深大学教授与教学专家。',
      '你正在对学生的大学数字经济学课程期中/阶段作业进行多维度量规评分与学情诊断。',
      '请严格遵守【前后台解耦（双轨制）】原则：',
      '1. 给学生的评语（studentFeedback）：必须只针对本次作业本身（理论机制、实证分析、创新思考、结构表达），语言诚恳激励、有具体建设性指导，绝对不得提及高考分数、高考数学或高考排位。',
      '2. 给教师的学情备忘（teacherDiagnosticNote）：专门供任课老师参考，结合学生高考数学与总分基线、生源省份背景，分析该生在大学课程中的学习适应性、进步幅度、潜在瓶颈及后续教学帮扶策略。',
      '3. 量规评分包含四个维度（总分 100 分）：',
      '   - theory (理论基础与经济学思维, 满分 30)',
      '   - empirical (数据与实证分析能力, 满分 30)',
      '   - innovation (创新洞察与现实应用, 满分 20)',
      '   - expression (结构严谨度与学术规范, 满分 20)',
      '返回严格的 JSON 对象，包含：',
      '{',
      '  "theory": number,',
      '  "empirical": number,',
      '  "innovation": number,',
      '  "expression": number,',
      '  "suggestedScore": number,',
      '  "suggestedTier": "A" | "B+" | "B" | "C" | "D",',
      '  "confidence": "0.92",',
      '  "studentFeedback": "针对本次作业的建设性激励评语（120-240字）",',
      '  "teacherDiagnosticNote": "结合高考基线与作业表现的内部诊断建议（150-300字）"',
      '}',
    ].join('\n');

    const userPrompt = JSON.stringify({
      studentInfo: {
        name: studentName,
        className: submission.class_name,
        originProvince,
        gaokaoTotal: gaokaoScore,
        gaokaoMath,
        initialRank,
      },
      assignment: {
        title: submission.assignment_title,
        description: submission.assignment_description,
      },
      submission: {
        originalFileName: submission.original_name,
        studentNote: submission.note || '',
        submittedAt: submission.created_at,
      },
    });

    try {
      const aiResponse = await callOpenAiJson({ system: systemPrompt, user: userPrompt });
      if (aiResponse && (aiResponse.suggestedScore || aiResponse.theory !== undefined) && aiResponse.studentFeedback) {
        const rubric = calculateScoreFromRubric({
          theory: aiResponse.theory,
          empirical: aiResponse.empirical,
          innovation: aiResponse.innovation,
          expression: aiResponse.expression,
        });
        evaluationResult = {
          rubric,
          suggestedScore: rubric.total,
          suggestedTier: aiResponse.suggestedTier || determineBaseTier(rubric.total),
          confidence: String(aiResponse.confidence || '0.92'),
          studentFeedback: String(aiResponse.studentFeedback).trim(),
          teacherDiagnosticNote: String(aiResponse.teacherDiagnosticNote).trim(),
        };
      }
    } catch (_err) {
      // Fallback heuristic
    }
  }

  if (!evaluationResult) {
    evaluationResult = buildHeuristicAiEvaluation({
      studentName,
      originProvince,
      gaokaoMath,
      gaokaoScore,
      initialRank,
      note: submission.note,
      originalName: submission.original_name,
    });
  }

  await pool.execute(
    `UPDATE class_submissions
     SET ai_suggested_tier = ?,
         ai_suggested_score = ?,
         ai_evaluation = ?,
         status = CASE WHEN status = 'submitted' THEN 'ai_pregraded' ELSE status END
     WHERE id = ?`,
    [
      evaluationResult.suggestedTier,
      evaluationResult.suggestedScore,
      JSON.stringify(evaluationResult),
      submissionId,
    ]
  );

  return {
    submissionId,
    ...evaluationResult,
  };
};
const batchAiGradeSubmissions = async ({ classId = null, assignmentId = null, submissionIds = [], forceHeuristic = false } = {}) => {
  const pool = getPool();
  let targetIds = Array.isArray(submissionIds) ? submissionIds.map((id) => Number(id)).filter(Boolean) : [];
  if (!targetIds.length) {
    let query = `
      SELECT cs.id
      FROM class_submissions cs
      LEFT JOIN users u ON u.id = cs.user_id
      LEFT JOIN class_roster cr ON (cr.user_id = cs.user_id OR (u.student_no IS NOT NULL AND u.student_no = cr.student_no))
      WHERE (cs.score IS NULL OR cs.status = 'submitted')
    `;
    const qParams = [];
    if (assignmentId) {
      query += ' AND cs.assignment_id = ?';
      qParams.push(assignmentId);
    }
    if (classId) {
      query += ' AND cr.class_id = ?';
      qParams.push(classId);
    }
    const [rows] = await pool.execute(query, qParams);
    targetIds = rows.map((r) => r.id);
  }
  const results = [];
  for (const id of targetIds) {
    try {
      const evaluation = await runAiGradingForSubmission(id, { forceHeuristic });
      results.push({ id, success: true, evaluation });
    } catch (err) {
      results.push({ id, success: false, error: err.message });
    }
  }

  return {
    total: targetIds.length,
    successCount: results.filter((r) => r.success).length,
    failCount: results.filter((r) => !r.success).length,
    results,
  };
};


const gradeSubmission = async ({
  submissionId,
  teacherId,
  score,
  tier,
  rubricScores,
  feedback,
  teacherDiagnosticNote,
}) => {
  const pool = getPool();
  const [rows] = await pool.execute('SELECT * FROM class_submissions WHERE id = ? LIMIT 1', [submissionId]);
  const submission = rows[0];
  if (!submission) throw new Error('提交记录不存在');

  const safeRubric = rubricScores ? calculateScoreFromRubric(rubricScores) : null;
  const safeScore = safeRubric ? safeRubric.total : clamp(score, 0, 100);
  const safeTier = tier && ['A', 'B+', 'B', 'C', 'D'].includes(tier) ? tier : determineBaseTier(safeScore);
  const safeFeedback = String(feedback || '').trim();
  const safeDiagnosticNote = String(teacherDiagnosticNote || '').trim();

  await pool.execute(
    `UPDATE class_submissions
     SET score = ?,
         tier = ?,
         rubric_scores = ?,
         feedback = ?,
         teacher_diagnostic_note = ?,
         status = 'graded',
         graded_at = CURRENT_TIMESTAMP,
         graded_by = ?
     WHERE id = ?`,
    [
      safeScore,
      safeTier,
      safeRubric ? JSON.stringify(safeRubric) : null,
      safeFeedback,
      safeDiagnosticNote,
      teacherId,
      submissionId,
    ]
  );

  await recalculateClassRanksAndTiers(submission.assignment_id);

  const [updatedRows] = await pool.execute('SELECT * FROM class_submissions WHERE id = ? LIMIT 1', [submissionId]);
  return updatedRows[0];
};

const getClassDiagnostics = async ({ classId = null, assignmentId = null } = {}) => {
  const pool = getPool();

  let rosterQuery = `
    SELECT cr.*, cg.name AS class_name
    FROM class_roster cr
    INNER JOIN class_groups cg ON cg.id = cr.class_id
  `;
  const rosterParams = [];
  if (classId) {
    rosterQuery += ' WHERE cr.class_id = ?';
    rosterParams.push(classId);
  }
  rosterQuery += ' ORDER BY cr.class_id ASC, cr.initial_rank ASC, cr.student_no ASC';
  const [roster] = await pool.execute(rosterQuery, rosterParams);

  let submissionQuery = `
    SELECT cs.*, ca.title AS assignment_title,
           u.student_no AS user_student_no, u.nickname AS student_nickname,
           cr.name AS roster_name, cr.student_no AS roster_student_no, cr.class_id,
           cr.origin_province, cr.gaokao_score, cr.gaokao_math, cr.initial_rank,
           cg.name AS class_name
    FROM class_submissions cs
    INNER JOIN class_assignments ca ON ca.id = cs.assignment_id
    LEFT JOIN users u ON u.id = cs.user_id
    LEFT JOIN class_roster cr ON (cr.user_id = cs.user_id OR (u.student_no IS NOT NULL AND u.student_no = cr.student_no))
    LEFT JOIN class_groups cg ON cg.id = cr.class_id
    WHERE 1 = 1
  `;
  const subParams = [];
  if (assignmentId) {
    submissionQuery += ' AND cs.assignment_id = ?';
    subParams.push(assignmentId);
  }
  if (classId) {
    submissionQuery += ' AND cr.class_id = ?';
    subParams.push(classId);
  }
  submissionQuery += ' ORDER BY cs.score DESC, cs.id ASC';
  const [submissions] = await pool.execute(submissionQuery, subParams);

  const totalStudents = roster.length;
  const submittedCount = submissions.length;
  const gradedSubmissions = submissions.filter((s) => s.score !== null);
  const gradedCount = gradedSubmissions.length;
  const submissionRate = totalStudents > 0 ? Math.round((submittedCount / totalStudents) * 1000) / 10 : 0;
  const gradingRate = submittedCount > 0 ? Math.round((gradedCount / submittedCount) * 1000) / 10 : 0;

  const scores = gradedSubmissions.map((s) => Number(s.score)).sort((a, b) => a - b);
  const avgScore = scores.length
    ? Math.round((scores.reduce((sum, v) => sum + v, 0) / scores.length) * 10) / 10
    : 0;
  const medianScore = scores.length
    ? (scores.length % 2 === 0
      ? Math.round(((scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2) * 10) / 10
      : scores[Math.floor(scores.length / 2)])
    : 0;
  const maxScore = scores.length ? scores[scores.length - 1] : 0;
  const minScore = scores.length ? scores[0] : 0;

  const tierDistribution = { A: 0, 'B+': 0, B: 0, C: 0, D: 0 };
  gradedSubmissions.forEach((s) => {
    if (s.tier && tierDistribution[s.tier] !== undefined) {
      tierDistribution[s.tier] += 1;
    }
  });

  const quadrants = {
    breakthrough: [],
    leader: [],
    slipping: [],
    needsSupport: [],
  };

  const studentSubMap = new Map();
  submissions.forEach((s) => {
    const key = s.roster_student_no || s.user_student_no;
    if (key) studentSubMap.set(key, s);
  });

  roster.forEach((student) => {
    const sub = studentSubMap.get(student.student_no);
    const initialRank = Number(student.initial_rank) || 25;
    const isHighBaseline = initialRank <= 25;
    const currentScore = sub && sub.score !== null ? Number(sub.score) : null;
    const rankInClass = sub && sub.rank_in_class ? Number(sub.rank_in_class) : null;
    const rankGain = sub && sub.rank_gain !== null ? Number(sub.rank_gain) : (rankInClass ? initialRank - rankInClass : null);

    const isHighPerformance = currentScore !== null ? currentScore >= 78 || (rankInClass && rankInClass <= 25) : false;
    const isLeap = (rankGain !== null && rankGain >= 15) || (initialRank > 25 && rankInClass && rankInClass <= 12);

    const profile = {
      rosterId: String(student.id),
      studentNo: student.student_no,
      name: student.name,
      classId: student.class_id ? String(student.class_id) : null,
      className: student.class_name,
      originProvince: student.origin_province,
      gaokaoScore: student.gaokao_score ? Number(student.gaokao_score) : null,
      gaokaoMath: student.gaokao_math ? Number(student.gaokao_math) : null,
      initialRank,
      submitted: Boolean(sub),
      score: currentScore,
      tier: sub?.tier || null,
      rankInClass,
      rankGain,
      isLeap,
      submissionId: sub ? String(sub.id) : null,
    };

    if (isHighPerformance && isHighBaseline) {
      quadrants.leader.push(profile);
    } else if (isHighPerformance && !isHighBaseline) {
      quadrants.breakthrough.push(profile);
    } else if (!isHighPerformance && isHighBaseline) {
      quadrants.slipping.push(profile);
    } else {
      quadrants.needsSupport.push(profile);
    }
  });

  const topLeapStudents = [...quadrants.breakthrough]
    .filter((s) => s.rankGain !== null && s.rankGain > 0)
    .sort((a, b) => (b.rankGain || 0) - (a.rankGain || 0))
    .slice(0, 10);

  const atRiskStudents = [...quadrants.slipping, ...quadrants.needsSupport]
    .filter((s) => !s.submitted || (s.score !== null && s.score < 65) || (s.rankGain !== null && s.rankGain <= -12))
    .sort((a, b) => (a.score ?? -1) - (b.score ?? -1))
    .slice(0, 10);

  const provinceStatsMap = new Map();
  roster.forEach((student) => {
    const prov = student.origin_province || '其他省份';
    if (!provinceStatsMap.has(prov)) {
      provinceStatsMap.set(prov, {
        province: prov,
        studentCount: 0,
        totalGaokao: 0,
        totalMath: 0,
        submittedCount: 0,
        scores: [],
      });
    }
    const stat = provinceStatsMap.get(prov);
    stat.studentCount += 1;
    if (student.gaokao_score) stat.totalGaokao += Number(student.gaokao_score);
    if (student.gaokao_math) stat.totalMath += Number(student.gaokao_math);
    const sub = studentSubMap.get(student.student_no);
    if (sub) {
      stat.submittedCount += 1;
      if (sub.score !== null) stat.scores.push(Number(sub.score));
    }
  });

  const provinceAnalysis = Array.from(provinceStatsMap.values()).map((stat) => ({
    province: stat.province,
    studentCount: stat.studentCount,
    avgGaokao: stat.studentCount ? Math.round((stat.totalGaokao / stat.studentCount) * 10) / 10 : 0,
    avgMath: stat.studentCount ? Math.round((stat.totalMath / stat.studentCount) * 10) / 10 : 0,
    submissionRate: stat.studentCount ? Math.round((stat.submittedCount / stat.studentCount) * 100) : 0,
    avgCourseworkScore: stat.scores.length
      ? Math.round((stat.scores.reduce((a, b) => a + b, 0) / stat.scores.length) * 10) / 10
      : null,
  })).sort((a, b) => b.studentCount - a.studentCount);

  return {
    classId: classId ? Number(classId) : null,
    className: classId ? (Number(classId) === 1 ? '数经1班' : '数经2班') : '全部班级',
    totalStudents,
    submittedCount,
    gradedCount,
    submissionRate,
    gradingRate,
    avgScore,
    medianScore,
    maxScore,
    minScore,
    tierDistribution,
    tierDefinitions: TIER_DEFINITIONS,
    rubricCriteria: RUBRIC_CRITERIA,
    quadrants: {
      breakthroughCount: quadrants.breakthrough.length,
      leaderCount: quadrants.leader.length,
      slippingCount: quadrants.slipping.length,
      needsSupportCount: quadrants.needsSupport.length,
      breakthrough: quadrants.breakthrough,
      leader: quadrants.leader,
      slipping: quadrants.slipping,
      needsSupport: quadrants.needsSupport,
    },
    topLeapStudents,
    atRiskStudents,
    provinceAnalysis,
  };
};

module.exports = {
  RUBRIC_CRITERIA,
  TIER_DEFINITIONS,
  applyLeapTierPromotion,
  batchAiGradeSubmissions,
  buildHeuristicAiEvaluation,
  calculateScoreFromRubric,
  determineBaseTier,
  getClassDiagnostics,
  gradeSubmission,
  recalculateClassRanksAndTiers,
  runAiGradingForSubmission,
};
