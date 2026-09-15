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

const publicSubmission = (row) => {
  if (!row) return null;
  return {
    id: String(row.id),
    assignmentId: String(row.assignment_id),
    assignmentTitle: row.assignment_title || '',
    userId: String(row.user_id),
    studentName: studentName(row),
    studentEmail: row.student_email || '',
    note: row.note || '',
    originalName: row.original_name,
    mimeType: row.mime_type || '',
    fileSize: Number(row.file_size || 0),
    storedPath: row.stored_path,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
};

const createAnnouncement = async ({ authorId, title, content }) => {
  const [result] = await getPool().execute(
    'INSERT INTO class_announcements (author_id, title, content) VALUES (?, ?, ?)',
    [authorId, title, content]
  );
  return findAnnouncementById(result.insertId);
};

const findAnnouncementById = async (id) => {
  const [rows] = await getPool().execute(
    `SELECT class_announcements.*, users.email AS author_email, users.nickname AS author_nickname
     FROM class_announcements
     LEFT JOIN users ON users.id = class_announcements.author_id
     WHERE class_announcements.id = ?
     LIMIT 1`,
    [id]
  );
  return publicAnnouncement(rows[0]);
};

const listAnnouncements = async ({ limit = 50 } = {}) => {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 100));
  const [rows] = await getPool().execute(
    `SELECT class_announcements.*, users.email AS author_email, users.nickname AS author_nickname
     FROM class_announcements
     LEFT JOIN users ON users.id = class_announcements.author_id
     ORDER BY class_announcements.created_at DESC, class_announcements.id DESC
     LIMIT ${safeLimit}`
  );
  return rows.map(publicAnnouncement);
};

const deleteAnnouncement = async (id) => {
  const [result] = await getPool().execute('DELETE FROM class_announcements WHERE id = ?', [id]);
  return result.affectedRows > 0;
};

const createAssignment = async ({ authorId, title, description, dueAt = null }) => {
  const [result] = await getPool().execute(
    'INSERT INTO class_assignments (author_id, title, description, due_at) VALUES (?, ?, ?, ?)',
    [authorId, title, description, dueAt]
  );
  return findAssignmentById(result.insertId);
};

const findAssignmentById = async (id, { expectedCount = 0 } = {}) => {
  const [rows] = await getPool().execute(
    `SELECT class_assignments.*, users.email AS author_email, users.nickname AS author_nickname,
            (
              SELECT COUNT(*) FROM class_submissions
              WHERE class_submissions.assignment_id = class_assignments.id
            ) AS submission_count
     FROM class_assignments
     LEFT JOIN users ON users.id = class_assignments.author_id
     WHERE class_assignments.id = ?
     LIMIT 1`,
    [id]
  );
  return publicAssignment(rows[0], { expectedCount });
};

const listAssignments = async ({ limit = 50, expectedCount = 0 } = {}) => {
  const safeLimit = Math.max(1, Math.min(Number(limit) || 50, 100));
  const [rows] = await getPool().execute(
    `SELECT class_assignments.*, users.email AS author_email, users.nickname AS author_nickname,
            (
              SELECT COUNT(*) FROM class_submissions
              WHERE class_submissions.assignment_id = class_assignments.id
            ) AS submission_count
     FROM class_assignments
     LEFT JOIN users ON users.id = class_assignments.author_id
     ORDER BY class_assignments.created_at DESC, class_assignments.id DESC
     LIMIT ${safeLimit}`
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

const findSubmissionByAssignmentAndUser = async ({ assignmentId, userId }) => {
  const [rows] = await getPool().execute(
    `SELECT class_submissions.*,
            users.email AS student_email,
            users.nickname AS student_nickname,
            class_assignments.title AS assignment_title
     FROM class_submissions
     LEFT JOIN users ON users.id = class_submissions.user_id
     LEFT JOIN class_assignments ON class_assignments.id = class_submissions.assignment_id
     WHERE class_submissions.assignment_id = ? AND class_submissions.user_id = ?
     LIMIT 1`,
    [assignmentId, userId]
  );
  return publicSubmission(rows[0]);
};

const findSubmissionById = async (id) => {
  const [rows] = await getPool().execute(
    `SELECT class_submissions.*,
            users.email AS student_email,
            users.nickname AS student_nickname,
            class_assignments.title AS assignment_title
     FROM class_submissions
     LEFT JOIN users ON users.id = class_submissions.user_id
     LEFT JOIN class_assignments ON class_assignments.id = class_submissions.assignment_id
     WHERE class_submissions.id = ?
     LIMIT 1`,
    [id]
  );
  return publicSubmission(rows[0]);
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

const listSubmissions = async ({ assignmentId = null, userId = null, limit = 100 } = {}) => {
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
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await getPool().execute(
    `SELECT class_submissions.*,
            users.email AS student_email,
            users.nickname AS student_nickname,
            class_assignments.title AS assignment_title
     FROM class_submissions
     LEFT JOIN users ON users.id = class_submissions.user_id
     LEFT JOIN class_assignments ON class_assignments.id = class_submissions.assignment_id
     ${whereSql}
     ORDER BY class_submissions.updated_at DESC, class_submissions.id DESC
     LIMIT ${safeLimit}`,
    params
  );
  return rows.map(publicSubmission);
};

const getClassStats = async () => {
  const [[announcementRow]] = await getPool().execute('SELECT COUNT(*) AS total FROM class_announcements');
  const [[assignmentRow]] = await getPool().execute("SELECT COUNT(*) AS total FROM class_assignments WHERE status = 'open'");
  return {
    announcementCount: Number(announcementRow.total || 0),
    openAssignmentCount: Number(assignmentRow.total || 0),
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
    `SELECT class_groups.id, class_groups.name
     FROM class_students
     INNER JOIN class_groups ON class_groups.id = class_students.class_id
     WHERE class_students.user_id = ?
     ORDER BY class_groups.created_at ASC, class_groups.id ASC`,
    [userId]
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

module.exports = {
  assignTeacherToClass,
  claimRosterForUser,
  createAnnouncement,
  createAssignment,
  createClassGroup,
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
  getClassStats,
  listAnnouncements,
  listAssignments,
  listClassGroups,
  listStudentsForClass,
  listSubmissions,
  listTeachersForClass,
  removeTeacherFromClass,
  renameClassGroup,
  updateAssignmentStatus,
  upsertSubmission,
};
