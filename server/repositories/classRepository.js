const { getPool } = require('../database/connection');

const toIsoString = (value) => (value ? new Date(value).toISOString() : null);

const authorName = (row) => row.author_nickname
  || row.author_email?.split('@')[0]
  || '教师';

const studentName = (row) => row.student_nickname
  || row.student_email?.split('@')[0]
  || '学生';

const publicAnnouncement = (row) => {
  if (!row) return null;
  return {
    id: String(row.id),
    classId: row.class_id ? String(row.class_id) : null,
    className: row.class_name || null,
    title: row.title,
    content: row.content,
    authorId: String(row.author_id),
    authorName: authorName(row),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
};

const publicAssignment = (row, { expectedCount = 0 } = {}) => {
  if (!row) return null;
  const submittedCount = Number(row.submission_count || 0);
  const expected = Math.max(Number(expectedCount || 0), 0);
  return {
    id: String(row.id),
    classId: row.class_id ? String(row.class_id) : null,
    className: row.class_name || null,
    title: row.title,
    description: row.description || '',
    dueAt: toIsoString(row.due_at),
    status: row.status,
    authorId: String(row.author_id),
    authorName: authorName(row),
    submissionCount: submittedCount,
    expectedCount: expected,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
};

const publicSubmission = (row, { isManager = false } = {}) => {
  if (!row) return null;
  let rubricScores = null;
  if (row.rubric_scores) {
    try {
      rubricScores = typeof row.rubric_scores === 'string' ? JSON.parse(row.rubric_scores) : row.rubric_scores;
    } catch (_e) {
      rubricScores = null;
    }
  }
  let aiEvaluation = null;
  if (row.ai_evaluation) {
    try {
      aiEvaluation = typeof row.ai_evaluation === 'string' ? JSON.parse(row.ai_evaluation) : row.ai_evaluation;
    } catch (_e) {
      aiEvaluation = null;
    }
  }

  const base = {
    id: String(row.id),
    assignmentId: String(row.assignment_id),
    assignmentTitle: row.assignment_title || '',
    userId: String(row.user_id),
    studentName: row.roster_name || studentName(row),
    studentEmail: row.student_email || '',
    studentNo: row.roster_student_no || row.user_student_no || '',
    classId: row.class_id ? String(row.class_id) : (row.assignment_class_id ? String(row.assignment_class_id) : null),
    className: row.class_name || '',
    note: row.note || '',
    originalName: row.original_name,
    mimeType: row.mime_type || '',
    fileSize: Number(row.file_size || 0),
    storedPath: row.stored_path,
    status: row.status || 'submitted',
    isGraded: Boolean((row.score !== null && row.score !== undefined) || row.status === 'graded'),
    feedback: row.feedback || null,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    gradedAt: toIsoString(row.graded_at),
  };

  if (isManager) {
    return {
      ...base,
      score: row.score !== null && row.score !== undefined ? Number(row.score) : null,
      tier: row.tier || null,
      rankInClass: row.rank_in_class !== null && row.rank_in_class !== undefined ? Number(row.rank_in_class) : null,
      rubricScores,
      originProvince: row.origin_province || '',
      gaokaoScore: row.gaokao_score !== null && row.gaokao_score !== undefined ? Number(row.gaokao_score) : null,
      gaokaoMath: row.gaokao_math !== null && row.gaokao_math !== undefined ? Number(row.gaokao_math) : null,
      gaokaoChinese: row.gaokao_chinese !== null && row.gaokao_chinese !== undefined ? Number(row.gaokao_chinese) : null,
      gaokaoEnglish: row.gaokao_english !== null && row.gaokao_english !== undefined ? Number(row.gaokao_english) : null,
      initialRank: row.initial_rank !== null && row.initial_rank !== undefined ? Number(row.initial_rank) : null,
      rankGain: row.rank_gain !== null && row.rank_gain !== undefined ? Number(row.rank_gain) : null,
      isLeap: Boolean(row.is_leap),
      aiSuggestedTier: row.ai_suggested_tier || null,
      aiSuggestedScore: row.ai_suggested_score !== null && row.ai_suggested_score !== undefined ? Number(row.ai_suggested_score) : null,
      aiEvaluation,
      teacherDiagnosticNote: row.teacher_diagnostic_note || (aiEvaluation?.teacherDiagnosticNote || null),
    };
  }

  return base;
};

const createAnnouncement = async ({ authorId, title, content, classId = null }) => {
  const [result] = await getPool().execute(
    'INSERT INTO class_announcements (author_id, class_id, title, content) VALUES (?, ?, ?, ?)',
    [authorId, classId ? Number(classId) : null, title, content]
  );
  return findAnnouncementById(result.insertId);
};

const findAnnouncementById = async (id) => {
  const [rows] = await getPool().execute(
    `SELECT class_announcements.*, users.email AS author_email, users.nickname AS author_nickname,
            cg.name AS class_name
     FROM class_announcements
     LEFT JOIN users ON users.id = class_announcements.author_id
     LEFT JOIN class_groups cg ON cg.id = class_announcements.class_id
     WHERE class_announcements.id = ?
     LIMIT 1`,
    [id]
  );
  return publicAnnouncement(rows[0]);
};

const listAnnouncements = async ({ classId = null, limit = 50 } = {}) => {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 100));
  const where = [];
  const params = [];
  if (classId) {
    where.push('(class_announcements.class_id = ? OR class_announcements.class_id IS NULL)');
    params.push(classId);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await getPool().execute(
    `SELECT class_announcements.*, users.email AS author_email, users.nickname AS author_nickname,
            cg.name AS class_name
     FROM class_announcements
     LEFT JOIN users ON users.id = class_announcements.author_id
     LEFT JOIN class_groups cg ON cg.id = class_announcements.class_id
     ${whereSql}
     ORDER BY class_announcements.created_at DESC, class_announcements.id DESC
     LIMIT ${safeLimit}`,
    params
  );
  return rows.map(publicAnnouncement);
};

const deleteAnnouncement = async (id) => {
  const [result] = await getPool().execute('DELETE FROM class_announcements WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

const createAssignment = async ({ authorId, title, description, dueAt = null, classId = null }) => {
  const [result] = await getPool().execute(
    'INSERT INTO class_assignments (author_id, class_id, title, description, due_at) VALUES (?, ?, ?, ?, ?)',
    [authorId, classId ? Number(classId) : null, title, description, dueAt]
  );
  return findAssignmentById(result.insertId);
};

const findAssignmentById = async (id, { expectedCount = 0 } = {}) => {
  const [rows] = await getPool().execute(
    `SELECT class_assignments.*, users.email AS author_email, users.nickname AS author_nickname,
            cg.name AS class_name,
            (
              SELECT COUNT(*) FROM class_submissions
              WHERE class_submissions.assignment_id = class_assignments.id
            ) AS submission_count
     FROM class_assignments
     LEFT JOIN users ON users.id = class_assignments.author_id
     LEFT JOIN class_groups cg ON cg.id = class_assignments.class_id
     WHERE class_assignments.id = ?
     LIMIT 1`,
    [id]
  );
  return publicAssignment(rows[0], { expectedCount });
};

const listAssignments = async ({ classId = null, limit = 50, expectedCount = 0 } = {}) => {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 100));
  const where = [];
  const params = [];
  if (classId) {
    where.push('(class_assignments.class_id = ? OR class_assignments.class_id IS NULL)');
    params.push(classId);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await getPool().execute(
    `SELECT class_assignments.*, users.email AS author_email, users.nickname AS author_nickname,
            cg.name AS class_name,
            (
              SELECT COUNT(*) FROM class_submissions
              WHERE class_submissions.assignment_id = class_assignments.id
            ) AS submission_count
     FROM class_assignments
     LEFT JOIN users ON users.id = class_assignments.author_id
     LEFT JOIN class_groups cg ON cg.id = class_assignments.class_id
     ${whereSql}
     ORDER BY class_assignments.created_at DESC, class_assignments.id DESC
     LIMIT ${safeLimit}`,
    params
  );
  return rows.map((row) => publicAssignment(row, { expectedCount }));
};

const updateAssignmentStatus = async ({ id, status }) => {
  await getPool().execute('UPDATE class_assignments SET status = ? WHERE id = ?', [status, id]);
  return findAssignmentById(id);
};

const deleteAssignment = async (id) => {
  const [result] = await getPool().execute('DELETE FROM class_assignments WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

const findSubmissionByAssignmentAndUser = async ({ assignmentId, userId }, { isManager = false } = {}) => {
  const [rows] = await getPool().execute(
    `SELECT class_submissions.*,
            users.email AS student_email,
            users.nickname AS student_nickname,
            users.student_no AS user_student_no,
            class_assignments.title AS assignment_title,
            cr.name AS roster_name,
            cr.student_no AS roster_student_no,
            cr.origin_province,
            cr.gaokao_score,
            cr.gaokao_math,
            cr.gaokao_chinese,
            cr.gaokao_english,
            cr.initial_rank,
            cr.class_id,
            class_assignments.class_id AS assignment_class_id,
            cg.name AS class_name
     FROM class_submissions
     LEFT JOIN users ON users.id = class_submissions.user_id
     LEFT JOIN class_assignments ON class_assignments.id = class_submissions.assignment_id
     LEFT JOIN class_roster cr ON (cr.user_id = class_submissions.user_id OR (users.student_no IS NOT NULL AND users.student_no = cr.student_no))
     LEFT JOIN class_groups cg ON cg.id = cr.class_id
     WHERE class_submissions.assignment_id = ? AND class_submissions.user_id = ?
     LIMIT 1`,
    [assignmentId, userId]
  );
  return publicSubmission(rows[0], { isManager });
};

const findSubmissionById = async (id, { isManager = false } = {}) => {
  const [rows] = await getPool().execute(
    `SELECT class_submissions.*,
            users.email AS student_email,
            users.nickname AS student_nickname,
            users.student_no AS user_student_no,
            class_assignments.title AS assignment_title,
            cr.name AS roster_name,
            cr.student_no AS roster_student_no,
            cr.origin_province,
            cr.gaokao_score,
            cr.gaokao_math,
            cr.gaokao_chinese,
            cr.gaokao_english,
            cr.initial_rank,
            cr.class_id,
            class_assignments.class_id AS assignment_class_id,
            cg.name AS class_name
     FROM class_submissions
     LEFT JOIN users ON users.id = class_submissions.user_id
     LEFT JOIN class_assignments ON class_assignments.id = class_submissions.assignment_id
     LEFT JOIN class_roster cr ON (cr.user_id = class_submissions.user_id OR (users.student_no IS NOT NULL AND users.student_no = cr.student_no))
     LEFT JOIN class_groups cg ON cg.id = cr.class_id
     WHERE class_submissions.id = ?
     LIMIT 1`,
    [id]
  );
  return publicSubmission(rows[0], { isManager });
};

const upsertSubmission = async ({
  assignmentId,
  userId,
  note,
  originalName,
  storedPath,
  mimeType,
  fileSize,
}) => {
  const existing = await findSubmissionByAssignmentAndUser({ assignmentId, userId });
  if (existing) {
    await getPool().execute(
      `UPDATE class_submissions
       SET note = ?, original_name = ?, stored_path = ?, mime_type = ?, file_size = ?
       WHERE assignment_id = ? AND user_id = ?`,
      [note, originalName, storedPath, mimeType, fileSize, assignmentId, userId]
    );
    return {
      previous: existing,
      current: await findSubmissionByAssignmentAndUser({ assignmentId, userId }),
    };
  }

  const [result] = await getPool().execute(
    `INSERT INTO class_submissions
      (assignment_id, user_id, note, original_name, stored_path, mime_type, file_size)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [assignmentId, userId, note, originalName, storedPath, mimeType, fileSize]
  );
  return {
    previous: null,
    current: await findSubmissionById(result.insertId),
  };
};

const listSubmissions = async ({ assignmentId = null, userId = null, classId = null, limit = 100, isManager = false } = {}) => {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 100, 200));
  const params = [];
  const where = [];
  if (assignmentId) {
    where.push('class_submissions.assignment_id = ?');
    params.push(assignmentId);
  }
  if (userId) {
    where.push('class_submissions.user_id = ?');
    params.push(userId);
  }
  if (classId) {
    where.push('(cr.class_id = ? OR (cr.class_id IS NULL AND class_assignments.class_id = ?))');
    params.push(classId, classId);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await getPool().execute(
    `SELECT class_submissions.*,
            users.email AS student_email,
            users.nickname AS student_nickname,
            users.student_no AS user_student_no,
            class_assignments.title AS assignment_title,
            cr.name AS roster_name,
            cr.student_no AS roster_student_no,
            cr.origin_province,
            cr.gaokao_score,
            cr.gaokao_math,
            cr.gaokao_chinese,
            cr.gaokao_english,
            cr.initial_rank,
            cr.class_id,
            class_assignments.class_id AS assignment_class_id,
            cg.name AS class_name
     FROM class_submissions
     LEFT JOIN users ON users.id = class_submissions.user_id
     LEFT JOIN class_assignments ON class_assignments.id = class_submissions.assignment_id
     LEFT JOIN class_roster cr ON (cr.user_id = class_submissions.user_id OR (users.student_no IS NOT NULL AND users.student_no = cr.student_no))
     LEFT JOIN class_groups cg ON cg.id = cr.class_id
     ${whereSql}
     ORDER BY CASE WHEN class_submissions.score IS NOT NULL THEN 0 ELSE 1 END, class_submissions.score DESC, class_submissions.updated_at DESC, class_submissions.id DESC
     LIMIT ${safeLimit}`,
    params
  );
  return rows.map((row) => publicSubmission(row, { isManager }));
};

const countClassRosterStudents = async (classId = null) => {
  if (classId) {
    const [[row]] = await getPool().execute('SELECT COUNT(*) AS total FROM class_roster WHERE class_id = ?', [classId]);
    return Number(row?.total || 0);
  }
  const [[row]] = await getPool().execute('SELECT COUNT(*) AS total FROM class_roster');
  return Number(row?.total || 0);
};

const getClassStats = async (classId = null) => {
  let announcementSql = 'SELECT COUNT(*) AS total FROM class_announcements';
  let assignmentSql = "SELECT COUNT(*) AS total FROM class_assignments WHERE status = 'open'";
  const params = [];
  if (classId) {
    announcementSql += ' WHERE (class_id = ? OR class_id IS NULL)';
    assignmentSql += ' AND (class_id = ? OR class_id IS NULL)';
    params.push(classId);
  }
  const [[announcementRow]] = await getPool().execute(announcementSql, params);
  const [[assignmentRow]] = await getPool().execute(assignmentSql, params);
  const rosterCount = await countClassRosterStudents(classId);
  return {
    announcementCount: Number(announcementRow?.total || 0),
    openAssignmentCount: Number(assignmentRow?.total || 0),
    rosterStudentCount: rosterCount,
  };
};

const publicClassGroup = (row, teachers = [], students = []) => {
  if (!row) return null;
  return {
    id: String(row.id),
    name: row.name,
    teacherCount: teachers.length || Number(row.teacher_count || 0),
    studentCount: students.length || Number(row.student_count || 0),
    teachers,
    students,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
};

const findClassGroupById = async (id) => {
  const [rows] = await getPool().execute('SELECT * FROM class_groups WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

const findClassGroupByName = async (name) => {
  const [rows] = await getPool().execute('SELECT * FROM class_groups WHERE name = ? LIMIT 1', [name]);
  return rows[0] || null;
};

const listTeachersForClass = async (classId) => {
  const [rows] = await getPool().execute(
    `SELECT users.id, users.email, users.nickname, users.role, users.created_at
     FROM class_teachers
     INNER JOIN users ON users.id = class_teachers.user_id
     WHERE class_teachers.class_id = ?
     ORDER BY users.nickname ASC, users.id ASC`,
    [classId]
  );
  return rows.map((row) => ({
    id: String(row.id),
    email: row.email,
    nickname: row.nickname,
    role: row.role,
    createdAt: toIsoString(row.created_at),
  }));
};

const publicRosterStudent = (row) => {
  if (!row) return null;
  return {
    id: row.user_id ? String(row.user_id) : `roster-${row.id}`,
    rosterId: String(row.id),
    email: row.email || '',
    nickname: row.user_nickname || row.name,
    name: row.name,
    role: row.role || 'student',
    studentNo: row.student_no || '',
    inviteCode: row.invite_code || '',
    claimed: Boolean(row.user_id),
    claimedAt: toIsoString(row.claimed_at),
    createdAt: toIsoString(row.created_at),
  };
};

const listStudentsForClass = async (classId) => {
  const [rows] = await getPool().execute(
    `SELECT class_roster.*,
            users.email,
            users.nickname AS user_nickname,
            users.role
     FROM class_roster
     LEFT JOIN users ON users.id = class_roster.user_id
     WHERE class_roster.class_id = ?
     ORDER BY class_roster.student_no ASC, class_roster.id ASC`,
    [classId]
  );
  return rows.map(publicRosterStudent);
};

const findRosterByInviteCode = async (inviteCode) => {
  const normalized = String(inviteCode || '').trim().replace(/\s+/g, '').toUpperCase();
  if (!normalized) return null;
  const [rows] = await getPool().execute(
    `SELECT class_roster.*, class_groups.name AS class_name
     FROM class_roster
     INNER JOIN class_groups ON class_groups.id = class_roster.class_id
     WHERE UPPER(class_roster.invite_code) = ?
     LIMIT 1`,
    [normalized]
  );
  return rows[0] || null;
};

const findClassesForUser = async (userId) => {
  const [rows] = await getPool().execute(
    `SELECT cg.id, cg.name, MIN(cg.created_at) AS created_at
     FROM class_groups cg
     LEFT JOIN class_students cs ON cs.class_id = cg.id AND cs.user_id = ?
     LEFT JOIN class_teachers ct ON ct.class_id = cg.id AND ct.user_id = ?
     WHERE cs.user_id IS NOT NULL OR ct.user_id IS NOT NULL
     GROUP BY cg.id, cg.name
     ORDER BY MIN(cg.created_at) ASC, cg.id ASC`,
    [userId, userId]
  );
  return rows.map((row) => ({
    id: String(row.id),
    name: row.name,
  }));
};

const claimRosterForUser = async ({ rosterId, userId }) => {
  await getPool().execute(
    `UPDATE class_roster
     SET user_id = ?, claimed_at = UTC_TIMESTAMP()
     WHERE id = ? AND user_id IS NULL`,
    [userId, rosterId]
  );
  await getPool().execute(
    `UPDATE class_reminders
     SET user_id = ?
     WHERE roster_id = ? AND user_id IS NULL`,
    [userId, rosterId]
  );
  const [rows] = await getPool().execute(
    `SELECT class_roster.*, class_groups.name AS class_name
     FROM class_roster
     INNER JOIN class_groups ON class_groups.id = class_roster.class_id
     WHERE class_roster.id = ?
     LIMIT 1`,
    [rosterId]
  );
  const roster = rows[0];
  if (roster?.class_id && userId) {
    await getPool().execute(
      'INSERT IGNORE INTO class_students (class_id, user_id) VALUES (?, ?)',
      [roster.class_id, userId]
    );
  }
  return roster || null;
};

const getClassMembers = async (classId) => {
  const [teachers, students] = await Promise.all([
    listTeachersForClass(classId),
    listStudentsForClass(classId),
  ]);
  return { teachers, students };
};

const listClassGroups = async () => {
  const [rows] = await getPool().execute(
    `SELECT class_groups.*,
            (SELECT COUNT(*) FROM class_teachers WHERE class_teachers.class_id = class_groups.id) AS teacher_count,
            (SELECT COUNT(*) FROM class_roster WHERE class_roster.class_id = class_groups.id) AS student_count
     FROM class_groups
     ORDER BY class_groups.created_at ASC, class_groups.id ASC`
  );
  const groups = [];
  for (const row of rows) {
    const { teachers, students } = await getClassMembers(row.id);
    groups.push(publicClassGroup(row, teachers, students));
  }
  return groups;
};

const createClassGroup = async (name) => {
  const [result] = await getPool().execute('INSERT INTO class_groups (name) VALUES (?)', [name]);
  const created = await findClassGroupById(result.insertId);
  return publicClassGroup(created, [], []);
};

const renameClassGroup = async (id, name) => {
  await getPool().execute('UPDATE class_groups SET name = ? WHERE id = ?', [name, id]);
  const updated = await findClassGroupById(id);
  const { teachers, students } = await getClassMembers(id);
  return publicClassGroup(updated, teachers, students);
};

const deleteClassGroup = async (id) => {
  const [result] = await getPool().execute('DELETE FROM class_groups WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

const assignTeacherToClass = async (classId, userId) => {
  await getPool().execute('INSERT IGNORE INTO class_teachers (class_id, user_id) VALUES (?, ?)', [classId, userId]);
  const updated = await findClassGroupById(classId);
  const { teachers, students } = await getClassMembers(classId);
  return publicClassGroup(updated, teachers, students);
};

const removeTeacherFromClass = async (classId, userId) => {
  await getPool().execute('DELETE FROM class_teachers WHERE class_id = ? AND user_id = ?', [classId, userId]);
  const updated = await findClassGroupById(classId);
  const { teachers, students } = await getClassMembers(classId);
  return publicClassGroup(updated, teachers, students);
};
const listPendingStudentsForAssignment = async (assignmentId) => {
  const assignment = await findAssignmentById(assignmentId);
  if (!assignment) return [];

  const classFilterSql = assignment.classId ? 'AND cr.class_id = ?' : '';
  const classParams = assignment.classId ? [assignment.classId] : [];

  // Get all roster students in target class, check their submission and latest reminder
  const [rows] = await getPool().execute(
    `SELECT cr.id AS roster_id,
            cr.student_no,
            cr.name AS student_name,
            cr.origin_province,
            cr.initial_rank,
            cr.gaokao_score,
            cr.gaokao_math,
            cr.user_id,
            cr.class_id,
            cg.name AS class_name,
            sub.id AS submission_id,
            sub.created_at AS submitted_at,
            sub.score,
            rem.id AS reminder_id,
            rem.message AS reminder_message,
            rem.created_at AS reminded_at,
            rem.status AS reminder_status,
            u_teacher.nickname AS reminded_by_teacher
     FROM class_roster cr
     JOIN class_groups cg ON cg.id = cr.class_id
     LEFT JOIN users u ON u.id = cr.user_id
     LEFT JOIN class_submissions sub ON sub.assignment_id = ? AND (sub.user_id = cr.user_id OR (u.student_no IS NOT NULL AND u.student_no = cr.student_no))
     LEFT JOIN (
       SELECT r1.*
       FROM class_reminders r1
       INNER JOIN (
         SELECT roster_id, MAX(id) AS max_id
         FROM class_reminders
         WHERE assignment_id = ?
         GROUP BY roster_id
       ) r2 ON r1.id = r2.max_id
     ) rem ON rem.roster_id = cr.id
     LEFT JOIN users u_teacher ON u_teacher.id = rem.teacher_id
     WHERE 1=1 ${classFilterSql}
     ORDER BY (sub.id IS NULL) DESC, cr.class_id ASC, cr.initial_rank ASC, cr.student_no ASC`,
    [assignmentId, assignmentId, ...classParams]
  );

  return rows.map((r) => ({
    rosterId: String(r.roster_id),
    studentNo: r.student_no,
    name: r.student_name,
    originProvince: r.origin_province || '',
    initialRank: r.initial_rank,
    gaokaoScore: r.gaokao_score,
    gaokaoMath: r.gaokao_math,
    userId: r.user_id ? String(r.user_id) : null,
    classId: String(r.class_id),
    className: r.class_name,
    submitted: Boolean(r.submission_id),
    submittedAt: toIsoString(r.submitted_at),
    score: r.score !== null && r.score !== undefined ? Number(r.score) : null,
    reminder: r.reminder_id ? {
      id: String(r.reminder_id),
      message: r.reminder_message,
      remindedAt: toIsoString(r.reminded_at),
      status: r.reminder_status,
      teacherName: r.reminded_by_teacher || '任课教师',
    } : null,
  }));
};

const createClassReminders = async ({ assignmentId, teacherId, classId, message, targets = [] }) => {
  if (!targets.length) return [];
  const createdReminders = [];
  for (const t of targets) {
    const [result] = await getPool().execute(
      `INSERT INTO class_reminders
        (assignment_id, teacher_id, roster_id, user_id, class_id, student_name, student_no, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        assignmentId,
        teacherId,
        t.rosterId,
        t.userId || null,
        classId || t.classId,
        t.name,
        t.studentNo,
        message,
      ]
    );
    createdReminders.push({
      id: String(result.insertId),
      rosterId: String(t.rosterId),
      name: t.name,
      studentNo: t.studentNo,
      message,
    });
  }
  return createdReminders;
};

const listActiveRemindersForUser = async (userId) => {
  const [rows] = await getPool().execute(
    `SELECT rem.*,
            ca.title AS assignment_title,
            ca.due_at AS assignment_due_at,
            ca.status AS assignment_status,
            cg.name AS class_name,
            u_teacher.nickname AS teacher_nickname
     FROM class_reminders rem
     JOIN class_assignments ca ON ca.id = rem.assignment_id
     JOIN class_groups cg ON cg.id = rem.class_id
     LEFT JOIN users u_teacher ON u_teacher.id = rem.teacher_id
     LEFT JOIN class_submissions cs ON cs.assignment_id = rem.assignment_id AND cs.user_id = ?
     WHERE (rem.user_id = ? OR rem.roster_id IN (SELECT id FROM class_roster WHERE user_id = ?))
       AND rem.status = 'pending'
       AND ca.status = 'open'
       AND cs.id IS NULL
     ORDER BY rem.created_at DESC`,
    [userId, userId, userId]
  );
  return rows.map((r) => ({
    id: String(r.id),
    assignmentId: String(r.assignment_id),
    assignmentTitle: r.assignment_title,
    dueAt: toIsoString(r.assignment_due_at),
    className: r.class_name,
    teacherName: r.teacher_nickname || '任课教师',
    message: r.message,
    createdAt: toIsoString(r.created_at),
  }));
};

const markRemindersSubmittedForUserAndAssignment = async (userId, assignmentId) => {
  await getPool().execute(
    `UPDATE class_reminders
     SET status = 'submitted', updated_at = UTC_TIMESTAMP()
     WHERE assignment_id = ?
       AND (user_id = ? OR roster_id IN (SELECT id FROM class_roster WHERE user_id = ?))
       AND status = 'pending'`,
    [assignmentId, userId, userId]
  );
};

module.exports = {
  assignTeacherToClass,
  claimRosterForUser,
  createAnnouncement,
  createAssignment,
  createClassGroup,
  createClassReminders,
  deleteAnnouncement,
  deleteAssignment,
  deleteClassGroup,
  findAnnouncementById,
  findAssignmentById,
  findClassGroupById,
  findClassGroupByName,
  findClassesForUser,
  findRosterByInviteCode,
  findSubmissionById,
  countClassRosterStudents,
  getClassStats,
  listActiveRemindersForUser,
  listAnnouncements,
  listAssignments,
  listClassGroups,
  listPendingStudentsForAssignment,
  listStudentsForClass,
  listSubmissions,
  listTeachersForClass,
  markRemindersSubmittedForUserAndAssignment,
  removeTeacherFromClass,
  renameClassGroup,
  updateAssignmentStatus,
  upsertSubmission,
};
